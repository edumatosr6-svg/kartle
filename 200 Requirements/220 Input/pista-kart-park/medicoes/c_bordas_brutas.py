"""Edge check with raw (unsmoothed) per-vertex normals, as a naive mesh builder would do.
Usage: python -I rawedges.py <track.json>"""
import json, math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import referee as R
d = json.load(open(sys.argv[1], encoding="utf-8"))
T = R.Track(d)
n, P, W, s = T.n, T.P, T.W, T.s
for label, hd in (("raw bisector", [T.th[i - 1] + R.wrap(T.th[i] - T.th[i - 1]) / 2 for i in range(n)]),
                  ("h=2 regression", [T.reg_heading(i, 2)[1] for i in range(n)])):
    nl = [(-math.sin(t), math.cos(t)) for t in hd]
    for side, sg in (("left", 1), ("right", -1)):
        E = [(P[i][0] + sg * W[i] / 2 * nl[i][0], P[i][1] + sg * W[i] / 2 * nl[i][1]) for i in range(n)]
        cr = []
        back = []
        for i in range(n):
            # edge segment running backwards relative to centreline direction = local fold
            ex, ey = E[(i + 1) % n][0] - E[i][0], E[(i + 1) % n][1] - E[i][1]
            cx, cy = P[(i + 1) % n][0] - P[i][0], P[(i + 1) % n][1] - P[i][1]
            if ex * cx + ey * cy < 0:
                back.append(round(s[i], 1))
            for j in range(i + 2, min(i + 40, n)):
                if R.seg_cross(E[i], E[(i + 1) % n], E[j % n], E[(j + 1) % n]):
                    cr.append((round(s[i], 1), round(s[j % n], 1)))
        print(label, side, "local self-crossings:", cr[:10], "reversed edge segments:", back[:10])
