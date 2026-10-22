"""Marker-spacing and sector-limit detail for Kart Park.
Usage: python -I markers.py <kart-park.json> <referee_dir> <seedfacts out.json>"""
import json, math, sys

path, refdir, prev = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, refdir)
import referee as R

d = json.load(open(path, encoding="utf-8"))
T = R.Track(d)
n, P, W, s, L = T.n, T.P, T.W, T.s, T.L
reg = [T.reg_heading(i, 6) for i in range(n)]
kap = [r[0] for r in reg]
NL = [(-math.sin(r[1]), math.cos(r[1])) for r in reg]
pv = json.load(open(prev))

# 1. candidate ranges and reach at chosen arcs
good = pv["goodCandidateArcs"]
ranges = []
for a, Rr, dc, cl, cr in good:
    if ranges and a - ranges[-1][1] <= 1.6:
        ranges[-1][1] = a
        ranges[-1][2] = min(ranges[-1][2], cl)
        ranges[-1][3] = min(ranges[-1][3], cr)
    else:
        ranges.append([a, a, cl, cr])
print("candidate ranges (R>=25 m, >=3 m from a corner, >=3 m grass beyond both edges):")
for r in ranges:
    print("  %6.1f - %6.1f  min clear L %.1f R %.1f" % tuple(r))


def idx(arc):
    return min(range(n), key=lambda i: abs(s[i] - arc))


print("reach at selected arcs (halfW, beyond-edge clearance to another section L/R, centre reach L/R, R):")
reach = {}
EXCL = 15.0


def cyc(a, b):
    x = abs(s[a] - s[b]); return min(x, L - x)


LE = [(P[i][0] + NL[i][0] * W[i] / 2, P[i][1] + NL[i][1] * W[i] / 2) for i in range(n)]
RE = [(P[i][0] - NL[i][0] * W[i] / 2, P[i][1] - NL[i][1] * W[i] / 2) for i in range(n)]


def ray(o, dv, segs, maxd=80):
    best = maxd
    for a, b in segs:
        ex, ey = b[0] - a[0], b[1] - a[1]
        den = dv[0] * ey - dv[1] * ex
        if abs(den) < 1e-12: continue
        wx, wy = a[0] - o[0], a[1] - o[1]
        t = (wx * ey - wy * ex) / den; u = (wx * dv[1] - wy * dv[0]) / den
        if 1e-9 < t < best and -1e-9 <= u <= 1 + 1e-9: best = t
    return best


def reach_at(i):
    se, sc = [], []
    for k in range(n):
        if cyc(i, k) <= EXCL or cyc(i, (k + 1) % n) <= EXCL: continue
        k1 = (k + 1) % n
        se += [(LE[k], LE[k1]), (RE[k], RE[k1])]; sc.append((P[k], P[k1]))
    l = NL[i]; r = (-l[0], -l[1])
    return (ray(P[i], l, se) - W[i] / 2, ray(P[i], r, se) - W[i] / 2, ray(P[i], l, sc), ray(P[i], r, sc))


for arc in (0.0, 4.0, 8.0, 201.6, 235.0, 240.0, 337.0, 340.0, 355.3, 420.0, 440.0, 525.0, 530.0, 650.0, 680.0):
    i = idx(arc)
    cl, cr, ccl, ccr = reach_at(i)
    print("  arc %6.1f  halfW %.2f  clear L %.1f R %.1f  centre L %.1f R %.1f  R %.0f" % (s[i], W[i] / 2, cl, cr, ccl, ccr, 1 / max(abs(kap[i]), 1e-9)))

# 2. uncovered skipped arc for shortcuts, markers = cross-track segments extending e beyond each edge
E = 3.0
clear = [reach_at(i)[:2] for i in range(n)]
mk = []
for k in range(n):
    el = max(0.0, min(E, clear[k][0] / 2)); er = max(0.0, min(E, clear[k][1] / 2))
    a = (P[k][0] + NL[k][0] * (W[k] / 2 + el), P[k][1] + NL[k][1] * (W[k] / 2 + el))
    b = (P[k][0] - NL[k][0] * (W[k] / 2 + er), P[k][1] - NL[k][1] * (W[k] / 2 + er))
    mk.append((a, b))


def crosses(p1, p2, q1, q2):
    return R.seg_cross(p1, p2, q1, q2)


rows = []
for i in range(n):
    for j in range(i + 1, n):
        ds = s[j] - s[i]
        dd = math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1])
        g = dd - (W[i] + W[j]) / 2
        if g <= 0 or ds < 2 * dd or ds - dd < 10 or g > 29:
            continue
        rows.append((g, ds, dd, i, j))
print("shortcut chords considered:", len(rows))
res = []
for g, ds, dd, i, j in rows:
    run = best = 0
    first_unc = None
    for k in range(i + 1, j):
        if crosses(P[i], P[j], mk[k][0], mk[k][1]):
            run = 0
        else:
            run += s[k] - s[k - 1] if k - 1 > i else 0
            best = max(best, run)
    res.append((best, g, ds, dd, s[i], s[j]))
for G in (1, 6, 10, 20, 26, 29):
    for gm in (10, 20):
        sel = [r for r in res if r[1] <= G and r[2] - r[3] >= gm]
        if not sel: continue
        m = min(sel, key=lambda r: r[0])
        print("  gap<=%-3s gain>=%s: min longest uncovered run %.1f m (skip %.1f m, %.1f->%.1f, gap %.1f)" % (G, gm, m[0], m[2], m[4], m[5], m[1]))
# also gains 5
sel = [r for r in res if r[2] - r[3] >= 10]
worst = sorted(sel)[:12]
print("12 shortest uncovered runs (gain>=10, gap<=29):")
for w in worst:
    print("   uncovered %.1f  gap %.1f  skip %.1f  centreDist %.1f  %.1f -> %.1f" % w)
