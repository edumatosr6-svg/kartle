# Deploy stage — project directives (Kartle)

Read by `deploy-generator`, `deploy-validator` and `deploy-loop` as the directives of this stage. The
pipeline skills carry no knowledge of this project; everything Kartle-specific those loops enforce is
here.

Invariants referenced by id (`I1`…`In`) are defined in
[domain-invariants.md](../../100%20Admin/120%20Processes/domain-invariants.md).

## The environments

| Environment | Where it runs | Who promotes into it |
|---|---|---|
| dev | Local Vite server, `npm run dev` on `127.0.0.1`; `npm run preview` for the built bundle. A phone needs an HTTPS URL for the sensors | the developer |
| staging | not defined yet (OPEN-03, tied to D23) | the product owner |
| production | Static CDN with HTTPS; provider, domain and budget open (D23, RNF12 < US$ 10/month) | the product owner (Eduardo Matos), always — never a loop |

## The pipeline

| | |
|---|---|
| CI system | none yet (OPEN-04) |
| Build artifact | the `dist/` folder produced by `npm run build` (static HTML, JS and CSS) |
| Migration step | no server migration in the MVP; persisted player data is upgraded in the client by versioned readers when the page loads (I5). A failed read keeps the old data untouched |
| Configuration and secrets | none in the MVP client; post-MVP services read theirs from the host environment, never from a repository file (I6) |
| Health check | the published URL loads over HTTPS, the day's challenge resolves and the kart drives; size of the initial download measured against RNF02 |
| Rollback | redeploy the previous `dist/` artifact on the CDN; the exact commands depend on the provider (OPEN-03) |

## Directives

| # | Directive | Severity when broken |
|---|---|---|
| D-DP-01 | Every release that changes a persisted or published format names its version and the reader it ships, and that tracks published for upcoming days stay readable (I3, I5). | `error` |
| D-DP-02 | Every release has a rollback path, stated as commands, and a stated point of no return. | `error` |
| D-DP-03 | The runbook names what to watch after the deploy — load time (RNF01), download size (RNF02), the day's challenge resolving — and the threshold that triggers a rollback. | `error` |
| D-DP-04 | The OSM credit and the ODbL notice are visible in the released build (RNF09). | `error` |
| D-DP-05 | No secret or credential appears in a pipeline file, a manifest or a runbook (I6). | `blocker` |
| D-DP-06 | Promotion to production is never taken by a loop; the loop ends with the question and a human answers it. | `blocker` |
