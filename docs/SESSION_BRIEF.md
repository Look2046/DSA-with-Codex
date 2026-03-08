# SESSION_BRIEF

Use this file as the first thing to read in a new chat/session.

## 1) Current Snapshot

- Project: Data Structure Algorithm Visualizor
- Active branch (expected): `feat/p8-m2-bst` (P8-M3 polish work in progress)
- Current phase: P8-M3 in progress (tree consistency + acceptance closure)
- Last local quality gate: `npm run check` (passed, 2026-03-09)

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
- P8-M3 tree-track polish (in progress):
  - `T-01` added traversal output sequence panel and node value display toggle (`number`/`letter`)
  - preorder guide-step timing refined (arrival + D/L/R shown in one step)
  - captured visual checkpoint artifact (`output/playwright/p8m3-t01-traversal-sequence-letter.png`)
  - known carry-over issue: dashed traversal trace style currently has arrowhead visibility regression
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

- Continue P8-M3 (tree consistency + acceptance refresh):
  - fix `T-01` traversal trace arrowhead visibility and continue dashed style beautification
  - optionally evaluate a lightweight hand-drawn path library if native SVG styling cannot reach target quality
  - align `T-01`/`T-02` controls, legend semantics, and status layout
  - refresh Playwright acceptance artifacts for `/modules` + all implemented routes
  - sync closure docs (`SESSION_BRIEF`/`HANDOFF`/`DECISIONS`/`TODO`)
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
