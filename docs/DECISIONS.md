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

## DEC-20260308-38
- Date: 2026-03-08
- Status: accepted
- Context: `P8-M2` required a concrete BST teaching path with explicit operation semantics (`searchPath`/`insert`/`delete`) and delete-case explainability while keeping timeline determinism and existing module UX conventions.
- Decision: Implement `T-02 BST` with dedicated step actions for search traversal, insertion, delete-case classification (`leaf`/`oneChild`/`twoChildren`) and successor replacement flow, plus deterministic step/replay tests, route `/modules/bst`, and Playwright smoke artifacts for `/modules` tree discovery + BST playback.
- Alternatives considered: model BST with search-only first; defer delete-case explicit states; skip route discovery update until P8-M3.
- Consequences: tree track now has two implemented modules with operation-level clarity and deterministic replay evidence, enabling P8-M3 to focus on consistency and full acceptance refresh.
- Owner: haoyu + codex

## DEC-20260309-39
- Date: 2026-03-09
- Status: accepted
- Context: The preorder route drawing on binary-tree canvas was hardcoded to one specific sample shape (`trace-step1..step20`), so it could not reliably generalize to arbitrary binary trees.
- Decision: Replace hardcoded route assembly with a recursive rule-driven trace generator based on three local rules (data node / null node / root entry), absolute canvas left-right lane selection, and ordered segment output.
- Alternatives considered: keep expanding hardcoded sample-specific steps; rely on manual per-tree route corrections.
- Consequences: route generation now scales to arbitrary level-order trees (including sparse/null-heavy cases), and the same rule set can be reused by other tree modules through a shared spec (`docs/modules/T-01-preorder-trace-rules.md`).
- Owner: haoyu + codex

## DEC-20260310-40
- Date: 2026-03-10
- Status: accepted
- Context: After route generation became rule-driven, visualization still displayed full route statically, which did not match the intended traversal playback behavior.
- Decision: Render route playback progressively from the root-top entry segment, hide future segments, keep completed segments in dashed style with line-end arrows, and use a moving front arrow that reuses the same small-arrow geometry.
- Alternatives considered: keep full static route visible during playback; use a different front-cursor glyph; drop per-line endpoint arrows during animation.
- Consequences: playback now aligns with traversal storytelling and preserves route semantics users already recognize from static guide styling.
- Owner: haoyu + codex

## DEC-20260310-41
- Date: 2026-03-10
- Status: accepted
- Context: During progressive route playback, users needed explicit per-node entry-state semantics to map traversal flow to node-local directions.
- Decision: Add node entry markers for real nodes with fixed semantics (`1` from up, `2` from left-down, `3` from right-down), and reveal each marker only when playback length reaches its mapped route position (`revealLength`).
- Alternatives considered: show all markers statically from start; use one marker style without directional labels; tie marker visibility to wall-clock time instead of route progress.
- Consequences: traversal direction is now readable at node level while preserving route-first storytelling; marker rendering remains deterministic under replay/seek based on route length.
- Owner: haoyu + codex

## DEC-20260322-42
- Date: 2026-03-22
- Status: accepted
- Context: In `T-01`, active trace arrowheads and route-order labels were derived from whole composite paths (arc + line), which made dashed-trace arrows harder to read and caused numbering to attach to mixed path fragments rather than the terminal travel runs users follow.
- Decision: Store dedicated straight-run arrow anchors (`arrowFromPoint` / `arrowToPoint`) on raw trace segments, render active arrowheads from those terminal line directions, and restrict route-order labels to arrow-capable straight travel segments only.
- Alternatives considered: keep deriving arrow direction and numbering from whole-path endpoints; attempt a CSS-only visibility fix without changing trace semantics; remove route-order overlay entirely.
- Consequences: arrowheads now align with the final movement direction learners see, and route-order labels better reflect canonical preorder travel runs; final browser-side acceptance verification is still required before closing `P8-M3`.
- Owner: haoyu + codex

## DEC-20260322-43
- Date: 2026-03-22
- Status: accepted
- Context: The binary-tree canvas playground already followed the documented canonical preorder route rules, but the formal `T-01` page still rebuilt guide traces from `guideEvents` with non-canonical lane selection and a dynamic null-return sweep.
- Decision: Extract shared preorder trace geometry helpers and make the formal `T-01` guide trace builder follow the same canonical absolute-left/right data/null/root rules as the playground, including fixed CCW null returns.
- Alternatives considered: keep the playground and formal page on separate trace builders; only patch null returns while leaving event-driven lane selection intact.
- Consequences: playground and formal `T-01` now share the same reusable preorder route contract, reducing future drift and making browser verification focus on one canonical rule set.
- Owner: haoyu + codex


## DEC-20260322-44
- Date: 2026-03-22
- Status: accepted
- Context: `T-01` recursive view still showed generic DFS pseudocode with `if preorder / inorder / postorder` branches, and the panel sat well below the traversal canvas, forcing learners to scroll between animation and recursion explanation.
- Decision: Switch the recursive pseudocode to traversal-mode-specific code lines for preorder / inorder / postorder, and place the recursion panel beside the traversal canvas on wide viewports while stacking it responsively on narrower screens.
- Alternatives considered: keep one generic DFS pseudocode block with conditional visit lines; leave the recursion panel below the canvas; fork separate page layouts per traversal mode.
- Consequences: learners now see the exact recursive control flow for the active mode, and can compare animation with recursion state in a single desktop viewport without extra scrolling; level-order remains excluded from the recursion view.
- Owner: haoyu + codex

## DEC-20260323-45
- Date: 2026-03-23
- Status: accepted
- Context: The side-by-side recursion layout still made both the traversal canvas and recursion panel feel cramped, and the recursion column height remained unstable compared with the animation area.
- Decision: Replace the docked recursion column with a draggable, resizable floating recursion panel that keeps the traversal canvas full width and lets learners place the recursion explanation where it helps most.
- Alternatives considered: keep iterating on a fixed two-column layout; move recursion content into a bottom dock; hide content behind multiple tabs inside the page flow.
- Consequences: `T-01` now preserves animation space while still supporting direct recursion comparison, and the panel interaction can evolve independently with future snap presets or persistence tweaks if needed.
- Owner: haoyu + codex

## DEC-20260323-46
- Date: 2026-03-23
- Status: accepted
- Context: After the floating panel landed, `T-01` level-order mode still inherited recursion-only wording/availability rules, continued to show null-child visuals in the main stage, and did not explain BFS queue behavior inside the floating panel.
- Decision: Promote the floating panel to a generic algorithm window, keep it available in level-order mode, hide null-child visuals for level-order rendering, and show a queue-state card plus queue-specific pseudocode while the main trace threads only through real nodes level by level.
- Alternatives considered: keep the panel disabled for level-order; reuse recursion wording for all modes; leave null placeholders visible while only changing the floating panel content.
- Consequences: level-order mode now teaches BFS with the right mental model (queue + real-node visit order), while preorder/inorder/postorder continue to use the same floating window shell for recursion checkpoints and call-stack comparison.
- Owner: haoyu + codex

## DEC-20260328-47
- Date: 2026-03-28
- Status: accepted
- Context: This repository lives under WSL (`/home/haoyu/...`) but was often executed from Windows PowerShell via the `\\wsl$\\...` UNC path. That mixed runtime path caused recurring failures: Windows `cmd/npm` falling back to `C:\\Windows`, shell scripts prompting for an app association, and broken package resolution for `playwright` under the UNC-mounted `node_modules`.
- Decision: Standardize frontend/runtime commands for this repo on WSL-native Node/npm/Playwright, loaded through `nvm`; update `/home/haoyu/.profile` so login shells resolve the WSL-native toolchain by default, and avoid using Windows `node/npm` directly against the `\\wsl$\\...` workspace.
- Alternatives considered: keep using Windows Node against the UNC workspace; duplicate the repo into a Windows path just for package/runtime commands.
- Consequences: local quality gates and Playwright rendering are now reproducible from WSL, but future command examples and automation should prefer `wsl bash -lc 'cd /home/haoyu/data-structure-algorithm-visualizor && ...'` or a native WSL terminal.
- Owner: haoyu + codex

## DEC-20260329-48
- Date: 2026-03-29
- Status: accepted
- Context: An older Windows-side copy appears to exist from a prior migration attempt, but the current WSL repo has become the validated implementation path, and the user is satisfied with the active WSL progress.
- Decision: Keep the WSL repository as the only active source of truth, do not merge the older Windows copy by default, and do not migrate the active repo to Windows at this time.
- Alternatives considered: merge the Windows copy back into the active branch; move the active repo to a native Windows path to avoid UNC/toolchain friction.
- Consequences: work stays on the already-validated WSL-native toolchain and avoids reopening mixed-environment drift; if the Windows copy ever needs to be consulted, treat it as read-only comparison material rather than a live branch to merge blindly.
- Owner: haoyu + codex

## DEC-20260406-49
- Date: 2026-04-06
- Status: accepted
- Context: In the new tree workspace shell, dragging the edge buttons together with the opened panels made the control entrypoints harder to rediscover, but leaving the panels fixed risked covering the active animation focus.
- Decision: Keep the tree workspace edge buttons pinned in place, allow only the opened control/step panels to move, and let those panels auto-avoid the current animation focus on `T-01` / `T-02`.
- Alternatives considered: move buttons and panels together; keep panels fixed with no avoidance; fall back to non-draggable sidebars.
- Consequences: the entry buttons remain stable and discoverable while the animation area can still reclaim space through drag + auto-avoid; future tree pages should follow the same shell contract for consistency.
- Owner: haoyu + codex

## DEC-20260406-50
- Date: 2026-04-06
- Status: accepted
- Context: After closing `P8`, the next obvious choices were continuing new algorithm delivery (`AVL`, `Heap`, etc.) or first unifying the already-implemented module pages around the accepted `T-01` / `T-02` workspace model. Delaying the shell unification would increase future migration cost and make cross-module UX drift harder to control.
- Decision: Use `P9` to unify all implemented modules around the `T-01` / `T-02` stage-first workspace shell before starting the next new algorithm track. Treat `T-01` as the interaction reference, but unify the shell contract rather than requiring a pixel-identical copy on every page.
- Alternatives considered: continue tree-track expansion first; do ad-hoc page polish without a milestone; force an exact `T-01` UI clone on every module.
- Consequences: `P9` focuses on UX/platform consistency instead of new algorithm count, but lowers future migration cost and creates a clearer shared baseline for later modules such as `AVL` and `Heap`.
- Owner: haoyu + codex

## DEC-20260406-51
- Date: 2026-04-06
- Status: accepted
- Context: `P9-M1` needed to reuse the accepted tree workspace interaction on non-tree modules, but copy-pasting `T-01`/`T-02` page structure would create new drift and make the later rollout harder to maintain.
- Decision: Extract a shared `WorkspaceShell` component that keeps the validated shell contract (`Controls`/`Step` edge entrypoints, draggable opened panels, in-stage transport, empty-stage click collapse, optional `focusPoint` auto-avoid) and pilot it on `S-01`, `L-01`, and `SR-02`. For pilot pages, move legend/pseudocode/runtime detail into the right `Step` panel instead of keeping duplicate blocks below the stage.
- Alternatives considered: continue per-page shell rewrites without shared composition; force a pixel-identical `T-01` layout on every page; postpone shell extraction until all non-tree pages were migrated together.
- Consequences: the project now has one reusable stage-first shell primitive for the broader rollout, the pilot pages share a recognizable interaction baseline, and `P9-M2` can focus on migration breadth instead of repeating shell logic.
- Owner: haoyu + codex

## DEC-20260406-52
- Date: 2026-04-06
- Status: accepted
- Context: After the `S-01` follow-up fixes, the remaining sorting pages still risked feeling narrower than `T-01` even if their inner stage content stretched correctly, because the real width bottleneck was the page-level wrapper (`.app-main { max-width: 1200px; }`) rather than the stage alone.
- Decision: Sorting pages that adopt the shared workspace shell should also opt into the same wide-page breakout pattern as tree pages by using `pageClassName="bubble-page tree-page"`, and share the family-level shell styling through `shellClassName="workspace-shell-sorting"` instead of per-page one-off shell classes.
- Alternatives considered: keep sorting pages on narrow page wrappers and only tune inner stage width; keep module-specific shell classes for each sorting page; treat `T-01` wide breakout as tree-only behavior.
- Consequences: sorting modules now read as true full-stage workspace pages instead of narrow content cards, and future `P9-M2` sorting/search/linear migrations have an explicit page-level contract to follow rather than rediscovering the same width issue route by route.
- Owner: haoyu + codex

## DEC-20260407-53
- Date: 2026-04-07
- Status: accepted
- Context: After closing `P9`, the project had two competing next steps: continue broad UX/platform work or resume new algorithm delivery. The accepted shell unification now makes new module work cheaper, and the strongest continuity sits on the tree track because `T-01` / `T-02` already define the interaction baseline for future tree pages.
- Decision: Define `P10` as a tree-track expansion phase with three milestones: `P10-M1` `T-03 AVL Tree` (insert + rebalance focus), `P10-M2` `T-04 Heap` (max-heap fundamentals), and `P10-M3` tree-track acceptance closure.
- Alternatives considered: jump directly to `B-Tree / B+ Tree`; start `Trie` before AVL/Heap; do another broad cross-module polish phase before shipping new modules.
- Consequences: the next phase builds on the freshest validated shell and BST context, keeps scope controlled around two concrete modules, and defers the more conceptually different `B-Tree` / `Trie` work to a later milestone.
- Owner: haoyu + codex

## DEC-20260407-54
- Date: 2026-04-07
- Status: accepted
- Context: The first AVL milestone could easily sprawl into delete/search behaviors or a page-specific shell redesign, which would dilute the teaching goal and increase regression risk right after the shared workspace-shell rollout.
- Decision: Implement `T-03 AVL Tree` as an insert-only AVL teaching module on top of the accepted tree workspace shell, build the initial seed tree through silent AVL inserts so the starting state is always AVL-valid, and expose explicit timeline states for visit, imbalance detection, rotation, and rebalance completion.
- Alternatives considered: include AVL delete in the first iteration; create an AVL-specific page shell; seed the page from an arbitrary BST snapshot and tolerate non-AVL starting states.
- Consequences: `P10-M1` stays reviewable and deterministic while still teaching the core AVL mental model (balance factors + LL/LR/RR/RL rotations); AVL delete remains available as a future milestone instead of complicating the first delivery.
- Owner: haoyu + codex
