# IMPLEMENTATION_PLAN_P14

Status: planning baseline accepted locally on `feat/p14-backlog-wave`; target is to close the final 9 backlog modules and complete the original 42-module blueprint.
Branch model: `docs/*` for planning sync, `feat/*` per implementation milestone.

## Scope

P14-1: sorting backlog closure
- add `S-08 Counting Sort`
- add `S-09 Radix Sort`
- add `S-10 Bucket Sort`
- add `S-11 Sorting Race`
- keep the accepted sorting shell contract and deterministic replay coverage

P14-2: algorithm-paradigm track opening
- add a new `paradigm` discovery category for concept/technique modules
- land `P-01 Divide & Conquer`
- land `P-02 Dynamic Programming`
- land `P-03 Greedy`
- land `P-04 Backtracking`
- land `P-05 Union-Find`

P14-3: blueprint closure
- refresh `/modules` discovery so the original 42-module blueprint is fully ready
- keep one-off standalone/offline export work outside the mainline roadmap unless explicitly reopened

## Milestones

### P14-M0 Planning baseline + category expansion

Deliverables
- `docs/IMPLEMENTATION_PLAN_P14.md`
- sync `docs/SESSION_BRIEF.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, and `TODO.md`
- introduce the new `paradigm` category in the runtime type/filter plan

Acceptance
- planning docs agree that `P14` is now the active wave
- the remaining 9 backlog items are moved from long-term backlog into executable milestones

### P14-M1 Add `S-08` / `S-09`

Deliverables
- `src/modules/sorting/countingSort.ts`
- `src/modules/sorting/countingTimelineAdapter.ts`
- `src/modules/sorting/countingSort.test.ts`
- `src/modules/sorting/countingTimelineReplay.test.ts`
- `src/pages/modules/CountingSortPage.tsx`
- `src/modules/sorting/radixSort.ts`
- `src/modules/sorting/radixTimelineAdapter.ts`
- `src/modules/sorting/radixSort.test.ts`
- `src/modules/sorting/radixTimelineReplay.test.ts`
- `src/pages/modules/RadixSortPage.tsx`
- shared route/registry/i18n/style wiring

Acceptance
- `npm run check` passes
- targeted Playwright smoke confirms the sort filter includes both new routes and both routes advance on default `Next`

### P14-M2 Add `S-10` / `S-11`

Deliverables
- `src/modules/sorting/bucketSort.ts`
- `src/modules/sorting/bucketTimelineAdapter.ts`
- `src/modules/sorting/bucketSort.test.ts`
- `src/modules/sorting/bucketTimelineReplay.test.ts`
- `src/pages/modules/BucketSortPage.tsx`
- `src/modules/sorting/sortingRace.ts`
- `src/modules/sorting/sortingRaceTimelineAdapter.ts`
- `src/modules/sorting/sortingRace.test.ts`
- `src/modules/sorting/sortingRaceTimelineReplay.test.ts`
- `src/pages/modules/SortingRacePage.tsx`
- shared route/registry/i18n/style wiring

Acceptance
- `npm run check` passes
- targeted Playwright smoke confirms `/modules?category=sort` shows all 11 sorting modules as ready/open

### P14-M3 Add `P-01` / `P-02` / `P-03`

Deliverables
- `src/modules/paradigm/divideConquer.ts`
- `src/modules/paradigm/divideConquerTimelineAdapter.ts`
- `src/modules/paradigm/divideConquer.test.ts`
- `src/modules/paradigm/divideConquerTimelineReplay.test.ts`
- `src/pages/modules/DivideConquerPage.tsx`
- `src/modules/paradigm/dynamicProgramming.ts`
- `src/modules/paradigm/dynamicProgrammingTimelineAdapter.ts`
- `src/modules/paradigm/dynamicProgramming.test.ts`
- `src/modules/paradigm/dynamicProgrammingTimelineReplay.test.ts`
- `src/pages/modules/DynamicProgrammingPage.tsx`
- `src/modules/paradigm/greedy.ts`
- `src/modules/paradigm/greedyTimelineAdapter.ts`
- `src/modules/paradigm/greedy.test.ts`
- `src/modules/paradigm/greedyTimelineReplay.test.ts`
- `src/pages/modules/GreedyPage.tsx`
- shared category/runtime/i18n/style wiring

Acceptance
- `npm run check` passes
- targeted Playwright smoke confirms `/modules?category=paradigm` shows the first 3 paradigm routes as ready/open

### P14-M4 Add `P-04` / `P-05`

Deliverables
- `src/modules/paradigm/backtracking.ts`
- `src/modules/paradigm/backtrackingTimelineAdapter.ts`
- `src/modules/paradigm/backtracking.test.ts`
- `src/modules/paradigm/backtrackingTimelineReplay.test.ts`
- `src/pages/modules/BacktrackingPage.tsx`
- `src/modules/paradigm/unionFind.ts`
- `src/modules/paradigm/unionFindTimelineAdapter.ts`
- `src/modules/paradigm/unionFind.test.ts`
- `src/modules/paradigm/unionFindTimelineReplay.test.ts`
- `src/pages/modules/UnionFindPage.tsx`
- shared category/runtime/i18n/style wiring

Acceptance
- `npm run check` passes
- targeted Playwright smoke confirms `/modules?category=paradigm` shows all 5 paradigm routes as ready/open

### P14-M5 Original blueprint closure refresh

Deliverables
- refreshed `docs/HANDOFF.md`, `docs/SESSION_BRIEF.md`, `docs/DECISIONS.md`, and `TODO.md`
- refreshed Playwright evidence for `/modules`, `/modules?category=sort`, and `/modules?category=paradigm`

Acceptance
- `npm run check` passes
- targeted Playwright smoke confirms:
  - `/modules`: `42` cards, `42` ready badges, `42` open links
  - `/modules?category=sort`: `11` cards, `11` ready badges, `11` open links
  - `/modules?category=paradigm`: `5` cards, `5` ready badges, `5` open links

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`
