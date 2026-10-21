#!/usr/bin/env python3
"""Deterministic core of the Diagnosis loop.

Reduces a test run and the pipeline's traceability files to a small evidence base:

  failures.json   one typed record per failing / erroring / skipped check
  clusters.json   those records grouped by (check identity, failing clause)
  reqgraph.json   criterion -> requirement -> design item -> code symbol -> check

No model is involved and no log body is printed: only bounded summaries reach the caller.
That is what keeps the cost of a diagnosis independent of the size of the run.

Stdlib only. Read-only except for the evidence base it writes.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

STAGES = {
    "req": "200 Requirements",
    "fspec": "300 Specs/320 F-Specs",
    "dspec": "300 Specs/330 D-Specs",
    "code": "400 Code",
    "test": "500 Tests",
    "deploy": "600 Deploy",
}

ID_RE = re.compile(r"\b(AC-US-\d{4}-\d{2}|US-\d{4}|NFR-\d{4}|REQ-FEAT-\d{4}-\d{2}|"
                   r"FEAT-\d{4}|API-\d{4}|SCR-\d{4}|RULE-\d{4}|DES-\d{4}|DM-\d{4}|"
                   r"ADR-\d{4}|TEST-\d{4}|CHK-\w+-\d{2}|REL-\d{4})\b")

# The first line of an assertion message is the useful clause; the rest is context.
CLAUSE_RE = re.compile(r"^(?:E\s+)?(.{0,160})", re.MULTILINE)


@dataclass
class Failure:
    check: str
    file: str
    kind: str            # failed | error | skipped
    clause: str
    ids: list[str] = field(default_factory=list)
    cluster: str = ""


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _clause(text: str) -> str:
    """The shortest stable signature of why a check failed."""
    if not text:
        return ""
    for line in text.splitlines():
        line = line.strip()
        if line.startswith("E ") or line.startswith("assert") or "Error" in line:
            return re.sub(r"0x[0-9a-f]+|\b\d{4}-\d{2}-\d{2}\b|\b\d+\b", "#", line)[:160]
    first = text.strip().splitlines()[0] if text.strip() else ""
    return re.sub(r"0x[0-9a-f]+|\b\d+\b", "#", first)[:160]


def _cluster_id(check: str, clause: str) -> str:
    base = f"{check.split('::')[0]}|{clause}"
    return "CL-" + hashlib.sha1(base.encode("utf-8")).hexdigest()[:8]


def parse_junit(paths: list[Path]) -> list[Failure]:
    out: list[Failure] = []
    for path in paths:
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError as exc:
            print(f"  ! unreadable junit: {path.name} ({exc})", file=sys.stderr)
            continue
        for case in root.iter("testcase"):
            classname = case.get("classname", "")
            name = case.get("name", "")
            check = f"{classname}::{name}" if classname else name
            file_attr = case.get("file", classname.replace(".", "/"))
            for kind, tag in (("failed", "failure"), ("error", "error"), ("skipped", "skipped")):
                node = case.find(tag)
                if node is None:
                    continue
                text = (node.get("message") or "") + "\n" + (node.text or "")
                clause = _clause(text)
                out.append(Failure(
                    check=check,
                    file=file_attr,
                    kind=kind,
                    clause=clause,
                    ids=sorted(set(ID_RE.findall(text))),
                    cluster=_cluster_id(check, clause),
                ))
                break
    return out


def build_reqgraph(root: Path, feature: str) -> dict:
    """Link the traceability tables of every stage into one graph.

    Each stage's 99-traceability.md is markdown; the graph is built from the ids that
    co-occur on a line, which is enough to answer 'what is this failure about'.
    """
    edges: list[dict] = []
    seen_ids: set[str] = set()
    for key, folder in STAGES.items():
        trace = root / folder / "Output" / feature / "99-traceability.md"
        if not trace.is_file():
            continue
        for lineno, line in enumerate(trace.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
            ids = sorted(set(ID_RE.findall(line)))
            if len(ids) < 2:
                continue
            seen_ids.update(ids)
            edges.append({"stage": key, "line": lineno, "ids": ids,
                          "source": f"{folder}/Output/{feature}/99-traceability.md:{lineno}"})
    return {"feature": feature, "generated": _now(), "ids": sorted(seen_ids), "edges": edges}


def collect_criteria(root: Path, feature: str) -> list[str]:
    out: set[str] = set()
    stories = root / STAGES["req"] / "Output" / feature / "stories"
    if stories.is_dir():
        for md in sorted(stories.glob("US-*.md")):
            for line in md.read_text(encoding="utf-8", errors="replace").splitlines():
                out.update(m for m in ID_RE.findall(line) if m.startswith("AC-"))
    return sorted(out)


def verification_status(criteria: list[str], graph: dict, failures: list[Failure]) -> dict:
    """verified / failing / unverified, from the graph and the run."""
    traced: set[str] = set()
    for edge in graph["edges"]:
        if edge["stage"] == "test":
            traced.update(i for i in edge["ids"] if i.startswith("AC-"))
    hit: set[str] = set()
    for f in failures:
        if f.kind in ("failed", "error"):
            hit.update(i for i in f.ids if i.startswith("AC-"))
    skipped: set[str] = set()
    for f in failures:
        if f.kind == "skipped":
            skipped.update(i for i in f.ids if i.startswith("AC-"))
    return {
        "total": len(criteria),
        "failing": sorted(hit),
        "unverified": sorted(set(criteria) - traced),
        "covered_only_by_skip": sorted(skipped - hit),
        "verified": sorted(traced - hit - skipped),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--feature", required=True)
    ap.add_argument("--root", default=".", help="repository root (default: cwd)")
    ap.add_argument("--json", action="store_true", help="print the summary as JSON")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    feature = args.feature

    reports = root / STAGES["test"] / "Output" / feature / "reports"
    junits = sorted(reports.rglob("*.xml")) if reports.is_dir() else []
    if not junits:
        print(f"no JUnit XML under {reports} — run test-loop first", file=sys.stderr)
        return 1

    failures = parse_junit(junits)
    graph = build_reqgraph(root, feature)
    criteria = collect_criteria(root, feature)
    status = verification_status(criteria, graph, failures)

    clusters: dict[str, dict] = {}
    for f in failures:
        c = clusters.setdefault(f.cluster, {"id": f.cluster, "clause": f.clause,
                                            "kind": f.kind, "checks": [], "ids": set()})
        c["checks"].append(f.check)
        c["ids"].update(f.ids)
    for c in clusters.values():
        c["ids"] = sorted(c["ids"])
        c["occurrences"] = len(c["checks"])

    out_dir = root / STAGES["code"] / "Output" / feature / "reports" / "diagnosis" / "evidence"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "failures.json").write_text(
        json.dumps({"generated": _now(), "sources": [p.name for p in junits],
                    "failures": [asdict(f) for f in failures]}, indent=2), encoding="utf-8")
    (out_dir / "clusters.json").write_text(
        json.dumps({"generated": _now(), "clusters": list(clusters.values())}, indent=2), encoding="utf-8")
    (out_dir / "reqgraph.json").write_text(json.dumps(graph, indent=2), encoding="utf-8")

    summary = {
        "feature": feature,
        "generated": _now(),
        "junit_files": len(junits),
        "failures": sum(1 for f in failures if f.kind == "failed"),
        "errors": sum(1 for f in failures if f.kind == "error"),
        "skipped": sum(1 for f in failures if f.kind == "skipped"),
        "clusters": len(clusters),
        "graph_edges": len(graph["edges"]),
        "verification": {k: (v if isinstance(v, int) else len(v)) for k, v in status.items()},
        "evidence_base": str(out_dir),
    }

    if args.json:
        print(json.dumps({"summary": summary, "status": status}, indent=2))
        return 0

    print(f"feature: {feature}   junit files: {len(junits)}   graph edges: {len(graph['edges'])}")
    print(f"failures: {summary['failures']}  errors: {summary['errors']}  "
          f"skipped: {summary['skipped']}  ->  {len(clusters)} clusters")
    print()
    print("Requirement verification status")
    print(f"  criteria total          {status['total']}")
    print(f"  verified                {len(status['verified'])}")
    print(f"  failing                 {len(status['failing'])}")
    print(f"  unverified (no check)   {len(status['unverified'])}")
    print(f"  covered only by a skip  {len(status['covered_only_by_skip'])}")
    if status["unverified"]:
        print("  unverified: " + ", ".join(status["unverified"][:12])
              + (" ..." if len(status["unverified"]) > 12 else ""))
    print()
    for c in sorted(clusters.values(), key=lambda c: -c["occurrences"])[:15]:
        ids = ", ".join(c["ids"][:3]) or "-"
        print(f"  {c['id']}  x{c['occurrences']:<3} {c['kind']:<8} {ids:<28} {c['clause'][:70]}")
    print()
    print(f"evidence base: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
