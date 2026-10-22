"""Independent geometry measurement of a kartle-pista v1 track (method B).

Usage: python -I measure_kartpark.py <path-to-track.json>

Stdlib only. Nothing declared in the file is trusted; declared values are only
read to be printed next to the measured ones.

Method:
  * closed polyline (last point joins the first), closure gap reported
  * curvature: centred 7-point moving average (wrapping), then at every point i
    heading change between chords S[i-2]->S[i] and S[i]->S[i+2] (~2 m each),
    kappa = dtheta / ds with ds = mean chord length, radius = 1/|kappa|
  * corners: contiguous runs radius < 60 m, merged when separated by < 5 m,
    turn = integral of kappa ds over the run
  * straights: contiguous runs radius > 150 m
  * self-intersections: brute force, proper crossings of non-adjacent segments
  * min distance between segments > 30 m apart along the arc
  * winding: sign of the shoelace area (x east, y north)
"""
import json
import math
import sys

R_CORNER = 60.0
R_STRAIGHT = 150.0
MERGE_GAP = 5.0
SEP_ARC = 30.0
MA_WIN = 7
CHORD_IDX = 2  # ~2 m chords at ~1 m spacing


def wrap_pi(a):
    while a > math.pi:
        a -= 2 * math.pi
    while a <= -math.pi:
        a += 2 * math.pi
    return a


def bearing_deg(dx, dy):
    b = math.degrees(math.atan2(dx, dy))
    return b % 360.0


def percentile(vals, p):
    v = sorted(vals)
    if not v:
        return float("nan")
    k = (len(v) - 1) * p / 100.0
    f = math.floor(k)
    c = min(f + 1, len(v) - 1)
    return v[f] + (v[c] - v[f]) * (k - f)


def median(vals):
    return percentile(vals, 50)


def orient(ax, ay, bx, by, cx, cy):
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)


def proper_cross(p1, p2, p3, p4):
    d1 = orient(*p3, *p4, *p1)
    d2 = orient(*p3, *p4, *p2)
    d3 = orient(*p1, *p2, *p3)
    d4 = orient(*p1, *p2, *p4)
    return (d1 * d2 < 0) and (d3 * d4 < 0)


def pt_seg_dist(p, a, b):
    ax, ay = a
    bx, by = b
    px, py = p
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    if L2 == 0:
        return math.hypot(px - ax, py - ay)
    t = ((px - ax) * dx + (py - ay) * dy) / L2
    t = max(0.0, min(1.0, t))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def seg_seg_dist(a, b, c, d):
    if proper_cross(a, b, c, d):
        return 0.0
    return min(pt_seg_dist(a, c, d), pt_seg_dist(b, c, d),
               pt_seg_dist(c, a, b), pt_seg_dist(d, a, b))


def circular_runs(mask):
    """Return list of (start_idx, length) of True runs on a circular boolean list."""
    n = len(mask)
    if all(mask):
        return [(0, n)]
    if not any(mask):
        return []
    # rotate so that we start right after a False
    first_false = mask.index(False)
    runs = []
    i = 0
    while i < n:
        idx = (first_false + i) % n
        if mask[idx]:
            start = idx
            length = 0
            while i < n and mask[(first_false + i) % n]:
                length += 1
                i += 1
            runs.append((start, length))
        else:
            i += 1
    return runs


def main(path):
    with open(path, encoding="utf-8") as fh:
        d = json.load(fh)
    pts = d["pontos"]
    n = len(pts)
    X = [float(p[0]) for p in pts]
    Y = [float(p[1]) for p in pts]
    W = [float(p[2]) for p in pts]
    P = list(zip(X, Y))

    anomalies = []
    out = {}

    # ---------- raw spacing / length ----------
    seg = [math.hypot(X[(i + 1) % n] - X[i], Y[(i + 1) % n] - Y[i]) for i in range(n)]
    closure = seg[n - 1]
    length_closed = sum(seg)
    length_open = sum(seg[:-1])
    s = [0.0] * n  # raw arc position of each point from the start line
    for i in range(1, n):
        s[i] = s[i - 1] + seg[i - 1]
    L = length_closed
    out["pointCount"] = n
    out["polylineLengthM"] = round(L, 2)
    out["polylineLengthOpenM"] = round(length_open, 2)
    out["closureGapM"] = round(closure, 3)
    out["spacing"] = {"min": round(min(seg), 3), "median": round(median(seg), 3),
                      "max": round(max(seg), 3)}

    dups = [i for i in range(n) if seg[i] < 0.05]
    if dups:
        anomalies.append("duplicated/near-duplicate consecutive points at indices %s" % dups[:20])
    big = [(i, round(seg[i], 2)) for i in range(n) if seg[i] > 2.0]
    if big:
        anomalies.append("spacing gaps > 2 m at (index, gap): %s" % big[:20])
    small = [(i, round(seg[i], 2)) for i in range(n) if 0.05 <= seg[i] < 0.5]
    if small:
        anomalies.append("spacing < 0.5 m at (index, gap): %s" % small[:20])

    # non-consecutive duplicates (same location revisited)
    nd = []
    for i in range(n):
        for j in range(i + 2, n):
            if (i == 0 and j == n - 1):
                continue
            if math.hypot(X[i] - X[j], Y[i] - Y[j]) < 0.05:
                nd.append((i, j))
    if nd:
        anomalies.append("non-consecutive duplicated points: %s" % nd[:20])

    # ---------- heading jumps on raw 1 m chords ----------
    hraw = [math.atan2(Y[(i + 1) % n] - Y[i], X[(i + 1) % n] - X[i]) for i in range(n)]
    jumps = []
    maxjump = (0.0, 0)
    for i in range(n):
        dj = abs(math.degrees(wrap_pi(hraw[(i + 1) % n] - hraw[i])))
        if dj > maxjump[0]:
            maxjump = (dj, (i + 1) % n)
        if dj > 30.0:
            jumps.append(((i + 1) % n, round(s[(i + 1) % n], 1), round(dj, 1)))
    if jumps:
        anomalies.append("heading jumps > 30 deg between consecutive 1 m chords at (index, arcM, deg): %s" % jumps)
    out["maxRawHeadingJumpDeg"] = round(maxjump[0], 2)
    out["maxRawHeadingJumpIdx"] = maxjump[1]
    out["maxRawHeadingJumpArcM"] = round(s[maxjump[1]], 1)

    # ---------- width ----------
    out["widthM"] = {"min": round(min(W), 2), "p10": round(percentile(W, 10), 2),
                     "median": round(median(W), 2), "max": round(max(W), 2),
                     "mean": round(sum(W) / n, 3)}
    out["widthMinAt"] = [(i, round(s[i], 1)) for i in range(n) if W[i] == min(W)][:5]
    out["widthMaxAt"] = [(i, round(s[i], 1)) for i in range(n) if W[i] == max(W)][:5]
    narrow = [(i, round(s[i], 1), W[i]) for i in range(n) if W[i] < 3.0]
    wide = [(i, round(s[i], 1), W[i]) for i in range(n) if W[i] > 15.0]
    if narrow:
        anomalies.append("widths < 3 m at (index, arcM, w): %s" % narrow[:20])
    if wide:
        anomalies.append("widths > 15 m at (index, arcM, w): %s" % wide[:20])
    # spikes: step between consecutive widths, and deviation from local median (+-5)
    wsteps = [(i, round(s[i], 1), round(W[(i + 1) % n] - W[i], 2)) for i in range(n)
              if abs(W[(i + 1) % n] - W[i]) > 1.0]
    out["maxWidthStepM"] = round(max(abs(W[(i + 1) % n] - W[i]) for i in range(n)), 3)
    spikes = []
    for i in range(n):
        nb = [W[(i + k) % n] for k in range(-5, 6) if k != 0]
        dev = W[i] - median(nb)
        if abs(dev) > 1.5:
            spikes.append((i, round(s[i], 1), W[i], round(dev, 2)))
    if wsteps:
        anomalies.append("width steps > 1 m between consecutive points (index, arcM, step): %s" % wsteps[:20])
    if spikes:
        anomalies.append("width spikes > 1.5 m vs local median (index, arcM, w, dev): %s" % spikes[:20])
    # stretches where width is exactly linear (possible interpolation where edges were not detected)
    lin = []
    i = 0
    while i < n - 2:
        j = i
        while j < n - 2 and abs(W[j + 2] - 2 * W[j + 1] + W[j]) < 0.011:
            j += 1
        if j - i >= 10:
            lin.append((round(s[i], 1), round(s[j + 1], 1)))
        i = j + 1
    out["linearWidthStretches_ge10pts"] = lin
    # large-scale width swings
    out["widthStats_by_100m"] = []
    for a in range(0, int(L) + 1, 100):
        ws = [W[i] for i in range(n) if a <= s[i] < a + 100]
        if ws:
            out["widthStats_by_100m"].append((a, round(min(ws), 2), round(median(ws), 2), round(max(ws), 2)))

    # ---------- winding ----------
    area2 = 0.0
    for i in range(n):
        j = (i + 1) % n
        area2 += X[i] * Y[j] - X[j] * Y[i]
    area = area2 / 2.0
    out["signedAreaM2"] = round(area, 1)
    out["windingFromPoints"] = "anti-clockwise" if area > 0 else "clockwise"

    # ---------- bbox ----------
    out["bboxM"] = {"dx": round(max(X) - min(X), 2), "dy": round(max(Y) - min(Y), 2)}

    # ---------- start heading ----------
    out["startHeadingDegMeasured"] = round(bearing_deg(X[3] - X[0], Y[3] - Y[0]), 2)
    out["startHeadingDeg_p0_p1"] = round(bearing_deg(X[1] - X[0], Y[1] - Y[0]), 2)

    # ---------- self intersections ----------
    def adjacent(i, j):
        return abs(i - j) <= 1 or abs(i - j) == n - 1

    crossings = []
    touches = 0
    for i in range(n):
        a, b = P[i], P[(i + 1) % n]
        for j in range(i + 1, n):
            if adjacent(i, j):
                continue
            c, dd = P[j], P[(j + 1) % n]
            if proper_cross(a, b, c, dd):
                crossings.append((i, j, round(s[i], 1), round(s[j], 1)))
    out["selfIntersections"] = len(crossings)
    out["crossings"] = crossings[:20]

    # ---------- min distance between segments > 30 m apart along arc ----------
    smid = [s[i] + seg[i] / 2.0 for i in range(n)]
    best = (float("inf"), None, None)
    for i in range(n):
        a, b = P[i], P[(i + 1) % n]
        for j in range(i + 1, n):
            da = abs(smid[i] - smid[j])
            da = min(da, L - da)
            # gap between the segments along the arc (nearest ends)
            gap = da - (seg[i] + seg[j]) / 2.0
            if gap <= SEP_ARC:
                continue
            dist = seg_seg_dist(a, b, P[j], P[(j + 1) % n])
            if dist < best[0]:
                best = (dist, i, j)
    out["minDistanceBetweenNonAdjacentSegmentsM"] = round(best[0], 3)
    bi, bj = best[1], best[2]
    da = abs(smid[bi] - smid[bj])
    out["minDistancePair"] = {"segA": bi, "arcA": round(s[bi], 1), "segB": bj,
                              "arcB": round(s[bj], 1), "arcSeparation": round(min(da, L - da), 1),
                              "widthA": W[bi], "widthB": W[bj]}
    # edge-to-edge clearance estimate at that pair (centre distance minus half widths)
    out["minDistancePair"]["edgeClearanceEstM"] = round(best[0] - (W[bi] + W[(bi + 1) % n]) / 4.0
                                                        - (W[bj] + W[(bj + 1) % n]) / 4.0, 2)
    # list the closest approaches per region (local minima, unique by 20 m buckets)
    close_list = []
    for i in range(n):
        a, b = P[i], P[(i + 1) % n]
        mind = (float("inf"), None)
        for j in range(n):
            if j == i:
                continue
            dA = abs(smid[i] - smid[j])
            dA = min(dA, L - dA)
            if dA - (seg[i] + seg[j]) / 2.0 <= SEP_ARC:
                continue
            dist = seg_seg_dist(a, b, P[j], P[(j + 1) % n])
            if dist < mind[0]:
                mind = (dist, j)
        close_list.append((mind[0], i, mind[1]))
    near = sorted([c for c in close_list if c[0] < 15.0])
    regions = []
    for dist, i, j in near:
        if any(abs(s[i] - r[1]) < 20 or abs(s[i] - r[2]) < 20 for r in regions):
            continue
        regions.append((round(dist, 2), round(s[i], 1), round(s[j], 1)))
    out["closeApproaches_lt15m"] = regions[:15]
    ca = []
    for dist, i, j in near:
        if any(abs(s[i] - r[1]) < 20 or abs(s[i] - r[2]) < 20 for r in ca):
            continue
        ca.append((round(dist, 2), round(s[i], 1), round(s[j], 1), W[i], W[j],
                   round(dist - W[i] / 2.0 - W[j] / 2.0, 2)))
    out["closeApproaches_dist_arcA_arcB_wA_wB_edgeClear"] = ca
    tight = [c_ for c_ in ca if c_[5] < 3.0]
    if tight:
        anomalies.append("track parts > 30 m apart along the arc run close side by side "
                         "(centre dist, arcA, arcB, wA, wB, est. edge-to-edge gap m): %s" % tight)

    # ---------- smoothing ----------
    h = MA_WIN // 2
    SX = [sum(X[(i + k) % n] for k in range(-h, h + 1)) / MA_WIN for i in range(n)]
    SY = [sum(Y[(i + k) % n] for k in range(-h, h + 1)) / MA_WIN for i in range(n)]
    sseg = [math.hypot(SX[(i + 1) % n] - SX[i], SY[(i + 1) % n] - SY[i]) for i in range(n)]
    out["smoothedLengthM"] = round(sum(sseg), 2)

    # ---------- curvature ----------
    c = CHORD_IDX
    kappa = [0.0] * n
    radius = [0.0] * n
    for i in range(n):
        im, ip = (i - c) % n, (i + c) % n
        h1 = math.atan2(SY[i] - SY[im], SX[i] - SX[im])
        h2 = math.atan2(SY[ip] - SY[i], SX[ip] - SX[i])
        l1 = math.hypot(SY[i] - SY[im], SX[i] - SX[im])
        l2 = math.hypot(SY[ip] - SY[i], SX[ip] - SX[i])
        dth = wrap_pi(h2 - h1)
        ds = (l1 + l2) / 2.0
        k = dth / ds if ds > 0 else 0.0
        kappa[i] = k
        radius[i] = 1.0 / abs(k) if k != 0 else float("inf")
    finite = [r for r in radius if math.isfinite(r)]
    rmin = min(radius)
    imin = radius.index(rmin)
    out["radiusM"] = {"min": round(rmin, 2), "minAtArcM": round(s[imin], 1), "minAtIdx": imin,
                      "p10": round(percentile(finite, 10), 2),
                      "median": round(median(finite), 2)}
    # total turning (should be +-360 for a simple loop)
    out["totalTurnDeg"] = round(math.degrees(sum(kappa[i] * (seg[i - 1] + seg[i]) / 2.0 for i in range(n))), 2)
    tt = 0.0
    for i in range(n):
        tt += wrap_pi(math.atan2(SY[(i + 2) % n] - SY[(i + 1) % n], SX[(i + 2) % n] - SX[(i + 1) % n])
                      - math.atan2(SY[(i + 1) % n] - SY[i], SX[(i + 1) % n] - SX[i]))
    out["totalTurnDeg_chordSum"] = round(math.degrees(tt), 2)

    # step weight for integrating kappa ds at each point (half the smoothed step on each side)
    dsw = [(sseg[i - 1] + sseg[i]) / 2.0 for i in range(n)]
    out["totalTurnDeg"] = round(math.degrees(sum(kappa[i] * dsw[i] for i in range(n))), 2)
    # trace noise: distance of raw points from the smoothed polyline points
    res = [math.hypot(X[i] - SX[i], Y[i] - SY[i]) for i in range(n)]
    out["rawVsSmoothedResidualM"] = {"rms": round(math.sqrt(sum(r * r for r in res) / n), 3),
                                     "max": round(max(res), 3)}
    # sign changes of curvature (left/right alternations) with |k| > 1/60 on both sides
    signflips = 0
    last = 0
    for i in range(n):
        if abs(kappa[i]) > 1.0 / R_CORNER:
            sg = 1 if kappa[i] > 0 else -1
            if last and sg != last:
                signflips += 1
            last = sg
    out["curvatureDirectionReversals"] = signflips

    # ---------- corners ----------
    mask = [r < R_CORNER for r in radius]
    runs = circular_runs(mask)
    # merge runs separated by < MERGE_GAP metres (circular)
    def run_arc_bounds(start, length):
        end = (start + length - 1) % n
        return start, end

    merged = []
    for st, ln in sorted(runs, key=lambda r: r[0]):
        if merged:
            pst, pln = merged[-1]
            pend = (pst + pln - 1) % n
            gap = (s[st] - s[pend]) % L
            if gap < MERGE_GAP:
                merged[-1] = (pst, (st - pst) % n + ln)
                continue
        merged.append((st, ln))
    # circular merge of last with first
    if len(merged) > 1:
        lst, lln = merged[-1]
        fst, fln = merged[0]
        lend = (lst + lln - 1) % n
        gap = (s[fst] - s[lend]) % L
        if gap < MERGE_GAP:
            merged[-1] = (lst, lln + (fst - lend - 1) % n + fln)
            merged.pop(0)
    corners = []
    for st, ln in merged:
        idxs = [(st + k) % n for k in range(ln)]
        en = idxs[-1]
        turn = sum(kappa[i] * dsw[i] for i in idxs)
        rmn = min(radius[i] for i in idxs)
        imn = min(idxs, key=lambda i: radius[i])
        # heading difference of 1 m smoothed chords entering/leaving the run (cross-check)
        hin = math.atan2(SY[st] - SY[(st - 1) % n], SX[st] - SX[(st - 1) % n])
        hout = math.atan2(SY[(en + 1) % n] - SY[en], SX[(en + 1) % n] - SX[en])
        acc = 0.0
        for k in range(-1, ln):
            i0 = (st + k) % n
            i1 = (i0 + 1) % n
            i2 = (i0 + 2) % n
            if k == ln - 1:
                break
            acc += wrap_pi(math.atan2(SY[i2] - SY[i1], SX[i2] - SX[i1])
                           - math.atan2(SY[i1] - SY[i0], SX[i1] - SX[i0]))
        # direction-consistent sub-runs inside the merged run
        subs = []
        cur = None
        for i in idxs:
            sg = 1 if kappa[i] > 0 else -1
            if cur is None or sg != cur[0]:
                cur = [sg, i, i, 0.0]
                subs.append(cur)
            cur[2] = i
            cur[3] += kappa[i] * dsw[i]
        subs_out = [("L" if sg > 0 else "R", round(s[a], 1), round(s[b], 1), round(math.degrees(t), 1))
                    for sg, a, b, t in subs if abs(math.degrees(t)) >= 10.0]
        absturn = sum(abs(kappa[i]) * dsw[i] for i in idxs)
        corners.append({
            "subRunsGe10deg": subs_out,
            "absTurnDeg": round(math.degrees(absturn), 1),
            "startArcM": round(s[st], 1),
            "endArcM": round(s[en], 1),
            "lengthM": round((s[en] - s[st]) % L, 1),
            "minRadiusM": round(rmn, 2),
            "minRadiusAtArcM": round(s[imn], 1),
            "direction": "left" if turn > 0 else "right",
            "turnDeg": round(abs(math.degrees(turn)), 1),
            "turnDegChordCheck": round(abs(math.degrees(acc)), 1),
            "idx": [st, en],
        })
    corners.sort(key=lambda c_: c_["startArcM"])
    out["corners"] = corners
    gaps = []
    for k in range(len(corners)):
        a = corners[k]
        b = corners[(k + 1) % len(corners)]
        gaps.append((k + 1, round((b["startArcM"] - a["endArcM"]) % L, 2)))
    out["gapsBetweenCorners"] = gaps
    border = [g for g in gaps if 4.5 <= g[1] <= 5.5]
    if border:
        anomalies.append("corner pairs whose separation is borderline to the 5 m merge rule (after corner #, gap m): %s"
                         % border)
    mixed = [(k + 1, c_["startArcM"], c_["endArcM"], c_["subRunsGe10deg"]) for k, c_ in enumerate(corners)
             if len(set(x[0] for x in c_["subRunsGe10deg"])) > 1]
    if mixed:
        anomalies.append("merged corners containing direction reversals >= 10 deg each (S-bends joined by the "
                         "< 5 m merge rule; turnDeg is the net value): %s" % mixed)
    minor = [(k + 1, c_["startArcM"], c_["turnDeg"]) for k, c_ in enumerate(corners) if c_["turnDeg"] < 10.0]
    if minor:
        anomalies.append("corners with net turn < 10 deg (kinks from trace wiggle, radius < 60 m only locally): %s"
                         % minor)
    out["rawRunsBeforeMerge"] = len(runs)

    # ---------- straights ----------
    smask = [r > R_STRAIGHT for r in radius]
    sruns = circular_runs(smask)
    straights = []
    for st, ln in sruns:
        en = (st + ln - 1) % n
        straights.append({"startArcM": round(s[st], 1), "endArcM": round(s[en], 1),
                          "lengthM": round((s[en] - s[st]) % L, 1),
                          "lengthInclHalfStepsM": round(sum(dsw[(st + k) % n] for k in range(ln)), 1)})
    straights.sort(key=lambda r: -r["lengthM"])
    out["longestStraightM"] = straights[0]["lengthM"] if straights else 0.0
    out["straights_top5"] = straights[:5]

    # ---------- zebras ----------
    zs = d.get("zebras", [])
    ztot = 0.0
    zbad = []
    zcorner = []
    for k, z in enumerate(zs):
        a, b = float(z["de_m"]), float(z["ate_m"])
        ztot += b - a
        if not (0 <= a <= L and 0 <= b <= L) or b <= a:
            zbad.append((k, a, b))
        # which corner overlaps it
        ov = None
        for ci, cc in enumerate(corners):
            if a <= cc["endArcM"] and b >= cc["startArcM"]:
                ov = (ci + 1, cc["direction"])
                break
        zcorner.append((k, z.get("lado"), a, b, ov))
    out["zebraCount"] = len(zs)
    out["zebraTotalM"] = round(ztot, 1)
    out["zebraSides"] = sorted(set(z.get("lado") for z in zs))
    out["zebraMaxArc"] = max(float(z["ate_m"]) for z in zs) if zs else None
    out["zebraVsCorner"] = zcorner
    if zbad:
        anomalies.append("zebras outside [0, measured length %.1f] or empty: %s" % (L, zbad))
    beyond_declared = [(k, z["de_m"], z["ate_m"]) for k, z in enumerate(zs)
                       if float(z["ate_m"]) > float(d.get("comprimento_m", 1e9))]
    if beyond_declared:
        anomalies.append("zebras beyond declared comprimento_m: %s" % beyond_declared)
    # overlaps between zebras on the same side
    ovl = []
    for side in set(z.get("lado") for z in zs):
        zsorted = sorted(((float(z["de_m"]), float(z["ate_m"])) for z in zs if z.get("lado") == side))
        ovl += [(side, zsorted[k], zsorted[k + 1]) for k in range(len(zsorted) - 1)
                if zsorted[k + 1][0] < zsorted[k][1]]
    out["zebraSameSideOverlaps"] = ovl
    if ovl:
        anomalies.append("overlapping zebras on the same side: %s" % ovl)

    # ---------- declared ----------
    decl = {
        "comprimento_m": d.get("comprimento_m"),
        "comprimento_oficial_m": d.get("comprimento_oficial_m"),
        "largura_media_m": d.get("largura_media_m"),
        "sentido": d.get("sentido"),
        "largada": d.get("largada"),
        "qualidade": d.get("qualidade"),
    }
    out["declared"] = decl
    out["anomalies"] = anomalies
    out["radiusProfile_every10m"] = [(round(s[i], 0), round(radius[i], 1) if math.isfinite(radius[i]) else None,
                                      W[i]) for i in range(0, n, 10)]
    print(json.dumps(out, indent=1, ensure_ascii=True, default=str))


if __name__ == "__main__":
    main(sys.argv[1])
