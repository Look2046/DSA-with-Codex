# IMPLEMENTATION_PLAN_P9

Status: proposed for execution
Branch model: `docs/*` for planning sync, `feat/*` per implementation milestone
Primary goal: unify all implemented module pages around the stage-first workspace shell validated on `T-01` / `T-02`, while preserving family-specific teaching visuals and interaction needs

## Workspace Shell Contract

The target for `P9` is not a pixel-perfect copy of `T-01`. The goal is one shared interaction contract:

- animation stage stays visually first and occupies the main viewport attention
- left `Controls` entry stays pinned on the rail and opens an on-demand drawer
- right `Step` entry stays pinned on the rail and opens an on-demand runtime sheet
- playback transport moves into the stage instead of living in page flow below
- clicking empty stage space collapses opened side panels
- opened panels can be dragged; auto-avoid is required for modules with a strong moving focus target and optional elsewhere
- floating algorithm/pseudocode windows are optional and should be added only when they materially improve teaching value

## Scope

P9-1: Workspace shell foundation + pilot migrations
- extract reusable shell primitives/styles/checklist from the validated `T-01` / `T-02` pattern
- migrate one representative module from each non-tree family:
  - `S-01 Bubble Sort`
  - `L-01 Array`
  - `SR-02 Binary Search`
- define documented exception rules for legends, pseudocode, algorithm windows, and auto-avoid

P9-2: Roll unified shell across the remaining implemented non-tree modules
- migrate the remaining implemented sorting/search/linear pages to the shared shell contract
- keep existing algorithm visuals intact while moving controls/runtime detail out of the main vertical flow
- align wording/status/panel behavior so module switching feels consistent

P9-3: Full consistency + acceptance closure
- run a final consistency pass over all 15 implemented modules, including already-aligned tree pages
- refresh Playwright acceptance artifacts/report for `/modules` + all implemented routes
- sync closure docs (`SESSION_BRIEF` / `HANDOFF` / `DECISIONS` / `TODO`)

Out of scope
- new algorithm modules (`AVL`, `Heap`, `Trie`, etc.) during `P9`
- home/about page redesign
- forcing every page to use an identical floating algorithm window
- cross-session persistence of panel positions/layout presets

## Milestones

### P9-M1 Workspace Shell Foundation + Pilot Migrations

Deliverables
- shared workspace-shell foundation (layout contract, CSS vocabulary, migration checklist, and reusable interaction helpers where appropriate)
- pilot migrations for:
  - `S-01` `/modules/bubble-sort`
  - `L-01` `/modules/array`
  - `SR-02` `/modules/binary-search`
- targeted Playwright smoke evidence for the pilot routes

DoD
- pilot pages expose pinned `Controls` / `Step` entrypoints and in-stage transport
- route/runtime behavior remains stable on pilot pages
- family-specific visuals remain readable after the shell migration
- tree pages remain behaviorally unchanged unless a shared-shell extraction requires a compatibility adjustment

Acceptance
- `npm run check` passes
- Playwright confirms stable pilot flows on `/modules`, `T-01`, `T-02`, `S-01`, `L-01`, and `SR-02`

### P9-M2 Rollout Across Remaining Implemented Non-Tree Modules

Deliverables
- sorting rollout:
  - `S-02`, `S-03`, `S-04`, `S-05`, `S-06`
- search rollout:
  - `SR-01`
- linear rollout:
  - `L-02`, `L-03`, `L-04`, `L-05`
- per-family follow-up fixes where the shared shell exposes layout or wording drift

DoD
- all implemented non-tree modules follow the workspace shell contract
- module-specific legends/pseudocode/runtime details are relocated intentionally rather than duplicated across page flow and drawers
- no dead-end navigation or obvious transport/panel regressions appear during the rollout

Acceptance
- `npm run check` passes
- targeted Playwright sweep confirms the migrated routes still open, replay, and reset safely

### P9-M3 Cross-Module Consistency + Acceptance Closure

Deliverables
- final consistency pass across all 15 implemented modules
- documented exception list for modules that intentionally diverge from the baseline shell (if any)
- refreshed Playwright acceptance artifacts/report under `output/playwright/p9m3-*`
- closure docs sync

DoD
- all implemented modules use one recognizable shell contract with only justified exceptions
- acceptance report covers `/modules` + every implemented route
- docs and artifact references are internally consistent

Acceptance
- `npm run check` passes
- Playwright artifacts/report updated under `output/playwright/`

## Suggested Task Breakdown

1. Define the shell contract and extract only the minimum reusable foundation needed for migration
2. Pilot on `S-01`, `L-01`, and `SR-02`
3. Roll remaining non-tree modules by family batch
4. Re-check tree pages for final consistency drift
5. Run full acceptance refresh and close docs

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: one-size-fits-all shell hurts module-specific readability
  - Mitigation: unify the interaction contract, not the exact page chrome; document allowed exceptions explicitly
- Risk: migrating many pages at once creates a broad regression surface
  - Mitigation: use a pilot milestone first, then roll out by family batch instead of all pages in one patch
- Risk: dense array/list modules may feel more cramped after transport and drawers move into the stage
  - Mitigation: keep stage-first layout, allow draggable panels, and reserve auto-avoid for modules that truly need focus protection
