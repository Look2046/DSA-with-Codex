# IMPLEMENTATION_PLAN_P5

Status: closed (`P5-M1` + `P5-M2` + `P5-M3` completed)
Branch model: `feat/*` per milestone
Primary goal: expand beyond current linear baseline with one new sorting module + one search module, while keeping cross-module delivery quality stable

## Scope

P5-1: New sorting module `S-03 Insertion Sort`
- deliver insertion-sort step generator and page on shared timeline engine
- keep S-01/S-02 interaction conventions and pseudocode highlight behavior
- add deterministic step/replay tests

P5-2: New search module `SR-02 Binary Search`
- introduce first dedicated search-page flow on sorted array input
- visualize low/high/mid pointer evolution and decision branch per step
- provide JSON import/export + schema/business validation parity

P5-3: Discovery and acceptance hardening for category expansion
- extend module discovery to include search category entries with route-safe pending/ready behavior
- refresh cross-module acceptance walkthrough artifacts after S-03/SR-02 landing
- keep validation/error semantics aligned (error vs warning) across implemented modules

Out of scope
- backend persistence / accounts
- major redesign of home/about pages
- tree/graph advanced modules in this phase

## Milestones

### P5-M1 S-03 Insertion Sort

Deliverables
- insertion-sort generator + timeline adapter + page route (`/modules/insertion-sort`)
- zh/en copy for operation description and pseudocode lines
- deterministic tests for step sequence and replay stability

DoD
- play/pause/next/prev/reset/speed controls match existing sorting pages
- fixed input replay deterministic and ends in sorted state
- module registry marks S-03 implemented and `/modules` route opens it safely

Acceptance
- `npm run check` passes
- manual flow: `/modules` -> `S-03` -> replay and reset behavior stable

### P5-M2 SR-02 Binary Search

Deliverables
- binary-search step generator + timeline adapter + page route (`/modules/binary-search`)
- pointer-focused visualization (`low`/`high`/`mid`) and compare-result status text
- JSON import/export workflow with schema + business validation and deterministic round-trip tests

DoD
- only sorted array input accepted with clear validation feedback
- fixed dataset replay deterministic for found/not-found scenarios
- controls and side-panel structure follow current module conventions

Acceptance
- `npm run check` passes
- `export -> import -> replay` deterministic for binary-search scenarios

### P5-M3 Discovery + Acceptance Refresh

Deliverables
- `/modules` category coverage update for `search` entries (implemented + planned visibility)
- Playwright acceptance artifacts refreshed for all implemented modules
- docs sync (`HANDOFF`, `SESSION_BRIEF`, `TODO`, `DECISIONS`) for P5 closure evidence

DoD
- no dead-end navigation from `/modules` for newly added category entries
- automated/manual acceptance evidence includes S-03 and SR-02
- warning-style informational copy does not reuse validation-error styling

Acceptance
- `npm run check` passes
- acceptance report confirms stable route/runtime behavior across implemented modules

## Suggested Task Breakdown

1. Land `S-03` core logic/page/tests and route + registry updates
2. Land `SR-02` core logic/page/tests + JSON parity
3. Expand `/modules` discovery category coverage for search track
4. Run cross-module acceptance refresh and sync docs for milestone closure

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: first search module introduces a new interaction model and inconsistent UX
  - Mitigation: enforce side-panel/playback control checklist reused from P4-M3
- Risk: binary-search correctness depends on sorted input constraints
  - Mitigation: explicit pre-validation + clear input feedback + deterministic tests for invalid/found/not-found cases
- Risk: expanding discovery categories may introduce pending-route confusion
  - Mitigation: keep implemented/pending gating and route-safe actions on `/modules`
