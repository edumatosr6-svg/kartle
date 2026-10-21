"""Per-feature claim files under .claude/locks/ — one loop per feature per checkout.

  feature_lock.py acquire --feature F --skill K --session ID   exit 0 acquired/re-entered, 3 held elsewhere
  feature_lock.py release --feature F [--session ID]           exit 0 (idempotent)
  feature_lock.py release --session ID                         drop every lock the session holds
  feature_lock.py status [--feature F] [--json]                exit 0 free, 3 held (live), 4 stale
  feature_lock.py check --feature F --skill K --session ID     exit 0 may run, 3 may not (prints why)
  feature_lock.py touch --feature F                            refresh the claim of a long run

A lock is live for STALE_HOURS after its last touch; a stale lock is reported, not honoured.
Two loops on one feature interleave whole files; the claim exists so that parallel workflows,
one per feature, cannot land on the same folder. colab-loop works on the whole consolidated set and
claims the reserved name `_colab`.
"""
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK_DIR = ROOT / ".claude" / "locks"
STALE_HOURS = 6.0
LOOPS = ("colab-loop", "req-loop", "fspec-loop", "dspec-loop", "code-loop", "test-loop", "deploy-loop", "diag-loop")
# Loops that write the one shared application tree: two in one checkout break each other's builds.
SHARED_CODE_LOOPS = ("code-loop",)


def _path(feature):
    return LOCK_DIR / f"{feature}.json"


def _read(p):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def _age_h(rec):
    return (time.time() - rec.get("touched", 0)) / 3600.0


def _all():
    LOCK_DIR.mkdir(parents=True, exist_ok=True)
    out = []
    for p in sorted(LOCK_DIR.glob("*.json")):
        rec = _read(p)
        if rec:
            rec["_path"] = str(p)
            rec["_stale"] = _age_h(rec) > STALE_HOURS
            out.append(rec)
    return out


def _checkout(cwd):
    """The git toplevel of the caller's cwd: a worktree is its own checkout for the shared-code rule."""
    try:
        p = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=cwd or None, capture_output=True,
                           text=True, timeout=10)
        top = p.stdout.strip()
        return Path(top).resolve().as_posix() if top else ROOT.as_posix()
    except (OSError, subprocess.TimeoutExpired):
        return ROOT.as_posix()


def _write(feature, skill, session, cwd):
    LOCK_DIR.mkdir(parents=True, exist_ok=True)
    now = time.time()
    rec = {"feature": feature, "skill": skill, "session": session, "started": now, "touched": now,
           "started_iso": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(now)),
           "checkout": _checkout(cwd)}
    _path(feature).write_text(json.dumps(rec, indent=1), encoding="utf-8")
    return rec


def check(feature, skill, session, cwd=None):
    """Return (ok, reason). The feature claim is global; the shared-code rule is per checkout."""
    rec = _read(_path(feature))
    if rec and not (_age_h(rec) > STALE_HOURS):
        if rec["session"] != session:
            return False, (f"{feature} is claimed by {rec['skill']} in session {rec['session']} since "
                           f"{rec['started_iso']} ({_path(feature)}). Two loops on one feature interleave "
                           f"whole files. Wait for its END, or if that session is gone: "
                           f"python .claude/hooks/feature_lock.py release --feature {feature}")
    if skill in SHARED_CODE_LOOPS:
        here = _checkout(cwd)
        others = [r for r in _all() if r["skill"] in SHARED_CODE_LOOPS and r["feature"] != feature
                  and not r["_stale"] and r.get("checkout") == here]
        if others:
            names = ", ".join(f"{r['feature']} (session {r['session']})" for r in others)
            return False, (f"another code-loop is live in this checkout: {names}. Implementation loops "
                           f"share one application tree and break each other's builds mid-edit; run "
                           f"one per checkout - start this one in its own worktree, or wait for the "
                           f"other's END row.")
    return True, "ok"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["acquire", "release", "status", "check", "touch"])
    ap.add_argument("--feature")
    ap.add_argument("--skill", default="req-loop")
    ap.add_argument("--session", default=os.environ.get("CLAUDE_SESSION_ID", "unknown"))
    ap.add_argument("--cwd", default=os.getcwd(), help="caller's directory; decides which checkout the claim is in")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass

    if a.cmd == "status":
        recs = [r for r in _all() if not a.feature or r["feature"] == a.feature]
        if a.json:
            print(json.dumps(recs, indent=1))
        else:
            for r in recs:
                print(f"{r['feature']:32} {r['skill']:12} session={r['session']} since {r['started_iso']}"
                      f"{'  STALE' if r['_stale'] else ''}")
            if not recs:
                print("no locks")
        live = [r for r in recs if not r["_stale"]]
        return 3 if live else (4 if recs else 0)

    if a.cmd == "release":
        if a.feature:
            p = _path(a.feature)
            if p.exists():
                p.unlink()
                print(f"released {a.feature}")
            return 0
        n = 0
        for r in _all():
            if r["session"] == a.session:
                Path(r["_path"]).unlink(missing_ok=True)
                n += 1
        print(f"released {n} lock(s) of session {a.session}")
        return 0

    if not a.feature:
        ap.error("--feature is required")

    if a.cmd == "check":
        ok, why = check(a.feature, a.skill, a.session, a.cwd)
        print(why)
        return 0 if ok else 3

    if a.cmd == "touch":
        rec = _read(_path(a.feature))
        if rec:
            rec["touched"] = time.time()
            _path(a.feature).write_text(json.dumps(rec, indent=1), encoding="utf-8")
        return 0

    ok, why = check(a.feature, a.skill, a.session, a.cwd)
    if not ok:
        print(why)
        return 3
    _write(a.feature, a.skill, a.session, a.cwd)
    print(f"acquired {a.feature} for {a.skill} (session {a.session})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
