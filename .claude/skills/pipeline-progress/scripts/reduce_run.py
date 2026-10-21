#!/usr/bin/env python3
"""Reduce a run artifact to a bounded summary, so the raw file never enters a model context.

Binding rule: pipeline-conventions §19. No test-runner log, result set, dataset, migration log or
deploy log is read into the context - not with Read, not with cat/Get-Content, not with a grep that
returns bodies. This script reads it instead and prints counts, ids and one bounded excerpt per
distinct failure.

    python .claude/skills/pipeline-progress/scripts/reduce_run.py --kind test  out/pytest.log
    python .claude/skills/pipeline-progress/scripts/reduce_run.py --kind deploy out/migrate.log --max-clusters 10
    python .claude/skills/pipeline-progress/scripts/reduce_run.py --kind any   out/whatever.log --json

Three reasons this exists, and the third is not about cost:
  1. token cost becomes independent of data size - a 40k-line failing run costs what a 400-line one does;
  2. reproducibility - a scripted reduction gives the same answer twice, a model skimming a log does not;
  3. confidentiality - the later stages touch real data, and a production-shaped record pulled into a
     context is a disclosure.

Output is capped: at most --max-clusters clusters, each with at most --max-lines excerpt lines, each
line truncated to --width characters. The cap is the point; raising it past a screenful defeats it.

Stdlib only. Read-only: it never writes.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

# Patterns that mark a line as interesting, per kind. Deliberately generic: this script is tooling
# and names no project, framework or runner (conventions §21).
FAIL_PATTERNS = [
    re.compile(r"\b(FAIL(ED|URE)?|ERROR|Exception|Traceback|assert(ion)?\s+(failed|error)|"
               r"panic|fatal|refused|timed?\s*out|cannot|could not|unable to)\b", re.I),
]
PASS_PATTERNS = [re.compile(r"\b(PASS(ED)?|OK|SUCCESS|ok)\b")]
# Test-id shapes across common conventions, without naming a runner.
ID_PATTERNS = [
    re.compile(r"\b(CHK-[A-Z]{2,4}-\d{4}-\d{2})\b"),
    re.compile(r"\b(TEST-\d{4})\b"),
    re.compile(r"([\w/\\.]+\.\w+::[\w:\[\]-]+)"),
    re.compile(r"\b(test_[\w]+)\b"),
]
SUMMARY_TAIL = 20          # lines at the end of the file where a runner prints its totals
COUNT_PATTERNS = [
    re.compile(r"(\d+)\s+(passed|failed|skipped|errors?|warnings?)\b", re.I),
    re.compile(r"\b(passed|failed|skipped|errors?|warnings?)\s*[:=]\s*(\d+)", re.I),
]
# Anything that looks like it could carry a real record is masked before printing.
MASKS = [
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "<email>"),
    (re.compile(r"\b(?:\+?\d[\d ()-]{8,}\d)\b"), "<phone>"),
    (re.compile(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b"), "<national-id>"),
    (re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.I), "<uuid>"),
    (re.compile(r"(?i)\b(bearer|token|secret|password|api[_-]?key)\b\s*[:=]?\s*\S+"), r"\1 <redacted>"),
]


def mask(line: str) -> str:
    for pat, rep in MASKS:
        line = pat.sub(rep, line)
    return line


def normalize(line: str) -> str:
    """Collapse a line to its shape, so two failures differing only in values cluster together."""
    s = re.sub(r"\b[0-9a-f]{6,}\b", "<hex>", line, flags=re.I)
    s = re.sub(r"\d+", "<n>", s)
    s = re.sub(r"['\"][^'\"]{1,80}['\"]", "<str>", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s[:200]


def reduce_file(path: Path, kind: str, max_clusters: int, max_lines: int, width: int) -> dict:
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        return {"error": str(e)}
    lines = raw.splitlines()

    # The totals come from the run's own summary LINE, found by reading backwards. Scanning the file
    # as one blob reads "test_3999 PASSED" as "3999 passed"; even the tail window contains per-test
    # lines. A summary line is the one that carries SEVERAL counts at once, so prefer that, and fall
    # back to the last line carrying one.
    def counts_in(line: str) -> dict[str, int]:
        got: dict[str, int] = {}
        for pat in COUNT_PATTERNS:
            for m in pat.finditer(line):
                a, b = m.group(1), m.group(2)
                word, num = (b, a) if a.isdigit() else (a, b)
                if num.isdigit():
                    got[word.lower().rstrip("s")] = int(num)
        return got

    counts: Counter[str] = Counter()
    fallback: dict[str, int] = {}
    for line in reversed(lines[-SUMMARY_TAIL:] if len(lines) > SUMMARY_TAIL else lines):
        got = counts_in(line)
        if len(got) >= 2:
            counts.update(got)
            break
        if got and not fallback:
            fallback = got
    else:
        counts.update(fallback)

    fail_idx = [i for i, ln in enumerate(lines) if any(p.search(ln) for p in FAIL_PATTERNS)]
    n_pass = sum(1 for ln in lines if any(p.search(ln) for p in PASS_PATTERNS))

    # Ids from the failing line itself. Widening to a context window drags in every neighbouring
    # PASS, which is exactly the noise this script exists to remove.
    ids: set[str] = set()
    for i in fail_idx:
        for pat in ID_PATTERNS:
            ids.update(pat.findall(lines[i]))

    clusters: dict[str, dict] = {}
    for i in fail_idx:
        key = normalize(lines[i])
        c = clusters.setdefault(key, {"shape": key, "count": 0, "first_line": i + 1, "excerpt": []})
        c["count"] += 1
        if len(c["excerpt"]) < max_lines:
            c["excerpt"].append(mask(lines[i])[:width])

    ordered = sorted(clusters.values(), key=lambda c: -c["count"])[:max_clusters]
    return {
        "file": str(path),
        "kind": kind,
        "bytes": len(raw),
        "lines": len(lines),
        "reported_counts": dict(sorted(counts.items())),
        "failure_lines": len(fail_idx),
        "pass_lines": n_pass,
        "distinct_failures": len(clusters),
        "clusters_shown": len(ordered),
        "failing_ids": sorted(ids)[:60],
        "clusters": ordered,
    }


def render(r: dict) -> str:
    if "error" in r:
        return f"could not read: {r['error']}"
    out = [f"{r['file']}  ({r['lines']} lines, {r['bytes']} bytes) — kind: {r['kind']}", ""]
    if r["reported_counts"]:
        out.append("reported by the run: " + "  ".join(f"{k}={v}" for k, v in r["reported_counts"].items()))
    out.append(f"failure lines: {r['failure_lines']}   pass lines: {r['pass_lines']}   "
               f"distinct failures: {r['distinct_failures']} (showing {r['clusters_shown']})")
    if r["failing_ids"]:
        out += ["", "ids on a failing line:", "  " + ", ".join(r["failing_ids"])]
    out += ["", "clusters, most frequent first:"]
    for i, c in enumerate(r["clusters"], 1):
        out.append(f"  [{i}] x{c['count']}  first at line {c['first_line']}")
        for ln in c["excerpt"]:
            out.append(f"      {ln}")
    if not r["clusters"]:
        out.append("  none — no line matched a failure pattern")
    out += ["", "This summary is the evidence. Do not open the file itself (conventions §19)."]
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("path", help="the run artifact to reduce")
    ap.add_argument("--kind", default="any", choices=["test", "migration", "deploy", "any"])
    ap.add_argument("--max-clusters", type=int, default=12)
    ap.add_argument("--max-lines", type=int, default=3, help="excerpt lines per cluster")
    ap.add_argument("--width", type=int, default=200, help="characters per excerpt line")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    path = Path(a.path)
    if not path.is_file():
        print(f"no such file: {path}", file=sys.stderr)
        return 2
    r = reduce_file(path, a.kind, a.max_clusters, a.max_lines, a.width)
    print(json.dumps(r, ensure_ascii=False, indent=2) if a.json else render(r))

    # The run's own totals decide when it reported them: a summary line reading "0 failed" matches
    # the failure patterns, and a clean run must not exit 1 because of it.
    reported = r.get("reported_counts") or {}
    tallies = [v for k, v in reported.items() if k.startswith(("fail", "error"))]
    if tallies:
        return 1 if any(tallies) else 0
    return 1 if r.get("failure_lines") else 0


if __name__ == "__main__":
    sys.exit(main())
