# IMPLEMENTATION_PLAN_P15

Status: planning baseline accepted locally on `feat/p14-backlog-wave`; target is to complete the first user-facing acceptance and stabilization wave for the current `43/43` module surface before opening new feature scope.
Branch model: `docs/*` for planning sync, `feat/*` per implementation milestone.

## Scope

P15-1: acceptance inventory and reproducible audit baseline
- pause new module development until the current surface is user-accepted
- verify `/modules` plus representative routes across existing tracks in a real browser
- record findings in repo docs so another AI/session can resume without re-discovery

P15-2: product-surface baseline fixes
- remove scaffold-era polish gaps that block acceptance, starting with global page-title/meta residue
- validate `/modules`, `/about`, and representative module routes against the intended product tone
- keep cleanup commits scoped and reviewable

P15-3: route/runtime warning diagnosis
- identify the root cause of the Firefox dev-console warning storm observed during representative Playwright audit
- separate true app regressions from environment-only noise
- fix root causes before expanding the audit breadth

**Status (2026-09-17): CLOSED / verified non-issue.** Re-audited 10 representative routes in Firefox (incl. `/modules/heap-sort`) with an injected self-test marker confirming the capture path; `0` console warnings/errors. The storm was a pre-upgrade `react-router-dom` v6 / React 18 artifact; current `react-router-dom 7.9.6 + React 19 + Vite 7` emits none. No root-cause fix required — superseded by the dependency upgrade.

P15-4: full cross-route acceptance sweep
- run a structured acceptance sweep across all 43 implemented routes
- refresh evidence and sync milestone docs only after the stabilized surface is actually accepted
- do not open another feature wave until this acceptance pass is closed or explicitly deprioritized by the user

## Milestones

### P15-M0 Planning baseline + acceptance pivot

Deliverables
- `docs/IMPLEMENTATION_PLAN_P15.md`
- sync `docs/SESSION_BRIEF.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, and `TODO.md`
- document why the next phase is acceptance/stabilization instead of new algorithm work

Acceptance
- planning docs agree that `P15` is now the active wave
- the repo records the first representative acceptance findings and the branch handoff state

### P15-M1 Acceptance inventory and representative browser audit

Deliverables
- a representative audit matrix covering:
  - `/modules`
  - at least one older tree route
  - at least one newly added route
  - at least one sorting/linear/search route
- captured findings in `docs/HANDOFF.md` and `TODO.md`
- reproducible local Playwright launch path recorded if environment repair was needed

Acceptance
- representative audit reproduces the current user-facing issues consistently
- no new feature work starts before the findings are categorized

### P15-M2 Product-surface baseline fixes

Deliverables
- fix global title/meta residue so representative routes no longer report scaffold placeholder titles
- align any obvious top-level product-surface regressions on `/modules`, `/about`, and shared layout chrome
- targeted tests or assertions where practical

Acceptance
- representative routes no longer show `m0-scaffold-tmp`
- targeted browser audit confirms the corrected title/product-surface baseline

### P15-M3 Route/runtime warning diagnosis and stabilization

Deliverables
- root-cause analysis for the Firefox warning storm seen during representative audit
- focused fixes in router/import/runtime paths as needed
- updated notes on whether remaining warnings are app bugs or accepted environment noise

Acceptance
- targeted browser audit on `/modules`, `/modules/binary-tree`, `/modules/heap-sort`, and `/modules/huffman-tree` reports `0` unexpected runtime errors
- warning count is either reduced to zero or explicitly justified in docs with the root cause identified

**Status (2026-09-17): CLOSED / verified non-issue**
- re-ran the representative Firefox dev audit on 10 routes (incl. `/modules/heap-sort`, `/modules`, `/modules/binary-tree`, `/modules/huffman-tree`, `/modules/linked-list`, `/modules/bst`, `/modules/graph-adjacency-list`, `/modules/sorting-race`, `/modules/avl-tree`, `/modules/dijkstra`)
- injected a self-test `console.warn` marker to confirm the capture path is live (`selftest ok = true`)
- total console warnings/errors observed = `0` across all sampled routes
- conclusion: the earlier `57`-warning claim belonged to the pre-upgrade `react-router-dom` v6 / React 18 stack; the current `react-router-dom 7.9.6 + React 19 + Vite 7` stack emits no dev-console warnings. No router/import/runtime fix required.

### P15-M4 Full acceptance closure for the current `43/43` surface

Deliverables
- refreshed `docs/HANDOFF.md`, `docs/SESSION_BRIEF.md`, `docs/DECISIONS.md`, and `TODO.md`
- updated Playwright evidence/report for the accepted surface
- a clear list of any routes intentionally deferred, if full closure is not reached

Acceptance
- `npm run check` passes after meaningful code changes
- Playwright acceptance confirms `/modules` and the accepted route matrix are stable on the validated shell contract
- the user can choose new feature work from a stable, accepted baseline instead of a partially verified one

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`
