# IMPLEMENTATION_PLAN_P7

Status: proposed for execution
Branch model: `feat/*` per milestone
Primary goal: continue sorting-track expansion while preserving the timeline-engine and acceptance discipline used in P5/P6

## Scope

P7-1: New sorting module `S-05 Quick Sort`
- deliver quick-sort step generator and page on shared timeline engine
- visualize pivot/partition progression clearly and deterministically
- add deterministic step/replay tests and zh/en copy

P7-2: New sorting module `S-06 Merge Sort`
- deliver merge-sort split/merge timeline progression on current sorting stage pattern
- keep S-01~S-04 control and status-line conventions
- add deterministic step/replay tests and zh/en copy

P7-3: Sorting-track consistency and acceptance closure
- align interaction semantics across `S-01`~`S-06` (highlight/move/sorted/index behavior)
- refresh Playwright acceptance artifacts and report for all implemented modules
- sync milestone closure evidence in docs

Out of scope
- backend persistence / accounts
- tree/graph module delivery in this phase
- major global UI redesign

## Milestones

### P7-M1 S-05 Quick Sort

Deliverables
- quick-sort generator + timeline adapter + page route (`/modules/quick-sort`)
- route/registry integration with implemented status
- deterministic tests for step generation and replay

DoD
- pivot and partition boundaries are visually explicit
- final state sorted and deterministic for fixed input
- module can be opened safely from `/modules`

Acceptance
- `npm run check` passes
- manual flow `/modules -> S-05 -> replay/reset` remains stable

### P7-M2 S-06 Merge Sort

Deliverables
- merge-sort generator + timeline adapter + page route (`/modules/merge-sort`)
- zh/en step description and pseudocode mapping
- deterministic tests for step generation and replay

DoD
- split/merge stages are distinguishable and replay deterministic
- final state sorted for fixed input
- module can be opened safely from `/modules`

Acceptance
- `npm run check` passes
- manual flow `/modules -> S-06 -> replay/reset` remains stable

### P7-M3 Sorting Consistency + Acceptance Refresh

Deliverables
- sorting UX consistency pass (`S-01`~`S-06`)
- Playwright acceptance artifacts/report refresh for all implemented modules
- docs sync (`HANDOFF`, `SESSION_BRIEF`, `TODO`, `DECISIONS`) for P7 closure

DoD
- no dead-end navigation for sorting modules
- acceptance report confirms stable runtime/controls across all implemented modules
- quality gate remains green after final sweep

Acceptance
- `npm run check` passes
- Playwright artifacts and report updated under `output/playwright/`

## Suggested Task Breakdown

1. Land S-05 logic/page/tests + route + registry + i18n
2. Land S-06 logic/page/tests + route + registry + i18n
3. Run sorting consistency pass and Playwright full acceptance refresh
4. Close P7 docs/handoff with evidence links

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: quick-sort partition states become hard to read under dense arrays
  - Mitigation: keep explicit pivot/left/right markers and deterministic step granularity
- Risk: merge-sort temporary-buffer semantics create animation ambiguity
  - Mitigation: define a strict temp-buffer visualization contract before coding
- Risk: expanded sorting set increases UX drift risk
  - Mitigation: reserve P7-M3 specifically for cross-sorting consistency and acceptance refresh
