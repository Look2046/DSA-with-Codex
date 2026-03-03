# PRE_CODE_CHECKLIST

Purpose: ensure the project is implementation-ready before writing production code.

## 1. Scope Freeze (V1)

- [ ] Confirm V1 includes only 3-5 core modules.
- [ ] Confirm V1 excludes auth/backend persistence (optional enhancements only).
- [ ] Confirm auxiliary pages in V1: `/modules/sorting`, `/about`.
- [ ] Record frozen scope in `docs/DECISIONS.md`.

## 2. Priority and DoD

- [ ] Mark all V1 items with `P0/P1/P2` in `TODO.md`.
- [ ] Define DoD for each P0 item (done means testable outcome).
- [ ] Define acceptance checks for each P0 item.

## 3. Spec Alignment (Must Match)

- [ ] `docs/1 ARCHITECTURE.md` (architecture and phase goals)
- [ ] `docs/3 MODULES_FINAL_LIST.md` (module IDs/routes)
- [ ] `docs/6 ROUTING_MAP.md` (router truth source)
- [ ] `docs/10 STATE_MANAGEMENT.md` (state boundaries)
- [ ] No cross-doc conflicts for IDs, routes, and page definitions.

## 4. Engineering Baseline

- [ ] Decide package manager (`npm` recommended for now).
- [ ] Define branch policy: all changes via feature/docs branches.
- [ ] Define minimum quality gates before merge:
- [ ] `./scripts/check-doc-links.sh`
- [ ] `lint`
- [ ] `test` (once scaffold exists)

## 5. Scaffold Task List (Before Coding)

- [ ] Create file-level task list for initial scaffold.
- [ ] Define responsibilities for each top-level folder (`pages`, `components`, `store`, `engine`, `data`).
- [ ] Define first milestone output: app runs with empty shell + routing + placeholder module pages.

## 6. Daily Workflow Enforcement

- [ ] End of day update: `docs/HANDOFF.md`.
- [ ] Update decisions: `docs/DECISIONS.md`.
- [ ] Update task state: `TODO.md`.
- [ ] Push branch and keep remote in sync.

## 7. Go/No-Go Gate

Go only if all below are true:

- [ ] V1 scope frozen and documented.
- [ ] P0 list and DoD complete.
- [ ] Routing/state docs conflict-free.
- [ ] Scaffold task list approved.

