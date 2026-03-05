# IMPLEMENTATION_PLAN_P3

Status: proposed for execution  
Branch model: `feat/*` per milestone  
Primary goal: expand V1 beyond the first 3 modules with minimal architecture drift

## Scope

P3-1: Module discovery baseline
- implement practical module navigation/filtering on `/modules`
- connect existing registry metadata for category-based discovery
- keep route structure consistent with current module pages

P3-2: Second sorting module (`S-02 Selection Sort`)
- deliver one new sorting module on top of the shared timeline engine
- follow S-01 interaction conventions and pseudocode highlight pattern
- include deterministic step-generation tests

P3-3: New linear module (`L-04 Stack`)
- provide core stack operations visualization (`push`, `pop`, `peek`)
- reuse timeline interaction model and JSON import/export capability
- include operation validation and replay stability tests

Out of scope
- backend persistence / accounts
- major visual redesign
- multi-user collaboration features

## Milestones

### P3-M1 Modules Page Upgrade

Deliverables
- category filters and card-based module list on `/modules`
- route-level navigation to available modules
- graceful placeholder state for not-yet-implemented modules

DoD
- users can discover modules by category
- no broken navigation for current implemented routes
- `npm run check` passes

Acceptance
- manual flow: Home -> Modules -> filter -> target module route is stable

### P3-M2 S-02 Selection Sort

Deliverables
- `S-02` step generator + visual page + pseudocode mapping
- timeline playback integration via shared engine
- deterministic tests for step generation and replay

DoD
- controls: play/pause/next/prev/reset/speed all available
- final state sorted and deterministic under fixed input
- docs + i18n copy complete (zh/en)

Acceptance
- `npm run check` passes
- S-01 and S-02 behavior conventions remain aligned

### P3-M3 L-04 Stack

Deliverables
- stack operation model (`push`, `pop`, `peek`) with visual timeline
- input validation and clear error feedback
- JSON import/export for example stack datasets

DoD
- fixed input produces deterministic replay
- invalid operations show actionable error messages
- cross-module quality gate stays green

Acceptance
- `export -> import -> replay` deterministic for stack scenarios
- `npm run check` passes

## Suggested Task Breakdown

1. Upgrade `/modules` discovery UX and route-safe navigation
2. Implement `S-02` generator, page, tests, and i18n
3. Implement `L-04` generator, page, tests, and i18n
4. Add stack JSON import/export and validation tests
5. Final regression + docs/handoff sync

## Required Quality Gates

- meaningful code changes: `npm run check`
- docs-only changes: `./scripts/check-doc-links.sh`

## Risks and Mitigations

- Risk: rapid module expansion causes inconsistent UX patterns
  - Mitigation: enforce shared timeline controls and shared page conventions
- Risk: route growth introduces dead links/placeholder confusion
  - Mitigation: explicit implemented/not-yet-implemented module state on `/modules`
- Risk: stack module diverges from existing JSON data portability standards
  - Mitigation: reuse L-01/L-03 JSON validation pattern and round-trip tests
