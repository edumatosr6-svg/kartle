"""Shared plumbing for the hook scripts: stdin JSON, deny/allow replies, path normalisation."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass


def read_event():
    try:
        return json.loads(sys.stdin.read() or "{}")
    except ValueError:
        return {}


def deny(reason, event_name="PreToolUse"):
    """Block the tool call; the reason reaches Claude (stderr + exit 2 is the documented contract)."""
    print(json.dumps({"hookSpecificOutput": {"hookEventName": event_name,
                                             "permissionDecision": "deny",
                                             "permissionDecisionReason": reason}}))
    print(reason, file=sys.stderr)
    sys.exit(2)


def context(text, event_name="PreToolUse"):
    """Let the call through, attaching text to the model's context where the host supports it."""
    print(json.dumps({"hookSpecificOutput": {"hookEventName": event_name,
                                             "additionalContext": text}}))
    sys.exit(0)


def rel(p):
    """Repo-relative POSIX path, or the absolute POSIX path when outside the repo."""
    if not p:
        return ""
    try:
        q = Path(p)
        if not q.is_absolute():
            q = ROOT / q
        q = q.resolve()
        try:
            return q.relative_to(ROOT).as_posix()
        except ValueError:
            return q.as_posix()
    except OSError:
        return str(p).replace("\\", "/")


def outside_repo(p):
    return p.startswith("/") or (len(p) > 1 and p[1] == ":")


def _glob_re(pat):
    i, out = 0, ""
    while i < len(pat):
        if pat.startswith("**/", i):
            out += "(?:.*/)?"
            i += 3
        elif pat.startswith("**", i):
            out += ".*"
            i += 2
        elif pat[i] == "*":
            out += "[^/]*"
            i += 1
        elif pat[i] == "?":
            out += "[^/]"
            i += 1
        else:
            out += re.escape(pat[i])
            i += 1
    return re.compile(out)


def matches(path, patterns):
    """Glob match where `**` spans directories and a bare `*` stays inside one segment.
    A directory path matches a pattern that covers anything beneath it."""
    for pat in patterns:
        rx = _glob_re(pat)
        if rx.fullmatch(path) or rx.fullmatch(path + "/x") or rx.fullmatch(path + "/x/y"):
            return True
    return False


def tool_paths(event):
    """Every path a tool call touches, repo-relative."""
    ti = event.get("tool_input") or {}
    name = event.get("tool_name", "")
    out = []
    if name in ("Read", "Edit", "Write", "MultiEdit", "NotebookEdit"):
        out.append(rel(ti.get("file_path") or ti.get("notebook_path")))
    elif name in ("Grep", "Glob"):
        out.append(rel(ti.get("path") or "."))
    return [p for p in out if p]
