# IMPLEMENTATION_PLAN_P8

Status: proposed for execution
Branch model: `docs/*` for planning sync, `feat/*` per implementation milestone
Primary goal: start tree-track delivery with the same timeline-engine, deterministic testing, and acceptance discipline used in P5~P7

## Scope

P8-1: Tree category onboarding + `T-01 Binary Tree Traversal`
- add `tree` category to module discovery/filter model and i18n labels
- register tree modules (`T-01`~`T-06`) in module registry with route-safe implemented/pending states
- deliver `T-01` step generator + timeline adapter + page route (`/modules/binary-tree`)
- support traversal modes: preorder / inorder / postorder / level-order
- add deterministic step/replay tests and zh/en copy

P8-2: `T-02 Binary Search Tree (BST)`
- deliver BST core operations with timeline semantics: `searchPath`, `insert`, `delete`
- explicit delete-case animations: leaf / one-child / two-children (successor replacement)
- add page route (`/modules/bst`) with operation controls + validation
- add deterministic step/replay tests and zh/en copy

P8-3: Tree-track consistency + acceptance closure
- align `T-01`/`T-02` controls, status lines, legends, and stage behavior
- refresh Playwright acceptance artifacts/report for `/modules` + all implemented routes
- sync closure docs (`SESSION_BRIEF`/`HANDOFF`/`DECISIONS`/`TODO`)

Out of scope
- AVL/Heap/B-Tree/Trie implementation (`T-03`~`T-06`)
- graph-track modules (`G-*`)
- backend persistence/accounts

## Milestones

### P8-M1 Tree onboarding + T-01

Deliverables
- `tree` category support in module discovery (filters + labels)
- module registry entries for `T-01`~`T-06` (only `T-01` implemented=true)
- `T-01` generator + timeline adapter + page + route wiring
- deterministic tests for traversal order and replay stability

Concrete tasks
- add `src/modules/tree/binaryTreeTraversal.ts`
- add `src/modules/tree/binaryTreeTraversalTimelineAdapter.ts`
- add `src/pages/modules/BinaryTreeTraversalPage.tsx`
- wire route `/modules/binary-tree` in router + registry + translations
- add tests: `binaryTreeTraversal.test.ts`, `binaryTreeTraversalTimelineReplay.test.ts`

DoD
- all four traversal orders produce deterministic step sequence on fixed input
- page playback controls work with no runtime error
- `/modules` can filter/select tree category safely

Acceptance
- `npm run check` passes
- local smoke evidence: `/modules -> T-01 -> play/pause/next/reset`

### P8-M2 T-02 BST

Deliverables
- BST generator + timeline adapter + page + route (`/modules/bst`)
- operation controls for insert/find/delete with input validation
- deterministic tests (step generation + replay)

Concrete tasks
- add `src/modules/tree/bst.ts`
- add `src/modules/tree/bstTimelineAdapter.ts`
- add `src/pages/modules/BstPage.tsx`
- wire route `/modules/bst` and registry status (`T-02` implemented=true)
- add tests: `bst.test.ts`, `bstTimelineReplay.test.ts`

DoD
- insert/find/delete deterministic on fixed input
- delete 3 cases are represented explicitly in timeline steps
- page-level invalid input handled with user-facing validation feedback

Acceptance
- `npm run check` passes
- local smoke evidence: `/modules -> T-02 -> replay/reset`

### P8-M3 Tree consistency + acceptance refresh

Deliverables
- tree-module consistency pass (`T-01`/`T-02`)
- refreshed Playwright artifacts/report for all implemented modules (`output/playwright/p8m3-*.png` + report)
- docs closure sync

Concrete tasks
- align T-01/T-02 controls and status layout with existing module conventions
- run full-route smoke capture (`/modules` + implemented routes)
- produce `output/playwright/p8m3-acceptance-report.txt`
- update `SESSION_BRIEF`/`HANDOFF`/`DECISIONS`/`TODO`

DoD
- no dead-end navigation for tree routes
- route/runtime smoke checks pass on all implemented routes
- closure docs and artifacts are internally consistent

Acceptance
- `npm run check` passes
- Playwright artifacts and report updated under `output/playwright/`

## Suggested Task Breakdown

1. Land P8-M1 registry/category wiring + T-01 module + tests
2. Land P8-M2 BST module + tests
3. Land P8-M3 consistency pass + full acceptance refresh + docs closure

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: tree node layout/edge rendering complexity increases UI instability
  - Mitigation: start with deterministic static layout strategy in T-01 before adding BST mutation complexity
- Risk: BST delete-case animations become hard to reason about
  - Mitigation: encode delete cases as explicit step actions and test each case deterministically
- Risk: category expansion (`tree`) causes discovery/filter regressions
  - Mitigation: add module-page utils tests and Playwright `/modules` discovery checks in P8-M1/P8-M3
