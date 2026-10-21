#!/usr/bin/env python3
"""colab_tools.py - the deterministic core of the Colaborative Requirements process.

Sub-commands (run from the repository root, or pass --root):

  inventory   List every author draft under "200 Requirements/240 Colaborative/<author>/<feature>/SEED.md"
              and, when a merged set exists, what changed since it was built (new / revised / removed).
  index       Render "241 Merged/00-index.md": front matter (round, status, verdict) plus the feature map,
              GENERATED from the merged seeds' `sources:` and the decisions register. Never hand-written.
  lint        The mechanical gate over the merged set. Prints one line per finding; exit 1 on any error.
  questions   Assemble "241 Merged/reports/questions/questions-round-<N>.md" from every OPEN-<nn> line in
              the merged seeds, grouped by the authors whose drafts the carrying seed came from.
  promote     Copy validated merged features into "200 Requirements/220 Input/<feature>/". The ONLY writer of
              220 Input in the whole pipeline; refuses unless --yes, and refuses open items unless
              --allow-open.

Stdlib only. Every path is quoted by the caller: the folder names contain spaces.

Front-matter contract this script reads and writes (machine-read; never translated):

  draft   SEED.md   name, revision, date, author, channels
  merged  SEED.md   name, revision, date, author, channels, status, round,
                    sources: one flow-style item per line, exactly
                      - {author: <a>, feature: <s>, revision: <n>}
  index   00-index  stage: colab, round, status, verdict, generated, authors
  decisions 01-decisions.md   "### DEC-<nn>" blocks with fields
                      - type: merge | split | rename | keep | decline
                      - sources: <author>/<feature>@<rev>; ...
                      - target: <feature>; ...   ("-" when declined)
                      - reason: <one line>
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

COLAB = Path("200 Requirements/240 Colaborative")
MERGED = COLAB / "241 Merged"
INPUT = Path("200 Requirements/220 Input")
CHANNELS = {"web", "mobile", "whatsapp", "API"}
FEATURE_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
OPEN_RE = re.compile(r"\bOPEN-\d{1,3}\b")
TBD_RE = re.compile(r"\bTBD\b")
SOURCE_RE = re.compile(r"^\s*-\s*\{\s*author:\s*([^,}]+?)\s*,\s*feature:\s*([^,}]+?)\s*,\s*revision:\s*(\d+)\s*\}\s*$")
DEC_HEAD_RE = re.compile(r"^###\s+(DEC-\d{2,3})\b")
FIELD_RE = re.compile(r"^\s*-\s*([a-z_]+):\s*(.*?)\s*$")

LABELS = {
    "en": {
        "index_title": "# Merged set — index",
        "map_title": "## Feature map",
        "map_head": "| Merged feature | Rev | Sources (author/feature@rev) | Decisions | Open |",
        "declined_title": "## Drafts not carried forward",
        "declined_head": "| Draft | Decision | Reason |",
        "none": "None.",
        "q_title": "# Questions to the collaborators — round {round}",
        "q_intro": ("Each row is a point the merged set cannot settle on its own. Answer it by revising your "
                    "own draft under `240 Colaborative/<author>/<feature>/SEED.md` and bumping its `revision:`; "
                    "the next round reads the revised draft. Nothing here is answered in this file."),
        "q_author": "## For {author}",
        "q_all": "## Every open point",
        "q_head": "| Merged feature | Id | Open point | Addressed to |",
        "q_empty": "No open point. The set can be promoted.",
        "p_title": "# Promotion — {stamp}",
        "p_head": "| Feature | Merged rev | Into | Open items | Mode |",
    },
    "pt-BR": {
        "index_title": "# Conjunto consolidado — índice",
        "map_title": "## Mapa de features",
        "map_head": "| Feature consolidada | Rev | Origens (autor/feature@rev) | Decisões | Em aberto |",
        "declined_title": "## Rascunhos não incorporados",
        "declined_head": "| Rascunho | Decisão | Motivo |",
        "none": "Nenhum.",
        "q_title": "# Perguntas aos colaboradores — rodada {round}",
        "q_intro": ("Cada linha é um ponto que o conjunto consolidado não resolve sozinho. Responda revisando o "
                    "seu próprio rascunho em `240 Colaborative/<autor>/<feature>/SEED.md` e subindo o `revision:`; "
                    "a próxima rodada lê o rascunho revisado. Nada aqui é respondido neste arquivo."),
        "q_author": "## Para {author}",
        "q_all": "## Todos os pontos em aberto",
        "q_head": "| Feature consolidada | Id | Ponto em aberto | Dirigido a |",
        "q_empty": "Nenhum ponto em aberto. O conjunto pode ser promovido.",
        "p_title": "# Promoção — {stamp}",
        "p_head": "| Feature | Rev consolidada | Para | Pontos em aberto | Modo |",
    },
}


# --------------------------------------------------------------------------- front matter

def split_front_matter(text: str) -> tuple[list[str], str]:
    """Return (front-matter lines without the fences, body). Empty list when there is none."""
    if not text.startswith("---"):
        return [], text
    parts = text.split("\n", 1)
    if len(parts) < 2:
        return [], text
    rest = parts[1]
    end = re.search(r"^---\s*$", rest, flags=re.M)
    if not end:
        return [], text
    return rest[: end.start()].splitlines(), rest[end.end():].lstrip("\n")


def parse_scalars(lines: list[str]) -> dict[str, str]:
    """Top-level `key: value` pairs only. Nested blocks are left to the dedicated parsers."""
    out: dict[str, str] = {}
    for ln in lines:
        m = re.match(r"^([A-Za-z_][\w-]*):\s*(.*?)\s*$", ln)
        if m:
            out[m.group(1)] = m.group(2)
    return out


def parse_sources(lines: list[str]) -> list[dict]:
    out, inside = [], False
    for ln in lines:
        if re.match(r"^sources:\s*$", ln):
            inside = True
            continue
        if inside:
            if not ln.startswith((" ", "\t", "-")):
                inside = False
                continue
            m = SOURCE_RE.match(ln)
            if m:
                out.append({"author": m.group(1), "feature": m.group(2), "revision": int(m.group(3))})
            elif ln.strip():
                out.append({"malformed": ln.strip()})
    return out


def parse_list(value: str) -> list[str]:
    value = value.strip()
    if value.startswith("[") and value.endswith("]"):
        value = value[1:-1]
    return [v.strip().strip("'\"") for v in value.split(",") if v.strip()]


def digest(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")


# --------------------------------------------------------------------------- model

@dataclass
class Draft:
    author: str
    feature: str
    path: Path
    revision: int
    digest: str
    fm: dict[str, str]
    problems: list[str] = field(default_factory=list)

    @property
    def key(self) -> str:
        return f"{self.author}/{self.feature}"


@dataclass
class Merged:
    feature: str
    path: Path
    fm: dict[str, str]
    sources: list[dict]
    body: str
    opens: list[tuple[str, str]]  # (id, line)


@dataclass
class Decision:
    id: str
    type: str
    sources: list[str]
    targets: list[str]
    reason: str


def is_author_dir(p: Path) -> bool:
    n = p.name
    return p.is_dir() and not n[:1].isdigit() and not n.startswith((".", "_"))


def load_drafts(root: Path) -> list[Draft]:
    drafts: list[Draft] = []
    colab = root / COLAB
    if not colab.is_dir():
        return drafts
    for author_dir in sorted(p for p in colab.iterdir() if is_author_dir(p)):
        for feature_dir in sorted(p for p in author_dir.iterdir() if p.is_dir()):
            seed = feature_dir / "SEED.md"
            if not seed.is_file():
                continue
            text = seed.read_text(encoding="utf-8")
            fm_lines, body = split_front_matter(text)
            fm = parse_scalars(fm_lines)
            problems = []
            if not fm_lines:
                problems.append("no front matter")
            for k in ("name", "author", "channels"):
                if k not in fm:
                    problems.append(f"front matter lacks `{k}`")
            if fm.get("name") and fm["name"] != feature_dir.name:
                problems.append(f"`name: {fm['name']}` differs from folder `{feature_dir.name}`")
            if fm.get("author") and fm["author"] != author_dir.name:
                problems.append(f"`author: {fm['author']}` differs from folder `{author_dir.name}`")
            if not FEATURE_RE.match(feature_dir.name):
                problems.append("feature name is not lowercase [a-z0-9_-]")
            bad = set(parse_list(fm.get("channels", ""))) - CHANNELS
            if bad:
                problems.append(f"unknown channels {sorted(bad)}")
            try:
                rev = int(fm.get("revision", "1"))
            except ValueError:
                rev, _ = 1, problems.append("`revision:` is not an integer")
            drafts.append(Draft(author_dir.name, feature_dir.name, seed, rev, digest(body), fm, problems))
    return drafts


def load_merged(root: Path) -> list[Merged]:
    out: list[Merged] = []
    m = root / MERGED
    if not m.is_dir():
        return out
    for feature_dir in sorted(p for p in m.iterdir() if p.is_dir() and not p.name.startswith((".", "_")) and p.name != "reports"):
        seed = feature_dir / "SEED.md"
        if not seed.is_file():
            continue
        text = seed.read_text(encoding="utf-8")
        fm_lines, body = split_front_matter(text)
        opens = []
        for ln in body.splitlines():
            for oid in OPEN_RE.findall(ln):
                opens.append((oid, ln.strip()))
        out.append(Merged(feature_dir.name, seed, parse_scalars(fm_lines), parse_sources(fm_lines), body, opens))
    return out


def load_decisions(root: Path) -> tuple[list[Decision], list[str]]:
    path = root / MERGED / "01-decisions.md"
    decisions, problems = [], []
    if not path.is_file():
        return decisions, problems
    cur: dict | None = None

    def close():
        if cur is None:
            return
        missing = [k for k in ("type", "sources", "target", "reason") if k not in cur["f"]]
        if missing:
            problems.append(f"{cur['id']}: missing field(s) {missing}")
        srcs = [s.strip() for s in cur["f"].get("sources", "").split(";") if s.strip()]
        tg = cur["f"].get("target", "-").strip()
        targets = [] if tg in ("-", "—", "") else [t.strip() for t in tg.split(";") if t.strip()]
        decisions.append(Decision(cur["id"], cur["f"].get("type", ""), srcs, targets, cur["f"].get("reason", "")))

    for ln in path.read_text(encoding="utf-8").splitlines():
        h = DEC_HEAD_RE.match(ln)
        if h:
            close()
            cur = {"id": h.group(1), "f": {}}
            continue
        if cur is not None:
            f = FIELD_RE.match(ln)
            if f:
                cur["f"][f.group(1)] = f.group(2)
    close()
    ids = [d.id for d in decisions]
    for dup in {i for i in ids if ids.count(i) > 1}:
        problems.append(f"{dup}: duplicated id")
    return decisions, problems


def read_index(root: Path) -> dict[str, str]:
    p = root / MERGED / "00-index.md"
    if not p.is_file():
        return {}
    fm_lines, _ = split_front_matter(p.read_text(encoding="utf-8"))
    return parse_scalars(fm_lines)


def src_key(s: dict) -> str:
    return f"{s['author']}/{s['feature']}"


# --------------------------------------------------------------------------- inventory

def cmd_inventory(root: Path, as_json: bool) -> int:
    drafts = load_drafts(root)
    merged = load_merged(root)
    decisions, _ = load_decisions(root)
    index = read_index(root)
    known: dict[str, int] = {}
    for m in merged:
        for s in m.sources:
            if "malformed" not in s:
                known[src_key(s)] = s["revision"]
    for d in decisions:
        if d.type == "decline":
            for s in d.sources:
                k, _, rev = s.partition("@")
                known.setdefault(k, int(rev) if rev.isdigit() else 0)
    rows = []
    for d in drafts:
        if d.key not in known:
            state = "new" if merged else "draft"
        elif d.revision > known[d.key]:
            state = "revised"
        else:
            state = "merged"
        rows.append({"author": d.author, "feature": d.feature, "revision": d.revision, "state": state,
                     "problems": d.problems, "path": str(d.path.relative_to(root))})
    removed = sorted(k for k in known if k not in {d.key for d in drafts})
    summary = {
        "authors": sorted({d.author for d in drafts}),
        "drafts": len(drafts),
        "merged_features": len(merged),
        "round": int(index.get("round", "0") or 0),
        "status": index.get("status", "absent"),
        "verdict": index.get("verdict", "-"),
        "new": sum(r["state"] == "new" for r in rows),
        "revised": sum(r["state"] == "revised" for r in rows),
        "removed": removed,
        "invalid": sum(bool(r["problems"]) for r in rows),
        "changed_since_merge": bool(merged) and any(r["state"] in ("new", "revised") for r in rows) or bool(removed),
        "rows": rows,
    }
    if as_json:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0
    print(f"authors: {', '.join(summary['authors']) or '-'}   drafts: {summary['drafts']}   "
          f"merged features: {summary['merged_features']}   round: {summary['round']}   status: {summary['status']}")
    print(f"new: {summary['new']}   revised: {summary['revised']}   removed: {len(removed)}   invalid: {summary['invalid']}")
    print()
    print("| author | feature | rev | state | problems |")
    print("|---|---|---|---|---|")
    for r in rows:
        print(f"| {r['author']} | {r['feature']} | {r['revision']} | {r['state']} | {'; '.join(r['problems']) or '-'} |")
    for k in removed:
        print(f"| {k.split('/')[0]} | {k.split('/')[1]} | - | removed | draft no longer exists |")
    return 0


# --------------------------------------------------------------------------- index

def render_index(root: Path, round_no: int, status: str, verdict: str, lang: str) -> str:
    L = LABELS[lang]
    merged = load_merged(root)
    decisions, _ = load_decisions(root)
    drafts = {d.key: d for d in load_drafts(root)}
    by_target: dict[str, list[str]] = {}
    for d in decisions:
        for t in d.targets:
            by_target.setdefault(t, []).append(d.id)
    authors = sorted({d.author for d in drafts.values()})
    lines = [
        "---", "stage: colab", f"round: {round_no}", f"status: {status}", f"verdict: {verdict}",
        f"generated: {utc_now()}", f"authors: [{', '.join(authors)}]", f"features: {len(merged)}", "---", "",
        L["index_title"], "", L["map_title"], "", L["map_head"], "|---|---|---|---|---|",
    ]
    for m in merged:
        srcs = "; ".join(f"{s['author']}/{s['feature']}@{s['revision']}" for s in m.sources if "malformed" not in s) or "-"
        decs = ", ".join(by_target.get(m.feature, [])) or "-"
        lines.append(f"| `{m.feature}` | {m.fm.get('revision', '1')} | {srcs} | {decs} | {len({o for o, _ in m.opens})} |")
    lines += ["", L["declined_title"], ""]
    declined = [(s, d) for d in decisions if d.type == "decline" for s in d.sources]
    if declined:
        lines += [L["declined_head"], "|---|---|---|"]
        for s, d in declined:
            lines.append(f"| {s} | {d.id} | {d.reason} |")
    else:
        lines.append(L["none"])
    return "\n".join(lines) + "\n"


def cmd_index(root: Path, round_no: int | None, status: str | None, verdict: str | None, lang: str) -> int:
    prev = read_index(root)
    r = round_no if round_no is not None else int(prev.get("round", "1") or 1)
    s = status or prev.get("status", "draft")
    v = verdict or prev.get("verdict", "-")
    (root / MERGED).mkdir(parents=True, exist_ok=True)
    out = root / MERGED / "00-index.md"
    out.write_text(render_index(root, r, s, v, lang), encoding="utf-8")
    print(f"wrote {out.relative_to(root)}  (round {r}, status {s}, verdict {v})")
    return 0


# --------------------------------------------------------------------------- lint

def cmd_lint(root: Path, strict: bool) -> int:
    findings: list[tuple[str, str]] = []  # (severity, text)

    def err(t): findings.append(("error", t))
    def warn(t): findings.append(("warning", t))

    drafts = load_drafts(root)
    dmap = {d.key: d for d in drafts}
    if not drafts:
        err("no draft found under 240 Colaborative/<author>/<feature>/SEED.md")
    for d in drafts:
        for p in d.problems:
            err(f"draft {d.key}: {p}")

    merged = load_merged(root)
    if not (root / MERGED).is_dir():
        err("241 Merged/ does not exist")
    if not merged:
        err("241 Merged/ holds no <feature>/SEED.md")
    decisions, dproblems = load_decisions(root)
    for p in dproblems:
        err(f"01-decisions.md: {p}")
    if not (root / MERGED / "01-decisions.md").is_file():
        err("01-decisions.md is missing")
    index = read_index(root)
    if not index:
        err("00-index.md is missing — run `colab_tools.py index`")
    elif index.get("stage") != "colab":
        err("00-index.md: `stage:` is not `colab`")

    covered: dict[str, list[str]] = {}
    features_seen: set[str] = set()
    for m in merged:
        fm = m.fm
        if m.feature in features_seen:
            err(f"{m.feature}: duplicated feature")
        features_seen.add(m.feature)
        if not FEATURE_RE.match(m.feature):
            err(f"{m.feature}: feature name is not lowercase [a-z0-9_-]")
        for k in ("name", "description", "revision", "date", "author", "channels", "status", "round"):
            if k not in fm:
                err(f"{m.feature}: front matter lacks `{k}`")
        if fm.get("name") and fm["name"] != m.feature:
            err(f"{m.feature}: `name: {fm['name']}` differs from folder")
        if fm.get("status") not in ("draft", "validated", None):
            err(f"{m.feature}: `status:` must be draft | validated")
        bad = set(parse_list(fm.get("channels", ""))) - CHANNELS
        if bad:
            err(f"{m.feature}: unknown channels {sorted(bad)}")
        if not m.sources:
            err(f"{m.feature}: no `sources:` — a merged seed must name the drafts it came from")
        for s in m.sources:
            if "malformed" in s:
                err(f"{m.feature}: malformed source line `{s['malformed']}` — expected `- {{author: a, feature: s, revision: n}}`")
                continue
            k = src_key(s)
            covered.setdefault(k, []).append(m.feature)
            if k not in dmap:
                err(f"{m.feature}: source {k} does not exist under 240 Colaborative")
            elif dmap[k].revision > s["revision"]:
                warn(f"{m.feature}: source {k} is at revision {dmap[k].revision}, merged from {s['revision']} — stale (Mode C)")
            elif dmap[k].revision < s["revision"]:
                err(f"{m.feature}: source {k} claims revision {s['revision']} but the draft is at {dmap[k].revision}")
        ids = [o for o, _ in m.opens]
        for oid in sorted({o for o in ids if ids.count(o) > 1}):
            # the same id may legitimately be referenced twice; flag only when defined twice as a bullet/heading
            defs = sum(1 for _, ln in m.opens if re.match(rf"^(\*\*|-|\d+\.|#+)?\s*\**{oid}\**\s*[:—-]", ln))
            if defs > 1:
                err(f"{m.feature}: {oid} defined {defs} times")
        if TBD_RE.search(m.body):
            err(f"{m.feature}: `TBD` marker present — make it an OPEN-<nn> or resolve it")
        if strict and not m.opens and "OPEN" in m.body:
            warn(f"{m.feature}: mentions OPEN without an OPEN-<nn> id")

    declined: dict[str, str] = {}
    for d in decisions:
        if d.type not in ("merge", "split", "rename", "keep", "decline"):
            err(f"{d.id}: unknown type `{d.type}`")
        for s in d.sources:
            k, _, _ = s.partition("@")
            if k not in dmap:
                err(f"{d.id}: source {k} does not exist under 240 Colaborative")
            if d.type == "decline":
                declined[k] = d.id
        for t in d.targets:
            if t not in features_seen:
                err(f"{d.id}: target `{t}` is not a merged feature")
        if not d.reason:
            err(f"{d.id}: empty reason")
    for k in sorted(dmap):
        in_cov, in_dec = k in covered, k in declined
        if not in_cov and not in_dec:
            err(f"draft {k}: not carried by any merged seed and not declined in 01-decisions.md")
        if in_cov and in_dec:
            err(f"draft {k}: both carried by {covered[k]} and declined by {declined[k]}")
    # a merged feature that unites or splits drafts must have a decision that names it
    targets_with_dec = {t for d in decisions for t in d.targets}
    for m in merged:
        srcs = [s for s in m.sources if "malformed" not in s]
        if len(srcs) != 1 or srcs[0]["feature"] != m.feature:
            if m.feature not in targets_with_dec:
                err(f"{m.feature}: merged from {len(srcs)} source(s) under a different name, but no DEC names it as target")
    for k, tg in covered.items():
        if len(tg) > 1 and not any(k.split("@")[0] in s for d in decisions if d.type == "split" for s in d.sources):
            err(f"draft {k}: carried by {tg} without a `split` decision")

    for sev, text in findings:
        print(f"{sev}: {text}")
    n_err = sum(1 for s, _ in findings if s == "error")
    n_warn = len(findings) - n_err
    print(f"\nlint: {n_err} error(s), {n_warn} warning(s) over {len(merged)} merged feature(s) and {len(drafts)} draft(s)")
    return 1 if n_err else 0


# --------------------------------------------------------------------------- questions

def cmd_questions(root: Path, round_no: int | None, lang: str) -> int:
    L = LABELS[lang]
    index = read_index(root)
    r = round_no if round_no is not None else int(index.get("round", "1") or 1)
    merged = load_merged(root)
    rows = []  # (feature, id, text, authors)
    for m in merged:
        authors = sorted({s["author"] for s in m.sources if "malformed" not in s})
        seen = set()
        for oid, ln in m.opens:
            if oid in seen:
                continue
            seen.add(oid)
            text = re.sub(r"^[-*\d.#\s]*\**" + oid + r"\**\s*[:—-]?\s*", "", ln).strip()
            rows.append((m.feature, oid, text or ln, authors))
    out_dir = root / MERGED / "reports" / "questions"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"questions-round-{r}.md"
    lines = ["---", "stage: colab", f"round: {r}", f"generated: {utc_now()}", f"open_items: {len(rows)}", "---", "",
             L["q_title"].format(round=r), "", L["q_intro"], ""]
    if not rows:
        lines.append(L["q_empty"])
    else:
        for author in sorted({a for *_, aa in rows for a in aa}):
            lines += [L["q_author"].format(author=author), "", L["q_head"], "|---|---|---|---|"]
            for feature, oid, text, aa in rows:
                if author in aa:
                    lines.append(f"| `{feature}` | {oid} | {text} | {', '.join(aa)} |")
            lines.append("")
        lines += [L["q_all"], "", L["q_head"], "|---|---|---|---|"]
        for feature, oid, text, aa in rows:
            lines.append(f"| `{feature}` | {oid} | {text} | {', '.join(aa)} |")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out.relative_to(root)}  ({len(rows)} open item(s))")
    return 0


# --------------------------------------------------------------------------- promote

def strip_keys(text: str, keys: set[str]) -> str:
    fm_lines, body = split_front_matter(text)
    if not fm_lines:
        return text
    kept = [ln for ln in fm_lines if not re.match(r"^(" + "|".join(map(re.escape, keys)) + r"):", ln)]
    return "---\n" + "\n".join(kept) + "\n---\n\n" + body


def cmd_promote(root: Path, features: list[str], all_: bool, yes: bool, allow_open: bool, update: bool, lang: str) -> int:
    L = LABELS[lang]
    index = read_index(root)
    merged = {m.feature: m for m in load_merged(root)}
    if not merged:
        print("nothing to promote: 241 Merged/ holds no seed", file=sys.stderr)
        return 2
    if index.get("status") != "validated":
        print(f"refused: 00-index.md status is `{index.get('status', 'absent')}`, not `validated` — run colab-loop to SUCCESS first",
              file=sys.stderr)
        return 2
    chosen = sorted(merged) if all_ else features
    if not chosen:
        print("refused: name --feature <s> (repeatable) or --all", file=sys.stderr)
        return 2
    plan, refusals = [], []
    for s in chosen:
        m = merged.get(s)
        if not m:
            refusals.append(f"{s}: not a merged feature")
            continue
        if m.fm.get("status") != "validated":
            refusals.append(f"{s}: merged seed status is `{m.fm.get('status')}`")
            continue
        n_open = len({o for o, _ in m.opens})
        if n_open and not allow_open:
            refusals.append(f"{s}: {n_open} OPEN item(s) — answer them, or pass --allow-open knowing req-loop will stop on them")
            continue
        dest = root / INPUT / s / "SEED.md"
        mode = "new"
        if dest.exists():
            if not update:
                refusals.append(f"{s}: already in 220 Input — pass --update to replace it")
                continue
            old = parse_scalars(split_front_matter(dest.read_text(encoding="utf-8"))[0])
            if int(m.fm.get("revision", "1")) <= int(old.get("revision", "1") or 1):
                refusals.append(f"{s}: merged revision {m.fm.get('revision')} is not above the Input revision {old.get('revision', '1')}")
                continue
            mode = "update"
        plan.append((s, m, n_open, mode))
    for r in refusals:
        print(f"refused: {r}", file=sys.stderr)
    if not plan:
        return 2
    print("plan:")
    for s, m, n_open, mode in plan:
        print(f"  {mode:6} {s}  (rev {m.fm.get('revision')}, {n_open} open)  -> {INPUT / s}")
    if not yes:
        print("\ndry run — nothing written. Re-run with --yes once a human has said the promotion happens.")
        return 3 if refusals else 0
    stamp_ = stamp()
    for s, m, n_open, mode in plan:
        src_dir = m.path.parent
        dst_dir = root / INPUT / s
        dst_dir.mkdir(parents=True, exist_ok=True)
        for f in sorted(src_dir.iterdir()):
            if f.is_file() and f.suffix.lower() in (".md", ".png", ".jpg", ".jpeg", ".xlsx", ".pdf"):
                if f.name == "SEED.md":
                    (dst_dir / f.name).write_text(strip_keys(f.read_text(encoding="utf-8"), {"status", "round"}), encoding="utf-8")
                else:
                    shutil.copy2(f, dst_dir / f.name)
    rep_dir = root / MERGED / "reports" / "promotions"
    rep_dir.mkdir(parents=True, exist_ok=True)
    rep = rep_dir / f"promotion-{stamp_}.md"
    lines = ["---", "stage: colab", f"round: {index.get('round', '?')}", f"generated: {utc_now()}",
             f"promoted: {len(plan)}", "---", "", L["p_title"].format(stamp=stamp_), "", L["p_head"], "|---|---|---|---|---|"]
    for s, m, n_open, mode in plan:
        lines.append(f"| `{s}` | {m.fm.get('revision')} | `{INPUT / s}` | {n_open} | {mode} |")
    rep.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\npromoted {len(plan)} feature(s); record: {rep.relative_to(root)}")
    return 3 if refusals else 0


# --------------------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default=".", help="repository root (default: cwd)")
    ap.add_argument("--lang", default="en", choices=sorted(LABELS), help="language of the headings this script writes")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("inventory"); p.add_argument("--json", action="store_true")
    p = sub.add_parser("index")
    p.add_argument("--round", type=int); p.add_argument("--status", choices=["draft", "validated"]); p.add_argument("--verdict")
    p = sub.add_parser("lint"); p.add_argument("--strict", action="store_true")
    p = sub.add_parser("questions"); p.add_argument("--round", type=int)
    p = sub.add_parser("promote")
    p.add_argument("--feature", action="append", default=[]); p.add_argument("--all", action="store_true")
    p.add_argument("--yes", action="store_true"); p.add_argument("--allow-open", action="store_true")
    p.add_argument("--update", action="store_true")

    a = ap.parse_args()
    root = Path(a.root).resolve()
    if a.cmd == "inventory":
        return cmd_inventory(root, a.json)
    if a.cmd == "index":
        return cmd_index(root, a.round, a.status, a.verdict, a.lang)
    if a.cmd == "lint":
        return cmd_lint(root, a.strict)
    if a.cmd == "questions":
        return cmd_questions(root, a.round, a.lang)
    if a.cmd == "promote":
        return cmd_promote(root, a.feature, a.all, a.yes, a.allow_open, a.update, a.lang)
    return 2


if __name__ == "__main__":
    sys.exit(main())
