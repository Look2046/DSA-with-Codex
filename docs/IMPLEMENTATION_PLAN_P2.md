# IMPLEMENTATION_PLAN_P2

Status: proposed for execution
Branch model: `feat/*` per milestone
Primary goal: deliver reusable timeline engine first, then dataset import/export

## Scope

P2-1: Reusable animation timeline engine
- unify playback behavior across modules in one engine
- support seek, speed control, deterministic replay
- keep module logic independent from timeline runtime

P2-2: Example dataset import/export
- JSON import/export for at least one module first
- validate schema and provide clear error feedback
- keep data-flow deterministic with existing step generators

Out of scope
- backend persistence
- user accounts or cloud sync
- cross-project dataset marketplace

## Milestones

### P2-M1 Timeline Core

Deliverables
- add shared timeline engine module (`src/engine/timeline/*`)
- define timeline contracts (`seek`, `play`, `pause`, `setSpeed`, `reset`)
- adapter layer from module steps to engine runtime

DoD
- one module (S-01) fully uses the new engine
- deterministic replay proven by unit tests
- no regression on existing playback controls

Acceptance
- same input produces identical frame sequence after:
  - full play
  - seek to middle then resume
  - speed change during playback

### P2-M2 Cross-Module Migration

Deliverables
- migrate L-01 and L-03 to timeline engine
- remove duplicated module-local playback branches
- keep existing UX semantics (step index, completion states)

DoD
- all three modules use one engine path
- previous module tests remain green
- add regression tests for cross-module timeline behavior

Acceptance
- `npm run check` passes
- manual walkthrough confirms no module-specific playback drift

### P2-M3 Dataset Import/Export (First Slice)

Deliverables
- add JSON import/export for one module first (L-01 recommended)
- schema validation utility + localized error messages
- basic examples under `public/examples/`

DoD
- valid JSON imports and replays correctly
- invalid JSON shows actionable error and keeps previous valid state
- export output can be re-imported without behavior change

Acceptance
- round-trip check (`export -> import -> replay`) is deterministic
- unit tests cover valid/invalid/edge payloads

## Suggested Task Breakdown

1. Engine contracts and reducer/state model draft
2. S-01 migration and deterministic replay tests
3. L-01/L-03 migration and cleanup
4. JSON schema + parser utility
5. Import/export UI for selected module
6. Round-trip and failure-path tests
7. Final regression screenshots and handoff docs

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: module-specific playback semantics break during engine unification
  - Mitigation: migrate one module first, lock with deterministic tests, then roll out
- Risk: malformed JSON causes unstable UI state
  - Mitigation: strict schema validation and "keep last valid state" fallback
- Risk: timeline refactor creates large PR blast radius
  - Mitigation: split by milestone branch and keep each PR narrowly scoped
