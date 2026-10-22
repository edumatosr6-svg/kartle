"""Seed fact base for Kart Park: corner gaps, perpendicular reach, sector candidates, shortcuts.
Usage: python -I seedfacts.py <kart-park.json> <referee_dir> <out.json>"""
import json, math, sys, os, itertools

path, refdir, outp = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, refdir)
import referee as R

d = json.load(open(path, encoding="utf-8"))
T = R.Track(d)
n, P, W, s, L = T.n, T.P, T.W, T.s, T.L
H = 6  # half-window m (12 m window, as recommended by measurement C)
reg = [T.reg_heading(i, H) for i in range(n)]
kap = [r[0] for r in reg]
hd = [r[1] for r in reg]
NL = [(-math.sin(h), math.cos(h)) for h in hd]  # left normal, x east / y north
LE = [(P[i][0] + NL[i][0] * W[i] / 2, P[i][1] + NL[i][1] * W[i] / 2) for i in range(n)]
RE = [(P[i][0] - NL[i][0] * W[i] / 2, P[i][1] - NL[i][1] * W[i] / 2) for i in range(n)]
out = {}

corners = R.split_corners(T, kap, 20)
out["corners_h6_ge20"] = corners
# gaps between consecutive corners
gaps = []
for a, b in zip(corners, corners[1:] + [dict(corners[0], startArcM=corners[0]["startArcM"] + L)]):
    g0, g1 = a["endArcM"], b["startArcM"]
    idx = [i for i in range(n) if g0 <= s[i] <= g1 or g0 <= s[i] + L <= g1]
    if not idx:
        continue
    rmin = min(1 / max(abs(kap[i]), 1e-9) for i in idx)
    gaps.append({"fromArcM": g0, "toArcM": round(g1 % L if g1 > L else g1, 1), "lengthM": round(g1 - g0, 1),
                 "minRadiusInGapM": round(rmin, 1)})
out["gapsBetweenCorners"] = gaps


def ray_hit(o, dvec, poly_segs, maxd=60.0):
    """distance along ray o + t*dvec (t>0) to the first crossing with any segment in poly_segs"""
    best = maxd
    ox, oy = o
    dx, dy = dvec
    for (a, b) in poly_segs:
        ex, ey = b[0] - a[0], b[1] - a[1]
        den = dx * ey - dy * ex
        if abs(den) < 1e-12:
            continue
        wx, wy = a[0] - ox, a[1] - oy
        t = (wx * ey - wy * ex) / den
        u = (wx * dy - wy * dx) / den
        if 1e-9 < t < best and -1e-9 <= u <= 1 + 1e-9:
            best = t
    return best


def cyc(a, b):
    x = abs(s[a] - s[b])
    return min(x, L - x)


EXCL = 15.0
reach = []
for i in range(n):
    segs_c, segs_e = [], []
    for k in range(n):
        if cyc(i, k) <= EXCL or cyc(i, (k + 1) % n) <= EXCL:
            continue
        k1 = (k + 1) % n
        segs_c.append((P[k], P[k1]))
        segs_e.append((LE[k], LE[k1]))
        segs_e.append((RE[k], RE[k1]))
    o = P[i]
    l = NL[i]
    r = (-l[0], -l[1])
    reach.append({
        "arc": round(s[i], 1), "halfW": round(W[i] / 2, 2),
        "leftCentre": round(ray_hit(o, l, segs_c), 2), "rightCentre": round(ray_hit(o, r, segs_c), 2),
        "leftOtherEdge": round(ray_hit(o, l, segs_e), 2), "rightOtherEdge": round(ray_hit(o, r, segs_e), 2)})
out["reachSample"] = reach[::10]

# sector-limit candidates: points in corner gaps, >= 3 m from corner ends
cand = []
for i in range(n):
    si = s[i]
    inside_corner = False
    near = 1e9
    for c in corners:
        a, b = c["startArcM"], c["endArcM"]
        if b < a:
            b += L
        for x in (si, si + L, si - L):
            if a <= x <= b:
                inside_corner = True
            near = min(near, abs(x - a), abs(x - b))
    if inside_corner:
        continue
    rr = reach[i]
    clearL = rr["leftOtherEdge"] - rr["halfW"]
    clearR = rr["rightOtherEdge"] - rr["halfW"]
    cand.append({"i": i, "arc": round(si, 1), "R": round(1 / max(abs(kap[i]), 1e-9), 1),
                 "distToCornerM": round(near, 1), "halfW": rr["halfW"],
                 "clearBeyondEdgeLeftM": round(clearL, 2), "clearBeyondEdgeRightM": round(clearR, 2),
                 "leftCentre": rr["leftCentre"], "rightCentre": rr["rightCentre"]})
out["candidateCount"] = len(cand)


# best 3-limit sets: finish at 0/L, start at 0. sector lengths l1, l2-l1, l3-l2, L-l3.
def ok(c, mind=3.0, minclear=3.0):
    return c["distToCornerM"] >= mind and min(c["clearBeyondEdgeLeftM"], c["clearBeyondEdgeRightM"]) >= minclear and c["R"] >= 25


good = [c for c in cand if ok(c)]
out["goodCandidateArcs"] = [(c["arc"], c["R"], c["distToCornerM"], c["clearBeyondEdgeLeftM"], c["clearBeyondEdgeRightM"]) for c in good]
best = []
ga = [c["arc"] for c in good]
for a, b, cc in itertools.combinations(range(len(good)), 3):
    l1, l2, l3 = ga[a], ga[b], ga[cc]
    secs = [l1, l2 - l1, l3 - l2, L - l3]
    if min(secs) <= 0:
        continue
    best.append((round(max(secs) - min(secs), 1), [round(x, 1) for x in secs], (l1, l2, l3)))
best.sort()
out["bestSectorSets"] = best[:15]

# shortcuts: pairs i<j (lap arc from start line), crossing grass between non-adjacent parts
pairs = []
for i in range(n):
    for j in range(i + 1, n):
        ds = s[j] - s[i]
        dd = math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1])
        g = dd - (W[i] + W[j]) / 2
        if g <= 0 or ds < 2.0 * dd or ds - dd < 10:
            continue
        pairs.append((g, ds, dd, s[i], s[j]))
res = {}
for G in (1, 3.5, 6, 10, 15, 20, 26, 29):
    sel = [p for p in pairs if p[0] <= G]
    for gain_min in (10, 20, 40):
        sel2 = [p for p in sel if p[1] - p[2] >= gain_min]
        if sel2:
            m = min(sel2, key=lambda p: p[1])
            res["gap<=%s,gain>=%s" % (G, gain_min)] = {"minSkippedArcM": round(m[1], 1), "fromArcM": round(m[3], 1),
                                                        "toArcM": round(m[4], 1), "gapM": round(m[0], 2), "centreDistM": round(m[2], 2)}
out["shortcutMinSkip"] = res

# clusters: local minima of gap on the (i,j) grid among pairs with g <= 26
grid = {}
for p in pairs:
    if p[0] <= 26:
        i = round(p[3]); j = round(p[4])
        grid[(i, j)] = min(grid.get((i, j), 1e9), p[0])
mins = []
for (i, j), g in grid.items():
    if all(grid.get((i + a, j + b), 1e9) >= g for a in range(-8, 9) for b in range(-8, 9) if (a, b) != (0, 0)):
        mins.append((round(g, 2), i, j, j - i))
mins.sort()
out["shortcutLocalMinima"] = mins[:40]

# synthetic reference
syn = [(65 * math.cos(t) + 10 * math.cos(3 * t), 43 * math.sin(t) + 9 * math.sin(2 * t)) for t in [k / 240 * 2 * math.pi for k in range(240)]]
seg = [math.hypot(syn[(k + 1) % 240][0] - syn[k][0], syn[(k + 1) % 240][1] - syn[k][1]) for k in range(240)]


def circ(a, b, c):
    ax, ay = a; bx, by = b; cx, cy = c
    den = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    if abs(den) < 1e-12:
        return math.inf
    ab = math.hypot(ax - bx, ay - by); bc = math.hypot(bx - cx, by - cy); ca = math.hypot(cx - ax, cy - ay)
    return ab * bc * ca / abs(den) / 1.0 * 1.0 / 1.0 * 1.0 / 1.0 if False else (ab * bc * ca) / (2 * abs(den) / 2 * 2) * 1.0


rs = []
for k in range(240):
    a, b, c = syn[k - 1], syn[k], syn[(k + 1) % 240]
    ab = math.hypot(a[0] - b[0], a[1] - b[1]); bc = math.hypot(b[0] - c[0], b[1] - c[1]); ca = math.hypot(c[0] - a[0], c[1] - a[1])
    area2 = abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
    rs.append((ab * bc * ca / (2 * area2) if area2 > 1e-12 else math.inf, k))
Ssyn = sum(syn[k][0] * syn[(k + 1) % 240][1] - syn[(k + 1) % 240][0] * syn[k][1] for k in range(240))
out["synthetic"] = {"lengthM": round(sum(seg), 3), "minRadius3ptM": round(min(rs)[0], 2), "minRadiusIndex": min(rs)[1],
                    "segMin": round(min(seg), 3), "segMax": round(max(seg), 3), "windingSumXZ": round(Ssyn, 1)}

# conversion to game frame z = -y
Pz = [(x, -y) for (x, y) in P]
S = sum(Pz[k][0] * Pz[(k + 1) % n][1] - Pz[(k + 1) % n][0] * Pz[k][1] for k in range(n))
h0 = math.degrees(math.atan2(Pz[3][0] - Pz[0][0], Pz[3][1] - Pz[0][1]))
h01 = math.degrees(math.atan2(Pz[1][0] - Pz[0][0], Pz[1][1] - Pz[0][1]))
xs = [p[0] for p in Pz]; zs = [p[1] for p in Pz]
out["gameFrame"] = {"windingSumXZ": round(S, 1), "direction": "CLOCKWISE" if S > 0 else "COUNTER_CLOCKWISE",
                    "startHeadingDeg_P0P3": round(h0, 2), "startHeadingDeg_P0P1": round(h01, 2),
                    "xRange": [round(min(xs), 2), round(max(xs), 2)], "zRange": [round(min(zs), 2), round(max(zs), 2)]}
# left side check at start: game left = (cos h, -sin h); geographic left of travel from file normal
h = math.radians(h0)
gl = (math.cos(h), -math.sin(h))
fl = (NL[0][0], -NL[0][1])
out["gameFrame"]["leftNormalAgreement"] = round(gl[0] * fl[0] + gl[1] * fl[1], 3)

json.dump(out, open(outp, "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("reachSample", "goodCandidateArcs")}, indent=0)[:9000])
