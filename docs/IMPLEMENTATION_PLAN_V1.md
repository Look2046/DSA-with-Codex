# IMPLEMENTATION_PLAN_V1

Status: draft for execution
Branch model: feature branches -> review -> merge to `main`

## V1 Target

Deliver a runnable frontend skeleton plus first algorithm visualization module with stable architecture.

## Scope (Recommended)

P0 modules:
- S-01 Bubble Sort (`/modules/bubble-sort`)
- L-01 Array (`/modules/array`)
- L-03 Linked List (`/modules/linked-list`)

P0 pages:
- `/`
- `/modules`
- `/modules/bubble-sort`
- `/modules/array`
- `/modules/linked-list`
- `/modules/sorting` (auxiliary)
- `/about` (auxiliary)
- `*` (404)

Out of V1:
- user auth/account system
- backend persistence and production API
- large module expansion beyond initial P0

## Milestones

### M0 - Project Scaffold

Deliverables:
- initialize frontend project
- routing shell and layout skeleton
- placeholder pages for all P0 routes

Exit criteria:
- app runs locally
- route navigation works
- no broken imports

### M1 - Runtime Foundations

Deliverables:
- base types (`AnimationStep`, module metadata)
- minimal store setup (current module, playback state)
- shared UI controls skeleton

Exit criteria:
- state updates observable in UI
- page refresh does not break basic navigation

### M2 - First Vertical Slice (S-01)

Deliverables:
- bubble sort step generator
- array visualizer with step playback
- code/pseudocode highlighting sync (minimal)

Exit criteria:
- play/pause/step works for sample input
- first/last step deterministic

### M3 - Quality Gates

Deliverables:
- lint + test commands wired
- docs link check in routine
- minimal CI-ready script set

Exit criteria:
- local checks pass consistently
- branch merge checklist executable

## Initial File Plan (Scaffold)

- `src/app/router.tsx` - route registration
- `src/app/layout/Layout.tsx` - app frame
- `src/pages/*` - top-level pages
- `src/data/moduleRegistry.ts` - module metadata source
- `src/types/animation.ts` - animation contracts
- `src/store/*` - app/playback store
- `src/modules/sorting/bubbleSort.ts` - first algorithm steps
- `src/components/visualizers/ArrayVisualizer.tsx` - first visualizer

## Merge Checklist (Per Branch)

- [ ] Scope aligns with current milestone only
- [ ] `./scripts/check-doc-links.sh` passes
- [ ] lint/test pass (after scaffold)
- [ ] `docs/HANDOFF.md` updated with next action
- [ ] `TODO.md` and `docs/DECISIONS.md` updated as needed

## First Execution Order

1. Complete `PRE_CODE_CHECKLIST` Go/No-Go items.
2. Create branch `feat/m0-scaffold`.
3. Finish M0 only and merge.
4. Create branch `feat/m1-runtime-foundations`.
5. Continue milestone-by-milestone.

