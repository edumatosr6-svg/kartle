"""SessionEnd hook: drop every feature lock the ending session still holds."""
import subprocess
import sys

from _hookio import read_event, ROOT

ev = read_event()
sid = ev.get("session_id")
if sid:
    subprocess.run([sys.executable, str(ROOT / ".claude" / "hooks" / "feature_lock.py"),
                    "release", "--session", sid], check=False)
sys.exit(0)
