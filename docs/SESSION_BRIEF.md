# SESSION_BRIEF

Use this file as the first thing to read in a new chat/session.

## 1) Current Snapshot

- Project: Data Structure Algorithm Visualizor
- Active branch (expected): `docs/post-p10-plan`
- Current phase: `P11` planning baseline is completed locally; `P11-M1` graph representation is next
- Last local quality gates:
  - `npm run check` (passed locally, 2026-04-07)
  - `./scripts/check-doc-links.sh` (passed locally, 2026-04-07)

## 2) What Is Already Done

- Frontend scaffold (Vite + React + TypeScript)
- Route shell and page placeholders
- zh/en one-click language toggle (UI text)
- S-01 bubble sort basic playback + bars/highlights + speed/data-size controls
- S-01 bubble sort enhanced demo with localized UI and pseudocode highlight
- Unit test baseline for bubble sort step generation
- CI workflow and unified local quality gate
- L-01 array insert v1 with validated input, timeline playback, explicit empty-slot shift steps, and insertion animation
- Unit tests for array insert step generation (deterministic + edge cases)
- Reusable timeline engine hook (`useTimelinePlayer`) with reducer-driven playback tick loop
- S-01/L-01/L-03 migrated to timeline engine path (no direct playback store dependency in module pages)
- Deterministic S-01 replay test for seek/speed/resume stability
- Playwright cross-module regression artifacts refreshed for timeline migration
- L-01 JSON import/export landed with schema validation and deterministic round-trip tests
- L-03 JSON import/export landed with schema validation and deterministic round-trip tests
- P3 implementation plan drafted in `docs/IMPLEMENTATION_PLAN_P3.md`
- P4 implementation plan drafted in `docs/IMPLEMENTATION_PLAN_P4.md`
- P5 implementation plan drafted in `docs/IMPLEMENTATION_PLAN_P5.md`
- `S-03 Insertion Sort` module landed with timeline playback + deterministic tests
- `S-04 Shell Sort` module landed with gap-based timeline playback + deterministic tests
- `S-05 Quick Sort` module landed with partition/pivot visualization + deterministic tests
- `S-06 Merge Sort` module landed with split/merge buffer visualization + deterministic tests
- `SR-02 Binary Search` module landed with pointer visualization + JSON import/export + deterministic tests
- `SR-01 Linear Search` module landed with pointer progression + JSON import/export + deterministic tests
- `/modules` category filter expanded to include `search`
- P5-M3 acceptance refresh completed with Playwright artifacts for all implemented modules (`output/playwright/p5m3-*.png` + `p5m3-acceptance-report.txt`)
- P6 implementation plan drafted in `docs/IMPLEMENTATION_PLAN_P6.md`
- P7 implementation plan drafted in `docs/IMPLEMENTATION_PLAN_P7.md`
- P8 implementation plan drafted in `docs/IMPLEMENTATION_PLAN_P8.md`
- P9 implementation plan drafted in `docs/IMPLEMENTATION_PLAN_P9.md`
- P10 implementation plan drafted in `docs/IMPLEMENTATION_PLAN_P10.md`
- P9-M1 workspace-shell foundation + pilot migrations completed locally:
  - added shared `WorkspaceShell` component for the validated stage-first shell contract
  - migrated `S-01 Bubble Sort`, `L-01 Array`, and `SR-02 Binary Search`
  - moved pilot-page legend/pseudocode/runtime detail into the right `Step` panel where appropriate
  - refreshed local Playwright smoke artifacts under `output/playwright/p9m1-*`
- P9-M2 sorting-shell rollout batch 1 completed locally:
  - migrated `S-02 Selection Sort`, `S-03 Insertion Sort`, and `S-04 Shell Sort` to the shared `WorkspaceShell`
  - standardized sorting-shell breakout with `pageClassName="bubble-page tree-page"` and `shellClassName="workspace-shell-sorting"`
  - local Playwright smoke at `1440x1100` confirmed `1416px` page/shell/stage widths, pinned edge buttons, movable panels, stage-click collapse, and final-frame disable on `S-02`~`S-04`
- P9-M2 sorting-shell rollout batch 2 completed locally:
  - migrated `S-05 Quick Sort` and `S-06 Merge Sort` to the shared `WorkspaceShell`
  - preserved quick-sort pivot/hole/group semantics and merge-sort buffer + implementation-mode semantics inside the shared shell
  - local Playwright smoke at `1440x1100` confirmed `1416px` page/shell/stage widths, working control/step panels, `S-06` bottom-up mode switching, and final-frame disable on `S-05` / `S-06`
- P9-M2 search + linear shell rollout completed locally:
  - migrated `SR-01`, `L-02`, `L-03`, `L-04`, and `L-05` to the shared `WorkspaceShell`
  - aligned these routes to the same pinned-button / movable-panel / stage-first interaction contract and added shared-shell compatibility styling for linked/linear stages
  - fixed `L-04` stack auto-sync timing so visible push/pop intermediate steps are no longer skipped before completion
  - local Playwright smoke at `1440x1100` confirmed `1416px` page/shell/stage widths across `SR-01` / `L-02` / `L-03` / `L-04` / `L-05`, circular queue mode switching, resize playback progression, linked-list step progression, and stack `Next` progression after the timing fix
- P9-M3 cross-module consistency + acceptance closure completed locally:
  - refreshed Playwright acceptance artifacts/report for `/modules` + all 15 implemented routes under `output/playwright/p9m3-*`
  - fixed the final pilot breakout drift so `L-01` and `SR-02` now also use the wide `tree-page` workspace pattern
  - local Playwright acceptance at `1440x1100` confirmed:
    - `/modules`: `19` cards, `15` ready badges, `15` open links
    - all `15` implemented routes open without route-level runtime errors and advance on default `Next`
    - all non-tree routes keep `1416px` page / shell / stage widths
    - representative pinned-button + draggable-panel + stage-click-collapse checks pass on `S-01`, `SR-01`, `L-03`, `L-05`, `T-01`, and `T-02`
- P10 planning baseline completed locally:
  - added `docs/IMPLEMENTATION_PLAN_P10.md`
  - chose the next phase sequence as `AVL Tree -> Heap -> tree-track acceptance closure`
  - pushed the validated `P9` closure branch to `origin/feat/p9-m2-sorting-shell-rollout`
- P10-M1 `T-03 AVL Tree` completed locally:
  - added AVL insert + rebalance generator / timeline adapter / page / route
  - covered explicit `LL` / `LR` / `RR` / `RL` rotation teaching states with deterministic tests
  - marked `T-03` as implemented in module registry and localized zh/en UI copy
  - targeted Playwright smoke confirmed `/modules` shows `T-03` as `Ready`, `/modules/avl-tree` opens cleanly, and default `Next` advances from `0/11` to `1/11`
  - captured local smoke artifacts (`output/playwright/p10m1-modules-smoke.png`, `output/playwright/p10m1-avl-tree-smoke.png`)
- P10-M2 `T-04 Heap` completed locally:
  - added heap build / insert / extract-root generator + timeline adapter + page / route
  - kept tree view and array view synchronized from one deterministic heap snapshot model
  - marked `T-04` as implemented in module registry and localized zh/en UI copy
  - targeted Playwright smoke confirmed `/modules` shows `T-04` as `Ready`, `/modules/heap` opens cleanly, and default `Next` advances from `0/11` to `1/11`
  - captured local smoke artifacts (`output/playwright/p10m2-modules-smoke.png`, `output/playwright/p10m2-heap-smoke.png`)
- P10-M3 tree-track acceptance closure completed locally:
  - refreshed Playwright tree-track evidence under `output/playwright/p10m3-*`
  - `/modules` now verifies `19` cards, `17` ready badges, `17` open links, and `6` tree-filter cards
  - targeted smoke confirms `T-01` / `T-02` / `T-03` / `T-04` all open without console errors and default `Next` advances on all four routes
  - targeted shell checks confirm `T-03` / `T-04` open both `Controls` + `Step` panels and clicking the stage collapses them from `2 -> 0`
- P11 planning baseline completed locally:
  - added `docs/IMPLEMENTATION_PLAN_P11.md`
  - chose the next phase sequence as `Graph Representation -> DFS -> graph-track acceptance closure`
  - selected graph-track foundation over immediately continuing with `Trie` / `B-Tree / B+ Tree`
- P8-M1 tree onboarding + `T-01 Binary Tree Traversal` completed:
  - added `tree` category support in `/modules` filter + i18n labels
  - registered `T-01`~`T-06` in module registry (`T-01` implemented)
  - added `T-01` timeline/page/route (`/modules/binary-tree`) with four traversal modes
  - added deterministic tests (`binaryTreeTraversal.test.ts`, `binaryTreeTraversalTimelineReplay.test.ts`)
  - captured local Playwright smoke artifacts (`output/playwright/p8m1-modules-tree-filter.png`, `output/playwright/p8m1-t01-binary-tree-smoke.png`)
- P8-M2 `T-02 BST` completed:
  - added BST generator/timeline/page/route (`/modules/bst`) with `searchPath` / `insert` / `delete`
  - explicit delete-case timeline branches landed (`leaf` / `oneChild` / `twoChildren + successor`)
  - added deterministic tests (`bst.test.ts`, `bstTimelineReplay.test.ts`)
  - marked `T-02` as implemented in module registry
  - captured local Playwright smoke artifacts (`output/playwright/p8m2-modules-tree-filter.png`, `output/playwright/p8m2-t02-bst-smoke.png`)
- P8-M3 tree-track polish (completed):
  - `T-01` production route now uses the new single-stage shell (edge drawer + stage-first animation area + floating algorithm window)
  - `T-01` wide complete-tree spacing was rebalanced so large datasets keep distinct outer null hints and avoid near-vertical outer leaf-to-null edges
  - `T-01` added traversal output sequence panel and node value display toggle (`number`/`letter`)
  - preorder guide-step timing refined (arrival + D/L/R shown in one step)
  - binary-tree canvas route generation replaced: hardcoded sample-specific steps -> recursive rule-driven generator for arbitrary tree shapes (data/null/root rules)
  - binary-tree canvas route playback now draws progressively from root-top entry to end, with hidden future segments, dashed completed segments, line-end arrows, and a moving front arrow
  - data-node entry markers landed on route (`1` from up, `2` from left-down, `3` from right-down) and now reveal progressively with route drawing order
  - reusable rule spec added: `docs/modules/T-01-preorder-trace-rules.md`
  - `T-01` active trace arrowheads now anchor to terminal straight travel segments instead of whole composite paths, improving dashed-trace readability
  - `T-01` route-order overlay now numbers arrow-capable straight travel segments instead of mixed arc/path fragments
  - `T-01` recursive view now switches to mode-specific preorder/inorder/postorder pseudocode instead of generic conditional branches
  - `T-01` recursive panel now opens as a draggable, resizable floating window so the traversal canvas keeps full width
  - `T-01` floating recursion panel now includes an in-panel tip recommending single-step playback for clearer recursion/animation comparison
  - `T-01` floating panel wording is now promoted to a generic algorithm window instead of recursion-only wording
  - `T-01` level-order mode now hides null children in the main stage and uses a level-by-level threading trace that only connects real nodes
  - `T-01` level-order algorithm window now opens correctly and shows queue-state playback plus queue-specific pseudocode
  - `T-01` level-order algorithm window now separates current dequeue / action summary / waiting queue, and keeps the waiting queue on one horizontal lane with new-enqueue highlighting
  - `T-01` floating algorithm window now keeps edge/corner resizing effective even when the popup starts flush against the viewport boundary
  - `T-01` floating algorithm window no longer stops at a hardcoded `560x760`; it can now grow up to the viewport-safe bounds
  - `T-01` level-order root-enqueue step now immediately animates the root-entry trace and marks the just-enqueued root on the main stage instead of lagging until visit
  - `T-01` level-order visit steps now also mark newly enqueued child nodes on the main stage with a queue-matched pulse/badge so they visually echo the queue-side `New` chips
  - `T-01` level-order root-to-left-child route now uses a wider outer root arc plus an upper-left offset line, and the top entry line now lands on that same outer arc radius so the root-side connector no longer masquerades as a straight line behind the node
- `T-01` preorder trace rules are now shared between playground and formal page; formal guide rendering follows the canonical absolute-left/right data/null/root rules
  - captured visual checkpoint artifact (`output/playwright/p8m3-t01-traversal-sequence-letter.png`)
  - browser-side Playwright verification confirms the traversal canvas keeps its width when the floating recursion window opens, and the window can be dragged/resized at `1280x720`
  - browser-side Playwright verification confirms level-order mode shows `0` null nodes / null-legend entries, the algorithm window opens, and the queue panel updates after stepping
  - script-level validation confirms right/bottom-edge resize now expands by shifting the popup inward when needed, and `enqueueRoot` now emits an active root-entry trace segment before the first dequeue/visit step
- P8-M3 tree consistency + acceptance closure completed:
  - `T-01` / `T-02` now share the accepted tree workspace shell with pinned edge buttons, draggable control/step panels, stage-click collapse, and focus-aware auto-avoid
  - refreshed Playwright acceptance artifacts for `/modules` + all 15 implemented routes under `output/playwright/p8m3-*.png`
  - added local smoke / acceptance evidence:
    - `output/playwright/p8m3-runtime-smoke.txt`
    - `output/playwright/p8m3-acceptance-report.txt`
- P7-M3 sorting consistency/acceptance closure completed:
  - refreshed Playwright screenshots for `/modules` + all implemented module routes (`output/playwright/p7m3-*.png`)
  - added acceptance report `output/playwright/p7m3-acceptance-report.txt`
- P6-M2 local browser walkthrough captured for `S-04` (`output/playwright/p6m2-shell-sort.png`)
- P6-M3 discovery + acceptance refresh completed:
  - refreshed Playwright screenshots for `/modules` + all implemented module routes (`output/playwright/p6m3-*.png`)
  - added acceptance report `output/playwright/p6m3-acceptance-report.txt`
- `/modules` page upgraded with category filters, module cards, and implemented/pending route-safe actions
- `S-02 Selection Sort` module landed with timeline playback + deterministic tests
- `L-04 Stack` module landed with timeline playback + JSON import/export + deterministic tests
- `L-05 Queue` module landed with timeline playback + JSON import/export + deterministic tests
- `L-02 Dynamic Array` module landed with resize-focused timeline playback + JSON import/export + deterministic tests
- `S-01`/`S-02`/`S-03`/`S-04` sorting visuals received focused UX iteration:
  - swap/shift animation semantics aligned toward temp/hole choreography
  - default dataset size and preset controls aligned
  - sorted persistence + finale polish + index rows aligned across `S-01`~`S-04`
- P4-M3 consistency pass closed:
  - S-01/S-02 playback status/step display aligned with linear modules
  - L-03/L-05 status block layout stabilized to reduce page jitter
  - L-05 circular queue runtime hardening added (no app crash on full enqueue path)
  - L-05 circular queue ring pointer positioning refined (F outer / R inner toward ring center)
  - auto-randomized insert/push/enqueue value flow aligned across L-01/L-02/L-03(insertAt)/L-04/L-05
  - Playwright acceptance artifacts refreshed for all implemented modules (`output/playwright/p4m3-*.png` + `p4m3-acceptance-report.txt`)
  - L-02 capacity-full warning switched to status-style warning semantics (avoid error-style false signal)

## 3) Next Priority

- Close the validated planning baseline with one focused commit on:
  - current branch: `docs/post-p10-plan`
  - keep unrelated dirty files out of the commit (`scripts/*`, design artifacts, legacy screenshots, launcher helper)
- Then start `P11-M1` on a fresh feature branch:
  - recommended branch: `feat/p11-m1-graph-representation`
  - keep the WSL repo as the active source of truth; do not resume the older Windows copy unless a session explicitly wants read-only comparison
  - add graph category discovery wiring plus `G-01 Graph Representation`
  - reuse the accepted shared workspace shell and avoid reopening broad shell redesign unless graph rendering exposes a concrete gap
- Keep quality gates unchanged:
  - meaningful code changes: `npm run check`
  - docs-only changes: `./scripts/check-doc-links.sh`

## 4) Guardrails

- Source of truth docs:
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Do not skip branch workflow (`docs/*`, `feat/*`)
- Avoid editing unrelated files in the same branch

## 5) Quick Start Commands

```bash
git fetch
git switch main
git pull
npm install
npm run dev
```

## 6) Session Kickoff Prompt (Copy/Paste)

```text
Read docs/SESSION_BRIEF.md, docs/HANDOFF.md, docs/DECISIONS.md, and TODO.md first.
Then continue with the next priority only.
Before coding, restate scope and acceptance criteria in 3-5 bullets.
After coding, run npm run check and summarize file-level changes.
```

## 7) Update Rule

Update this file when any of the following changes:
- current phase/milestone
- default active branch
- next priority
- required quality gate commands
