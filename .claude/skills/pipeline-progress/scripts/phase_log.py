#!/usr/bin/env python3
"""The phase log of a loop run (pipeline-conventions §9), written by a script so no model keeps a clock.

    python .claude/skills/pipeline-progress/scripts/phase_log.py stamp
    python .claude/skills/pipeline-progress/scripts/phase_log.py open --dir "<stage-output>/<feature>" --loop req-loop
    python .claude/skills/pipeline-progress/scripts/phase_log.py row "<log path>" 1-req-generator
    python .claude/skills/pipeline-progress/scripts/phase_log.py row "<log path>" END

`stamp` prints the UTC `YYYYMMDD-HHmm` every pipeline file name carries (§2).
`open` creates `<dir>/reports/token-usage/<loop>-phases-<stamp>.csv` with the header and the `setup`
row, and prints its path (forward slashes). `row` appends `<label>,<UTC ISO instant>`.

Every instant is UTC. Accounting never blocks a loop (§9): a failure to write prints a warning and
exits 0. Stdlib only.
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path


def now() -> datetime:
    return datetime.now(timezone.utc)


def iso(t: datetime) -> str:
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("stamp")
    p = sub.add_parser("open")
    p.add_argument("--dir", required=True, help="the feature's stage output folder (or 241 Merged)")
    p.add_argument("--loop", required=True)
    p = sub.add_parser("row")
    p.add_argument("log")
    p.add_argument("label")
    a = ap.parse_args()

    t = now()
    if a.cmd == "stamp":
        print(t.strftime("%Y%m%d-%H%M"))
        return 0
    try:
        if a.cmd == "open":
            d = Path(a.dir) / "reports" / "token-usage"
            d.mkdir(parents=True, exist_ok=True)
            log = d / f"{a.loop}-phases-{t.strftime('%Y%m%d-%H%M')}.csv"
            log.write_text(f"label,utc_start\nsetup,{iso(t)}\n", encoding="utf-8")
            print(log.as_posix())
            return 0
        log = Path(a.log)
        text = log.read_text(encoding="utf-8") if log.is_file() else "label,utc_start\n"
        if not text.endswith("\n"):
            text += "\n"
        log.write_text(f"{text}{a.label},{iso(t)}\n", encoding="utf-8")
        print(f"{a.label},{iso(t)}")
    except OSError as e:
        print(f"token usage unavailable: {e}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
