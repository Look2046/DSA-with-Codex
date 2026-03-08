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

## DEC-20260305-11
- Date: 2026-03-05
- Status: accepted
- Context: P2-M3 requires dataset portability for L-01 while keeping existing input-validation behavior and replay determinism unchanged.
- Decision: Add JSON import/export directly in L-01 page, validate with two layers (JSON parse + schema shape), then reuse existing insert-config validation to enforce capacity/index/value rules.
- Alternatives considered: only CSV-style text import; JSON import without schema checks; defer tests until L-03 parity.
- Consequences: L-01 now supports deterministic dataset round-trip and clearer invalid-input feedback with minimal architectural churn; L-03 parity can be added incrementally.
- Owner: haoyu + codex

## DEC-20260305-12
- Date: 2026-03-05
- Status: accepted
- Context: After L-01 JSON import/export closure, linked-list module would remain behaviorally inconsistent without equivalent dataset portability.
- Decision: Extend P2-M3 to L-03 with matching JSON import/export UX, per-operation schema validation (`find`/`insertAt`/`deleteAt`), and deterministic round-trip test coverage.
- Alternatives considered: keep L-03 text-input-only; postpone L-03 parity to a later milestone.
- Consequences: JSON dataset portability is now consistent across L-01/L-03; P2 is fully closed and next work can focus on new scope plus optional store cleanup.
- Owner: haoyu + codex

## DEC-20260305-13
- Date: 2026-03-05
- Status: accepted
- Context: After closing P2, the next step needs concrete execution boundaries rather than open-ended feature exploration.
- Decision: Define P3 as a three-milestone sequence: modules discovery upgrade (`P3-M1`), new sorting module `S-02` (`P3-M2`), and new linear module `L-04` stack (`P3-M3`), tracked in `docs/IMPLEMENTATION_PLAN_P3.md`.
- Alternatives considered: jump directly to random new modules; perform only refactor cleanup without new module delivery.
- Consequences: clearer delivery order and acceptance boundaries; preserves momentum from stable P2 foundation while controlling scope.
- Owner: haoyu + codex

## DEC-20260305-14
- Date: 2026-03-05
- Status: accepted
- Context: `/modules` page was still a placeholder, which prevented category-level discovery and made planned modules invisible in navigation.
- Decision: Implement P3-M1 by adding filterable module cards with explicit implemented/pending status, and allow navigation only for implemented routes.
- Alternatives considered: keep placeholder page until S-02 is ready; link all planned routes even when unimplemented.
- Consequences: users can discover current and upcoming modules safely, with no dead-route confusion; establishes a stable foundation before adding new modules.
- Owner: haoyu + codex

## DEC-20260305-15
- Date: 2026-03-05
- Status: accepted
- Context: P3-M2 needs to deliver one new module on top of the unified timeline engine to validate extensibility after P2 refactor.
- Decision: Implement `S-02 Selection Sort` first, reusing S-01 interaction conventions and adding dedicated deterministic step/replay tests.
- Alternatives considered: implement stack first; add multiple modules in one patch.
- Consequences: verifies the new-module expansion path with controlled scope and keeps P3 sequencing predictable before entering L-04 stack work.
- Owner: haoyu + codex

## DEC-20260305-16
- Date: 2026-03-05
- Status: accepted
- Context: P3-M3 requires a new linear module that follows the same playback and data-portability standards established in P2.
- Decision: Implement `L-04 Stack` with `push/pop/peek` operations, shared timeline playback, JSON import/export with schema+business validation, and deterministic replay/round-trip tests.
- Alternatives considered: defer JSON support to later; implement stack with operation-only demo and no test parity.
- Consequences: P3 closes with both new-module delivery and consistency against P2 standards; future modules can reuse stack page/tooling patterns.
- Owner: haoyu + codex

## DEC-20260305-17
- Date: 2026-03-05
- Status: accepted
- Context: After timeline-engine migration, `playbackStore` still carried legacy playback responsibility and no longer matched runtime usage.
- Decision: Reduce `playbackStore` to module metadata only (`currentModule`, `setCurrentModule`) and keep timeline state exclusively in `useTimelinePlayer`.
- Alternatives considered: keep mixed store/engine responsibilities; reintroduce global playback store wiring.
- Consequences: lower state duplication and fewer cross-module coupling points; future module work can focus on timeline adapters and page-level controls only.
- Owner: haoyu + codex

## DEC-20260305-18
- Date: 2026-03-05
- Status: accepted
- Context: P3 is fully closed and backlog still contains two planned linear modules plus cross-module delivery consistency debt.
- Decision: Define P4 as a three-milestone sequence: `L-05 Queue` (`P4-M1`), `L-02 Dynamic Array` (`P4-M2`), and module-level UX/acceptance polish (`P4-M3`), tracked in `docs/IMPLEMENTATION_PLAN_P4.md`.
- Alternatives considered: start ad-hoc module work without milestone boundaries; focus only on UX polish without new module delivery.
- Consequences: keeps expansion predictable while reserving explicit capacity for delivery-quality hardening before the next phase.
- Owner: haoyu + codex

## DEC-20260305-19
- Date: 2026-03-05
- Status: accepted
- Context: `L-05 Queue` needs to be shipped quickly with behavior parity against existing linear modules and without introducing a new playback path.
- Decision: Implement queue module on top of the existing timeline engine and reuse stack/array patterns for validation, JSON import/export, deterministic replay tests, and fixed-capacity canvas interaction.
- Alternatives considered: build queue with a separate playback runtime; ship queue without JSON/test parity first.
- Consequences: lower integration risk and faster delivery, at the cost of deferring deeper queue-specific visual sophistication (for example circular-buffer rendering) to later iterations.
- Owner: haoyu + codex

## DEC-20260306-20
- Date: 2026-03-06
- Status: accepted
- Context: `L-02 Dynamic Array` must clearly demonstrate resize behavior while staying compatible with existing module delivery conventions (timeline engine, JSON portability, deterministic replay tests).
- Decision: Model `L-02` as append-focused runtime with boundary-triggered doubling resize and explicit migration steps, then deliver it through the existing timeline/page/utils/testing pattern used by L-04/L-05.
- Alternatives considered: add multiple dynamic-array operations in first iteration; animate resize without explicit migration steps.
- Consequences: resize semantics are easy to replay and test deterministically, with lower implementation risk; richer operation coverage is deferred to future milestones.
- Owner: haoyu + codex

## DEC-20260306-21
- Date: 2026-03-06
- Status: accepted
- Context: During P4-M3 interaction polish, queue circular-mode progression (`completed -> next` with full enqueue) surfaced a runtime exception that propagated to route-level crash UI.
- Decision: Enforce page-level runtime safety for module timeline builds by guarding queue timeline construction and converting runtime failures into form-level feedback, plus pre-validation before completed-to-next progression.
- Alternatives considered: allow thrown errors to bubble to global route error UI; patch only reducer/playback layer without page-level guards.
- Consequences: improved resilience and user-facing error clarity under edge operations; slight increase in page-level guard logic.
- Owner: haoyu + codex

## DEC-20260306-22
- Date: 2026-03-06
- Status: accepted
- Context: Final P4-M3 acceptance sweep showed `L-02` reused validation-error styling for a non-blocking capacity-full hint, causing cross-module UX semantics drift and false-positive error signals in automated checks.
- Decision: Keep capacity-full copy as informative warning, but render it with module status-warning style (`dynamic-array-capacity-full`) instead of `form-error`; then close P4 after full Playwright acceptance artifact refresh and green local quality gate.
- Alternatives considered: keep warning in `form-error`; remove capacity-full hint entirely.
- Consequences: clearer error-vs-warning semantics and cleaner acceptance signals while preserving user guidance before resize.
- Owner: haoyu + codex

## DEC-20260306-23
- Date: 2026-03-06
- Status: accepted
- Context: After closing P4, next work needs explicit sequencing to avoid ad-hoc expansion and keep delivery quality stable while introducing a new module category.
- Decision: Define P5 as a three-milestone sequence: `S-03 Insertion Sort` (`P5-M1`), `SR-02 Binary Search` (`P5-M2`), and discovery/acceptance refresh for search-track expansion (`P5-M3`), tracked in `docs/IMPLEMENTATION_PLAN_P5.md`.
- Alternatives considered: continue polishing existing modules only; start tree modules directly before adding search baseline.
- Consequences: preserves momentum with controlled scope, introduces search-category baseline safely, and keeps acceptance discipline explicit before P5 closure.
- Owner: haoyu + codex

## DEC-20260306-24
- Date: 2026-03-06
- Status: accepted
- Context: P5 first implementation milestone should extend sorting coverage with minimal architecture churn and maintain playback determinism conventions from S-01/S-02.
- Decision: Implement `S-03 Insertion Sort` by reusing existing sorting-page interaction patterns, timeline adapter contracts, and deterministic replay tests; register it as implemented in module routing/registry.
- Alternatives considered: start binary-search module first; bundle S-03 and SR-02 in one larger patch.
- Consequences: controlled milestone scope and low regression risk, with immediate coverage expansion in sorting track before introducing new search-category behavior in P5-M2.
- Owner: haoyu + codex

## DEC-20260306-25
- Date: 2026-03-06
- Status: accepted
- Context: P5-M2 introduces the first dedicated search module and requires both new interaction semantics (low/mid/high pointers) and dataset portability consistency.
- Decision: Implement `SR-02 Binary Search` with sorted-input prevalidation, pointer-state timeline steps, JSON import/export schema checks, and deterministic replay tests; extend module category model to include `search` so discovery metadata remains semantically correct.
- Alternatives considered: model SR-02 under `sort` category temporarily; defer JSON parity or category extension to P5-M3.
- Consequences: cleaner taxonomy and lower behavior ambiguity for search modules; small incremental complexity added to modules filter/category handling.
- Owner: haoyu + codex

## DEC-20260306-26
- Date: 2026-03-06
- Status: accepted
- Context: After landing `S-03` and `SR-02`, P5 needs explicit acceptance evidence before closure to avoid hidden cross-module regressions.
- Decision: Close P5 only after a full Playwright walkthrough over all implemented modules and archive artifacts under `output/playwright/p5m3-*.png` with a consolidated acceptance report.
- Alternatives considered: close P5 based on local unit/lint/build checks only; sample-check only newly added modules.
- Consequences: stronger release confidence and reproducible acceptance evidence; slight extra execution time per milestone closure.
- Owner: haoyu + codex

## DEC-20260306-27
- Date: 2026-03-06
- Status: accepted
- Context: After P5 closure, next scope needs a clear sequence that balances continued sorting expansion with search-track completeness and keeps closure discipline stable.
- Decision: Define P6 as a three-milestone sequence: `SR-01 Linear Search` (`P6-M1`), `S-04 Shell Sort` (`P6-M2`), and discovery/acceptance closure refresh (`P6-M3`), tracked in `docs/IMPLEMENTATION_PLAN_P6.md`.
- Alternatives considered: jump directly to tree modules; continue ad-hoc UX tweaks without new module delivery.
- Consequences: preserves predictable execution cadence and quality gates while expanding both search and sorting coverage incrementally.
- Owner: haoyu + codex

## DEC-20260306-28
- Date: 2026-03-06
- Status: accepted
- Context: `SR-01 Linear Search` needs to be introduced with minimal regression risk while preserving the established timeline-engine and dataset-portability conventions.
- Decision: Implement `SR-01` by reusing `SR-02` page/utils architecture, but with unsorted-array validation, sequential pointer progression (`i`), first-match stop semantics, JSON import/export schema checks, and deterministic step/replay tests.
- Alternatives considered: deliver SR-01 without JSON parity first; introduce a separate playback runtime for search modules.
- Consequences: fast delivery with consistent UX/testing standards across search modules; minor duplicated patterns between SR-01/SR-02 remain acceptable for milestone speed.
- Owner: haoyu + codex

## DEC-20260307-29
- Date: 2026-03-07
- Status: accepted
- Context: `S-04 Shell Sort` must make gap transitions and gap-based insertion movement understandable while staying on the existing sorting-page and timeline-engine path.
- Decision: Implement `S-04` on the current sorting scaffold with explicit `gapChange -> selectCurrent -> compare -> shift -> insert` timeline steps, plus page-level `gap` and `held value` status metadata and deterministic step/replay tests.
- Alternatives considered: model shell sort as swap-only animation; hide held-value/gap state until later UX polish; build a custom stage separate from existing sorting pages.
- Consequences: shell-sort pass boundaries and insertion effects are visible without architectural churn; richer group-level styling is deferred to future polish.
- Owner: haoyu + codex

## DEC-20260307-30
- Date: 2026-03-07
- Status: accepted
- Context: Ad-hoc Playwright CLI usage was drifting between temporary package versions and default browser targets (`chrome` vs `firefox`/`chromium`), causing repeated browser-install prompts and non-reproducible WSL setup behavior.
- Decision: Pin `@playwright/cli` in `package.json`, add repo-local wrapper `scripts/playwright-cli.sh`, and set `playwright-cli.json` to default to `firefox` with shared browser cache under `~/.cache/ms-playwright`.
- Alternatives considered: continue using `npx --package @playwright/cli ...` directly; install only system Chrome under `/opt/google/chrome/chrome`; leave browser choice per-session.
- Consequences: Playwright automation in this repo now has one stable CLI entrypoint and one default browser target; future browser setup in the same WSL user can be reused instead of rediscovered ad hoc.
- Owner: haoyu + codex

## DEC-20260308-31
- Date: 2026-03-08
- Status: accepted
- Context: P6-M2 (`S-04`) is complete, and recent `S-01`~`S-04` animation refinements changed acceptance surface; milestone closure needs fresh discovery/runtime evidence rather than inheriting older artifacts.
- Decision: Close P6 only after a new full discovery consistency pass and Playwright acceptance refresh over `/modules` and all implemented routes, archived as `output/playwright/p6m3-*.png` + `p6m3-acceptance-report.txt`.
- Alternatives considered: mark P6 closed using existing P5/P6-M2 artifacts only; refresh only new routes (`SR-01`, `S-04`) instead of full implemented set.
- Consequences: stronger closure confidence for P6 with reproducible evidence after sorting UX changes; small extra local execution overhead for each closure.
- Owner: haoyu + codex

## DEC-20260308-32
- Date: 2026-03-08
- Status: accepted
- Context: With P6 closed, next expansion should stay aligned with the current user focus on sorting interaction semantics and avoid jumping context to trees/graphs too early.
- Decision: Define P7 as sorting-track expansion in three milestones: `S-05 Quick Sort` (`P7-M1`), `S-06 Merge Sort` (`P7-M2`), and sorting consistency + acceptance closure (`P7-M3`), documented in `docs/IMPLEMENTATION_PLAN_P7.md`.
- Alternatives considered: start tree modules immediately; deliver only ad-hoc sorting polish without new module milestones.
- Consequences: keeps momentum and design consistency in the existing sorting workflow, while preserving explicit acceptance boundaries before broader category expansion.
- Owner: haoyu + codex

## DEC-20260308-33
- Date: 2026-03-08
- Status: accepted
- Context: `S-05 Quick Sort` needs clear partition-state readability while remaining compatible with the existing sorting timeline UI conventions (`S-01`~`S-04`).
- Decision: Model quick sort as explicit timeline actions (`partitionStart`, `pivotSelect`, `compare`, `swap`, `pivotPlace`, `rangeSorted`) with page-level partition-range tint + pivot marker + `i/j` pointer hints, and guard determinism with dedicated step/replay tests.
- Alternatives considered: emit swap-only quick-sort frames without partition metadata; use a fully custom canvas separate from existing sorting page semantics.
- Consequences: quick-sort progression is easier to track and stays consistent with current controls/status layout, at the cost of a few quick-specific CSS classes and i18n keys.
- Owner: haoyu + codex

## DEC-20260308-34
- Date: 2026-03-08
- Status: accepted
- Context: `S-06 Merge Sort` must make split/merge stages visible to learners while preserving the same timeline controls and status layout used by `S-01`~`S-05`.
- Decision: Implement merge sort with explicit timeline actions (`split`, `compare`, `takeLeft`, `takeRight`, `writeBack`, `rangeMerged`) and add a dedicated temporary-buffer row + write-pointer indicator in the module page.
- Alternatives considered: visualize only final write-back without showing buffer state; reuse quick-sort stage semantics without split/merge stage cues.
- Consequences: merge-sort reasoning becomes clearer (especially buffer semantics), at the cost of a small set of merge-specific CSS classes and i18n keys.
- Owner: haoyu + codex

## DEC-20260308-35
- Date: 2026-03-08
- Status: accepted
- Context: P7 closure required both cross-sorting consistency and reproducible acceptance evidence across the expanded implemented set (13 modules after `S-05`/`S-06`), and merge-buffer pointer labels risked being misread as algorithm actions.
- Decision: Close P7 only after a full Playwright refresh over `/modules` + all implemented routes under `output/playwright/p7m3-*.png` with consolidated `p7m3-acceptance-report.txt`; simplify S-06 buffer-pointer visual by removing standalone `W` glyph and relying on pointer highlight + status-line metadata.
- Alternatives considered: keep older P6 acceptance artifacts; keep `W` marker and rely on explanatory text only.
- Consequences: stronger milestone closure evidence and lower learner confusion in merge visualization; slight additional local acceptance execution time.
- Owner: haoyu + codex

## DEC-20260308-36
- Date: 2026-03-08
- Status: accepted
- Context: After P7 closure, the project needed concrete next work items (not abstract methodology) and a controlled expansion path into remaining categories.
- Decision: Define P8 as a tree-track kickoff with three executable milestones: `P8-M1` tree onboarding + `T-01 Binary Tree Traversal`, `P8-M2` `T-02 BST`, and `P8-M3` tree consistency + acceptance closure; record in `docs/IMPLEMENTATION_PLAN_P8.md`.
- Alternatives considered: continue ad-hoc sorting polish only; jump directly into multiple tree/graph modules without milestone boundaries.
- Consequences: immediate actionable backlog with clear DoD/acceptance boundaries; AVL/Heap/Trie/Graph remain deferred to later phases.
- Owner: haoyu + codex

## DEC-20260308-37
- Date: 2026-03-08
- Status: accepted
- Context: `P8-M1` needed to establish tree-category onboarding and deliver the first tree module (`T-01`) with the same deterministic playback/testing discipline as prior phases.
- Decision: Land `P8-M1` by adding `tree` discovery/category wiring (`/modules` filter + i18n + registry `T-01`~`T-06`) and implementing `T-01 Binary Tree Traversal` with four traversal modes (preorder/inorder/postorder/level-order), deterministic step/replay tests, and local Playwright smoke evidence.
- Alternatives considered: start `T-02 BST` before discovery onboarding; ship `T-01` without replay determinism coverage; defer `/modules` category integration to a later milestone.
- Consequences: tree track now has a route-safe discoverable entrypoint and reproducible baseline module behavior; P8 next focus can move directly to `T-02 BST` implementation.
- Owner: haoyu + codex
