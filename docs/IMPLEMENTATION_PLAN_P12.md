# IMPLEMENTATION_PLAN_P12

Status: `P12-M1` accepted locally; next in sequence is `P12-M2` `G-03 BFS`
Branch model: `docs/*` for planning sync, `feat/*` per implementation milestone
Primary goal: expand the product from the current 19 implemented modules toward the original 42-module blueprint by prioritizing hash-table foundations, deeper graph coverage, one heap-derived sorting extension, and the first string-algorithm module

## Scope

P12-1: `H-01 Hash Table - Chaining` + `H-02 Hash Table - Open Addressing`
- add the `hash` category to discovery, registry, filters, and zh/en i18n
- teach collision handling through two concrete resolution strategies instead of one abstract hash-table page
- keep the first hash wave focused on insert/search/delete, collision progression, and occupancy/load-factor feedback

P12-2: `G-03 BFS`
- build directly on the accepted `G-01` / `G-02` graph preset foundation
- focus on queue expansion, level-order traversal, and visited/frontier progression
- keep playback deterministic on a fixed graph dataset

P12-3: weighted shortest-path expansion
- `G-04 Dijkstra`
- `G-05 Bellman-Ford`
- `G-06 Floyd-Warshall`
- teach the shortest-path family as one coherent follow-up wave instead of isolated one-off pages

P12-4: minimum-spanning-tree expansion
- `G-07 Kruskal`
- `G-08 Prim`
- reuse the graph stage foundation and make edge selection / set growth semantics explicit

P12-5: cross-category extensions
- `S-07 Heap Sort`
- `ST-01 KMP`
- use `S-07` to extend the current sorting track through the already-landed heap mental model
- use `ST-01` to open the first string-algorithm track with prefix-table / mismatch-shift teaching

P12-6: acceptance closure
- refresh discovery and acceptance evidence after the new near-term modules land
- verify the newly added hash / graph / string pages still feel like one product under the accepted shell contract
- sync closure docs once quality gates and artifacts are complete

Out of scope
- `T-05 B-Tree / B+ Tree` during `P12`
- `T-06 Trie` during `P12`
- `G-09 Topological Sort` during `P12`
- `S-08 Counting Sort`, `S-09 Radix Sort`, `S-10 Bucket Sort`, and `S-11 Sorting Race` during `P12`
- `ST-02 Rabin-Karp` during `P12`
- `P-01` ~ `P-05` classic-paradigm modules during `P12`
- broad shell redesign before a concrete new-module need appears

## Milestones

### P12-M1 Add `H-01` / `H-02` Hash Modules

Deliverables
- `hash` category support in discovery / registry / i18n
- `H-01` chaining page/route/registry implementation
- `H-02` open-addressing page/route/registry implementation
- deterministic step generators / timeline adapters / tests for both collision strategies

DoD
- `/modules` exposes the new `hash` category without dead-end confusion
- chaining vs open-addressing tradeoffs are visibly distinct in the stage and step panel
- playback clearly shows collision handling and bucket/probe progression

Acceptance
- `npm run check` passes
- deterministic replay confirms the same fixed input produces the same collision path
- targeted Playwright smoke confirms both hash routes open and basic playback is stable

Accepted locally (2026-04-19)
- `/modules?category=hash`: `2` cards, `2` ready badges, `2` open links
- `/modules/hash-chaining`: opens cleanly, default `Next` advances `0/11 -> 1/11`, console errors = `0`
- `/modules/hash-open-addressing`: opens cleanly, default `Next` advances `0/21 -> 1/21`, console errors = `0`
- evidence saved under `output/playwright/p12m1-*`

### P12-M2 Add `G-03 BFS`

Deliverables
- `G-03` page/route/registry implementation
- deterministic BFS step generator / timeline adapter / tests
- localized UI copy for queue, frontier, level progression, and visit order

DoD
- `G-03` uses the accepted shared workspace shell contract
- playback clearly shows enqueue/dequeue order and level expansion
- traversal order remains deterministic on the fixed graph dataset

Acceptance
- `npm run check` passes
- deterministic replay confirms the expected BFS order
- targeted Playwright smoke confirms `/modules/bfs` opens and basic playback is stable

### P12-M3 Add Weighted Shortest-Path Modules

Deliverables
- `G-04 Dijkstra`
- `G-05 Bellman-Ford`
- `G-06 Floyd-Warshall`
- deterministic tests and localized UI copy for distance-table / relaxation semantics

DoD
- each module makes its update rule explicit instead of only animating final answers
- weighted-edge semantics remain readable on the shared graph stage
- route / registry / i18n wiring stays internally consistent

Acceptance
- `npm run check` passes
- deterministic replay confirms expected distance-table progression on fixed datasets
- targeted Playwright smoke confirms all three routes open and advance on default `Next`

### P12-M4 Add MST Modules

Deliverables
- `G-07 Kruskal`
- `G-08 Prim`
- deterministic tests and localized UI copy for chosen-edge / rejected-edge / partial-tree semantics

DoD
- Kruskal clearly shows edge ordering and component merging
- Prim clearly shows frontier growth from the current tree
- both modules remain deterministic on fixed weighted graph presets

Acceptance
- `npm run check` passes
- deterministic replay confirms expected MST edge selection
- targeted Playwright smoke confirms both routes open and basic playback is stable

### P12-M5 Add `S-07 Heap Sort` and `ST-01 KMP`

Deliverables
- `S-07` page/route/registry implementation
- `ST-01` page/route/registry implementation
- string-category discovery/i18n support for `ST-01`
- deterministic tests and localized UI copy

DoD
- `S-07` clearly connects heap construction, root extraction, and sorted suffix growth
- `ST-01` clearly explains prefix-table construction, mismatch fallback, and pattern shift progression
- both modules fit the current workspace-shell teaching contract without ad-hoc shell exceptions

Acceptance
- `npm run check` passes
- deterministic replay confirms expected sort / pattern-match progression
- targeted Playwright smoke confirms both routes open and basic playback is stable

### P12-M6 Near-Term Wave Acceptance Closure

Deliverables
- refreshed Playwright acceptance artifacts/report after the full near-term module wave
- updated discovery expectations for the new categories and routes
- closure docs sync

DoD
- `/modules` clearly exposes the newly expanded near-term teaching surface
- the new hash / graph / string pages feel cohesive under the shared shell
- docs and artifact references are internally consistent

Acceptance
- `npm run check` passes
- Playwright artifacts/report updated under `output/playwright/`

## Long-Term Backlog After P12

- `T-05 B-Tree / B+ Tree`
- `T-06 Trie`
- `G-09 Topological Sort`
- `S-08 Counting Sort`
- `S-09 Radix Sort`
- `S-10 Bucket Sort`
- `S-11 Sorting Race`
- `ST-02 Rabin-Karp`
- `P-01 Divide & Conquer`
- `P-02 Dynamic Programming`
- `P-03 Greedy`
- `P-04 Backtracking`
- `P-05 Union-Find`

## Suggested Task Breakdown

1. land docs planning sync for `P12`
2. start `H-01` / `H-02` on a fresh implementation branch
3. continue the graph wave from `BFS` into shortest-path modules, then MST modules
4. close the near-term wave with `S-07`, `ST-01`, and one focused acceptance refresh

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: opening both hash and string categories in one planning wave may widen the surface area too quickly
  - Mitigation: keep the actual execution order sequential, starting from hash foundations and only opening the string track after the graph wave is stable
- Risk: weighted graph algorithms may drift into page-specific UI exceptions
  - Mitigation: treat the shared workspace shell as fixed infrastructure unless a concrete graph-stage gap appears
- Risk: `S-07 Heap Sort` may feel redundant after `T-04 Heap`
  - Mitigation: frame `S-07` around the sorting workflow and sorted-suffix growth, not just the heap data structure itself
- Risk: deferring `Trie` / `B-Tree` / paradigm modules may leave the 42-module blueprint visibly incomplete for longer
  - Mitigation: keep the long-term backlog explicit in planning docs instead of letting those modules silently disappear from scope
