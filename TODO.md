# TODO

Track actionable tasks here. Keep tasks small and testable.

## P0 (V1 Must Have)
- [x] M0 scaffold: initialize frontend app and route skeleton
  - DoD: app starts locally; routes `/`, `/modules`, `/modules/sorting`, `/about`, `*` work.
  - Acceptance: manual navigation across routes without runtime errors.
  - Owner: haoyu
  - Target: 2026-03-04

- [x] M1 foundations: base types + minimal store
  - DoD: `AnimationStep` and module metadata types defined; current module/playback state managed.
  - Acceptance: switching module updates state and UI placeholder correctly.
  - Owner: haoyu
  - Target: 2026-03-04

- [x] M2 first vertical slice: S-01 bubble sort
  - DoD: bubble sort steps generated and playable (play/pause/step).
  - Acceptance: fixed sample input gives deterministic first/last step output.
  - Owner: haoyu
  - Target: 2026-03-05

- [x] M3 quality gates: lint/test/link-check wired
  - DoD: `lint`, `test`, `./scripts/check-doc-links.sh` available and pass locally.
  - Acceptance: one clean run with captured command output.
  - Owner: haoyu
  - Target: 2026-03-05

## P1 (Should Have)
- [x] Add L-01 array module page with minimal interactions (next milestone: `feat/l01-v1`)
  - DoD: supports data input and step preview for at least one array operation.

- [x] Add L-03 linked list module page with basic node operations
  - DoD: insert/delete visual steps can be played in timeline.
  - Done: playwright-assisted manual walkthrough completed (invalid input behavior, step semantics, continuity verified).

## P2 (Could Have / Backlog)
- [ ] Build reusable animation timeline engine
  - DoD: supports seek, speed control, and deterministic replay.

- [ ] Add import/export for example datasets
  - DoD: JSON import and export works for at least one module.

## Done
- [x] Configure GitHub SSH auth for this repo (2026-03-03)
- [x] Establish daily handoff/decision/todo documentation workflow (2026-03-03)
- [x] Define pre-code checklist and V1 execution plan (2026-03-03)
- [x] Close S-01 milestone (M0 + M1 + M2 + M3) on `feat/m0-scaffold` (2026-03-03)
- [x] Close L-01 milestone (array insert v1 + playback + tests) on `feat/l01-v1` (2026-03-03)
