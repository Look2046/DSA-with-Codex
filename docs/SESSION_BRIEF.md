# SESSION_BRIEF

Use this file as the first thing to read in a new chat/session.

## 1) Current Snapshot

- Project: Data Structure Algorithm Visualizor
- Active branch (expected): `feat/p9-m1-workspace-shell-pilots`
- Current phase: `P9-M1` workspace-shell foundation completed locally; `P9-M2` rollout is next
- Last local quality gate: `npm run check` (passed locally, 2026-04-06)

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
- P9-M1 workspace-shell foundation + pilot migrations completed locally:
  - added shared `WorkspaceShell` component for the validated stage-first shell contract
  - migrated `S-01 Bubble Sort`, `L-01 Array`, and `SR-02 Binary Search`
  - moved pilot-page legend/pseudocode/runtime detail into the right `Step` panel where appropriate
  - refreshed local Playwright smoke artifacts under `output/playwright/p9m1-*`
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

- Start P9-M2 rollout across remaining implemented non-tree modules:
  - keep the WSL repo as the active source of truth; do not resume the older Windows copy unless a session explicitly wants read-only comparison
  - preserve `WorkspaceShell` as the shared interaction contract instead of copying page-specific markup again
  - migrate the remaining implemented non-tree pages by family batch (`sorting`, `linear`, `search`)
  - keep tree pages behaviorally unchanged unless a compatibility fix is required
  - finish with a consistency sweep before `P9-M3` acceptance refresh
- Keep quality gates and acceptance workflow unchanged (`npm run check` + milestone-level Playwright refresh).

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
