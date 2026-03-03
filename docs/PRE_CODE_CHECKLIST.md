# PRE_CODE_CHECKLIST

Purpose: ensure the project is implementation-ready before writing production code.

## 1. Scope Freeze (V1)

- [x] Confirm V1 includes only 3-5 core modules.
- [x] Confirm V1 excludes auth/backend persistence (optional enhancements only).
- [x] Confirm auxiliary pages in V1: `/modules/sorting`, `/about`.
- [x] Record frozen scope in `docs/DECISIONS.md`.

## 2. Priority and DoD

- [x] Mark all V1 items with `P0/P1/P2` in `TODO.md`.
- [x] Define DoD for each P0 item (done means testable outcome).
- [x] Define acceptance checks for each P0 item.

## 3. Spec Alignment (Must Match)

- [x] `docs/1 ARCHITECTURE.md` (architecture and phase goals)
- [x] `docs/3 MODULES_FINAL_LIST.md` (module IDs/routes)
- [x] `docs/6 ROUTING_MAP.md` (router truth source)
- [x] `docs/10 STATE_MANAGEMENT.md` (state boundaries)
- [x] No cross-doc conflicts for IDs, routes, and page definitions.

## 4. Engineering Baseline

- [x] Decide package manager (`npm` recommended for now).
- [x] Define branch policy: all changes via feature/docs branches.
- [x] Define minimum quality gates before merge:
- [x] `./scripts/check-doc-links.sh`
- [x] `lint`
- [x] `test` (once scaffold exists)

## 5. Scaffold Task List (Before Coding)

- [x] Create file-level task list for initial scaffold.
- [x] Define responsibilities for each top-level folder (`pages`, `components`, `store`, `engine`, `data`).
- [x] Define first milestone output: app runs with empty shell + routing + placeholder module pages.

## 6. Daily Workflow Enforcement

- [x] End of day update: `docs/HANDOFF.md`.
- [x] Update decisions: `docs/DECISIONS.md`.
- [x] Update task state: `TODO.md`.
- [x] Push branch and keep remote in sync.

## 7. Go/No-Go Gate

Go only if all below are true:

- [x] V1 scope frozen and documented.
- [x] P0 list and DoD complete.
- [x] Routing/state docs conflict-free.
- [x] Scaffold task list approved.
