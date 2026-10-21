#!/usr/bin/env python3
"""Cross every feature against every stage and report where each one stands.

Read-only. Stdlib only. It writes nothing, and it never touches a seed.

    python .claude/skills/pipeline-progress/scripts/pipeline_progress.py
    python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --feature account-timeline --json
    python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --seed-line account-timeline

Stages, in order, are the numbered folders of the repository root. A feature's seed lives at
"200 Requirements/220 Input/<feature>/SEED.md"; each stage's artifacts live at "<stage>/Output/<feature>/".
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

# (key, output root). The roots are NOT uniform - `200 Requirements` numbers its sides and the
# others do not - so they are stated literally here and never derived by pattern (conventions §2).
STAGES: list[tuple[str, str]] = [
    ("req", "200 Requirements/230 Output"),
    ("fspec", "300 Specs/320 F-Specs/Output"),
    ("dspec", "300 Specs/330 D-Specs/Output"),
    ("code", "400 Code/Output"),
    ("test", "500 Tests/Output"),
    ("deploy", "600 Deploy/Output"),
]
STAGE_KEYS = [k for k, _ in STAGES]
SEED_ROOT = "200 Requirements/220 Input"
SEED_FILE = "SEED.md"

FM_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)
KV_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$")
REV_RE = re.compile(r"revision\s*:\s*(\d+)")
DIGEST_RE = re.compile(r"digest\s*:\s*([0-9a-f]{6,40})")
VERDICT_RE = re.compile(r"verdict\s*:\s*([A-Z][A-Z ]*)")

# Ordered worst-first: the stage of a feature is the first cell that is not `validated`.
ORDER = ["seed-missing", "seed-incomplete", "orphan-output", "not-started",
         "unvalidated", "FAIL", "gaps", "seed-changed", "seed-drift", "drifted", "validated"]


# --------------------------------------------------------------------------- helpers

def read_front_matter(path: Path) -> dict[str, str]:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return {}
    m = FM_RE.match(text)
    if not m:
        return {}
    out: dict[str, str] = {}
    for line in m.group(1).splitlines():
        kv = KV_RE.match(line.strip())
        if kv:
            out[kv.group(1)] = kv.group(2).strip()
    return out


def body_digest(path: Path) -> str:
    """sha1 of the body only, line endings normalised.

    Body-only so that stamping or correcting `date:`/`author:` never reads as an edit;
    normalised so a CRLF/LF checkout never does either.
    """
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""
    m = FM_RE.match(text)
    body = text[m.end():] if m else text
    body = body.replace("\r\n", "\n").replace("\r", "\n").strip()
    return hashlib.sha1(body.encode("utf-8")).hexdigest()[:12]


def seed_revision(path: Path) -> int:
    """An absent revision is revision 1 — that is the whole rule, on both sides."""
    fm = read_front_matter(path)
    try:
        return int(fm.get("revision", "1"))
    except ValueError:
        return 1


def newest_report(reports_dir: Path) -> Path | None:
    """The newest report by the instant it records, not by its file name.

    File names are UTC by convention (§2), but a run that named one in local time would sort
    wrongly and the loop would then read a stale verdict - reporting a validated feature as
    failing. `generated:` is inside the file and is always UTC, so it is the authority; the name
    is only the tie-break when it is missing or unparseable.
    """
    if not reports_dir.is_dir():
        return None
    files = sorted(reports_dir.glob("*.md"))
    if not files:
        return None

    def stamp(p: Path) -> tuple[str, str]:
        return (read_front_matter(p).get("generated", ""), p.name)

    return max(files, key=stamp)


def report_facts(path: Path | None) -> tuple[str | None, int, str | None]:
    """(verdict, seed revision judged, seed digest judged)."""
    if path is None:
        return None, 1, None
    text = path.read_text(encoding="utf-8", errors="replace")
    head = text[:2000]
    verdict = None
    mv = VERDICT_RE.search(head)
    if mv:
        verdict = mv.group(1).strip()
    rev = 1
    mr = REV_RE.search(head)
    if mr:
        rev = int(mr.group(1))
    dig = None
    md = DIGEST_RE.search(head)
    if md:
        dig = md.group(1)[:12]
    return verdict, rev, dig


# --------------------------------------------------------------------- required sets

REQUIRED: dict[str, list[str]] = {
    "req": ["00-index.md", "01-context.md", "02-glossary.md", "97-changelog.md", "99-traceability.md"],
    "fspec": ["00-index.md", "01-overview.md", "02-glossary.md", "97-changelog.md", "99-traceability.md"],
    "dspec": ["00-index.md", "01-architecture.md", "test-strategy.md", "97-changelog.md", "99-traceability.md"],
    "code": ["00-index.md", "97-changelog.md", "99-traceability.md"],
    "test": ["00-index.md", "97-changelog.md", "99-traceability.md"],
    "deploy": ["00-index.md", "01-release.md", "runbook.md", "smoke.md", "97-changelog.md"],
}
REQUIRED_DIRS: dict[str, list[str]] = {
    "req": ["stories"],
    "fspec": ["features"],
    "dspec": [],
    "code": [],
    "test": [],
    "deploy": [],
}


@dataclass
class StageState:
    key: str
    stage: str = "not-started"
    verdict: str | None = None
    validated_rev: int = 1
    validated_digest: str | None = None
    gaps: list[str] = field(default_factory=list)
    report: str | None = None
    pending_feedbacks: list[str] = field(default_factory=list)   # origin features, conventions §14


@dataclass
class FeatureState:
    feature: str
    seed_revision: int = 1
    seed_digest: str = ""
    seed_date: str = ""
    seed_author: str = ""
    seed_present: bool = False
    stages: dict[str, StageState] = field(default_factory=dict)
    stage: str = "seed-missing"
    next_action: str = ""


STAMP_RE = re.compile(r"(\d{8}-\d{4})")


def stamp_of(name: str) -> str:
    """The YYYYMMDD-HHmm stamp a pipeline filename carries, or '' when it carries none.
    Lexical order on this string is chronological order, which is why it is compared as text."""
    m = STAMP_RE.search(name)
    return m.group(1) if m else ""


def scan_stage(root: Path, feature: str, key: str, out_root: str,
               seed_rev: int, seed_dig: str) -> StageState:
    st = StageState(key=key)
    out = root / out_root / feature
    if not out.is_dir():
        st.stage = "not-started"
        return st

    reports = out / "reports" / f"{key}-validation"
    newest = newest_report(reports)
    st.report = str(newest.relative_to(root)) if newest else None
    verdict, rev, dig = report_facts(newest)
    st.verdict, st.validated_rev, st.validated_digest = verdict, rev, dig

    missing = [f for f in REQUIRED[key] if not (out / f).is_file()]
    missing += [d + "/" for d in REQUIRED_DIRS[key]
                if not (out / d).is_dir() or not any((out / d).glob("*.md"))]
    st.gaps = missing

    # Cross-feature feedbacks addressed to this feature at this stage (conventions §14).
    # Pending = stamped after the newest validation report; older ones are history.
    #
    # The comparison is on the YYYYMMDD-HHmm stamp in each FILENAME, never on mtime: a validator
    # rewriting its report, a git checkout, a copy or a sync all move mtime, and a feedback would
    # then silently flip between pending and history without anyone touching it.
    fb_root = out / "reports" / "feedbacks"
    if fb_root.is_dir():
        cutoff = stamp_of(newest.name) if newest else ""
        for origin_dir in sorted(p for p in fb_root.iterdir() if p.is_dir()):
            if any(stamp_of(f.name) > cutoff for f in origin_dir.glob("feedback-*.md")):
                st.pending_feedbacks.append(origin_dir.name)

    if newest is None:
        st.stage = "unvalidated"
        return st
    if verdict and verdict.startswith("FAIL"):
        st.stage = "FAIL"
        return st
    if missing:
        st.stage = "gaps"
        return st
    if seed_rev > rev:
        st.stage = "seed-changed"
        return st
    if dig and seed_dig and dig != seed_dig:
        st.stage = "seed-drift"
        return st
    drafts = [p.name for p in out.rglob("*.md")
              if read_front_matter(p).get("status") == "draft"]
    if drafts:
        st.stage = "drifted"
        return st
    st.stage = "validated"
    return st


NEXT = {
    "seed-missing": "author the seed with seed-authoring",
    "seed-incomplete": "the folder has no SKILL.md - author it, or say it is not a feature",
    "orphan-output": "artifacts with no seed behind them - ask; never delete either side",
    "not-started": "run {key}-loop {feature}",
    "unvalidated": "run {key}-loop {feature}",
    "FAIL": "run {key}-loop {feature} (resumes from the report)",
    "gaps": "run {key}-loop {feature} - it turns each gap into an issue",
    "seed-changed": "run {key}-loop {feature} - the artifacts answer an older seed revision",
    "seed-drift": "bump revision: in the seed, then run {key}-loop {feature}",
    "drifted": "run {key}-loop {feature} to re-validate what changed",
    "validated": "nothing",
}


def scan(root: Path, only: list[str]) -> list[FeatureState]:
    seed_root = root / SEED_ROOT
    features: set[str] = set()
    if seed_root.is_dir():
        features |= {p.name for p in seed_root.iterdir() if p.is_dir()}
    for _, out_root in STAGES:
        d = root / out_root
        if d.is_dir():
            features |= {p.name for p in d.iterdir() if p.is_dir()}
    if only:
        features &= set(only)

    results: list[FeatureState] = []
    for feature in sorted(features):
        s = FeatureState(feature=feature)
        seed = seed_root / feature / SEED_FILE
        seed_dir = seed_root / feature
        if seed.is_file():
            fm = read_front_matter(seed)
            s.seed_present = True
            s.seed_revision = seed_revision(seed)
            s.seed_digest = body_digest(seed)
            s.seed_date = fm.get("date", "")
            s.seed_author = fm.get("author", "")

        for key, out_root in STAGES:
            s.stages[key] = scan_stage(root, feature, key, out_root, s.seed_revision, s.seed_digest)

        has_output = any(st.stage != "not-started" for st in s.stages.values())
        if not s.seed_present:
            s.stage = "orphan-output" if has_output else ("seed-incomplete" if seed_dir.is_dir()
                                                          else "seed-missing")
            s.next_action = NEXT[s.stage]
        else:
            s.stage = "validated"
            s.next_action = "nothing"
            for key in STAGE_KEYS:
                st = s.stages[key]
                if st.stage != "validated":
                    s.stage = st.stage
                    s.next_action = NEXT[st.stage].format(key=key, feature=feature)
                    break
        results.append(s)

    return results


# ------------------------------------------------------------------------- rendering

CELL = {"not-started": ".", "unvalidated": "gen", "FAIL": "FAIL", "gaps": "gaps",
        "seed-changed": "seed!", "seed-drift": "drift", "drifted": "draft",
        "validated": "ok"}


def seed_cell(s: FeatureState) -> str:
    if not s.seed_present:
        return "-"
    for key in STAGE_KEYS:
        st = s.stages[key]
        if st.stage == "seed-changed":
            return f"r{s.seed_revision} (validated r{st.validated_rev})"
        if st.stage == "seed-drift":
            return f"r{s.seed_revision} edited"
    return f"r{s.seed_revision}"


def fb_cell(s: FeatureState) -> str:
    origins = sorted({o for st in s.stages.values() for o in st.pending_feedbacks})
    return ", ".join(origins) if origins else "-"


def render(results: list[FeatureState]) -> str:
    head = ["feature", *STAGE_KEYS, "seed", "feedback", "author / date", "stage", "next"]
    rows = [[s.feature, *[CELL[s.stages[k].stage] for k in STAGE_KEYS],
             seed_cell(s), fb_cell(s),
             f"{s.seed_author} {s.seed_date}".strip() or "-", s.stage, s.next_action]
            for s in results]
    widths = [max(len(str(r[i])) for r in ([head] + rows)) for i in range(len(head))]
    out = ["  ".join(h.ljust(w) for h, w in zip(head, widths)),
           "  ".join("-" * w for w in widths)]
    out += ["  ".join(str(c).ljust(w) for c, w in zip(r, widths)) for r in rows]

    counts: dict[str, int] = {}
    for s in results:
        counts[s.stage] = counts.get(s.stage, 0) + 1
    out.append("")
    out.append("  ".join(f"{k}={v}" for k, v in
                         sorted(counts.items(), key=lambda kv: ORDER.index(kv[0]))))
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--feature", action="append", default=[], help="limit to this feature; repeatable")
    ap.add_argument("--stage", choices=STAGE_KEYS, help="report only this stage's column detail")
    ap.add_argument("--root", default=".", help="repository root (default: cwd)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--seed-line", metavar="FEATURE",
                    help="print the seed: front-matter line for a validator to stamp its report")
    ap.add_argument("--fail-on", choices=["gaps", "unvalidated"],
                    help="exit 1 when any feature is at or below that stage")
    ap.add_argument("--count-artifacts", action="store_true",
                    help="with --stage and one --feature: print how many artifact .md files the set holds "
                         "(reports/ and the derived 00-index.md / 99-traceability.md excluded) - the "
                         "independent count a loop compares with the gate's")
    args = ap.parse_args()

    root = Path(args.root).resolve()

    if args.count_artifacts:
        if not args.stage or len(args.feature) != 1:
            ap.error("--count-artifacts needs --stage and exactly one --feature")
        out = root / dict(STAGES)[args.stage] / args.feature[0]
        n = 0
        if out.is_dir():
            for p in out.rglob("*.md"):
                rel = p.relative_to(out)
                if "reports" not in rel.parts and rel.as_posix() not in ("00-index.md", "99-traceability.md"):
                    n += 1
        print(n)
        return 0

    if args.seed_line:
        seed = root / SEED_ROOT / args.seed_line / SEED_FILE
        if not seed.is_file():
            print(f"no seed at {seed}", file=sys.stderr)
            return 1
        print(f"seed: {{revision: {seed_revision(seed)}, digest: {body_digest(seed)}}}")
        return 0

    results = scan(root, args.feature)
    if not results:
        print("no features found — nothing under '200 Requirements/220 Input/' and no stage output",
              file=sys.stderr)
        return 0

    if args.json:
        payload = []
        for s in results:
            item = {
                "feature": s.feature, "stage": s.stage, "next_action": s.next_action,
                "seed": {"present": s.seed_present, "revision": s.seed_revision,
                         "digest": s.seed_digest, "date": s.seed_date, "author": s.seed_author},
                "stages": {k: {"stage": v.stage, "verdict": v.verdict, "gaps": v.gaps,
                               "validated_revision": v.validated_rev, "report": v.report,
                               "pending_feedbacks": v.pending_feedbacks}
                           for k, v in s.stages.items()},
            }
            if args.stage:
                item["stages"] = {args.stage: item["stages"][args.stage]}
            payload.append(item)
        print(json.dumps(payload, indent=2))
    else:
        print(render(results))

    if args.fail_on:
        limit = ORDER.index("gaps" if args.fail_on == "gaps" else "unvalidated")
        if any(ORDER.index(s.stage) <= limit for s in results):
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
