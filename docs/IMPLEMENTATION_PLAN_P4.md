# IMPLEMENTATION_PLAN_P4

Status: proposed for execution
Branch model: `feat/*` per milestone
Primary goal: deliver next two linear modules and raise module-page delivery quality

## Scope

P4-1: New linear module `L-05 Queue`
- implement queue core operations (`enqueue`, `dequeue`, `front`)
- reuse shared timeline playback and step-by-step controls
- provide JSON import/export parity with schema + business validation

P4-2: New linear module `L-02 Dynamic Array`
- implement capacity growth behavior visualization (append-triggered resize)
- show old/new buffer migration steps clearly in timeline
- keep deterministic replay and clear invalid-input feedback

P4-3: Cross-module module-page delivery polish
- align side-panel information architecture and operation workflow consistency
- tighten module-level validation/error copy consistency (zh/en)
- add cross-module acceptance walkthrough with Playwright artifacts

Out of scope
- backend persistence / accounts
- major global redesign of home/about pages
- advanced algorithm topics outside current linear/sort track

## Milestones

### P4-M1 L-05 Queue

Deliverables
- queue step generator + timeline adapter
- `QueuePage` with controls aligned to existing module conventions
- route registration (`/modules/queue`) and registry mark as implemented

DoD
- operations deterministic for fixed input (`enqueue/dequeue/front`)
- queue page supports play/pause/next/prev/reset/speed
- JSON round-trip (`export -> import -> replay`) stays deterministic

Acceptance
- `npm run check` passes
- manual flow: `/modules` -> `Queue` -> operations replay works without dead-end state

### P4-M2 L-02 Dynamic Array

Deliverables
- dynamic-array operation model with resize steps
- visualization of capacity expansion and element migration
- route registration (`/modules/dynamic-array`) and registry mark as implemented

DoD
- resize boundary behavior is deterministic and test-covered
- controls and timeline behavior match existing module conventions
- input/config validation blocks invalid capacity/data combinations

Acceptance
- `npm run check` passes
- fixed input can replay full resize path without visual state drift

### P4-M3 Module UX/Acceptance Polish

Deliverables
- unify module side-panel structure for the five delivered modules
- normalize operation execution flow (edit -> validate -> timeline reset -> playback)
- Playwright acceptance walkthrough artifacts for all implemented modules

DoD
- no module keeps stale visual state after operation/config switch
- validation and error copy style stays consistent (zh/en)
- docs/handoff include final acceptance evidence

Acceptance
- `npm run check` passes
- Playwright walkthrough confirms stable interactions across all implemented modules

## Suggested Task Breakdown

1. Land queue core logic/page/tests and register route
2. Land dynamic-array logic/page/tests and register route
3. Run side-panel/workflow consistency sweep across all modules
4. Capture Playwright acceptance artifacts and sync docs

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: dynamic-array resize animation introduces high visual complexity
  - Mitigation: enforce deterministic step model first, then layer visual transitions
- Risk: module count growth causes UX inconsistency in side panels
  - Mitigation: define and apply one side-panel structure checklist in P4-M3
- Risk: adding two modules in one phase increases regression surface
  - Mitigation: keep P4 split by milestone and require full quality gate per milestone
