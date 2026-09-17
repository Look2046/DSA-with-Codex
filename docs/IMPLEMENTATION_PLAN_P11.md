# IMPLEMENTATION_PLAN_P11

Status: `P11` completed locally
Branch model: `docs/*` for planning sync, `feat/*` per implementation milestone
Primary goal: start the graph track on top of the accepted shared workspace shell by adding graph discovery/category wiring plus the first two graph modules, then close with a focused graph-baseline acceptance sweep

## Scope

P11-1: `G-01 Graph Representation`
- add graph discovery/category wiring in `/modules`
- implement the first graph module with one deterministic graph model and dual representation between adjacency list and adjacency matrix
- validate that the current shared workspace shell can host node/edge-driven stages without reopening broad shell redesign

P11-2: `G-02 DFS`
- add a DFS teaching module on top of the new graph baseline
- focus the first iteration on visited-state progression, stack/backtrack semantics, and traversal order
- keep playback deterministic on a fixed graph dataset

P11-3: graph-track consistency + acceptance closure
- refresh discovery and acceptance evidence after `G-01` / `G-02`
- verify the new graph pages still feel like one product with the accepted workspace shell
- sync closure docs once artifacts and quality gates are complete

Out of scope
- `G-03 BFS` and weighted shortest-path / MST algorithms during `P11`
- `T-05 B-Tree / B+ Tree` during `P11`
- `T-06 Trie` during `P11`
- redesigning the accepted shared workspace shell before a concrete graph-module need appears

## Milestones

### P11-M1 Add `G-01 Graph Representation`

Deliverables
- graph category support in discovery / registry / i18n
- `G-01` page/route/registry implementation for adjacency list vs adjacency matrix teaching
- deterministic graph dataset / step generator / tests

DoD
- `/modules` exposes the new graph category without dead-end confusion
- `G-01` uses the accepted shared workspace shell contract
- the same graph dataset drives both visual representations

Acceptance
- `npm run check` passes
- deterministic fixed-input replay confirms list/matrix state stays synchronized
- targeted Playwright smoke confirms `/modules/graph-representation` opens and basic playback is stable

Done (2026-04-07)
- added graph category discovery wiring in `/modules`, registry, route list, and zh/en i18n
- implemented `G-01` on the shared `WorkspaceShell` with one deterministic graph model driving graph canvas + adjacency list + adjacency matrix
- landed deterministic tests plus replay coverage:
  - `src/modules/graph/graphRepresentation.test.ts`
  - `src/modules/graph/graphRepresentationTimelineReplay.test.ts`
- local `npm run check` passed
- targeted Playwright smoke confirmed:
  - `/modules`: `21` cards, `18` ready badges, `18` open links
  - graph filter shows `2` cards and `1` live open link
  - `/modules/graph-representation` opens cleanly, default `Next` advances `0/20 -> 1/20`, panels open/collapse correctly, and console errors = `0`
- artifacts captured:
  - `output/playwright/p11m1-modules-smoke.png`
  - `output/playwright/p11m1-modules-graph-filter.png`
  - `output/playwright/p11m1-graph-representation-panels.png`
  - `output/playwright/p11m1-graph-representation-smoke.png`
  - `output/playwright/p11m1-smoke-report.txt`

### P11-M2 Add `G-02 DFS`

Deliverables
- `G-02` page/route/registry implementation for DFS traversal walkthrough
- deterministic step generator / timeline adapter / tests
- localized UI copy for traversal state, recursion/stack progression, and visit order

DoD
- `G-02` uses the accepted shared workspace shell contract
- playback clearly shows current node, visited set, and backtracking
- traversal order remains deterministic on the fixed graph dataset

Acceptance
- `npm run check` passes
- deterministic replay confirms the expected DFS order
- targeted Playwright smoke confirms `/modules/dfs` opens and basic playback is stable

Done (2026-04-07)
- added deterministic DFS step generation, timeline adapter, route, page, and replay coverage:
  - `src/modules/graph/dfs.ts`
  - `src/modules/graph/dfsTimelineAdapter.ts`
  - `src/modules/graph/dfs.test.ts`
  - `src/modules/graph/dfsTimelineReplay.test.ts`
- implemented `G-02` on the shared `WorkspaceShell` with explicit stack progression, neighbor inspection, visit order, and backtrack state on the shared graph stage
- marked `G-02` as implemented in the registry and added zh/en UI copy plus graph-track styling support
- local `npm run check` passed
- targeted Playwright smoke confirmed:
  - `/modules`: `21` cards, `19` ready badges, `19` open links
  - graph filter shows `2` cards, `2` ready badges, and `2` live open links
  - `/modules/dfs` opens cleanly from the graph filter, default `Next` advances `0/28 -> 1/28`, panels open/collapse correctly, and console errors = `0`
- artifacts captured:
  - `output/playwright/p11m2-modules-smoke.png`
  - `output/playwright/p11m2-modules-graph-filter.png`
  - `output/playwright/p11m2-dfs-panels.png`
  - `output/playwright/p11m2-dfs-smoke.png`
  - `output/playwright/p11m2-smoke-report.txt`

### P11-M3 Graph-Track Acceptance Closure

Deliverables
- refreshed Playwright acceptance artifacts/report after `G-01` / `G-02`
- updated discovery expectations for the new graph category
- closure docs sync

DoD
- `/modules` clearly shows the graph baseline without dead-end confusion
- `G-01` / `G-02` feel cohesive under the shared shell
- docs and artifact references are internally consistent

Acceptance
- `npm run check` passes
- Playwright artifacts/report updated under `output/playwright/`

Done (2026-04-07)
- refreshed graph-track Playwright acceptance artifacts/report for:
  - `/modules`
  - `/modules?category=graph`
  - `/modules/graph-representation`
  - `/modules/dfs`
- local `npm run check` passed
- re-verified:
  - `/modules`: `21` cards, `19` ready badges, `19` open links
  - graph filter: `2` cards, `2` ready badges, `2` open links
  - `G-01`: default `Next` advances `0/20 -> 1/20`, `Controls` + `Step` panels open/collapse correctly, and console errors = `0`
  - `G-02`: default `Next` advances `0/28 -> 1/28`, `Controls` + `Step` panels open/collapse correctly, and console errors = `0`
- artifacts captured:
  - `output/playwright/p11m3-modules-smoke.png`
  - `output/playwright/p11m3-modules-graph-filter.png`
  - `output/playwright/p11m3-graph-representation-panels.png`
  - `output/playwright/p11m3-graph-representation-smoke.png`
  - `output/playwright/p11m3-dfs-panels.png`
  - `output/playwright/p11m3-dfs-smoke.png`
  - `output/playwright/p11m3-acceptance-report.txt`

## Suggested Task Breakdown

1. `P11` is closed locally; next work should begin on a post-`P11` planning branch outside this document

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: graph-stage rendering may tempt a new page shell too early
  - Mitigation: treat the accepted shared workspace shell as fixed infrastructure unless a concrete graph-module gap appears
- Risk: list view, matrix view, and graph canvas may drift semantically
  - Mitigation: derive all graph views from one deterministic graph snapshot model and validate synchronization in tests
- Risk: deferring `Trie` / `B-Tree` could leave the tree category partially complete for longer
  - Mitigation: treat those as a later specialized structure phase instead of forcing them into the graph-foundation window
