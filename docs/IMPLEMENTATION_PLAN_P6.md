# IMPLEMENTATION_PLAN_P6

Status: proposed for execution
Branch model: `feat/*` per milestone
Primary goal: deepen search track and continue sorting expansion while keeping cross-module interaction consistency

## Scope

P6-1: New search module `SR-01 Linear Search`
- deliver linear-search step generator and page on shared timeline engine
- visualize sequential scan progression and first-match stopping behavior
- add deterministic step/replay tests and JSON import/export parity

P6-2: New sorting module `S-04 Shell Sort`
- deliver shell-sort gap-based insertion progression on current sorting stage pattern
- keep S-01/S-02/S-03 controls and pseudocode-highlight conventions
- add deterministic step/replay tests with fixed input reproducibility

P6-3: Discovery and acceptance closure
- refresh `/modules` discovery consistency for expanded search/sort coverage
- refresh Playwright acceptance walkthrough artifacts across all implemented modules
- sync milestone closure evidence in docs

Out of scope
- backend persistence / accounts
- tree/graph module delivery in this phase
- major global UI redesign

## Milestones

### P6-M1 SR-01 Linear Search

Deliverables
- linear-search generator + timeline adapter + page route (`/modules/linear-search`)
- JSON import/export + schema/business validation
- deterministic tests for step sequence, replay stability, and JSON round-trip

DoD
- sequential pointer progression is visually clear and deterministic
- found/not-found flows both replay correctly
- controls and side-panel structure match current module conventions

Acceptance
- `npm run check` passes
- `export -> import -> replay` deterministic for found/not-found scenarios

### P6-M2 S-04 Shell Sort

Deliverables
- shell-sort generator + timeline adapter + page route (`/modules/shell-sort`)
- zh/en step description and pseudocode mapping
- deterministic tests for step generation and replay

DoD
- gap changes and per-pass insertion effects are visibly distinguishable
- final state sorted and deterministic for fixed input
- module registry marks S-04 implemented and `/modules` can open route safely

Acceptance
- `npm run check` passes
- manual flow `/modules -> S-04 -> replay/reset` remains stable

### P6-M3 Discovery + Acceptance Refresh

Deliverables
- modules discovery consistency pass after SR-01/S-04 additions
- Playwright acceptance artifacts refresh for all implemented modules
- docs sync (`HANDOFF`, `SESSION_BRIEF`, `TODO`, `DECISIONS`) for P6 closure

DoD
- no dead-end navigation for newly implemented routes
- acceptance report confirms stable runtime/controls across implemented modules
- quality gate remains green after final sweep

Acceptance
- `npm run check` passes
- Playwright artifacts and report updated under `output/playwright/`

## Suggested Task Breakdown

1. Land SR-01 logic/page/tests + route + registry + i18n
2. Land S-04 logic/page/tests + route + registry + i18n
3. Run discovery consistency pass and Playwright full acceptance refresh
4. Close P6 docs/handoff with evidence links

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: search modules diverge in validation and status semantics
  - Mitigation: reuse SR-02 utils/page structure checklist for SR-01
- Risk: shell-sort step model may become hard to follow under large datasets
  - Mitigation: keep deterministic step granularity and explicit gap-change markers
- Risk: module growth increases regression surface in acceptance
  - Mitigation: require full Playwright walkthrough artifacts at P6 closure
