"""PreToolUse(Bash|PowerShell): refuse tree-wide staging and broad restores. Always on.

Collaborators edit "200 Requirements" (drafts under 240 Colaborative) while sessions run, and loop
workflows write their feature folders in parallel. A tree-wide `git add -A` or `git commit -a` sweeps
both into a commit under someone else's message; a broad `git restore`, `reset --hard`, `clean` or
`stash` destroys them. Stage and restore by explicit path. This guard does not wait for a lock: the
collaborators' concurrent edits are always in flight here.
"""
import json
import re
import shlex
import sys
import time

from _hookio import read_event, deny, ROOT

ev = read_event()
if ev.get("tool_name") not in ("Bash", "PowerShell"):
    sys.exit(0)
cmd = (ev.get("tool_input") or {}).get("command", "")
if "git" not in cmd:
    sys.exit(0)


def live_locks():
    out = []
    for p in (ROOT / ".claude" / "locks").glob("*.json"):
        try:
            r = json.loads(p.read_text(encoding="utf-8"))
            if (time.time() - r.get("touched", 0)) / 3600 <= 6:
                out.append(f"{r['feature']} ({r['skill']})")
        except (OSError, ValueError, KeyError):
            pass
    return out


def refuse(what):
    locks = live_locks()
    tail = f" Loops holding features right now: {', '.join(locks)}." if locks else ""
    deny(f"[git guard] {what} Collaborators edit 200 Requirements concurrently and loops write feature "
         f"folders in parallel; name the exact paths (git add \"<stage-output>/<feature>\").{tail}")


def tokens(segment):
    try:
        return shlex.split(segment.replace("\\", "/"))
    except ValueError:
        return segment.split()


def paths_after(argv, start):
    """Pathspecs after the subcommand: everything that is not a flag, `.` and `:/` count as none."""
    ps = [t for t in argv[start:] if not t.startswith("-")]
    return [p for p in ps if p not in (".", ":/", "*")]


for seg in re.split(r"&&|\|\||[;|\n]", cmd):
    argv = tokens(seg)
    if "git" not in argv:
        continue
    argv = argv[argv.index("git") + 1:]
    # skip global options such as -C <dir> or -c k=v
    while argv and argv[0].startswith("-"):
        argv = argv[2:] if argv[0] in ("-C", "-c") else argv[1:]
    if not argv:
        continue
    sub = argv[0]
    flags = {t for t in argv[1:] if t.startswith("-")}

    if sub == "add":
        broad = flags & {"-A", "--all", "-u", "--update"} or "." in argv[1:]
        if broad and not paths_after(argv, 1):
            refuse("tree-wide staging refused.")
    elif sub == "commit":
        if any(f == "--all" or (re.fullmatch(r"-[a-zA-Z]+", f) and "a" in f) for f in flags):
            refuse("`git commit -a` stages every modified file; refused.")
    elif sub in ("restore", "checkout"):
        if sub == "checkout" and "--" not in argv and "." not in argv:
            continue  # a branch switch, not a restore
        if sub == "restore" and "--staged" in flags and not flags & {"--worktree", "-W"}:
            continue  # unstaging touches the index only; no working-tree edit is lost
        if not paths_after(argv, 1):
            refuse(f"a broad `git {sub}` refused.")
    elif sub == "reset" and "--hard" in flags:
        refuse("`git reset --hard` refused.")
    elif sub == "clean":
        if not paths_after(argv, 1):
            refuse("a broad `git clean` refused.")
    elif sub == "stash":
        rest = argv[1:]
        if not rest or rest[0] in ("push", "save") or rest[0].startswith("-"):
            if "--" not in rest:
                refuse("a tree-wide `git stash` refused.")
sys.exit(0)
