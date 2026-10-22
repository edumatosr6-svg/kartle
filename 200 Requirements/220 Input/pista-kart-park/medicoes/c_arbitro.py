"""Method C: referee measurement for a kartle-pista v1 track (stdlib only, run with python -I).

Usage: python -I referee.py <track.json> <out.json>

What it does that A and B did not:
  * reproduces A's (raw circumcircle i-3,i,i+3) and B's (7-pt MA + +-2 chords) estimators
    so their numbers can be checked against the same data;
  * characterises the centreline noise (curvature spectrum, lateral residual);
  * measures curvature at several explicit scales with a local linear regression of the
    unwrapped 1 m chord heading against arc (slope = curvature over a window of 2h metres,
    i.e. the best constant-curvature fit), and reports how every corner/straight/radius
    fact depends on the scale;
  * builds the tarmac edges (centre +- w/2 along a smoothed normal) and measures the real
    edge-to-edge clearance between parts of the track that are far apart along the arc,
    plus edge folding at tight corners;
  * checks zebras against the measured length and against corner sides.
Declared values are only read to be printed next to the measured ones.
"""
import cmath
import json
import math
import sys

R_CORNER = 60.0
R_STRAIGHT = 150.0
MERGE_GAP = 5.0
SEP_ARC = 30.0
TAU = 2 * math.pi


def wrap(a):
    while a > math.pi:
        a -= TAU
    while a <= -math.pi:
        a += TAU
    return a


def pct(vals, q):
    v = sorted(vals)
    k = (len(v) - 1) * q
    f = int(math.floor(k))
    c = min(f + 1, len(v) - 1)
    if math.isinf(v[f]) or math.isinf(v[c]):
        return v[f] if k == f else v[c]
    return v[f] + (v[c] - v[f]) * (k - f)


def orient(a, b, c):
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])


def seg_cross(p1, p2, p3, p4):
    d1 = orient(p3, p4, p1)
    d2 = orient(p3, p4, p2)
    d3 = orient(p1, p2, p3)
    d4 = orient(p1, p2, p4)
    if d1 * d2 < 0 and d3 * d4 < 0:
        return True
    for dv, a, b, p in ((d1, p3, p4, p1), (d2, p3, p4, p2), (d3, p1, p2, p3), (d4, p1, p2, p4)):
        if abs(dv) < 1e-12 and min(a[0], b[0]) - 1e-12 <= p[0] <= max(a[0], b[0]) + 1e-12 \
                and min(a[1], b[1]) - 1e-12 <= p[1] <= max(a[1], b[1]) + 1e-12:
            return True
    return False


def pt_seg(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    l2 = dx * dx + dy * dy
    t = 0.0 if l2 == 0 else max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2))
    return math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy), t


def seg_seg(a, b, c, d):
    if seg_cross(a, b, c, d):
        return 0.0
    return min(pt_seg(a, c, d)[0], pt_seg(b, c, d)[0], pt_seg(c, a, b)[0], pt_seg(d, a, b)[0])


def cyc_runs(mask):
    n = len(mask)
    if all(mask):
        return [(0, n - 1)]
    if not any(mask):
        return []
    k = mask.index(False)
    runs, i = [], 0
    while i < n:
        idx = (k + i) % n
        if mask[idx]:
            j = i
            while j + 1 < n and mask[(k + j + 1) % n]:
                j += 1
            runs.append(((k + i) % n, (k + j) % n))
            i = j + 1
        else:
            i += 1
    return runs


class Track:
    def __init__(self, d):
        self.d = d
        self.P = [(float(p[0]), float(p[1])) for p in d["pontos"]]
        self.W = [float(p[2]) for p in d["pontos"]]
        n = self.n = len(self.P)
        P = self.P
        self.seg = [math.hypot(P[(i + 1) % n][0] - P[i][0], P[(i + 1) % n][1] - P[i][1]) for i in range(n)]
        self.s = [0.0] * n
        for i in range(1, n):
            self.s[i] = self.s[i - 1] + self.seg[i - 1]
        self.L = sum(self.seg)
        self.th = [math.atan2(P[(i + 1) % n][1] - P[i][1], P[(i + 1) % n][0] - P[i][0]) for i in range(n)]
        thu = [self.th[0]]
        for i in range(1, n):
            thu.append(thu[-1] + wrap(self.th[i] - self.th[i - 1]))
        self.thu = thu
        self.total_turn = thu[-1] - thu[0] + wrap(self.th[0] - self.th[n - 1])
        self.sm = [self.s[i] + self.seg[i] / 2.0 for i in range(n)]
        self.dsw = [(self.seg[i - 1] + self.seg[i]) / 2.0 for i in range(n)]

    def arc(self, i, j):
        a = self.s[j] - self.s[i]
        return a if a >= 0 else a + self.L

    def chord_ext(self, j):
        q, r = divmod(j, self.n)
        return self.sm[r] + q * self.L, self.thu[r] + q * self.total_turn

    def reg_heading(self, i, h):
        """Least-squares line theta(s) over chords whose midpoints are within +-h m of point i.
        Returns (kappa, heading_at_point)."""
        si = self.s[i]
        xs, ys = [], []
        j = i - 1
        while True:
            a, t = self.chord_ext(j)
            if si - a > h:
                break
            xs.append(a - si)
            ys.append(t)
            j -= 1
        j = i
        while True:
            a, t = self.chord_ext(j)
            if a - si > h:
                break
            xs.append(a - si)
            ys.append(t)
            j += 1
        m = len(xs)
        mx = sum(xs) / m
        my = sum(ys) / m
        sxx = sum((x - mx) ** 2 for x in xs)
        sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
        k = sxy / sxx
        return k, my - k * mx

    def kasa_radius(self, i, h):
        """Algebraic (Kasa) circle fit to raw points within +-h m of point i; signed by turn."""
        n = self.n
        idx = [i]
        j = i - 1
        while self.arc(j % n, i) <= h and len(idx) < n:
            idx.append(j % n)
            j -= 1
        j = i + 1
        while self.arc(i, j % n) <= h and len(idx) < n:
            idx.append(j % n)
            j += 1
        pts = [self.P[k] for k in idx]
        cx0 = sum(p[0] for p in pts) / len(pts)
        cy0 = sum(p[1] for p in pts) / len(pts)
        # solve [x y 1] [D E F]^T = -(x^2+y^2) in centred coords, normal equations 3x3
        A = [[0.0] * 3 for _ in range(3)]
        bvec = [0.0] * 3
        for (x, y) in pts:
            x -= cx0
            y -= cy0
            row = (x, y, 1.0)
            rhs = -(x * x + y * y)
            for r in range(3):
                bvec[r] += row[r] * rhs
                for c in range(3):
                    A[r][c] += row[r] * row[c]
        sol = solve3(A, bvec)
        if sol is None:
            return float("inf")
        D, E, F = sol
        rr = D * D / 4 + E * E / 4 - F
        if rr <= 0:
            return float("inf")
        return math.sqrt(rr)


def solve3(A, b):
    M = [A[r][:] + [b[r]] for r in range(3)]
    for c in range(3):
        p = max(range(c, 3), key=lambda r: abs(M[r][c]))
        if abs(M[p][c]) < 1e-12:
            return None
        M[c], M[p] = M[p], M[c]
        for r in range(3):
            if r != c:
                f = M[r][c] / M[c][c]
                for k in range(c, 4):
                    M[r][k] -= f * M[c][k]
    return [M[r][3] / M[r][r] for r in range(3)]


def circ_signed(a, b, c):
    ab = math.hypot(b[0] - a[0], b[1] - a[1])
    bc = math.hypot(c[0] - b[0], c[1] - b[1])
    ca = math.hypot(a[0] - c[0], a[1] - c[1])
    cr = orient(a, b, c)
    if abs(cr) < 1e-12:
        return float("inf")
    r = ab * bc * ca / (2 * abs(cr))
    return r if cr > 0 else -r


def corners_from_kappa(T, kap, merge_gap=MERGE_GAP, merge_by_samples=False):
    n = T.n
    runs = cyc_runs([abs(k) > 1.0 / R_CORNER for k in kap])
    runs.sort(key=lambda r: T.s[r[0]])
    merged = []
    gaps = []

    def close(prev_end, nxt_start):
        if merge_by_samples:
            between = (nxt_start - prev_end - 1) % n
            return between <= 4
        return T.arc(prev_end, nxt_start) < merge_gap

    for r in runs:
        if merged and close(merged[-1][1], r[0]):
            merged[-1] = (merged[-1][0], r[1])
            continue
        merged.append(r)
    if len(merged) > 1 and close(merged[-1][1], merged[0][0]):
        last = merged.pop()
        merged[0] = (last[0], merged[0][1])
    out = []
    for (a, b) in merged:
        idxs = []
        i = a
        while True:
            idxs.append(i)
            if i == b:
                break
            i = (i + 1) % n
        turn = sum(kap[k] * T.dsw[k] for k in idxs)
        rmin_k = max(idxs, key=lambda k: abs(kap[k]))
        # direction sub-runs
        subs, cur = [], None
        for k in idxs:
            sg = 1 if kap[k] > 0 else -1
            if cur is None or sg != cur[0]:
                cur = [sg, k, k, 0.0]
                subs.append(cur)
            cur[2] = k
            cur[3] += kap[k] * T.dsw[k]
        out.append({
            "startArcM": round(T.s[a], 1), "endArcM": round(T.s[b], 1),
            "lengthM": round(T.arc(a, b), 1),
            "minRadiusM": round(1.0 / abs(kap[rmin_k]), 2), "minRadiusAtArcM": round(T.s[rmin_k], 1),
            "direction": "left" if turn > 0 else "right",
            "turnDeg": round(abs(math.degrees(turn)), 1),
            "subRunsGe10deg": [("L" if sg > 0 else "R", round(T.s[x], 1), round(T.s[y], 1),
                                round(math.degrees(t), 1)) for sg, x, y, t in subs
                               if abs(math.degrees(t)) >= 10.0],
        })
    for k in range(len(out)):
        a = out[k]
        b = out[(k + 1) % len(out)]
        gaps.append(round((b["startArcM"] - a["endArcM"]) % T.L, 2))
    return out, gaps, len(runs)


def split_corners(T, kap, min_turn_deg=15.0):
    """Direction-consistent corners: |kappa|>1/60 runs split at sign changes, same-sign runs
    merged across < 5 m gaps that contain no opposite-sign corner points, kept if |turn| >= min."""
    n = T.n
    sm = [(1 if kap[i] > 0 else -1) if abs(kap[i]) > 1.0 / R_CORNER else 0 for i in range(n)]
    runs = []
    for sg in (1, -1):
        for (a, b) in cyc_runs([m == sg for m in sm]):
            runs.append((a, b, sg))
    runs.sort(key=lambda r: T.s[r[0]])
    merged = []
    for r in runs:
        if merged and merged[-1][2] == r[2] and T.arc(merged[-1][1], r[0]) < MERGE_GAP:
            k = (merged[-1][1] + 1) % n
            ok = True
            while k != r[0]:
                if sm[k] == -r[2]:
                    ok = False
                k = (k + 1) % n
            if ok:
                merged[-1] = (merged[-1][0], r[1], r[2])
                continue
        merged.append(r)
    if len(merged) > 1 and merged[-1][2] == merged[0][2] and T.arc(merged[-1][1], merged[0][0]) < MERGE_GAP:
        last = merged.pop()
        merged[0] = (last[0], merged[0][1], last[2])
    res = []
    for (a, b, sg) in merged:
        idxs = []
        i = a
        while True:
            idxs.append(i)
            if i == b:
                break
            i = (i + 1) % n
        turn = math.degrees(sum(kap[k] * T.dsw[k] for k in idxs))
        if abs(turn) >= min_turn_deg:
            km = max(idxs, key=lambda k: abs(kap[k]))
            res.append({"dir": "L" if sg > 0 else "R", "startArcM": round(T.s[a], 1),
                        "endArcM": round(T.s[b], 1), "turnDeg": round(turn, 1),
                        "minRadiusM": round(1 / abs(kap[km]), 1), "minAtArcM": round(T.s[km], 1)})
    return res


def straights(T, kap):
    runs = cyc_runs([abs(k) < 1.0 / R_STRAIGHT for k in kap])
    res = [(round(T.arc(a, b), 1), round(T.s[a], 1), round(T.s[b], 1)) for a, b in runs]
    res.sort(reverse=True)
    return res


def radius_stats(T, kap):
    R = [1.0 / abs(k) if k != 0 else float("inf") for k in kap]
    i = min(range(T.n), key=lambda k: R[k])
    return {"min": round(R[i], 2), "minAtArcM": round(T.s[i], 1), "p10": round(pct(R, 0.10), 2),
            "median": round(pct(R, 0.5), 2),
            "pointsRlt60": sum(1 for r in R if r < R_CORNER),
            "pointsRgt150": sum(1 for r in R if r > R_STRAIGHT)}


def sign_flips(kap):
    last, f = 0, 0
    for k in kap:
        if abs(k) > 1.0 / R_CORNER:
            sg = 1 if k > 0 else -1
            if last and sg != last:
                f += 1
            last = sg
    return f


def main(path, out_path):
    with open(path, encoding="utf-8") as fh:
        d = json.load(fh)
    T = Track(d)
    n, P, W, s, L = T.n, T.P, T.W, T.s, T.L
    out = {"file": path}

    # ---------------- basics ----------------
    out["pointCount"] = n
    out["lengthClosedM"] = round(L, 3)
    out["lengthOpenM"] = round(L - T.seg[-1], 3)
    out["closureGapM"] = round(T.seg[-1], 3)
    out["spacing"] = {"min": round(min(T.seg), 3), "max": round(max(T.seg), 3), "mean": round(L / n, 4)}
    out["totalTurnDeg"] = round(math.degrees(T.total_turn), 2)
    area = sum(P[i][0] * P[(i + 1) % n][1] - P[(i + 1) % n][0] * P[i][1] for i in range(n)) / 2
    out["shoelaceAreaM2"] = round(area, 1)
    out["winding"] = "anti-clockwise" if area > 0 else "clockwise"
    xs = [p[0] for p in P]
    ys = [p[1] for p in P]
    out["bboxM"] = {"dx": round(max(xs) - min(xs), 2), "dy": round(max(ys) - min(ys), 2)}
    brg = lambda a, b: math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])) % 360
    out["startBearing"] = {"p0p1": round(brg(P[0], P[1]), 2), "p0p3": round(brg(P[0], P[3]), 2),
                           "p0p5": round(brg(P[0], P[5]), 2)}
    out["width"] = {"min": min(W), "p10": round(pct(W, 0.1), 3), "median": round(pct(W, 0.5), 3),
                    "max": max(W), "mean": round(sum(W) / n, 4),
                    "arcWeightedMean": round(sum(W[i] * T.dsw[i] for i in range(n)) / L, 4),
                    "minAtArcM": round(s[W.index(min(W))], 1), "maxAtArcM": round(s[W.index(max(W))], 1)}
    # width spikes / steps / flat or linear stretches
    spikes = []
    for i in range(n):
        nb = sorted(W[(i + k) % n] for k in range(-5, 6) if k != 0)
        med = (nb[4] + nb[5]) / 2
        if abs(W[i] - med) > 1.0:
            spikes.append((round(s[i], 1), W[i], round(med, 2), round(W[i] - med, 2)))
    out["widthDevOver1mFromLocalMedian"] = spikes
    steps = [abs(W[(i + 1) % n] - W[i]) for i in range(n)]
    out["maxWidthStep"] = {"step": round(max(steps), 2), "atArcM": round(s[steps.index(max(steps))], 1)}
    flat, lin = [], []
    i = 0
    while i < n:
        j = i
        while j + 1 < n and W[j + 1] == W[i]:
            j += 1
        if j - i + 1 >= 4:
            flat.append((round(s[i], 1), j - i + 1, W[i]))
        i = j + 1
    i = 0
    while i < n - 2:
        j = i
        while j < n - 2 and abs(W[j + 2] - 2 * W[j + 1] + W[j]) <= 0.011:
            j += 1
        if j - i + 2 >= 6:
            lin.append((round(s[i], 1), j - i + 2))
        i = j + 1
    out["widthConstantRunsGe4pts"] = flat
    out["widthLinearRunsGe6pts"] = lin
    out["widthLinearRunsTotalPts"] = sum(x[1] for x in lin)

    # ---------------- self intersections & min centreline distance ----------------
    segs = [(P[i], P[(i + 1) % n]) for i in range(n)]
    crosses = 0
    best = (float("inf"), None, None)
    for i in range(n):
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue
            if seg_cross(*segs[i], *segs[j]):
                crosses += 1
            da = abs(T.sm[i] - T.sm[j])
            da = min(da, L - da)
            if da > SEP_ARC:
                if abs(P[i][0] - P[j][0]) > 25 or abs(P[i][1] - P[j][1]) > 25:
                    continue
                dd = seg_seg(*segs[i], *segs[j])
                if dd < best[0]:
                    best = (dd, i, j)
    out["selfIntersections"] = crosses
    dd, bi, bj = best
    out["minCentrelineDist"] = {"distM": round(dd, 3), "arcA": round(s[bi], 1), "arcB": round(s[bj], 1)}

    # ---------------- reproduce A and B ----------------
    kA = []
    for i in range(n):
        r = circ_signed(P[(i - 3) % n], P[i], P[(i + 3) % n])
        kA.append(0.0 if math.isinf(r) else 1.0 / r)
    SX = [sum(P[(i + k) % n][0] for k in range(-3, 4)) / 7 for i in range(n)]
    SY = [sum(P[(i + k) % n][1] for k in range(-3, 4)) / 7 for i in range(n)]
    kB = []
    for i in range(n):
        im, ip = (i - 2) % n, (i + 2) % n
        h1 = math.atan2(SY[i] - SY[im], SX[i] - SX[im])
        h2 = math.atan2(SY[ip] - SY[i], SX[ip] - SX[i])
        l1 = math.hypot(SY[i] - SY[im], SX[i] - SX[im])
        l2 = math.hypot(SY[ip] - SY[i], SX[ip] - SX[i])
        kB.append(wrap(h2 - h1) / ((l1 + l2) / 2))
    for name, kap in (("A_raw_circ_i3", kA), ("B_ma7_chord2", kB)):
        cs, gaps, nraw = corners_from_kappa(T, kap)
        out["reproduce_" + name] = {"radius": radius_stats(T, kap), "corners": len(cs),
                                   "rawRuns": nraw, "longestStraight": straights(T, kap)[:1],
                                   "signFlips": sign_flips(kap),
                                   "cornerStarts": [c["startArcM"] for c in cs]}

    # ---------------- noise characterisation ----------------
    # per-vertex turning (raw), spectrum by wavelength
    dth = [wrap(T.th[i] - T.th[i - 1]) for i in range(n)]
    mean_dth = sum(dth) / n
    x = [v - mean_dth for v in dth]
    spec = []
    tot = 0.0
    for k in range(1, n // 2 + 1):
        c = sum(x[j] * cmath.exp(-2j * math.pi * k * j / n) for j in range(n))
        pw = abs(c) ** 2
        tot += pw
        spec.append((L / k, pw))
    band = lambda lo, hi: sum(p for lam, p in spec if lo <= lam < hi) / tot
    out["curvatureSpectrum"] = {
        "fracVar_lambda_lt_6m": round(band(0, 6), 3),
        "fracVar_lambda_6_15m": round(band(6, 15), 3),
        "fracVar_lambda_15_30m": round(band(15, 30), 3),
        "fracVar_lambda_ge_30m": round(band(30, 1e9), 3),
    }
    # strongest wavelength in 5-20 m band
    sub = [(p, lam) for lam, p in spec if 5 <= lam < 20]
    sub.sort(reverse=True)
    out["curvatureSpectrum"]["top5_lambda_5_20m"] = [round(lam, 1) for p, lam in sub[:5]]
    # lateral residual of raw points from a local cubic (in arc) fitted over +-7 points (excluding i)
    res = []
    for i in range(n):
        ks = [k for k in range(-7, 8) if k != 0]
        a0 = P[(i - 7) % n]
        a1 = P[(i + 7) % n]
        ux, uy = a1[0] - a0[0], a1[1] - a0[1]
        ul = math.hypot(ux, uy)
        ux, uy = ux / ul, uy / ul
        # local frame: u along chord, v normal
        def loc(p):
            return ((p[0] - a0[0]) * ux + (p[1] - a0[1]) * uy, -(p[0] - a0[0]) * uy + (p[1] - a0[1]) * ux)
        pts = [loc(P[(i + k) % n]) for k in ks]
        # poly fit v = c0 + c1 u + c2 u^2 + c3 u^3 via normal equations (4x4)
        M = [[0.0] * 5 for _ in range(4)]
        for (u, v) in pts:
            pw = [1, u, u * u, u * u * u]
            for r in range(4):
                M[r][4] += pw[r] * v
                for c in range(4):
                    M[r][c] += pw[r] * pw[c]
        for c in range(4):
            pv = max(range(c, 4), key=lambda r: abs(M[r][c]))
            M[c], M[pv] = M[pv], M[c]
            for r in range(4):
                if r != c:
                    f = M[r][c] / M[c][c]
                    for k in range(c, 5):
                        M[r][k] -= f * M[c][k]
        coef = [M[r][4] / M[r][r] for r in range(4)]
        u0, v0 = loc(P[i])
        res.append(v0 - (coef[0] + coef[1] * u0 + coef[2] * u0 ** 2 + coef[3] * u0 ** 3))
    out["lateralResidualFromLocalCubicM"] = {"rms": round(math.sqrt(sum(r * r for r in res) / n), 3),
                                            "p95abs": round(pct([abs(r) for r in res], 0.95), 3),
                                            "max": round(max(abs(r) for r in res), 3)}

    # ---------------- multi-scale curvature (heading regression) ----------------
    scales = [1.5, 2, 3, 4, 5, 6, 7, 8, 10, 12]
    kreg = {}
    ms = []
    for h in scales:
        kap = [T.reg_heading(i, h)[0] for i in range(n)]
        kreg[h] = kap
        cs, gaps, nraw = corners_from_kappa(T, kap)
        cs_s, _, _ = corners_from_kappa(T, kap, merge_by_samples=True)
        sp = split_corners(T, kap, 15.0)
        st = straights(T, kap)
        ms.append({"halfWindowM": h, "radius": radius_stats(T, kap), "corners": len(cs),
                   "cornersMergeBySamples": len(cs_s), "rawRuns": nraw,
                   "cornersNetTurnGe10": sum(1 for c in cs if c["turnDeg"] >= 10),
                   "directionSplitCornersGe15deg": len(sp),
                   "signFlips": sign_flips(kap),
                   "longestStraight": st[0] if st else None,
                   "totalTurnDeg": round(math.degrees(sum(kap[i] * T.dsw[i] for i in range(n))), 2),
                   "borderlineGaps_4p5_5p5": [g for g in gaps if 4.5 <= g <= 5.5]})
    out["multiScale"] = ms

    # transfer of the regression window to a 10 m wobble, for reference
    def H(h, lam):
        xk = 2 * math.pi / lam * h
        return 3 * (math.sin(xk) - xk * math.cos(xk)) / xk ** 3
    out["regressionTransferAt"] = {str(h): {"lam8": round(H(h, 8), 3), "lam10": round(H(h, 10), 3),
                                            "lam12": round(H(h, 12), 3), "lam30": round(H(h, 30), 3),
                                            "lam60": round(H(h, 60), 3)} for h in scales}

    # chosen scale(s) detail
    for h in (4, 5, 6):
        kap = kreg[h]
        cs, gaps, nraw = corners_from_kappa(T, kap)
        out["detail_h%s" % h] = {"corners": cs, "gaps": gaps,
                                 "directionSplit": split_corners(T, kap, 15.0),
                                 "straightsTop5": straights(T, kap)[:5],
                                 "radius": radius_stats(T, kap)}

    # hairpin radii by Kasa circle fit at several half-windows around each local curvature peak (h=5)
    kap5 = kreg[5]
    peaks = []
    for i in range(n):
        if abs(kap5[i]) > 1 / 12.0 and abs(kap5[i]) >= max(abs(kap5[(i + k) % n]) for k in range(-6, 7)):
            peaks.append(i)
    hp = []
    for i in peaks:
        row = {"arcM": round(s[i], 1), "dir": "L" if kap5[i] > 0 else "R",
               "R_reg": {str(h): round(1 / abs(kreg[h][i]), 2) for h in (1.5, 2, 3, 4, 5, 6, 8)},
               "R_rawA": round(1 / abs(kA[i]), 2) if kA[i] else None,
               "R_B": round(1 / abs(kB[i]), 2) if kB[i] else None,
               "R_kasa": {str(h): round(T.kasa_radius(i, h), 2) for h in (3, 4, 5, 6, 8)},
               "width": W[i]}
        hp.append(row)
    out["curvaturePeaks_h5"] = hp

    # ---------------- tarmac edges ----------------
    head4 = [T.reg_heading(i, 4)[1] for i in range(n)]
    nl = [(-math.sin(t), math.cos(t)) for t in head4]
    LE = [(P[i][0] + W[i] / 2 * nl[i][0], P[i][1] + W[i] / 2 * nl[i][1]) for i in range(n)]
    RE = [(P[i][0] - W[i] / 2 * nl[i][0], P[i][1] - W[i] / 2 * nl[i][1]) for i in range(n)]

    def poly_self_cross(E):
        c = []
        for i in range(n):
            for j in range(i + 2, n):
                if i == 0 and j == n - 1:
                    continue
                if abs(E[i][0] - E[j][0]) > 4 or abs(E[i][1] - E[j][1]) > 4:
                    continue
                if seg_cross(E[i], E[(i + 1) % n], E[j], E[(j + 1) % n]):
                    c.append((round(s[i], 1), round(s[j], 1)))
        return c

    out["edgeSelfCrossings"] = {"left": poly_self_cross(LE), "right": poly_self_cross(RE)}
    # inner-edge margin: R_centre - w/2 on the inside, at h=4 and h=1.5
    for h in (1.5, 4):
        kap = kreg[h]
        m = min(range(n), key=lambda i: (1 / abs(kap[i]) if kap[i] else 1e9) - W[i] / 2)
        out["innerEdgeMargin_h%s" % h] = {"minR_minus_halfW": round(1 / abs(kap[m]) - W[m] / 2, 2),
                                          "atArcM": round(s[m], 1), "R": round(1 / abs(kap[m]), 2),
                                          "w": W[m]}
    # edge-to-edge clearance between parts > 30 m apart along the arc
    edges = []
    for E, side in ((LE, "L"), (RE, "R")):
        for i in range(n):
            edges.append((E[i], E[(i + 1) % n], i, side))
    clear = []
    overlaps = []
    for a in range(len(edges)):
        p1, p2, i, sa = edges[a]
        for b in range(a + 1, len(edges)):
            q1, q2, j, sb = edges[b]
            da = abs(T.sm[i] - T.sm[j])
            da = min(da, L - da)
            if da <= SEP_ARC:
                continue
            if abs(p1[0] - q1[0]) > 8 or abs(p1[1] - q1[1]) > 8:
                continue
            dist = seg_seg(p1, p2, q1, q2)
            if dist == 0.0:
                overlaps.append((round(s[i], 1), sa, round(s[j], 1), sb))
            clear.append((dist, round(s[i], 1), sa, round(s[j], 1), sb))
    clear.sort()
    regions = []
    for c in clear:
        if any(abs(c[1] - r[1]) < 12 and abs(c[3] - r[3]) < 12 or abs(c[1] - r[3]) < 12 and abs(c[3] - r[1]) < 12
               for r in regions):
            continue
        regions.append(c)
        if len(regions) >= 6:
            break
    out["edgeClearance"] = [{"gapM": round(c[0], 2), "arcA": c[1], "edgeA": c[2], "arcB": c[3], "edgeB": c[4]}
                            for c in regions]
    out["edgeOverlaps"] = overlaps[:20]
    # point-wise half-width estimate (as A/B did) for comparison, using interpolated width at the foot
    best_pw = (1e9, None)
    for i in range(n):
        for j in range(n):
            da = abs(T.sm[j] - s[i])
            da = min(da, L - da)
            if da <= SEP_ARC:
                continue
            if abs(P[i][0] - P[j][0]) > 15 or abs(P[i][1] - P[j][1]) > 15:
                continue
            dist, t = pt_seg(P[i], P[j], P[(j + 1) % n])
            wj = W[j] + t * (W[(j + 1) % n] - W[j])
            g = dist - W[i] / 2 - wj / 2
            if g < best_pw[0]:
                best_pw = (g, (round(s[i], 1), round(s[j] + t * T.seg[j], 1), round(dist, 2), W[i], round(wj, 2)))
    out["minHalfWidthGapPointToSeg"] = {"gapM": round(best_pw[0], 2), "arcA_arcB_centreDist_wA_wB": best_pw[1]}
    out["widthsAround"] = {str(a): [(round(s[i], 1), W[i]) for i in range(n) if abs(s[i] - a) <= 3]
                           for a in (369.5, 371.5, 386.5, 602.1, 615.1)}

    # ---------------- zebras ----------------
    zs = d.get("zebras", [])
    zr = []
    kap = kreg[5]
    for z in zs:
        a, b = float(z["de_m"]), float(z["ate_m"])
        idx = [i for i in range(n) if a <= s[i] <= b or (b > L and s[i] <= b - L)]
        net = sum(kap[i] * T.dsw[i] for i in idx)
        maxk = max((abs(kap[i]) for i in idx), default=0)
        side = 1 if z["lado"] == "esquerda" else -1
        pos = "none" if maxk < 1 / R_CORNER else ("inside" if (net > 0) == (side > 0) else "outside")
        zr.append((z["lado"], a, b, round(math.degrees(net), 1), round(1 / maxk, 1) if maxk else None, pos))
    out["zebras"] = {"count": len(zs), "totalM": round(sum(float(z["ate_m"]) - float(z["de_m"]) for z in zs), 2),
                     "beyondMeasuredLength": [(z["lado"], z["de_m"], z["ate_m"]) for z in zs if float(z["ate_m"]) > L],
                     "beyondDeclaredLength": [(z["lado"], z["de_m"], z["ate_m"]) for z in zs
                                              if float(z["ate_m"]) > float(d.get("comprimento_m", 1e9))],
                     "vsCurvature_h5": zr,
                     "positionCounts": {k: sum(1 for x in zr if x[5] == k) for k in ("inside", "outside", "none")}}

    # ---------------- declared ----------------
    out["declared"] = {k: d.get(k) for k in ("comprimento_m", "comprimento_oficial_m", "largura_media_m",
                                             "sentido", "largada", "qualidade", "recorde")}
    out["lengthVsOfficialPct"] = round((L - float(d["comprimento_oficial_m"])) / float(d["comprimento_oficial_m"]) * 100, 3)

    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
    print("written", out_path)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
