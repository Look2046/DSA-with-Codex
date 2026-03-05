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

- [x] Unify visualization stage to large-canvas layout across modules
  - DoD: consistent stage size/structure on all algorithm pages; no obvious canvas jump when switching modules.
  - Done: shared `VisualizationCanvas` landed and migrated on S-01/L-01/L-03.

## P2 (Could Have / Backlog)
- [x] P2-M1 Build reusable animation timeline engine (S-01 first)
  - DoD: shared engine contracts + S-01 migration + deterministic replay tests.
  - Acceptance: seek/speed/resume produce stable frame sequence on fixed input.
  - Done: added `useTimelinePlayer`, migrated S-01 playback to timeline engine path, and landed deterministic replay test (`bubbleTimelineReplay.test.ts`).

- [x] P2-M2 Migrate L-01/L-03 playback to shared engine
  - DoD: all three modules use one timeline engine path without UX regression.
  - Acceptance: `npm run check` passes and cross-module playback behavior remains consistent.
  - Done: migrated L-01/L-03 pages to `useTimelinePlayer`, removed page-level store/tick loops, and captured Playwright regression artifacts for S-01/L-01/L-03.

- [x] P2-M3 Add JSON import/export for example datasets (L-01 first)
  - DoD: schema-validated JSON import/export with clear invalid-input feedback.
  - Acceptance: round-trip (`export -> import -> replay`) is deterministic.
  - Done: added L-01/L-03 JSON import/export UI, schema validation (`parse` + `schema`), and round-trip deterministic replay tests.

## P3 (Next Milestone)
- [ ] P3-M1 Upgrade `/modules` page to practical discovery view
  - DoD: category filters + module cards + safe navigation to implemented routes.
  - Acceptance: user can filter and navigate from `/modules` to current implemented modules without dead-end confusion.

- [ ] P3-M2 Add S-02 selection sort module
  - DoD: step generator + playback page + deterministic tests + zh/en copy.
  - Acceptance: fixed input replay deterministic; `npm run check` passes.

- [ ] P3-M3 Add L-04 stack module (push/pop/peek)
  - DoD: timeline visualization + validation + JSON import/export + tests.
  - Acceptance: `export -> import -> replay` deterministic; `npm run check` passes.

## Done
- [x] Configure GitHub SSH auth for this repo (2026-03-03)
- [x] Establish daily handoff/decision/todo documentation workflow (2026-03-03)
- [x] Define pre-code checklist and V1 execution plan (2026-03-03)
- [x] Close S-01 milestone (M0 + M1 + M2 + M3) on `feat/m0-scaffold` (2026-03-03)
- [x] Close L-01 milestone (array insert v1 + playback + tests) on `feat/l01-v1` (2026-03-03)
- [x] Capture cross-module playwright visual regression baseline artifacts for S-01/L-01/L-03 (2026-03-05)
