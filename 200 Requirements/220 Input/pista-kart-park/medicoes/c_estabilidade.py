"""Supplement to referee.py: stability of direction-split corners, straight corridors, apex kinks.
Usage: python -I stability.py <track.json>"""
import json, math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import referee as R

d = json.load(open(sys.argv[1], encoding="utf-8"))
T = R.Track(d)
n, P, s, L = T.n, T.P, T.s, T.L

# 1. direction-split corner counts vs scale and threshold
print("direction-split corner counts (rows h, cols min turn 10/15/20/25/30 deg)")
core = {}
for h in (3, 4, 5, 6, 7, 8, 10):
    kap = [T.reg_heading(i, h)[0] for i in range(n)]
    row = []
    for thr in (10, 15, 20, 25, 30):
        row.append(len(R.split_corners(T, kap, thr)))
    print(" h=%-4s" % h, row)
    core[h] = R.split_corners(T, kap, 20)
for h in (4, 6, 8):
    print(" h=%s >=20deg:" % h, [(c["dir"], c["startArcM"], c["endArcM"], c["turnDeg"]) for c in core[h]])

# 2. longest straight by corridor: longest cyclic stretch whose points all lie within +-tol of the chord
def longest_corridor(tol):
    best = (0, None, None)
    for i in range(n):
        j = i + 2
        while j < i + n:
            a = P[i]; b = P[j % n]
            ok = True
            for k in range(i + 1, j):
                if R.pt_seg(P[k % n], a, b)[0] > tol:
                    ok = False
                    break
            if not ok:
                break
            j += 1
        j -= 1
        ln = (s[j % n] - s[i]) % L if j % n != i else 0
        if ln > best[0]:
            best = (round(ln, 1), round(s[i], 1), round(s[j % n], 1))
    return best
for tol in (0.2, 0.3, 0.5, 0.75):
    print("longest stretch within +-%.2f m of its chord:" % tol, longest_corridor(tol))

# 3. per-vertex turning near the two candidate minimum-radius apexes
for c in (78.4, 218.7, 620.2):
    i0 = min(range(n), key=lambda i: abs(s[i] - c))
    print("apex %.1f: per-vertex turn deg (i-6..i+6):" % c,
          [round(math.degrees(R.wrap(T.th[(i) % n] - T.th[(i - 1) % n])), 1) for i in range(i0 - 6, i0 + 7)])
