# IMPLEMENTATION_PLAN_P10

Status: `P10` planning baseline completed locally; `P10-M1` next
Branch model: `docs/*` for planning sync, `feat/*` per implementation milestone
Primary goal: resume new algorithm delivery on top of the accepted shared workspace shell by expanding the tree track with `AVL Tree` and `Heap`, then close with a refreshed tree-focused acceptance sweep

## Scope

P10-1: `T-03 AVL Tree`
- add the first self-balancing BST module on top of the accepted tree workspace shell
- focus the first iteration on insert-driven balancing so the core teaching value stays on balance factors and rotation cases
- visualize LL / LR / RR / RL rebalance semantics clearly and deterministically

P10-2: `T-04 Heap`
- add a heap fundamentals module using the shared workspace shell
- focus the first iteration on max-heap mental model and the relationship between tree structure and array storage
- cover build / insert / extract-root style operations with deterministic playback

P10-3: tree-track consistency + acceptance closure
- refresh discovery and acceptance evidence after `T-03` / `T-04`
- verify the new tree pages still feel like one product with `T-01` / `T-02`
- sync closure docs once artifacts and quality gates are complete

Out of scope
- `T-05 B-Tree / B+ Tree` during `P10`
- `T-06 Trie` during `P10`
- redesigning the accepted shared workspace shell again before a concrete tree-module need appears
- home/about page redesign

## Milestones

### P10-M1 Add `T-03 AVL Tree`

Deliverables
- `T-03` page/route/registry implementation for AVL insert + rebalance walkthrough
- deterministic step generator / timeline adapter / tests
- localized UI copy and runtime explanation for balance factor + rotation semantics

DoD
- `T-03` uses the accepted tree workspace shell contract
- insert playback clearly shows imbalance detection and the resulting LL / LR / RR / RL rotation path
- the resulting tree remains AVL-valid after the demonstrated operations

Acceptance
- `npm run check` passes
- deterministic fixed-input replay confirms the expected rotation outcome on representative cases
- targeted Playwright smoke confirms `/modules/avl-tree` opens and basic playback is stable

### P10-M2 Add `T-04 Heap`

Deliverables
- `T-04` page/route/registry implementation for max-heap fundamentals
- deterministic step generator / timeline adapter / tests
- clear dual representation between heap tree shape and backing array

DoD
- `T-04` uses the accepted tree workspace shell contract
- playback clearly shows sift-up / sift-down semantics
- heap property remains valid after each demonstrated operation

Acceptance
- `npm run check` passes
- deterministic fixed-input replay confirms build / insert / extract-root behavior
- targeted Playwright smoke confirms `/modules/heap` opens and basic playback is stable

### P10-M3 Tree-Track Acceptance Closure

Deliverables
- refreshed Playwright acceptance artifacts/report after `T-03` / `T-04`
- updated discovery expectations for the expanded tree category
- closure docs sync

DoD
- `/modules` clearly shows the expanded tree track without dead-end confusion
- `T-01`~`T-04` feel like one cohesive product under the shared shell
- docs and artifact references are internally consistent

Acceptance
- `npm run check` passes
- Playwright artifacts/report updated under `output/playwright/`

## Suggested Task Breakdown

1. Land AVL insert + rebalance module first
2. Land heap fundamentals second
3. Refresh full acceptance evidence and close the tree-track expansion milestone

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: AVL delete + insert + search together would make the first balancing milestone too broad
  - Mitigation: keep `P10-M1` insert-focused and prove rotation teaching value first
- Risk: heap tree view and array view may drift semantically during animation
  - Mitigation: derive both from one deterministic heap snapshot model and test replay stability directly
- Risk: after `P9`, renewed tree delivery could quietly reintroduce shell divergence
  - Mitigation: treat the shared shell as fixed infrastructure unless a concrete tree-module need justifies a documented exception
