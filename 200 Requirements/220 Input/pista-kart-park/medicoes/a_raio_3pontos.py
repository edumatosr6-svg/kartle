"""Independent geometric measurement of a kartle-pista v1 track (method A).

Usage: python -I measure_track.py <path-to-track.json>

Method A:
  * curvature: circumscribed-circle radius through raw points (i-3, i, i+3),
    cyclic indices, no smoothing; collinear -> infinite radius.
  * corners: contiguous (cyclic) runs where R < 60 m, runs separated by < 5 m
    of arc are merged; turnDeg = accumulated heading change of the 1 m chords
    over the run.
  * self-intersection: brute-force segment/segment over non-adjacent segments
    of the closed polyline.
  * winding: sign of shoelace area (x east, y north; positive = anti-clockwise).
  * start heading: compass bearing of P0 -> P3.
  * min distance between non-adjacent segments: smallest segment/segment
    distance among segment pairs more than 30 m apart along the arc (cyclic).
  * longest straight: longest contiguous (cyclic) run with R > 150 m.
Every declared number in the file is only echoed for comparison.
"""
import json
import math
import sys

INF = float("inf")


def load(path):
    with open(path, "rb") as fh:
        return json.loads(fh.read().decode("utf-8"))


def dist(a, b):
    return math.hypot(b[0] - a[0], b[1] - a[1])


def circ_radius(a, b, c):
    """Signed circumscribed radius: + = left turn (CCW), - = right turn."""
    ab = dist(a, b)
    bc = dist(b, c)
    ca = dist(c, a)
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    area2 = abs(cross)  # = 2 * triangle area
    if area2 < 1e-12:
        return INF
    r = ab * bc * ca / (2.0 * area2)
    return r if cross > 0 else -r


def wrap180(d):
    while d > 180.0:
        d -= 360.0
    while d <= -180.0:
        d += 360.0
    return d


def percentile(vals, q):
    v = sorted(vals)
    if not v:
        return None
    if len(v) == 1:
        return v[0]
    pos = q * (len(v) - 1)
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if v[lo] == INF or v[hi] == INF:
        return v[hi] if pos - lo > 0 else v[lo]
    return v[lo] + (v[hi] - v[lo]) * (pos - lo)


def orient(a, b, c):
    v = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    if abs(v) < 1e-12:
        return 0
    return 1 if v > 0 else -1


def on_seg(a, b, p):
    return (min(a[0], b[0]) - 1e-12 <= p[0] <= max(a[0], b[0]) + 1e-12 and
            min(a[1], b[1]) - 1e-12 <= p[1] <= max(a[1], b[1]) + 1e-12)


def seg_intersect(p1, p2, p3, p4):
    o1 = orient(p1, p2, p3)
    o2 = orient(p1, p2, p4)
    o3 = orient(p3, p4, p1)
    o4 = orient(p3, p4, p2)
    if o1 != o2 and o3 != o4 and o1 != 0 and o2 != 0 and o3 != 0 and o4 != 0:
        return True
    if o1 == 0 and on_seg(p1, p2, p3):
        return True
    if o2 == 0 and on_seg(p1, p2, p4):
        return True
    if o3 == 0 and on_seg(p3, p4, p1):
        return True
    if o4 == 0 and on_seg(p3, p4, p2):
        return True
    return False


def pt_seg_dist(p, a, b):
    dx = b[0] - a[0]
    dy = b[1] - a[1]
    l2 = dx * dx + dy * dy
    if l2 == 0:
        return dist(p, a)
    t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2
    t = max(0.0, min(1.0, t))
    return math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))


def seg_seg_dist(p1, p2, p3, p4):
    if seg_intersect(p1, p2, p3, p4):
        return 0.0
    return min(pt_seg_dist(p1, p3, p4), pt_seg_dist(p2, p3, p4),
               pt_seg_dist(p3, p1, p2), pt_seg_dist(p4, p1, p2))


def cyclic_runs(mask):
    """Contiguous runs of True in a cyclic boolean list -> list of (start, end) inclusive."""
    n = len(mask)
    if all(mask):
        return [(0, n - 1)]
    if not any(mask):
        return []
    # rotate so that index 0 is a False
    k = mask.index(False)
    runs = []
    i = 0
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


def main():
    path = sys.argv[1]
    d = load(path)
    pts = [(float(p[0]), float(p[1])) for p in d["pontos"]]
    wid = [float(p[2]) for p in d["pontos"]]
    n = len(pts)

    # --- arc length (closed) ---
    seglen = [dist(pts[i], pts[(i + 1) % n]) for i in range(n)]  # seg i: P[i] -> P[i+1 mod n]
    s = [0.0] * n
    for i in range(1, n):
        s[i] = s[i - 1] + seglen[i - 1]
    open_len = s[-1]
    closure_gap = seglen[n - 1]
    L = open_len + closure_gap

    def arc_between(i, j):
        """forward arc from point i to point j (cyclic)."""
        a = s[j] - s[i]
        return a if a >= 0 else a + L

    # --- headings of 1 m chords (compass bearing) ---
    bearing = []
    for i in range(n):
        a = pts[i]
        b = pts[(i + 1) % n]
        bearing.append(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])) % 360.0)
    # math heading (CCW from east) for turn sign; turn left = positive
    mhead = [math.degrees(math.atan2(pts[(i + 1) % n][1] - pts[i][1],
                                     pts[(i + 1) % n][0] - pts[i][0])) for i in range(n)]
    dturn = [wrap180(mhead[i] - mhead[i - 1]) for i in range(n)]  # turn at vertex i
    total_turn = sum(dturn)

    # --- radius (signed) ---
    R = [circ_radius(pts[(i - 3) % n], pts[i], pts[(i + 3) % n]) for i in range(n)]
    Rabs = [abs(r) for r in R]
    rmin = min(Rabs)
    rmin_i = Rabs.index(rmin)

    # --- corners ---
    runs = cyclic_runs([r < 60.0 for r in Rabs])
    # order runs by start arc (racing order)
    runs.sort(key=lambda ab: s[ab[0]])
    merged = []
    for run in runs:
        if merged:
            prev = merged[-1]
            gap = arc_between(prev[1], run[0])
            if gap < 5.0:
                merged[-1] = (prev[0], run[1], prev[2] + [run])
                continue
        merged.append((run[0], run[1], [run]))
    # wrap merge: last and first
    if len(merged) > 1:
        gap = arc_between(merged[-1][1], merged[0][0])
        if gap < 5.0:
            last = merged.pop()
            first = merged[0]
            merged[0] = (last[0], first[1], last[2] + first[2])
    corners = []
    for (a, b, parts) in merged:
        idxs = []
        i = a
        while True:
            idxs.append(i)
            if i == b:
                break
            i = (i + 1) % n
        turn = sum(dturn[k] for k in idxs)
        left = sum(dturn[k] for k in idxs if dturn[k] > 0)
        right = sum(dturn[k] for k in idxs if dturn[k] < 0)
        mr = min(Rabs[k] for k in idxs)
        mr_i = min(idxs, key=lambda k: Rabs[k])
        signs = set(1 if R[k] > 0 else -1 for k in idxs if Rabs[k] < 60.0)
        corners.append({
            "startIdx": a, "endIdx": b,
            "startArcM": round(s[a], 1), "endArcM": round(s[b], 1),
            "lengthM": round(arc_between(a, b), 1),
            "minRadiusM": round(mr, 1), "minRadiusAtArcM": round(s[mr_i], 1),
            "direction": "left" if turn > 0 else "right",
            "turnDeg": round(abs(turn), 1),
            "signedTurnDeg": round(turn, 1),
            "leftComponentDeg": round(left, 1), "rightComponentDeg": round(right, 1),
            "mixedCurvatureSigns": len(signs) > 1,
            "runsMerged": len(parts),
            "wrapsStartLine": b < a,
        })

    # --- straights ---
    sruns = cyclic_runs([r > 150.0 for r in Rabs])
    straights = []
    for (a, b) in sruns:
        straights.append({"startArcM": round(s[a], 1), "endArcM": round(s[b], 1),
                          "lengthM": round(arc_between(a, b), 1), "wraps": b < a})
    straights.sort(key=lambda x: -x["lengthM"])

    # --- winding (shoelace) ---
    area2 = 0.0
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        area2 += x1 * y2 - x2 * y1
    area = area2 / 2.0
    winding = "anti-clockwise" if area > 0 else "clockwise"

    # --- start heading ---
    p0, p3 = pts[0], pts[3]
    start_bearing = math.degrees(math.atan2(p3[0] - p0[0], p3[1] - p0[1])) % 360.0

    # --- self intersections & min distance between non-adjacent segments ---
    segs = [(pts[i], pts[(i + 1) % n]) for i in range(n)]
    smid = [s[i] + seglen[i] / 2.0 for i in range(n)]
    inters = []
    best = (INF, None, None)
    # quick bbox prefilter for distance: we need exact min; brute force anyway
    for i in range(n):
        a1, a2 = segs[i]
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue  # adjacent through closure
            b1, b2 = segs[j]
            if seg_intersect(a1, a2, b1, b2):
                inters.append((i, j))
            da = abs(smid[i] - smid[j])
            da = min(da, L - da)
            if da > 30.0:
                dd = seg_seg_dist(a1, a2, b1, b2)
                if dd < best[0]:
                    best = (dd, i, j)
    md, mi, mj = best
    md_info = None
    if mi is not None:
        wi = (wid[mi] + wid[(mi + 1) % n]) / 2.0
        wj = (wid[mj] + wid[(mj + 1) % n]) / 2.0
        da = abs(smid[mi] - smid[mj])
        md_info = {"distM": round(md, 2), "segA_arcM": round(s[mi], 1), "segB_arcM": round(s[mj], 1),
                   "arcSeparationM": round(min(da, L - da), 1),
                   "widthA": round(wi, 2), "widthB": round(wj, 2),
                   "edgeGapM_halfwidths": round(md - wi / 2.0 - wj / 2.0, 2)}

    # local closeness profile: for each point, nearest other point > 30 m arc away
    close_list = []
    for i in range(n):
        bd, bj = INF, None
        for j in range(n):
            da = abs(s[i] - s[j])
            da = min(da, L - da)
            if da > 30.0:
                dd = dist(pts[i], pts[j])
                if dd < bd:
                    bd, bj = dd, j
        gap = bd - wid[i] / 2.0 - wid[bj] / 2.0
        close_list.append((gap, bd, i, bj))
    close_list.sort()
    close_regions = []
    for gap, bd, i, j in close_list:
        if any(abs(s[i] - s[c[2]]) < 15 for c in close_regions):
            continue
        close_regions.append((gap, bd, i, j))
        if len(close_regions) >= 5:
            break

    # --- widths ---
    wsorted = sorted(wid)
    wstats = {"min": round(wsorted[0], 2), "p10": round(percentile(wid, 0.10), 2),
              "median": round(percentile(wid, 0.5), 2), "max": round(wsorted[-1], 2),
              "mean": round(sum(wid) / n, 2),
              "minAtArcM": round(s[wid.index(wsorted[0])], 1),
              "maxAtArcM": round(s[wid.index(wsorted[-1])], 1)}

    # --- anomalies ---
    anomalies = []
    # duplicated / near-duplicate consecutive points; irregular spacing
    dup = [i for i in range(n) if seglen[i] < 0.1]
    exact = {}
    for i, p in enumerate(pts):
        exact.setdefault((round(p[0], 3), round(p[1], 3)), []).append(i)
    exact_dups = [v for v in exact.values() if len(v) > 1]
    spacing = {"min": min(seglen), "max": max(seglen), "mean": L / n,
               "minIdx": seglen.index(min(seglen)), "maxIdx": seglen.index(max(seglen))}
    irregular = [(i, round(seglen[i], 3)) for i in range(n) if seglen[i] < 0.5 or seglen[i] > 1.5]
    # heading jumps > 30 deg between consecutive chords
    jumps = [(i, round(dturn[i], 1), round(s[i], 1)) for i in range(n) if abs(dturn[i]) > 30.0]
    max_jump_i = max(range(n), key=lambda i: abs(dturn[i]))
    # width out of range
    wlow = [(i, wid[i]) for i in range(n) if wid[i] < 3.0]
    whigh = [(i, wid[i]) for i in range(n) if wid[i] > 15.0]
    # width spikes: deviation from local median (+-5 points) > 1.0 m, or step > 0.75 m
    spikes = []
    for i in range(n):
        win = sorted(wid[(i + k) % n] for k in range(-5, 6) if k != 0)
        med = (win[4] + win[5]) / 2.0
        if abs(wid[i] - med) > 1.0:
            spikes.append((i, round(s[i], 1), wid[i], round(med, 2)))
    steps = [(i, round(s[i], 1), round(wid[(i + 1) % n] - wid[i], 2)) for i in range(n)
             if abs(wid[(i + 1) % n] - wid[i]) > 0.75]
    max_step_i = max(range(n), key=lambda i: abs(wid[(i + 1) % n] - wid[i]))
    # zebras
    zebras = d.get("zebras", [])
    zout = [z for z in zebras if z["de_m"] < 0 or z["ate_m"] > L or z["de_m"] > L or z["ate_m"] < 0
            or z["ate_m"] < z["de_m"]]
    zout_declared = [z for z in zebras if z["ate_m"] > float(d.get("comprimento_m", INF))]
    ztotal = sum(z["ate_m"] - z["de_m"] for z in zebras)
    zoverlap = []
    for side in ("direita", "esquerda"):
        zs = sorted([z for z in zebras if z["lado"] == side], key=lambda z: z["de_m"])
        for a, b in zip(zs, zs[1:]):
            if b["de_m"] < a["ate_m"]:
                zoverlap.append((side, a, b))
    both_sides = []
    zr = [z for z in zebras if z["lado"] == "direita"]
    zl = [z for z in zebras if z["lado"] == "esquerda"]
    for a in zr:
        for b in zl:
            lo = max(a["de_m"], b["de_m"])
            hi = min(a["ate_m"], b["ate_m"])
            if hi > lo:
                both_sides.append((round(lo, 1), round(hi, 1)))
    # zebra side vs corner direction: kerb on the inside of a left corner is on the left
    def corner_at(arc):
        for c in corners:
            a, b = c["startArcM"], c["endArcM"]
            if (a <= b and a <= arc <= b) or (a > b and (arc >= a or arc <= b)):
                return c
        return None
    zebra_corner = []
    for z in zebras:
        mid = (z["de_m"] + z["ate_m"]) / 2.0
        c = corner_at(mid % L)
        zebra_corner.append((z["lado"], z["de_m"], z["ate_m"], c["direction"] if c else None,
                             c["startArcM"] if c else None))

    # --- supplementary diagnostics (NOT the prescribed method; for cross-check context only) ---
    # (a) direction-split corners: split R<60 runs at curvature-sign changes, merge only
    #     same-direction runs separated by < 5 m.
    sign_mask = [(1 if R[i] > 0 else -1) if Rabs[i] < 60.0 else 0 for i in range(n)]
    druns = []
    for sgn in (1, -1):
        for (a, b) in cyclic_runs([m == sgn for m in sign_mask]):
            druns.append((a, b, sgn))
    druns.sort(key=lambda r: s[r[0]])
    dmerged = []
    for run in druns:
        if dmerged and dmerged[-1][2] == run[2] and arc_between(dmerged[-1][1], run[0]) < 5.0:
            # only merge if nothing of opposite sign lies in the gap
            a0 = dmerged[-1][1]
            gap_idx = []
            k = (a0 + 1) % n
            while k != run[0]:
                gap_idx.append(k)
                k = (k + 1) % n
            if all(sign_mask[k] != -run[2] for k in gap_idx):
                dmerged[-1] = (dmerged[-1][0], run[1], run[2])
                continue
        dmerged.append(run)
    split_corners = []
    for (a, b, sgn) in dmerged:
        idxs = []
        i = a
        while True:
            idxs.append(i)
            if i == b:
                break
            i = (i + 1) % n
        turn = sum(dturn[k] for k in idxs)
        split_corners.append({"startArcM": round(s[a], 1), "endArcM": round(s[b], 1),
                              "dir": "left" if sgn > 0 else "right",
                              "minR": round(min(Rabs[k] for k in idxs), 1),
                              "turnDeg": round(turn, 1)})
    # (b) lateral wobble: distance of each raw point from the chord P[i-5]..P[i+5] minus the
    #     distance of the +-5 moving average from the same chord (residual of a box smoother)
    resid = []
    for i in range(n):
        mx = sum(pts[(i + k) % n][0] for k in range(-3, 4)) / 7.0
        my = sum(pts[(i + k) % n][1] for k in range(-3, 4)) / 7.0
        resid.append(math.hypot(pts[i][0] - mx, pts[i][1] - my))
    rms_resid = math.sqrt(sum(r * r for r in resid) / n)
    sign_changes = sum(1 for i in range(n) if sign_mask[i] != 0 and sign_mask[i - 1] != 0
                       and sign_mask[i] != sign_mask[i - 1])
    nz = [sign_mask[i] for i in range(n) if sign_mask[i] != 0]
    sign_flips_ignoring_gaps = sum(1 for i in range(1, len(nz)) if nz[i] != nz[i - 1])
    n_r150 = sum(1 for r in Rabs if r > 150.0)
    n_r60 = sum(1 for r in Rabs if r < 60.0)
    zcov = {}
    for side in ("direita", "esquerda"):
        zcov[side] = round(sum(z["ate_m"] - z["de_m"] for z in zebras if z["lado"] == side), 1)

    out = {
        "supplementary": {
            "directionSplitCorners": split_corners,
            "rmsResidualFrom7ptBoxMeanM": round(rms_resid, 3),
            "maxResidualFrom7ptBoxMeanM": round(max(resid), 3),
            "curvatureSignFlipsAmongR60Points": sign_flips_ignoring_gaps,
            "pointsR_lt_60": n_r60, "pointsR_gt_150": n_r150,
            "zebraMetersPerSide": zcov,
        },
        "file": path,
        "pointCount": n,
        "polylineLengthOpenM": round(open_len, 2),
        "polylineLengthClosedM": round(L, 2),
        "closureGapM": round(closure_gap, 3),
        "declared": {k: d.get(k) for k in ("comprimento_m", "comprimento_oficial_m", "largura_media_m",
                                            "sentido", "largada", "qualidade")},
        "spacing": {k: round(v, 3) if isinstance(v, float) else v for k, v in spacing.items()},
        "totalTurnDeg": round(total_turn, 2),
        "shoelaceAreaM2": round(area, 1),
        "winding": winding,
        "bbox": {"xmin": round(min(p[0] for p in pts), 2), "xmax": round(max(p[0] for p in pts), 2),
                 "ymin": round(min(p[1] for p in pts), 2), "ymax": round(max(p[1] for p in pts), 2)},
        "startBearingDeg": round(start_bearing, 2),
        "radius": {"min": round(rmin, 2), "minAtArcM": round(s[rmin_i], 1), "minIdx": rmin_i,
                   "p10": round(percentile(Rabs, 0.10), 2), "median": round(percentile(Rabs, 0.5), 2),
                   "countFinite": sum(1 for r in Rabs if r != INF)},
        "corners": corners,
        "straightsTop5": straights[:5],
        "selfIntersections": len(inters), "intersectionPairs": inters[:20],
        "minDistNonAdjacent": md_info,
        "closestApproachRegions": [{"gapEdgeToEdgeM": round(g, 2), "centreDistM": round(bd, 2),
                                    "arcA": round(s[i], 1), "arcB": round(s[j], 1)}
                                   for g, bd, i, j in close_regions],
        "width": wstats,
        "anomalies": {
            "nearDuplicateConsecutive": dup,
            "exactDuplicatePoints": exact_dups,
            "irregularSpacing": irregular,
            "headingJumpsOver30": jumps,
            "maxHeadingChangeDeg": round(dturn[max_jump_i], 2),
            "maxHeadingChangeAtArcM": round(s[max_jump_i], 1),
            "widthBelow3": wlow, "widthAbove15": whigh,
            "widthSpikes_localMedianDevOver1m": spikes,
            "widthStepsOver0.75m": steps,
            "maxWidthStep": (round(s[max_step_i], 1), round(wid[(max_step_i + 1) % n] - wid[max_step_i], 2)),
            "zebrasOutsideMeasuredLength": zout,
            "zebrasBeyondDeclaredLength": zout_declared,
            "zebraOverlapSameSide": zoverlap,
            "zebraBothSidesIntervals": both_sides,
        },
        "zebraCount": len(zebras),
        "zebraTotalM": round(ztotal, 1),
        "zebraCornerMatch": zebra_corner,
    }
    print(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
