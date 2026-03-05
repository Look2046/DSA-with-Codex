# DECISIONS

Record architecture or workflow decisions here.

## Decision Template
- ID: DEC-YYYYMMDD-XX
- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded
- Context: why this decision is needed
- Decision: what is chosen
- Alternatives considered: options not chosen
- Consequences: tradeoffs and impact
- Owner: who made/approved

---

## DEC-20260303-01
- Date: 2026-03-03
- Status: accepted
- Context: Chat history may not persist across new sessions or restarts.
- Decision: Use repository files (`HANDOFF.md`, `DECISIONS.md`, `TODO.md`) plus git commits as source of truth.
- Alternatives considered: rely on chat context only.
- Consequences: Slightly more discipline required daily, but full recoverability improves.
- Owner: haoyu + codex

## DEC-20260303-02
- Date: 2026-03-03
- Status: accepted
- Context: HTTPS push required interactive credentials and failed after restart.
- Decision: Use GitHub SSH key auth for non-interactive push from WSL.
- Alternatives considered: HTTPS + PAT stored in credential helper.
- Consequences: One-time SSH setup, then stable push workflow.
- Owner: haoyu + codex

## DEC-20260303-03
- Date: 2026-03-03
- Status: accepted
- Context: Need to avoid scope creep before coding and keep first implementation cycle short.
- Decision: Freeze V1 to 3 core modules (`S-01`, `L-01`, `L-03`) plus 2 auxiliary pages (`/modules/sorting`, `/about`); defer auth/backend persistence.
- Alternatives considered: implement broader module set or backend integration in V1.
- Consequences: Faster first delivery and lower integration risk; some planned features move to later milestones.
- Owner: haoyu + codex

## DEC-20260303-04
- Date: 2026-03-03
- Status: accepted
- Context: Need explicit quality gates and branch discipline before coding begins.
- Decision: Use branch-based workflow (`docs/*`, `feat/*`) and require local checks (`./scripts/check-doc-links.sh`, then `lint`/`test` after scaffold) before merge.
- Alternatives considered: continue direct commits to `main`.
- Consequences: Slightly more process overhead, but better traceability and safer merges.
- Owner: haoyu + codex

## DEC-20260303-05
- Date: 2026-03-03
- Status: accepted
- Context: S-01 module and M3 gates have reached a stable checkpoint and need a clear transition boundary.
- Decision: Close current milestone on `feat/m0-scaffold`, then start L-01 work on a new branch `feat/l01-v1`.
- Alternatives considered: continue implementing L-01 directly on `feat/m0-scaffold`.
- Consequences: Cleaner history and easier review/rollback per milestone.
- Owner: haoyu + codex

## DEC-20260303-06
- Date: 2026-03-03
- Status: accepted
- Context: L-01 array module reached v1 acceptance and needs a clean handoff into the next module milestone.
- Decision: Close L-01 on `feat/l01-v1`, then start L-03 on a dedicated branch `feat/l03-v1`.
- Alternatives considered: continue L-03 work on `feat/l01-v1`.
- Consequences: Better milestone isolation and easier PR review/rollback by module.
- Owner: haoyu + codex

## DEC-20260305-07
- Date: 2026-03-05
- Status: accepted
- Context: Visualization stages across modules have inconsistent canvas size and behavior, causing layout jump and unclear visual focus.
- Decision: Standardize module visualization with a shared large-canvas container (`VisualizationCanvas`) and fixed stage sizing rules; migrate in phases (L-01/L-03 first, S-01 next).
- Alternatives considered: keep module-specific canvas styles and tune each page separately.
- Consequences: Better cross-module consistency and easier future layout maintenance; short-term mixed state remains until S-01 migration completes.
- Owner: haoyu + codex

## DEC-20260305-08
- Date: 2026-03-05
- Status: accepted
- Context: P2 includes both playback-engine refactor and dataset import/export, but executing both simultaneously increases regression risk.
- Decision: Sequence P2 as timeline-engine-first (`P2-M1`, `P2-M2`) and dataset import/export second (`P2-M3`), with S-01 as initial migration target before cross-module rollout.
- Alternatives considered: implement import/export first; parallelize engine refactor and import/export in one branch.
- Consequences: Slightly longer P2 calendar but lower playback regression risk and clearer PR review boundaries.
- Owner: haoyu + codex

## DEC-20260305-09
- Date: 2026-03-05
- Status: accepted
- Context: S-01 should migrate first to a reusable timeline engine path without forcing immediate L-01/L-03 rewrites in the same patch.
- Decision: Introduce a shared hook-based timeline player (`useTimelinePlayer`) on top of timeline reducer contracts, migrate S-01 to this path, and validate with deterministic replay tests before cross-module rollout.
- Alternatives considered: keep store-based page timers in all modules; migrate all modules in one large refactor.
- Consequences: Cleaner incremental migration boundary and stronger replay determinism evidence; temporary mixed playback paths remain until P2-M2 completes.
- Owner: haoyu + codex

## DEC-20260305-10
- Date: 2026-03-05
- Status: accepted
- Context: L-01/L-03 still relied on per-page playback timer wiring and global store primitives, creating mixed playback code paths after S-01 migration.
- Decision: Complete P2-M2 by migrating L-01/L-03 to `useTimelinePlayer` and removing page-level manual tick loops, while preserving existing operation-specific UX effects.
- Alternatives considered: keep mixed implementation until P2-M3; rewrite all playback behavior into one new global engine store.
- Consequences: All V1 modules now share one timeline-engine control path, reducing drift risk ahead of import/export work; global playback store remains for module metadata only and can be refactored separately later.
- Owner: haoyu + codex
