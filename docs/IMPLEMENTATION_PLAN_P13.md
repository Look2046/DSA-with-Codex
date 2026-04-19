# IMPLEMENTATION_PLAN_P13

Status: `P13-M2` accepted locally on `feat/p13-m1-rabin-karp`; next target is tree backlog execution (`T-06` then `T-05`) while keeping post-`P12` quality gates unchanged.
Branch model: `docs/*` for planning sync, `feat/*` per implementation milestone.

## Scope

P13-1: `ST-02 Rabin-Karp`
- open the second string-algorithm module with rolling-hash and collision-verification teaching states
- reuse `ST-01 KMP` page shell patterns to keep string-track interaction semantics consistent
- land deterministic generator/timeline/replay coverage

P13-2: `G-09 Topological Sort`
- extend graph track with deterministic Kahn queue progression
- make indegree counting/decrementing and queue-enqueue rules explicit in the stage + step panel
- keep route/registry/i18n wiring on the shared graph workspace shell contract

P13-3: post-`P13-M2` queue
- continue the remaining tree backlog in order:
  - `T-06 Trie`
  - `T-05 B-Tree / B+ Tree`
- keep `S-08`~`S-11` and `P-01`~`P-05` in the explicit backlog until tree track advances

## Milestones

### P13-M1 Add `ST-02 Rabin-Karp`

Deliverables
- `src/modules/string/rabinKarp.ts`
- `src/modules/string/rabinKarpTimelineAdapter.ts`
- `src/modules/string/rabinKarp.test.ts`
- `src/modules/string/rabinKarpTimelineReplay.test.ts`
- `src/pages/modules/RabinKarpPage.tsx`
- runtime wiring in route/registry/i18n/style/test helpers

Acceptance
- `npm run check` passes
- targeted Playwright smoke confirms:
  - `/modules?category=string`: `2` cards, `2` ready badges, `2` open links
  - `/modules/rabin-karp`: default `Next` advances `0/46 -> 1/46`, console errors = `0`

### P13-M2 Add `G-09 Topological Sort`

Deliverables
- `src/modules/graph/topologicalSort.ts`
- `src/modules/graph/topologicalSortTimelineAdapter.ts`
- `src/modules/graph/topologicalSort.test.ts`
- `src/modules/graph/topologicalSortTimelineReplay.test.ts`
- `src/pages/modules/TopologicalSortPage.tsx`
- runtime wiring in route/registry/i18n

Acceptance
- `npm run check` passes
- targeted Playwright smoke confirms:
  - `/modules?category=graph`: `9` cards, `9` ready badges, `9` open links
  - `/modules/topological-sort`: default `Next` advances `0/46 -> 1/46`, console errors = `0`

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`
