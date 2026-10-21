---
name: req-validator
description: 'Validate the requisites set under "200 Requirements/230 Output/<feature>/" against the seed at "200 Requirements/220 Input/<feature>/SEED.md". Use when: the requisites were just generated or updated and must be checked before FSpec; the user asks to review or audit the requisites. Emits SUCCESS (ready for FSpec) or FAIL with a machine-consumable Requisites Validation Report. Runs isolated — it never sees the generator''s reasoning and never fixes what it finds.'
argument-hint: 'Feature; optionally a subset of story or NFR ids'
---

# Req Validator — gate between the seed and FSpec

Checks the requisites artifact for completeness, decidability, coverage and domain compliance. The result
is binary: **SUCCESS** (go to `300 Specs/320 F-Specs`) or **FAIL** (report fed back to `req-generator`).

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Reference — seed | `200 Requirements/220 Input/<feature>/SEED.md` (authority for coverage, check R4) |
| Reference — product context | `200 Requirements/210 Docs/` |
| Reference — domain | [domain-invariants.md](../pipeline-conventions/references/domain-invariants.md) |
| Reference — as-built code | **not read by default** — `400 Code/Source/` only when the run explicitly asks (conventions §2) |
| Under validation | `200 Requirements/230 Output/<feature>/` |
| Emitted | `200 Requirements/230 Output/<feature>/reports/req-validation/req-validation-<YYYYMMDD-HHmm>.md` |

Rules:

- Validate exactly one feature per run. If the seed folder does not exist, emit a `blocker` and stop.
- Never modify anything except `status:` front-matter fields inside `200 Requirements/230 Output/<feature>/`, and
  only on SUCCESS.
- The generator's reasoning is not an input. Judge the artifact, not the argument for it.

## Checks

Record every finding as an `ISSUE-<nn>` with severity, check id, file, location, finding and expected.

### R1 — Structure and format

- The set is under `200 Requirements/230 Output/<feature>/` and nowhere else; the feature matches a folder under
  `200 Requirements/220 Input/`.
- Required files exist: `00-index.md`, `01-context.md`, `02-glossary.md`, `99-traceability.md`, at least
  one `stories/US-*.md`.
- Every file has valid front matter (`id`, `title`, `feature`, `stage: req`, `status`, `version`), `feature:`
  equals the folder feature, and the `id` matches the filename.
- `00-index.md` lists exactly the files that exist, with correct versions.
- Every mermaid block is syntactically valid.

### R2 — Story quality

- Every story states an actor, a goal and a value, and names its channels.
- Every story has a Preconditions section, an Abnormal cases section (`None` requires a reason) and a
  Sources section.
- Story ids are unique; a withdrawn id is marked, never reused.
- No two stories conflict; no story contradicts a seed constraint (`error` on either).

### R3 — Criterion decidability

For every `AC-*`:

- names an observation point outside the system (`error` when it asserts an internal call);
- contains none of the forbidden vocabulary — "properly", "correctly", "as appropriate", "fast",
  "reliable", "etc.", "and so on", "if needed" (`error`);
- is atomic — a criterion joining two behaviours is an `error`;
- carries a unit with every threshold (`error` on a bare number);
- states the channel where behaviour differs between web and mobile (`error` when the seed lists more than
  one channel and the criterion is silent about a difference the story implies);
- **is decidable**: state, in one line of the report for any criterion you doubt, the observation that
  would settle it. If you cannot, it is an `error`.

Every domain criterion cites the source `<stage-input>/` requires (`error` when a domain threshold
appears with no citation — this stage may not invent one).

### R4 — Coverage of the seed, both ways

- Every seed item — story, domain rule, constraint, NFR, out-of-scope entry — maps to at least one item
  in the set (`error` when uncovered).
- Every story, criterion and NFR traces back to a seed item, a cited product-context item, or an explicit
  `[DOMAIN]` necessity (`error` on an invented item — it belongs in `OPEN-<nn>` until the author accepts
  it into the seed).
- The out-of-scope list of `01-context.md` matches the seed's.
- `99-traceability.md` is complete and consistent: every requirement appears exactly once, every link
  resolves.

### R5 — Non-functional coverage

- At least one NFR file exists.
- Every NFR carries a **measurable threshold with its unit** and a stated observation method (`error`
  otherwise).
- Each of these families is either specified or explicitly dismissed in one line (`warning` when silent):
  latency, availability, data retention, privacy and consent, RBAC exposure, offline behaviour for a feature
  with `mobile` in scope, accessibility, observability, message-volume rate.
- No NFR is stated as a design choice ("use Redis") rather than a property (`error`).

### R6 — Domain compliance

Against the project's directives in `<stage-input>/`:

- **Primary context** — no story frames a domain flow around a support entity as the primary context
  (`error`). Outcomes are expressed per the primary context the directives name.
- **Compatibility** — a story that removes or redefines an existing behaviour states the retirement and
  its replacement explicitly (`error` when it silently redefines).
- **Safe defaults** — a feature introducing new behaviour states that it is off by default, or gives the
  one-line reason it is safe on (`error` when neither).
- **Security** — every story touching an authenticated surface names the role(s) that may perform it
  (`error`); nothing anywhere is a secret, a credential, or real production data of a class the
  directives mark protected (`blocker`).
- **Idempotency** — a story that changes domain state states what a duplicate or retried event does
  (`error` when silent).
- **Scope** — a story asking for a refactor, rename or removal the seed does not request is an `error`.
- Every further check the directives add, at the severity they declare.

### R7 — No design leakage

An endpoint path, table, column, module name, component, library or framework choice appearing anywhere
in the set is an `error`, **unless** it is quoted from the seed's `Constraints` section or cited to a
fact stated in `DOMAIN.md`, with the source named. Design belongs to `300 Specs/330 D-Specs`, which has
checks this stage does not.

### R8 — Openness

- No `OPEN-<nn>` and no `TBD` remains (`blocker` each — FSpec cannot start on open questions).
- Every `divergence` row of `98-divergences.md` is well-formed: criterion id, what the spec requires, what
  the system does today cited at `file:line`, owing stage, state.

## Verdict

- Any `blocker` or `error` → **FAIL**.
- Only `warning` / `info` / `divergence` → **SUCCESS**. Set `status: validated` on every file of the set.

Divergences are counted and reported, never weighed. A set with twenty divergences and no error is a
SUCCESS: it describes a product that is fully stated and not yet fully built, which is the normal state of
a specification that leads its implementation.

## Procedure

1. Resolve the feature; confirm both the seed and the output folder exist. Capture the seed line to stamp the
   report — paste it verbatim, never hand-write the digest:

   ```powershell
   python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --seed-line <feature>
   ```

2. Run R1 mechanically over every file before reading for meaning.
3. Build the seed's item list once, and use it for R4 in both directions.
4. Run R2–R8. Record every finding; fix nothing.
5. Write the report. On SUCCESS, set `status: validated`.
6. Announce the verdict and return control to [req-loop](../req-loop/SKILL.md). Never invoke
   `req-generator`.

## Report format

```markdown
---
stage: req
feature: <feature>
verdict: SUCCESS | FAIL
generated: <YYYY-MM-DDTHH:mm:ssZ>
counts: {blocker: 0, error: 0, warning: 0, info: 0, divergence: 0}
seed: {revision: N, digest: <sha1-12>}
---

## Issues

### ISSUE-01
- severity: error
- check: R3
- file: stories/US-0004-timeline.md
- location: AC-US-0004-02
- finding: "the timeline updates quickly" — no observation point, no threshold
- expected: an observable condition with a unit, e.g. "the timeline shows the new entry within 5 s of the
  message being processed, on the entity detail screen"

## Divergences
<One row each, mirrored into 98-divergences.md. "None." when there are none.>

## Coverage
<Seed items: N covered, M uncovered (each named). Set items with no seed source: K (each named).>
```

## Bindings — stated in [pipeline-conventions](../pipeline-conventions/SKILL.md), not restated here

- **The rubric above is closed** (§8). The checks are the whole list; a finding that no numbered check
  produced is not reported. A check the rubric genuinely lacks is added to *this skill*, deliberately —
  never improvised inside a run, which turns the report into a sample of an unbounded reading instead
  of a backlog that shrinks.
- **The mechanical layer is already decided** (§13). `lint_artifacts.py` ran before this skill and
  settled front matter, id format and uniqueness, filename agreement, index agreement, traceability
  resolution and the required files. **Never re-judge any of it.**
- **On a re-validation the population is fixed** (§8): every issue of the previous report first, then
  every file whose `version:` moved, then **two** untouched files sampled at random. Widening it
  mid-loop breaks the *No progress* comparison this run is about to be judged by.
- **Report discipline** (§19): front matter, title, entries. No introduction, no narrative of the pass,
  no list of what was found sound, no closing summary. Each entry is fields only, one line per field.
- **Cross-feature findings become feedback, never an edit** (§14). A finding whose fix belongs to
  another feature is written to `<stage-output>/<target feature>/reports/feedbacks/<this feature>/feedback-<stamp>.md`
  as `FB-<nn>`, with `origin:`, `target:` and `origin-stage:`. At a spec stage it is a `scope` item that
  does **not** enter this verdict, so this feature can still reach SUCCESS. Name every feedback sent in
  the report's front matter.
- **Bounded evidence** (§18): never read a run log, result set or dataset into the context. Reduce it
  with `reduce_run.py` and treat that summary as the evidence.
