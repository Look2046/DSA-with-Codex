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

## P3 (Closed)
- [x] P3-M1 Upgrade `/modules` page to practical discovery view
  - DoD: category filters + module cards + safe navigation to implemented routes.
  - Acceptance: user can filter and navigate from `/modules` to current implemented modules without dead-end confusion.
  - Done: added category-filtered module cards, implemented/pending status badges, disabled action for unimplemented modules, and route-safe navigation.

- [x] P3-M2 Add S-02 selection sort module
  - DoD: step generator + playback page + deterministic tests + zh/en copy.
  - Acceptance: fixed input replay deterministic; `npm run check` passes.
  - Done: added S-02 page/route/registry entry, selection step generator, deterministic replay tests, and zh/en i18n copy.

- [x] P3-M3 Add L-04 stack module (push/pop/peek)
  - DoD: timeline visualization + validation + JSON import/export + tests.
  - Acceptance: `export -> import -> replay` deterministic; `npm run check` passes.
  - Done: added L-04 page/route/registry entry, stack step generator, JSON import/export + validation, and deterministic replay tests.

## P4 (Closed)
- [x] P4-M1 Add L-05 queue module
  - DoD: queue step generator + timeline page + validation + JSON import/export + deterministic tests.
  - Acceptance: `export -> import -> replay` deterministic; `npm run check` passes.
  - Done: added L-05 page/route/registry entry, queue step generator, JSON import/export + validation, and deterministic replay tests.

- [x] P4-M2 Add L-02 dynamic array module
  - DoD: dynamic resize visualization + timeline playback + validation + deterministic tests.
  - Acceptance: fixed input can deterministically replay resize path; `npm run check` passes.
  - Done: added L-02 page/route/registry entry, resize+migration step generator, JSON import/export + validation, and deterministic replay/round-trip tests.

- [x] P4-M3 Module UX/acceptance polish across implemented modules
  - DoD: side-panel/workflow consistency sweep + Playwright acceptance artifacts refresh.
  - Acceptance: interaction walkthrough stable across implemented modules and quality gate remains green.
  - Progress (2026-03-06):
    - aligned S-01/S-02 playback status and controls behavior with linear modules
    - stabilized status block layout in L-03/L-05 to reduce layout jump
    - hardened L-05 circular queue progression path to avoid app-level runtime crash
    - unified randomized insertion/push/enqueue value flow across L-01/L-05
  - Done (2026-03-06):
    - refreshed Playwright acceptance screenshots and report across all implemented modules (`output/playwright/p4m3-*.png`, `output/playwright/p4m3-acceptance-report.txt`)
    - adjusted L-02 capacity-full warning semantics (status-style warning instead of validation-error style)
    - local quality gate re-verified (`npm run check` pass)

## P5 (Closed)
- [x] P5 planning baseline
  - DoD: define P5 milestone scope/order and acceptance criteria in docs.
  - Acceptance: `docs/SESSION_BRIEF.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, and `TODO.md` agree on the same next-phase boundary.
  - Done: added `docs/IMPLEMENTATION_PLAN_P5.md` and synced milestone state docs.

- [x] P5-M1 Add S-03 insertion sort module
  - DoD: step generator + timeline page + deterministic tests + zh/en copy.
  - Acceptance: fixed input replay deterministic; `npm run check` passes.
  - Done: added `S-03` step generator/timeline adapter/page/route/registry entry + deterministic tests (`insertionSort.test.ts`, `insertionTimelineReplay.test.ts`) + zh/en i18n copy.

- [x] P5-M2 Add SR-02 binary search module
  - DoD: binary-search pointer visualization + validation + JSON import/export + deterministic tests.
  - Acceptance: found/not-found cases deterministic; `export -> import -> replay` deterministic; `npm run check` passes.
  - Done: added `SR-02` step generator/timeline adapter/page/route/registry entry + JSON import/export validation + deterministic tests (`binarySearch.test.ts`, `binarySearchTimelineReplay.test.ts`, `binarySearchPageUtils.test.ts`).

- [x] P5-M3 Discovery/acceptance refresh for search-track expansion
  - DoD: `/modules` category coverage update + Playwright acceptance artifacts refresh + docs closure sync.
  - Acceptance: route-safe navigation stable across implemented modules and quality gate remains green.
  - Done: refreshed Playwright acceptance screenshots/report for all implemented modules (`output/playwright/p5m3-*.png`, `output/playwright/p5m3-acceptance-report.txt`) and synced P5 closure docs.

## P6 (Closed)
- [x] P6 planning baseline
  - DoD: define P6 milestone scope/order and acceptance criteria in docs.
  - Acceptance: `docs/SESSION_BRIEF.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, and `TODO.md` agree on the same next-phase boundary.
  - Done: added `docs/IMPLEMENTATION_PLAN_P6.md` and synced milestone state docs.

- [x] P6-M1 Add SR-01 linear search module
  - DoD: step generator + pointer progression visualization + validation + JSON import/export + deterministic tests.
  - Acceptance: found/not-found deterministic; `export -> import -> replay` deterministic; `npm run check` passes.
  - Done: added `SR-01` step generator/timeline adapter/page/route/registry entry + JSON import/export validation + deterministic tests (`linearSearch.test.ts`, `linearSearchTimelineReplay.test.ts`, `linearSearchPageUtils.test.ts`).

- [x] P6-M2 Add S-04 shell sort module
  - DoD: gap-based timeline visualization + deterministic tests + zh/en copy.
  - Acceptance: fixed input replay deterministic and sorted; `npm run check` passes.
  - Done: added `S-04` step generator/timeline adapter/page/route/registry entry + zh/en i18n copy + deterministic tests (`shellSort.test.ts`, `shellTimelineReplay.test.ts`) and local Playwright walkthrough evidence (`output/playwright/p6m2-shell-sort.png`).

- [x] P6-M3 Discovery/acceptance refresh after SR-01/S-04
  - DoD: modules discovery consistency pass + Playwright acceptance artifacts refresh + docs closure sync.
  - Acceptance: route-safe navigation stable across implemented modules and quality gate remains green.
  - Done: refreshed Playwright artifacts for `/modules` + all implemented modules (`output/playwright/p6m3-*.png`), generated `output/playwright/p6m3-acceptance-report.txt`, added replay guardrail tests for `S-03/S-04` temp/hole choreography, and synced closure docs.

## P7 (Closed)
- [x] P7 planning baseline
  - DoD: define P7 milestone scope/order and acceptance criteria in docs.
  - Acceptance: `docs/SESSION_BRIEF.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, and `TODO.md` agree on the same next-phase boundary.
  - Done: added `docs/IMPLEMENTATION_PLAN_P7.md` and synced next milestone state docs.

- [x] P7-M1 Add S-05 quick sort module
  - DoD: quick-sort partition visualization + timeline playback + deterministic tests + zh/en copy.
  - Acceptance: fixed input replay deterministic; `npm run check` passes.
  - Done: added `S-05` step generator/timeline adapter/page/route/registry entry + zh/en i18n copy + deterministic tests (`quickSort.test.ts`, `quickTimelineReplay.test.ts`) and local Playwright smoke artifact (`output/playwright/p7m1-s05-quick-sort-smoke.png`).

- [x] P7-M2 Add S-06 merge sort module
  - DoD: split/merge stage visualization + timeline playback + deterministic tests + zh/en copy.
  - Acceptance: fixed input replay deterministic; `npm run check` passes.
  - Done: added `S-06` step generator/timeline adapter/page/route/registry entry + zh/en i18n copy + deterministic tests (`mergeSort.test.ts`, `mergeTimelineReplay.test.ts`) and local Playwright smoke artifact (`output/playwright/p7m2-s06-merge-sort-smoke.png`).

- [x] P7-M3 Sorting-track consistency + acceptance refresh
  - DoD: align S-01~S-06 interaction semantics + Playwright acceptance artifacts/report refresh + docs closure sync.
  - Acceptance: route/runtime stability confirmed and quality gate remains green.
  - Done: refreshed `/modules` + all implemented-module Playwright artifacts (`output/playwright/p7m3-*.png`), generated `output/playwright/p7m3-acceptance-report.txt`, recorded detailed smoke evidence (`output/playwright/p7m3-runtime-smoke.txt`), and completed P7 closure docs sync.

## P8 (Planned)
- [x] P8 planning baseline
  - DoD: define P8 milestone scope/order and acceptance criteria in docs.
  - Acceptance: `docs/SESSION_BRIEF.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, and `TODO.md` agree on the same next-phase boundary.
  - Done: added `docs/IMPLEMENTATION_PLAN_P8.md` and synced P8 next-priority state docs.

- [ ] P8-M1 Tree onboarding + T-01 binary tree traversal
  - DoD: tree category/registry wiring + `T-01` module (timeline/page/route/tests/i18n) landed.
  - Acceptance: `npm run check` passes and `/modules -> T-01 -> play/pause/next/reset` smoke flow is stable.

- [ ] P8-M2 T-02 BST module
  - DoD: BST insert/find/delete timeline semantics + page/route/tests landed.
  - Acceptance: deterministic fixed-input replay with explicit delete-case behavior and `npm run check` pass.

- [ ] P8-M3 Tree-track consistency + acceptance refresh
  - DoD: `T-01`/`T-02` consistency pass + full implemented-route Playwright refresh + docs closure sync.
  - Acceptance: runtime stability confirmed across implemented routes and quality gate remains green.

## Done
- [x] Configure GitHub SSH auth for this repo (2026-03-03)
- [x] Establish daily handoff/decision/todo documentation workflow (2026-03-03)
- [x] Define pre-code checklist and V1 execution plan (2026-03-03)
- [x] Close S-01 milestone (M0 + M1 + M2 + M3) on `feat/m0-scaffold` (2026-03-03)
- [x] Close L-01 milestone (array insert v1 + playback + tests) on `feat/l01-v1` (2026-03-03)
- [x] Capture cross-module playwright visual regression baseline artifacts for S-01/L-01/L-03 (2026-03-05)
- [x] Simplify `playbackStore` to module metadata only and keep timeline state in engine hook (2026-03-05)
