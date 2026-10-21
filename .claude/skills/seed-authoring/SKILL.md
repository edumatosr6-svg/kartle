---
name: seed-authoring
description: 'Rules, procedure, template and checklist for authoring the seed spec of a feature — the SEED.md under "200 Requirements/220 Input/<feature>/" that the whole pipeline is derived from. Use when: a new feature, epic or change needs to enter the pipeline; an existing seed must be revised; the user asks how to start a feature, what a seed must contain, or why a loop refuses to run. Carries the seed-revision discipline, the size budget and the acceptance-criteria rules every downstream loop depends on. Human-authored: no pipeline skill ever writes a seed.'
argument-hint: 'Feature to author or revise (folder name under "200 Requirements/220 Input/")'
---

# Seed Authoring — writing the seed of a feature

A **seed** is the input of the pipeline: one folder per feature under `200 Requirements/220 Input/<feature>/`,
containing a `SEED.md` plus whatever briefs, screenshots, domain protocol excerpts or research notes it
needs. Everything under `200 Requirements/230 Output/` … `600 Deploy/Output/` is derived from it.

It is **not a Claude skill**, and it is deliberately not named like one: it lives under
`200 Requirements/220 Input/`, it is read by path, and nothing loads it automatically.

Binding references, read before writing a line:

- [pipeline-conventions](../pipeline-conventions/SKILL.md) — layout, ids, severities, verdicts, the
  divergence rule, the seed revision, token accounting.
- the project's directives in `<stage-input>/` — primary context, layering, security, compatibility.

## The rule that shapes the whole document

**The seed states what must be true, never how to build it.**

- *What must be true*: the actor, the goal, the observable outcome, the constraint, the risk.
- *How to build it*: the endpoint path, the table, the module, the polling interval, the component tree.

The second belongs to `300 Specs/320 F-Specs` and `300 Specs/330 D-Specs`, which are generated. A seed that names a table column has
already decided a design question with none of the design stage's checks applied to it — and every
downstream validator will then judge that decision against nothing.

The one exception is a **constraint the author is imposing on purpose**: "must reuse the existing
`/accounts/{id}/timeline` contract", "must not add a table". State it in `Constraints` and say why.

## Two phases, and the order is not negotiable

| Phase | The sections assert | Written from |
|---|---|---|
| **A** | what the product must do for whom, and what would make it wrong | the brief, the users, the domain protocol, the regulatory constraint |
| **B** | what this feature does about the system it lands in | the domain invariants and the existing contracts |

**GATE: Phase A is complete before Phase B opens.**

Why the order carries weight: a *constraint* asserts *the system already works this way and this feature
must not break it*, and an *out-of-scope* item asserts *someone will expect this and will not get it*. Both
are claims about the product, and neither can be written honestly after the implementation has been
imagined. Written in one pass they degrade into a description of whatever seemed easy to build.

## Two companion files the pipeline never writes

Beside `SEED.md`, in the same folder:

| File | Holds | Who writes it |
|---|---|---|
| `DOMAIN.md` | The **durable** domain facts and decisions of this feature: what a term means here, which rule the product follows and why, what the regulator or the protocol requires, what was decided and is now closed. It survives every regeneration and is read by every stage | you, and only you |
| `SCOPE-BACKLOG.md` | What the loops handed back: surface a fix round was not allowed to add ([§16](../pipeline-conventions/SKILL.md)), an item declined from another feature's feedback, a question a validator could not answer | you — a loop only *proposes* an entry in its run summary |

`DOMAIN.md` exists because without it a domain decision taken in round 3 of a loop has nowhere durable
to land: it gets re-derived, or re-argued, at the next stage and at every later run, and the reasoning
survives only in a report nobody re-reads. When a loop stops on *Needs human input* and you answer,
**write the answer there**, not only in the chat.

`SCOPE-BACKLOG.md` is the other half of the frozen-surface rule. A loop that may not widen its own
artifact has to put the need somewhere you will see it; this is that place. Review it when you next
bump `revision:` — an entry that has been sitting there for three rounds is either scope you have
decided against (say so, and delete it) or scope the seed is missing.

One line per entry, dated, naming the run that raised it. Neither file has a template: they are notes
to the next person, and the next person is usually you.

## Before authoring: check for a sibling

A mechanism seen from two ends belongs in one feature, not two — splitting it separates a rule from its only
consumer, and neither half then states the constraint. Enumerate `200 Requirements/220 Input/` and read any
adjacent feature's `SEED.md` before creating a second feature for one mechanism. Where the call has already been
made, the folder that lost the split holds a `README.md` and no `SEED.md`, naming the feature that carries it.

## Template

The headings below are **canonical names**. Write the section name the project declares in
`<stage-input>/`, in the language it declares; a project that declares none writes these. The front
matter keys, the channel names and every `OPEN-<nn>` id are never translated.


```markdown
---
name: <feature>
description: <What the feature does, which channels it touches, and when this seed must be read.>
revision: 1
date: <YYYY-MM-DD — the date of this revision>
author: <first.last>
channels: [backend, web, mobile]      # only the ones in scope
---

## Overview
<One paragraph: the feature in product terms. Who it is for and what changes for them.>

## Context
<Where it lands: which existing flow, which screens, which part of the domain protocol.
Link the supporting documents stored in this folder.>

## Actors and channels
<Table: actor x channel, using the actor and channel vocabulary of `<stage-input>/`,
and what each does. A channel not listed is out of scope and is repeated in Out of scope.>

## User stories
<One per line: "As a <actor>, I want <goal>, so that <value>."
Each carries its acceptance criteria as an indented list. Every criterion is observable from outside the
system — a screen state, an API response, a stored record, a message delivered — never an internal call.>

## Domain rules
<The domain logic the feature depends on or changes: branching, scoring, thresholds, escalation.
Cite the protocol document. "None." if the feature carries no domain rule.>

## Non-functional requirements
<Table: requirement x measurable threshold. Latency, availability, offline behaviour, data retention,
privacy, accessibility. Every row has a number or a yes/no — never "fast" or "reliable".>

## Constraints
<What this feature may not change: existing contracts, existing screens, existing config keys, the
schema. Each with the one-line reason. This is where a deliberate design constraint belongs.>

## Domain impact
<Which invariants of domain-invariants.md the feature touches, and how. Name them; copy no values.
Explicit "None." is acceptable; silence is not.>

## Risks and unknowns
<OPEN-<nn> items: anything the author cannot settle. A feature may enter the pipeline with open points, but
no stage passes validation while one remains — they are the loop's "needs human input" fuel.>

## Out of scope
<Everything a reader would reasonably expect and will not get, each with one line of reason.>
```

## Acceptance criteria — the part every downstream stage depends on

Every criterion is checked by `test-validator` and traced by every stage between. It must be:

1. **Observable from outside.** A screen state, an HTTP response, a stored row, an external message
   delivered, a log line. Never "the orchestrator calls the engine".
2. **Decidable.** Someone reading the criterion and the system output must reach the same verdict twice.
   No "properly", "as appropriate", "quickly", "etc."
3. **Atomic.** One behaviour per criterion. A criterion that says "and" twice is three criteria.
4. **Channel-explicit** where the behaviour differs between web and mobile.
5. **Numeric where it is a threshold**, with the unit in the number: `within 2 s`, `at most 3 retries`,
   `retained 90 days`.

A criterion that cannot be written this way is a signal that the story is not yet understood — raise it as
an `OPEN-<nn>` rather than writing a vague one. A vague criterion produces a confidently wrong spec.

## Naming, units and channels

- Feature: lowercase, `-`/`_`, filesystem-safe. No `feature-` prefix.
- Every duration, size or count in the seed carries its unit in the text (`_ms`, `_s`, `days`, `count`).
  The downstream stages carry that unit into field and key names; a unit lost here is a unit invented
  later.
- A behaviour stated without a channel applies to **all channels listed in the frontmatter**. If it does
  not, say so.

## Size discipline

**Target ~150–200 lines. A budget, not a cap.** A feature with a large domain rule set legitimately
costs more.

Three habits keep it there:

1. **Declarative, not didactic.** State the requirement; do not argue with a hypothetical implementer.
   The *reason* a rule exists stays — that is what stops the next reader "simplifying" it. The imagined
   failure goes.
2. **Out of scope cites, it does not restate.** It carries exclusions stated nowhere else.
3. **Provenance is not specification.** Meeting notes, screenshots, "verified with Dr X", competitor
   analysis — real value, wrong document. Put them in a sibling `NOTES.md` in the same folder, which the
   pipeline does not read.

The counter-pressure, so the rule is not applied blindly: an under-specified seed produces confidently
wrong specs, and anything absent from the seed **stalls a loop**. The rule is **cut words, never
requirements** — diff the requirement set before and after, not the word count.

## `revision:`, `date:` and `author:`

The seed is what everything is derived from, and a spec set is only as current as the seed it came from.

- A new seed starts at `revision: 1`. An absent field *means* 1 — write it anyway, so the next bump is an
  edit and not an invention.
- **Bump by one on every substantive change**: a story, a criterion, a constraint, a domain rule, a
  non-functional threshold, the scope. A typo or a reflow is not substantive.
- Bump **once per editing session**, not once per edited line.
- **Move `date:` to the day of the edit whenever you bump.**
- `author:` changes only when ownership does, never merely because someone else made an edit.

These are the only fields maintained by hand, and deliberately so — only the author knows whether an edit
changed the meaning. Everything downstream is automatic: every validator stamps the revision it judged
against, and [pipeline-progress](../pipeline-progress/SKILL.md) reports a feature validated against an older
one as `seed-changed`. A forgotten bump shows as `seed-drift`; the fix is to bump the revision, never to
re-run the loop and let the digest quietly catch up.

**No pipeline skill writes anything under `200 Requirements/220 Input/`.** It moves when an author moves it.

## Quality checklist

- [ ] Folder is `200 Requirements/220 Input/<feature>/`; frontmatter `name` equals the feature; `description` says
      *when* the seed must be read; `channels:` lists only the channels in scope.
- [ ] Phase A sections were complete before Phase B opened.
- [ ] `revision:`, `date:`, `author:` present — `1` on a new seed, bumped with the date moved on every
      substantive edit.
- [ ] Every section of the template is present, under the name the project declares; a non-applicable
      section says `None.` with one line of reason. Silence is ambiguous between "does not apply" and
      "not considered".
- [ ] Every story has an actor, a goal, a value and at least one acceptance criterion.
- [ ] Every acceptance criterion is observable, decidable, atomic, channel-explicit and numeric where it
      is a threshold.
- [ ] Every non-functional requirement carries a measurable threshold.
- [ ] No two stories conflict; no story contradicts a constraint.
- [ ] `Domain impact` names the invariants touched and copies no values.
- [ ] The seed states **what**, not **how** — every design decision it does make is in `Constraints` with
      its reason.
- [ ] Nothing in the seed is a secret, a credential, or real production data of a class the project's
      directives mark protected.
- [ ] Within the size budget, with provenance in a sibling `NOTES.md`.
- [ ] Registered in `200 Requirements/220 Input/README.md`.

## Related

Editing the pipeline skills themselves — the loops, generators and validators under `.claude/skills/` —
is governed by [pipeline-conventions §20](../pipeline-conventions/SKILL.md), not by this skill.
