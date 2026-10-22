import json, math, sys
sys.path.insert(0, sys.argv[2])
import referee as R
d = json.load(open(sys.argv[1], encoding="utf-8")); T = R.Track(d)
n, s, L = T.n, T.s, T.L
pv = json.load(open(sys.argv[3]))
for h in (4, 8):
    kap = [T.reg_heading(i, h)[0] for i in range(n)]
    cs = R.split_corners(T, kap, 20)
    print("h=%d corners near limits:" % h, [(c["dir"], c["startArcM"], c["endArcM"], c["turnDeg"]) for c in cs if any(abs(c["startArcM"]-x) < 40 or abs(c["endArcM"]-x) < 40 for x in (201.6, 350, 530, 687.5, 0))])
    for x in (200.6, 201.6, 202.6, 345, 350, 355, 525, 530, 535, 0, 4, 8, 680, 684):
        i = min(range(n), key=lambda k: abs(s[k]-x))
        print("   h=%d arc %.1f R %.0f" % (h, s[i], 1/max(abs(kap[i]),1e-9)), end="")
    print()
good = {round(a,1):(Rr,dc,cl,cr) for a,Rr,dc,cl,cr in pv["goodCandidateArcs"]}
for a in sorted(good):
    if 340 <= a <= 356 or 524 <= a <= 536 or 199 <= a <= 204 or a <= 12 or a >= 679:
        print("  cand", a, good[a])
# zebras near proposed limits
for z in d["zebras"]:
    for x in (201.6, 350, 530, 0, 687.52):
        if z["de_m"] - 3 <= x <= z["ate_m"] + 3: print("  zebra", z, "near", x)
