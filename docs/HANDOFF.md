# HANDOFF

Use this file for end-of-day handoff. Add one new section per day (latest first).

## 2026-09-17 (Kruskal graph density trial)

### Today Done
- Follow-up heap-sort animation clarity refinement after user review:
  - clarified the visual semantics of heap-sort extraction: the heap root is swapped with the last element of the current heap interval, and the extracted maximum remains in the array's trailing sorted interval
  - added a prominent animated motion path on the heap tree for swap and extract-max frames
  - swap frames now show a blue dashed motion path, two moving dots, pulsing swapped heap nodes, and enlarged moving bars in the array strip
  - extract-max frames now show a green path from the heap root toward the sorted suffix, plus a highlighted sorted chip/bar at the destination
  - enlarged the bottom array/bar panel from a mini strip into a much taller synchronized array view so heap changes and sorted suffix changes are visible without close inspection
  - adjusted heap-sort random/default dataset generation so the first bottom-up heapify pass reaches a visible swap quickly instead of opening with several no-swap comparison-only frames
- Follow-up left module rail centering refinement after user review:
  - clicking a collapsed left-rail category icon now records the intended module-tree target before expanding the rail
  - if the clicked category is the current module's category, the active module link is scrolled to the vertical center of the expanded tree
  - if the clicked category is not the current category, the opened category group is used as the centering target
  - the expand/collapse toggle now reuses the same centering path when opening the rail from the top button
  - added expanded-rail bottom scroll room so late modules such as hash-table pages can still be centered instead of clamping near the bottom
- Follow-up heap-sort visualization redesign after user review:
  - changed `S-07 /modules/heap-sort` from a bar-dominant sorting view to a heap-tree-dominant view
  - the main stage now renders the active heap as a complete-binary-tree node/edge diagram
  - current compare/swap/path highlights now appear on heap nodes and heap edges
  - the sorted suffix is shown as a compact strip outside the active heap
  - the array/bar representation is retained as a compact auxiliary strip at the bottom to preserve the array-storage mapping
  - reduced the built-in heap-sort data-size picker max from `100` to `31` so the complete heap tree remains inspectable; manual larger input still shows an overflow count
- Follow-up module taxonomy refinement after user review:
  - moved `T-03 Binary Search Tree (BST)` from the tree category to the search category
  - moved `H-01 Hash Table - Chaining` and `H-02 Hash Table - Open Addressing` from the standalone hash category to the search category
  - removed `hash` from the top-level module category order so the left rail/homepage no longer show a separate Hashing/哈希 group
  - updated search/tree category descriptions in English and Chinese to reflect that BST and hash tables belong under search
  - updated the module filtering unit test fixture so hash-table modules are expected under search
- Follow-up directed-edge curve refinement after user review:
  - audited graph pages after the request that directed edges should not overlap when opposite directions exist
  - confirmed static graph pages (`G-01`/`G-02`/`G-03`) already use curved directed edge paths
  - upgraded the shared graph-stage geometry helper so algorithm pages can render directed edges as quadratic curves and undirected edges as straight segments
  - changed directed algorithm pages (`G-04` DFS, `G-05` BFS, `G-06` Dijkstra directed preset, `G-07` Bellman-Ford, `G-08` Floyd-Warshall, `G-11` topological sort) from straight line edges to curved SVG paths
  - kept Dijkstra's undirected preset as straight edges with no arrowheads
  - moved weighted-edge labels to the curve midpoint instead of the old straight-line midpoint
  - added `fill: none` to shared graph edges so SVG paths do not accidentally fill
- Follow-up Dijkstra graph-type correction after user review:
  - added a `positiveUndirected` weighted-graph preset for Dijkstra because Dijkstra applies to non-negative directed and undirected graphs
  - included both `positiveDirected` and `positiveUndirected` in the Dijkstra non-negative preset picker
  - changed Dijkstra edge/relation display to use an undirected connector for undirected presets
  - changed the Dijkstra canvas so outline arrows are rendered only for directed presets
  - added localized labels for the new positive undirected preset
  - added unit coverage for the undirected Dijkstra shortest-path result and for exposing both non-negative presets
- Follow-up left module rail interaction refinement after user review:
  - collapsed left module-rail category icons now open the full sidebar in place instead of navigating directly to the first module in that category
  - opening from a collapsed category icon also ensures that category is expanded in the remembered module tree
  - the collapsed search/module icon now opens the full sidebar while staying on the current module route
- Follow-up directed-arrow refinement after user review:
  - replaced the filled SVG marker arrowheads on directed graph algorithm pages with G03-style open outline arrow paths
  - clipped graph edge start/end points before drawing so arrow tips stop outside node circles instead of being covered by nodes
  - added a shared `graphStageGeometry` helper for straight graph-stage edge clipping and outline arrowhead construction
  - kept existing edge state colors for normal, completed, selected, and active algorithm edges
- Follow-up layout refinement after user review:
  - changed the Kruskal stage from a top-graph/bottom-panels layout into a G02-like left/right composition
  - left side now contains only the draggable graph canvas
  - right side now stacks the current-step explanation, connected components, and sorted-edge order vertically
  - connected components now render as a two-column compact grid
  - sorted-edge order now sits under connected components on the right side and uses a two-column compact grid
  - disabled whole-stage panning for Kruskal and moved panning to the graph-only layer so dragging the right-side content does not move the graph
  - kept the compact component chips so one- or two-character vertex labels no longer sit inside oversized boxes
- Follow-up fix after user review:
  - removed the current-step explanation card from above `连通分量`; that text remains available in the existing step sidebar and top status pill
  - Kruskal right-side stage content now contains only `连通分量` and `边顺序`
  - extended the same left-graph/right-status stage composition to `G-04`~`G-11`
  - graph algorithm stage view cards now stack vertically in the right column instead of occupying a bottom row under the graph
- Follow-up Kruskal process-semantics refinement after user review:
  - initial graph now shows all edges as weak dashed pending edges instead of fully visible ordinary edges
  - candidate edge is highlighted separately in amber during inspection
  - chosen MST edges become green solid lines as they are selected
  - cycle-rejected edges become red dashed lines
  - the right-side sorted-edge panel now starts empty and reveals only processed edges as playback advances, instead of showing every sorted candidate from the beginning
  - added a localized empty state for the edge-order panel before any edge has been processed
- Trial-refined the graph algorithm visual language on the Kruskal page that contains `边顺序` and `连通分量`:
  - reduced shared graph edge stroke widths so ordinary/selected/frontier/rejected/active lines read thinner and more consistent
  - reduced weighted-edge label size and weight so edge weights no longer dominate the graph
  - added a Kruskal-specific stage class so this page can reserve more room for the lower information panels without changing every graph algorithm page at once
- Reworked the Kruskal lower panels:
  - `边顺序` now uses compact wrapping chips instead of tall scrolling cards
  - `连通分量` now uses compact inline component rows and small node chips instead of oversized boxes for one- or two-character labels
  - removed the remaining visible hint/subtitle spans from these panels

### Verification
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/heap-sort` confirmed:
  - default bottom array/bar area height is about `224px`
  - first swap frame renders `1` animated motion path, `2` moving dots, and `2` moving bars
  - first extract-max frame renders `1` animated extract path, `1` active sorted chip, `1` sorted bar, and the sorted suffix count increases at the array tail
  - fresh default data reaches the first visible swap at frame `3/56`, avoiding the previous long comparison-only opening
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/hash-open-addressing` confirmed:
  - collapsed left rail starts with `data-module-rail-expanded = false`
  - clicking the active `查找` category icon changes `data-module-rail-expanded` to `true`
  - the expanded module tree highlights `H-02 哈希表 - 开放寻址法`
  - the active module link is vertically centered in the rail (`activeCenterDeltaFromRail = 0`)
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/kruskal` confirmed:
  - graph edge stroke is `0.42px`
  - edge-weight text is `2.65px` / font weight `600`
  - latest layout check confirms the stage is a two-column grid, with left side about `969px` and right side about `329px`
  - latest layout check confirms the right-side panel order is explanation, connected components, sorted-edge order
  - latest layout check confirms the right-side row heights are about `135px / 165px / 239px`
  - latest layout check confirms `连通分量` renders two columns and has `scrollHeight = clientHeight = 132`
  - latest layout check confirms `边顺序` renders two columns and has `scrollHeight = clientHeight = 207`
  - latest interaction check confirms dragging the graph moves nodes by `70,35`
  - latest interaction check confirms dragging the right-side content moves neither the graph nor the right-side panels
  - latest cross-route check confirms `G-04`~`G-11` each use a two-column graph stage of about `969px / 329px`
  - latest cross-route check confirms the status panels sit to the right of the graph on all eight routes
  - latest cross-route check confirms no graph-stage view header contains the active step-description text
  - latest cross-route check confirms Kruskal right-side headers are only `Component groups` and `Sorted edge order`
  - latest Kruskal process check confirms initial state has `8` pending edges, `0` selected edges, `0` rejected edges, and an empty processed-edge panel
  - latest Kruskal process check confirms after inspection there is `1` amber candidate edge and `7` pending edges
  - latest Kruskal process check confirms selected edges become green solid lines and appear in the processed-edge panel
  - latest Kruskal process check confirms a cycle-rejected edge becomes a red dashed line and appears as a rejected row
  - page/console errors count is `0`
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/{dfs,bfs,dijkstra,bellman-ford,floyd-warshall,topological-sort}` confirmed:
  - `.graph-edge-layer marker` count is `0`
  - `[marker-end]` count is `0`
  - `.graph-edge-outline-arrow` renders with `fill: none`
  - page/console errors count is `0`
  - line endpoints are clipped away from node centers (`minStartDistance = 6.4`, `minEndDistance = 7.6` in stage coordinates on checked routes)
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/dfs` confirmed:
  - collapsed left rail starts with `data-module-rail-expanded = false`
  - clicking a collapsed rail icon changes `data-module-rail-expanded` to `true`
  - the URL stays on `#/modules/dfs`
  - the full module tree becomes visible with `display: grid`
  - page/console errors count is `0`
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/dijkstra` confirmed:
  - the right-sidebar preset picker shows both `Positive directed graph` and `Positive undirected graph`
  - switching to `Positive undirected graph` makes `.graph-edge-outline-arrow` count `0`
  - the graph still renders `8` weighted edges
  - the sample edge list uses undirected connectors such as `A - B (4)`
  - page/console errors count is `0`
- Browser verification on directed graph algorithm routes confirmed:
  - `dfs`, `bfs`, `dijkstra`, `bellman-ford`, `floyd-warshall`, and `topological-sort` render all graph edges with `Q` curve commands
  - all checked directed pages keep outline arrowheads visible
  - `.graph-edge` computed fill is `none`
  - Dijkstra's undirected preset still renders `8` straight `L` edge paths and `0` arrowheads
  - Floyd-Warshall's reciprocal `A -> D` and `D -> A` paths use opposite curve controls, so the two directions are visually separated
  - page/console errors count is `0`
- Browser verification on module taxonomy confirmed:
  - `/modules/bst`, `/modules/hash-chaining`, and `/modules/hash-open-addressing` show `Search` in the top module picker
  - the left module tree no longer has a standalone `Hashing` group
  - the expanded Search group contains `SR-01`, `SR-02`, `T-03`, `H-01`, and `H-02`
  - the expanded Tree group no longer contains `T-03`
  - the homepage left tree no longer shows a standalone Hashing/哈希 group
  - page/console errors count is `0`
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/heap-sort` confirmed:
  - default stage renders `10` heap nodes and `9` heap edges
  - auxiliary mini-array renders `10` bars
  - built-in data-size selector max value is `31`
  - after advancing playback, heap nodes, path nodes, and active heap edges are highlighted
  - page/console errors count is `0`
- Passed:
  - `npx eslint src/pages/modules/HeapSortPage.tsx`
  - `npm test -- src/modules/sorting/heapSort.test.ts src/modules/sorting/heapTimelineReplay.test.ts`
  - `npm run build`
  - browser interaction verification for heap-sort swap / extract-max motion and enlarged bottom bars
  - `npx eslint src/app/layout/Layout.tsx`
  - `npm run build`
  - browser interaction verification for collapsed-left-rail icon expansion and active-module centering
  - `npx eslint src/pages/modules/HeapSortPage.tsx`
  - `npm test -- src/modules/sorting/heapSort.test.ts src/modules/sorting/heapTimelineReplay.test.ts`
  - `npm test -- src/pages/modulesPageUtils.test.ts`
  - `npx eslint src/data/moduleRegistry.ts src/pages/moduleCatalog.ts src/pages/modulesPageUtils.test.ts src/i18n/translations.ts`
  - `npx eslint src/pages/modules/graphStageGeometry.ts src/pages/modules/DfsPage.tsx src/pages/modules/BfsPage.tsx src/pages/modules/DijkstraPage.tsx src/pages/modules/BellmanFordPage.tsx src/pages/modules/FloydWarshallPage.tsx src/pages/modules/TopologicalSortPage.tsx`
  - `npm test -- src/modules/graph/dijkstra.test.ts src/modules/graph/dijkstraTimelineReplay.test.ts`
  - `npx eslint src/modules/graph/weightedGraph.ts src/modules/graph/dijkstra.test.ts src/pages/modules/DijkstraPage.tsx src/i18n/translations.ts`
  - `npx eslint src/app/layout/Layout.tsx`
  - `npx eslint src/pages/modules/DfsPage.tsx src/pages/modules/BfsPage.tsx src/pages/modules/DijkstraPage.tsx src/pages/modules/BellmanFordPage.tsx src/pages/modules/FloydWarshallPage.tsx src/pages/modules/TopologicalSortPage.tsx src/pages/modules/graphStageGeometry.ts`
  - `npx eslint src/pages/modules/KruskalPage.tsx`
  - `npx eslint src/pages/modules/KruskalPage.tsx src/i18n/translations.ts`
  - `npm test -- src/modules/graph/kruskal.test.ts src/modules/graph/kruskalTimelineReplay.test.ts`
  - `npm run build`
  - `git diff --check -- src/pages/modules/HeapSortPage.tsx src/index.css`
  - `git diff --check -- src/data/moduleRegistry.ts src/pages/moduleCatalog.ts src/pages/modulesPageUtils.test.ts src/i18n/translations.ts`
  - `git diff --check -- src/pages/modules/graphStageGeometry.ts src/pages/modules/DfsPage.tsx src/pages/modules/BfsPage.tsx src/pages/modules/DijkstraPage.tsx src/pages/modules/BellmanFordPage.tsx src/pages/modules/FloydWarshallPage.tsx src/pages/modules/TopologicalSortPage.tsx src/index.css`
  - `git diff --check -- src/modules/graph/weightedGraph.ts src/modules/graph/dijkstra.test.ts src/pages/modules/DijkstraPage.tsx src/i18n/translations.ts`
  - `git diff --check -- src/app/layout/Layout.tsx src/index.css`
  - `git diff --check -- src/pages/modules/graphStageGeometry.ts src/pages/modules/DfsPage.tsx src/pages/modules/BfsPage.tsx src/pages/modules/DijkstraPage.tsx src/pages/modules/BellmanFordPage.tsx src/pages/modules/FloydWarshallPage.tsx src/pages/modules/TopologicalSortPage.tsx src/index.css docs/HANDOFF.md`
  - `git diff --check -- src/pages/modules/KruskalPage.tsx src/index.css docs/HANDOFF.md`
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`104` files / `335` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Committed locally on `feat/p14-backlog-wave`:
  - `6f43375 docs: checkpoint visualizer planning and evidence`
  - `6b6a67d feat: unify visualizer workspace shell`
  - `b3f17c0 feat: refine graph modules and directed edges`
  - `d18a8d0 feat: clarify heap sort extraction animation`
- Working tree was clean immediately after these commits.
- Important verification caveat:
  - targeted checks, tests, build, and browser smoke listed above passed
  - full `npm run check` still stops at the documented pre-existing React lint blockers in `useStageAnchorPanel`, `HuffmanTreePage`, and `StackPage`

### Next Step
- Next implementation work should start from the committed shared shell / graph / heap-sort baseline above.
- Before calling the milestone fully closed, decide whether to fix the remaining repo-wide lint blockers or keep them as a separate stabilization task.

## 2026-09-16 (G-04 to G-11 graph algorithm layout cleanup)

### Today Done
- Updated the shared graph-algorithm stage layout used by `G-04`~`G-11`:
  - increased the graph canvas area from the previous squat layout to a measured `420px` at the checked desktop viewport
  - compressed the lower data/state area to a measured `120px`
  - removed the inner graph-canvas card chrome so the graph itself reads as the primary canvas content
- Tightened graph algorithm data/status panels:
  - compacted card headers, row padding, gaps, chip sizes, and distance/state rows
  - changed graph-list and distance/status panels to denser auto-fitting grids
  - made chips and short labels avoid unnecessary word breaks where possible
- Removed visible graph-page subtitles across:
  - `G-04 /modules/dfs`
  - `G-05 /modules/bfs`
  - `G-06 /modules/dijkstra`
  - `G-07 /modules/bellman-ford`
  - `G-08 /modules/floyd-warshall`
  - `G-09 /modules/kruskal`
  - `G-10 /modules/prim`
  - `G-11 /modules/topological-sort`
- Removed the old graph-canvas label text from the same routes.

### Verification
- Browser verification on all eight routes confirmed:
  - graph canvas height is `420px`
  - lower view area height is `120px`
  - visible `.graph-stage-view-head span` count is `0`
  - `.graph-stage-label` count/visible count is `0`
  - page/console errors count is `0`
- Passed:
  - `npx eslint src/pages/modules/DfsPage.tsx src/pages/modules/BfsPage.tsx src/pages/modules/DijkstraPage.tsx src/pages/modules/BellmanFordPage.tsx src/pages/modules/FloydWarshallPage.tsx src/pages/modules/PrimPage.tsx src/pages/modules/KruskalPage.tsx src/pages/modules/TopologicalSortPage.tsx`
  - `npm run build`
  - `git diff --check` on touched graph page files and `src/index.css`

### Current State
- Updated:
  - `src/index.css`
  - `src/pages/modules/DfsPage.tsx`
  - `src/pages/modules/BfsPage.tsx`
  - `src/pages/modules/DijkstraPage.tsx`
  - `src/pages/modules/BellmanFordPage.tsx`
  - `src/pages/modules/FloydWarshallPage.tsx`
  - `src/pages/modules/PrimPage.tsx`
  - `src/pages/modules/KruskalPage.tsx`
  - `src/pages/modules/TopologicalSortPage.tsx`
  - `docs/HANDOFF.md`

### Next Step
- If visual review still finds any graph algorithm page crowded or too sparse, tune the specific view-card content rather than reverting the shared graph-stage ratio.

## 2026-09-16 (G-03 adjacency list cleanup)

### Today Done
- Updated `G-03 /modules/graph-adjacency-list` to follow the refined G-02 page rules:
  - rebuilt the right-sidebar controls as compact dropdown fields for direction, weight mode, and vertex count
  - removed the `图示样本` title and the explanatory subtitle under the adjacency-list storage panel
  - removed the inner graph drawing board background/border/radius so the graph sits directly on the shared workspace canvas
  - changed `定义与说明` from two columns to one ordered single-column list
  - expanded the teaching copy with vertex-array/head-pointer structure, edge-node fields, directed/undirected storage rules, weighted edge fields, sparse-graph space cost, degree rules, adjacency-check trade-offs, and BFS/DFS suitability
- Disabled whole-stage panning for G-03 and added a local graph-only pan layer so dragging moves only graph nodes/edges while the adjacency-list storage and notes stay fixed.
- Tightened adjacency-list controls and storage rows:
  - flattened the old large toolbar styling
  - reduced row gaps, node width, and list-card padding
  - kept combined right-sidebar controls in a single column like G-02

### Verification
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/graph-adjacency-list` confirmed:
  - graph title count is `0`
  - adjacency-list storage header subtitle count is `0`
  - `.adjacency-list-graph-panel` and `.adjacency-list-graph-stage` are transparent with no border/radius/shadow
  - `定义与说明` renders one grid column and `12` numbered paragraphs
  - dragging the graph moves nodes by `55,40` while the list panel and info panel remain at `0,0` delta
  - combined right-sidebar controls render as one full-width column
- Passed:
  - `npx eslint src/pages/modules/GraphAdjacencyListPage.tsx`
  - `npm run build`

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyListPage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Continue applying the same static graph-page cleanup rules to remaining graph concept/representation pages if they still show inner drawing boards, subtitles, or old control styles.

## 2026-09-16 (G-02 adjacency matrix cleanup)

### Today Done
- Cleaned up `G-02 /modules/graph-adjacency-matrix` drawing-area styling:
  - removed the extra inner white board from the graph sample area
  - made the graph stage transparent, borderless, and radius-free so it matches the shared workspace canvas
- Reworked the G-02 right-sidebar controls:
  - direction and weight mode now use compact dropdown fields instead of stacked styled toggle buttons
  - controls render as a single tight column in the combined right sidebar
  - the no-step combined sidebar can use the full drawer height instead of being capped to a short scrolling block
- Removed explanatory subtitle text from the graph sample, vertex array, and adjacency matrix section headers.
- Tightened the vertex array and adjacency matrix presentation:
  - vertex chips use smaller padding, tighter gaps, and compact text
  - matrix cells are fixed to a compact size and no longer inherit the larger generic matrix cell width
- Follow-up layout refinement after user review:
  - changed the right-side storage area from three vertical blocks into a compact two-column storage row
  - made the vertex array render vertically beside the adjacency matrix
  - changed `定义与说明` to a single-column list instead of the previous two-column layout
- Follow-up whitespace/content refinement:
  - made the right-side storage row shrink to the real vertex-array and matrix content width so the matrix panel no longer has a large empty area on its right
  - expanded `定义与说明` with fuller descriptions of vertex-array indexing, unweighted/weighted matrix values, directed/undirected semantics, degree rules, query complexity, sparse/dense graph trade-offs, and typical matrix-based algorithms
- Follow-up graph-sample interaction refinement:
  - removed the `图示样本` section title from the graph drawing area
  - aligned the `顶点数组` and `邻接矩阵` blocks to the same height
  - disabled whole-stage panning for G-02 and moved panning to a local graph-only layer so dragging moves only the graph nodes/edges
- Follow-up storage-canvas refinement:
  - merged `顶点数组` into the same storage canvas/table as `邻接矩阵`
  - replaced the independent vertex-array panel with a fixed left vertex-array column inside the matrix table
  - aligned each vertex-array row with the corresponding matrix row, matching the G-03 mental model of a header array paired with its storage structure
  - restored visible vertex-array cell styling inside the combined table so the left column still reads as array cells rather than plain text
  - restored the matrix row vertex markers (`v0`~`v4`) and added a visible spacer between the vertex-array column and matrix body

### Verification
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/graph-adjacency-matrix` confirmed:
  - `.adjacency-matrix-graph-panel` is transparent with no border/radius/shadow
  - `.adjacency-matrix-graph-stage` is transparent with no border/radius/background image
  - section subtitle count is `0`
  - the right controls section has `max-height: none` and no inner overflow
  - controls render as a single column
  - vertex chips and matrix cells render compactly
  - latest layout check confirms the vertex array panel sits left of the matrix panel, vertex chips share one vertical x-position, and `定义与说明` has one grid column
  - latest whitespace check confirms the storage row shrinks to `474px`, the matrix panel is `314px`, and the matrix table is `280px`, leaving only normal panel padding instead of a large blank area
  - latest interaction check confirms the graph title count is `0`, the vertex-array and matrix panels are both `305px` high, dragging moves graph nodes by `60,35`, and the storage/info panels remain at `0,0` delta
  - latest storage-canvas check confirms independent vertex-array panel count is `0`, the matrix table has one vertex-array column plus five matrix columns, and all five vertex rows align with matrix rows at `0px` top/height difference
  - latest cell-style check confirms vertex-array cells have `1px` border, white background, `8px` radius, and still align with matrix rows at `0px` top/height difference
  - latest spacing check confirms the matrix row headers render `v0`~`v4`, the spacer column is `18px` wide, the visual gap from vertex-array cells to matrix row headers is `26px`, and row alignment remains `0px` top/height difference
- Passed:
  - `npx eslint src/pages/modules/GraphAdjacencyMatrixPage.tsx`
  - `npm run build`
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`104` files / `333` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`
- Not run:
  - `npm test -- src/modules/graph/adjacencyMatrix.test.ts` because this repository currently has `src/modules/graph/adjacencyMatrix.ts` but no matching `adjacencyMatrix.test.ts` file.

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyMatrixPage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Continue through remaining graph pages for the same cleanup categories: no inner drawing board, compact right-sidebar controls, no explanatory subtitles, and dense data panels.

## 2026-09-16 (T-01 compact controls and tree-shape generation)

### Today Done
- Follow-up refinement after user review:
  - removed `随机树` as a tree-kind option; `随机生成` now generates a new ordinary-tree sample while keeping the selected kind as `普通树`
  - removed the redundant `树类型` summary chip from the control panel
  - compressed the T-01 shape dropdown so it no longer stretches vertically in the right sidebar
  - forced the seven `当前节点关系` cards onto one row at the checked desktop viewport
  - expanded `定义与说明` with richer teaching content about recursive tree definition, parent uniqueness, paths, forest, node degree, levels, and binary-tree special forms
- Follow-up control-density refinement:
  - removed the visible `形态` label so the tree-shape dropdown and `随机生成` button sit on the same visual row
  - `随机生成` no longer changes the selected tree shape; selecting `二叉树` and clicking it keeps the dropdown on `二叉树`
  - enlarged the four summary-chip fonts while reducing each chip to a measured `22px` height
- Follow-up sidebar-density refinement:
  - changed the T-01 control panel to a single vertical column because the page has few controls
  - narrowed the T-01 combined right sidebar from the shared `380px` width to a measured `304px`
  - kept the stage shrink behavior aligned with the narrower sidebar so the canvas reclaims the extra horizontal space
- Follow-up tree-sample interaction refinement:
  - removed the extra white card shell from the `树形样本` area so it visually reads closer to the shared canvas surface
  - removed the inner `tree-definition-stage` drawing-board background/border/radius as well; the tree sample now sits directly on the shared workspace canvas like other modules
  - added an `enableStagePan` switch to the shared/static workbench shell and disabled whole-stage panning for T-01
  - moved panning to a local `树形样本` pan layer so dragging moves only the tree nodes/edges, while `当前节点关系` and `定义与说明` stay fixed
- Updated static workbench behavior so pages without explicit step content no longer render a default `步骤` sidebar section.
- Refined `T-01 /modules/tree-definition` controls:
  - replaced the loose toggle-style panel with a compact tree-shape dropdown, one `随机生成` button, and small stat chips
  - kept the right drawer focused on controls only for this no-step module
- Extended the tree-definition sample model with five selectable shapes:
  - `普通树`
  - `随机树`
  - `二叉树`
  - `完全二叉树`
  - `满二叉树`
- Added deterministic seeded random tree generation plus fixed complete/full binary-tree samples.
- Added unit coverage for complete-tree shape, full-tree internal-node degree, and random-tree determinism.

### Verification
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/tree-definition` confirmed:
  - the right drawer renders `1` controls section and `0` steps sections
  - the dropdown options are `普通树 / 二叉树 / 完全二叉树 / 满二叉树`
  - `完全二叉树` renders `9` nodes
  - `满二叉树` renders `7` nodes
  - `随机生成` keeps the kind as `普通树`, generates `7`~`10` nodes, and changes the edge layout across clicks
  - the `树类型` summary label is gone, the dropdown height is `30px`, and the seven relation cards share one row
  - latest check confirms dropdown height `30px`, random-button height `26px`, summary-chip height `22px`, and clicking `随机生成` while `二叉树` is selected keeps the value as `binary`
  - latest sidebar check confirms right drawer width `304px`, dropdown/button/summary chips all share one column, and the central stage shrinks to the narrower drawer width
  - latest tree-sample check confirms the sample card background/border/shadow are gone, dragging moves nodes by `80,40`, and the relation panel remains at `0,0` delta
  - latest inner-stage check confirms `.tree-definition-stage` has transparent background, no background image, `0px` border, and `0px` radius, while local panning still works and relation content remains fixed
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`104` files / `333` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`
- Passed:
  - `npm run build`

### Current State
- Updated:
  - `src/components/WorkspaceShell.tsx`
  - `src/components/StaticWorkbenchShell.tsx`
  - `src/modules/tree/treeDefinition.ts`
  - `src/modules/tree/treeDefinition.test.ts`
  - `src/pages/modules/TreeDefinitionPage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Review other static/no-step modules only if any still show unwanted placeholder step content after the shared `showStepPanel` rule.

## 2026-09-16 (G-01 graph definition control and canvas cleanup)

### Today Done
- Fixed `G-01 /modules/graph-representation` drawing-area styling:
  - removed the inner `graph-concept-stage` background/border/radius/shadow
  - removed the inner `graph-concept-canvas` background/border/radius
  - the graph now sits directly on the shared workspace canvas instead of on a separate white board
- Rebuilt the G-01 right-sidebar controls away from the old dense toggle-button strip:
  - tab, direction, weight, density, scenario, and vertex count now use compact dropdowns
  - graph generation/demo/reset actions remain buttons but render as full-width flat rows
  - removed the old rendered control clusters/dividers that created stacked styled buttons in the narrow sidebar
- Flattened the old G-01 control CSS by removing heavy gradients, gold active states, inset shadows, and clustered button chrome.
- Fixed the shared combined-right-sidebar behavior for no-step pages:
  - when the right drawer has no `.tree-workspace-sidebar-section-steps`, the controls section no longer keeps the old `min(44svh, 340px)` cap
  - G-01 controls now expand to the full available right drawer height instead of scrolling inside a short upper block

### Verification
- Browser verification on `http://127.0.0.1:4186/ui/visualizer/#/modules/graph-representation` confirmed:
  - `.graph-concept-stage` has no background image, `0px` border, `0px` radius, and no shadow
  - `.graph-concept-canvas` has no background image, `0px` border, and `0px` radius
  - right-sidebar controls render `6` full-width dropdowns at `30px` height
  - action buttons render full-width, flat, no-shadow rows at `28px` height
  - old `.graph-concept-control-cluster` elements no longer render
  - no-step controls section measures `706px` high with `max-height: none`; controls body height and scroll height both measure `674px`, so the content is fully visible
- Passed:
  - `npx eslint src/pages/modules/GraphRepresentationPage.tsx`
  - `npm run build`

### Current State
- Updated:
  - `src/pages/modules/GraphRepresentationPage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Continue checking other graph/storage concept pages for the same two classes of issue: inner drawing-board backgrounds and legacy dense button clusters in the combined right sidebar.

## 2026-09-16 (Tree module numbering and definition-page cleanup)

### Today Done
- Renumbered the tree module display/catalog sequence into a continuous `T-01`~`T-09` run:
  - `T-01` 树的定义与基本关系
  - `T-02` 二叉树遍历
  - `T-03` 二叉搜索树（BST）
  - `T-04` AVL 树
  - `T-05` 堆
  - `T-06` Huffman Tree
  - `T-07` B-Tree
  - `T-08` B+ Tree
  - `T-09` Trie
- Kept existing routes unchanged, only updating module IDs/title mappings so saved links do not break.
- Updated homepage quick/favorite module IDs that referenced the old tree numbering.
- Updated the tree-definition page:
  - removed explanatory subtitle lines under `树形样本`, `当前节点关系`, and `定义与说明`
  - changed `当前节点关系` from one item per row to an auto-fitting multi-column row layout
  - changed `定义与说明` from two columns to one full-width row per point
  - removed old double-column helper logic and stale CSS

### Verification
- Browser/Playwright CLI confirmed:
  - `/modules/tree-definition` page title is `T-01 树的定义与基本关系`
  - expanded left tree group lists `T-01` through `T-09` continuously
  - `树形样本`, `当前节点关系`, and `定义与说明` each have `0` subtitle spans
  - `当前节点关系` renders multiple cards on the same row
  - definition paragraphs render as full-width single-column rows
- Passed:
  - targeted ESLint on changed TS/TSX files
  - tree tests (`14` files / `56` tests)
  - `npm run build`
  - `git diff --check` for the touched files
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/data/moduleRegistry.ts`
  - `src/pages/moduleCatalog.ts`
  - `src/pages/HomePage.tsx`
  - `src/i18n/translations.ts`
  - `src/pages/modules/TreeDefinitionPage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- If the user wants the same no-subtitle rule beyond the tree-definition page, audit non-tree static storage/graph pages next because many still have `<strong>title</strong><span>explanation</span>` section headers.

## 2026-09-16 (Combined right-sidebar control panel cleanup)

### Today Done
- Fixed the user-reported `M-01 /modules/two-dimensional-array` issue where the right-sidebar control panel content was constrained inside an extremely small inner area.
- Added a shared combined-sidebar rule so all control bodies rendered inside the right drawer ignore old floating-panel width/max-height constraints.
- Added a combined-sidebar max height for the control section (`min(44svh, 340px)`) so short control panels show fully while long control panels get a usable scroll area and do not consume the whole step drawer.
- Added compact two-column right-sidebar grid rules for static workbench controls:
  - storage pages (`M-01`~`M-07`)
  - adjacency storage pages
  - tree-definition / graph-concept style static pages

### Verification
- Browser/Playwright CLI measurement passed on `M-01`:
  - drawer width `380px`
  - controls body width `379px`
  - controls body height `100px`
  - controls scroll height `100px`
  - toolbar columns `173.5px 173.5px`
- Browser/Playwright CLI cross-check passed on:
  - `/modules/two-dimensional-array`
  - `/modules/symmetric-matrix`
  - `/modules/generalized-list-head-tail`
  - `/modules/graph-representation`
  - `/modules/graph-adjacency-matrix`
  - `/modules/tree-definition`
  - `/modules/array`
  - `/modules/linked-list`
  - `/modules/quick-sort`
- Confirmed checked pages now have right-sidebar controls matching drawer width, `max-height: none` on the inner control body, and reasonable two-column control grids where applicable.
- Passed:
  - `npm run build`
  - `git diff --check src/index.css`
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Continue using the shared combined-sidebar control-body rule instead of adding page-by-page fixes for old drawer sizing problems.

## 2026-09-16 (Linear module compact controls and names)

### Today Done
- Updated the 8 requested linear modules so the combined right-sidebar control panel uses a compact two-column layout:
  - 单链表 / 双链表 / 循环链表
  - 顺序栈 / 链栈
  - 顺序队列 / 链队列 / 循环队列
- Added combined-sidebar CSS overrides for linked-list, stack, and queue control grids so old page-specific wide-column rules no longer create sparse rows in the right drawer.
- Renamed the visible Chinese module titles to exactly match the user's requested names:
  - `单链表`, `双链表`, `循环链表`, `顺序栈`, `链栈`, `顺序队列`, `链队列`, `循环队列`
- Fixed `L-04` and `L-05` module title key mapping so the top module picker also shows `顺序栈` and `顺序队列` instead of the old aggregate labels.
- Cleaned up related Chinese stack/queue copy that still said `顺序存储栈`, `链式栈`, or `链式队列`.

### Verification
- Browser checked all 8 target routes at `http://127.0.0.1:4186/ui/visualizer/` with Chinese language enabled:
  - `/modules/linked-list`
  - `/modules/doubly-linked-list`
  - `/modules/circular-linked-list`
  - `/modules/sequential-stack`
  - `/modules/linked-stack`
  - `/modules/sequential-queue`
  - `/modules/linked-queue`
  - `/modules/circular-queue`
- Confirmed each route shows the requested Chinese name in the page title and top picker, and the right-sidebar controls use two equal columns (`166.25px 166.25px` at the checked viewport).
- Passed:
  - `npm run build`
  - targeted linear tests (`7` files / `65` tests)
  - `git diff --check` passed, with only Windows LF/CRLF warnings
  - targeted ESLint on touched TS files passed with only the existing `LinkedListPage.tsx` hook dependency warning
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/index.css`
  - `src/i18n/translations.ts`
  - `src/pages/moduleCatalog.ts`
  - `docs/HANDOFF.md`

### Next Step
- If the user accepts this visual density, keep using the same combined-sidebar two-column rule for any remaining page-specific control panels that feel too loose.

## 2026-09-16 (Array combined sidebar layout fix)

### Today Done
- Fixed the `L-01 /modules/array` combined right-sidebar layout so the controls area no longer behaves like an old floating drawer inside the new sidebar.
- Added combined-sidebar-specific CSS overrides for `.array-controls-drawer`:
  - width now follows the right drawer instead of forcing `440px`
  - removed the old max-height/internal-scroll clamp
  - controls grid now uses compact drawer-friendly columns
- This addresses the user-reported problem where the controls and steps sections left large blank space while the controls content was clipped in a narrow inner scroller.
- Follow-up fix: constrained the array stage body and linear stage layout to `width/max-width: 100%` with `min-width: 0`, so opening the right drawer shrinks the actual canvas content area instead of only shrinking the outer stage frame.
- Follow-up control-density fix: in the array combined right sidebar, `插入值` and `演示速度` now share one row in a stable two-column grid. The old base rule that forced speed into column `4` is overridden in combined-sidebar mode to avoid implicit narrow columns.

### Verification
- Browser measurement on `http://127.0.0.1:4186/ui/visualizer/#/modules/array` after opening the right drawer:
  - before: drawer width `380px`, controls body width `440px`, controls body height `116px`, scroll height `288px`
  - after: combined drawer width `380px`, controls body width `379px`, controls body height and scroll height both `276px`, overflow `visible`
  - after: steps section receives the remaining drawer height and keeps its own normal scrolling
- Follow-up browser measurement confirmed the array canvas content now shrinks with the right drawer:
  - `1280px` viewport: stage body `1206px -> 826px`, array cells `1142px -> 762px`
  - `1024px` viewport: stage body `950px -> 570px`, array cells `886px -> 506px`
- Follow-up browser measurement confirmed the array controls grid is now two columns (`166.25px 166.25px` at `1280px` viewport) and `插入值` / `演示速度` sit on the same row with equal widths.
- Passed:
  - `npm run build`
  - `npx eslint src/pages/modules/ArrayPage.tsx src/components/WorkspaceShell.tsx`
  - `git diff --check` passed, with only Windows LF/CRLF warnings
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Visually review `/modules/array` with the right drawer open and confirm the controls + steps vertical split now feels like one coherent sidebar instead of a nested clipped panel.

## 2026-09-15 (Right-sidebar combined controls trial)

### Today Done
- Added an opt-in `WorkspaceShell` right-sidebar mode for combining controls and step/pseudocode content in one right drawer.
- Promoted the accepted combined right-sidebar rule to the default `WorkspaceShell` mode, so shared workbench modules now use it unless they explicitly opt out.
- Updated the old docked/adaptive branch so combined mode still uses the same right-side drawer contract instead of dropping controls.
- In the trial mode:
  - the top `控制` button opens the right drawer instead of a floating control panel
  - the right-edge arrow opens/closes the same combined drawer
  - the drawer is split vertically: controls on top, step/pseudocode details below
  - the canvas shrinks left by the right drawer width instead of being covered
- Refined the quick-sort trial after visual review:
  - removed the top `控制` command button in combined-sidebar mode; the right-edge arrow is the drawer entry
  - changed `数据集大小` and `演示速度` to compact selects
  - compressed the four regenerate actions into one 2x2 button grid and removed the sample-input block
  - tightened the step panel with a two-column metric grid
  - moved the legend out of the right drawer and into a vertical overlay on the left side of the stage
  - further tightened the controls area by reducing section header/body padding and control row gaps
  - removed `状态`, `数据集大小`, and `高亮` from the quick-sort step metrics
  - rearranged step metrics into three rows:
    - `Low / High / 支点值`
    - `左指针 / 右指针 / 当前分组`
    - `当前坑位 / 步骤`
  - removed the quick-sort legend entirely from both the stage and the right sidebar
- Added global compacting rules for combined-sidebar controls:
  - smaller labels/fields/buttons
  - tighter toggle/action row gaps
  - hidden sample blocks inside the controls section
  - hidden legend rows/stage legends in combined mode
- Converted `BST` from its old page-local workbench shell to shared `WorkspaceShell`.
- Adapted the custom `Binary Tree Traversal` page to the same combined right-sidebar contract:
  - removed the top `控制` command
  - right-edge arrow opens/closes both controls and pseudocode
  - combined drawer has the same controls/steps vertical sections
  - canvas shrinks left instead of being covered
- Completed the accepted compact-control rule across module pages:
  - replaced remaining `数据集大小` / dataset-size sliders with compact selects
  - replaced remaining `演示速度` segmented/toggle buttons with compact selects
  - included special cases such as binary tree traversal, BST, heap sort, stack/queue, and Huffman node count
- Removed explanatory subtitle-style text from the shared workbench shell and key standalone areas:
  - module page title descriptions
  - top workbench command-bar descriptions
  - right drawer section helper text such as `仅在需要时展开`
  - app-brand subtitle
  - homepage section subtitle counts
  - modules catalog card summaries and empty-state body text
  - simple About / Sorting overview / Not found page body blurbs
  - binary-tree traversal recursion-card notes
  - generic visualization canvas subtitle rendering
- This now covers shared `WorkspaceShell` pages broadly; `Binary Tree Traversal` remains custom internally because it owns stage-size-dependent trace layout and the draggable recursion window, but its visible workbench shell follows the shared interaction rule.

### Verification
- Targeted eslint passed:
  - `npx eslint src/components/WorkspaceShell.tsx src/pages/modules/QuickSortPage.tsx`
- `npm run build` passed.
- Browser/Playwright smoke on `http://127.0.0.1:4186/ui/visualizer/#/modules/quick-sort` passed:
  - clicking `控制` sets both `data-controls-open` and `data-step-open` to `true`
  - stage width shrinks by `380px`
  - one combined right drawer appears with two vertical sections
  - old floating `.tree-workspace-drawer` count is `0`
  - right-edge arrow closes and reopens the same combined drawer
  - top command bar no longer contains `控制`
  - controls use selects for dataset size and speed
  - sample input block count is `0`
  - regenerate button count is `4`
  - step metrics render in two columns
  - stage legend is on the left side of the drawing area
  - follow-up browser check confirmed controls section height is about `151px`, step metrics render as `3 / 3 / 2`, and removed labels are absent
  - follow-up browser check confirmed quick-sort legend count is `0`
  - page/console errors = `0`
- Cross-module browser smoke passed on:
  - `/modules/quick-sort`
  - `/modules/array`
  - `/modules/linked-list`
  - `/modules/dfs`
  - `/modules/graph-adjacency-matrix`
- Follow-up browser smoke passed on:
  - `/modules/bst`
  - `/modules/binary-tree`
  - `/modules/quick-sort`
  - `/modules/array`
- Each sampled route showed:
  - no top `控制` command button
  - `data-right-sidebar-mode="combined"`
  - one combined right drawer with controls and step sections after clicking the right arrow
  - old floating control drawer count `0`
  - page/console errors = `0`
- Additional stage-width checks confirmed sampled routes shrink the canvas by the right drawer width when opened.
- Follow-up control smoke passed on:
  - `/modules/bubble-sort`
  - `/modules/heap-sort`
  - `/modules/huffman-tree`
  - `/modules/bst`
  - `/modules/binary-tree`
  - `/modules/array`
  - `/modules/stack`
  - `/modules/queue`
- Each sampled control panel showed:
  - `input[type="range"]` count `0`
  - speed-button count `0`
  - at least one speed select
- Static scan found no remaining module-page matches for speed buttons or dataset range inputs:
  - `type="range"`
  - `onClick={() => setSpeed(...)}`
  - speed-active toggle/button patterns
- `npm run build` passed after the select conversion.
- Subtitle-removal verification:
  - Targeted eslint passed for `WorkspaceShell`, `StaticWorkbenchShell`, `VisualizationCanvas`, `Layout`, `HomePage`, `ModulesPage`, simple standalone pages, `BinaryTreeTraversalPage`, and `BinaryTreeCanvasPlaygroundPage`.
  - Static scan found no matches for subtitle/helper-text selectors and JSX patterns such as `app-subtitle`, `workspace.onDemand`, `modules-card-summary`, `tree-recursion-card-note`, and `subtitle=`.
  - Browser smoke on `/`, `/modules`, `/modules/array`, `/modules/bst`, and `/modules/binary-tree` found zero matching nodes for brand subtitles, workbench header paragraphs, command-title spans, sidebar helper spans, module-card summaries, and recursion-card notes.
- `git diff --check` passed, with only Windows LF/CRLF warnings.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/components/WorkspaceShell.tsx`
  - `src/pages/modules/QuickSortPage.tsx`
  - `src/pages/modules/BstPage.tsx`
  - `src/pages/modules/BinaryTreeTraversalPage.tsx`
  - module pages with remaining dataset-size or speed controls, now normalized to selects
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of `/modules/bst`, `/modules/binary-tree`, and a few representative shared-shell modules. If accepted, the remaining work is page-specific tightening, not another shell migration pass.

## 2026-09-15 (Graph module numbering cleanup)

### Today Done
- Renumbered graph modules to remove temporary `A/B` suffixes.
- Graph module IDs now run continuously from `G-01` through `G-11`:
  - `G-02` adjacency matrix storage
  - `G-03` adjacency list storage
  - `G-04` DFS through `G-11` topological sort
- Preserved existing graph routes and page implementations.
- Added an explicit graph title-key mapping so homepage, document title, top module picker, and expanded sidebar use the new visible IDs while reusing the existing translation namespaces.
- Updated zh/en graph titles to match the new numbering.

### Verification
- Targeted eslint passed:
  - `npx eslint src/data/moduleRegistry.ts src/pages/moduleCatalog.ts src/app/layout/Layout.tsx src/pages/HomePage.tsx src/i18n/translations.ts`
- `npm run build` passed.
- Browser/Playwright smoke on `http://127.0.0.1:4185/ui/visualizer/` passed:
  - source/browser text no longer contains `G-02A` or `G-02B`
  - expanded module rail graph group lists `G-01` through `G-11`
  - `/modules/graph-adjacency-matrix` title is `G-02 图的邻接矩阵存储`
  - `/modules/graph-adjacency-list` title is `G-03 图的邻接表存储`
  - `/modules/dfs` title is `G-04 深度优先搜索（DFS）`
  - `/modules/topological-sort` title is `G-11 Topological Sort`
- `git diff --check` passed, with only Windows LF/CRLF warnings.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/data/moduleRegistry.ts`
  - `src/pages/moduleCatalog.ts`
  - `src/app/layout/Layout.tsx`
  - `src/pages/HomePage.tsx`
  - `src/i18n/translations.ts`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of the graph group in the homepage and expanded module rail.

## 2026-09-15 (B-Tree canvas layer cleanup)

### Today Done
- Removed the extra framed inner canvas/card visual from both `B-Tree` and `B+ Tree` pages.
- Updated B-Tree stage styling so `.btree-stage-panel` is transparent, borderless, and shadowless.
- Let the B-Tree/B+ Tree visualization use the full shared workspace stage width instead of a constrained inner panel.
- Kept the small tree-title label as a lightweight translucent overlay instead of a separate canvas/card frame.

### Verification
- `npm run build` passed.
- Browser/Playwright smoke on `http://127.0.0.1:4184/ui/visualizer/` passed:
  - `/modules/btree`: inner `.btree-stage-panel` has `0px` border, transparent background, and no shadow
  - `/modules/bplus-tree`: same transparent/borderless panel state, with B+ leaf strip still present
  - both routes report no `.app-error` / `.form-error`
- `git diff --check` passed for touched files, with only Windows LF/CRLF warnings.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of `/modules/btree` and `/modules/bplus-tree` to confirm the extra inner canvas layer is gone.

## 2026-09-15 (active module group can collapse)

### Today Done
- Fixed the expanded module sidebar so the currently active module category can be collapsed.
- Removed the derived `visibleExpandedModuleTreeCategories` behavior that forced the active category back open during render.
- Preserved the current route/module while collapsing:
  - clicking the active category header only toggles that group
  - the page remains on the current module route
  - the top module picker still shows the current module
- Kept persisted category state as the source of truth, so collapsing the active group is remembered.

### Verification
- Targeted eslint passed:
  - `npx eslint src/app/layout/Layout.tsx`
- `npm run build` passed.
- Browser/Playwright smoke on `http://127.0.0.1:4183/ui/visualizer/#/modules/trie` passed:
  - before click: active `树结构` group was expanded and contained the active `Trie` link
  - after clicking active group title: group became `aria-expanded="false"`
  - route stayed `#/modules/trie`
  - top module picker still showed `T-06 Trie`
  - stored expanded categories changed to `["linear"]`
- `git diff --check` passed for touched files, with only Windows LF/CRLF warnings.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/app/layout/Layout.tsx`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of collapsing the current module category in the expanded left sidebar.

## 2026-09-15 (Trie continuous random insertion)

### Today Done
- Updated `T-06 /modules/trie` to match the continuous-insert behavior now used by B-Tree/B+ Tree.
- After a completed insert/search playback:
  - the inserted word is merged into the current seed word list
  - a new random lowercase word not already in the seed is generated automatically
  - the search word is also set to that new word, so the next cycle teaches "insert then verify this new word"
  - playback resets to the beginning of the next Trie timeline
- Changed manual `应用` so it uses the current evolving seed word list rather than reloading the selected preset every time.
- Added a completion/status guard to prevent automatic random-word generation from cascading through multiple inserts in one render cycle.

### Verification
- Targeted eslint passed:
  - `npx eslint src/pages/modules/TriePage.tsx`
- Targeted Trie tests passed:
  - `npm test -- src/modules/tree/trie.test.ts src/modules/tree/trieTimelineReplay.test.ts`
- `npm run build` passed.
- Browser/Playwright smoke on `http://127.0.0.1:4182/ui/visualizer/#/modules/trie` passed:
  - default insert `team` is added into the seed after completion
  - the next insert/query word changes to a generated word such as `kiplor`
  - the generated word is not already in the updated seed list
  - page reports no `.app-error` / `.form-error`
- `git diff --check` passed for touched files, with only Windows LF/CRLF warnings.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/pages/modules/TriePage.tsx`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of continuous random insertion on `/modules/trie`.

## 2026-09-15 (B-Tree continuous random insertion)

### Today Done
- Updated the standalone `B-Tree` and `B+ Tree` pages so completed insertions can continue into the next insertion without returning to the original preset seed.
- After the insertion reaches the completed frame:
  - the inserted target is merged into the next seed key list
  - a new random target not already in the seed is generated automatically
  - playback resets to the beginning of the next insertion timeline
- Changed manual `应用插入` so it uses the current evolving seed list rather than reloading the selected preset every time.
- Added a guard so automatic next-target generation advances exactly one insertion at a time instead of cascading through multiple random insertions while the timeline reset is still settling.

### Verification
- Targeted eslint passed:
  - `npx eslint src/pages/modules/BTreePage.tsx`
- Targeted B-Tree tests passed:
  - `npm test -- src/modules/tree/btreeComparison.test.ts src/modules/tree/btreeComparisonTimelineReplay.test.ts`
- `npm run build` passed.
- Browser/Playwright smoke on `http://127.0.0.1:4181/ui/visualizer/` passed:
  - `/modules/btree`: after completing insert `7`, seed becomes `[5, 6, 7, 10, 12, 20, 30]`, a new target is generated, and playback resets to the next timeline
  - `/modules/bplus-tree`: same continuous-insert behavior, with the B+ leaf strip still present
  - new random targets were not present in the updated seed list
- `git diff --check` passed for the touched files, with only Windows LF/CRLF warnings.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/pages/modules/BTreePage.tsx`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of continuous random insertion on both `/modules/btree` and `/modules/bplus-tree`.

## 2026-09-15 (B-Tree and B+ Tree split)

### Today Done
- Split the previous combined `T-05 B-Tree / B+ Tree` comparison route into two standalone navigation entries:
  - `T-05 /modules/btree` for B-Tree
  - `T-05B /modules/bplus-tree` for B+ Tree
- Reworked `BTreePage` into a variant-driven workbench page so each route renders one focused tree instead of the old side-by-side comparison canvas.
- Filtered the existing combined B-Tree/B+ timeline per route, preserving the underlying algorithm generator while showing only the relevant phase sequence.
- Updated registry, router, module catalog, zh/en copy, and B-Tree stage CSS so both pages match the shared module workbench style.
- Fixed module-title key generation for multi-hyphen IDs such as `T-05B`, and made the homepage default-expanded categories include the tree group so the new B+ Tree entry is easier to find.
- Kept the shared stage-pan hook buildable and connected the BST special canvas panning path enough to avoid leaving a half-wired compile failure.

### Verification
- Targeted eslint passed:
  - `npx eslint src/app/layout/Layout.tsx src/pages/HomePage.tsx src/pages/modules/BTreePage.tsx src/pages/modules/BstPage.tsx src/hooks/useStagePan.ts src/components/WorkspaceShell.tsx src/data/moduleRegistry.ts src/pages/moduleCatalog.ts src/i18n/translations.ts`
- Targeted tree tests passed:
  - `npm test -- src/modules/tree/bst.test.ts src/modules/tree/bstTimelineReplay.test.ts src/modules/tree/btreeComparison.test.ts src/modules/tree/btreeComparisonTimelineReplay.test.ts`
- `npm run build` passed.
- Browser/Playwright smoke on fresh dev server `http://127.0.0.1:4180/ui/visualizer/` passed:
  - homepage shows both `B-Tree` and `B+ Tree`
  - `/modules/btree` renders `T-05 B-Tree`, one B-Tree panel, and no B+ leaf strip
  - `/modules/bplus-tree` renders `T-05B B+ Tree`, one B+ panel, and the B+ leaf strip
  - both routes report no `.app-error` / `.form-error`
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one existing warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/pages/modules/BTreePage.tsx`
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/pages/moduleCatalog.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `src/app/layout/Layout.tsx`
  - `src/pages/HomePage.tsx`
  - `src/pages/modules/BstPage.tsx`
  - `src/components/WorkspaceShell.tsx`
  - `src/hooks/useStagePan.ts`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of the separated `B-Tree` and `B+ Tree` entries in the homepage/sidebar and both module routes.
- If accepted, the next cleanup candidate is the known full-lint blocker set so `npm run check` can complete green.

## 2026-09-15 (category order and collapsible menu memory)

### Today Done
- Reordered module categories to:
  - `线性结构`
  - `数组与广义表`
  - `树结构`
  - `图结构`
  - `查找算法`
  - `哈希表`
  - `排序算法`
  - `字符串`
  - `算法范式`
- Updated the shared `MODULE_CATEGORY_ORDER`, so the homepage, module catalog, and module workbench rail use the same order.
- Changed the homepage quick-navigation tree to read from the shared category order instead of maintaining a separate order constant.
- Added persisted expand/collapse state for homepage first-level category menus.
- Added expand/collapse buttons for first-level category groups in the expanded module workbench rail, with persisted state.

### Verification
- Targeted eslint passed:
  - `npx eslint src/pages/HomePage.tsx src/app/layout/Layout.tsx src/pages/moduleCatalog.ts`
- `npm run build` passed.
- Browser/Playwright DOM check passed:
  - homepage category order matches the requested order
  - homepage first-level menu state is written to and restored from `localStorage`
  - expanded module workbench rail category order matches the requested order
  - expanded module workbench rail first-level menu state is written to and restored from `localStorage`
- `git diff --check` passed.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing errors in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/pages/moduleCatalog.ts`
  - `src/pages/HomePage.tsx`
  - `src/app/layout/Layout.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of the new category order and remembered menu expansion.

## 2026-09-15 (storage category renamed)

### Today Done
- Renamed the user-facing Chinese storage category label from `存储结构` to `数组与广义表`.
- Updated the homepage category label and shared module-category translation.
- Adjusted the Chinese category summary from `数组存储与特殊矩阵压缩` to `数组、矩阵与广义表`.
- Kept the internal category key `storage` unchanged, so routes, registry grouping, CSS tone names, and data filters remain stable.

### Verification
- Targeted eslint passed:
  - `npx eslint src/pages/HomePage.tsx src/i18n/translations.ts`
- `npm run build` passed.
- Source search confirmed no remaining `存储结构` text in `src`.
- Browser/Playwright DOM check passed:
  - homepage contains `数组与广义表`
  - `/modules?category=storage` contains `数组与广义表`
  - neither page contains old `存储结构`
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing errors in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/pages/HomePage.tsx`
  - `src/i18n/translations.ts`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of homepage/sidebar category wording.

## 2026-09-15 (static modules hide playback bar by default)

### Today Done
- Added a shared `WorkspaceShell` option for the default bottom playback/transport visibility.
- Updated `StaticWorkbenchShell` so static/concept/storage modules default to a hidden playback bar instead of showing the previous `静态演示` bottom strip.
- Preserved the canvas zoom control by falling back to the existing bottom-right floating zoom UI when the playback bar is hidden.
- Guarded route transitions so moving from a static module to a timeline module resets the playback bar to that module's default instead of carrying over the hidden state.

### Verification
- Targeted eslint passed:
  - `npx eslint src/components/WorkspaceShell.tsx src/components/StaticWorkbenchShell.tsx`
- `npm run build` passed.
- Browser/Playwright DOM check passed:
  - `/modules/two-dimensional-array`: `data-transport-open="false"`, no `.tree-workspace-transport`, floating zoom visible
  - static -> `/modules/linked-queue`: `data-transport-open="true"`, `.tree-workspace-transport` visible
  - direct `/modules/linked-queue`: `data-transport-open="true"`, `.tree-workspace-transport` visible
- `git diff --check` passed.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing errors in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/components/WorkspaceShell.tsx`
  - `src/components/StaticWorkbenchShell.tsx`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of static modules such as storage / graph-definition pages; playback-capable modules should still open with the bottom bar visible.

## 2026-09-15 (linked-queue enqueue visual refinement)

### Today Done
- Refined `L-05B /modules/linked-queue` enqueue playback after user feedback that it still looked worse than linked-list / linked-stack operations.
- Separated the stable queue row from the incoming `s` node in the linked-queue stage markup, so the new node is no longer laid out as if it already belonged to the main chain.
- Repositioned the incoming `s` node below/right of the old `rear`, matching the current linked-list and linked-stack language: create beside the structure, show the pointer link, then enter the structure.
- Reworked the `linkEnqueue` connector into a visible elbow-style preview of `rear->next = s`; the final `enqueue` step then removes the floating node and shows it inside the main queue row as the new `rear`.
- Kept sequential queue and circular queue behavior unchanged.

### Verification
- Targeted queue tests passed:
  - `npm test -- src/modules/linear/queueOps.test.ts src/modules/linear/queueTimelineReplay.test.ts src/pages/modules/queuePageUtils.test.ts`
  - `3` files / `21` tests passed.
- Targeted eslint passed:
  - `npx eslint src/pages/modules/QueuePage.tsx src/pages/modules/queuePageUtils.ts src/modules/linear/queueOps.ts src/modules/linear/queueOps.test.ts src/pages/modules/queuePageUtils.test.ts`
- `npm run build` passed.
- `git diff --check` passed.
- Browser/Playwright check on `/modules/linked-queue` confirmed:
  - step `1/4`: incoming `s` node is below/right of the main queue row
  - step `2/4`: connector is visible and old `rear` remains highlighted
  - step `3/4`: `s` enters the main row and the queue renders four linked nodes
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing errors in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/pages/modules/QueuePage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of the linked-queue enqueue animation; if needed, tune the connector shape further after seeing it in the app.

## 2026-09-15 (all module workspace relationship audit)

### Today Done
- Re-audited the recent module-frame changes across all implemented registry routes after the user asked whether recent work had only changed individual modules.
- Confirmed source structure:
  - most formal pages use `WorkspaceShell`
  - static/concept pages use `StaticWorkbenchShell`
  - `T-01 /modules/binary-tree` and `T-02 /modules/bst` remain hand-written but now follow the same command-bar relationship
- Found a real cross-module gap: the command bar was consistent everywhere, but on several routes the right `步骤` drawer still overlaid the canvas because older responsive rules could force `.tree-stage-visual` back into normal document flow.
- Added a desktop shared-workspace CSS override so every `.workspace-shell-page` keeps the stage absolutely positioned and gives up the right drawer width when `data-step-open='true'`.

### Verification
- Browser/Playwright full-route audit passed:
  - `58` registry module routes checked
  - every route has the shared workspace shell, command bar, right-side step toggle, and no visible old `.tree-workspace-edge-tab`
  - command buttons are consistently `控制 / 播放栏` or `Controls / Playback`
  - after opening `步骤` and then `控制`, every route keeps both panels open
  - every route reports no stage/right-drawer overlap
  - no route exposes an `算法` command button
- `npm run build` passed.
- `git diff --check` passed.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing errors in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review across several module families; the automated audit says the shared workspace relationship is now applied across all registry module routes.

## 2026-09-15 (independent panels and right drawer motion)

### Today Done
- Decoupled the workspace `控制` panel and right `步骤` sidebar toggles:
  - opening `控制` no longer closes the right `步骤` sidebar
  - opening `步骤` no longer closes the `控制` panel
- Removed the visible `算法` entry from `T-01 /modules/binary-tree`; the command bar now matches the shared workspace language with `控制` and `播放栏`.
- Added a right-to-left drawer entrance animation for the `步骤` sidebar while keeping the canvas pushed aside when the sidebar is open.

### Verification
- Targeted eslint passed:
  - `npx eslint src/components/WorkspaceShell.tsx src/pages/modules/BinaryTreeTraversalPage.tsx src/pages/modules/BstPage.tsx`
- Targeted tree tests passed:
  - `npm test -- src/modules/tree/binaryTreeTraversal.test.ts src/modules/tree/binaryTreeTraversalTimelineReplay.test.ts src/modules/tree/bst.test.ts src/modules/tree/bstTimelineReplay.test.ts`
  - `4` files / `21` tests passed.
- `npm run build` passed.
- `git diff --check` passed.
- Browser verification at `1280x720`:
  - `T-03 /modules/avl-tree`: after opening `步骤` then `控制`, both `data-step-open` and `data-controls-open` are `true`
  - `T-03 /modules/avl-tree`: stage right edge `900px`, step sheet left edge `900px`, so the sheet pushes rather than overlays the canvas
  - `T-01 /modules/binary-tree`: command buttons are `控制` and `播放栏`; no visible `算法` button or recursion toggle copy remains
  - `T-01 /modules/binary-tree`: after opening both panels, stage right edge `900px`, step sheet left edge `900px`, and the sheet animation name is `workspace-step-drawer-in`
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing errors in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/components/WorkspaceShell.tsx`
  - `src/pages/modules/BinaryTreeTraversalPage.tsx`
  - `src/pages/modules/BstPage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of the independent side panels and right drawer motion on a few module pages.

## 2026-09-15 (right step sidebar pushes canvas)

### Today Done
- Updated the shared workspace CSS so opening the right `步骤` sidebar shrinks the central canvas area instead of overlaying it.
- The behavior now mirrors the left module rail relationship: the stage gives up the sidebar width and the right panel sits beside it.
- Kept the floating zoom control inside the shrunken stage, so it stays attached to the active canvas area when the playback row is hidden.

### Verification
- `npm run build` passed.
- `git diff --check` passed.
- Browser measurement on `T-01 /modules/binary-tree` at `1280x720`:
  - before opening `步骤`: stage width `1208px`, right edge `1280`
  - after opening `步骤`: stage width `828px`, right edge `900`
  - step sheet width `380px`, left edge `900`
  - stage right edge and sheet left edge match, so the sidebar no longer overlays the canvas

### Current State
- Updated:
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review on a few module pages with `步骤` open.

## 2026-09-15 (tree workspace page-language alignment)

### Today Done
- Rechecked the formal module pages against the current shared workspace page contract.
- Found that most modules already used `WorkspaceShell` / `StaticWorkbenchShell`; the remaining tree special pages `T-01 BinaryTreeTraversalPage` and `T-02 BstPage` still hand-rolled parts of the old command relationship.
- Updated `T-01 /modules/binary-tree`:
  - removed the top `步骤` command button
  - added the fixed right-side step toggle arrow
  - moved canvas zoom controls from the canvas top area into the bottom playback row
  - kept zoom available as a bottom-right floating control when the playback row is hidden
- Updated `T-02 /modules/bst`:
  - removed the top `步骤` command button
  - added the fixed right-side step toggle arrow
  - added bottom playback-row zoom controls and floating zoom when playback is hidden
  - wired tree nodes and edges to the same zoom value

### Verification
- Targeted eslint passed:
  - `npx eslint src/pages/modules/BinaryTreeTraversalPage.tsx src/pages/modules/BstPage.tsx`
- Targeted tree tests passed:
  - `npm test -- src/modules/tree/binaryTreeTraversal.test.ts src/modules/tree/binaryTreeTraversalTimelineReplay.test.ts src/modules/tree/bst.test.ts src/modules/tree/bstTimelineReplay.test.ts`
  - `4` files / `21` tests passed.
- `npm run build` passed.
- `git diff --check` passed.
- Browser verification across tree routes confirmed:
  - `T-00A`, `T-01`, `T-02`, `T-03`, `T-04`, `T-05`, `T-06`, and `T-07` all render the shared workspace page shell
  - no visible `.tree-workspace-edge-tab` remains
  - the visible step entry is the fixed right-side arrow
  - zoom is in the playback row, not as a top canvas toolbar
- Source scan confirmed all formal module pages, excluding test files and `BinaryTreeCanvasPlaygroundPage`, use the shared workspace page contract.
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing errors in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus one warning in `src/pages/modules/LinkedListPage.tsx`

### Current State
- Updated:
  - `src/pages/modules/BinaryTreeTraversalPage.tsx`
  - `src/pages/modules/BstPage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of `T-01 /modules/binary-tree` and `T-02 /modules/bst` against the current module-page prototype.

## 2026-09-15 (linked-queue enqueue staging)

### Today Done
- Updated linked-queue enqueue so the new node `s` is created beside the queue before it joins the main chain.
- Added linked-queue specific timeline steps:
  - `prepareEnqueue`: create the side node `s`
  - `linkEnqueue`: highlight old `rear` and show the temporary `rear->next` link to `s`
  - `enqueue`: move `s` into the queue and make it the new `rear`
- Added visual styling for the floating `s` node, its label, and the incoming connector.
- Kept sequential and circular queue behavior unchanged.
- Removed a QueuePage lint warning by using stable empty queue/buffer fallbacks.

### Verification
- Targeted tests passed:
  - `npm test -- src/modules/linear/queueOps.test.ts src/modules/linear/queueTimelineReplay.test.ts src/pages/modules/queuePageUtils.test.ts`
  - `3` files / `21` tests passed.
- Targeted eslint passed:
  - `npx eslint src/modules/linear/queueOps.ts src/pages/modules/QueuePage.tsx src/pages/modules/queuePageUtils.ts src/modules/linear/queueOps.test.ts src/pages/modules/queuePageUtils.test.ts`
- `npm run build` passed.
- `git diff --check` passed.
- Browser verification on `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-queue`:
  - step `0/4`: only the existing queue nodes are shown
  - step `1/4`: floating `s` node appears beside the queue
  - step `2/4`: incoming connector appears and old `rear` is highlighted
  - step `3/4`: `s` enters the queue and becomes the new `rear`
- Full `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `330` tests)
  - lint still stops on existing errors in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`

### Current State
- Updated:
  - `src/modules/linear/queueOps.ts`
  - `src/modules/linear/queueOps.test.ts`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/queuePageUtils.ts`
  - `src/pages/modules/queuePageUtils.test.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of linked-queue enqueue playback.

## 2026-09-15 (linked-stack s.next arrow)

### Today Done
- Fixed the linked-stack push preview arrow for the `s->next = top` step.
- Extracted the connector-point calculation so the preview line is anchored from the left side of the floating `s` node to the right side of the old top node, with a small fixed gap on both ends.
- Recomputed the preview path on the next animation frame so the SVG line does not keep a stale position while the floating node settles.
- Added a unit test that verifies the connector points keep `s` on the right and old top on the left.

### Verification
- Targeted tests passed:
  - `npm test -- src/pages/modules/StackPage.test.tsx src/pages/modules/stackPageUtils.test.ts src/modules/linear/stackOps.test.ts src/modules/linear/stackTimelineReplay.test.ts`
  - `4` files / `24` tests passed.
- `npm run build` passed.
- Browser verification on `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-stack`:
  - at step `2/4`, the path starts just outside the `s` node left edge and ends just outside the old top node right edge
  - screenshot inspection confirmed the curve no longer extends from the right side of `s`
- Targeted eslint was attempted for `StackPage.tsx` and `StackPage.test.tsx`; it still stops on the existing `react-refresh/only-export-components` issue because `StackPage.tsx` exports testable helpers.

### Current State
- Updated:
  - `src/pages/modules/StackPage.tsx`
  - `src/pages/modules/StackPage.test.tsx`
  - `docs/HANDOFF.md`

### Next Step
- User visual review of the linked-stack push step.

## 2026-09-14 (full pseudocode audit)

### Today Done
- Re-audited all user-facing pseudocode surfaces after the linked-stack `oldTop` issue showed the previous pass was too narrow.
- Extended the audit from double-column pages to single-column sorting/search/string/tree/graph/hash/paradigm pages.
- Fixed teaching-semantics issues:
  - bubble sort now displays and highlights the early-exit check
  - queue pseudocode has separate sequential/linked/circular models, with circular queue using the one-empty-slot full rule consistently
  - circular linked-list pseudocode explicitly locates `tail` and avoids implying a persistent tail variable
  - divide-and-conquer checks the base case before splitting
  - backtracking has a separate undo/backtrack pseudocode line
  - counting sort stable placement shows both output write and `count[key] -= 1`
  - B-Tree/B+Tree descent highlights the child-range selection line, and overflow/root lines now match the comparison animation better
- Updated `docs/PSEUDOCODE_AUDIT.md` with the scope, fixes, verification, and remaining risk.

### Verification
- Targeted tests passed:
  - `npm test -- src/modules/sorting/bubbleSort.test.ts src/modules/sorting/countingSort.test.ts src/modules/paradigm/divideConquer.test.ts src/modules/paradigm/backtracking.test.ts src/modules/tree/btreeComparison.test.ts src/modules/linear/linkedListOps.test.ts src/pages/modules/linkedListPageUtils.test.ts src/modules/linear/queueOps.test.ts src/pages/modules/queuePageUtils.test.ts`
  - `9` files / `51` tests passed.
- `npm run build` passed.
- `git diff --check` passed.
- `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `327` tests)
  - lint still stops on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus existing warnings in `LinkedListPage.tsx` and `QueuePage.tsx`.

### Current State
- Updated:
  - `docs/PSEUDOCODE_AUDIT.md`
  - `docs/HANDOFF.md`
  - `docs/SESSION_BRIEF.md`
  - `TODO.md`
  - `src/i18n/translations.ts`
  - `src/modules/paradigm/backtracking.ts`
  - `src/modules/paradigm/divideConquer.ts`
  - `src/modules/sorting/bubbleSort.ts`
  - `src/modules/tree/btreeComparison.ts`
  - `src/pages/modules/BacktrackingPage.tsx`
  - `src/pages/modules/BubbleSortPage.tsx`
  - `src/pages/modules/CountingSortPage.tsx`
  - `src/pages/modules/DivideConquerPage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`

### Next Step
- If the user wants stronger assurance, run a browser spot-check through representative modules with the step panel open.
- Separate task: clean the existing React lint blockers so `npm run check` can become fully green again.

## 2026-09-14 (stack pointer spacing)

### Today Done
- Adjusted sequential-stack and linked-stack pointer labels so `top` / `bottom` sit farther away from the stack body.
- Extended the CSS-drawn pointer lines from `12px` to `24px` and kept a visible gap from the stack cells so the line is not visually covered by node backgrounds.
- Increased the reserved side padding around sequential-stack and linked-stack scenes to keep the farther labels visible.
- Updated docked/adaptive stack overrides so narrow panel layouts do not pull the pointers back against the stack.
- Follow-up fix: replaced rendered `←` / `→` glyph arrowheads with zero-size CSS border triangles, because the glyph approach produced an extra tiny arrow beside the horizontal line.
- Follow-up fix: changed linked-stack `s.next = top` preview path to start from the floating `s` node side midpoint and end at the old top node side midpoint, instead of starting from the floating node bottom center.
- Follow-up fix: corrected linked-stack pseudocode so push uses the standard `s->next = top; top = s;` sequence instead of introducing an unnecessary `oldTop` variable. Pop still uses a temporary `p` node because it must free the removed old top node safely.

### Verification
- Firefox/Playwright smoke captured:
  - `output/playwright/sequential-stack-pointer-spacing.png`
  - `output/playwright/linked-stack-pointer-spacing.png`
  - `output/playwright/sequential-stack-pointer-arrowheads.png`
  - `output/playwright/linked-stack-pointer-arrowheads.png`
  - `output/playwright/sequential-stack-pointer-css-arrowheads.png`
  - `output/playwright/linked-stack-pointer-css-arrowheads.png`
  - `output/playwright/linked-stack-linkpush-start-fixed.png`
- Browser metrics confirmed both stack variants render `top` / `bottom` labels and no stack-stage horizontal scrollbar is exposed.
- Browser metrics confirmed the `.stack-pointer-arrow` spans render as CSS border triangles with `font-size: 0`, so the text glyph arrows no longer appear.
- Browser metrics confirmed the linked-stack link preview `M` coordinate now equals the floating node side midpoint during step `2/4`.

### Current State
- Updated:
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Run the normal local gate and report whether the existing React lint issues still block `npm run check`.

## 2026-09-14 (control panel default hidden)

### Today Done
- Changed the shared `WorkspaceShell` default so module control panels no longer open automatically on page entry.
- Confirmed special tree pages `T-01` and `T-02` already default their control panels to hidden, so no page-specific change was needed there.

### Verification
- `npx eslint src/components/WorkspaceShell.tsx` passed.
- `npm run build` passed.
- `npm run check` was attempted: docs check and all tests passed (`103` files / `327` tests), then lint stopped on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus existing warnings in `LinkedListPage.tsx` and `QueuePage.tsx`.

### Current State
- Updated:
  - `src/components/WorkspaceShell.tsx`
  - `docs/HANDOFF.md`
  - `docs/SESSION_BRIEF.md`
  - `TODO.md`

### Next Step
- Visual review one shared-shell module route to confirm first load shows only the canvas, command bar, side toggles, and transport/zoom controls.

## 2026-09-14 (dual pseudocode audit)

### Today Done
- Audited the actual double-column `中文式 / 类 C 式` pseudocode surfaces.
- Added `docs/PSEUDOCODE_AUDIT.md` as the audit record.
- Corrected pseudocode-only issues in:
  - `src/pages/modules/DynamicArrayPage.tsx`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/StackPage.tsx`
- Main content fixes:
  - linked-list C-style pseudocode now uses 0-based indexes consistently with the page/runtime
  - circular linked-list insertion now moves `head` on `index == 0`, not `index == 1`
  - single/double/circular linked-list insert/delete C-style lines now spell out head, prev/next, and detach/free behavior
  - stack and queue C-style pseudocode no longer uses placeholder prose such as `validate state` / `finish enqueue`
  - dynamic-array append pseudocode now makes validation, direct append, resize-copy, and final append explicit
  - Huffman C-style pseudocode fixes the `Haffman` typo and clarifies construction, code extraction, and WPL accumulation

### Verification
- Targeted tests passed:
  - `npm test -- src/modules/linear/arrayInsert.test.ts src/modules/linear/dynamicArrayOps.test.ts src/modules/linear/linkedListOps.test.ts src/modules/linear/queueOps.test.ts src/modules/linear/stackOps.test.ts src/modules/tree/huffman.test.ts src/modules/tree/huffmanTimelineReplay.test.ts`
  - `7` files / `55` tests passed.
- `npm run build` passed.
- `npm run check` was attempted:
  - docs link check passed
  - all tests passed (`103` files / `327` tests)
  - lint then stopped on existing React-rule issues in `src/hooks/useStageAnchorPanel.ts`, `src/pages/modules/HuffmanTreePage.tsx`, and `src/pages/modules/StackPage.tsx`, plus existing warnings in `LinkedListPage.tsx` and `QueuePage.tsx`
- Targeted eslint was attempted for the touched module pages, but it still stops on pre-existing React lint issues outside this pseudocode text change:
  - `src/pages/modules/HuffmanTreePage.tsx` synchronous `setState` inside effect
  - `src/pages/modules/StackPage.tsx` fast-refresh export and synchronous `setState` inside layout effect
  - existing warnings in `LinkedListPage.tsx` and `QueuePage.tsx`

### Current State
- Updated:
  - `docs/PSEUDOCODE_AUDIT.md`
  - `TODO.md`
  - `docs/HANDOFF.md`
  - `src/pages/modules/DynamicArrayPage.tsx`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/StackPage.tsx`

### Next Step
- Continue with a second audit pass for single-column pseudocode across sorting/search/graph/tree/paradigm pages and compare each page's displayed lines with runtime `codeLines` highlights.

## 2026-09-14 (module shell aligned closer to selected prototype)

### Today Done
- Responded to user review that `L-01 /modules/array` was still too far from the selected module-page prototype.
- Updated the shared app/module frame so formal `WorkspaceShell` routes move toward the selected full-canvas workbench:
  - fixed 60px top app header
  - left 72px module-category rail
  - centered module picker signal in the header on module pages
  - full-viewport grid canvas inside the module route
  - bottom full-width transport bar
  - controls panel open by default as a floating card
- Tightened `L-01` control-card styling:
  - narrower compact card
  - two-column input layout
  - hidden duplicate control-panel status summary, because status is already shown in the stage meta and bottom transport chips
  - opaque card background so canvas content does not visually bleed through
- Added the missing collapsible side-region behavior from the selected prototype:
  - left module navigation is now a narrow rail by default, not a fully hidden sidebar
  - the rail-top small toggle expands the rail into a wider module tree that shows concrete module routes
  - expanded module tree highlights the current module and lists entries such as `L-01 数组`, `L-03 单链表`, `L-03B 双链表`, and `L-03C 循环链表`
  - right `步骤` has a right-edge toggle and opens as a fixed right sidebar instead of a drifting floating panel
  - hiding the bottom transport lets the right sidebar extend to the bottom edge
  - the top app header and module command bar now share a flatter white background, fine border, and no drop shadow so they match the workbench area better
  - latest refinement moved zoom controls into the bottom playback row, kept `- / 100% / +` visible as a bottom-right overlay when `播放栏` is hidden, removed the top `步骤` button, changed the right sidebar trigger to an arrow icon, fixed both left/right sidebar toggle positions so repeated clicks can happen in place, made right-sidebar step content stack vertically, and positioned the default controls panel near the top `控制` button
- Added decision record `DEC-20260914-01` for the selected prototype-aligned shared module frame.

### Verification
- Targeted eslint passed:
  - `npx eslint src/app/layout/Layout.tsx src/components/WorkspaceShell.tsx src/pages/modules/ArrayPage.tsx src/i18n/translations.ts`
- `npm run build` passed.
- Edge/Playwright smoke on `/modules/array` captured:
  - `output/playwright/l01-prototype-align-pass5.png`
  - `output/playwright/l01-collapsible-sidebars.png`
  - `output/playwright/module-rail-expanded-tree-final.png`
  - `output/playwright/module-sidebars-topbar-refine.png`
  - `output/playwright/workspace-zoom-step-controls-refine.png`
  - `output/playwright/workspace-controls-near-button.png`
  - `output/playwright/zoom-visible-with-transport-hidden.png`
  - `output/playwright/fixed-sidebar-toggle-positions.png`
  - `output/playwright/sidebar-toggle-no-overlap.png`
- Browser metrics confirmed:
  - top header height = `60`
  - collapsed left module rail width = `72`
  - expanded left module tree width = `248`
  - module shell starts at `x=72, y=60`
  - control card open by default
  - bottom transport visible
  - after expanding the left rail, module shell starts at `x=248` and the module tree exposes concrete route entries
  - rail-top toggle is inside the sidebar, not the top app header
  - right-edge `步骤` toggle opens a right sidebar pinned at the right edge with width `380`
  - top app header and command bar both use white background with no shadow
  - command bar buttons are now `控制` and `播放栏`; `步骤` is no longer in the top command bar
  - zoom controls render inside the bottom transport row, not in the canvas top-right corner
  - when `播放栏` is hidden, the same zoom controls remain visible at the canvas bottom-right
  - left sidebar toggle remains at `x=19` and was moved up to `y=68~98`, clear of the active `线性结构` group at `y=166~200`
  - right sidebar toggle remains at `x=1566, y=130` before expansion, after expansion, and after collapsing again
  - right-sidebar code blocks stack vertically in the `380px` side panel
  - default controls panel opens near the top `控制` button
  - after hiding `播放栏`, bottom transport is absent and the right sidebar extends downward
  - horizontal overflow = `false`
  - page/console errors = `0`

### Current State
- Updated:
  - `src/app/layout/Layout.tsx`
  - `src/components/WorkspaceShell.tsx`
  - `src/index.css`
  - `docs/DECISIONS.md`
  - `docs/HANDOFF.md`
  - `docs/SESSION_BRIEF.md`
  - `TODO.md`
- The shared frame is now much closer to the selected prototype, but individual module canvases may still need route-specific polish.

### Next Step
- User visual review of `L-01`; if accepted, continue route-by-route polish under this shared frame instead of redefining the page relationship again.

## 2026-09-14 (special tree pages migrated to command-bar shell)

### Today Done
- Completed the remaining formal module-page migration requested by the user.
- Migrated the two special tree pages away from the old vertical edge-tab interaction:
  - `T-01 /modules/binary-tree`
  - `T-02 /modules/bst`
- Added the same top command-bar relationship used by the rest of the module workbench:
  - `控制`
  - `步骤`
  - `播放栏`
  - plus `算法` on `T-01`, because its recursion/algorithm window is a real page-specific auxiliary region
- Kept the existing custom tree geometry, traversal traces, recursion panel, BST layout, and timeline logic intact.
- Added per-page `data-controls-open`, `data-step-open`, and `data-transport-open` state attributes so these special pages match the shared-shell behavior contract.

### Verification
- Targeted eslint passed:
  - `npx eslint src/pages/modules/BstPage.tsx src/pages/modules/BinaryTreeTraversalPage.tsx`
- Targeted tree tests passed:
  - `npm test -- src/modules/tree/binaryTreeTraversal.test.ts src/modules/tree/binaryTreeTraversalTimelineReplay.test.ts src/modules/tree/bst.test.ts src/modules/tree/bstTimelineReplay.test.ts`
  - `4` files / `21` tests passed.
- `npm run build` passed.
- `npm run check` was attempted: docs check and all tests passed (`103` files / `327` tests), then lint stopped on existing repo issues outside this `T-01` / `T-02` migration:
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/StackPage.tsx`
- Edge/Playwright smoke passed on:
  - `/modules/binary-tree`
  - `/modules/bst`
- Browser smoke confirmed:
  - command titles render as `T-01 二叉树遍历` and `T-02 二叉搜索树（BST）`
  - command buttons render in the top bar
  - old `.tree-workspace-edge-tab` count is `0`
  - `控制` opens the controls panel
  - `步骤` closes controls and opens the step panel
  - `播放栏` hides the bottom transport
  - tree nodes and edges remain visible
  - page/console errors = `0`
- Full formal module scan found no remaining module `.tsx` page outside the new workbench/command-bar pattern, excluding test/playground files.

### Current State
- Updated:
  - `src/pages/modules/BinaryTreeTraversalPage.tsx`
  - `src/pages/modules/BstPage.tsx`
  - `docs/HANDOFF.md`
- All formal module pages now use the new workbench relationship.
- `BinaryTreeCanvasPlaygroundPage.tsx` remains a playground/development page, not a course module.

### Next Step
- User visual review of `T-01` and `T-02` after the shell migration, especially tree trace spacing and the `T-01` floating recursion window.

## 2026-09-13 (static module pages unified into workspace shell)

### Today Done
- Re-aligned the implementation with the agreed product rule:
  - module selection belongs to homepage / left navigation
  - module pages use one workbench relationship
  - the control panel only tunes the current module
  - left controls, right step/notes, and bottom transport can be hidden through the shared command bar
- Added `StaticWorkbenchShell` as a thin adapter over `WorkspaceShell` for concept/static teaching pages that do not have timeline playback.
- Migrated these old standalone workbench pages into the shared shell:
  - `M-01 /modules/two-dimensional-array`
  - `M-02 /modules/symmetric-matrix`
  - `M-03 /modules/upper-triangular-matrix`
  - `M-04 /modules/lower-triangular-matrix`
  - `M-05 /modules/sparse-matrix-triples`
  - `M-06 /modules/sparse-matrix-linked`
  - `M-07 /modules/generalized-list-head-tail`
  - `G-01 /modules/graph-representation`
  - `G-02A /modules/graph-adjacency-matrix`
  - `G-02B /modules/graph-adjacency-list`
  - `T-00A /modules/tree-definition`
- Added compact control-panel CSS so old horizontal toolbars behave correctly when moved into the left `控制` panel.

### Verification
- `npm run build` passed.
- Targeted eslint passed on changed TS/TSX files; including `src/index.css` in the eslint command only produced the expected "CSS ignored by config" warning.
- Targeted unit tests passed:
  - `npm test -- src/modules/storage/twoDimensionalArray.test.ts src/modules/storage/symmetricMatrix.test.ts src/modules/storage/upperTriangularMatrix.test.ts src/modules/storage/lowerTriangularMatrix.test.ts src/modules/storage/sparseMatrixTriples.test.ts src/modules/storage/sparseMatrixLinked.test.ts src/modules/storage/generalizedListHeadTail.test.ts src/modules/graph/graphRepresentation.test.ts`
  - `8` files / `31` tests passed.
- Edge/Playwright smoke passed on representative routes:
  - `two-dimensional-array`
  - `symmetric-matrix`
  - `generalized-list-head-tail`
  - `graph-representation`
  - `graph-adjacency-matrix`
  - `graph-adjacency-list`
  - `tree-definition`
  - `doubly-linked-list`
- Browser smoke confirmed each route renders the shared `.tree-workspace-shell`, command buttons are `控制` / `步骤` / `播放栏`, old standalone workbench markers are absent, `控制` and `步骤` remain mutually exclusive, `播放栏` hides the bottom region, and page/console errors = `0`.

### Current State
- Updated:
  - `src/components/StaticWorkbenchShell.tsx`
  - `src/index.css`
  - storage concept pages under `src/pages/modules/M-*.tsx` equivalents
  - `src/pages/modules/GraphRepresentationPage.tsx`
  - `src/pages/modules/GraphAdjacencyMatrixPage.tsx`
  - `src/pages/modules/GraphAdjacencyListPage.tsx`
  - `src/pages/modules/TreeDefinitionPage.tsx`
  - `docs/HANDOFF.md`
- Follow-up on 2026-09-14: `T-01 /modules/binary-tree` and `T-02 /modules/bst` were migrated to the same command-bar shell. No formal module pages remain on the old vertical edge-tab interaction.

### Next Step
- User visual review of the full module workbench surface.

## 2026-09-13 (linked-list variants split into separate routes)

### Today Done
- Addressed the follow-up review that linked-list variants were still bundled behind a control-panel selector.
- Split the linked-list family into separate navigation/module entries:
  - `L-03 /modules/linked-list` = single linked list
  - `L-03B /modules/doubly-linked-list` = double linked list
  - `L-03C /modules/circular-linked-list` = circular linked list
- Removed the linked-list type dropdown from the module controls; each route now fixes its own linked-list mode.
- Kept legacy JSON import tolerant, but imported JSON no longer switches the current route's linked-list type.
- Added zh/en titles and descriptions for the new double/circular linked-list module entries.

### Verification
- Targeted linked-list tests passed:
  - `npm test -- src/modules/linear/linkedListOps.test.ts src/pages/modules/linkedListPageUtils.test.ts`
- `npm run build` passed.
- Targeted eslint passed with one existing warning still present in the touched page:
  - `npx eslint src/pages/modules/LinkedListPage.tsx src/data/moduleRegistry.ts src/app/router.tsx src/i18n/translations.ts`
  - existing warning: `src/pages/modules/LinkedListPage.tsx` exhaustive-deps warning around transient link measurements
- Edge/Playwright smoke passed:
  - homepage linear tree lists `单链表`, `双链表`, and `循环链表` as separate entries
  - `/modules/doubly-linked-list` renders `L-03B 双链表`
  - `/modules/circular-linked-list` renders `L-03C 循环链表`
  - neither route renders the old `#linked-list-mode` control selector
  - double-list node markers and circular return arrow render correctly
  - page/console errors = `0`
- Screenshot: `output/playwright/linked-list-split-routes-smoke.png`

### Current State
- Updated:
  - `src/data/moduleRegistry.ts`
  - `src/app/router.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/i18n/translations.ts`
  - `docs/HANDOFF.md`

### Next Step
- Continue applying this "module selected from navigation, controls only tune the current module" rule to any remaining module families if they still expose structural choices in the control panel.

## 2026-09-13 (module workbench shell refresh)

### Today Done
- Addressed the follow-up review that module routes still felt like the old animation pages.
- Removed the homepage left-tree `查看本组` link because it changed the hash route and could land on 404.
- Refreshed shared `WorkspaceShell` pages into a top-command workbench shell:
  - title and description now live in the module workbench command bar
  - `控制`, `步骤`, and `播放栏` are command buttons in one top-right group
  - old left/right vertical edge tabs are no longer rendered on shared-shell module pages
  - `控制` and `步骤` are mutually exclusive, so opening one closes the other
  - bottom playback bar can still be hidden/restored from the command bar
- Scoped the new workbench styling to `.workspace-shell-page` so special hand-built pages are not accidentally restyled.

### Verification
- `npm run build` passed.
- targeted eslint passed:
  - `npx eslint src/components/WorkspaceShell.tsx src/pages/HomePage.tsx`
- `npm run check` was attempted: docs check and all tests passed (`103` files / `327` tests), then lint stopped on existing repo issues outside this shell refresh:
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/StackPage.tsx`
- Edge/Playwright smoke passed:
  - homepage no longer contains `查看本组`
  - expanding the left tree does not produce a 404
  - `L-03 /modules/linked-list` renders `.tree-workspace-command-bar`
  - command buttons are `控制`, `步骤`, `播放栏`
  - old vertical edge tabs are absent
  - opening `控制` shows the controls drawer and keeps `步骤` closed
  - opening `步骤` closes controls and shows the step sheet
  - clicking `播放栏` hides the bottom transport
  - page/console errors = `0`
- Screenshot: `output/playwright/module-workbench-shell-v2-smoke.png`

### Current State
- Updated:
  - `src/components/WorkspaceShell.tsx`
  - `src/pages/HomePage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Continue route-by-route visual cleanup inside individual module canvases where shared-shell changes are not enough.

## 2026-09-13 (homepage navigation relationship cleanup)

### Today Done
- Cleaned up the confusing homepage/catalog/module navigation relationship reported in review.
- Unified top-level module entry:
  - top `模块` nav now points to `/`
  - brand link now points to `/`
  - `/modules` now renders the new quick-navigation homepage instead of the old catalog page
- Reworked the homepage left navigation from flat anchor links into an expandable course tree:
  - categories can expand/collapse
  - expanded categories list their module entries directly
  - each module entry links to the real module route
- Removed the old-catalog jump from homepage category actions:
  - section action now expands the left tree category
  - it no longer routes to `/modules?category=...`

### Verification
- `npm run build` passed.
- targeted eslint passed:
  - `npx eslint src/app/router.tsx src/app/layout/Layout.tsx src/pages/HomePage.tsx`
- `npm run check` was attempted: docs check and all tests passed (`103` files / `327` tests), then lint stopped on existing repo issues outside this navigation cleanup:
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/StackPage.tsx`
- Edge/Playwright smoke on `http://127.0.0.1:4173/ui/visualizer/#/` passed:
  - `/` rendered `.quick-home-page` and no old catalog markers
  - top `模块` nav href = `#/`
  - brand href = `#/`
  - left tree rendered 9 category groups and category expand/collapse worked
  - expanded `树结构` listed module children
  - center `链表` card navigated to `#/modules/linked-list` and rendered `.linked-diagram-canvas`
  - direct `#/modules` rendered the new homepage and no old catalog markers
  - page/console errors = `0`
- Screenshot: `output/playwright/home-nav-tree-fix-smoke.png`

### Current State
- Updated:
  - `src/app/router.tsx`
  - `src/app/layout/Layout.tsx`
  - `src/pages/HomePage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Continue module-page visual overhaul separately; the homepage/category entry relationship is now consolidated.

## 2026-09-12 (homepage quick-navigation redesign)

### Today Done
- Replaced the root-route redirect with a practical quick-navigation homepage.
- The homepage now acts as an entry console instead of a marketing/AI-style landing page:
  - left course-category navigation matches the module catalog categories
  - center content groups implemented modules by category
  - top search filters modules directly
  - right rail shows recent visits, common entries, and a small favorites list
- Removed learning-progress presentation from the homepage; no progress percentage is shown or inferred.
- Kept the implementation data-driven from `moduleRegistry`, recent-visit storage, and existing translations.
- Recorded the homepage product decision in `docs/DECISIONS.md`.

### Verification
- `npm run build` passed.
- `npx eslint src/pages/HomePage.tsx` passed.
- `npm run check` was attempted: docs check and all tests passed (`103` files / `327` tests), then lint stopped on existing repo issues outside this homepage change:
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/StackPage.tsx`
- Edge/Playwright smoke on `http://127.0.0.1:4173/ui/visualizer/#/` passed:
  - homepage rendered all 9 category sections
  - sidebar rendered `首页` plus the 9 module categories
  - page text did not include `学习进度`
  - search for `链表` narrowed results to the linked-list card only
  - clicking the linked-list card navigated to `#/modules/linked-list` and rendered `.linked-diagram-canvas`
  - page/console errors = `0`
  - screenshot: `output/playwright/home-quick-nav-smoke.png`

### Current State
- Updated:
  - `src/pages/HomePage.tsx`
  - `src/index.css`
  - `docs/DECISIONS.md`
  - `docs/HANDOFF.md`
- Local dev server remains available at:
  - `http://127.0.0.1:4173/ui/visualizer/`

### Next Step
- Apply the selected tighter workbench direction to module pages after homepage checks are closed.

## 2026-09-12 (shared module workspace collapse controls)

### Today Done
- Started applying the selected workbench direction to module pages through the shared `WorkspaceShell`.
- Added a top-right playback-bar toggle to shared module workspaces:
  - bottom transport/playback controls are visible by default
  - clicking `播放栏` hides the bottom bar so the canvas can be viewed with less obstruction
  - clicking it again restores playback controls
- Kept existing left `控制` and right `步骤` regions as on-demand panels.
- Tightened shared floating panel styling:
  - smaller padding/gaps
  - less inflated corner radius
  - lighter shadow/background treatment
- Added zh/en labels for the playback-bar toggle.

### Verification
- `npm run build` passed.
- targeted eslint passed:
  - `npx eslint src/components/WorkspaceShell.tsx src/i18n/translations.ts src/pages/HomePage.tsx`
- `npm run check` was attempted: docs check and all tests passed (`103` files / `327` tests), then lint stopped on existing repo issues outside this shared-workspace change:
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/StackPage.tsx`
- Edge/Playwright smoke on `L-03 /modules/linked-list` passed:
  - initial `data-transport-open="true"`
  - clicking `播放栏` set `data-transport-open="false"` and removed `.tree-workspace-transport`
  - clicking again restored `.tree-workspace-transport`
  - linked-list canvas remained rendered
  - page/console errors = `0`
- Edge/Playwright shared smoke passed on `/modules/quick-sort` and `/modules/dfs`:
  - each route rendered the playback toggle
  - each route hid the bottom transport after click
  - page/console errors = `0`
- Screenshot: `output/playwright/workspace-transport-toggle-smoke.png`

### Current State
- Updated:
  - `src/components/WorkspaceShell.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/HANDOFF.md`

### Next Step
- Continue visual review and apply any remaining module-workbench prototype changes route-by-route only where the shared shell is insufficient.

## 2026-09-12 (workspace canvas zoom)

### Today Done
- Added canvas zoom as a shared workspace capability.
- Updated `WorkspaceShell` so most module pages now get:
  - a `- / 100% / +` zoom toolbar in the stage
  - zoom range clamped from `75%` to `150%`
  - Ctrl/Command + wheel zoom
  - zoom applied only to stage content, leaving Controls / Step / transport at normal size
- Added bilingual zoom labels for accessibility and tooltips.
- Added a page-scoped adapter for `T-01 /modules/binary-tree`, whose tree canvas is a special hand-written stage outside the shared `.workspace-stage-body` path.
- Fixed the `L-03 /modules/linked-list` zoom regression reported during review:
  - `WorkspaceShell` now exposes `--workspace-stage-zoom` and emits `workspace-stage-zoomchange`
  - `LinkedListPage` converts zoomed `getBoundingClientRect()` measurements back into the local SVG coordinate system before drawing arrows
  - linked-list arrows stay attached to node pointer fields at `110%` and `150%`
- Fixed the follow-up `L-03` double-list insertion review:
  - the `setForwardLink` frame now keeps the inserted node floating and visible
  - the final `prev.next -> new` arrow is drawn as a transient `linked-node-arrow-new`
  - the inserted node enters the main chain only on the following `completed` frame
  - continuous double-list insertion clears stale layout baselines and keeps arrow endpoints stable
- Recorded the platform decision in `docs/DECISIONS.md`.

### Verification
- `npm run build` passed.
- targeted eslint on changed source files passed:
  - `npx eslint src/components/WorkspaceShell.tsx src/pages/modules/BinaryTreeTraversalPage.tsx src/i18n/translations.ts`
- `npm test -- src/modules/linear/linkedListOps.test.ts src/pages/modules/linkedListPageUtils.test.ts` passed.
- `npm run check:docs` passed.
- Edge/Playwright regression for linked-list zoom passed:
  - single-list `110%`: first 3 forward arrow endpoints landed on target node left edges with distance `0`
  - double-list `110%`: forward and reverse arrows stayed on their intended pointer lanes
  - double-list `150%`: forward/reverse horizontal endpoint drift = `0`; vertical offset remained the deliberate lane offset
  - page/console errors = `0`
- Edge/Playwright regression for double-list continuous insertion passed:
  - first insert final-link frame: `1` `.linked-node-arrow-new`, `1` floating new node, `1` insert slot
  - second insert final-link frame after auto-sync: `1` `.linked-node-arrow-new`, `1` floating new node, `1` insert slot
  - page/console errors = `0`
- Full `npm run check` was attempted: docs check and all tests passed (`103` files / `327` tests), then lint stopped on existing repo issues outside this zoom change:
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/pages/modules/StackPage.tsx`
- Edge/Playwright smoke passed on:
  - `/modules/linked-list`: zoom `100% -> 110%`, linked node width `148 -> 163`, link arrows still rendered, page/console errors = `0`
  - `/modules/dfs`: zoom `100% -> 110%`, graph node width `70 -> 77`, page/console errors = `0`
  - `/modules/heap`: zoom `100% -> 110%`, heap node width `70 -> 77`, page/console errors = `0`
  - `/modules/binary-tree`: zoom `100% -> 110%`, tree node width `62 -> 68`, page/console errors = `0`

### Current State
- Updated:
  - `src/components/WorkspaceShell.tsx`
  - `src/pages/modules/BinaryTreeTraversalPage.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/DECISIONS.md`
  - `docs/HANDOFF.md`
- Local dev server remains available at:
  - `http://127.0.0.1:4173/ui/visualizer/`

### Next Step
- User visual review of zoom ergonomics across the pages they use most.

## 2026-09-12 (L-03 double-list pointer-lane and final-link refinement)

### Today Done
- Addressed the follow-up review on double-linked-list readability.
- Pulled the two pointer directions farther apart vertically:
  - `next` arrows now use the lower lane
  - `prev` arrows now use the upper lane
- Fixed the double-list insert finale so the `prior.next` repair is a visible final animation:
  - the `setForwardLink` step hides the default prior link
  - it draws a transient arrow from the prior node's `next` field to the newly inserted node
  - the transient arrow lands near the new node's left entry instead of extending into the data field
- Added regression coverage for the `setForwardLink` transient link metadata.

### Verification
- `npm test -- src/modules/linear/linkedListOps.test.ts src/pages/modules/linkedListPageUtils.test.ts` passed.
- `npm run build` passed.
- Edge/Playwright smoke passed on `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-list`:
  - double-list insert final frame rendered `1` `.linked-node-arrow-new`
  - final transient `prior.next -> new node` arrow length measured about `75px`
  - `next` and `prev` arrow lanes were separated by `32px`
  - page/console errors = `0`

### Current State
- Updated:
  - `src/modules/linear/linkedListOps.ts`
  - `src/modules/linear/linkedListOps.test.ts`
  - `src/pages/modules/LinkedListPage.tsx`
  - `docs/HANDOFF.md`
- Local dev server remains available at:
  - `http://127.0.0.1:4173/ui/visualizer/`
- Correct hash-router deep link:
  - `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-list`

### Next Step
- User visual review of the double-list insert final pointer repair frame.

## 2026-09-12 (L-03 double-list arrowhead color and spacing refinement)

### Today Done
- Addressed the follow-up visual review on `L-03 /modules/linked-list`.
- Changed linked-list SVG markers so arrowheads are no longer all inherited from the single-list blue marker:
  - forward `next` arrows use the blue marker
  - reverse `prev` arrows use the purple marker
  - circular return arrows use the teal marker
  - transient moving/new/delete links use their own marker colors
- Increased linked-list node width and horizontal spacing so double-list nodes have more room for `prev | data | next` and no longer appear crowded.

### Verification
- Edge/Playwright smoke passed on `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-list`:
  - double mode rendered `5` double-list nodes during insert playback
  - visible `prev` labels = `3`
  - visible `next` labels = `4`
  - reverse prev arrows = `3`
  - marker ids confirmed `linked-arrow-head-prev` for reverse arrows and `linked-arrow-head-next` for forward arrows
  - adjacent node gaps measured `28px`
  - page/console errors = `0`

### Current State
- Updated:
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/index.css`
  - `docs/HANDOFF.md`
- Local dev server remains available at:
  - `http://127.0.0.1:4173/ui/visualizer/`
- Correct hash-router deep link:
  - `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-list`

### Next Step
- User visual review of the less crowded double-list layout and direction-colored arrowheads.

## 2026-09-12 (L-03 double-list four-pointer animation refinement)

### Today Done
- Addressed user review on `L-03 /modules/linked-list` double linked list mode.
- Changed the double-list timeline so insert/delete no longer reuse the single-list animation shape:
  - double-list insert now steps through:
    - `new.prev = prev`
    - `new.next = next`
    - `next.prev = new`
    - `prev.next = new` or `head = new`
  - double-list delete now steps through:
    - locate `prev / target / next`
    - repair `prev.next` or move `head`
    - repair `next.prev`
    - detach the target node
- Strengthened double-list visual language:
  - `prev` pointer field now shows a visible `prev` label and purple styling
  - `next` pointer field now shows a visible `next` label and blue styling
  - reverse `prev` arrows are thicker, purple, and dashed
  - forward `next` arrows remain blue, so direction is easier to distinguish during lecture playback
- Added step descriptions for the new pointer phases:
  - `setPrevLink`
  - `setNextLink`
  - `setBackLink`
  - `setForwardLink`
- Added regression coverage so double-list insert/delete action sequences must keep the explicit pointer phases.

### Verification
- `npm test -- src/modules/linear/linkedListOps.test.ts src/pages/modules/linkedListPageUtils.test.ts` passed.
- `npm run build` passed.
- Targeted eslint on changed source files passed.
- Playwright smoke passed on `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-list`:
  - double mode rendered `4` double-list nodes
  - visible `prev` labels = `3`
  - visible `next` labels = `4`
  - reverse prev arrows = `3`
  - timeline advanced to `5/6`
  - page/console errors = `0`

### Current State
- Updated:
  - `src/modules/linear/linkedListOps.ts`
  - `src/modules/linear/linkedListOps.test.ts`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/HANDOFF.md`
- Local dev server remains available at:
  - `http://127.0.0.1:4173/ui/visualizer/`
- Correct hash-router deep link:
  - `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-list`

### Next Step
- User visual review of the revised double-list insert/delete pointer choreography.

## 2026-09-09 (L-03 doubly/circular linked-list expansion)

### Today Done
- User confirmed the project lacked double linked list and circular linked list coverage, then approved implementation after a design-doc pass.
- Expanded `L-03 /modules/linked-list` in-place rather than adding new routes:
  - added linked-list shape mode support: singly / doubly / circular
  - kept the existing `find` / `insertAt` / `deleteAt` operation family
  - preserved legacy/default single-linked-list behavior by defaulting missing mode to `singly`
- Runtime/model follow-up:
  - added `LinkedListMode`
  - added optional `prevId` on linked-list node snapshots
  - generated double-linked-list snapshots with consistent `prev` / `next` relationships
  - generated circular snapshots where the tail points back to `head`, including single-node self-loop handling
- UI follow-up:
  - added a `List type / 链表形态` selector in the `L-03` controls panel
  - rendered double-linked-list nodes as `prev | data | next`
  - rendered double-linked-list reverse links with a separate dashed path style
  - rendered circular-list tail-to-head links with a separate curved return path
  - kept shape-specific pseudocode in the Step panel instead of mixing all list variants
- Documentation follow-up:
  - expanded `docs/modules/L-03-linked-list.md` with double/circular linked-list design, visual semantics, pseudocode scope, and DoD.

### Verification
- `npm test -- src/modules/linear/linkedListOps.test.ts src/pages/modules/linkedListPageUtils.test.ts` passed.
- `npm run build` passed.
- `npm run check`:
  - docs check passed
  - full test suite passed: `103` files / `327` tests
  - lint still fails only on pre-existing files outside this `L-03` change:
    - `src/components/WorkspaceShell.tsx`
    - `src/hooks/useStageAnchorPanel.ts`
    - `src/pages/modules/HuffmanTreePage.tsx`
    - `src/pages/modules/StackPage.tsx`
    - `src/pages/modules/QueuePage.tsx` warning
- Targeted eslint on changed source files passed:
  - `src/modules/linear/linkedListOps.ts`
  - `src/pages/modules/linkedListPageUtils.ts`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/i18n/translations.ts`
- Playwright smoke passed on `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-list`:
  - double mode rendered `4` `.linked-node-doubly` nodes and `2` `.linked-node-arrow-prev` arrows
  - circular mode rendered `1` `.linked-node-arrow-circular` return edge
  - page/console errors = `0`

### Current State
- Updated:
  - `src/modules/linear/linkedListOps.ts`
  - `src/pages/modules/linkedListPageUtils.ts`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `src/modules/linear/linkedListOps.test.ts`
  - `src/pages/modules/linkedListPageUtils.test.ts`
  - `docs/modules/L-03-linked-list.md`
  - `docs/HANDOFF.md`
- Local dev server is still expected at:
  - `http://127.0.0.1:4173/ui/visualizer/`
- Correct hash-router deep link for the page:
  - `http://127.0.0.1:4173/ui/visualizer/#/modules/linked-list`

### Next Step
- User review of the new `L-03` shape selector and whether the circular return arc / double-list reverse arrows are visually clear enough.

## 2026-08-29 (G-02B directed-edge spacing pass)

### Today Done
- Stayed on the graph line only and refined the active `G-02B /modules/graph-adjacency-list` page again.
- Adjusted directed-edge geometry so arrows that share the same source or same target no longer leave/enter the node almost on top of each other.
- The new path logic now:
  - groups outgoing edges by shared source vertex
  - groups incoming edges by shared target vertex
  - sorts each group by angle
  - fans each edge outward with a small normal-offset at both endpoints before building the quadratic curve
- Goal of this pass:
  - make arrow tails and arrowheads easier to distinguish on directed samples without changing the teaching content or numbering

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyListPage.tsx`
- Immediate next step:
  - visually verify the directed sample in `/modules/graph-adjacency-list`
  - confirm the spacing is now obviously cleaner around shared vertices

## 2026-08-29 (G-02B pointer naming + stronger highlight pass)

### Today Done
- Kept working on the active graph-definition/storage line only.
- Addressed two user-reported clarity issues on `G-02B /modules/graph-adjacency-list`:
  - replaced the too-generic head-pointer label `first` with the clearer adjacency-list field name `firstedge`
  - strengthened click-link highlighting across the whole page instead of relying on subtle color shifts only
- Highlight follow-up landed locally:
  - selected graph edge now uses much thicker stroke plus stronger orange glow
  - vertex-linked related edges now use thicker blue highlight and future/unrelated edges stay dimmer
  - selected vertex itself is enlarged and glows more strongly
  - endpoints of a selected edge now also stand out on the graph canvas
  - neighbor vertices of a selected vertex now get a separate blue-highlight treatment
  - corresponding head rows / head nodes / adjacency-list nodes now use stronger border/background/shadow contrast
- Small wording/layout follow-up landed:
  - the `firstedge` pointer label inside the head-array node is now rendered on two lines as `first` / `edge`
  - the first attempt was still overridden by the shared linked-node pointer layout, so the head-node pointer area now uses a page-scoped vertical layout override plus block-level line spans

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyListPage.tsx`
  - `src/index.css`
- Immediate next step:
  - rebuild and re-open `/modules/graph-adjacency-list`
  - verify `firstedge` wording and confirm the stronger selected/related highlighting is actually obvious enough in the browser

## 2026-08-28 (G-02B adjacency-list temporary-route first pass)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Kept the priority on the graph basic-content line and did not resume tree work.
- Started the next graph storage follow-up as a temporary adjacency-list page:
  - temporary module id: `G-02B`
  - temporary route: `/modules/graph-adjacency-list`
  - kept legacy `G-02 /modules/dfs` unchanged
- Landed the first static teaching pass for adjacency-list storage:
  - same deterministic graph sample family as `G-02A`
  - graph canvas and adjacency-list rows are click-linked
  - vertex array is shown separately from the adjacency-list rows
  - selected vertex highlights related edges and adjacency-list entries
  - selected edge highlights the corresponding adjacency-list entry or mirrored pair of entries
  - selected edge hover shows the list-row mapping tooltip
  - notes area follows the same compact numbered two-column pattern as the accepted `G-02A`
- Also filled the missing graph-storage catalog/title translation gaps:
  - added `module.g02a.title/body`
  - added `module.g02b.title/body`
- User-directed refinement landed after the first pass:
  - removed the separate standalone vertex-array panel because it duplicated the first list column too much
  - merged the storage view into one clearer `表头数组与邻接链表` panel
  - changed the leftmost head element of each row into one split node that shows:
    - vertex data in the front half
    - head pointer (`first`) in the back half
  - changed every adjacency node into the same split-node pattern so the page now looks closer to the real linked-list storage structure

### Current State
- Updated files:
  - `src/modules/graph/adjacencyList.ts`
  - `src/pages/modules/GraphAdjacencyListPage.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/pages/moduleCatalog.ts`
  - `src/app/router.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
- Verification completed:
  - `npm run build` passed locally on 2026-08-28
  - `npm run check` still fails only on the same pre-existing lint issues outside this new graph page:
    - `src/components/WorkspaceShell.tsx`
    - `src/hooks/useStageAnchorPanel.ts`
    - `src/pages/modules/HuffmanTreePage.tsx`
    - `src/pages/modules/StackPage.tsx`
    - `src/pages/modules/QueuePage.tsx` warning
  - `http://127.0.0.1:4173/modules/graph-adjacency-list` returns `200`
  - Playwright smoke confirmed:
    - `/modules/graph-adjacency-list` page title is `G-02B 图的邻接表存储 | DSA 可视化平台`
    - `/modules` page title is `模块目录 | DSA 可视化平台`
    - `/modules` page text now includes both `G-02B` and `图的邻接表存储`
    - after clicking vertex `v1`, highlighted graph edges count = `3`, highlighted adjacency-list entries count = `6`, active row head count = `1`
    - after clicking one adjacency-list entry, active graph edge count = `1`, active adjacency-list entry count = `2` on the undirected sample
  - `G-02A` title gap is also fixed now:
    - `/modules/graph-adjacency-matrix` page title is `G-02A 图的邻接矩阵存储 | DSA 可视化平台`

### Next Step
- Keep the graph line active, treat `G-02B` as the current adjacency-list first pass under review, and wait for the next user-directed graph follow-up before touching tree work again.

## 2026-08-28 (graph-definition status audit kickoff)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Re-read the required session docs in order before touching code:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
  - `AGENTS.md`
- Reconfirmed the current audit scope from repo docs before any implementation work:
  - `G-01 /modules/graph-representation` is treated as temporarily accepted
  - legacy `G-02 /modules/dfs` must keep its numbering and route
  - the new adjacency-matrix teaching page is currently the temporary `G-02A` on `/modules/graph-adjacency-matrix`
  - the current goal is status recovery and validation, not opening new scope

### Current State
- Branch confirmed locally:
  - `feat/p14-backlog-wave`
- Repo docs currently agree that the immediate review target is the rebuilt graph-definition track, especially the temporary adjacency-matrix page.
- Live verification completed so far:
  - `npm run dev -- --host 127.0.0.1 --port 4173` starts successfully in the Windows worktree
  - homepage request and `/modules/graph-adjacency-matrix` request both return `200`
  - Playwright CLI can open `/modules` and `/modules/graph-adjacency-matrix` without browser-side console errors
  - `G-02A` interaction confirmed:
    - clicking a vertex highlights the related edges and corresponding matrix cells
    - clicking a graph edge selects the edge and highlights the corresponding matrix cells
    - clicking a matrix cell selects the corresponding edge
    - graph edges are actually clickable through the transparent stroke hit area
  - current info panel is already simplified around:
    - `Definition`
    - `Features`
    - `Pseudocode`
    - result/degree explanation cards
- Known issue found during live audit:
  - `/modules/graph-adjacency-matrix` currently renders document title `undefined | DSA Visualizor`
  - likely cause: registry-based title lookup exists, but `src/i18n/translations.ts` has no `module.g02a.*` entries yet
- Additional route-surface note:
  - `/modules` currently shows `51 results`, `Graphs 10`, and a live `G-02A` card
  - the `G-02A` card currently has no catalog description text in the modules listing, which is consistent with the same missing translation-key gap
- New user-directed simplification landed locally on 2026-08-28:
  - removed the `Locate Vertex / Display Matrix / Create Matrix / Show Degree` operation row from `G-02A`
  - removed the `Pseudocode` tab and the whole operation-state playback logic from `G-02A`
  - kept only static definition/features explanation plus graph <-> matrix click correspondence
  - enlarged weighted-graph `∞` matrix rendering to `2x` the normal matrix value size
- Additional layout follow-up landed locally on 2026-08-28:
  - merged the `G-02A` top controls and graph-summary pills into one toolbar row on desktop
  - kept a responsive wrap fallback only for narrower viewports
  - changed the `顶点数` field to left-right inline label + select alignment so the whole toolbar row reads on one horizontal baseline
  - corrected a local CSS precedence mistake: the shared `.tree-workspace-field` rule had overridden the first inline-field attempt, so `G-02A` now uses a higher-priority toolbar-scoped selector for true left-right alignment
  - removed the now-misleading `生成样本` and `重置选择` buttons from `G-02A`; changing the toggles/select still rebuilds the teaching graph directly
  - rebuilt the right side of `G-02A` toward a clearer storage-teaching layout:
    - added the one-dimensional vertex array above the adjacency matrix
    - merged `定义` and `特点` into one static explanation panel
    - removed the fixed bottom info grid
    - moved vertex-specific degree / neighbor details into a node hover tooltip that appears on the selected node
    - widened the matrix side and relaxed internal overflow so the matrix area can grow without the old vertical scroll behavior

### Next Step
- Summarize the restored graph-track status against the user's checklist, call out the differences between docs and current runtime if any, and wait for the user's next instruction before making feature changes.

## 2026-08-27 (G-02 adjacency-matrix temporary-route first pass)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Started the new graph-definition follow-up after the user accepted the current `G-01` baseline "for now".
- Kept the legacy numbering stable by user request:
  - old `G-02 /modules/dfs` stays untouched
  - new adjacency-matrix teaching page was added on a temporary route instead of renumbering graph modules immediately
- Landed the first classroom-oriented `G-02` adjacency-matrix page:
  - temporary route: `/modules/graph-adjacency-matrix`
  - temporary registry id: `G-02A`
  - scope intentionally limited to definition + storage + basic static operations, not traversal algorithms
  - current operations:
    - `查找顶点`
    - `显示矩阵`
    - `创建矩阵`
    - `查看度`
  - current interaction model:
    - switch `有向 / 无向`
    - switch `带权 / 无权`
    - choose vertex count `4 / 5 / 6`
    - click graph vertices / edges / matrix cells to inspect direct correspondence
  - current teaching panels:
    - definition copy based on courseware wording
    - feature list for symmetry / degree / in-degree / out-degree / space complexity
    - pseudocode panel aligned toward `LocateVex` / `DisplayAdjMatrix` / matrix creation wording from Chapter 6 slides
- Added the small graph helper dedicated to the new page:
  - `src/modules/graph/adjacencyMatrix.ts`

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyMatrixPage.tsx`
  - `src/modules/graph/adjacencyMatrix.ts`
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/index.css`
- Verified:
  - `npm run build` passed locally on 2026-08-27
  - `npm run check`
    - docs check passed
    - tests passed: `103` files / `324` tests
    - lint still fails, but the remaining failures are pre-existing repo issues outside this new `G-02` page:
      - `src/components/WorkspaceShell.tsx`
      - `src/hooks/useStageAnchorPanel.ts`
      - `src/pages/modules/HuffmanTreePage.tsx`
      - `src/pages/modules/StackPage.tsx`
      - `src/pages/modules/QueuePage.tsx` warning
- Important routing decision currently in effect:
  - do not rename old graph modules yet
  - review the new adjacency-matrix page first, then decide whether to formalize numbering later

### Next Step
- Open `/modules/graph-adjacency-matrix` and review whether this first pass matches the classroom expectation for `G-02`:
  - is the current left-graph / right-matrix+explanation split acceptable
  - does the pseudocode wording need to be tightened further toward the exact PPT phrasing
  - should `创建矩阵` be split more explicitly into `输入边 -> 定位顶点 -> 写入矩阵` substeps in the next pass
  - should the temporary route/module id stay until the whole new graph chapter is rebuilt, or should numbering be migrated earlier

## 2026-08-26 (G-01 concept-workbench first pass)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Reframed `G-01 /modules/graph-representation` away from the old timeline-first representation walkthrough and into a first concept-first graph definition workbench.
- Landed a first classroom-oriented pass with no algorithm playback:
  - one page with three tabs:
    - `基础术语`
    - `连通性`
    - `特殊图`
  - random graph generation controls for:
    - 有向 / 无向
    - 带权 / 不带权
    - 稀疏 / 中等 / 稠密
    - 顶点数 `5` ~ `12`
    - scenario constraints:
      - undirected: `一般随机 / 连通图 / 非连通图 / 完全图`
      - directed: `一般随机 / 强连通图 / 非强连通图 / 完全图`
  - click-driven concept inspection:
    - click one vertex -> neighbors + degree/in-degree/out-degree cards
    - click two vertices -> one simple-path example with edge-count length and weighted length split
    - click one edge -> direct relation / weight explanation
  - connectivity tab now colors component groups directly and reports:
    - connected components
    - strong components
  - special-graph tab now shows complete-graph / complete-digraph result cards with edge-count formulas
- Visual direction of the first pass:
  - left graph / right explanation layout
  - smaller nodes and lighter arrows than the previous `G-01`
  - directed edges now use curved paths
  - new graph generation uses light draw-in motion plus selected-node pulse
- Supporting files added/updated:
  - `src/pages/modules/GraphRepresentationPage.tsx`
  - `src/modules/graph/graphConcepts.ts`
  - `src/index.css`

### Current State
- Verified targeted graph legacy tests still pass:
  - `npm test -- src/modules/graph/graphRepresentation.test.ts src/modules/graph/graphRepresentationTimelineReplay.test.ts`
- Verified local production build:
  - `npm run build`
- Repo-wide `npm run check` is still not green because of pre-existing lint errors outside this `G-01` pass:
  - `src/components/WorkspaceShell.tsx`
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/StackPage.tsx`
  - plus one `QueuePage.tsx` hook warning

### Next Step
- Open `/modules/graph-representation` and review the first-pass classroom feel:
  - whether the current three-tab split is right
  - whether sparse/dense random generation is visually clear enough at `8`~`12` vertices
  - whether the right-side cards are the right amount of explanation or still too dense
  - whether the path/cycle/concept wording should be tightened before splitting G-01/G-02 formally
- New follow-up idea recorded for after the current graph-definition track is stable:
  - add a parallel concept-first `tree definition` module so tree basics can be taught with the same “definition before algorithm” classroom pattern
  - do not open that scope yet; keep it queued until the graph-definition work is accepted

## 2026-08-22 (T-07 build pseudocode courseware alignment)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Kept the scope intentionally narrow after the chapter-code comparison review:
  - only updated `T-07 /modules/huffman-tree` build/construction pseudocode
  - did **not** change Huffman coding pseudocode
  - did **not** change WPL pseudocode
- `T-07` build pseudocode is now closer to Chapter 5 courseware `算法 5.13`:
  - the Chinese-side wording now uses the textbook-style `HuffNode[0..n-1]`, `parent == -1`, and `HuffNode[n + i]` phrasing
  - the C-style side now shows a more courseware-like `void HaffmanTree(...)` skeleton instead of the earlier short conceptual summary
  - build-phase active-line highlighting was remapped so the richer displayed code still follows the existing animation states correctly

### Current State
- Verified targeted tests:
  - `npm test -- src/modules/tree/huffman.test.ts src/modules/tree/huffmanTimelineReplay.test.ts`
- Verified local build:
  - `npm run build`
- `npm run check` remains blocked on this Windows worktree because `./scripts/check-doc-links.sh` is not directly executable from PowerShell.
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open `/modules/huffman-tree` and review whether the new build/code window now looks acceptably close to the Chapter 5 classroom code style.
- If accepted, the next follow-up can decide whether to:
  - stop here and commit this focused `T-07` pseudocode adjustment
  - or continue the same courseware-alignment pass on the next highest-value module (`L-03` is the strongest candidate)

## 2026-08-22 (L/T/M pseudocode comparison draft)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Added one small runtime UI follow-up after the pseudocode review:
  - `L-04 /modules/stack` step panel no longer shows mixed push/pop/peek pseudocode at the same time
  - sequential-stack and linked-stack pseudocode now switch with the currently selected operation (`push` / `pop` / `peek`)
  - active-line highlighting is remapped to the currently displayed subset instead of the old full combined list
- Added the matching queue follow-up:
  - `L-05 /modules/queue` pseudocode is now split by queue mode and operation
  - current step panel switches between:
    - normal queue + enqueue
    - normal queue + dequeue
    - normal queue + front
    - circular queue + enqueue
    - circular queue + dequeue
    - circular queue + front
  - active-line highlighting is remapped to the currently displayed subset instead of the old one-block queue pseudocode
- Added one tree-panel follow-up after the user asked to simplify tree pages:
  - `T-03` / `T-04` / `T-05` / `T-06` step panels now keep only pseudocode content and no longer repeat the old step-copy / key-value summary blocks
  - the above tree pages plus `T-07` now use a horizontal workbench-style controls layout instead of the older narrow vertical drawer form layout
  - `T-07 /modules/huffman-tree` no longer reuses one shared construction pseudocode for every phase:
    - build mode shows construction pseudocode
    - code walkthrough shows coding pseudocode
    - WPL walkthrough shows WPL pseudocode
  - `T-07` detail walkthrough steps now carry their own active pseudocode line mapping, so highlighting follows the coding/WPL sub-animation instead of the build timeline lines
- Added one review-only comparison document for the currently implemented `L` / `T` / `M` routes:
  - `docs/LTM_PSEUDOCODE_COMPARE.md`
- Scope of the document:
  - `L-01` ~ `L-05`
  - `T-01` ~ `T-07`
  - `M-01` ~ `M-07`
- Document structure:
  - current Chinese-style pseudocode now shown in the UI
  - proposed C-like pseudocode counterpart for review
  - explicit note when a module currently has no standalone pseudocode block and only uses rule/formula explanation

### Current State
- The comparison draft now has one accepted pilot implementation on `L-04`:
  - stack pseudocode display is operation-specific instead of one combined block
- Local verification for this stack follow-up:
  - `npm test -- src/pages/modules/stackPageUtils.test.ts src/pages/modules/stackComparisonUtils.test.ts src/modules/linear/stackOps.test.ts`
  - `npm run build`
- Local verification for this queue follow-up:
  - `npm test -- src/pages/modules/queuePageUtils.test.ts src/modules/linear/queueOps.test.ts`
  - `npm run build`
- Local verification for this tree-panel / Huffman follow-up:
  - `npm test -- src/modules/tree/huffman.test.ts src/modules/tree/huffmanTimelineReplay.test.ts`
  - `npm run build`
- `npm run check` still fails immediately on this Windows worktree because `./scripts/check-doc-links.sh` is not directly executable from PowerShell.
- Next decision needed from user:
  - whether the proposed C-like wording direction is acceptable
  - whether `M-02` ~ `M-07` should later gain real pseudocode blocks or stay as rule/formula-first teaching pages

### Next Step
- Continue rolling the same dual-column, operation-aware pseudocode treatment to the next accepted modules in small batches.

## 2026-08-22 (T-07 Huffman tree phased-layout rebuild)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Re-opened `T-07 /modules/huffman-tree` to address the user-reported teaching/visual issues in the construction stage.
- Aligned the data timeline with a richer staged merge model:
  - `select`
  - `lift`
  - `attach`
  - `return`
  - final `code` / `completed`
- Reworked the page away from the old top-corner floating forest/code overlays:
  - added explicit forest / merge / result stage regions
  - kept original input weights always visible inside the stage
  - moved the current forest snapshot and code table into stable stage cards
  - added `WPL` display once codes are available
  - added a `跳到编码` action that seeks directly to the code-generation step
- Visual/runtime details:
  - tree edges now use anchored cubic curves instead of rough center-to-center lines
  - selected roots and the newly created parent root now have distinct highlight styles
  - node positions now depend on the current phase, so selected subtrees lift into the merge area before returning to the forest
- Synced supporting files:
  - `src/modules/tree/huffman.test.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`

### Current State
- Verified targeted tests:
  - `npm test -- src/modules/tree/huffman.test.ts src/modules/tree/huffmanTimelineReplay.test.ts`
- Verified local build:
  - `npm run build`
- `npm run check` is still blocked on this Windows worktree because `./scripts/check-doc-links.sh` is a Unix shell script and PowerShell cannot execute it directly.
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open `/modules/huffman-tree` and review:
  - whether the phased forest/merge/result layout is now visually acceptable
  - whether the lift -> attach -> return animation semantics feel clear enough
  - whether code-table / WPL presentation matches the teaching goal
- If accepted, commit this Huffman stage rebuild as one scoped change set before starting the next tree refinement.

## 2026-08-22 (M-07 follow-up: generalized list head/tail trainer)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- After finishing the matrix + sparse-storage batch, opened one focused generalized-list follow-up route:
  - `M-07 /modules/generalized-list-head-tail`
- Kept the scope intentionally exam-oriented instead of broad:
  - random legal generalized list generation under configurable limits
  - random legal nested `head` / `tail` expression generation
  - step-by-step reduction that peels the expression from the innermost legal operation outward
- User-approved parameter surface:
  - atom-type count: default `2`, min `1`, max `4`
  - list width: default `3`, min `1`, max `5`
  - list depth: default `2`, min `1`, max `4`
  - operation mode: `仅 head` / `仅 tail` / `head / tail 混合`
  - operation nesting depth: default `2`, min `1`, max `4`
- Implementation details:
  - `src/modules/storage/generalizedListHeadTail.ts`: config sanitization, generalized-list generator, legal operation-chain generator, stepwise reduction model
  - `src/modules/storage/generalizedListHeadTail.test.ts`: config, legal generation, mode coverage, reduction coverage
  - `src/pages/modules/GeneralizedListHeadTailPage.tsx`: parameter controls + generated list + stepwise reduction + rule explanation
  - route/registry/catalog/i18n/css synced for `M-07`
- Product-surface sync:
  - home route-count copy updated from `49` to `50`

### Current State
- Local verification target for this subtask:
  - `npm test -- src/modules/storage/generalizedListHeadTail.test.ts src/modules/storage/sparseMatrixLinked.test.ts src/modules/storage/sparseMatrixTriples.test.ts src/modules/storage/lowerTriangularMatrix.test.ts src/modules/storage/upperTriangularMatrix.test.ts src/modules/storage/twoDimensionalArray.test.ts src/modules/storage/symmetricMatrix.test.ts`
  - `npm run build`
- `npm run check` remains blocked on this Windows worktree because `./scripts/check-doc-links.sh` is a Unix shell script
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open `/modules/generalized-list-head-tail` and review:
  - parameter panel ranges / defaults
  - randomness quality of generated generalized lists
  - whether the current step-by-step reduction is clear enough for exam-style nested `head/tail` problems
- If accepted, the Chapter 4 local batch can pause for acceptance and commit.

## 2026-08-22 (M-06 storage follow-up: sparse matrix linked storage)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- After the user accepted the current `M-05` direction, landed `M-06 /modules/sparse-matrix-linked` as the sixth storage-track pilot.
- Followed the courseware wording on slide 21-22:
  - sparse matrix linked storage is modeled as `带行指针的单链表存储法`
  - each row has one head pointer
  - each row's non-zero triplets are linked left-to-right in increasing column order
- Implementation details:
  - `src/modules/storage/sparseMatrixLinked.ts`: row-chain builder, node lookup, next-pointer explanation helpers
  - `src/modules/storage/sparseMatrixLinked.test.ts`: bounds, row-chain structure, next-node, zero-cell coverage
  - `src/pages/modules/SparseMatrixLinkedPage.tsx`: matrix / rule / row-pointer-linked page
  - route/registry/catalog/i18n/css synced for `M-06`
- Product-surface sync:
  - home route-count copy updated from `48` to `49`

### Current State
- Local verification target for this subtask:
  - `npm test -- src/modules/storage/sparseMatrixLinked.test.ts src/modules/storage/sparseMatrixTriples.test.ts src/modules/storage/lowerTriangularMatrix.test.ts src/modules/storage/upperTriangularMatrix.test.ts src/modules/storage/twoDimensionalArray.test.ts src/modules/storage/symmetricMatrix.test.ts`
  - `npm run build`
- `npm run check` remains blocked on this Windows worktree because `./scripts/check-doc-links.sh` is a Unix shell script
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open the six current storage pilots for direct browser review:
  - `/modules/two-dimensional-array`
  - `/modules/symmetric-matrix`
  - `/modules/upper-triangular-matrix`
  - `/modules/lower-triangular-matrix`
  - `/modules/sparse-matrix-triples`
  - `/modules/sparse-matrix-linked`
- If the user accepts `M-06`, the first Chapter 4 storage batch can pause for acceptance or move into a new expansion topic.

## 2026-08-22 (M-05 storage follow-up: sparse matrix triplet storage)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- After the user accepted the current `M-04` direction, landed `M-05 /modules/sparse-matrix-triples` as the fifth storage-track pilot.
- Kept the same accepted storage-page interaction baseline:
  - fixed three-column teaching layout
  - click matrix cell directly to choose target
  - zero elements remain clickable for explanation, but only non-zero elements enter the compressed structure
- Implementation details:
  - `src/modules/storage/sparseMatrixTriples.ts`: sparse presets, non-zero flattening, triplet-index lookup
  - `src/modules/storage/sparseMatrixTriples.test.ts`: bounds, flatten order, triplet index, non-zero count coverage
  - `src/pages/modules/SparseMatrixTriplesPage.tsx`: matrix / rule / triplet-table page
  - route/registry/catalog/i18n/css synced for `M-05`
- Product-surface sync:
  - home route-count copy updated from `47` to `48`

### Current State
- Local verification target for this subtask:
  - `npm test -- src/modules/storage/sparseMatrixTriples.test.ts src/modules/storage/lowerTriangularMatrix.test.ts src/modules/storage/upperTriangularMatrix.test.ts src/modules/storage/twoDimensionalArray.test.ts src/modules/storage/symmetricMatrix.test.ts`
  - `npm run build`
- `npm run check` remains blocked on this Windows worktree because `./scripts/check-doc-links.sh` is a Unix shell script
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open the five current storage pilots for direct browser review:
  - `/modules/two-dimensional-array`
  - `/modules/symmetric-matrix`
  - `/modules/upper-triangular-matrix`
  - `/modules/lower-triangular-matrix`
  - `/modules/sparse-matrix-triples`
- If the user accepts `M-05`, continue to:
  - sparse-matrix linked storage

## 2026-08-22 (M-04 storage follow-up: lower triangular matrix compressed storage)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- After the user accepted the current `M-03` direction, landed `M-04 /modules/lower-triangular-matrix` as the fourth storage-track pilot.
- Kept the same accepted storage-page interaction baseline:
  - fixed three-column teaching layout
  - click matrix cell directly to choose target
  - strict upper-triangular constant region reuses one shared constant slot `c`
- Implementation details:
  - `src/modules/storage/lowerTriangularMatrix.ts`: preset matrices, lower-triangle index formula, shared-constant-slot mapping, flatten helper
  - `src/modules/storage/lowerTriangularMatrix.test.ts`: bounds, stored-index, constant-slot, flatten-order coverage
  - `src/pages/modules/LowerTriangularMatrixPage.tsx`: matrix / formula / compressed-memory page
  - route/registry/catalog/i18n synced for `M-04`
- Product-surface sync:
  - home route-count copy updated from `46` to `47`

### Current State
- Local verification target for this subtask:
  - `npm test -- src/modules/storage/lowerTriangularMatrix.test.ts src/modules/storage/upperTriangularMatrix.test.ts src/modules/storage/twoDimensionalArray.test.ts src/modules/storage/symmetricMatrix.test.ts`
  - `npm run build`
- `npm run check` remains blocked on this Windows worktree because `./scripts/check-doc-links.sh` is a Unix shell script
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open the four current storage pilots for direct browser review:
  - `/modules/two-dimensional-array`
  - `/modules/symmetric-matrix`
  - `/modules/upper-triangular-matrix`
  - `/modules/lower-triangular-matrix`
- If the user accepts `M-04`, continue to:
  - sparse-matrix triple-table
  - sparse-matrix linked storage

## 2026-08-21 (M-03 storage follow-up: upper triangular matrix compressed storage)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- User accepted the current `M-02` direction and asked to continue with the next Chapter 4 storage module.
- Landed `M-03 /modules/upper-triangular-matrix` as the third storage-track pilot:
  - fixed-layout teaching page consistent with `M-01` / `M-02`
  - only stores the main diagonal plus the upper triangle
  - strict lower-triangular zeros now map to one shared constant slot `c = 0`
- Implementation details:
  - `src/modules/storage/upperTriangularMatrix.ts`: preset matrices, upper-triangle index formula, shared-zero-slot mapping, flatten helper
  - `src/modules/storage/upperTriangularMatrix.test.ts`: bounds, stored-index, zero-slot, flatten-order coverage
  - `src/pages/modules/UpperTriangularMatrixPage.tsx`: matrix / formula / compressed-memory page
  - route/registry/catalog/i18n/css synced for `M-03`
- Product-surface sync:
  - home route-count copy updated from `45` to `46`

### Current State
- Re-verified locally on `2026-08-21`:
  - `npm test -- src/modules/storage/upperTriangularMatrix.test.ts src/modules/storage/twoDimensionalArray.test.ts src/modules/storage/symmetricMatrix.test.ts`
  - `npm run build`
- `npm run check` remains blocked on this Windows worktree because `./scripts/check-doc-links.sh` is a Unix shell script
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open the three current storage pilots for direct browser review:
  - `/modules/two-dimensional-array`
  - `/modules/symmetric-matrix`
  - `/modules/upper-triangular-matrix`
- If the user accepts this third page, continue to:
  - lower-triangular matrix
  - sparse-matrix triple-table
  - sparse-matrix linked storage

## 2026-08-21 (M-02 storage follow-up: symmetric matrix compressed storage)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- User accepted the revised `M-01` direction and asked to continue.
- Landed `M-02 /modules/symmetric-matrix` as the second storage-track pilot:
  - fixed-layout teaching page consistent with the current storage pages
  - supports `只存上三角` / `只存下三角`
  - shows mirrored reuse for off-half targets and maps them into compressed linear storage
- Implementation details:
  - `src/modules/storage/symmetricMatrix.ts`: preset matrices, symmetric mirroring, upper/lower compressed index formulas, flatten helpers
  - `src/modules/storage/symmetricMatrix.test.ts`: upper/lower mapping and flatten order coverage
  - `src/pages/modules/SymmetricMatrixPage.tsx`: matrix / formula / compressed-memory page
  - route/registry/catalog/i18n/css synced for `M-02`
- Product-surface sync:
  - home route-count copy updated from `44` to `45`

### Current State
- Local verification target for this subtask:
  - `npm test -- src/modules/storage/twoDimensionalArray.test.ts src/modules/storage/symmetricMatrix.test.ts`
  - `npm run build`
- `npm run check` remains blocked on this Windows worktree because `./scripts/check-doc-links.sh` is a Unix shell script
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open `/modules/two-dimensional-array` and `/modules/symmetric-matrix` for direct browser review, then decide whether to continue to:
  - upper-triangular matrix
  - lower-triangular matrix
  - sparse-matrix triple-table
  - sparse-matrix linked storage

## 2026-08-21 (M-01 Chapter 4 pilot: two-dimensional array sequential storage)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- User explicitly approved opening Chapter 4 with one pilot module before any broader expansion.
- Landed a new storage-track pilot module:
  - added new catalog category `storage`
  - added `M-01 /modules/two-dimensional-array`
  - implemented row-major two-dimensional array storage mapping only (`k = i * cols + j`)
- Implementation details:
  - `src/modules/storage/twoDimensionalArray.ts`: preset matrices, target validation, row-major step generator
  - `src/modules/storage/twoDimensionalArrayTimelineAdapter.ts`: timeline frame adapter
  - `src/modules/storage/twoDimensionalArray.test.ts`: mapping / scan-prefix / validation coverage
  - `src/pages/modules/TwoDimensionalArrayPage.tsx`: matrix-to-linear teaching page on `WorkspaceShell`
  - registry/router/catalog/i18n/css wired for the new `storage` category and `M-01`
- Product-surface sync:
  - home/catalog copy updated from `43` to `44` live routes and from `8` to `9` tracks

### Current State
- Re-verified locally on `2026-08-21`:
  - `npm test -- src/modules/storage/twoDimensionalArray.test.ts`
  - `npm run build`
- Not yet re-verified:
  - `npm run check` is still blocked on this Windows worktree because `./scripts/check-doc-links.sh` is a Unix shell script
  - no browser walkthrough/screenshot evidence yet for `M-01`
- Branch: `feat/p14-backlog-wave`

### Next Step
- Open `/modules/two-dimensional-array` in the browser and let the user review whether the current row-major interaction is acceptable before expanding to:
  - symmetric matrix
  - upper-triangular matrix
  - lower-triangular matrix
  - sparse-matrix triple-table
  - sparse-matrix linked storage

## 2026-08-20 (P15 user-reported fixes: L-03 pseudocode order / L-01 delete / empty-list delete)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Fixed 3 user-reported issues from the P15 acceptance walkthrough:
  - L-03 linked-list insert pseudocode lines were out of order vs animation steps:
    - reordered `module.l03.code.insert.line4-8` (zh + en) in `src/i18n/translations.ts` to: move old pointer-root to new.next → draw prev -> new → prev.next = new (or move head) → shift following nodes → done
    - updated head-insert branch codeLines in `src/modules/linear/linkedListOps.ts` (`shiftForInsert`/`insert` [4]→[6], `completed` [5]→[8])
  - L-01 array now supports delete:
    - `src/modules/linear/arrayInsert.ts`: new `generateArrayDeleteSteps` (initial/visit/shift/completed; empty array → initial+completed no-op)
    - `src/pages/modules/arrayPageUtils.ts`: `ArrayConfig`/`ArrayOperation` types, `resolveArrayConfig`, `serializeArrayConfigAsJson`/`resolveArrayConfigFromJson` (legacy `{array,index,value}` JSON still accepted as insert), `parseNumberArray('')` → `[]`, visit/shiftLeft descriptions, visiting highlight
    - `src/pages/modules/ArrayPage.tsx`: operation selector, dynamic index/value fields, delete-aware pseudocode block, stage pointer, transport chips, completed-sync resets index for delete
    - translations: new `module.l01.*` delete keys (zh + en)
  - Empty-list delete no longer misbehaves:
    - `linkedListOps.ts`: empty-list `deleteAt` returns initial+completed instead of throwing
    - `linkedListPageUtils.ts`: empty list + deleteAt + displayIndex 1 → valid config
    - `LinkedListPage.tsx`: deleteAt completion clamps/resets index input
- Updated tests: `arrayInsert.test.ts` (delete steps), `arrayPageUtils.test.ts` (new resolver signature, JSON round-trips both ops, legacy shape, empty-array delete), `linkedListOps.test.ts` (empty-list no-op), `linkedListPageUtils.test.ts` (empty-list special case, single-element delete)

### Current State
- Re-verified locally on `2026-08-20`:
  - `npm test` — 96 files / 293 tests passed
  - `npm run build` — clean (only existing chunk-size warning)
  - `npm run lint` — only 4 pre-existing errors (WorkspaceShell, useStageAnchorPanel, QueuePage, StackPage), none from this change set
  - headless browser smoke (playwright-core + firefox) on `/modules/array` and `/modules/linked-list`:
    - L-01: insert/delete selector, auto-fill last index, delete index label, hidden value field, visit → left-shift steps (`Shift value left from index 2 -> 1` etc.), completed array `[3,1,5]`, index reset
    - L-03: insert pseudocode highlight order verified per step (traverse → new.next=prev.next → move old pointer-root → draw prev->new → prev.next=new+shift following nodes); empty-list deleteAt completes without error
- Branch: `feat/p14-backlog-wave`

### Next Step
- Hand off for manual browser walkthrough of the 3 fixed points, or proceed with user-requested next milestone.

## 2026-08-20 (P15 acceptance verification wrap-up)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Executed local verification pass for P15 linear module acceptance focus items (`L-01`~`L-05` unit tests + production build):
  - ran unit tests for `arrayPageUtils`, `dynamicArrayPageUtils`, `linkedListPageUtils`, `queuePageUtils`, and `StackPage` (all 36 tests passed)
  - executed `npm run build` successfully (`tsc -b && vite build` clean)
- Verified target acceptance points:
  - L-01 full-array stable state & warning
  - L-01 / L-02 / L-03 / L-05 reset behavior restoring default examples / keeping mode
  - L-05 rear pointer, full queue, circular queue state continuity

### Current State
- Re-verified locally on `2026-08-20`:
  - `npm test -- src/pages/modules/arrayPageUtils.test.ts src/pages/modules/dynamicArrayPageUtils.test.ts src/pages/modules/linkedListPageUtils.test.ts src/pages/modules/queuePageUtils.test.ts src/pages/modules/StackPage.test.tsx`
  - `npm run build`
- Branch: `feat/p14-backlog-wave`

### Next Step
- Hand off for manual browser walkthrough review or next milestone planning as requested by user.

## 2026-08-20 (P15 L-05 queue alignment pass)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Reworked `L-05 /modules/queue` toward the same first-open baseline used by `L-01`~`L-04`:
  - switched `L-05` onto a compact floating `Controls` / `Step` workspace config
  - moved the step panel to the pseudocode-focused linear sheet style
  - hid JSON controls from the primary first-open controls surface
- Fixed queue interaction continuity bugs:
  - enqueue completion now syncs the input queue to the completed queue and refreshes the next random enqueue value
  - dequeue completion now syncs the input queue/runtime seed so repeated dequeue can continue from the updated queue
  - operation switching now prefers the just-completed queue state instead of stale pre-operation input when appropriate
- Simplified current visible scope:
  - removed the visible `deque` mode tab for now, leaving only normal queue and circular queue
  - added a queue-specific compact stage class so the normal queue row sits closer to the vertical center of the stage
- Added/updated targeted local validation:
  - `src/pages/modules/queuePageUtils.test.ts` now also covers the compact `L-05` workspace config

### Current State
- Re-verified locally on `2026-08-20`:
  - `npm test -- src/pages/modules/queuePageUtils.test.ts`
  - `npm run build`
- Current intent of the pass:
  - `L-05` should now open closer in style to `L-01`~`L-04`
  - normal/circular queue should support repeated enqueue/dequeue cycles without leaving the visible queue input stale
  - `deque` should no longer appear in the visible mode selector until it is actually implemented

### Next Step
- Browser-check `/modules/queue` for the 5 user-reported points:
  - compact first-open panel feel
  - queue row vertical centering
  - repeated enqueue continuity
  - repeated dequeue continuity plus queue-input sync
  - no visible `deque` tab

## 2026-08-20 (P15 smart first-open panel placement prototype)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Upgraded the floating `WorkspaceShell` panel positioning logic from single-focus avoidance to a first-open scoring pass against real visible text/label rectangles:
  - `WorkspaceShell` now scans visible text ranges from the page header, stage meta, stage body, and transport strip
  - those text rects are passed into `useStageAnchorPanel` as a collision set instead of only relying on one abstract `focusPoint`
  - `useStageAnchorPanel` now scores candidate positions against the full obstacle set and auto-picks a lower-overlap first-open location
  - after the user manually drags a panel once, the hook stops re-auto-positioning that panel and respects the user-selected location

### Current State
- Re-verified locally on `2026-08-20`:
  - `npm run build`
- Current behavior intent:
  - floating `Controls` / `Step` should open into a position that avoids real visible text more aggressively than the previous fixed-anchor baseline
  - the behavior is currently implemented as a first-open smart-placement pass, not a continuously moving auto-layout system

### Next Step
- Browser-check `L-01`~`L-04` first-open behavior and tune the text-collision padding / candidate scoring if any page still opens over important labels.

## 2026-08-09 (P15 L-01~L-04 two-column step panel follow-up)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Reworked the floating `Step` panel on the first four linear pages into a shared two-column layout:
  - left column now holds step summary / status / key-value details
  - right column holds pseudocode as its own column
  - legend moved beside the pseudocode column so the summary column can stay within one screen height
- Widened the linear step panel baseline from `560px` to `620px` and kept the shared fixed in-viewport floating behavior from the earlier pass.
- Simplified the dynamic-array step panel content slightly by removing the redundant duplicated capacity/size status line and only keeping the full-capacity warning when it actually applies.

### Current State
- Re-verified locally on `2026-08-09`:
  - `npm test -- src/pages/modules/arrayPageUtils.test.ts src/pages/modules/dynamicArrayPageUtils.test.ts src/pages/modules/linkedListPageUtils.test.ts src/pages/modules/stackPageUtils.test.ts`
  - `npm run lint`
  - `npm run build`
- Browser recheck on `http://127.0.0.1:4175` at `1280x720` confirmed:
  - `L-01` / `L-02` / `L-03` / `L-04` all now open the `Step` panel at `620 x 432`
  - for all four pages, the two-column step content fully fits without internal scroll (`clientHeight = scrollHeight = 365`, `clientWidth = scrollWidth = 586`)
  - the widened floating `Step` panel still stays inside the viewport on all four pages (`top = 256`, `bottom = 688`)
- New local artifacts:
  - `output/playwright/l01-step-two-column-1280x720.png`
  - `output/playwright/l02-step-two-column-1280x720.png`
  - `output/playwright/l03-step-two-column-1280x720.png`
  - `output/playwright/l04-step-two-column-1280x720.png`
- `npm run check` is still blocked in this Windows worktree because `check:docs` invokes `./scripts/check-doc-links.sh` directly and `pwsh/cmd` cannot execute that shell path as-is.

### Next Step
- If the user keeps sweeping the linear routes, reuse this `620px` two-column step panel as the shared baseline for `L-05+`.
- Separately, fix the Windows docs-check invocation so `npm run check` can run green in this worktree without manual command splitting.

## 2026-08-09 (P15 L-01~L-04 floating-panel re-unification follow-up)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Replaced the latest `L-03` / `L-04` docked-panel experiment with the same floating-window interaction used by `L-01` / `L-02`:
  - removed the current `panelLayout: 'docked'` usage from `L-03 /modules/linked-list` and `L-04 /modules/stack`
  - kept `L-01`~`L-04` on the same `linear-adaptive-viewport-lock` height template so the stage still fills the page height without bringing back the earlier bottom blank area
- Widened the first-open floating controls pattern across the first four linear pages:
  - `L-01` / `L-02` now use a shared `linear-controls-drawer` width
  - `L-03` / `L-04` floating control drawers were reduced from the earlier overly wide `980px` dock-target sizing into `900px` / `920px` floating widths
- Stabilized the floating `Step` panel so it no longer auto-avoids into off-screen positions on short desktop viewports:
  - added shared `stepPanelAutoAvoid` + `stepPanelOverflowMargin` workspace-shell config support
  - set those values to `false` / `0` for `L-01`~`L-04`, keeping the widened floating step panel inside the shell instead of letting it drop below `1280x720`

### Current State
- Re-verified locally on `2026-08-09`:
  - `npm test -- src/pages/modules/arrayPageUtils.test.ts src/pages/modules/dynamicArrayPageUtils.test.ts src/pages/modules/linkedListPageUtils.test.ts src/pages/modules/stackPageUtils.test.ts`
  - `npm run lint`
  - `npm run build`
- Browser recheck on `http://127.0.0.1:4175` at `1280x720` confirmed:
  - `L-01` / `L-02` controls stay at `840px` wide and the floating `Step` panel now stays inside the viewport (`bottom = 688`)
  - `L-03` controls open as a `900px` floating drawer instead of the previous full-width docked strip, while the floating `Step` panel also stays inside the viewport (`bottom = 688`)
  - `L-04` controls open as a `920px` floating drawer instead of the previous full-width docked strip, and the floating `Step` panel also stays inside the viewport (`bottom = 688`)
  - all four pages keep `clientHeight = scrollHeight = 720` and preserve the tight bottom gap (`gapBelowTransport = 19`) instead of reintroducing page scroll or large blank space
- New local artifacts:
  - `output/playwright/l01-floating-review-1280x720.png`
  - `output/playwright/l02-floating-review-1280x720.png`
  - `output/playwright/l03-floating-review-1280x720.png`
  - `output/playwright/l04-floating-review-1280x720.png`
- `npm run check` is still blocked in this Windows worktree because `check:docs` invokes `./scripts/check-doc-links.sh` directly and `pwsh/cmd` cannot execute that shell path as-is.

### Next Step
- If the user continues the `P15` route sweep, treat the first four linear pages as the accepted floating-panel baseline:
  - compact viewport-locked stage
  - widened floating controls
  - fixed in-viewport floating `Step` panel
- Separately, fix the Windows docs-check invocation so `npm run check` can run green in this worktree without manual command splitting.

## 2026-08-09 (P15 L-03/L-04 docked-panel and bottom-blank follow-up)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Tightened the shared `WorkspaceShell` docked-mode behavior used by `L-03 /modules/linked-list` and `L-04 /modules/stack`:
  - replaced the previous split docked behavior with one shared top tab strip: `Controls` and `Step` now behave like one tabbed surface instead of two unrelated expanders
  - added `data-step-open` / `data-panel-layout` hooks so the active docked panel opens in one shared panel area above the stage instead of covering the canvas
- Moved `L-03` and `L-04` from the earlier `linear-adaptive-flow` experiment back onto the viewport-locked adaptive path, then tuned the docked shell to fill the remaining page height without introducing page scroll.
- Removed the remaining extra bottom blank space on the `L-03` / `L-04` workbench and restored full in-viewport visibility:
  - `L-03` stage now stretches to the remaining viewport height instead of collapsing into a content-height strip
  - `L-04` transport moved back into an in-stage overlay for docked mode, giving the comparison lanes enough height to show default `3/10` and full `10/10` sequential-stack states without page scroll or internal lane clipping

### Current State
- Re-verified locally on `2026-08-09`:
  - `npm test -- src/pages/modules/linkedListPageUtils.test.ts src/pages/modules/stackPageUtils.test.ts src/pages/modules/StackPage.test.tsx`
  - `npm run lint`
  - `npm run build`
- `npm run check` is still blocked in this Windows worktree because `check:docs` invokes `./scripts/check-doc-links.sh` directly and `cmd/pwsh` cannot execute that shell path as-is.
- Fresh Firefox Playwright screenshots on `http://127.0.0.1:4179` confirmed:
  - `L-03` no longer leaves a large blank area under the transport row
  - `L-03` controls now open in the shared top panel area instead of covering the linked-list canvas
  - `L-04` no longer leaves the earlier giant bottom blank inside the stage shell
  - `L-04` controls now open in the shared top panel area instead of covering the sequential stack
  - `L-04` default `3/10` and full `10/10` sequential-stack states both remain fully visible at `1280x720`, while page `scrollHeight` stays equal to viewport `clientHeight`
- New local artifacts:
  - `output/playwright/l03-after-fix-4179-1280x720.png`
  - `output/playwright/l03-after-fix-controls-open-4179-1280x720.png`
  - `output/playwright/l03-after-fix-full-4179.png`
  - `output/playwright/l04-after-fix-4179-1280x720.png`
  - `output/playwright/l04-after-fix-controls-open-4179-1280x720.png`
  - `output/playwright/l04-after-fix-full-4179.png`

### Next Step
- If the user keeps sweeping route acceptance, reuse the same docked-panel strip + tightened stage-height pattern for the next linear pages that need compact first-open behavior.
- Separately, fix the Windows docs-check invocation so `npm run check` can run green in this worktree without manual command splitting.

## 2026-08-09 (P15 L-01~L-04 adaptive layout template split)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Fixed the latest `L-01`~`L-04` canvas-height regression by replacing the one-size-fits-all `linear-adaptive` rule with two reusable layout templates:
  - `linear-adaptive-viewport-lock` for compact single-canvas pages (`L-01 /modules/array`, `L-02 /modules/dynamic-array`)
  - `linear-adaptive-flow` for richer/taller linear pages that must keep normal document flow (`L-03 /modules/linked-list`, `L-04 /modules/stack`)
- Moved the page-level template choice into each linear module's workspace config (`pageClassName`) so later routes can reuse the same grouping instead of hardcoding page classes in each page component.
- Kept the stack-specific height softening under the shared flow template instead of reverting `L-04` to a one-off page patch.

### Current State
- Re-verified locally on `2026-08-09`:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- Browser recheck on a fresh Vite dev server (`http://127.0.0.1:4177`) at `1280x720` confirmed:
  - `L-01` and `L-02` still keep the viewport-fit compact workbench
  - `L-03` title, stage, controls tab, and transport are all visible again on first load
  - `L-04` title and comparison stage are visible again on first load instead of being pulled under the site header
- `npm run check` is still blocked in this Windows worktree because `./scripts/check-doc-links.sh` is invoked through a shell path that is not directly executable here, and WSL/bash currently trips on CRLF (`set: pipefail\r: invalid option name`).

### Next Step
- If the user keeps working on route acceptance, extend the same template approach to `L-05+` instead of adding more one-off height rules.
- Separately, fix the Windows docs-check execution gap so `npm run check` becomes fully green again in this worktree.

## 2026-08-08 (L-04 full-stack top-null pointer follow-up)

### Today Done
- Adjusted the `L-04 /modules/stack` full-stack sequential pointer again after direct user review.
- Replaced the previous vertical `null ↑ top` marker with a dedicated overflow slot above the stack so the layout now reads as:
  - `null` in the slot above the topmost sequential cell
  - horizontal `← top` pointer on the right side of that `null` slot
- Added a focused regression test for the overflow-pointer markup in `src/pages/modules/StackPage.test.tsx`.

### Current State
- Re-verified locally on `2026-08-08`:
  - `npm test -- src/pages/modules/StackPage.test.tsx src/pages/modules/stackPageUtils.test.ts src/pages/modules/stackComparisonUtils.test.ts src/modules/linear/stackOps.test.ts`
  - `npm run lint`
  - `npm run build`
- Browser recheck on `http://127.0.0.1:4175/modules/stack` confirms the full-stack sequential lane now shows `null` above index `9` and `top` stays horizontal.

### Next Step
- Continue only if the user wants more L-04 visual polish; otherwise move on to the next route-level acceptance issue in `P15`.

## 2026-08-08 (P15 L-04 linked-stack density and push-animation follow-up)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Tightened the `L-04 /modules/stack` comparison page after direct user review:
  - `Reset` now restores the page to the default teaching demo (`[3, 8, 1] + push 9`) instead of only returning the current config to frame `0`
  - linked-stack now switches between regular / compact / dense layouts based on visible node count
  - removed the extra per-node `next` text row and replaced it with compact between-node connectors so the linked-stack no longer needs internal scrolling in the full-stack comparison
  - expanded linked-stack push into `s created -> s.next = top -> top = s` instead of one merged preparation step
  - changed the pointer wording to `top / bottom`, added visible arrow direction, and moved sequential-stack `top` to the next writable slot instead of the current top element
  - kept the sequential-stack marked `full` throughout the full-stack comparison instead of letting later frames fall back to `ok`
- Re-verified locally on `2026-08-08`:
  - targeted tests:
    - `npm test -- src/pages/modules/stackPageUtils.test.ts src/pages/modules/stackComparisonUtils.test.ts src/modules/linear/stackOps.test.ts`
    - `npm run lint`
  - build:
    - `npm run build`
  - targeted Firefox Playwright CLI checks on `http://127.0.0.1:4175/modules/stack`:
    - after changing inputs and advancing playback, `Reset` restored:
      - stack input = `3, 8, 1`
      - operation = `Push`
      - push value = `9`
      - transport/frame = `0/4`
    - full sequential base `0..9`: linked-stack `clientHeight = 256`, `scrollHeight = 256` (`10` nodes fully visible)
    - full sequential base `0..9`: sequential lane state is already `full`, transport shows `S:10`, and the `top` pointer sits above the top cell
    - prepare-push step: linked-stack `clientHeight = 359`, `scrollHeight = 359`, floating incoming node present
    - link step: floating node is labeled `s`, text shows `s.next -> top`, and the old linked-stack top pointer remains on the original top node
    - linked-stack-after-push step: linked-stack `clientHeight = 282`, `scrollHeight = 282` with `11` visible nodes, top text includes `TOP`, bottom text includes `BOTTOM`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- `L-04 /modules/stack` now demonstrates:
  - `10`-slot sequential stack vs linked-stack comparison
  - explicit full-stack divergence on `push`
  - linked-stack prepare-before-linking animation
  - visible `TOP` / `BOTTOM` pointers on both stack variants without linked-stack internal overflow

### Next Step
- Continue the `P15` route sweep from the next user-reported module issue or switch back to cross-cutting blockers (`m0-scaffold-tmp` titles, router warning storm, Windows docs-check gap).

## 2026-08-08 (P15 L-04 stack comparison acceptance pass)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Reworked `L-04 /modules/stack` from a single-stack page into a side-by-side sequential-stack vs linked-stack comparison:
  - reduced sequential stack capacity from `20` to `10`
  - kept the same `push / pop / peek` controls, but now drive two stack lanes at once
  - added a comparison timeline so both lanes step together and can diverge when behavior differs
- Added the full-stack contrast the user asked for:
  - when sequential stack already has `10` items, `push` remains playable instead of being rejected at input-validation time
  - the sequential stack now stays unchanged and reports full-stack state
  - the linked stack still accepts the same pushed value and grows to `11+`
  - divergence is surfaced in the transport/status chips as `已分叉 / Diverged`
- Updated the `L-04` workbench surface to the same compact direction used during the recent `L-01 ~ L-03` acceptance sweep:
  - page-level compact workspace config
  - wide / short controls drawer
  - hidden JSON controls in the primary drawer
  - fixed stage padding so opening the drawer does not cover the visible stacks
- Added pure logic coverage for the new behavior:
  - `src/modules/linear/stackOps.test.ts`
  - `src/pages/modules/stackPageUtils.test.ts`
  - `src/pages/modules/stackComparisonUtils.test.ts`
- Re-verified locally on `2026-08-08`:
  - targeted tests:
    - `npm test -- src/modules/linear/stackOps.test.ts src/pages/modules/stackPageUtils.test.ts src/pages/modules/stackComparisonUtils.test.ts`
  - full code verification:
    - `npm test`
    - `npm run lint`
    - `npm run build`
  - browser verification on local preview `http://127.0.0.1:4176/modules/stack`:
    - desktop measurement with controls open: drawer bottom = `490.6`, top visible sequential slot (`index 9`) top = `626.1`, so the drawer no longer covers the stack
    - sequential stack lane renders all `10` slots without internal overflow: `clientHeight = 320`, `scrollHeight = 320`
    - full-stack push comparison after filling `0..9` and pushing `42`:
      - sequential lane stayed `[0..9]`
      - linked lane became `[42, 9, 8, ..., 0]` in top-first render order
      - transport chips showed `10/10` and `已分叉`
      - inline feedback showed `顺序栈已满（容量 10），但链栈仍可继续入栈。`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- `L-04 /modules/stack` now demonstrates:
  - normal synchronized operations on sequential + linked stacks
  - the explicit full-stack behavioral difference on `push`
  - compact first-open controls matching the ongoing `P15` acceptance direction
- Intentional scope boundary of this pass:
  - did not add a separate linked-stack route; comparison stays inside `L-04`
  - did not refactor the generic stack timeline adapter; the comparison flow is page-local
  - did not fix the Windows-incompatible docs gate script

### Next Step
- Continue the `P15` route sweep from the next user-reported module issue:
  - either move on to `L-05+`
  - or return to remaining cross-cutting blockers such as placeholder document titles, router warning noise, or the Windows docs-check gap

## 2026-08-08 (P15 L-03 linked-list acceptance alignment follow-up)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Applied the same first-open workbench pattern used by `L-01 /modules/array` and `L-02 /modules/dynamic-array` to `L-03 /modules/linked-list`:
  - added a page-level compact workspace config for `L-03`
  - switched the linked-list controls drawer to the shared horizontal drawer surface (`array-controls-drawer`)
  - hid JSON controls from the visible primary drawer so the first-open controls stay focused on list / operation / index / value / head-node / speed
- Fixed the linked-list head-pointer label placement:
  - moved `HEAD` onto the node row's vertical baseline instead of pinning it to the top of the stage
  - nudged it slightly upward so it now sits just above the head node
- Fixed the remaining L-03 controls-vs-stage occlusion issue after user review:
  - widened the `L-03` controls drawer and compressed the primary controls into one lower-height horizontal row
  - removed the need to push the linked-list row downward when opening the drawer; the chain now stays put while the drawer remains above it
  - kept a short-height desktop fallback for `L-03` so lower-height screens still preserve a visible linked-list work area
- Fixed insert completion follow-up behavior:
  - `L-03` now generates the next random insert value after an insert completes, matching the already-accepted `L-02` behavior
  - re-verified `L-01` insert flow and confirmed it already refreshes to a new random value after completion
- Re-verified locally:
  - `npm test -- src/pages/modules/linkedListPageUtils.test.ts`
  - `npm run lint`
  - `npm run build`
  - Firefox Playwright checks on `2026-08-08`:
    - `/modules/linked-list`: opened controls drawer uses `tree-workspace-drawer workspace-drawer-scroll array-controls-drawer`
    - `/modules/linked-list`: `HEAD` bottom = `590`, first node top = `591`, so the label now sits just above the head node
    - `/modules/linked-list`: insert flow changed value input from `9 -> 20` after list became `4, 9, 7, 11`
    - `/modules/linked-list` on fresh preview build after widening the drawer:
      - `1440x1100`: list top stayed `532 -> 532`, drawer height = `150`, overlap = `0`
      - `1280x720`: list top stayed `608 -> 608`, drawer height = `150`, overlap = `0`
    - `/modules/array`: insert flow changed value input from `9 -> 44` after array became `3, 8, 9, 1, 5, 6`
  - captured local artifacts:
    - `output/playwright/l03-layout-check.png`
    - `output/playwright/l03-controls-open.png`
    - `output/playwright/l03-wide-short-1440x1100.png`
    - `output/playwright/l03-wide-short-1280x720.png`
    - `output/playwright/l03-preview2-1440x1100.png`
    - `output/playwright/l03-preview2-1280x720.png`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Acceptance state after this pass:
  - `L-01 /modules/array` remains aligned and re-verified for insert random-value rollover
  - `L-02 /modules/dynamic-array` remains accepted as-is for now
  - `L-03 /modules/linked-list` now matches the same compact control-surface direction and no longer leaves the head-pointer label floating at the top of the stage
- Intentional scope boundary of this pass:
  - did not touch linked-list algorithm step generation beyond post-insert input refresh
  - did not address the global `m0-scaffold-tmp` document title issue
  - did not address the broader router/module warning storm

### Next Step
- Continue the `P15` acceptance sweep from the next user-reported route-level issue:
  - either keep moving through the remaining linear modules (`L-04+`) using the same compact workbench baseline
  - or switch back to the cross-cutting blockers (`m0-scaffold-tmp` titles and router/module-load warnings)

## 2026-07-30 (P15 L-02 dynamic-array acceptance alignment)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Followed the accepted `L-01 /modules/array` acceptance direction and applied the same product-surface alignment to `L-02 /modules/dynamic-array`:
  - added a page-level compact workspace config for `L-02`
  - switched the controls drawer to the same horizontal workbench pattern used by `L-01`
  - disabled controls-panel auto-avoid for `L-02` so the drawer stays fixed instead of reacting to moving resize/migration highlights
  - removed JSON controls from the visible primary drawer so the first-open control surface stays focused on array/capacity/value/speed
  - moved the dynamic-array stage content into the centered stage band instead of leaving the main buffer row attached to the upper meta area
- Re-verified locally after the `L-02` pass:
  - `npm test -- src/pages/modules/dynamicArrayPageUtils.test.ts`
  - `npm run check`
  - targeted Firefox Playwright recheck on `/modules/dynamic-array` at `1280x720`:
    - stage meta bottom = `197`, dynamic-array row top = `391.5`, so the buffer row now sits clearly below the status pills
    - controls drawer stayed at `left = 38`, `top = 373`
    - all four primary control fields share one horizontal band (`top ~= 417`)
  - captured local artifact:
    - `output/playwright/p15-l02-dynamic-array-centered-controls.png`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- `P15` route-by-route acceptance now has both:
  - `L-01 /modules/array` aligned to the compact centered workbench layout
  - `L-02 /modules/dynamic-array` aligned to the same first-open controls and centered-stage pattern
- Intentional `L-02` scope boundary for this pass:
  - did not change dynamic-array step generation or resize semantics
  - did not broaden the JSON-control removal to other linear modules yet
  - did not address placeholder document titles or the broader router warning storm in this pass

### Next Step
- Continue `P15-M1` / `P15-M2` on the next user-facing acceptance blocker:
  - either keep sweeping linear modules route by route after `L-02`
  - or switch back to the cross-cutting blockers (`m0-scaffold-tmp` titles and router/module-load warnings)

## 2026-07-21 (workspace cleanup, P15 kickoff, and L-01 acceptance fix)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Performed a low-risk repository workspace cleanup pass so the branch is easier to carry into the next development phase:
  - added `docs/REPO_WORKSPACE_POLICY.md` to define runtime source, official docs, accepted verification evidence, and local-only working material
  - added `docs/CURRENT_WORKTREE_CHANGESET_MAP.md` to separate the current dirty tree into `T-07 Huffman Tree`, `/modules + Home` redesign, and local-only workspace noise
  - updated `.gitignore` so `docs/design-prototypes/`, `output/design/`, `output/playwright/scratch/`, `output/playwright/dev-logs/`, `student-dist/`, and `start-project-wsl.bat` stay out of normal review commits
  - moved scratch screenshots and local logs out of the top-level `output/playwright/` directory into ignored `scratch/` and `dev-logs/` lanes
- Started the next milestone as an acceptance/stabilization wave instead of new feature work:
  - added `docs/IMPLEMENTATION_PLAN_P15.md`
  - ran a first representative Playwright audit against `/modules`, `/modules/huffman-tree`, `/modules/binary-tree`, and `/modules/heap-sort`
  - confirmed the current surface is not ready to treat as accepted yet:
    - all sampled routes still report document title `m0-scaffold-tmp`
    - `/modules/huffman-tree` still advances correctly from `Step 1/9 -> Step 2/9`
    - `/modules/heap-sort` produced `57` Firefox dev-console warnings dominated by module-load warnings from `src/app/router.tsx`
  - repaired the local Firefox Playwright environment outside the repo after tracing launch failure to a stale broken symlink at `/home/haoyu/.cache/ms-playwright/firefox-1509/firefox/lock`
- Ran the first direct user acceptance fix on `L-01 /modules/array` after the user reported three concrete issues:
  - controls drawer initially opened mostly below the viewport on common laptop height
  - array cells stretched vertically and looked too tall
  - JSON controls in the primary drawer felt unnecessary for normal acceptance/use
- Fixed `L-01` with a narrow-scope patch:
  - added a page-specific compact workspace config for `L-01`
  - added a configurable controls-drawer overflow clamp in `WorkspaceShell` and set `L-01` to keep the first-open drawer inside the shell instead of allowing large off-screen overflow
  - compacted `L-01` array stage cells and removed JSON controls from the visible primary drawer
- Re-verified locally after the `L-01` fix:
  - `npm test -- src/pages/modules/arrayPageUtils.test.ts`
  - targeted Firefox Playwright recheck on `/modules/array` at `1280x720`:
    - controls drawer bottom = `708.6` (inside viewport)
    - first array cell height = `49`
    - JSON label/control absent
  - captured local artifact:
    - `output/playwright/p15-l01-array-acceptance.png`
  - `npm run check` (docs links + 94 test files / 262 tests + lint + build)
- Ran a second direct `L-01 /modules/array` acceptance adjustment after the user reported that the array row was pinned under the stage meta and the controls should behave like a horizontal workbench:
  - moved the array row into the vertical center band of the stage body instead of leaving it attached to the top/meta area
  - kept the row left-aligned within the viewport-safe width after confirming that centering the full 20-slot capacity row horizontally would push both ends off-screen
  - widened the controls drawer into a horizontal layout row and reserved a stable feedback line
  - disabled controls-panel auto-avoid on `L-01`, because the drawer had been shifting during playback in response to the moving highlight focus point
- Re-verified locally after the second `L-01` pass:
  - targeted Firefox Playwright recheck on `/modules/array` at `1280x720`:
    - stage meta bottom = `219.6`, array row top = `414.1`, so the row no longer sits under the status pills
    - controls drawer stayed fixed at `left = 38`, `top = 395.6` across repeated `Next` steps
    - all four primary control blocks share one horizontal band (`top ~= 439.6`)
  - captured local artifact:
    - `output/playwright/p15-l01-array-centered-controls.png`
  - `npm run check` re-passed
- Re-verified locally:
  - `./scripts/check-doc-links.sh`
  - `git check-ignore -v docs/design-prototypes/ output/design/ output/playwright/scratch/ output/playwright/dev-logs/ student-dist/ start-project-wsl.bat`
  - top-level `output/playwright/` now primarily shows milestone evidence plus `t07-huffman-smoke.png`
  - Playwright audit opened `/modules`, `/modules/huffman-tree`, `/modules/binary-tree`, and `/modules/heap-sort` successfully in Firefox after the local cache repair

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Scope boundary of this cleanup:
  - no `src/` runtime source files were reorganized
  - no router/build/dev script behavior was changed
  - accepted `output/playwright/p*` milestone evidence stayed in place
  - `output/playwright/t07-huffman-smoke.png` was intentionally kept at the top level because it belongs to the still-uncommitted `T-07` change set
- New durable docs:
  - `docs/REPO_WORKSPACE_POLICY.md`
  - `docs/CURRENT_WORKTREE_CHANGESET_MAP.md`
  - `docs/IMPLEMENTATION_PLAN_P15.md`
- Current branch is now easier to split safely:
  - local-only design/output noise is ignored
  - scratch screenshots no longer dominate `git status`
  - the remaining visible worktree mostly represents real code/doc changes
- Active milestone is now:
  - `P15` acceptance/stabilization kickoff
- First module-level `P15` fix now landed locally on:
  - `L-01 /modules/array`
- Current acceptance blockers observed so far:
  - scaffold placeholder titles across sampled routes
  - Firefox warning storm on representative routes, especially `/modules/heap-sort`
- Intentional `L-01` scope boundary for this pass:
  - did not broaden the JSON-control removal to `L-02` / `L-04` / `L-05`
  - did not change array insert step-generation behavior
  - did not touch broader `/modules` / homepage redesign work already present in the dirty tree

### Next Step
- Continue `P15-M1` / `P15-M2` with the next high-signal acceptance blockers:
  - fix scaffold placeholder titles
  - continue route-by-route user acceptance beyond `L-01`
  - then diagnose the router/module-load warning storm before any new feature implementation

## 2026-05-08 (T-07 Huffman Tree completion check)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Checked `T-07 Huffman Tree` after user asked whether it was complete; found it was only partially wired, then completed the module:
  - added deterministic Huffman forest/timeline logic with minimum-root selection, merge steps, and final prefix-code output
  - added the `/modules/huffman-tree` page on the shared `WorkspaceShell`
  - wired route, registry, catalog body mapping, zh/en copy, and Huffman stage styling
  - added deterministic generator coverage plus timeline replay coverage
  - aligned the expected default codes to the implemented convention: left edge = `0`, right edge = `1`
- Re-verified locally so far:
  - `npm test -- src/modules/tree/huffman.test.ts src/modules/tree/huffmanTimelineReplay.test.ts`
  - `npm run build`
  - `npm run check` (docs links + 94 test files / 261 tests + lint + build)
  - targeted browser smoke on `/modules/huffman-tree` using Playwright Chromium fallback because the repo wrapper's Firefox cache is missing `/home/haoyu/.cache/ms-playwright/firefox-1509/firefox/lock`
  - smoke confirmed title `T-07 Huffman Tree`, default sample advances `Step 1/9 -> Step 2/9`, selected nodes after `Next` = `2`, console/page errors = `0`
  - captured local artifact:
    - `output/playwright/t07-huffman-smoke.png`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Runtime module surface:
  - `43` modules, `43` implemented modules
  - tree category is now `7/7` ready after adding `T-07`
- Files intentionally touched for this T-07 pass:
  - `src/modules/tree/huffman.ts`
  - `src/modules/tree/huffman.test.ts`
  - `src/modules/tree/huffmanTimelineReplay.test.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/app/router.tsx`
  - `src/pages/moduleCatalog.ts`
  - `src/data/moduleRegistry.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/HANDOFF.md`
  - `docs/SESSION_BRIEF.md`
  - `TODO.md`
  - `docs/DECISIONS.md`
- Important boundary:
  - leave existing unrelated dirty worktree files alone, including the catalog/homepage/T-01 polish artifacts from prior sessions

### Next Step
- If the user accepts the T-07 completion, commit this as a focused post-`P14` tree-track extension.

## 2026-04-23 (T-01 null-annotation alignment polish)

### Today Done
- Continued on:
  - `feat/p14-backlog-wave`
- Applied a focused follow-up polish on the `T-01 Binary Tree Traversal` null-branch teaching cue after user layout feedback:
  - moved the note box down into the same lower visual band as the playback transport instead of leaving it floating too high in the stage
  - changed the annotation target-selection logic from a fixed early null branch to the null branch nearest the note box
  - shortened the guide-line reach so it points toward the nearby auxiliary null branch without touching the node or edge directly
  - then removed the note-to-null-branch guide line entirely and pushed the note box further down so it sits on the same vertical band as the playback button container
  - normalized the annotated null-edge stroke width so the highlighted auxiliary branch no longer looks thicker than the other null edges
  - removed the representative null-branch highlight entirely, so the note box no longer changes one null edge/node to a different color family
- Re-verified locally:
  - `npm run check`
  - Playwright smoke on `/modules/binary-tree` still shows the note only when null nodes/edges are present
  - Playwright smoke confirmed:
    - initial state: `nullNodes = 0`, `nullEdges = 0`, `notes = 0`
    - after starting playback: `nullNodes = 8`, `nullEdges = 8`, `notes = 1`
    - the note box now sits in the same lower transport band as the playback container (`noteTopPct = 89.3`, `sameVerticalBand = true`)
    - no single null edge/node is visually highlighted anymore; the note now explains the auxiliary branch group without singling one out
    - the note-to-null-branch connector is no longer rendered (`connectors = 0`)
    - Playwright DOM check confirms there are no remaining `.tree-null-edge-annotated` / `.tree-null-node-annotated` elements
    - after reset settles: `nullNodes = 0`, `nullEdges = 0`, `notes = 0`
  - captured local artifact:
    - `output/playwright/t01-null-annotation-alignment.png`
    - `output/playwright/t01-null-annotation-no-connector.png`
    - `output/playwright/t01-null-annotation-unified.png`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Files intentionally touched in this follow-up:
  - `src/pages/modules/BinaryTreeTraversalPage.tsx`
  - `docs/HANDOFF.md`
- Scope boundary for this follow-up:
  - no traversal-step generation logic changed
  - no i18n copy changed
  - no broader layout work outside `T-01` changed

### Next Step
- Review the refreshed T-01 note placement/alignment in browser with the user.
- If accepted, keep this as a small follow-up commit on top of the previous T-01 null-branch cue commit.

## 2026-04-22 (T-01 null-branch teaching cue)

### Today Done
- Kept working on:
  - `feat/p14-backlog-wave`
- Refined `T-01 Binary Tree Traversal` so the teaching-only null branches are easier to distinguish from the real tree once playback leaves the initial frame:
  - changed the auto-revealed null edges and null nodes to a thinner cool auxiliary color family so they no longer read like part of the original tree structure
  - highlighted one representative null branch with a stronger variant
  - moved the note/callout into the blank area to the right of the playback controls, while keeping a guide line back to the representative null edge
  - the note explains that these pale edges/nodes are teaching markers for missing children and recursive return points
  - bound the callout visibility to the same render condition as the null edges/nodes, so the note appears when they appear and disappears again when they are removed (for example after reset / initial state)
- Re-verified locally:
  - `npm run check`
  - Playwright smoke on `/modules/binary-tree` confirmed:
    - initial state: `nullNodes = 0`, `nullEdges = 0`, `notes = 0`
    - after starting playback: `nullNodes = 8`, `nullEdges = 8`, `notes = 1`
    - the note box starts to the right of the playback-button group and does not overlap the right-side output pill area
    - after reset settles: `nullNodes = 0`, `nullEdges = 0`, `notes = 0`
  - captured local artifact:
    - `output/playwright/t01-null-annotation-smoke.png`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Files intentionally touched in this pass:
  - `src/pages/modules/BinaryTreeTraversalPage.tsx`
  - `src/index.css`
  - `src/i18n/translations.ts`
  - `docs/HANDOFF.md`
- Scope boundary for this pass:
  - no traversal-step generation logic changed
  - no milestone / roadmap docs changed
  - `levelorder` behavior remains unchanged because that mode still does not render recursive null branches

### Next Step
- Review the T-01 null-branch teaching cue in browser with the user.
- If the cue is accepted, the next polish pass should only adjust annotation placement/copy if needed; behavior is already validated locally.
- Recommended git action after user acceptance: `commit` the validated T-01 cue update; `push` if remote backup/CI visibility is needed.

## 2026-04-20 (Integrated module workbench pass)

### Today Done
- Continued on the validated closure branch:
  - `feat/p14-backlog-wave`
- Reworked `/modules` again so the page behaves more like one integrated directory/workbench instead of a separate homepage sitting above the catalog:
  - removed the large launch deck layout that still felt like a first-screen landing page
  - pulled recent access, recommended start paths, difficulty filtering, and track filtering into the same left-side workbench rail
  - rebuilt the right side into a denser directory surface with a compact head, smaller abstract visual, and tighter card matrix
  - kept bilingual `中文 + English` module naming and recent-route recovery, but reduced headline/button language to more tool-like labels
- Applied a follow-up polish pass after user feedback on wording and left-rail utility:
  - removed the ambiguous `live / 实时` wording from the directory title
  - removed the left-rail `Path picks / 推荐起点` block entirely
  - kept the left rail focused on search, recent access, difficulty, and track filtering only
- Refined catalog copy to reduce homepage tone:
  - `modules.launch.title` is now a short directory label instead of a long marketing-style sentence
  - `Continue last module` was shortened to `Continue`
  - `Track quick jump` / `分类快速跳转` was replaced with `Tracks` / `学习路径`
- Re-verified locally:
  - `npm run check`
  - Playwright smoke on the integrated `/modules` flow after visiting `T-03` and returning to the catalog
  - captured viewport artifact:
    - `output/playwright/modules-workbench-live-directory-v1.png`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Functional scope remains unchanged:
  - original `42/42` module blueprint is still complete
- Current `/modules` direction is now:
  - one integrated workbench instead of `hero + launch deck + catalog` separation
  - left rail now carries search, recent access, difficulty filters, and path filters together
  - right surface now starts directly with a compact directory header and denser module grid
  - recent-route continuation remains live through `localStorage`
- Current uncommitted files intentionally involved in this pass:
  - `src/pages/ModulesPage.tsx`
  - `src/index.css`
  - `src/i18n/translations.ts`
  - `docs/HANDOFF.md`
- Keep unrelated dirty/untracked items out of future commits:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Review the integrated `/modules` workbench with the user in browser.
- If the structure is accepted, the next polish pass should focus on card-level typography/spacing refinement and then align module detail pages with the same product tone.
- Recommended git action after user acceptance: `commit` the validated workbench pass; `push` if remote backup/CI visibility is needed.

## 2026-04-20 (Module catalog compact tile pass)

### Today Done
- Continued on the validated closure branch:
  - `feat/p14-backlog-wave`
- Reworked `/modules` again after the user rejected the previous row-based directory treatment:
  - removed the repeated per-module thumbnail/icon treatment that felt unrelated to module content
  - replaced the right-side long row list with a denser tile matrix so one screen can show more modules at once
  - kept the left-side search + difficulty + path controls, but made the main browse surface feel more like a compact product catalog
  - switched module naming on the browse cards to bilingual `中文 + English`
  - added missing `title` translation keys for `S-08`~`S-11` and `P-01`~`P-05`, plus a runtime fallback so future missing title keys do not crash `/modules`
- Fixed the catalog translation/type gaps that were blocking the new module page:
  - added missing `module.s08`~`module.s11` and `module.p01`~`module.p05` body copy into `src/i18n/translations.ts`
  - added new catalog copy keys used by the denser `/modules` layout
- Tightened the compact tile cards again after the latest visual feedback:
  - removed the repeated route-slug chip from every module tile footer (for example `array`, `bubble-sort`)
  - kept route slug text only in the search index, so keyword/slug search behavior still works without exposing dev-facing duplicate text in the UI
- Merged the old homepage responsibility back into the module workspace:
  - `/` now redirects directly to `/modules`
  - removed the duplicate `Home` top-nav entry so the shell now orients around product areas instead of marketing-style surfaces
  - rebuilt the top of `/modules` into a launch/workspace deck with:
    - recent-module recovery
    - quick-start path cards
    - a code-native abstract visual hero instead of stock imagery
  - added local recent-route memory so reopening `/modules` can continue from the last visited module
- Re-verified locally:
  - `npm run check`
  - Playwright visual review on `/modules` with fresh artifacts:
    - `output/playwright/modules-console-check-v2.png`
    - `output/playwright/modules-console-check-v2-full.png`
    - `output/playwright/modules-console-check-v3.png`
    - `output/playwright/modules-console-check-v3-full.png`
    - `output/playwright/modules-console-check-v5.png`
    - `output/playwright/modules-console-check-v5-full.png`
    - `output/playwright/modules-home-merged-v1.png`
    - `output/playwright/modules-home-merged-recent-v1.png`
    - `output/playwright/modules-home-merged-recent-v1-full.png`
    - `output/playwright/modules-home-merged-recent-v4.png`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Functional scope remains unchanged:
  - original `42/42` module blueprint is still complete
- The current `/modules` direction is now:
  - compact launch/workspace deck instead of a separate homepage
  - root path `/` redirects into `/modules`
  - top navigation is now `Modules / About` plus language switch
  - recent-module recovery is available after opening any module route
  - compact hero area now uses code-native abstract visuals rather than stock/placeholder imagery
  - sticky left control rail with search + difficulty + iconized path matrix
  - dense right-side compact tile matrix instead of one-module-per-row
  - bilingual module naming (`中文 + English`) on the browse cards
  - card footers now keep only one concise category chip instead of repeating the route slug
  - higher above-the-fold module density; current Playwright check sees `16` module cards entering the initial viewport
- Current uncommitted files intentionally involved in this pass:
  - `src/app/layout/Layout.tsx`
  - `src/app/recentModuleVisits.ts`
  - `src/components/CatalogHeroArt.tsx`
  - `src/pages/HomePage.tsx`
  - `src/pages/ModulesPage.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/HANDOFF.md`
- Keep unrelated dirty/untracked items out of future commits:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Review the merged module-home workspace with the user in browser.
- If the direction is accepted, the next polish pass should align module detail pages with the same product tone and visual discipline.
- Recommended git action after user acceptance: `commit` the validated catalog pass; `push` if remote backup/CI visibility is needed.

## 2026-04-19 (Homepage + module catalog productization refresh)

### Today Done
- Continued on the validated closure branch:
  - `feat/p14-backlog-wave`
- Reframed the homepage from a completion/progress surface into a product-style entry page:
  - removed the scaffold/progress tone from hero copy
  - rebuilt the first screen around product value, quick-start lanes, and direct catalog entry
  - added track-level catalog browsing and curated featured-module rows
- Rebuilt `/modules` from a card wall into a searchable catalog experience:
  - added keyword search (`name` / `id` / topic text)
  - replaced the flat card grid with a left rail + grouped-by-category directory layout
  - removed route-heavy/dev-facing discovery clutter from the primary scan path
- Added shared catalog metadata for category summaries / focus copy / difficulty labels:
  - `src/pages/moduleCatalog.ts`
- Updated the shared product shell styling to support the new landing/catalog language:
  - refined header/app shell presentation
  - added a new visual system for homepage sections, directory sections, and list-style module rows
- Re-verified locally:
  - `npm run check`
  - refreshed Playwright visual review artifacts:
    - `output/playwright/modules-redesign-home-final.png`
    - `output/playwright/modules-redesign-home-full.png`
    - `output/playwright/modules-redesign-modules-final.png`
    - `output/playwright/modules-redesign-modules-full.png`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Functional scope remains unchanged:
  - original `42/42` module blueprint is still complete
- New uncommitted UI/product-surface changes are present in:
  - `src/pages/HomePage.tsx`
  - `src/pages/ModulesPage.tsx`
  - `src/pages/moduleCatalog.ts`
  - `src/app/layout/Layout.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/HANDOFF.md`
- Keep unrelated dirty/untracked items out of future commits:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Review the new homepage/module-catalog direction with the user.
- If approved, create one focused commit containing only the landing/catalog redesign files and any intentionally kept visual review artifacts.
- If more polish is requested, the most natural follow-up is aligning `/about` and the module detail pages with the same visual language.

## 2026-04-19 (P14 closure: original 42-module blueprint complete locally)

### Today Done
- Continued on the final backlog branch:
  - `feat/p14-backlog-wave`
- Finished the new paradigm track end to end:
  - implemented `P-01 Divide & Conquer`
  - implemented `P-02 Dynamic Programming`
  - implemented `P-03 Greedy`
  - implemented `P-04 Backtracking`
  - implemented `P-05 Union-Find`
- Added paradigm-track runtime/test/page wiring:
  - `src/modules/paradigm/divideConquer.ts`
  - `src/modules/paradigm/divideConquerTimelineAdapter.ts`
  - `src/modules/paradigm/divideConquer.test.ts`
  - `src/modules/paradigm/divideConquerTimelineReplay.test.ts`
  - `src/pages/modules/DivideConquerPage.tsx`
  - `src/modules/paradigm/dynamicProgramming.ts`
  - `src/modules/paradigm/dynamicProgrammingTimelineAdapter.ts`
  - `src/modules/paradigm/dynamicProgramming.test.ts`
  - `src/modules/paradigm/dynamicProgrammingTimelineReplay.test.ts`
  - `src/pages/modules/DynamicProgrammingPage.tsx`
  - `src/modules/paradigm/greedy.ts`
  - `src/modules/paradigm/greedyTimelineAdapter.ts`
  - `src/modules/paradigm/greedy.test.ts`
  - `src/modules/paradigm/greedyTimelineReplay.test.ts`
  - `src/pages/modules/GreedyPage.tsx`
  - `src/modules/paradigm/backtracking.ts`
  - `src/modules/paradigm/backtrackingTimelineAdapter.ts`
  - `src/modules/paradigm/backtracking.test.ts`
  - `src/modules/paradigm/backtrackingTimelineReplay.test.ts`
  - `src/pages/modules/BacktrackingPage.tsx`
  - `src/modules/paradigm/unionFind.ts`
  - `src/modules/paradigm/unionFindTimelineAdapter.ts`
  - `src/modules/paradigm/unionFind.test.ts`
  - `src/modules/paradigm/unionFindTimelineReplay.test.ts`
  - `src/pages/modules/UnionFindPage.tsx`
- Closed the original 42-module blueprint in the shared runtime layer:
  - `src/types/module.ts`
  - `src/pages/ModulesPage.tsx`
  - `src/pages/modulesPageUtils.test.ts`
  - `src/data/moduleRegistry.ts`
  - `src/app/router.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `src/pages/modules/modulePageHelpers.ts`
- Applied one final polish fix before handoff:
  - localized the `Greedy` stage lane-state text (`picked / seen / queued`) to follow zh/en switching
- Refreshed targeted Playwright acceptance evidence for the final closure surface:
  - `/modules`: `42` cards, `42` ready badges, `42` open links
  - `/modules?category=sort`: `11` cards, `11` ready badges, `11` open links
  - `/modules?category=paradigm`: `5` cards, `5` ready badges, `5` open links
  - `S-08` / `S-09` / `S-10` / `S-11` / `P-01` / `P-02` / `P-03` / `P-04` / `P-05` all open cleanly and default `Next` advances
  - artifacts:
    - `output/playwright/p14m5-modules-smoke.png`
    - `output/playwright/p14m5-modules-sort-filter.png`
    - `output/playwright/p14m5-modules-paradigm-filter.png`
    - `output/playwright/p14m5-counting-sort-smoke.png`
    - `output/playwright/p14m5-radix-sort-smoke.png`
    - `output/playwright/p14m5-bucket-sort-smoke.png`
    - `output/playwright/p14m5-sorting-race-smoke.png`
    - `output/playwright/p14m5-divide-conquer-smoke.png`
    - `output/playwright/p14m5-dynamic-programming-smoke.png`
    - `output/playwright/p14m5-greedy-smoke.png`
    - `output/playwright/p14m5-backtracking-smoke.png`
    - `output/playwright/p14m5-union-find-smoke.png`
    - `output/playwright/p14m5-acceptance-report.txt`
- Synced closure-state docs:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `TODO.md`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Accepted locally:
  - `P14-M1` `S-08` / `S-09`
  - `P14-M2` `S-10` / `S-11`
  - `P14-M3` `P-01` / `P-02` / `P-03`
  - `P14-M4` `P-04` / `P-05`
  - `P14-M5` original 42-module blueprint closure
- Discovery surface now verifies:
  - `/modules`: `42` cards, `42` ready badges, `42` open links
  - `/modules?category=sort`: `11` cards, `11` ready badges, `11` open links
  - `/modules?category=paradigm`: `5` cards, `5` ready badges, `5` open links
- Local quality gate is green:
  - `npm run check` passed on `2026-04-19`
- Keep unrelated dirty items out of the closure commit:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Create one focused commit for the validated `P14` closure and push it from WSL git.
- After push, the next recommended git action is merge once the 42-module closure is reviewable and rollback-safe.

## 2026-04-19 (P14 planning baseline: final 9 backlog items selected)

### Today Done
- Continued from the accepted `P13` closure baseline and opened a new implementation branch:
  - `feat/p14-backlog-wave`
- Read and re-confirmed the active source-of-truth docs before coding:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Chose the next execution wave explicitly instead of leaving the remaining work in passive backlog:
  - sorting backlog: `S-08 Counting Sort`, `S-09 Radix Sort`, `S-10 Bucket Sort`, `S-11 Sorting Race`
  - concept/technique backlog: `P-01 Divide & Conquer`, `P-02 Dynamic Programming`, `P-03 Greedy`, `P-04 Backtracking`, `P-05 Union-Find`
- Added the `P14` planning baseline and synced planning-state docs:
  - `docs/IMPLEMENTATION_PLAN_P14.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Recorded the new runtime-category decision:
  - `P-01`~`P-05` will use a new `paradigm` category in `/modules`
- Closed the sorting backlog end to end:
  - implemented `S-08 Counting Sort`
  - implemented `S-09 Radix Sort`
  - implemented `S-10 Bucket Sort`
  - implemented `S-11 Sorting Race`
- Added sorting backlog runtime/test/page wiring:
  - `src/modules/sorting/countingSort.ts`
  - `src/modules/sorting/countingTimelineAdapter.ts`
  - `src/modules/sorting/countingSort.test.ts`
  - `src/modules/sorting/countingTimelineReplay.test.ts`
  - `src/pages/modules/CountingSortPage.tsx`
  - `src/modules/sorting/radixSort.ts`
  - `src/modules/sorting/radixTimelineAdapter.ts`
  - `src/modules/sorting/radixSort.test.ts`
  - `src/modules/sorting/radixTimelineReplay.test.ts`
  - `src/pages/modules/RadixSortPage.tsx`
  - `src/modules/sorting/bucketSort.ts`
  - `src/modules/sorting/bucketTimelineAdapter.ts`
  - `src/modules/sorting/bucketSort.test.ts`
  - `src/modules/sorting/bucketTimelineReplay.test.ts`
  - `src/pages/modules/BucketSortPage.tsx`
  - `src/modules/sorting/sortingRace.ts`
  - `src/modules/sorting/sortingRaceTimelineAdapter.ts`
  - `src/modules/sorting/sortingRace.test.ts`
  - `src/modules/sorting/sortingRaceTimelineReplay.test.ts`
  - `src/pages/modules/SortingRacePage.tsx`
- Updated shared runtime/style wiring for the sorting backlog:
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/index.css`
  - `src/pages/modules/modulePageHelpers.ts`
- Re-verified locally after closing the sorting backlog:
  - full local gate:
    - `npm run check`

### Current State
- Branch:
  - `feat/p14-backlog-wave`
- Planning baseline is now explicit:
  - `P14` is the active phase
  - target closure surface is the original blueprint `42/42` modules
- `P14-M1` and `P14-M2` are accepted locally:
  - `S-08` / `S-09` / `S-10` / `S-11`
- Remaining active work:
  - `P-01 Divide & Conquer`
  - `P-02 Dynamic Programming`
  - `P-03 Greedy`
  - `P-04 Backtracking`
  - `P-05 Union-Find`
- Keep unrelated dirty items out of future commits:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Expand the runtime layer with the new `paradigm` category
- Implement the remaining `P14` modules (`P-01`~`P-05`)
- Re-run `npm run check` and targeted Playwright smoke after the paradigm batch lands

## 2026-04-19 (P13 closure: T-06 + T-05 + full registry ready)

### Today Done
- Continued on the post-`P12` implementation branch:
  - `feat/p13-m1-rabin-karp`
- Implemented `T-06 Trie` end to end:
  - `src/modules/tree/trie.ts`
  - `src/modules/tree/trieTimelineAdapter.ts`
  - `src/modules/tree/trie.test.ts`
  - `src/modules/tree/trieTimelineReplay.test.ts`
  - `src/pages/modules/TriePage.tsx`
- Implemented `T-05 B-Tree / B+ Tree` end to end as one comparison module:
  - `src/modules/tree/btreeComparison.ts`
  - `src/modules/tree/btreeComparisonTimelineAdapter.ts`
  - `src/modules/tree/btreeComparison.test.ts`
  - `src/modules/tree/btreeComparisonTimelineReplay.test.ts`
  - `src/pages/modules/BTreePage.tsx`
- Updated shared discovery/runtime/i18n/style wiring for the final tree backlog closure:
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`
- Re-verified locally:
  - full local gate:
    - `npm run check`
  - targeted Playwright smoke:
    - `/modules`: `33` cards, `33` ready badges, `33` open links
    - `/modules?category=tree`: `6` cards, `6` ready badges, `6` open links
    - `/modules/trie`: `0/11 -> 1/11`
    - `/modules/btree`: `0/7 -> 1/7`
  - artifacts:
    - `output/playwright/p13m3-modules-tree-filter.png`
    - `output/playwright/p13m3-trie-smoke.png`
    - `output/playwright/p13m3-btree-smoke.png`
    - `output/playwright/p13m3-acceptance-report.txt`
- Synced closure-state docs for the completed registry baseline:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`

### Current State
- Branch:
  - `feat/p13-m1-rabin-karp`
- Accepted locally:
  - `P13-M1` `ST-02 Rabin-Karp`
  - `P13-M2` `G-09 Topological Sort`
  - `P13-M3` `T-06 Trie`
  - `P13-M4` `T-05 B-Tree / B+ Tree`
  - `P13-M5` current functional module registry closure
- Local quality gate is green:
  - `npm run check` passed on `2026-04-19`
- Discovery surface now verifies:
  - `/modules`: `33` cards, `33` ready badges, `33` open links
  - current runtime registry pending modules: `0`
- Keep unrelated dirty items out of the next commit:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Create one focused commit for the validated `P13` closure change set
- If work continues beyond the current functional-module baseline, start a new planning checkpoint from the long-term backlog:
  - `S-08`~`S-11`
  - `P-01`~`P-05`

## 2026-04-19 (P13-M1 ST-02 + P13-M2 G-09 acceptance)

### Today Done
- Continued on post-`P12` implementation branch:
  - `feat/p13-m1-rabin-karp`
- Completed post-`P12` planning baseline:
  - added `docs/IMPLEMENTATION_PLAN_P13.md`
  - fixed execution order as `ST-02 -> G-09`, then tree backlog (`T-06 -> T-05`)
  - kept standalone/offline export work out of the active mainline backlog
- Implemented `ST-02 Rabin-Karp` end to end:
  - `src/modules/string/rabinKarp.ts`
  - `src/modules/string/rabinKarpTimelineAdapter.ts`
  - `src/modules/string/rabinKarp.test.ts`
  - `src/modules/string/rabinKarpTimelineReplay.test.ts`
  - `src/pages/modules/RabinKarpPage.tsx`
- Implemented `G-09 Topological Sort` end to end:
  - `src/modules/graph/topologicalSort.ts`
  - `src/modules/graph/topologicalSortTimelineAdapter.ts`
  - `src/modules/graph/topologicalSort.test.ts`
  - `src/modules/graph/topologicalSortTimelineReplay.test.ts`
  - `src/pages/modules/TopologicalSortPage.tsx`
- Updated shared discovery/runtime/i18n wiring for `ST-02` + `G-09`:
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/i18n/translations.ts`
  - `src/pages/modulesPageUtils.test.ts`
  - `src/index.css`
- Re-verified locally:
  - full local gate:
    - `npm run check`
  - targeted Playwright smoke:
    - `/modules?category=string`: `2` cards, `2` ready badges, `2` open links
    - `/modules/rabin-karp`: `0/46 -> 1/46`, console errors = `0`
    - `/modules?category=graph`: `9` cards, `9` ready badges, `9` open links
    - `/modules/topological-sort`: `0/46 -> 1/46`, console errors = `0`
  - artifacts:
    - `output/playwright/p13m1-modules-string-filter.png`
    - `output/playwright/p13m1-rabin-karp-smoke.png`
    - `output/playwright/p13m1-smoke-report.txt`
    - `output/playwright/p13m2-modules-graph-filter.png`
    - `output/playwright/p13m2-g09-topological-sort-smoke.png`
    - `output/playwright/p13m2-g09-smoke-report.txt`

### Current State
- Branch:
  - `feat/p13-m1-rabin-karp`
- Accepted locally:
  - `P13-M1` `ST-02 Rabin-Karp`
  - `P13-M2` `G-09 Topological Sort`
- Local quality gate is green:
  - `npm run check` passed on `2026-04-19`
- Discovery surface now verifies:
  - `/modules`: `33` cards, `31` ready badges, `31` open links
  - remaining pending modules in registry: `T-05`, `T-06`
- Keep unrelated dirty items out of the next commit:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Create one focused commit for validated `P13-M1` / `P13-M2` changes
- Continue on the next `feat/*` branch with tree backlog:
  - `T-06 Trie`
  - `T-05 B-Tree / B+ Tree`

## 2026-04-19 (P12-M5 sort + string acceptance, P12-M6 closure)

### Today Done
- Continued on the cross-category implementation branch:
  - `feat/p12-m5-heap-sort-kmp`
- Implemented `S-07 Heap Sort` end to end:
  - `src/modules/sorting/heapSort.ts`
  - `src/modules/sorting/heapTimelineAdapter.ts`
  - `src/modules/sorting/heapSort.test.ts`
  - `src/modules/sorting/heapTimelineReplay.test.ts`
  - `src/pages/modules/HeapSortPage.tsx`
- Implemented `ST-01 KMP` end to end:
  - `src/modules/string/kmp.ts`
  - `src/modules/string/kmpTimelineAdapter.ts`
  - `src/modules/string/kmp.test.ts`
  - `src/modules/string/kmpTimelineReplay.test.ts`
  - `src/pages/modules/KmpPage.tsx`
- Opened the first string-algorithm track in the shared discovery/runtime layer:
  - `src/types/module.ts`
  - `src/pages/ModulesPage.tsx`
  - `src/pages/modulesPageUtils.test.ts`
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`
- Re-verified locally for `P12-M5` / `P12-M6`:
  - full local gate:
    - `npm run check`
  - targeted Playwright smoke:
    - `/modules?category=sort`: `7` cards, `7` ready badges, `7` open links
    - `/modules/heap-sort`: `0/51 -> 1/51`, console errors = `0`
    - `/modules?category=string`: `1` card, `1` ready badge, `1` open link
    - `/modules/kmp`: `0/68 -> 1/68`, console errors = `0`
  - near-term wave discovery refresh:
    - `/modules`: `31` cards, `29` ready badges, `29` open links
    - `/modules?category=graph`: `8` cards, `8` ready badges, `8` open links
    - `/modules?category=hash`: `2` cards, `2` ready badges, `2` open links
    - `/modules?category=sort`: `7` cards, `7` ready badges, `7` open links
    - `/modules?category=string`: `1` card, `1` ready badge, `1` open link
  - artifacts:
    - `output/playwright/p12m5-modules-sort-filter.png`
    - `output/playwright/p12m5-heap-sort-smoke.png`
    - `output/playwright/p12m5-modules-string-filter.png`
    - `output/playwright/p12m5-kmp-smoke.png`
    - `output/playwright/p12m6-modules-smoke.png`
    - `output/playwright/p12m6-modules-graph-filter.png`
    - `output/playwright/p12m6-modules-hash-filter.png`
    - `output/playwright/p12m6-modules-sort-filter.png`
    - `output/playwright/p12m6-modules-string-filter.png`
    - `output/playwright/p12m6-acceptance-report.txt`
- Synced planning-state docs for the accepted `P12` closure:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `docs/IMPLEMENTATION_PLAN_P12.md`
  - `TODO.md`
- Reconfirmed the workflow guardrail:
  - standalone/offline export work stays out of the active mainline backlog unless the user explicitly reopens it

### Current State
- Branch:
  - `feat/p12-m5-heap-sort-kmp`
- `P12-M5` and `P12-M6` are accepted locally:
  - `S-07 Heap Sort`
  - `ST-01 KMP`
  - near-term wave discovery/acceptance refresh
- Local quality gate is green:
  - `npm run check` passed on `2026-04-19`
- Discovery surface after `P12` now verifies:
  - `/modules`: `31` cards, `29` ready badges, `29` open links
- Keep unrelated dirty items out of the `P12-M5` / `P12-M6` commit:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Create one focused commit for the validated `P12-M5` / `P12-M6` change set
- Start the post-`P12` planning baseline on the next docs-focused branch:
  - choose the next execution wave from `T-05`, `T-06`, `G-09`, `S-08`~`S-11`, `ST-02`, and `P-01`~`P-05`
  - keep standalone/offline export work excluded unless the user explicitly asks for it again

## 2026-04-19 (P12-M4 MST acceptance)

### Today Done
- Continued on the MST implementation branch:
  - `feat/p12-m4-mst`
- Kept the shared weighted-graph foundation aligned for the MST track:
  - reused `mstUndirected` as the common teaching preset for both MST pages
  - kept undirected adjacency generation inside `src/modules/graph/weightedGraph.ts`
  - added shared graph-stage edge styling for selected / frontier / rejected MST states in `src/index.css`
- Implemented `G-07 Kruskal` end to end:
  - `src/modules/graph/kruskal.ts`
  - `src/modules/graph/kruskalTimelineAdapter.ts`
  - `src/modules/graph/kruskal.test.ts`
  - `src/modules/graph/kruskalTimelineReplay.test.ts`
  - `src/pages/modules/KruskalPage.tsx`
- Implemented `G-08 Prim` end to end:
  - `src/modules/graph/prim.ts`
  - `src/modules/graph/primTimelineAdapter.ts`
  - `src/modules/graph/prim.test.ts`
  - `src/modules/graph/primTimelineReplay.test.ts`
  - `src/pages/modules/PrimPage.tsx`
- Updated shared discovery/runtime wiring for the new MST route:
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`
- Re-verified locally for `P12-M4`:
  - targeted MST tests:
    - `npm test -- src/modules/graph/kruskal.test.ts src/modules/graph/kruskalTimelineReplay.test.ts`
    - `npm test -- src/modules/graph/prim.test.ts src/modules/graph/primTimelineReplay.test.ts`
  - targeted lint:
    - `npm run lint -- src/modules/graph/prim.ts src/modules/graph/primTimelineAdapter.ts src/modules/graph/prim.test.ts src/modules/graph/primTimelineReplay.test.ts src/pages/modules/PrimPage.tsx`
  - full local gate:
    - `npm run check`
  - targeted Playwright smoke:
    - `/modules?category=graph`: `8` cards, `8` ready badges, `8` open links
    - `/modules/kruskal`: `0/12 -> 1/12`, console errors = `0`
    - `/modules/prim`: `0/12 -> 1/12`, console errors = `0`
  - artifacts:
    - `output/playwright/p12m4-modules-graph-filter.png`
    - `output/playwright/p12m4-kruskal-smoke.png`
    - `output/playwright/p12m4-prim-smoke.png`
    - `output/playwright/p12m4-g07-smoke-report.txt`
    - `output/playwright/p12m4-g08-smoke-report.txt`
- Updated the thread heartbeat automation and kept it active:
  - automation id: `p12`
  - cadence: every 5 minutes
  - stop rule remains:
    - stop once near-term `P12` work is complete
    - or once local time passes `2026-04-20 08:00 Asia/Shanghai`

### Current State
- Branch:
  - `feat/p12-m4-mst`
- `P12-M4` MST batch is accepted locally:
  - `G-07 Kruskal`
  - `G-08 Prim`
- Local quality gates are green:
  - `npm run check` passed on `2026-04-19`
- Targeted Playwright smoke is green:
  - `/modules?category=graph`: `8` cards, `8` ready badges, `8` open links
  - `/modules/kruskal`: `0/12 -> 1/12`, console errors = `0`
  - `/modules/prim`: `0/12 -> 1/12`, console errors = `0`
- Keep unrelated dirty items out of the MST commit:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Create one focused commit for the validated `P12-M4` MST milestone
- Start `P12-M5` on the next `feat/*` branch:
  - implement `S-07 Heap Sort`
  - implement `ST-01 KMP`
  - rerun `npm run check` and targeted Playwright smoke across both routes

## 2026-04-19 (P12 hash + graph checkpoint)

### Today Done
- Continued on the first `P12` implementation branch:
  - `feat/p12-m1-hash-foundations`
- Implemented the `hash` category foundation plus two new teaching modules:
  - `H-01 Hash Table - Chaining`
  - `H-02 Hash Table - Open Addressing`
- Added the hash runtime/model/test/page wiring:
  - `src/modules/hash/hashChaining.ts`
  - `src/modules/hash/hashChainingTimelineAdapter.ts`
  - `src/modules/hash/hashChaining.test.ts`
  - `src/modules/hash/hashChainingTimelineReplay.test.ts`
  - `src/modules/hash/hashOpenAddressing.ts`
  - `src/modules/hash/hashOpenAddressingTimelineAdapter.ts`
  - `src/modules/hash/hashOpenAddressing.test.ts`
  - `src/modules/hash/hashOpenAddressingTimelineReplay.test.ts`
  - `src/pages/modules/HashChainingPage.tsx`
  - `src/pages/modules/HashOpenAddressingPage.tsx`
- Extended shared discovery/runtime wiring for the new category/modules:
  - `src/types/module.ts`
  - `src/pages/ModulesPage.tsx`
  - `src/pages/modulesPageUtils.test.ts`
  - `src/data/moduleRegistry.ts`
  - `src/app/router.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
- Re-verified locally:
  - targeted hash tests:
    - `npm test -- src/modules/hash/hashChaining.test.ts src/modules/hash/hashChainingTimelineReplay.test.ts src/modules/hash/hashOpenAddressing.test.ts src/modules/hash/hashOpenAddressingTimelineReplay.test.ts src/pages/modulesPageUtils.test.ts`
  - targeted lint:
    - `npm run lint -- src/pages/modules/HashChainingPage.tsx src/pages/modules/HashOpenAddressingPage.tsx src/modules/hash`
  - full local gate:
    - `npm run check`
- Created the thread heartbeat automation for continued night work:
  - automation name: `P12 夜间自动驾驶`
  - cadence: every 5 minutes
  - stop rule is written into the automation prompt:
    - stop once near-term `P12` work is complete
    - or once local time passes `2026-04-20 08:00 Asia/Shanghai`
- Closed the `P12-M1` acceptance/documentation follow-up and committed:
  - `docs: close p12-m1 hash acceptance` (`79c315b`)
- Continued on the next implementation branch:
  - `feat/p12-m2-bfs`
- Implemented `G-03 Breadth-First Search (BFS)`:
  - added graph runtime/model/test/page wiring:
    - `src/modules/graph/bfs.ts`
    - `src/modules/graph/bfsTimelineAdapter.ts`
    - `src/modules/graph/bfs.test.ts`
    - `src/modules/graph/bfsTimelineReplay.test.ts`
    - `src/pages/modules/BfsPage.tsx`
  - updated shared discovery/runtime wiring:
    - `src/data/moduleRegistry.ts`
    - `src/app/router.tsx`
    - `src/i18n/translations.ts`
    - `src/index.css`
- Re-verified locally for `P12-M2`:
  - full local gate:
    - `npm run check`
  - targeted Playwright smoke:
    - `/modules?category=graph`: `3` cards, `3` ready badges, `3` open links
    - `/modules/bfs`: `0/34 -> 1/34`, console errors = `0`
  - artifacts:
    - `output/playwright/p12m2-modules-graph-filter.png`
    - `output/playwright/p12m2-bfs-smoke.png`
    - `output/playwright/p12m2-smoke-report.txt`
- Continued on the shortest-path batch branch:
  - `feat/p12-m3-shortest-paths`
- Implemented `G-04 Dijkstra`:
  - added weighted-graph foundation:
    - `src/modules/graph/weightedGraph.ts`
  - added Dijkstra runtime/model/test/page wiring:
    - `src/modules/graph/dijkstra.ts`
    - `src/modules/graph/dijkstraTimelineAdapter.ts`
    - `src/modules/graph/dijkstra.test.ts`
    - `src/modules/graph/dijkstraTimelineReplay.test.ts`
    - `src/pages/modules/DijkstraPage.tsx`
  - updated shared discovery/runtime wiring:
    - `src/data/moduleRegistry.ts`
    - `src/app/router.tsx`
    - `src/i18n/translations.ts`
    - `src/index.css`
- Re-verified locally for `G-04`:
  - full local gate:
    - `npm run check`
  - targeted Playwright smoke:
    - `/modules?category=graph`: `4` cards, `4` ready badges, `4` open links
    - `/modules/dijkstra`: `0/34 -> 1/34`, console errors = `0`
  - artifacts:
    - `output/playwright/p12m3-modules-graph-filter.png`
    - `output/playwright/p12m3-dijkstra-smoke.png`
    - `output/playwright/p12m3-g04-smoke-report.txt`
- Implemented `G-05 Bellman-Ford`:
  - extended weighted-graph foundation with the negative-edge teaching preset:
    - `src/modules/graph/weightedGraph.ts`
  - added Bellman-Ford runtime/model/test/page wiring:
    - `src/modules/graph/bellmanFord.ts`
    - `src/modules/graph/bellmanFordTimelineAdapter.ts`
    - `src/modules/graph/bellmanFord.test.ts`
    - `src/modules/graph/bellmanFordTimelineReplay.test.ts`
    - `src/pages/modules/BellmanFordPage.tsx`
  - updated shared discovery/runtime wiring:
    - `src/pages/modules/DijkstraPage.tsx`
    - `src/data/moduleRegistry.ts`
    - `src/app/router.tsx`
    - `src/i18n/translations.ts`
    - `src/index.css`
- Re-verified locally for `G-05`:
  - full local gate:
    - `npm run check`
  - targeted Playwright smoke:
    - `/modules?category=graph`: `5` cards, `5` ready badges, `5` open links
    - `/modules/bellman-ford`: `0/75 -> 1/75`, console errors = `0`
  - artifacts:
    - `output/playwright/p12m3-modules-graph-filter.png`
    - `output/playwright/p12m3-bellman-ford-smoke.png`
    - `output/playwright/p12m3-g05-smoke-report.txt`
- Implemented `G-06 Floyd-Warshall`:
  - extended weighted-graph foundation with the all-pairs teaching preset:
    - `src/modules/graph/weightedGraph.ts`
  - added Floyd-Warshall runtime/model/test/page wiring:
    - `src/modules/graph/floydWarshall.ts`
    - `src/modules/graph/floydWarshallTimelineAdapter.ts`
    - `src/modules/graph/floydWarshall.test.ts`
    - `src/modules/graph/floydWarshallTimelineReplay.test.ts`
    - `src/pages/modules/FloydWarshallPage.tsx`
  - updated shared discovery/runtime wiring:
    - `src/data/moduleRegistry.ts`
    - `src/app/router.tsx`
    - `src/i18n/translations.ts`
    - `src/index.css`
- Re-verified locally for `G-06`:
  - full local gate:
    - `npm run check`
  - targeted Playwright smoke:
    - `/modules?category=graph`: `6` cards, `6` ready badges, `6` open links
    - `/modules/floyd-warshall`: `0/138 -> 1/138`, console errors = `0`
  - artifacts:
    - `output/playwright/p12m3-modules-graph-filter.png`
    - `output/playwright/p12m3-floyd-warshall-smoke.png`
    - `output/playwright/p12m3-g06-smoke-report.txt`

### Current State
- Branch:
  - `feat/p12-m3-shortest-paths`
- `P12-M1` accepted baseline is committed on the parent branch history:
  - `59fe92e` `feat: add hash table foundation modules`
  - `79c315b` `docs: close p12-m1 hash acceptance`
- `P12-M2` accepted baseline is committed on the parent branch history:
  - `896df29` `feat: add bfs teaching module`
- `P12-M3` weighted shortest-path batch is accepted locally:
  - shortest-path weighted-graph foundation plus `G-04` / `G-05` / `G-06` code/tests/i18n/route wiring/styling are landed
  - local quality gates are green:
    - `npm run check` passed on `2026-04-19`
  - targeted Playwright smoke is green:
    - `/modules?category=graph`: `6` cards, `6` ready badges, `6` open links
    - `/modules/dijkstra`: `0/34 -> 1/34`, console errors = `0`
    - `/modules/bellman-ford`: `0/75 -> 1/75`, console errors = `0`
    - `/modules/floyd-warshall`: `0/138 -> 1/138`, console errors = `0`
  - smoke artifacts:
    - `output/playwright/p12m3-modules-graph-filter.png`
    - `output/playwright/p12m3-dijkstra-smoke.png`
    - `output/playwright/p12m3-bellman-ford-smoke.png`
    - `output/playwright/p12m3-floyd-warshall-smoke.png`
    - `output/playwright/p12m3-g04-smoke-report.txt`
    - `output/playwright/p12m3-g05-smoke-report.txt`
    - `output/playwright/p12m3-g06-smoke-report.txt`
- Keep unrelated dirty items out of the hash commit:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`
  - `student-dist/`

### Next Step
- Create one focused commit for the validated `G-06` sub-milestone to close `P12-M3`
- Start `P12-M4` MST modules on the next `feat/*` branch:
  - implement `G-07 Kruskal`
  - implement `G-08 Prim`
  - rerun `npm run check` and targeted Playwright smoke across both MST routes

## 2026-04-18 (P12 near-term roadmap split)

### Today Done
- Defined the post-`P11` planning baseline and wrote it down in:
  - `docs/IMPLEMENTATION_PLAN_P12.md`
- Split the remaining blueprint modules into:
  - near-term `P12` implementation wave:
    - `H-01 Hash Table - Chaining`
    - `H-02 Hash Table - Open Addressing`
    - `G-03 BFS`
    - `G-04 Dijkstra`
    - `G-05 Bellman-Ford`
    - `G-06 Floyd-Warshall`
    - `G-07 Kruskal`
    - `G-08 Prim`
    - `S-07 Heap Sort`
    - `ST-01 KMP`
  - long-term backlog after `P12`:
    - `T-05`
    - `T-06`
    - `G-09`
    - `S-08`~`S-11`
    - `ST-02`
    - `P-01`~`P-05`
- Synced planning-state docs:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`

### Current State
- Current working branch in the local repo is still:
  - `feat/student-binary-tree-standalone`
- Planning docs now treat `P12` as the next mainline execution wave.
- Recommended first implementation scope after this planning sync:
  - `H-01` / `H-02`

### Next Step
- Start the first `P12` implementation branch from the planning baseline:
  - recommended branch: `feat/p12-m1-hash-foundations`
- Keep the remaining blueprint items in the explicit long-term backlog unless priorities change again.

## 2026-04-15 (student standalone binary-tree export)

### Today Done
- Added a standalone offline export for `T-01 Binary Tree Traversal` on:
  - `feat/student-binary-tree-standalone`
- Implemented a dedicated standalone entry that does not depend on the main app router:
  - `standalone/binary-tree/index.html`
  - `standalone/binary-tree/main.tsx`
  - `standalone/binary-tree/StudentBinaryTreeStandaloneApp.tsx`
  - `standalone/binary-tree/public/README.txt`
- Added the export script:
  - `package.json`
    - `npm run build:student-binary-tree`
- Student output lands in `student-dist/binary-tree`
- Delivery shape now uses one self-contained offline `index.html` so students can open it via `file://` without hitting module/CORS issues.
- Ignore rule added in `.gitignore`
- Added lightweight usage notes:
  - `README.md`
- Re-verified locally:
  - `npm run build:student-binary-tree`
  - `npm run check`
  - browser acceptance via the pinned Playwright wrapper against a local static host of the exported folder:
    - page title = `Binary Tree Traversal Student Edition`
    - initial playback state = `0/31`
    - `Next` advanced to `1/31`
    - `Play` advanced to `5/31` after ~3 seconds and status changed to `Playing`
- Local file (`file://`) automation could not be driven directly through `playwright-cli` because the CLI blocks the `file:` protocol, but the exported HTML now uses only relative asset paths (`./assets/...`) and no router dependency.
- Follow-up fix after user verification on Windows local path (`file:///D:/...`) reported white screen:
  - wrapped student-startup storage access so browsers that block `localStorage` on `file://` no longer crash the initial render
  - replaced the prior Vite multi-file export with a single-file offline bundle generated by:
    - `scripts/build-student-binary-tree.mjs`
  - updated:
    - `src/i18n/LanguageContext.tsx`
    - `src/pages/modules/BinaryTreeTraversalPage.tsx`
    - `package.json`
  - rebuilt standalone output:
    - `student-dist/binary-tree`

### Current State
- Branch: `feat/student-binary-tree-standalone`
- Student deliverable path:
  - `student-dist/binary-tree/index.html`
- Intended distribution mode:
  - copy the whole `student-dist/binary-tree` folder to the student machine
  - student opens `index.html` directly in a desktop browser

### Next Step
- Optional polish if requested:
  - add a simple “Open Algorithm” default hint for first-time students
  - create a zipped release artifact for easier classroom distribution
  - repeat the same standalone-export pattern for `BST` / `AVL` / `Heap`

## 2026-04-07 (T-04 heap animation stabilization)

### Today Done
- Investigated the reported `T-04 Heap` regression on `feat/p11-m3-graph-closure`.
- Kept the good heap timeline-model fixes and stabilized the page runtime:
  - `src/modules/tree/heap.ts`
    - added stable `itemIds` to each heap step so tree nodes and array cells keep the same identity across swaps
    - kept `build` initial frame unfocused so the default page no longer looks like a broken heap before heapify starts
  - `src/pages/modules/HeapPage.tsx`
    - removed the broken `motion/react` integration that caused the React invalid-hook runtime on `/modules/heap`
    - switched heap tree nodes and array cells to stable-key CSS position transitions so swaps now move the actual items instead of shrinking into number-only artifacts
  - `src/index.css`
    - added heap-specific transition rules for node/cell movement and absolute array-cell positioning
    - aligned the heap edge layer to the same tree-region inset as the heap node layer so tree edges no longer drift away from node centers
  - `src/modules/tree/heap.test.ts`
    - added regression coverage for unfocused build initial state and stable `itemIds` swap replay
- Returned to the heap tree-geometry bug after user feedback that the prior fix was still too superficial:
  - `src/pages/modules/HeapPage.tsx`
    - replaced the old compressed index-based tree layout with a measured tree-region layout that spreads heap levels across the full available tree stage
    - moved heap nodes and edges into one dedicated `heap-tree-region` so both layers definitely share the same coordinate space
    - clipped edge endpoints to the node radius instead of drawing center-to-center lines, so connectors visually land on the node boundary like `T-01`
  - `src/index.css`
    - added `.heap-tree-region` and switched heap edge/node layers to fill that wrapper directly
    - kept the tree/array labels and array strip above the stage content while the tree region expands vertically
- Re-verified locally:
  - targeted tests: `npm test -- src/modules/tree/heap.test.ts src/modules/tree/heapTimelineReplay.test.ts`
  - targeted lint: `npm run lint -- src/pages/modules/HeapPage.tsx src/modules/tree/heap.ts src/modules/tree/heap.test.ts`
  - browser regression on `/modules/heap` with the pinned Playwright wrapper:
    - `Build`: initial frame shows no misleading active root/path, completion reaches `11/11`, and `Next` is disabled
    - `Insert`: append + sift-up flow completes at `6/6`, root becomes `55`, and `Next` is disabled
    - `Extract root`: completion reaches `7/7`, extracted value is `50`, and `Next` is disabled
    - tree-edge alignment: the heap edge layer now shares the same bottom inset as the heap node layer, so the edges and node centers line up again on the main tree stage
    - console errors: `0`
  - follow-up browser regression on `/modules/heap` at `1440x1100` after the geometry rewrite:
    - default `Build` frame now uses the full heap tree region instead of compressing all nodes into the upper half
    - stepped `Build` frames keep node centers and line endpoints visually aligned after swaps
    - console errors remain `0`
  - full quality gate: `npm run check`

### Current State
- Branch: `feat/t04-heap-animation-stabilization`
- Heap animation/runtime fix plus the follow-up tree-geometry fix are validated locally on the branch.
- Prior push/auth root cause was confirmed as Windows git/ssh not seeing the WSL SSH keys; WSL-native git push is the working path for this repo.
- Keep unrelated dirty items out of this change set:
  - `scripts/check-doc-links.sh`
  - `scripts/playwright-cli.sh`
  - `docs/design-prototypes/`
  - `output/design/`
  - legacy `output/playwright/t01-*`
  - `output/playwright/visualgo-bst-layout.png`
  - `start-project-wsl.bat`

### Next Step
- Create one focused commit for the validated heap geometry fix, then push from WSL:
  - `feat/t04-heap-animation-stabilization`
- After push, decide whether to merge this focused heap fix before resuming post-`P11` planning or additional tree-track work.

## 2026-04-07 (P11-M3 graph-track acceptance closure)

### Today Done
- Continued on the graph-track closure branch:
  - `feat/p11-m3-graph-closure`
- Closed `P11-M3` locally with a focused graph-track Playwright acceptance refresh for:
  - `/modules`
  - `/modules?category=graph`
  - `/modules/graph-representation`
  - `/modules/dfs`
- Refreshed local graph-track acceptance evidence under `output/playwright/p11m3-*`:
  - discovery screenshots for `/modules` and graph filter state
  - route screenshots for `G-01` and `G-02`
  - panel-behavior screenshots for `G-01` and `G-02`
  - `output/playwright/p11m3-acceptance-report.txt`
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified locally:
  - `/modules`: `21` cards, `19` ready badges, `19` open links
  - graph filter: `2` cards, `2` ready badges, `2` open links
  - `G-01`: `Controls` / `Step` entrypoints present; opening both panels then clicking the stage collapses them from `2 -> 0`; default `Next` advances `0/20 -> 1/20`
  - `G-02`: `Controls` / `Step` entrypoints present; opening both panels then clicking the stage collapses them from `2 -> 0`; default `Next` advances `0/28 -> 1/28`
  - both graph routes returned `0` console errors in the targeted smoke
- Re-synced milestone state docs:
  - `docs/IMPLEMENTATION_PLAN_P11.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `TODO.md`

### Current State
- Branch: `feat/p11-m3-graph-closure`
- Validated scope in this closure batch:
  - `docs/IMPLEMENTATION_PLAN_P11.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `TODO.md`
  - `output/playwright/p11m3-*`
- Milestone state:
  - `P11` graph-track expansion is now completed locally
  - next priority is a post-`P11` planning baseline before new implementation work

### Next Step
- Create one focused commit for the validated `P11-M3` closure:
  - `p11m3` acceptance evidence
  - closure docs sync
- Keep unrelated dirty items out of the closure commit (`scripts/*`, design artifacts, legacy screenshots, launcher helper).
- Then define the next phase on a docs planning branch:
  - recommended branch: `docs/post-p11-plan`
  - decide the next phase sequence and sync planning-state docs

## 2026-04-07 (P11-M2 dfs)

### Today Done
- Continued on the validated graph-track foundation branch:
  - `feat/p11-m2-dfs`
- Implemented `P11-M2` `G-02 DFS` on top of the accepted shared workspace shell:
  - added deterministic DFS traversal generation with explicit `initial -> pushStart -> visit -> inspectNeighbor -> descend/skipVisited -> backtrack -> completed` states
  - kept traversal order tied to the same deterministic graph preset / adjacency-list foundation introduced in `G-01`
  - exposed visit order, call stack, active relation, and backtrack progression directly in the page UI
- Added deterministic DFS coverage:
  - `src/modules/graph/dfs.ts`
  - `src/modules/graph/dfsTimelineAdapter.ts`
  - `src/modules/graph/dfs.test.ts`
  - `src/modules/graph/dfsTimelineReplay.test.ts`
- Added the new route/page/styling and discovery wiring:
  - `src/pages/modules/DfsPage.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/app/router.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified targeted browser smoke with the pinned Playwright wrapper:
  - `/modules`: `21` cards, `19` ready badges, `19` open links
  - graph filter shows `2` cards, `2` ready badges, and `2` live open links
  - `/modules/dfs` opens cleanly from the graph filter without route-level runtime errors
  - `Controls` + `Step` panels open correctly, and clicking the stage collapses them back to the pinned buttons
  - default `Next` advances from `0/28` to `1/28`
  - console errors returned `0`
- Captured local smoke artifacts:
  - `output/playwright/p11m2-modules-smoke.png`
  - `output/playwright/p11m2-modules-graph-filter.png`
  - `output/playwright/p11m2-dfs-panels.png`
  - `output/playwright/p11m2-dfs-smoke.png`
  - `output/playwright/p11m2-smoke-report.txt`

### Current State
- Branch: `feat/p11-m2-dfs`
- Validated scope in this milestone:
  - `src/modules/graph/dfs.ts`
  - `src/modules/graph/dfsTimelineAdapter.ts`
  - `src/modules/graph/dfs.test.ts`
  - `src/modules/graph/dfsTimelineReplay.test.ts`
  - `src/pages/modules/DfsPage.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/app/router.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/IMPLEMENTATION_PLAN_P11.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
  - `output/playwright/p11m2-*`
- Milestone state:
  - `P11-M2` `G-02 DFS` is now completed locally
  - next priority is `P11-M3` graph-track acceptance closure

### Next Step
- Create one focused commit for the validated DFS milestone:
  - DFS logic / replay tests / page / route / registry / i18n / styling
  - `p11m2` smoke artifacts and docs sync
- Keep unrelated dirty items out of the commit (`scripts/*`, design artifacts, legacy screenshots, launcher helper).
- Then start `P11-M3` on a fresh branch:
  - recommended branch: `feat/p11-m3-graph-closure`
  - refresh `/modules`, graph filter, `G-01`, and `G-02` acceptance evidence together
  - sync closure docs once the graph-track acceptance pass lands

## 2026-04-07 (P11-M1 graph representation)

### Today Done
- Created the implementation branch for the first graph milestone:
  - `feat/p11-m1-graph-representation`
- Implemented `P11-M1` `G-01 Graph Representation` on top of the accepted shared workspace shell:
  - added graph category support in `/modules`, module registry, route wiring, and zh/en i18n
  - added one deterministic graph preset model that simultaneously drives:
    - graph canvas
    - adjacency list
    - adjacency matrix
  - structured the teaching timeline as `initial -> selectVertex -> inspectEdge -> completeRow -> completed`
- Added deterministic graph coverage:
  - `src/modules/graph/graphRepresentation.test.ts`
  - `src/modules/graph/graphRepresentationTimelineReplay.test.ts`
- Added the new route/page/styling:
  - `src/pages/modules/GraphRepresentationPage.tsx`
  - `src/app/router.tsx`
  - `src/index.css`
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified targeted browser smoke with the pinned Playwright wrapper:
  - `/modules`: `21` cards, `18` ready badges, `18` open links
  - graph filter shows `2` cards and `1` live open link
  - `/modules/graph-representation` opens without route-level runtime errors
  - `Controls` + `Step` panels open correctly, and clicking the stage collapses them back to the pinned buttons
  - default `Next` advances from `0/20` to `1/20`
  - console errors returned `0`
- Captured local smoke artifacts:
  - `output/playwright/p11m1-modules-smoke.png`
  - `output/playwright/p11m1-modules-graph-filter.png`
  - `output/playwright/p11m1-graph-representation-panels.png`
  - `output/playwright/p11m1-graph-representation-smoke.png`
  - `output/playwright/p11m1-smoke-report.txt`

### Current State
- Branch: `feat/p11-m1-graph-representation`
- Validated scope in this milestone:
  - `src/modules/graph/graphRepresentation.ts`
  - `src/modules/graph/graphRepresentationTimelineAdapter.ts`
  - `src/modules/graph/graphRepresentation.test.ts`
  - `src/modules/graph/graphRepresentationTimelineReplay.test.ts`
  - `src/pages/modules/GraphRepresentationPage.tsx`
  - `src/types/module.ts`
  - `src/pages/ModulesPage.tsx`
  - `src/pages/modulesPageUtils.test.ts`
  - `src/data/moduleRegistry.ts`
  - `src/app/router.tsx`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `docs/IMPLEMENTATION_PLAN_P11.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
  - `output/playwright/p11m1-*`
- Milestone state:
  - `P11-M1` `G-01 Graph Representation` is now completed locally
  - next priority is `P11-M2` `G-02 DFS`

### Next Step
- Create one focused commit for the validated graph-representation milestone:
  - graph module logic / replay tests / page / route / registry / i18n / styling
  - `p11m1` smoke artifacts and docs sync
- Keep unrelated dirty items out of the commit (`scripts/*`, design artifacts, legacy screenshots, launcher helper).
- Then start `P11-M2` on a fresh branch:
  - recommended branch: `feat/p11-m2-dfs`
  - reuse the same deterministic graph preset foundation and shared shell
  - keep the first DFS iteration focused on visited progression, stack/backtrack semantics, and traversal order

## 2026-04-07 (P11 planning baseline)

### Today Done
- Created the post-`P10` docs planning branch:
  - `docs/post-p10-plan`
- Defined the next execution order and added `docs/IMPLEMENTATION_PLAN_P11.md`.
- Chose a graph-foundation phase that broadens the product baseline without jumping straight into the heavier remaining tree backlog:
  - `P11-M1`: `G-01 Graph Representation` + graph category wiring
  - `P11-M2`: `G-02 DFS`
  - `P11-M3`: graph-track acceptance closure
- Synced planning-state docs:
  - `docs/IMPLEMENTATION_PLAN_P11.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Re-ran the required docs-only gate successfully:
  - `./scripts/check-doc-links.sh`

### Current State
- Branch: `docs/post-p10-plan`
- Validated scope in this planning batch:
  - `docs/IMPLEMENTATION_PLAN_P11.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Milestone state:
  - `P11` planning baseline is now completed locally
  - next priority is `P11-M1` `G-01 Graph Representation`

### Next Step
- Create a fresh implementation branch from this planning baseline:
  - recommended branch: `feat/p11-m1-graph-representation`
- Then implement `G-01 Graph Representation` with:
  - graph category discovery wiring
  - one deterministic graph model driving canvas + adjacency views
  - deterministic tests and targeted Playwright smoke

## 2026-04-07 (P10-M3 tree-track acceptance closure)

### Today Done
- Closed `P10-M3` locally with a focused tree-track Playwright acceptance refresh for:
  - `/modules`
  - `/modules/binary-tree`
  - `/modules/bst`
  - `/modules/avl-tree`
  - `/modules/heap`
- Refreshed local tree-track acceptance evidence under `output/playwright/p10m3-*`:
  - discovery screenshots for `/modules` and tree filter state
  - route screenshots for `T-01` ~ `T-04`
  - `output/playwright/p10m3-runtime-smoke.txt`
  - `output/playwright/p10m3-acceptance-report.txt`
- Re-verified locally:
  - `/modules`: `19` cards, `17` ready badges, `17` open links, tree filter = `6` cards
  - `T-01`: `Controls` / `Step` / `Algorithm` entrypoints present; default `Next` advances `0/31 -> 1/31`
  - `T-02`: `Controls` / `Step` entrypoints present; default `Next` advances `0/2 -> 1/2`
  - `T-03`: `Controls` / `Step` entrypoints present; default `Next` advances `0/11 -> 1/11`; opening both panels then clicking the stage collapses them from `2 -> 0`
  - `T-04`: `Controls` / `Step` entrypoints present; default `Next` advances `0/11 -> 1/11`; opening both panels then clicking the stage collapses them from `2 -> 0`
  - all four tree routes returned `0` console errors in the targeted smoke
- Re-synced milestone state docs:
  - `docs/IMPLEMENTATION_PLAN_P10.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `TODO.md`
- Re-ran the required docs-only gate successfully:
  - `./scripts/check-doc-links.sh`

### Current State
- Branch: `feat/p10-m3-tree-closure`
- Validated scope in this closure batch:
  - `docs/IMPLEMENTATION_PLAN_P10.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `TODO.md`
  - `output/playwright/p10m3-*`
- Milestone state:
  - `P10` tree-track expansion is now completed locally
  - next priority is a post-`P10` planning baseline before new implementation work

### Next Step
- Create one focused commit for the validated `P10-M3` closure:
  - `p10m3` acceptance evidence
  - closure docs sync
- Keep unrelated dirty items out of the closure commit (`scripts/*`, design artifacts, legacy screenshots, launcher helper).
- Then define the next phase on a docs planning branch:
  - recommended branch: `docs/post-p10-plan`
- Remote push is still blocked in this environment until SSH auth is fixed.

## 2026-04-07 (P10-M2 heap)

### Today Done
- Implemented `P10-M2` `T-04 Heap` on the accepted shared tree workspace shell:
  - added heap step generator / timeline adapter / page / route / registry wiring
  - covered `build` / `insert` / `extractRoot` on one shared tree+array stage
  - kept the first iteration focused on `sift-up` / `sift-down` teaching states
- Added deterministic heap coverage:
  - `src/modules/tree/heap.test.ts`
  - `src/modules/tree/heapTimelineReplay.test.ts`
- Added localized heap copy and shared-shell styling support:
  - `src/i18n/translations.ts`
  - `src/index.css`
- Re-ran the required local quality gate successfully after implementation and warning cleanup:
  - `npm run check`
- Re-verified targeted browser smoke with the pinned Playwright wrapper:
  - `/modules` shows `T-04` as `Ready`
  - `/modules/heap` opens without route-level runtime errors
  - default `Next` advances from `0/11` to `1/11`
  - console error log returned `0` errors
- Captured local smoke artifacts:
  - `output/playwright/p10m2-modules-smoke.png`
  - `output/playwright/p10m2-heap-smoke.png`
- Attempted to push the prior AVL milestone branch, but remote SSH auth is still blocked in this environment:
  - `git@github.com: Permission denied (publickey).`

### Current State
- Branch: `feat/p10-m2-heap`
- Validated scope in this milestone:
  - `src/modules/tree/heap.ts`
  - `src/modules/tree/heapTimelineAdapter.ts`
  - `src/modules/tree/heap.test.ts`
  - `src/modules/tree/heapTimelineReplay.test.ts`
  - `src/pages/modules/HeapPage.tsx`
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `output/playwright/p10m2-*.png`
- Milestone state:
  - `P10-M2` `T-04 Heap` is now completed locally
  - next priority is `P10-M3` tree-track acceptance closure

### Next Step
- Create one focused commit for the validated heap milestone:
  - heap generator / replay tests / page / route / registry / i18n / styling
  - `p10m2` smoke artifacts
  - docs sync
- Keep unrelated dirty items out of the heap commit (`scripts/*`, design artifacts, legacy screenshots, launcher helper).
- Then start `P10-M3` on a fresh branch:
  - recommended branch: `feat/p10-m3-tree-closure`

## 2026-04-07 (P10-M1 AVL tree)

### Today Done
- Implemented `P10-M1` `T-03 AVL Tree` on the accepted shared tree workspace shell:
  - added AVL step generator / timeline adapter / page / route / registry wiring
  - focused the first iteration on insert + rebalance teaching flow
  - covered explicit `LL` / `LR` / `RR` / `RL` rotation cases
- Added deterministic AVL coverage:
  - `src/modules/tree/avl.test.ts`
  - `src/modules/tree/avlTimelineReplay.test.ts`
- Added localized AVL copy and shell styling support:
  - `src/i18n/translations.ts`
  - `src/index.css`
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified targeted browser smoke with the pinned Playwright wrapper:
  - `/modules` shows `T-03` as `Ready`
  - `/modules/avl-tree` opens without route-level runtime errors
  - default `Next` advances from `0/11` to `1/11`
  - console error log returned `0` errors
- Captured local smoke artifacts:
  - `output/playwright/p10m1-modules-smoke.png`
  - `output/playwright/p10m1-avl-tree-smoke.png`

### Current State
- Branch: `feat/p10-m1-avl-tree`
- Validated scope in this milestone:
  - `src/modules/tree/avl.ts`
  - `src/modules/tree/avlTimelineAdapter.ts`
  - `src/modules/tree/avl.test.ts`
  - `src/modules/tree/avlTimelineReplay.test.ts`
  - `src/pages/modules/AvlTreePage.tsx`
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`
  - `output/playwright/p10m1-*.png`
- Milestone state:
  - `P10-M1` `T-03 AVL Tree` is now completed locally
  - next priority is `P10-M2` `T-04 Heap`

### Next Step
- Create one focused commit for the validated AVL milestone:
  - AVL generator / replay tests / page / route / registry / i18n / styling
  - `p10m1` smoke artifacts
  - docs sync
- Keep unrelated dirty items out of the AVL commit (`scripts/*`, design artifacts, legacy screenshots, launcher helper).
- If continuing immediately after the AVL commit, start `P10-M2` on a fresh branch:
  - recommended branch: `feat/p10-m2-heap`

## 2026-04-07 (P10 planning baseline)

### Today Done
- Pushed the validated `P9` closure branch to remote:
  - `origin/feat/p9-m2-sorting-shell-rollout`
  - latest validated closure commit: `d84d9ca feat(p9): close workspace shell acceptance`
- Created the docs planning branch for the next phase:
  - `docs/p10-post-shell-plan`
- Defined the post-`P9` execution order and added `docs/IMPLEMENTATION_PLAN_P10.md`.
- Chose a tree-track expansion sequence that keeps strong continuity with `T-01` / `T-02`:
  - `P10-M1`: `T-03 AVL Tree` (insert + rebalance focus)
  - `P10-M2`: `T-04 Heap` (max-heap fundamentals)
  - `P10-M3`: tree-track acceptance closure
- Synced planning-state docs:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Re-ran the required docs-only gate successfully:
  - `./scripts/check-doc-links.sh`

### Current State
- Branch: `docs/p10-post-shell-plan`
- Validated scope in this planning batch:
  - `docs/IMPLEMENTATION_PLAN_P10.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Milestone state:
  - `P10` planning baseline is now completed locally
  - next priority is `P10-M1` `T-03 AVL Tree`

### Next Step
- Create a fresh implementation branch from this planning baseline:
  - recommended branch: `feat/p10-m1-avl-tree`
- Then implement `T-03 AVL Tree` with:
  - insert-driven balancing
  - LL / LR / RR / RL rotation teaching states
  - deterministic tests and targeted Playwright smoke

## 2026-04-07 (P9-M3 acceptance closure)

### Today Done
- Closed `P9` locally with a full Playwright acceptance refresh for `/modules` + all 15 implemented routes.
- Refreshed local acceptance evidence under `output/playwright/p9m3-*`:
  - screenshots for `/modules` + all implemented routes
  - `output/playwright/p9m3-runtime-smoke.txt`
  - `output/playwright/p9m3-acceptance-report.txt`
- Fixed the final pilot breakout drift that acceptance exposed:
  - `L-01` `/modules/array`
  - `SR-02` `/modules/binary-search`
  - both pages now use `pageClassName="array-page tree-page"` so they match the same full-stage breakout as the other shared-shell pages
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified in Playwright at `1440x1100`:
  - `/modules`: `19` cards, `15` ready badges, `15` open links
  - all `15` implemented routes open without route-level runtime errors
  - default `Next` advances at least one step on all `15` implemented routes
  - all non-tree routes now keep `1416px` page / shell / stage widths
  - representative shell-contract checks pass on `S-01`, `SR-01`, `L-03`, `L-05`, `T-01`, and `T-02`:
    - pinned `Controls` / `Step` buttons stay fixed
    - opened panels drag independently
    - clicking the stage collapses both panels
- Updated project guidance so new sessions read the active work branch from `docs/SESSION_BRIEF.md` instead of a stale hardcoded branch in `AGENTS.md`

### Current State
- Branch: `feat/p9-m2-sorting-shell-rollout`
- Validated scope in this closure batch:
  - `src/pages/modules/ArrayPage.tsx`
  - `src/pages/modules/BinarySearchPage.tsx`
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/IMPLEMENTATION_PLAN_P9.md`
  - `TODO.md`
  - `output/playwright/p9m3-*`
- Milestone state:
  - `P9` workspace-shell unification is now completed locally
  - next priority is a post-`P9` planning baseline before new implementation work

### Next Step
- Create one focused commit for the validated `P9-M3` closure:
  - final breakout follow-up on `L-01` / `SR-02`
  - `p9m3` acceptance evidence
  - docs sync
- Keep unrelated dirty items out of the closure commit (`scripts/*`, design artifacts, legacy screenshots, launcher helper).
- If the user wants remote backup / CI visibility next, push after the closure commit.

## 2026-04-06 (P9-M2 search + linear shell rollout)

### Today Done
- Continued `P9-M2` after sorting batches 1-2 and migrated the remaining implemented non-tree routes to shared `WorkspaceShell`:
  - `SR-01` `/modules/linear-search`
  - `L-02` `/modules/dynamic-array`
  - `L-03` `/modules/linked-list`
  - `L-04` `/modules/stack`
  - `L-05` `/modules/queue`
- Standardized these routes onto the same shell contract used by the accepted pilot/tree pages:
  - pinned `Controls` / `Step` edge entrypoints
  - in-stage transport
  - stage-click collapse
  - `tree-page` breakout for full-stage width at large viewports
  - focus-aware panel avoidance where the animation has a clear active region
- Added shared-shell compatibility styling for linear/list stages so stack/queue/dynamic-array/linked-list fill the workspace better instead of sitting inside the old inner frame assumptions.
- Caught and fixed a real runtime behavior regression during smoke:
  - `L-04` was auto-syncing input + resetting on `push/pop` action frames, which skipped visible intermediate steps
  - fixed it so stack input only syncs after the `completed` frame
- Re-ran the required local quality gate successfully after the rollout and fix:
  - `npm run check`
- Re-verified in Playwright at `1440x1100`:
  - `SR-01`, `L-02`, `L-03`, `L-04`, `L-05` page / shell / stage width = `1416px`
  - `SR-01` `Next` advances to `1/7`
  - `L-02` `Next` advances into resize playback (`2/6`, `Migrate value at index 0`)
  - `L-03` `Next` advances to `1/4` with linked-diagram width `1382px`
  - `L-04` `Next` now advances to `1/2` (`Push value 9`) after the reset-timing fix
  - `L-05` circular mode toggle works inside the control drawer, ring stage renders, and `Next` advances to `1/2`

### Current State
- Branch: `feat/p9-m2-sorting-shell-rollout`
- Validated scope in this batch:
  - `src/pages/modules/LinearSearchPage.tsx`
  - `src/pages/modules/DynamicArrayPage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
  - `src/pages/modules/StackPage.tsx`
  - `src/pages/modules/QueuePage.tsx`
  - `src/index.css`
- Milestone state:
  - `P9-M2` unified workspace-shell rollout is now locally complete across all implemented non-tree modules
  - next priority is `P9-M3` cross-module consistency / acceptance refresh

### Next Step
- Create a focused commit for the validated search + linear shell rollout.
- Then continue directly into `P9-M3`:
  - refresh Playwright acceptance artifacts/report for `/modules` + all implemented routes
  - do a final consistency pass across pilot/sorting/search/linear/tree shells
  - sync closure docs once acceptance evidence is complete
- Keep unrelated dirty items out of the rollout commit (`scripts/*`, design artifacts, old Playwright images, launcher helper).

## 2026-04-06 (P9-M2 sorting shell rollout batch 2)

### Today Done
- Continued `P9-M2` from the validated sorting batch 1 baseline and migrated the remaining sorting pages:
  - `S-05` `/modules/quick-sort`
  - `S-06` `/modules/merge-sort`
- Moved both routes from the old page-flow shell (`VisualizationCanvas`, below-stage controls, page-flow pseudocode/legend) to shared `WorkspaceShell` composition:
  - pinned `Controls` / `Step` edge entrypoints
  - in-stage transport
  - stage-click collapse
  - focus-aware panel avoidance
- Preserved the sorting-family teaching semantics while changing only the shell contract:
  - `S-05` kept pivot / hole / active partition group visualization
  - `S-06` kept merge buffer visualization and top-down / bottom-up mode switching
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified in Playwright at `1440x1100`:
  - `S-05` page / shell / stage width = `1416px`
  - `S-06` page / shell / stage width = `1416px`
  - both pages open `Controls` + `Step` panels correctly
  - `S-05` final frame ends at `55/55` with disabled `Play` / `Next`
  - `S-06` control-drawer mode switch updates the stage-meta chip to `Implementation: Bottom-up iterative`
  - `S-06` final frame ends at `85/85` with disabled `Play` / `Next`

### Current State
- Branch: `feat/p9-m2-sorting-shell-rollout`
- Validated scope in this batch:
  - `src/pages/modules/QuickSortPage.tsx`
  - `src/pages/modules/MergeSortPage.tsx`
- Milestone state:
  - sorting family shell rollout is now locally verified through `S-01`~`S-06`
  - `P9-M2` remains in progress; search + linear families are still pending rollout

### Next Step
- Create a focused commit for the validated sorting-shell rollout batch 2.
- Then continue `P9-M2` on the remaining non-tree families:
  - `SR-01`
  - `L-02`, `L-03`, `L-04`, `L-05`
- Keep unrelated dirty items out of the rollout commit (`scripts/*`, design artifacts, old Playwright images, launcher helper).

## 2026-04-06 (P9-M2 sorting shell rollout batch 1)

### Today Done
- Continued `P9-M2` on the dedicated rollout branch and completed the first post-pilot sorting batch migration:
  - `S-02` `/modules/selection-sort`
  - `S-03` `/modules/insertion-sort`
  - `S-04` `/modules/shell-sort`
- Standardized the sorting family shell wiring around the same accepted breakout/shell contract:
  - `pageClassName="bubble-page tree-page"`
  - `shellClassName="workspace-shell-sorting"`
- Moved the three pages off the older page-local canvas structure and onto shared `WorkspaceShell` composition:
  - on-demand `Controls` drawer
  - on-demand `Step` sheet
  - in-stage transport
  - `focusPoint`-driven panel avoidance where applicable
- Fixed rollout follow-up lint blockers from React Compiler manual-memoization preservation on:
  - `src/pages/modules/InsertionSortPage.tsx`
  - `src/pages/modules/ShellSortPage.tsx`
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified the migrated sorting routes in Playwright at `1440x1100`:
  - `S-02` / `S-03` / `S-04` page width = `1416px`
  - shell width = `1416px`
  - stage width = `1416px`
  - `S-02` confirmed pinned controls button + movable drawer behavior (`tabLeft 34 -> 34`, `drawerLeft 34 -> 214`)
  - `S-02` confirmed stage-click collapse closes both open panels
  - final-frame transport state now disables `Play` / `Next` on all three routes:
    - `S-02` `81/81`
    - `S-03` `84/84`
    - `S-04` `114/114`

### Current State
- Branch: `feat/p9-m2-sorting-shell-rollout`
- Validated scope in this batch:
  - `src/index.css`
  - `src/pages/modules/BubbleSortPage.tsx`
  - `src/pages/modules/SelectionSortPage.tsx`
  - `src/pages/modules/InsertionSortPage.tsx`
  - `src/pages/modules/ShellSortPage.tsx`
- Milestone state:
  - `P9-M1` remains closed locally
  - `P9-M2` is in progress, with sorting batch 1 now verified locally

### Next Step
- Create a focused commit for the validated sorting-shell rollout batch 1.
- Then continue `P9-M2` breadth rollout from the same shell contract:
  - `S-05` / `S-06`
  - `SR-01`
  - remaining linear pages
- Keep unrelated dirty items out of the rollout commit (`scripts/*`, design artifacts, old Playwright images, launcher helper).

## 2026-04-06 (S-01 page-width breakout alignment)

### Today Done
- Investigated the final user report that `S-01` still was not using the maximum page width like `T-01`.
- Confirmed the remaining root cause was outside the stage itself:
  - `S-01` page only used `bubble-page`
  - `T-01` uses `tree-page`, which breaks out of the shared `.app-main { max-width: 1200px; }` wrapper on wide screens
- Updated `S-01` page class wiring so it now also uses the tree-shell breakout rule:
  - `pageClassName="bubble-page tree-page"`
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified in Playwright at `1440x1100`:
  - `S-01` page width is now `1416px`
  - shell width is now `1416px`
  - stage width is now `1416px`
  - this now matches the same full-page breakout pattern used by `T-01`

### Current State
- Branch: `feat/p9-m1-workspace-shell-pilots`
- Fix scope:
  - `src/pages/modules/BubbleSortPage.tsx`
- This is a focused layout-consistency follow-up; milestone direction is unchanged.

### Next Step
- Continue rolling the same page-level breakout decision across remaining non-tree modules that should share the `T-01` wide-workspace pattern.

## 2026-04-06 (S-01 inner-canvas removal toward T-01 full-stage)

### Today Done
- Re-checked the user concern that `S-01` still did not feel like `T-01` full-stage even after removing the width clamp.
- Identified the remaining gap:
  - `S-01` still kept a padded `workspace-stage-body` inset
  - the sorting bars still rendered inside their own bordered/background inner frame, which visually looked like a second smaller canvas inside the stage
- Tightened the `S-01` bubble-shell styling again in `src/index.css`:
  - reduced the bubble-stage body inset (`38px 10px 62px`)
  - reduced the sorting-track gap
  - removed the inner bar-frame border/background/radius and let the bars sit directly on the stage background
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified in Playwright against the live local app:
  - `S-01` stage remains `1168x920`
  - stage-content track now spans ~`1146x818`
  - bar area now spans ~`1146x790`
  - the inner framed sub-canvas is gone, so the visual reads much closer to `T-01`'s direct-on-stage layout

### Current State
- Branch: `feat/p9-m1-workspace-shell-pilots`
- Fix scope:
  - `src/index.css`
- This is still a focused shell follow-up; milestone direction is unchanged.

### Next Step
- Continue migrating other non-tree modules away from page-specific inset canvases so the `T-01` workspace language becomes the default shell, not a tree-only exception.

## 2026-04-06 (S-01 full-stage alignment toward T-01)

### Today Done
- Continued the `S-01 Bubble Sort` shell alignment after the follow-up question about why the animation felt much smaller than `T-01`.
- Reworked `S-01` from the temporary centered narrow-track layout back toward the `T-01` full-stage pattern:
  - removed the pilot-only inner width clamp (`72%` / `920px`) on the sorting track
  - restored the shared shell height/padding footprint so the page matches the tree-shell proportions more closely
  - let the bar track and bar container stretch across the available stage width again while keeping sorting-specific slot width control
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified in Playwright against the live local app:
  - `S-01` shell/stage now match the shared workspace size again (`1168x920`)
  - sorting track width increased from the prior narrowed ~`814px` to ~`1134px`
  - bar container now spans the full track and reaches ~`722px` height
  - swap step still renders full-height motion ghosts (`104x642`) instead of thin top strips

### Current State
- Branch: `feat/p9-m1-workspace-shell-pilots`
- Fix scope:
  - `src/index.css`
- This is still a focused workspace-shell follow-up; milestone direction is unchanged.

### Next Step
- Continue the broader `P9-M2` shell unification by removing remaining page-specific inner-track assumptions module by module.

## 2026-04-06 (S-01 shell rebalance + overflow panel drag)

### Today Done
- Refined the `S-01 Bubble Sort` workspace shell after another layout review:
  - narrowed the sorting track so the bar chart reads slimmer left-to-right
  - increased the shell/stage working height so the bars use more vertical space
  - kept the swap-ghost rendering intact while rebalancing the shell proportions
- Extended the shared workspace-shell panel behavior:
  - `Controls` / `Step` drawers can now be dragged beyond the stage card instead of being hard-clamped inside it
  - the edge buttons stay pinned in place while only the open panels move
  - focus-based auto-avoid still works with the expanded movement range
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified in Playwright against the live local app:
  - `S-01` shell height grew to about `976px`
  - sorting track width is now about `814px` inside a `1168px` shell, leaving more breathing room on both sides
  - bar container height is now about `669px`, and the first bar stayed at full-body height (`~647px`) instead of flattening
  - dragging the left/right panels can place them outside the shell while the blue edge tabs remain pinned
  - swap step still renders two full-height motion ghosts (`73x647`) instead of a top-strip artifact

### Current State
- Branch: `feat/p9-m1-workspace-shell-pilots`
- Fix scope:
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/components/WorkspaceShell.tsx`
  - `src/pages/modules/BubbleSortPage.tsx`
  - `src/index.css`
- This is still a focused `P9-M1` follow-up fix; milestone direction is unchanged.

### Next Step
- Create a focused commit for the workspace-shell overflow drag range + `S-01` shell proportion rebalance.
- Then continue the broader `P9-M2` rollout / consistency sweep.

## 2026-04-06 (S-01 sorting stage height follow-up)

### Today Done
- Fixed the post-`P9-M1` `S-01 Bubble Sort` layout regression where the sorting bars collapsed into a very short strip at the top of the stage and left a large blank area underneath.
- Adjusted the shared workspace-shell sorting layout in `src/index.css` so pilot sorting tracks stretch to the full available stage height and keep the index row pinned below the bars.
- Tuned the shared sorting-stage height so the bars no longer over-expand vertically after the first stretch fix.
- Fixed `S-01` swap ghost geometry in `src/pages/modules/BubbleSortPage.tsx` so the moving bars reuse the real source bar `top/height/width` instead of animating as a tiny strip at the top of the stage.
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified in a real browser against the built app:
  - `S-01` stage height remained ~`808px`
  - sorting track height remained ~`642px`
  - bar container height now stays in a controlled working range instead of collapsing to ~`43px` or over-expanding to the full track
  - swap frames now move full bar bodies instead of only a top `22px` ghost strip

### Current State
- Branch: `feat/p9-m1-workspace-shell-pilots`
- Fix scope:
  - `src/index.css`
  - `src/pages/modules/BubbleSortPage.tsx`
- This is a focused follow-up fix on top of `P9-M1`; milestone direction is unchanged.

### Next Step
- Create a focused bug-fix commit for the shared sorting-stage stretch rule.
- Then continue testing other pilot pages or move on to `P9-M2`.

## 2026-04-06 (P9-M1 workspace-shell pilot completion)

### Today Done
- Completed the `P9-M1` shared workspace-shell foundation locally on the dedicated feature branch.
- Added reusable `WorkspaceShell` and shared stage-first shell styling:
  - pinned `Controls` / `Step` edge entrypoints
  - draggable side panels
  - in-stage transport
  - empty-stage click collapse
  - optional focus-aware panel auto-avoid through `focusPoint`
- Migrated the three planned pilot pages:
  - `S-01` `/modules/bubble-sort`
  - `L-01` `/modules/array`
  - `SR-02` `/modules/binary-search`
- Preserved the accepted tree pages as the interaction reference without forcing pixel-identical layout cloning.
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Captured local Playwright smoke evidence for `/modules`, `T-01`, `T-02`, `S-01`, `L-01`, and `SR-02`:
  - `output/playwright/p9m1-modules-shell.png`
  - `output/playwright/p9m1-t01-shell.png`
  - `output/playwright/p9m1-t02-shell.png`
  - `output/playwright/p9m1-s01-shell.png`
  - `output/playwright/p9m1-l01-shell.png`
  - `output/playwright/p9m1-sr02-shell.png`
  - `output/playwright/p9m1-smoke.txt`
- Cleaned temporary local smoke helpers from the working tree:
  - `output/playwright/p9m1-smoke.mjs`
  - accidental root file `{`

### Current State
- Branch: `feat/p9-m1-workspace-shell-pilots`
- Milestone state: `P9-M1` completed locally; docs synced; quality gate + smoke re-verified; ready for focused commit.
- Scope landed in this milestone:
  - `src/components/WorkspaceShell.tsx`
  - `src/index.css`
  - `src/pages/modules/BubbleSortPage.tsx`
  - `src/pages/modules/ArrayPage.tsx`
  - `src/pages/modules/BinarySearchPage.tsx`
- Existing unrelated dirty items are still present in the repo (`scripts/*`, design artifacts, launcher helper). Keep them out of the `P9-M1` commit.

### Next Step
- Create a focused `P9-M1` commit with only the shared shell, pilot-page migrations, docs sync, and `p9m1` smoke evidence.
- Then start `P9-M2` on a fresh `feat/*` branch (or after merge) for the remaining implemented non-tree modules only.

## 2026-04-06 (manual savepoint after P9 planning baseline)

### Today Done
- Saved a fresh handoff checkpoint after the docs-only `P9` planning baseline branch landed.
- Confirmed the latest planning commit on the current branch:
  - `9b6082f docs(p9): plan workspace shell unification`
- Confirmed the next implementation direction remains unchanged:
  - start `P9-M1` on a fresh `feat/*` branch
  - pilot the unified workspace shell on `S-01`, `L-01`, and `SR-02`
- Confirmed unrelated dirty items are still intentionally outside the planning savepoint:
  - modified helper scripts under `scripts/`
  - untracked design/output artifacts
  - untracked launcher helper

### Current State
- Branch: `docs/p9-workspace-shell-plan`
- Milestone state: `P9` planning baseline committed; implementation not started.
- Recommended first implementation branch: `feat/p9-m1-workspace-shell-pilots`
- Recommended first execution order:
  - extract minimal shared shell foundation
  - migrate `S-01`
  - migrate `L-01`
  - migrate `SR-02`

### Next Step
- Open a new window/session on `docs/p9-workspace-shell-plan`.
- Read `docs/SESSION_BRIEF.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, and `TODO.md`.
- Then create the pilot implementation branch and start `P9-M1` only.

## 2026-04-06 (P9 workspace-shell planning baseline)

### Today Done
- Chose the next phase after `P8`: prioritize cross-module workspace-shell unification before adding new algorithm modules.
- Added `docs/IMPLEMENTATION_PLAN_P9.md`.
- Defined the `P9` shell contract around the validated `T-01` / `T-02` interaction model:
  - stage-first layout
  - pinned `Controls` / `Step` entries
  - in-stage transport
  - empty-stage click collapse
  - draggable side panels
  - optional algorithm window instead of mandatory pixel-perfect `T-01` cloning
- Structured `P9` into three milestones:
  - `P9-M1` foundation + pilot migrations (`S-01`, `L-01`, `SR-02`)
  - `P9-M2` remaining non-tree rollout
  - `P9-M3` full consistency + acceptance closure
- Re-ran the docs quality gate successfully:
  - `./scripts/check-doc-links.sh`
- Synced planning state docs:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
  - `docs/IMPLEMENTATION_PLAN_P8.md`

### Current State
- Branch: `docs/p9-workspace-shell-plan`
- Current milestone boundary: `P9` planning baseline completed locally; implementation has not started yet.
- `P8` is closed locally on the prior feature line; this branch is docs-only planning sync.
- Existing unrelated dirty items are still present in the repo (`scripts/*`, design artifacts, launcher helper). Keep them out of the planning commit.

### Next Step
- Commit the `P9` planning baseline on this docs branch.
- Then start `P9-M1` on a fresh `feat/*` branch with the pilot-module rollout only.

## 2026-04-06 (P8-M3 acceptance closure)

### Today Done
- Refreshed Playwright acceptance artifacts for `/modules` + all 15 implemented routes under `output/playwright/p8m3-*.png`.
- Added consolidated acceptance evidence:
  - `output/playwright/p8m3-runtime-smoke.txt`
  - `output/playwright/p8m3-acceptance-report.txt`
- Re-verified the tree workspace shell in browser automation:
  - `T-01` controls / step edge buttons stay pinned while the opened panels move
  - `T-02` matches the same pinned-button rule
  - both pages still collapse the opened panels when clicking empty stage space
  - forcing either panel over the current animation focus now triggers auto-avoid on both pages
- Synced milestone closure docs:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Re-ran the required local quality gate successfully:
  - `npm run check`

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Milestone state: `P8-M3` completed locally with acceptance evidence synced.
- Tree track now has a stable two-page workspace shell contract:
  - buttons stay pinned on the edge rail
  - only the opened control/step panels move
  - panel overlap against the active animation focus is resolved automatically
- Unrelated dirty items still exist in the repo (`scripts/*`, design artifacts, launcher helper); do not mix them into the focused `P8-M3` closure commit.

### Next Step
- Create a focused `P8-M3` closure commit with only docs + `p8m3` artifacts.
- Then define the post-`P8` planning boundary before new implementation work starts.

## 2026-04-06 (T-01/T-02 draggable workspace panels + focus avoidance)

### Today Done
- Added reusable stage-anchored panel drag/avoidance hook in `src/hooks/useStageAnchorPanel.ts`.
- Updated `T-01` and `T-02` so the left `Controls` panel and right `Step` panel are both draggable while open.
- Refined the interaction after follow-up feedback so the edge buttons stay pinned in place; only the opened panels move/auto-avoid.
- Kept the existing accepted workspace shell behavior intact:
  - clicking empty animation area still collapses both panels
  - transport clicks still work after panels are moved away
  - `T-01` algorithm window behavior/style was left unchanged
- Added automatic panel avoidance against the current animation focus:
  - `T-01` uses the current traversal node / `enqueueRoot` root focus
  - `T-02` uses the current BST node / successor focus when available
- Adjusted the right-side step-sheet positioning rule from fixed `56px` offset to rail-relative positioning so drag/clamp math matches the real DOM layout.
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified in Playwright against the live local app:
  - `T-01` controls panel can be dragged away from transport
  - `T-01` step panel can be dragged
  - `T-01` panels auto-shift when playback focus moves into their covered region
  - `T-01` clicking empty stage space still collapses both open panels
  - `T-02` controls panel can be dragged
  - `T-02` step panel can be dragged
  - `T-02` clicking empty stage space still collapses both open panels

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Tree workspace shell now supports movable side panels on both implemented tree pages without breaking the accepted stage-first interaction model.
- Relevant code changes are isolated to:
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/BinaryTreeTraversalPage.tsx`
  - `src/pages/modules/BstPage.tsx`
  - `src/index.css`

### Next Step
- If we want to keep polishing this interaction, the next pass should decide whether auto-avoid should also reserve transport space so large drawers do not sit over the bottom playback strip by default.
- After that, resume the planned `P8-M3` closure path:
  - verify remaining `T-01` canonical-route parity details if still needed
  - refresh milestone Playwright acceptance artifacts/report
  - sync closure docs when tree-track consistency is considered complete

## 2026-04-06 (T-01 panel dismissal + translucent algorithm window)

### Today Done
- Accepted the current `T-01` production workspace direction after manual review.
- Updated `/modules/binary-tree` so clicking the animation stage now auto-collapses the left `Controls` drawer and right `Step` sheet.
- Prevented the in-stage transport controls from accidentally triggering that collapse behavior.
- Restyled the floating algorithm window to a translucent glass treatment while preserving readable inner cards/chips in both recursive and level-order modes.
- Aligned `T-02 BST` to the same stage-first workspace language as `T-01`:
  - moved config/actions into the left on-demand `Controls` drawer
  - moved runtime detail into the right `Step` sheet
  - moved playback into the in-stage floating transport
- Fixed BST timeline tail semantics:
  - removed extra `operationDone` / `completed` tail frames after the real result step
  - not-found search now ends on the `notFound` step with corrected total-step count
  - final-frame transport now disables `Play` / `Next` instead of allowing no-op clicks
- Removed nonessential below-stage clutter from `T-02`:
  - removed legend block
  - removed highlights text dump
  - removed pseudocode panel
- Narrowed `Delete case` / `Successor` metadata in the `Step` sheet so they only appear during delete flows when relevant.
- Re-ran the required local quality gate successfully:
  - `npm run check`
- Re-verified the key interaction in browser automation:
  - opening `Controls` + `Step`, then clicking the stage collapses both panels
  - computed style confirms the algorithm window now renders with translucent background + blur
  - BST not-found flow now ends at `4/4` with `Status: Completed`, `Outcome: Not found`, and disabled `Next`

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- `T-01` main workspace is now acceptable for the current milestone direction.
- `T-02` now matches the accepted tree workspace direction closely enough for ongoing `P8-M3` consistency work.
- The validated code changes are ready to be isolated as focused commits without mixing the older launcher/design/artifact dirt into the same change set.

### Next Step
- Then finish the remaining `P8-M3` closure work:
  - browser-verify canonical preorder route parity between `/modules/binary-tree` and `/playground/binary-tree-canvas`
  - refresh full `p8m3-*` Playwright acceptance artifacts/report
  - sync closure docs when tree-track consistency is complete

## 2026-03-31 (manual savepoint)

### Today Done
- Saved the current repo state as a handoff-only checkpoint without touching implementation code.
- Re-read the project source-of-truth docs and confirmed the active branch is still `feat/p8-m3-route-rules-spike`.
- Confirmed the current mainline focus is still `P8-M3` tree consistency + acceptance closure.
- Confirmed the Windows helper launcher from the previous session is still uncommitted:
  - `start-project-wsl.bat`
  - current intended behavior remains WSL-native startup through `npm run dev -- --host 0.0.0.0 --port 5173`
- Captured the current working tree inventory for the next session:
  - modified docs/script files: `docs/HANDOFF.md`, `scripts/check-doc-links.sh`, `scripts/playwright-cli.sh`
  - untracked design/artifact folders: `docs/design-prototypes/`, `output/design/`
  - untracked Playwright/tree investigation artifacts under `output/playwright/`
  - untracked launcher file: `start-project-wsl.bat`

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Milestone state: `P8-M3` still in progress
- Repo state is intentionally dirty; do not clean or revert blindly in the next session.
- The most recent implementation focus remains `T-01` tree traversal shell / trace / algorithm-window polish, but the next coding session should first decide how to handle the mixed dirty tree:
  - keep only the files needed for the next P8-M3 task
  - or split launcher/docs work from tree-visualization work before deeper implementation continues

### Next Step
- First inspect the dirty tree and separate “keep for P8-M3” from “artifact/history only”.
- Then resume the planned P8-M3 path:
  - verify `/modules/binary-tree` against `/playground/binary-tree-canvas`
  - align `T-01` / `T-02` controls, legend semantics, and status layout
  - refresh acceptance artifacts and sync closure docs when the tree track is ready
- If the launcher should be kept, commit it as a small isolated helper change instead of mixing it into the next tree-visualization patch.

## 2026-03-30 (Windows one-click WSL launcher)

### Today Done
- Added a repo-root Windows batch launcher `start-project-wsl.bat`.
- The launcher starts the project through WSL-native Node/npm instead of Windows Node so it stays aligned with the repo decision to avoid UNC-path runtime issues.
- The script now:
  - opens the repo at `/home/haoyu/data-structure-algorithm-visualizor`
  - auto-installs dependencies if `node_modules` is missing
  - runs `npm run dev -- --host 0.0.0.0 --port 5173`
  - prints the current WSL IP so Windows can open the reachable URL directly
  - keeps the console open if startup fails so the error is visible

### Current State
- User can now double-click `start-project-wsl.bat` from Windows to start the local dev server for manual testing.
- This is intended for local project startup only; quality gates still remain `npm run check`.

### Next Step
- If needed later, add a second one-click batch file for `npm run check` or Playwright acceptance runs so manual test startup and validation are separated cleanly.

## 2026-03-29 (T-01 single-stage production shell spike)

### Today Done
- Moved the `T-01` production page away from the old stacked-toolbar shell and into a first-pass single-stage layout in `src/pages/modules/BinaryTreeTraversalPage.tsx`.
- Landed the first real-page implementation of the new organization principle:
  - persistent UI reduced to a thin micro header
  - controls moved into a left edge drawer
  - step / sequence / pseudocode / legend moved into a right context sheet
  - playback controls moved into a thin bottom transport strip
  - the tree animation area now expands and contracts based on whether the edge layers are open
- Added new workspace-specific styling in `src/index.css` and minimal i18n copy in `src/i18n/translations.ts`.
- Captured a real rendered browser artifact of the new default state from the production route:
  - `output/playwright/t01-round12-live-default.png`
- Applied the first user-feedback refinement pass directly on the production shell:
  - left control drawer now overlays the stage instead of squeezing the drawing area
  - output sequence and legend moved into the animation area corners
  - duplicate top-level title / step emphasis removed from the shell itself
  - right-side controls collapsed into vertical edge tabs for `步骤 / 伪代码 / 算法窗`
  - shell height tightened so the full tree + transport fit inside one desktop viewport more reliably
- Applied a follow-up sequence cleanup pass:
  - removed the top-left in-stage output-sequence panel entirely
  - removed the explanatory transport hint text
  - bottom transport sequence now renders the full output order instead of truncating to the latest three items
- Applied a stage-embedded meta pass after user feedback:
  - moved traversal mode / current value / tree kind / label mode / status chips out of the shell header
  - embedded those chips directly inside the animation stage at the top-left corner
  - reduced the outer stage top offset so the tree keeps more vertical room after the chip row moved inward
- Applied a header compression pass after user feedback:
  - converted the page title + description area into one horizontal intro row instead of a stacked block
  - reduced the desktop shell height offset so more viewport height is returned to the tree stage
- Applied an adaptive stage occupancy pass after user feedback:
  - let `T-01` break out of the shared `1200px` app-main width on large desktop screens so the workspace can use near-full viewport width
  - expanded node x-placement from the old conservative level formula to a wider edge-aware spread
  - changed the vertical level-step calculation so the last visible node row sits much closer to the bottom of the stage instead of reserving an extra empty row
  - rebalanced the final bottom depth so leaves no longer disappear under the transport strip while still using more bottom space than before
- Applied a follow-up asymmetry pass after user feedback:
  - removed the in-stage legend block entirely
  - shifted the tree layout further right so the left side no longer feels over-compressed by the controls tab
  - pulled the bottom row slightly back up after the stronger right/down expansion so leaf nodes stay readable above the transport bar
- Applied a transport integration pass after user feedback:
  - confirmed the old "bottom plate" was real: the animation surface previously stopped early and reserved a separate bottom band for transport
  - moved the transport into the stage as an overlay instead of letting it occupy its own dedicated shelf
  - expanded the stage surface downward (`bottom: 64px -> 18px`) and softened the transport into a lighter floating strip
  - nudged the tree further right while keeping the lower node row readable above the transport
- Applied a transport breakup pass after user feedback:
  - confirmed the first overlay pass still read like a full-width bottom plate because the transport itself remained a continuous strip
  - split transport into two compact floating groups instead of one full-width band
  - pushed the tree lower again once the transport stopped occupying the entire bottom edge
  - refreshed the browser checkpoint at `output/playwright/t01-round12-live-v14-floating-transport.png`
- Applied a shell-removal pass after user feedback:
  - confirmed the larger frame the user meant was the outer workspace shell rather than the transport overlay
  - expanded `T-01` to a stronger full-width breakout on large screens
  - removed the outer shell's visible border/background/shadow so the only visible main frame is the stage itself
  - stretched the stage to fill the shell bounds instead of keeping a second inset margin inside that outer frame
  - refreshed the browser checkpoint at `output/playwright/t01-round12-live-v15-shell-removed.png`
- Fixed the edge-tab interaction regression after user feedback:
  - reproduced the failure in Playwright against the real `T-01` route
  - confirmed `控制` already opened but `步骤` failed specifically when it matched the default current tab
  - traced the root cause to `handleContextTabSelect` coupling a `showContextSheet` side effect to `setContextTab`'s updater, which could bail out when the next tab equaled the current tab
  - rewrote the handler to compute the open/close intent from current render state first, then update `contextTab` and `showContextSheet` separately
  - re-verified in browser that `控制` drawer, `步骤`, `伪代码`, and `算法图` now all reveal real content
- Applied a side-tab simplification pass after user feedback:
  - removed the `伪代码` edge tab from the production shell entirely
  - kept the right context sheet focused on `步骤` only, while retaining pseudocode inside the floating algorithm window
  - renamed the Chinese algorithm edge label from `算法窗` to `算法`
  - removed the 180-degree rotation on vertical edge tabs and switched to upright vertical text so the Chinese labels are no longer upside down
  - re-verified in Playwright that the visible edge tabs are now `控制 / 步骤 / 算法`, `步骤` still opens its sheet, and `算法` still opens the floating algorithm window
- Applied an algorithm-window trim pass after user feedback:
  - removed the subtitle line under the algorithm window title
  - removed the single-step usage tip block entirely
  - removed the `当前算法阶段` status block entirely
  - removed the recursive `1 / 2 / 3` checkpoint explanation pills entirely
  - replaced the old dynamic code-note summary with a much shorter visit-timing note such as `在首次进入节点时访问。`
  - collapsed each recursion stack item so `深度 N` and `traverse(...)` now sit on the same row
  - re-verified in Playwright that the trimmed window still opens correctly and the stack row now renders as a single flex row once frames exist
- Applied a step-sheet stability pass after user feedback:
  - wrapped the `步骤` context content into a dedicated bottom-aligned copy block
  - moved the full text stack to the lower part of the panel so headline line-wrap changes no longer jitter the top of the sheet
  - fixed the step sheet to a stable viewport-relative height instead of letting it resize on every step
  - enabled internal scrolling on the copy block so future copy growth stays inside the panel rather than changing the shell geometry
  - re-verified in Playwright across multiple playback steps that the sheet top and height now stay constant
- Applied a step-sheet top-anchor pass after user feedback:
  - promoted the `步骤` label out of the variable copy block so it stays pinned to the top edge
  - split the sheet into three stable regions: top label, middle changing copy, bottom metadata
  - kept the panel height fixed while centering the changing explanation text inside the middle region
  - re-verified in Playwright across multiple playback steps that the sheet top, label position, middle copy area, and bottom metadata position all stay constant
- Applied a tree-height safety pass after user feedback:
  - diagnosed that recursive traversal layouts were computing vertical spacing only from real node depth, while `null` hints were rendered one level deeper
  - reserved one extra display level for recursive modes so null children no longer fall outside the stage when the algorithm reaches leaf edges
  - tightened the stage bottom anchor slightly so the final null row stays inside the visible canvas with breathing room
  - re-verified in Playwright that all visible null nodes now stay within the stage bounds
- Applied a wide-tree horizontal spacing pass after user feedback:
  - diagnosed that large complete trees were still using a fixed horizontal span plus hard edge clamps, which collapsed the outermost null children into near-identical x positions
  - replaced the old fixed `56 +/- 54` x formula with a stage-width-aware horizontal inset so node/null positions distribute across the full stage without saturating the left/right clamps
  - threaded the same adaptive x inset through node placement, null placement, guide traces, null-edge hints, and entry-marker geometry so the main tree and overlay layers stay aligned
  - re-verified in Playwright on a 15-node complete tree that all 16 null hints render separately and the outermost child-to-null edges keep visible horizontal spread instead of turning vertical
- Committed the validated wide-tree spacing fix as `a0717f5 fix: rebalance t01 wide-tree spacing`.
- Confirmed workflow direction after user review:
  - the older Windows-side copy is no longer part of the active implementation path
  - keep the WSL repo as the only working source of truth
  - do not migrate the active repo to Windows; keep using WSL-native `node/npm/playwright`
- Captured refreshed browser artifact after the refinement pass:
  - `output/playwright/t01-round12-live-v2-default.png`
  - `output/playwright/t01-round12-live-v3-default.png`
  - `output/playwright/t01-round12-live-v4-stage-meta.png`
  - `output/playwright/t01-round12-live-v5-horizontal-header.png`
  - `output/playwright/t01-round12-live-v9-adaptive-stage-balanced.png`
  - `output/playwright/t01-round12-live-v11-no-legend-fresh-preview.png`
  - `output/playwright/t01-size15-step1-before-fix.png`
  - `output/playwright/t01-size15-step1-after-fix.png`
- Re-ran the full local quality gate successfully after the shell change:
  - `npm run check`

### Current State
- `T-01` is no longer just prototype-only; the new shell idea is now visible in the real page.
- The current implementation defaults to a stage-first view with both edge layers collapsed.
- Edge-tab interactions are working again in the production route:
  - `控制` reveals the left drawer
  - `步骤` reveals the step context sheet even from the default `step` tab
  - the right edge is simplified to `步骤 / 算法`
  - `算法` opens the floating algorithm window
- The algorithm window is now visibly leaner:
  - header subtitle / tip / status block / checkpoint pills are all removed
  - the code panel keeps only a concise visit-timing note
  - recursion stack entries now use a denser single-row layout
- The `步骤` panel is now stable across step changes:
  - the `步骤` label is pinned at the top
  - changing explanation copy lives in a dedicated middle area
  - the panel height stays fixed while the playback advances
- Recursive tree layouts now reserve room for null-child hints, so leaf-expansion steps stay inside the stage.
- Wide complete-tree layouts now keep the outermost null children distinct and visible, and the leaf-to-null edges no longer collapse into near-vertical lines at the stage boundaries.
- Latest validated code checkpoint is commit `a0717f5` on branch `feat/p8-m3-route-rules-spike`.
- WSL is the active runtime path; treat any older Windows-side copy as out-of-band history unless a future session explicitly needs read-only comparison.
- The first browser artifact shows the intended priority shift is working, but this is still a spike-quality pass:
  - control tab affordance likely needs another refinement pass
  - the in-stage meta / legend density may need one more spacing pass after more user review
  - mobile/tablet fallback for the new overlay-first shell still needs a dedicated pass
- `T-02` has not been migrated to the same shell yet.

### Next Step
- Review the real `T-01` screenshot with the user and decide whether the new shell principle is correct before polishing details.
- If the direction is accepted, next implementation tasks are:
  - refine the collapsed/expanded affordance of the left control drawer
  - refine the right context sheet density and decide whether one tab should stay visible by default
  - align `T-02` to the same stage-first shell after `T-01` stabilizes
- If a later session resumes the unfinished trace bug thread, revisit the preorder outer-leaf red-arc direction mismatch separately from the now-committed wide-tree spacing fix.

## 2026-03-28 (T-01 module workspace handoff before Codex restart)

### Today Done
- Continued `T-01` module workspace design exploration without touching production page code.
- Added prototype rounds through `round8`, focusing on alternative component patterns for the top control area and the in-canvas playback area.
- Added `round9` convergence prototype for the recommended `T-01` main workspace direction:
  - slim hybrid top toolbar
  - lighter glass-rail visual treatment
  - in-canvas transport strip
  - right-side narrow inspector
  - floating algorithm window kept as a separate depth layer
- Repaired the mixed Windows/WSL frontend runtime environment:
  - added direct `nvm` loading to `/home/haoyu/.profile` so `wsl bash -lc` resolves WSL-native `node/npm/npx`
  - reinstalled repo dependencies with WSL-native `npm ci`
  - verified `playwright` import now resolves correctly in WSL
  - verified headless Firefox launch works in WSL
  - verified `docs/design-prototypes/render-t01-workspace-round9.mjs` now renders successfully in WSL
  - re-ran `npm run check` successfully in WSL-native environment
- Current explored component directions include:
  - `command bar + scrubber`
  - `accordion summary + stepper`
  - `tool tabs + transport`
- Installed the official curated Codex skills locally so the next session can use built-in frontend / figma / playwright workflows instead of relying only on ad-hoc tool orchestration.
- Added `round10` as a deliberate reset instead of another refinement pass. This version abandons the previous "toolbar-first workspace shell" and explores a more editorial teaching-board composition:
  - left-side director rail instead of a traditional top-heavy control stack
  - oversized poster-like traversal stage with stronger typography and negative space
  - right-side dossier / annotation column instead of a generic inspector card stack
  - tape-style bottom transport and sequence strip
  - warm print-editorial palette rather than glassy app chrome
- Added `round11` as a compact-control pass on top of the editorial direction:
  - shrank the left column from a full "director rail" into a narrow control strip
  - replaced multi-panel grouping with dropdowns plus compact segmented pills
  - removed category-heavy visual treatment so the stage regains priority
  - kept the editorial stage / dossier structure intact while reducing chrome cost
- Added `round12` as a structural reset inspired by the "animation first, everything else on demand" principle:
  - abandoned permanent three-column layout in favor of one large stage
  - reduced the persistent top area to a micro header only
  - moved controls into a left edge drawer instead of a reserved layout column
  - moved explanation / sequence / legend into a right context sheet instead of a permanent inspector
  - kept the bottom transport as a thin edge strip so the canvas remains dominant

### Current State
- Design work is still in the prototype comparison phase; no final component pattern has been locked yet.
- `round9` is the first convergence prototype rather than another branch exploration. It visualizes the recommended combined direction (`round6` structure + lighter `glass` treatment).
- `round10` is the first intentionally non-derivative concept. It should be treated as a fresh visual-language candidate rather than an iteration of the earlier workspace shell.
- `round11` is the first usability correction to that new language. It keeps the editorial composition but responds to the critique that the left controls were visually overbuilt for low-text actions.
- `round12` is the first concept that fully pivots away from the three-region shell. It should be evaluated as a new product-layout principle, not as a skin variation.
- Repo execution environment is now healthy when commands are run through WSL-native Node (`/home/haoyu/.nvm/versions/node/v24.14.0/bin/node`).
- Historical issue confirmed: running Windows `node/npm` directly against the `\\wsl$\\...` workspace caused broken package resolution and `.sh` execution friction; avoid that path going forward.
- The new workspace shell has not been implemented in the production `T-01` page yet.
- Prototype artifacts are stored under:
  - `docs/design-prototypes/`
  - `output/design/`
- New prototype source:
  - `docs/design-prototypes/t01-workspace-round9.html`
  - `docs/design-prototypes/render-t01-workspace-round9.mjs`
  - `docs/design-prototypes/t01-workspace-round9-wireframe.svg`
  - `docs/design-prototypes/t01-workspace-round10.html`
  - `docs/design-prototypes/render-t01-workspace-round10.mjs`
  - `docs/design-prototypes/t01-workspace-round11.html`
  - `docs/design-prototypes/render-t01-workspace-round11.mjs`
  - `docs/design-prototypes/t01-workspace-round12.html`
  - `docs/design-prototypes/render-t01-workspace-round12.mjs`
- Generated visual artifact:
  - `output/design/t01-workspace-round9-glass-hybrid-teaching-desk-wireframe.png`
  - `output/design/t01-workspace-round9-glass-hybrid-teaching-desk.png`
  - `output/design/t01-workspace-round10-algorithm-editorial-board.png`
  - `output/design/t01-workspace-round11-compact-editorial-board.png`
  - `output/design/t01-workspace-round12-single-stage-edge-drawers.png`

### Environment Note
- Newly installed curated Codex skills require a Codex restart before they become available in a new session.
- The most relevant newly installed skills for the next session are expected to be:
  - `frontend-skill`
  - `figma`
  - `figma-use`
  - `figma-generate-design`
  - `figma-implement-design`
  - `playwright`
  - `playwright-interactive`
  - `screenshot`

### Next Step
- After restart, first verify that the newly installed skills are visible in the session.
- Then compare `round9` against the reset `round10` concept and explicitly choose whether `T-01` should stay as a compact app workspace or pivot into a more editorial teaching-board experience.
- The newest decision point is now whether `round12` should replace the earlier shell-based directions as the main convergence candidate.
- If `round12` is favored, the next concrete design decisions are:
  - whether the left edge drawer should default closed and only peek via a vertical tab
  - whether the right context sheet should hold only one panel at a time or support stacked mini cards
  - whether the output sequence should live in the right sheet by default and only echo briefly in the bottom transport

## 2026-03-27 (T-01 module workspace design prototype round 8)

### Today Done
- Added round 8 as a true component-pattern exploration instead of another visual skin pass.
- New interaction/component options:
  - `M. Command Bar + Scrubber`: command-style top bar with a search/command field and a timeline scrubber playback control
  - `N. Accordion Summary + Stepper`: summary chips plus expandable config groups and an algorithm stepper instead of a media player
  - `O. Tool Tabs + Transport`: tabbed top tool area with a compact transport strip at the bottom
- All three keep the same canvas/right-inspector structure so feedback can focus purely on which components fit the product best.

### Current State
- Prototype source: `docs/design-prototypes/t01-workspace-round8.html`
- Render script: `docs/design-prototypes/render-t01-workspace-round8.mjs`
- Next step: render/share the three component variants, pick one structural direction, then fold that choice back into the approved compact workspace shell.

## 2026-03-27 (T-01 module workspace design prototype round 7)

### Today Done
- Added round 7 style explorations specifically for the visual language of the top control area and in-canvas playback controls.
- New options:
  - `J. Glass Rail`: airy translucent toolbar plus minimal glass transport strip
  - `K. Studio Tabs`: tabbed lecture/workbench toolbar plus compact studio-style transport
  - `L. Control Console`: darker technical console controls with a small instrument-panel transport
- Information architecture stays unchanged across all three options so feedback can focus only on visual treatment rather than layout differences.

### Current State
- Prototype source: `docs/design-prototypes/t01-workspace-round7.html`
- Render script: `docs/design-prototypes/render-t01-workspace-round7.mjs`
- Next step: render/share the three styles, let the user pick the preferred visual language, then merge that style back into the chosen compact layout direction.

## 2026-03-27 (T-01 module workspace design prototype round 6)

### Today Done
- Added round 6 prototype to keep the round 5 hybrid interaction model while reducing the vertical footprint of both the top toolbar and the in-canvas playback dock.
- Toolbar changes:
  - title row compressed into a single slim line
  - hybrid control row keeps dropdowns for low-frequency options and segmented buttons for high-frequency teaching actions, but with smaller paddings and tighter spacing
- Playback changes:
  - replaced the chunkier floating dock with a slimmer pill-style transport strip using smaller icon buttons

### Current State
- Prototype source: `docs/design-prototypes/t01-workspace-round6.html`
- Render script: `docs/design-prototypes/render-t01-workspace-round6.mjs`
- Next step: render/share the slim variant, then decide whether to accept it directly or do one more pass to merge status chips into the toolbar.

## 2026-03-27 (T-01 module workspace design prototype round 5)

### Today Done
- Added a focused round 5 prototype for the preferred hybrid control-bar direction.
- `H. Hybrid Toolbar` keeps low-frequency configuration (`树形态`, `样例`) as dropdowns while preserving high-frequency teaching actions (`遍历`, `显示`, `速度`) as visible segmented buttons.
- This round intentionally keeps the round 3/4 stage, in-canvas playback controls, and right-side inspector unchanged so only the top control pattern is being evaluated.

### Current State
- Prototype source: `docs/design-prototypes/t01-workspace-round5.html`
- Render script: `docs/design-prototypes/render-t01-workspace-round5.mjs`
- Next step: render/share the hybrid screenshot, collect approval or one more compactness pass, then move into real `T-01` implementation.

## 2026-03-27 (T-01 module workspace design prototype round 4)

### Today Done
- Added round 4 prototype comparisons focused only on tightening the top control area of the new module workspace shell.
- New options:
  - `F. Compact Segmented Rack`: keeps button visibility but compresses tree/sample/traversal/display/speed into a denser segmented toolbar.
  - `G. Select-Style Toolbar`: converts the same controls into dropdown-style selectors for a calmer, more product-like top bar.
- Canvas-first layout, in-canvas player controls, and narrow right-side inspector stay unchanged from round 3 so feedback stays isolated to the control-bar pattern.

### Current State
- Prototype source: `docs/design-prototypes/t01-workspace-round4.html`
- Render script: `docs/design-prototypes/render-t01-workspace-round4.mjs`
- Next step: render both variants, compare with the user, and carry the chosen top-control pattern into the real `T-01` page shell.

## 2026-03-26 (T-01 module workspace design prototype round 2)

### Today Done
- Added non-production design prototypes for the next `T-01` module workspace direction:
  - round 1 explored three information-architecture options under `docs/design-prototypes/t01-workspace-round1.html`
  - round 2 narrowed toward an immersive stage-first layout under `docs/design-prototypes/t01-workspace-round2.html`
  - exported PNG artifacts to `output/design/` for review and iteration
- Current preferred direction after user feedback:
  - maximize the traversal canvas
  - compress non-essential controls into a thin top ribbon
  - move playback controls into the canvas as music-player-style icon buttons for a tighter teaching workspace

### Verified locally
- Playwright-based local prototype rendering completed through an isolated Windows temp clone (used only for rendering because the UNC workspace still lacks a directly importable `playwright` package/runtime path)
- Exported current review artifacts:
  - `output/design/t01-workspace-round1-a-command-deck.png`
  - `output/design/t01-workspace-round1-b-studio-ribbon.png`
  - `output/design/t01-workspace-round1-c-teaching-desk.png`
  - `output/design/t01-workspace-round2-d-immersive-canvas.png`

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: design prototype files and exported review PNGs are local-only; legacy script mode changes still remain in the working tree
- Remote: unchanged

## 2026-03-23 (P8-M3 T-01 level-order root arc clearance tweak)

### Today Done
- Refined the early `T-01` level-order threading geometry around the root node:
  - the root-to-direct-child transition now uses a larger outer root pivot radius instead of hugging the root shell
  - the top entry line now ends on that same outer pivot radius, so the follow-up root connector truly renders as a visible arc instead of seeming to continue as a hidden straight segment
  - the root-to-left-child route now follows the outer upper-left offset lane, so it no longer visually overlaps the tree edge
  - sparse-tree root-to-right-child transitions reuse the same outer-lane strategy on the right side for consistency

### Verified locally
- `node node_modules/typescript/lib/tsc.js -b` pass (2026-03-23)
- `node node_modules/eslint/bin/eslint.js src/pages/modules/BinaryTreeTraversalPage.tsx` pass (2026-03-23)
- `./scripts/check-doc-links.sh` pass (2026-03-23)
- script-level regression confirms the root-to-left segment now resolves to:
  - arc end / line start `46.28, 19.86` (moved further left/up from the old shell-hugging point)
  - line end `35.15, 31.88` (lifted away from the root-left tree edge)
- `npm run check` remains blocked by the same Windows UNC wrapper issue (`C:\\Windows\\package.json`)

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: latest level-order root-arc tweak is local-only; legacy script mode changes still remain in the working tree
- Remote: `origin/feat/p8-m3-route-rules-spike` unchanged; latest fix not pushed yet

## 2026-03-23 (P8-M3 T-01 level-order child-enqueue stage highlight)

### Today Done
- Refined the `T-01` level-order visit-step teaching feedback:
  - extracted a shared helper for “nodes newly enqueued in this step” so queue chips and main-stage highlights now derive from the same source
  - when visiting a node enqueues child nodes, those children now receive a stage-side green queue-style pulse instead of blending into the untouched tree
  - newly enqueued child nodes now show a small `New` badge on the main stage, matching the queue window semantics more directly

### Verified locally
- `node node_modules/typescript/lib/tsc.js -b` pass (2026-03-23)
- `node node_modules/eslint/bin/eslint.js src/pages/modules/BinaryTreeTraversalPage.tsx src/index.css` pass for the TSX file; CSS remains ignored by the current ESLint config (warning only)
- script-level regression confirms the shared helper reports:
  - `enqueueRoot -> [0]`
  - first root visit -> `[1, 2]`
  - next left-subtree visit -> `[3, 4]`
  - leaf visit -> `[]`
- `npm run check` remains blocked by the same Windows UNC wrapper issue (`C:\\Windows\\package.json`)

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: latest child-enqueue highlight is local-only; legacy script mode changes still remain in the working tree
- Remote: `origin/feat/p8-m3-route-rules-spike` unchanged; latest fix not pushed yet

## 2026-03-23 (P8-M3 T-01 floating algorithm window max-size unlock)

### Today Done
- Removed the remaining hardcoded max-size clamp on the `T-01` floating algorithm window:
  - popup width/height are no longer capped at `560x760`
  - resize now only stops at the viewport-safe margin bounds, so the user can enlarge the panel close to full-screen if needed

### Verified locally
- `node node_modules/typescript/lib/tsc.js -b` pass (2026-03-23)
- script-level regression confirms an aggressive south-east resize now reaches `1248x688` at `1280x720`, anchored to `x=16`, `y=16`
- `npm run check` remains blocked by the same Windows UNC wrapper issue (`C:\\Windows\\package.json`)

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: latest max-size unlock is local-only; legacy script mode changes still remain in the working tree
- Remote: `origin/feat/p8-m3-route-rules-spike` unchanged; latest fix not pushed yet

## 2026-03-23 (P8-M3 T-01 algorithm window edge-resize + enqueue sync)

### Today Done
- Fixed the remaining `T-01` level-order/floating-window regressions on `feat/p8-m3-route-rules-spike`:
  - edge/corner resizing now still enlarges the floating algorithm window when it begins flush against the right/bottom viewport boundary
  - default popup placement leaves a small right-side breathing room after reset, reducing the “cursor changes but size does not move” confusion
  - resize hit zones and the bottom-right handle are slightly larger for more reliable mouse interaction
  - level-order `enqueueRoot` now renders the root-entry trace immediately instead of waiting until the first dequeue/visit step
  - the just-enqueued root now receives the stage-side `bar-new-node` emphasis during the enqueue step, so queue updates and main-stage feedback stay in sync

### Verified locally
- `node node_modules/typescript/lib/tsc.js -b` pass (2026-03-23)
- `node node_modules/eslint/bin/eslint.js src/pages/modules/BinaryTreeTraversalPage.tsx src/index.css` pass for the TSX file; CSS remains ignored by the current ESLint config (warning only)
- `npm run check` attempted again, but the Windows `npm` wrapper still falls back to `C:\\Windows` under the UNC workspace and errors before entering the repo (`ENOENT: C:\\Windows\\package.json`)
- script-level regression check (TypeScript transpile hook + direct helper invocation) confirms:
  - east-edge resize grows `440 -> 540` while shifting `x: 824 -> 724` when the popup starts贴右边界
  - south-east resize grows `440x560 -> 520x640` while shifting inward to stay in-viewport
  - level-order `enqueueRoot` now emits one active `levelorder-entry` trace segment targeting root `#0` before the first visit step
- Attempted browser-side validation again, but local Vite startup is still blocked in this Windows/UNC environment by missing optional Rollup native packages (`@rollup/rollup-win32-x64-msvc`); WSL also lacks a local `node` runtime, so this round relies on `tsc` + targeted script regression instead of live Playwright

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: latest resize + enqueue-sync fixes landed locally; legacy script mode changes still remain in the working tree
- Remote: `origin/feat/p8-m3-route-rules-spike` unchanged; latest fix not pushed yet

### Remaining Focus (Next Session)
- Continue `P8-M3` consistency/acceptance closure:
  - re-run browser-side Playwright acceptance once the local Vite/Rollup environment is runnable again
  - align `T-01` / `T-02` controls, legend semantics, and status layout
  - refresh `/modules` + implemented-route acceptance artifacts/report
  - sync closure docs after acceptance refresh

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p8-m3-route-rules-spike
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-23 (P8-M3 T-01 level-order algorithm window + queue view)

### Today Done
- Fixed `T-01` level-order mode on `feat/p8-m3-route-rules-spike`:
  - null-child nodes/edges and the null legend are now hidden in level-order mode
  - level-order trace now threads only through real nodes in BFS order instead of reusing the recursion-oriented null-aware route presentation
  - the floating panel is now positioned as a generic algorithm window rather than recursion-only wording
- Added level-order teaching content to the floating window:
  - level-order mode can now open the floating algorithm window correctly
  - window content switches to queue-state playback + queue-specific pseudocode for level-order mode
  - stepping the timeline now updates both the current dequeued node and the remaining queue inside the floating window
  - queue presentation is now split into current dequeued node / action summary / single-row waiting queue, so the active node no longer blends into the remaining queue chips
  - newly enqueued child nodes are now highlighted directly inside the waiting queue lane
  - level-order mode now stacks the pseudocode card above the queue card so the waiting queue can use the full popup width
  - level-order reset/initial state now keeps the queue empty until the root-enqueue step actually begins
- Expanded floating-window resize affordances:
  - the algorithm window now supports dragging from edges and corners, not just the bottom-right grip
  - top/left resizing keeps the opposite edge visually anchored instead of drifting the full popup
- Verified locally:
  - `./scripts/check-doc-links.sh` pass (2026-03-23)
  - `eslint` pass via direct node entry (2026-03-23)
  - `tsc -b` pass via direct node entry (2026-03-23)
  - Playwright browser check confirms level-order mode shows `0` `.tree-null-node` elements and `0` null-legend items
  - Playwright browser check confirms the algorithm window opens in level-order mode and the queue panel updates after one `Next` step (`89#0` current, queue becomes `90#1`, `61#2`)
  - Playwright browser check confirms the waiting queue stays single-row (`flex-wrap: nowrap`) and newly enqueued nodes receive the `New` badge after stepping
  - Playwright browser check confirms reset/initial level-order state now shows `0` waiting-queue chips, plus pending-root copy instead of a completed-traversal message
  - Playwright browser check confirms the first `Next` step only enqueues the root node (`#0`) before any dequeue/visit step runs
  - Playwright browser check confirms the floating algorithm window can now resize from the left edge, top edge, and bottom-left corner while keeping the opposite edge anchored as expected
  - Attempted `npm run check` / direct `vitest` re-run from Windows Node, but the mixed WSL/Windows dependency tree is still missing `@rollup/rollup-win32-x64-msvc`; `eslint` re-run also remains flaky on mapped-drive reads, so the new follow-up validation relies on `tsc` + doc-link check + browser interaction instead

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: level-order code/docs updates in progress; legacy script mode changes still present in working tree
- Remote: `origin/feat/p8-m3-route-rules-spike` unchanged; latest level-order work not committed yet

### Remaining Focus (Next Session)
- Continue `P8-M3` consistency/acceptance closure:
  - get user feedback on the new level-order threading trace aesthetics
  - align `T-01` / `T-02` controls, legend semantics, and status layout
  - refresh `/modules` + implemented-route acceptance artifacts/report
  - sync closure docs after acceptance refresh

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p8-m3-route-rules-spike
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-23 (P8-M3 T-01 floating recursion panel)

### Today Done
- Replaced the docked `T-01` recursion layout with a floating recursion panel on `feat/p8-m3-route-rules-spike`:
  - recursion panel no longer shrinks the traversal canvas
  - panel is draggable by the header bar and resizable from the bottom-right corner
  - panel layout is internally scrollable and remembers its last window position/size via local storage
- Updated `T-01` recursion copy to match the floating-window interaction:
  - toggle text now uses open/hide recursion panel wording
  - recursion title now reads as a panel/window instead of an inline side-by-side view
  - added an in-panel tip recommending single-step playback for easier recursion/animation comparison
- Verified locally:
  - `npm run check` pass (2026-03-23)
  - Playwright browser check confirms the traversal canvas width stays `1146px` before/after opening the panel at `1280x720`
  - Playwright browser check confirms the recursion panel can be dragged and resized (`440x560 -> 510x585` during the verification flow)
  - Playwright browser check confirms the new recursion tip is visible inside the floating panel

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: new floating-panel code/docs updates in progress; legacy script mode changes still present in working tree
- Remote: `origin/feat/p8-m3-route-rules-spike` unchanged; latest floating-panel work not committed yet

### Remaining Focus (Next Session)
- Continue `P8-M3` consistency/acceptance closure:
  - align `T-01` / `T-02` controls, legend semantics, and status layout
  - refresh `/modules` + implemented-route acceptance artifacts/report
  - sync closure docs after acceptance refresh
- Optionally add panel snap presets only if real usage shows the free-form floating window still needs guidance.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p8-m3-route-rules-spike
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-22 (P8-M3 T-01 arrow-anchor + route-order checkpoint)

### Today Done
- Refined `T-01 Binary Tree Traversal` trace rendering on `feat/p8-m3-route-rules-spike`:
  - active trace arrowheads now follow terminal straight travel segments instead of composite path endpoints
  - route-order overlay now labels arrow-capable straight travel segments instead of mixed arc/path fragments
  - added white halo strokes to traversal/page canvas arrows so arrowheads stay readable over dashed paths
- Updated `T-01` recursive teaching panel:
  - recursive pseudocode now switches to mode-specific preorder / inorder / postorder lines, with no generic `if preorder/inorder/postorder` branches
  - recursion panel now sits beside the traversal canvas on wider viewports and stacks responsively on narrower ones, keeping recursion and animation in the same reading area
- Verified locally:
  - `npm run check` pass (2026-03-22)
  - Playwright browser check confirms `.tree-stage-recursion-main` and `.tree-stage-recursion-side` stay same-row and fully visible at `1280x720`
  - live recursion code list in browser now reads `traverse(node) / visit(node) / traverse(node.left) / traverse(node.right)` for preorder mode
- Migrated canonical preorder route rules from playground into formal `T-01` page:
  - extracted shared helper `src/modules/tree/preorderTraceRules.ts`
  - formal preorder trace builder now uses absolute left/right lanes and fixed data/null/root local rules
  - null return path is fixed to canonical CCW turn + right-lane return instead of dynamic sweep selection

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: code/docs updates in progress; legacy script mode changes still present in working tree
- Remote: `origin/feat/p8-m3-route-rules-spike` unchanged; latest work not committed yet

### Remaining Focus (Next Session)
- Visually verify `/modules/binary-tree` now matches `/playground/binary-tree-canvas` canonical preorder route in browser (no screenshots unless explicitly requested).
- Continue `P8-M3` consistency/acceptance closure:
  - align `T-01` / `T-02` controls, legend semantics, and status layout
  - refresh `/modules` + implemented-route acceptance artifacts/report
  - sync closure docs after acceptance refresh

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p8-m3-route-rules-spike
npm run dev -- --host 127.0.0.1 --port 5173
```
## 2026-03-10 (P8-M3 trace playback + entry-marker semantics checkpoint)

### Today Done
- Finalized binary-tree-canvas route playback behavior on `feat/p8-m3-route-rules-spike`:
  - route now renders progressively from root-top entry; future segments are hidden
  - completed segments keep dashed style and line-end arrowheads
  - moving front cursor now uses the same small-arrow geometry as line-end arrows
- Added node entry-direction markers for real nodes:
  - `1`: enter from up edge
  - `2`: enter from left-down edge
  - `3`: enter from right-down edge
  - marker visibility is progress-driven (`revealLength`) and appears in drawing order
- Verified locally:
  - `npm run check` pass (2026-03-10)
  - browser DOM checks confirm marker counts increase during playback and converge to full set at completion
- Pushed implementation commits:
  - `0712e4d` route-rules + progressive playback baseline
  - `8289c51` entry-marker progressive reveal

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: clean after push (docs sync pending commit if updated further)
- Remote: `origin/feat/p8-m3-route-rules-spike` up to date with latest commits

### Remaining Focus (Next Session)
- Integrate confirmed spike outcomes into the module mainline branch (`feat/p8-m2-bst`) via controlled cherry-pick/merge.
- Continue `T-01` visual polish backlog:
  - improve arrowhead clarity under dashed styling
  - align route-order numbering with canonical preorder order

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p8-m2-bst
git -C /home/haoyu/data-structure-algorithm-visualizor cherry-pick 0712e4d 8289c51
npm run check
```

## 2026-03-09 (P8-M3 tree visual polish checkpoint)

### Today Done
- Continued `T-01 Binary Tree Traversal` visual/interaction polish on branch `feat/p8-m2-bst`:
  - preorder guide-step merge refinement landed (arrival + D/L/R role exposure in one step)
  - added traversal output sequence panel (live update while stepping/playing)
  - added node-value display mode toggle (`number` / `letter`) and synchronized it across node labels + status line + output sequence
  - adjusted traversal trace style to thinner dashed stroke
  - corrected root-top supplemental route geometry: root-entry arc now targets the intended left-route endpoint; terminal marker at root-right exit endpoint added
  - added route-order label overlay (`1..N`) directly on guide segments for sequence debugging
- User discussion record (correct route / correct sequence):
  - current route-order labels are acknowledged as incorrect for the intended canonical preorder route
  - agreement reached that single-tree sample ordering cannot reliably generalize without an explicit numbering rule
  - next implementation should follow either (a) user-provided mapping for current tree, or (b) a formalized rule that can generalize to arbitrary binary trees
- Workflow update requested by user:
  - unless explicitly requested, do not take screenshots and do not perform image-based analysis
  - cleaned all image files under `output/` in current working tree
- Captured local UI artifact:
  - `output/playwright/p8m3-t01-traversal-sequence-letter.png`
- Local quality gate verified:
  - `npm run check` (pass, 2026-03-09)
- Route-rule generalization checkpoint (branch `feat/p8-m3-route-rules-spike`):
  - replaced sample-specific hardcoded trace assembly (`trace-step1..step20`) in `BinaryTreeCanvasPlaygroundPage` with recursive rule-driven generation
  - preserved existing visual contract: dashed trace + arrowheads only on line-segment endpoints
  - validated in real browser (no screenshots) across multiple level-order trees (`null`, single-node, sparse-left, sparse-right, larger mixed tree):
    - trace continuity breaks: `0`
    - `arrowCount === lineCount` for all tested inputs
  - documented reusable canonical rules for cross-module adoption:
    - `docs/modules/T-01-preorder-trace-rules.md`
- Trace playback rendering checkpoint:
  - implemented progressive trace drawing from root-top entry to terminal point on `binary-tree-canvas` (no full-route pre-display)
  - restored dashed-segment style and line-end arrowheads for completed segments during playback
  - replaced front cursor glyph with the same small arrow geometry used by route line-end markers

### Current State
- Branch: `feat/p8-m3-route-rules-spike`
- Working tree status: code + docs updates in progress, pending commit
- Known issues to carry forward:
  - latest dashed-trace styling degraded arrowhead visibility in `T-01` (needs visual fix)
  - current route-order labels do not match user-confirmed canonical traversal order yet

### Remaining Focus (Next Session)
- Continue `T-01` trace visual polish:
  - restore clear arrowhead rendering on traversal trace
  - iterate dashed style toward a cleaner hand-drawn look
  - evaluate whether introducing a small hand-drawn animation library is worthwhile for this module
- Continue `P8-M3` consistency/acceptance closure after trace style stabilizes.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p8-m2-bst
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-08 (P8-M2 T-02 BST closure)

### Today Done
- Delivered `T-02 Binary Search Tree (BST)` end-to-end:
  - step generator (`src/modules/tree/bst.ts`)
  - timeline adapter (`src/modules/tree/bstTimelineAdapter.ts`)
  - module page (`src/pages/modules/BstPage.tsx`)
  - route wiring (`/modules/bst`) + registry status update (`T-02` implemented)
- Added deterministic tests:
  - `src/modules/tree/bst.test.ts`
  - `src/modules/tree/bstTimelineReplay.test.ts`
- Added zh/en localized copy and tree-stage visual states for BST:
  - operation labels (`searchPath`/`insert`/`delete`)
  - explicit delete-case semantics (`leaf`/`oneChild`/`twoChildren`)
  - successor/current markers and new-node/path legend
- Captured local Playwright smoke evidence:
  - `output/playwright/p8m2-modules-tree-filter.png`
  - `output/playwright/p8m2-t02-bst-smoke.png`
- Re-verified local quality gate: `npm run check` (pass, 2026-03-08).

### Current State
- Branch: `feat/p8-m2-bst`
- Working tree status: code + docs updates in progress (P8-M2 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-08)

### Remaining Focus (Next Session)
- Commit and merge current `P8-M2` branch.
- Start `P8-M3` tree consistency + acceptance closure.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p8-m2-bst
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-08 (P8-M1 tree onboarding + T-01 closure)

### Today Done
- Implemented tree-track onboarding in discovery and metadata:
  - extended module category to include `tree`
  - added `/modules` tree filter + i18n labels
  - registered `T-01`~`T-06` (`T-01` implemented, `T-02`~`T-06` pending)
- Delivered `T-01 Binary Tree Traversal` end-to-end:
  - step generator (`src/modules/tree/binaryTreeTraversal.ts`)
  - timeline adapter (`src/modules/tree/binaryTreeTraversalTimelineAdapter.ts`)
  - module page (`src/pages/modules/BinaryTreeTraversalPage.tsx`)
  - route wiring (`/modules/binary-tree`)
- Added deterministic tests:
  - `src/modules/tree/binaryTreeTraversal.test.ts`
  - `src/modules/tree/binaryTreeTraversalTimelineReplay.test.ts`
- Captured local Playwright smoke evidence:
  - `output/playwright/p8m1-modules-tree-filter.png`
  - `output/playwright/p8m1-t01-binary-tree-smoke.png`
- Re-verified local quality gate: `npm run check` (pass, 2026-03-08).

### Current State
- Branch: `feat/p8-m1-tree-onboarding`
- Working tree status: code + docs updates in progress (P8-M1 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-08)

### Remaining Focus (Next Session)
- Commit and merge current `P8-M1` branch.
- Start `P8-M2` implementation (`T-02 BST`).

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p8-m1-tree-onboarding
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-08 (P8 planning baseline defined)

### Today Done
- Added concrete P8 execution plan `docs/IMPLEMENTATION_PLAN_P8.md` with three milestones:
  - `P8-M1` tree onboarding + `T-01 Binary Tree Traversal`
  - `P8-M2` `T-02 BST`
  - `P8-M3` tree-track consistency + acceptance closure
- Expanded plan details from methodology to executable task lists:
  - explicit target files, routes, tests, DoD, and acceptance criteria per milestone
- Synced planning state docs (`SESSION_BRIEF`, `TODO`, `DECISIONS`).

### Current State
- Branch: `docs/p8-baseline`
- Working tree status: docs planning sync in progress
- Last verified command: `./scripts/check-doc-links.sh` (pass, 2026-03-08)

### Remaining Focus (Next Session)
- Merge `docs/p8-baseline` into `main`.
- Start implementation branch `feat/p8-m1-tree-onboarding` and execute `P8-M1`.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch docs/p8-baseline
./scripts/check-doc-links.sh
```

## 2026-03-08 (P7-M3 sorting consistency + acceptance closure)

### Today Done
- Closed `P7-M3` consistency/acceptance scope:
  - completed cross-module sorting consistency sweep (`S-01`~`S-06`)
  - refined `S-06` merge buffer pointer visual by removing standalone `W` label to reduce algorithm-meaning ambiguity
- Refreshed full Playwright acceptance evidence for current implemented scope:
  - `/modules` discovery screenshot: `output/playwright/p7m3-modules.png`
  - implemented-module screenshots: `output/playwright/p7m3-*.png`
  - consolidated report: `output/playwright/p7m3-acceptance-report.txt`
  - detailed smoke log: `output/playwright/p7m3-runtime-smoke.txt`
- Synced P7 closure docs state (`SESSION_BRIEF`/`TODO`/`DECISIONS`).

### Current State
- Branch: `feat/p7-m2-merge-sort`
- Working tree status: code + docs + acceptance artifact updates in progress (P7 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-08)

### Remaining Focus (Next Session)
- Merge current P7 branch into `main`.
- Start P8 planning baseline and document executable milestone boundaries.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p7-m2-merge-sort
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-08 (P7-M2 S-06 merge-sort closure)

### Today Done
- Implemented `S-06 Merge Sort` module end-to-end:
  - step generator (`mergeSort.ts`)
  - timeline adapter (`mergeTimelineAdapter.ts`)
  - module page (`MergeSortPage.tsx`)
  - route registration (`/modules/merge-sort`) and registry mark as implemented
- Added zh/en localized copy for merge-sort split/merge steps, pointer metadata, buffer labels, and pseudocode.
- Added merge-sort visual styles for active range, left/right half hints, and temporary buffer row with write pointer.
- Added deterministic tests:
  - merge-sort step generation tests
  - merge-sort timeline replay test (`seek/speed/resume`)
- Passed full local quality gate (`npm run check`).
- Captured local Playwright smoke evidence for `/modules -> S-06 -> play/pause/next/reset` at `output/playwright/p7m2-s06-merge-sort-smoke.png`.

### Current State
- Branch: `feat/p7-m2-merge-sort`
- Working tree status: code + docs + acceptance artifact updates in progress (P7-M2 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-08)

### Remaining Focus (Next Session)
- Start P7-M3 sorting consistency/acceptance closure:
  - align `S-01`~`S-06` interaction semantics
  - refresh Playwright acceptance artifacts/report for all implemented modules
  - sync P7 closure docs

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p7-m2-merge-sort
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-08 (P7-M1 S-05 quick-sort closure)

### Today Done
- Implemented `S-05 Quick Sort` module end-to-end:
  - step generator (`quickSort.ts`)
  - timeline adapter (`quickTimelineAdapter.ts`)
  - module page (`QuickSortPage.tsx`)
  - route registration (`/modules/quick-sort`) and registry mark as implemented
- Added zh/en localized copy for quick-sort step descriptions, partition/pivot metadata, legend, and pseudocode.
- Added quick-sort visual styles for active partition range, pivot marker, and `i/j` pointer hints.
- Added deterministic tests:
  - quick-sort step generation tests
  - quick-sort timeline replay test (`seek/speed/resume`)
- Passed full local quality gate (`npm run check`).
- Captured local Playwright smoke evidence for `/modules -> S-05 -> play/pause/next/reset` at `output/playwright/p7m1-s05-quick-sort-smoke.png`.

### Current State
- Branch: `feat/p7-m1-quick-sort`
- Working tree status: code + docs + acceptance artifact updates in progress (P7-M1 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-08)

### Remaining Focus (Next Session)
- Commit and merge `P7-M1` (`S-05 Quick Sort`) into `main`, then start `P7-M2` (`S-06 Merge Sort`).

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p7-m1-quick-sort
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-08 (P6-M3 closure + P7 planning baseline)

### Today Done
- Completed `P6-M3` discovery/acceptance closure:
  - validated `/modules` discovery consistency (11 cards, filter counts: sorting=4 / linear=5 / search=2)
  - refreshed Playwright artifacts for `/modules` + all implemented module routes under `output/playwright/p6m3-*.png`
  - added consolidated acceptance report `output/playwright/p6m3-acceptance-report.txt`
- Landed sorting replay guardrail tests for temp/hole choreography:
  - `src/modules/sorting/insertionTimelineReplay.test.ts`
  - `src/modules/sorting/shellTimelineReplay.test.ts`
- Synced milestone docs and closed P6:
  - updated `SESSION_BRIEF`, `TODO`, `DECISIONS`
- Defined P7 planning baseline:
  - added `docs/IMPLEMENTATION_PLAN_P7.md`
  - synced P7 next-priority state in `SESSION_BRIEF` and `TODO`

### Current State
- Branch: `main`
- Working tree status: code + docs + acceptance artifact updates in progress (P6 closure + P7 baseline sync)
- Last verified command: `npm run check` (pass, 2026-03-08)

### Remaining Focus (Next Session)
- Start P7-M1 (`S-05 Quick Sort`):
  - implement step generator + timeline adapter + page/route/registry wiring
  - follow `S-01`~`S-04` interaction conventions (highlight/move/sorted/index)
  - add deterministic step/replay tests and zh/en copy

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch main
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-07 (P6-M2 S-04 shell-sort closure)

### Today Done
- Implemented `S-04 Shell Sort` module end-to-end:
  - step generator (`shellSort.ts`)
  - timeline adapter (`shellTimelineAdapter.ts`)
  - module page (`ShellSortPage.tsx`)
  - route registration (`/modules/shell-sort`) and registry mark as implemented
- Added zh/en localized copy for shell-sort step descriptions, gap metadata, and pseudocode.
- Added deterministic tests:
  - shell-sort step generation tests
  - shell-sort timeline replay test (`seek/speed/resume`)
- Passed full local quality gate (`npm run check`).
- Captured local Playwright walkthrough evidence for `/modules -> S-04 -> play/pause/next/reset` at `output/playwright/p6m2-shell-sort.png`.

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs + local acceptance artifact updates in progress (P6-M2 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-07)

### Remaining Focus (Next Session)
- Start P6-M3:
  - refresh `/modules` discovery/acceptance consistency after `SR-01`/`S-04`
  - refresh Playwright artifacts/report across all implemented modules
  - sync final P6 closure docs

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P6-M1 SR-01 linear-search closure)

### Today Done
- Implemented `SR-01 Linear Search` module end-to-end:
  - step generator (`linearSearch.ts`)
  - timeline adapter (`linearSearchTimelineAdapter.ts`)
  - module page (`LinearSearchPage.tsx`)
  - route registration (`/modules/linear-search`) and registry mark as implemented
- Added linear-search input/config validation and JSON import/export support with schema checks.
- Added deterministic tests:
  - linear-search step generation tests
  - linear-search timeline replay test (`seek/speed/resume`)
  - linear-search page-utils JSON/validation deterministic round-trip tests
- Passed full local quality gate (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P6-M1 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Start P6-M2: `S-04 Shell Sort` module with gap-based timeline playback and deterministic tests.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P6 planning baseline closed)

### Today Done
- Added `docs/IMPLEMENTATION_PLAN_P6.md` with three executable milestones:
  - P6-M1 `SR-01 Linear Search`
  - P6-M2 `S-04 Shell Sort`
  - P6-M3 discovery/acceptance closure refresh
- Synced milestone planning state across `SESSION_BRIEF`, `DECISIONS`, and `TODO`.

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: docs planning sync in progress
- Last verified command: `./scripts/check-doc-links.sh` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Start P6-M1 implementation (`SR-01 Linear Search`) with timeline + JSON parity + deterministic tests.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P5-M3 acceptance closure + P5 closed)

### Today Done
- Completed P5-M3 acceptance refresh across all implemented modules (`S-01`/`S-02`/`S-03`/`SR-02`/`L-01`/`L-02`/`L-03`/`L-04`/`L-05`):
  - generated Playwright screenshots under `output/playwright/p5m3-*.png`
  - generated consolidated acceptance report `output/playwright/p5m3-acceptance-report.txt`
- Synced milestone docs and closed P5.

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: docs + acceptance artifacts updates in progress (P5 closure sync)
- Last verified command: `./scripts/check-doc-links.sh` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Start P6 planning baseline and define next executable milestone sequence.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P5-M2 SR-02 binary-search closure)

### Today Done
- Implemented `SR-02 Binary Search` module end-to-end:
  - step generator (`binarySearch.ts`)
  - timeline adapter (`binarySearchTimelineAdapter.ts`)
  - module page (`BinarySearchPage.tsx`)
  - route registration (`/modules/binary-search`) and registry mark as implemented
- Added binary-search input/config validation and JSON import/export support with schema checks.
- Added deterministic tests:
  - binary-search step generation tests
  - binary-search timeline replay test (`seek/speed/resume`)
  - binary-search page-utils JSON/validation deterministic round-trip tests
- Expanded `/modules` category filter support with `search` category label/path behavior.
- Passed full local quality gate (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P5-M2 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Execute P5-M3 closure:
  - refresh Playwright acceptance artifacts across all implemented modules (including S-03/SR-02)
  - finalize docs sync and close P5 milestone

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P5-M1 S-03 insertion-sort closure)

### Today Done
- Implemented `S-03 Insertion Sort` module end-to-end:
  - step generator (`insertionSort.ts`)
  - timeline adapter (`insertionTimelineAdapter.ts`)
  - module page (`InsertionSortPage.tsx`)
  - route registration (`/modules/insertion-sort`) and registry mark as implemented
- Added deterministic tests:
  - insertion-sort step generation tests
  - insertion-sort timeline replay test (`seek/speed/resume`)
- Added zh/en localized copy for S-03 step descriptions and pseudocode.
- Passed full local quality gate (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P5-M1 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Start P5-M2: `SR-02 Binary Search` module with pointer visualization, validation, and JSON import/export parity.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P5 planning baseline closed)

### Today Done
- Defined and recorded P5 execution baseline in `docs/IMPLEMENTATION_PLAN_P5.md`:
  - P5-M1 `S-03 Insertion Sort`
  - P5-M2 `SR-02 Binary Search`
  - P5-M3 discovery/acceptance refresh for search-track expansion
- Synced milestone tracking state in `SESSION_BRIEF`, `DECISIONS`, and `TODO`.
- Re-verified docs quality gate (`./scripts/check-doc-links.sh` pass).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: docs planning sync in progress
- Last verified command: `./scripts/check-doc-links.sh` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Start P5-M1 implementation (`S-03 Insertion Sort`) with deterministic step/replay tests and route/registry updates.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P4-M3 acceptance closure + P4 closed)

### Today Done
- Completed final P4-M3 acceptance refresh across all implemented modules:
  - generated Playwright screenshots for `S-01`/`S-02`/`L-01`/`L-02`/`L-03`/`L-04`/`L-05` under `output/playwright/p4m3-*.png`
  - generated consolidated acceptance report `output/playwright/p4m3-acceptance-report.txt`
- Closed one remaining UX semantics gap in `L-02 Dynamic Array`:
  - switched capacity-full hint from validation-error style (`form-error`) to status-warning style (`dynamic-array-capacity-full`)
  - avoided acceptance false positives while preserving visual emphasis
- Re-verified full local quality gate after patch (`npm run check` pass, 2026-03-06).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + acceptance artifacts + docs sync in progress
- Last verified command: `npm run check` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Start P5 planning baseline:
  - define milestone order and acceptance boundaries for next module/UX tranche
  - sync planning state across `SESSION_BRIEF`, `DECISIONS`, and `TODO`

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P4-M3 consistency pass in progress)

### Today Done
- Landed first P4-M3 cross-module UX consistency pass:
  - aligned `S-01`/`S-02` playback step/status display and button disable behavior with linear-module conventions
  - stabilized status/info block layout in `L-03` and `L-05` to reduce interaction-time layout jitter
- Hardened queue runtime interaction path:
  - prevented app-level crash on circular queue full enqueue progression (`completed -> next`)
  - changed queue timeline build path to safe error handling with page-level feedback
  - adjusted circular queue ring pointer positioning (`F` outer, `R` inner toward ring center)
- Unified value-input workflow for insertion-style operations:
  - auto-randomize value on operation switch to insert/push/enqueue paths
  - auto-randomize value after each completed progression for `L-01`/`L-02`/`L-03(insertAt)`/`L-04`/`L-05`
- Re-verified local quality gate repeatedly after each patch (`npm run check` pass).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: docs updates in progress (P4-M3 progress sync)
- Last verified command: `npm run check` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Complete P4-M3 acceptance refresh:
  - final manual walkthrough across implemented modules
  - refresh acceptance evidence and close remaining edge-case UX gaps
- If browser tooling remains unavailable, record Playwright blocker explicitly and attach alternative manual evidence.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-06 (P4-M2 L-02 dynamic-array closure)

### Today Done
- Implemented `L-02 Dynamic Array` module end-to-end:
  - resize-aware step generator (`append` with boundary-triggered resize + migration)
  - timeline adapter and dynamic-array page visualization
  - route registration (`/modules/dynamic-array`) and registry mark as implemented
- Added dynamic-array input/config validation and JSON import/export support with schema checks.
- Added deterministic tests:
  - dynamic-array step generation tests
  - dynamic-array timeline replay test (`seek/speed/resume`)
  - dynamic-array JSON round-trip deterministic test
- Passed full local quality gate (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P4-M2 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-06)

### Remaining Focus (Next Session)
- Start P4-M3: module UX consistency sweep and Playwright acceptance refresh across implemented modules.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P4-M1 L-05 queue closure)

### Today Done
- Implemented `L-05 Queue` module end-to-end:
  - step generator (`enqueue` / `dequeue` / `front`)
  - timeline adapter and queue page visualization
  - route registration (`/modules/queue`) and registry mark as implemented
- Added queue input/config validation and JSON import/export support with schema checks.
- Added deterministic tests:
  - queue step generation tests
  - queue timeline replay test (`seek/speed/resume`)
  - queue JSON round-trip deterministic test
- Passed full local quality gate (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P4-M1 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Start P4-M2: `L-02 Dynamic Array` module with resize visualization and deterministic replay.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P4 planning baseline)

### Today Done
- Declared P3 closed and opened P4 planning baseline.
- Added `docs/IMPLEMENTATION_PLAN_P4.md` with three executable milestones:
  - P4-M1 `L-05 Queue`
  - P4-M2 `L-02 Dynamic Array`
  - P4-M3 module-level UX/acceptance polish
- Synced milestone state across `SESSION_BRIEF`, `DECISIONS`, and `TODO`.

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: docs updates in progress (P4 planning sync)
- Last verified command: pending (`./scripts/check-doc-links.sh`)

### Remaining Focus (Next Session)
- Start P4-M1 implementation (`L-05 Queue`) with timeline + JSON parity.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (optional playbackStore cleanup closure)

### Today Done
- Simplified `src/store/playbackStore.ts` to module metadata role only:
  - kept `currentModule`
  - kept `setCurrentModule`
  - removed legacy playback/timeline fields from the store
- Re-verified full local quality gate (`npm run check`) after refactor.

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (optional cleanup closure sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Define and start P4 scope from backlog (next module batch or UX polish tranche).

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P3-M3 L-04 stack closure)

### Today Done
- Implemented `L-04 Stack` module end-to-end:
  - step generator (`push` / `pop` / `peek`)
  - timeline adapter and stack page visualization
  - route registration (`/modules/stack`) and registry mark as implemented
- Added stack input/config validation and JSON import/export support with schema checks.
- Added deterministic tests:
  - stack step generation tests
  - stack timeline replay test (`seek/speed/resume`)
  - stack JSON round-trip deterministic test
- Passed full local quality gate (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P3-M3 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Enter P4 planning and prioritize next module batch.
- Optional cleanup: reduce `playbackStore` to module metadata role only.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P3-M2 S-02 selection sort closure)

### Today Done
- Implemented new sorting module `S-02 Selection Sort`:
  - step generator (`selectionSort.ts`)
  - timeline adapter (`selectionTimelineAdapter.ts`)
  - module page (`SelectionSortPage.tsx`)
  - route registration (`/modules/selection-sort`)
- Added test coverage:
  - deterministic step-generation tests
  - deterministic timeline replay test (`seek/speed/resume`)
- Added zh/en localized copy for S-02 step descriptions and pseudocode.
- Marked `S-02` as implemented in module registry so `/modules` discovery can open it directly.
- Passed full local quality gate (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P3-M2 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Start P3-M3: `L-04 Stack` module (`push`/`pop`/`peek`) with timeline playback and JSON import/export parity.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P3-M1 modules discovery closure)

### Today Done
- Upgraded `/modules` from placeholder to practical discovery page:
  - category filters (`all`, `linear`, `sort`)
  - module cards with difficulty/status metadata
  - safe actions for implemented routes and disabled "coming soon" for pending modules
- Expanded module registry with planned-but-unimplemented items for discovery continuity.
- Added utility tests for module filtering and difficulty formatting.
- Completed local quality gate with passing result (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P3-M1 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Start P3-M2 implementation: `S-02 Selection Sort` module.
- Reuse shared timeline engine and existing sorting UX conventions from S-01.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P3 planning baseline)

### Today Done
- Confirmed P2 is fully closed (timeline engine unification + JSON import/export parity for L-01/L-03).
- Added `docs/IMPLEMENTATION_PLAN_P3.md` with executable milestones:
  - P3-M1 modules page discovery upgrade
  - P3-M2 new sorting module `S-02`
  - P3-M3 new linear module `L-04` stack
- Updated `TODO.md` with P3 actionable backlog and acceptance criteria.

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: docs planning sync in progress
- Last verified command: `./scripts/check-doc-links.sh` (pass)

### Remaining Focus (Next Session)
- Start P3-M1 implementation on current branch or a dedicated `feat/p3-modules-page` branch.
- Keep route-level behavior stable while introducing discovery/filter UX.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P2-M3 L-03 JSON parity closure)

### Today Done
- Added L-03 JSON dataset import/export workflow in Linked List page:
  - export current config (`list` + `operation`) to JSON editor
  - import JSON back into controls with playback/layout reset
- Added JSON validation for L-03:
  - parse error handling
  - schema shape validation for operation variants (`find` / `insertAt` / `deleteAt`)
  - reuse of existing linked-list input/index/value validation rules
- Added deterministic round-trip regression test for L-03 (`export -> import -> replay`).
- Passed full local quality gate (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: docs sync in progress (P2-M3 full closure update)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Enter next milestone planning (P3) and prioritize new scope.
- Optional tech-debt cleanup: reduce `playbackStore` responsibilities to module metadata only.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P2-M3 L-01 JSON import/export closure)

### Today Done
- Added L-01 JSON dataset import/export workflow in Array page:
  - export current dataset config to JSON editor
  - import JSON back into input controls with playback reset
- Added JSON validation layers:
  - parse error handling
  - schema shape validation (`array`, `index`, `value`)
  - existing insert config validation reuse (capacity/index/value rules)
- Added deterministic round-trip test:
  - `export -> import -> replay` produces identical step sequence for fixed input
- Passed full local quality gate (`npm run check`).
- Added local ignore rules for session/runtime artifacts:
  - `.playwright-cli/`
  - `AGENTS.md`

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: docs + ignore sync updates in progress (P2-M3 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Decide next scope:
  - Option A: extend JSON import/export to L-03 for parity
  - Option B: enter next milestone planning and backlog refinement

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P2-M2 cross-module migration closure)

### Today Done
- Migrated L-01 and L-03 playback control to shared timeline engine hook:
  - `src/pages/modules/ArrayPage.tsx`
  - `src/pages/modules/LinkedListPage.tsx`
- Removed page-level store/tick interval loops from both pages and switched to reducer-driven engine controls (`setTotalFrames`, `next`, `prev`, `play`, `pause`, `reset`).
- Re-verified S-01 on the same engine path (already migrated in P2-M1).
- Completed local quality gate with passing result (`npm run check`).
- Ran playwright-based cross-module smoke regression on local dev server:
  - `/modules/bubble-sort`
  - `/modules/array`
  - `/modules/linked-list`
  - artifacts: `output/playwright/bubble-sort-p2m2.png`, `output/playwright/array-p2m2.png`, `output/playwright/linked-list-p2m2.png`

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P2-M2 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Start P2-M3 JSON import/export (L-01 first) with schema validation and deterministic round-trip behavior.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P2-M1 timeline engine closure)

### Today Done
- Added reusable timeline player hook `src/engine/timeline/useTimelinePlayer.ts` (reducer-driven state/actions + interval tick while `playing`).
- Migrated S-01 page to the shared timeline engine path:
  - `src/pages/modules/BubbleSortPage.tsx` now uses `useTimelinePlayer`.
  - Removed direct dependency on `playbackStore` and `advancePlaybackTick` in S-01.
- Added deterministic replay regression test:
  - `src/modules/sorting/bubbleTimelineReplay.test.ts`
  - Validates stable frame sequence under seek/speed/resume for fixed input.
- Ran full local quality gate with passing result (`npm run check`).

### Current State
- Branch: `feat/p2-timeline-engine`
- Working tree status: code + docs updates in progress (P2-M1 closure sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Start P2-M2: migrate L-01 and L-03 playback logic to shared timeline engine path.
- Keep existing UX behavior unchanged while replacing store-driven tick loops.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/p2-timeline-engine
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-05 (P2 planning kickoff)

### Today Done
- Completed PR-ready summary for P1 closure (interaction model, visualization standardization, validation/UX).
- Pushed latest branch updates to remote `feat/l03-v1`.
- Drafted P2 execution plan in `docs/IMPLEMENTATION_PLAN_P2.md`.
- Refined P2 backlog into executable milestones in `TODO.md`:
  - P2-M1 timeline engine core (S-01 first)
  - P2-M2 cross-module playback migration (L-01/L-03)
  - P2-M3 JSON import/export (L-01 first)

### Current State
- Branch: `feat/l03-v1`
- Working tree status: docs updates in progress (P2 planning sync)
- Last verified command: `npm run check` (pass, 2026-03-05)

### Remaining Focus (Next Session)
- Start P2-M1 implementation on a dedicated `feat/*` branch.
- Land timeline contracts + S-01 migration + deterministic replay tests.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch -c feat/p2-timeline-engine
npm run check
```

## 2026-03-05 (L-03 interaction/animation stabilization savepoint)

### Today Done
- Refined L-03 interaction flow to be playback-first (no explicit apply button).
- Fixed multiple linked-list rendering issues across delete/insert/find:
  - find result feedback now explicit (matched index / not-found range)
  - delete visual semantics split from insert semantics
  - horizontal-scroll arrow alignment and visibility issues resolved
  - operation-switch jitter and delete-tail jitter addressed
- Added continuity behavior for consecutive operations.
- Updated step behavior:
  - logic step display starts at 0
  - insert/delete trailing display-only frames auto-advance (no extra manual clicks)
- Improved invalid-input UX:
  - keep last valid diagram visible
  - disable playback controls while input is invalid
- Re-ran local gate multiple times with passing result (`npm run check`).
- Added L-03 regression-focused unit tests for:
  - input/config validation paths
  - find-result completed-state semantics
  - logical step index continuity for insert/delete visual tail frames
- Refactored linked-list page pure helper logic into reusable/testable utility module.
- Completed playwright-assisted manual walkthrough on local dev server:
  - invalid input keeps last valid diagram and disables playback controls
  - insert/delete trailing display-only frames auto-advance with continuity
  - find result feedback confirms matched index and not-found index range
- Refined L-01 semantics and UX based on manual testing feedback:
  - logic step display starts from 0 and tracks algorithm steps
  - removed non-essential visual-only insertion steps
  - fixed end-of-round state sync for continuous multi-round operations
  - switched to fixed-capacity array memory model (20 cells + explicit length/capacity)
  - added insert target downward pointer marker and corrected shift-tail color semantics
- Introduced shared large-canvas container (`VisualizationCanvas`) and migrated:
  - L-01 array page
  - L-03 linked-list page
- Completed S-01 migration to shared large-canvas container, finishing cross-module stage structure unification.
- Updated translations/styles for stage subtitles and capacity-related feedback.
- Re-ran local quality gate with passing result (`npm run check`).
- Completed playwright automated cross-module regression baseline on local dev server:
  - routes covered: `/modules/bubble-sort`, `/modules/array`, `/modules/linked-list`
  - artifacts captured: `output/playwright/bubble-sort-full.png`, `output/playwright/array-full.png`, `output/playwright/linked-list-full.png`
  - observed horizontal overflow: expected in array cells container (`.array-cells`), no additional unexpected page-level overflow detected
- Re-ran full local quality gate with passing result (`npm run check`).

### Current State
- Branch: `feat/l03-v1`
- Working tree status: local changes in progress (L-03 regression utility + tests + doc sync)
- Last verified command: `npm run check` (pass)

### Remaining Focus (Next Session)
- Prepare PR-ready summary grouped by:
  - interaction model changes
  - visualization/canvas standardization
  - validation and UX improvements
- Do one final manual sanity pass against the latest local build before PR.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/l03-v1
npm run dev -- --host 127.0.0.1 --port 5173
```

## 2026-03-03 (L-03 animation savepoint, pending 2 bugs)

### Today Done
- Completed major L-03 UI/animation refinement on `feat/l03-v1`:
  - split-node visual + HEAD pointer semantics
  - staged insert animation flow refinement
  - improved arrow sync during movement/reset
  - insert index input switched to "before index" semantics (1-based in UI)

### Current State
- Branch: `feat/l03-v1`
- Working tree status: expected clean after savepoint commit
- Quality gate: `npm run check` passed

### Remaining Issues (confirmed by manual test)
- Bug 1: after `find` finishes, UI should explicitly show the matched result index (or not-found feedback with index context).
- Bug 2: `delete` behavior is incorrect in UI flow; user-observed behavior currently resembles insert flow and needs dedicated deletion playback verification/fix.

### First Step Next Session
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch feat/l03-v1
```

### Next 3 Tasks
- Add explicit find-result output (matched index / not found) in linked-list page status area.
- Re-test and fix delete playback data flow + rendering path so it is fully distinct from insert.
- Run `npm run check` and commit focused bugfix patch.

## 2026-03-03 (L-01 milestone closed)

### Today Done
- Completed L-01 array module v1 on `feat/l01-v1`.
- Added array insert step generator and tests (deterministic, final state, tail insert, out-of-range guard, explicit empty-slot behavior).
- Reworked L-01 playback to make insertion process explicit: append empty slot, shift with visible hole movement, prepare insert, then insert.
- Added zh/en localized copy and UI polish for L-01 interaction and visualization.
- Passed local quality gate and pushed branch updates (`npm run check`).

### Current State
- Branch: `feat/l01-v1`
- Working tree status: expected clean after final push
- Milestone status: L-01 v1 closed and pushed

### Blockers / Risks
- No blocker for entering L-03.
- Risk: L-03 should follow existing playback conventions to avoid introducing a separate animation model.

### First Step Tomorrow
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch -c feat/l03-v1
```

### Next 3 Tasks
- Start L-03 linked list v1 with one core operation (insert first).
- Reuse playback store + timeline controls from S-01/L-01.
- Keep `npm run check` green before every push.

## 2026-03-03 (S-01 milestone closed)

### Today Done
- Completed M0 scaffold (Vite + React + TypeScript + route shell).
- Completed M1 foundations (types, module registry, playback store).
- Completed M2 first vertical slice for S-01 (bubble sort steps, playback, bars/highlights, speed/data-size controls, zh/en UI text).
- Completed M3 quality gates (`npm run check`, unit tests, CI workflow).

### Current State
- Branch: `feat/m0-scaffold`
- Working tree status: clean
- Milestone status: S-01 + M3 closed and pushed

### Blockers / Risks
- No blocker for entering L-01.
- Risk: L-01 implementation should reuse existing playback patterns to avoid divergent architecture.

### First Step Tomorrow
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch -c feat/l01-v1
```

### Next 3 Tasks
- Start L-01 v1 implementation (array operation steps + playback).
- Reuse current store/playback infrastructure from S-01.
- Keep passing `npm run check` before each push.

## 2026-03-03 (Pre-code readiness)

### Today Done
- Added pre-code readiness docs: `PRE_CODE_CHECKLIST.md`, `IMPLEMENTATION_PLAN_V1.md`.
- Frozen V1 scope and recorded it in `DECISIONS.md`.
- Upgraded `TODO.md` to `P0/P1/P2` with DoD and acceptance criteria.
- Completed Go/No-Go checklist for entering `feat/m0-scaffold`.

### Current State
- Branch: `docs/pre-code-readiness`
- Working tree status: docs updates in progress
- Next milestone: start coding on `feat/m0-scaffold`

### Blockers / Risks
- No blockers on planning side.
- Risk: implementation may diverge from routing/state docs if M0 scope is exceeded.

### First Step Tomorrow
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor switch -c feat/m0-scaffold
```

### Next 3 Tasks
- Initialize frontend scaffold (Vite + React + TypeScript).
- Register P0 routes and placeholder pages.
- Add baseline lint/test scripts and run local checks.

## 2026-03-03

### Today Done
- Initialized project documentation baseline.
- Configured GitHub SSH authentication for reliable push from WSL.

### Current State
- Branch: `main`
- Working tree status: clean
- Last verified command: `git push --dry-run` (success)

### Blockers / Risks
- No active blockers.

### First Step Tomorrow
```bash
git -C /home/haoyu/data-structure-algorithm-visualizor pull
```

### Next 3 Tasks
- Create initial scaffold for frontend app.
- Define first visualized data structure module scope.
- Set up lint/test scripts.

## 2026-08-08 (L-04 stack layout polish)

### Today Done
- Kept the L-04 sequential-vs-linked stack comparison layout, and polished the full-stack pointer behavior.
- Updated L-04 so the sequential stack uses `top -> null` when full, and right-side pointers render as `arrow + label`.
- Tuned `src/index.css` for L-04 to lower the stack visuals slightly, keep the two lanes more centered, and lift the stack controls drawer a bit to reduce overlap with the stack top area.

### Current State
- Verified local tests: `npm test -- src/pages/modules/stackPageUtils.test.ts src/pages/modules/stackComparisonUtils.test.ts src/modules/linear/stackOps.test.ts`
- Verified local checks: `npm run lint`, `npm run build`
- `npm run check` is still blocked on Windows because `./scripts/check-doc-links.sh` is a Unix shell script in this workspace

### Next Step
- Re-open `/modules/stack` and do one more manual pass on the L-04 control-tab overlap near the left lane heading if that visual still feels too tight.

## 2026-08-09 (L-01~L-04 control/step panel split follow-up)

### Today Done
- Reworked L-01 ~ L-04 so the step panel is now pseudocode-focused instead of repeating the same short status fields.
- Moved the compact runtime summaries into the controls panel for L-01, L-02, L-03, and L-04, and widened those controls drawers to better use page width.
- Changed the linear step panels to auto-height so they no longer reserve a large blank block below the pseudocode.
- Split L-04 pseudocode into two side-by-side blocks: one for the sequential stack, one for the linked stack, with separate highlight mapping.

### Current State
- Verified unit tests: `npm test -- src/pages/modules/arrayPageUtils.test.ts src/pages/modules/dynamicArrayPageUtils.test.ts src/pages/modules/linkedListPageUtils.test.ts src/pages/modules/stackPageUtils.test.ts`
- Verified local checks: `npm run lint`, `npm run build`
- Verified browser layout at `1280x720` on:
  - `/modules/array`
  - `/modules/dynamic-array`
  - `/modules/linked-list`
  - `/modules/stack`
- Browser check result:
  - L-01/L-02/L-03 step panels each render one pseudocode block with `clientHeight === scrollHeight`
  - L-04 step panel renders two pseudocode blocks with `clientHeight === scrollHeight`
  - L-04 controls drawer no longer overflows (`height === scrollHeight`)

### Next Step
- Re-open the four linear modules once more in the real app window and do a subjective visual pass, mainly on whether the widened controls drawer still feels too dominant on smaller laptop screens.

## 2026-08-20 (P15 L-05 queue pointer/full-state cleanup)

### Today Done
- Fixed the linear queue rear-marker rendering so `队尾` now follows the display tail slot instead of the raw insertion index.
- Raised the queue row container and restored top/bottom breathing room so `队头` / `队尾` markers stay visible without inner vertical scrolling.
- Added an explicit full-capacity note in the controls area when the current queue is full, while keeping the full queue snapshot visible for inspection.

### Current State
- Verified targeted tests: `npm test -- src/modules/linear/queueOps.test.ts src/pages/modules/queuePageUtils.test.ts`
- Verified local build: `npm run build`
- `npm run check` remains blocked on Windows because `./scripts/check-doc-links.sh` is a Unix shell script in this workspace

### Next Step
- Refresh `/modules/queue` and visually confirm that:
  - the linear queue shows `队头` above the front cell and `队尾` below the last occupied cell
  - the queue row no longer shows the tiny vertical scrollbar
  - full normal/circular queues surface a visible full-state warning in the controls panel

## 2026-08-20 (P15 L-01~L-04 reset consistency and L-01 full-array guard)

### Today Done
- Changed L-01 full-array insert handling from a hard invalid-config failure to a stable no-op completed state, so the full array remains visible and a page-level capacity warning can be shown without dropping the last element.
- Updated L-01, L-02, and L-03 transport `重置` behavior to restore each module's original default example state instead of only rewinding the current timeline frame.
- Re-checked L-02, L-03, and L-04 for the same class of bug:
  - L-02 has no fixed-capacity overflow loss path because it expands capacity instead of rejecting append.
  - L-03 has no fixed-capacity boundary of this type.
  - L-04 already used an explicit reset-to-initial-state handler and did not need a reset semantics change.

### Current State
- Verified targeted tests:
  - `npm test -- src/modules/linear/arrayInsert.test.ts src/pages/modules/arrayPageUtils.test.ts src/pages/modules/queuePageUtils.test.ts src/modules/linear/queueOps.test.ts`
- Verified local build:
  - `npm run build`
- `npm run check` is still blocked on Windows at `./scripts/check-doc-links.sh`

### Next Step
- Refresh `/modules/array`, `/modules/dynamic-array`, and `/modules/linked-list` and manually confirm:
  - L-01 full array keeps all 20 values visible and shows a page-level full warning
  - L-01/L-02/L-03 `重置` returns to each module's original default example

## 2026-08-21 (Chapter 4 next-batch scope decision)

### Today Done
- Narrowed the post-`P15` Chapter 4 candidate scope to the storage/compression topics with the strongest animation value and the closest alignment to the attached courseware wording.
- Confirmed the first Chapter 4 batch should focus on:
  - two-dimensional array sequential storage
  - symmetric matrix compressed storage
  - upper-triangular matrix compressed storage
  - lower-triangular matrix compressed storage
  - sparse-matrix triple-table storage
  - sparse-matrix linked storage
- Explicitly moved the following out of the first batch and into future expansion:
  - three-dimensional array storage
  - generalized lists
  - broader special-matrix extensions not covered by the current classroom wording

### Current State
- This is a scope/roadmap decision only; no implementation has started for the Chapter 4 batch yet.
- `P15` acceptance/stabilization remains the active near-term priority before opening this next batch.

### Next Step
- Finish the remaining `P15` route acceptance work, then turn this Chapter 4 batch into a concrete implementation plan and module breakdown.

## 2026-08-26 (G-01 toolbar compact pass)

### Today Done
- Tightened the `G-01` graph concept toolbar so the desktop control area stays within two rows instead of expanding vertically.
- Kept `方向 / 权值 / 边密度` as direct toggle groups, changed `顶点数` to manual numeric input, and collapsed `样本约束` into a compact select control.
- Reduced control spacing and button paddings so the toolbar uses width more efficiently during classroom demo.

### Current State
- Updated files:
  - `src/pages/modules/GraphRepresentationPage.tsx`
  - `src/index.css`
- Verified:
  - `npm run build`
  - `npm run check`
- `npm run check` still fails only on pre-existing lint issues outside this G-01 change:
  - `src/components/WorkspaceShell.tsx`
  - `src/hooks/useStageAnchorPanel.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
  - `src/pages/modules/StackPage.tsx`
  - `src/pages/modules/QueuePage.tsx` warning

### Next Step
- Open `G-01` in the browser and judge whether the new two-row toolbar is compact enough or whether the first-row toggle pills still need another round of compression.

## 2026-08-27 (G-01 path/cycle demo graph reset)

### Today Done
- Changed the four `G-01` demo buttons `生成路径 / 生成简单路径 / 生成回路 / 生成简单回路` so they no longer search inside the current random graph.
- Each demo button now rebuilds a dedicated low-complexity teaching graph and immediately marks the intended example on that new graph.
- Kept the random graph action separate as `生成图`, so “sample generation” and “definition demo graph” are now two different behaviors.

### Current State
- Updated:
  - `src/pages/modules/GraphRepresentationPage.tsx`
- Verified:
  - `npm run build`
- The new intended rule is:
  - `生成图` uses the current toolbar config and creates a fresh random graph
  - the four path/cycle demo buttons create a clearer purpose-built graph instead of trying to mine one from the current random graph

### Next Step
- Manually review whether the four rebuilt teaching graphs are visually simple enough for lecture use, especially under `有向图` and `带权图`.

## 2026-08-27 (G-01 arrow size + non-strongly-connected SCC grouping)

### Today Done
- Reduced the custom-drawn directed arrowheads again so the line-end markers look lighter and less intrusive in the teaching canvas.
- Reworked `非强连通图` generation from a one-way chain into grouped construction: it now first creates `2-3` small strongly connected blocks, then adds only forward inter-block edges.
- Kept the whole directed sample intentionally non-strongly-connected while making the resulting `强连通分量` structure closer to lecture expectations.

### Current State
- Updated:
  - `src/pages/modules/GraphRepresentationPage.tsx`
  - `src/modules/graph/graphConcepts.ts`
  - `src/index.css`
- Verified:
  - `npm run build`
- Expected behavior now:
  - directed arrows are visibly smaller than the previous open-arrow version
  - `非强连通图` should usually show `2` or `3` strong components instead of degenerating into all-singleton SCCs

### Next Step
- Manually inspect a few regenerated `非强连通图` samples in `G-01` and judge whether the new SCC grouping is stable enough visually, or whether the block sizes / cross-block edge count still need tightening.

## 2026-08-27 (G-01 teaching demos changed from fixed graphs to constrained random)

### Today Done
- Replaced the four teaching-demo buttons `生成路径 / 生成简单路径 / 生成回路 / 生成简单回路` from fixed one-template graphs to constrained random teaching graphs.
- Each demo now randomly chooses from small clean templates, may mirror the layout, may attach 1-2 light extra branch edges, and randomizes weighted-graph edge values.
- Kept the teaching guarantee: every generated graph still directly contains the intended path or cycle example, instead of depending on chance in the current random sample.

### Current State
- Updated:
  - `src/pages/modules/GraphRepresentationPage.tsx`
- Verified:
  - `npm run build`
- Expected behavior now:
  - the four demo buttons no longer always produce the exact same graph
  - generated examples remain low-complexity and lecture-friendly rather than becoming fully unconstrained random graphs

### Next Step
- Refresh `G-01` and click each demo button several times to judge whether the current amount of variation is enough, or whether each button should gain even more template variants.

## 2026-08-27 (G-01 teaching demos changed from weak-random templates to rule-driven generation)

### Today Done
- Replaced the previous “small template + flip/mirror” demo generation with rule-driven construction for `生成路径 / 生成简单路径 / 生成回路 / 生成简单回路`.
- Each demo now randomly decides the number of main vertices, repeated-vertex position when needed, branch count, branch attachment point, node layout profile, and weight values while still guaranteeing the intended teaching example exists.
- Kept the graphs deliberately low-complexity so lecture demos remain readable instead of drifting into fully unconstrained random graphs.

### Current State
- Updated:
  - `src/pages/modules/GraphRepresentationPage.tsx`
- Verified:
  - `npm run build`
- Expected behavior now:
  - repeated clicks on the four demo buttons should produce noticeably different graph shapes, not just mirrored near-duplicates
  - `路径 / 回路 / 简单路径 / 简单回路` still remain definition-correct and immediately visible on the rebuilt graph

### Next Step
- Manually click each of the four demo buttons several times in `G-01` and judge whether the new variation is already enough, or whether one of the four categories still needs stronger structural contrast.

## 2026-08-28 (G-02A edge tooltip + condensed notes layout)

### Today Done
- Added hover tooltip support for graph edges in `G-02A`, so edge hover now surfaces endpoint mapping and corresponding adjacency-matrix cell position/value directly on the canvas.
- Reworked the right-side `定义与说明` area into a denser two-column card layout on wider screens, with automatic single-column fallback on narrower widths.
- Kept the page aligned with the current teaching scope: static graph/matrix correspondence, no pseudo-operations restored.

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyMatrixPage.tsx`
  - `src/index.css`
- Verified:
  - `npm run build`
  - `http://127.0.0.1:4173/modules/graph-adjacency-matrix` returns `200`
  - local dev server is still listening on `127.0.0.1:4173`
  - DOM smoke confirmed `定义` / `特点` sections now render through two `.adjacency-matrix-copy-grid` containers
- Intended behavior now:
  - hovering an edge should show a floating card for that edge
  - definition/features text should consume less vertical space and be less likely to trigger page-level vertical scrolling

### Next Step
- Reopen `G-02A` in the browser for final visual judgment of edge-tooltip placement and whether any remaining page-level vertical scrollbar pressure still needs tuning.

## 2026-08-28 (G-02A tooltip trigger + split storage panels + lighter notes)

### Today Done
- Changed edge tooltip behavior so it now appears only when the edge is already selected and the mouse hovers that selected edge.
- Split the storage teaching area back into two independent cards:
  - `顶点数组`
  - `邻接矩阵`
- Removed the per-sentence boxed-card treatment from `定义` / `特点`, while keeping a two-column text layout to reduce visual noise and vertical height.

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyMatrixPage.tsx`
  - `src/index.css`
- Intended behavior now:
  - edge tooltip should no longer pop on arbitrary hover; it should require prior edge selection
  - vertex array and matrix should read as separate storage regions instead of one nested block
  - notes area should stay denser and flatter instead of stacking many bordered mini-cards

### Next Step
- Recheck `G-02A` visually for final spacing judgment, especially whether the lighter two-column notes layout now reduces page-level scrolling as intended.

## 2026-08-28 (G-02A numbered notes reflow)

### Today Done
- Removed the extra right-side explanatory subtext from the `定义与说明` card header.
- Removed the visible `定义` / `特点` section headings inside the notes area.
- Merged all note paragraphs into one continuous numbered presentation, filled by reading order `left column first, then right column`.
- Added alternating odd/even background colors across the numbered note items to improve scanning without restoring heavy per-sentence framing.

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyMatrixPage.tsx`
  - `src/index.css`
- Intended behavior now:
  - notes should show as a single numbered set instead of two titled blocks
  - numbering should continue across both columns in left-first reading order
  - odd/even note items should alternate color subtly

### Next Step
- Reopen `G-02A` and judge whether the numbered two-column notes are now compact enough, or whether spacing still needs another round of compression.

## 2026-08-28 (G-02A notes line-height tighten)

### Today Done
- Tightened the `定义与说明` area spacing again by reducing:
  - overall stack gap
  - column gap
  - per-item gap
  - paragraph line-height
  - numbered item padding

### Current State
- Updated:
  - `src/index.css`
- Intended behavior now:
  - numbered notes should feel denser and consume less vertical space than the previous pass

### Next Step
- Refresh `G-02A` and judge whether the current note density is acceptable, or whether it still needs another small compression pass.

## 2026-08-28 (G-02A undirected node tooltip neighbor fix)

### Today Done
- Fixed the undirected-node tooltip wording so it no longer shows directed-only `出邻接点 / 入邻接点` labels.
- Changed the undirected tooltip to show one deduplicated `邻接点` line instead.

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyMatrixPage.tsx`
- Intended behavior now:
  - undirected node tooltip should show `度`
  - undirected node tooltip should show a single correct neighbor list
  - directed node tooltip should keep separate outgoing/incoming neighbor lines

### Next Step
- Refresh `G-02A` and verify the undirected node tooltip now matches the actual graph neighborhood.

## 2026-08-28 (G-02A neighbor and edge ordering)

### Today Done
- Sorted tooltip neighbor lists by vertex index before rendering.
- Unified undirected edge tooltip endpoint display order to ascending vertex index.

### Current State
- Updated:
  - `src/pages/modules/GraphAdjacencyMatrixPage.tsx`
- Intended behavior now:
  - undirected `邻接点` should display in index order
  - directed `出邻接点 / 入邻接点` should also display in index order
  - undirected edge tooltip should show the smaller-index endpoint first

### Next Step
- Refresh `G-02A` and verify tooltip ordering now matches the matrix/header index order.

## 2026-08-28 (G-02A undirected degree fix)

### Today Done
- Fixed the undirected degree calculation used by the node tooltip.
- The undirected `度` value now counts the full neighbor set instead of only counting edges where the current vertex appears in the `from` slot.

### Current State
- Updated:
  - `src/modules/graph/adjacencyMatrix.ts`
- Intended behavior now:
  - undirected node tooltip degree should match the actual number of connected neighbors on the canvas and in the matrix

### Next Step
- Refresh `G-02A` and verify nodes like `v1` now show degree `3` when connected to `v0 / v2 / v3`.

## 2026-08-28 (G-02A accepted and next module switched to tree-definition)

### Today Done
- User accepted the current `G-02A /modules/graph-adjacency-matrix` teaching page after the latest tooltip/layout/degree fixes.
- Synced repo docs so the accepted graph-definition boundary is no longer only stored in chat history.
- Switched the next documented module target to the pending concept-first `tree definition` page.

### Current State
- Accepted current graph-definition boundary:
  - `G-01 /modules/graph-representation`
  - temporary `G-02A /modules/graph-adjacency-matrix`
- Keep unchanged:
  - legacy `G-02 /modules/dfs` numbering and route
- Next implementation focus:
  - inspect current tree-track pages and define the minimum viable concept-first tree-definition module

### Next Step
- Review `T-01` and related tree pages for reusable stage/layout/content patterns before creating the new concept-first tree-definition module.

## 2026-08-28 (T-00A tree-definition first pass landed)

### Today Done
- Added a new temporary concept-first tree page:
  - module id: `T-00A`
  - route: `/modules/tree-definition`
- Kept the page intentionally static/conceptual instead of opening traversal playback:
  - switch between `普通树` and `二叉树`
  - click a node to inspect root / parent / child / sibling / level / degree relations
  - read a numbered definition panel that explains tree basics before later tree algorithms
- Wired the page through:
  - `src/modules/tree/treeDefinition.ts`
  - `src/pages/modules/TreeDefinitionPage.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/app/router.tsx`
  - `src/pages/moduleCatalog.ts`
  - `src/i18n/translations.ts`
  - `src/index.css`

### Current State
- Verified:
  - `npm run build`
  - `http://127.0.0.1:4173/modules/tree-definition` returns `200`
- Current local teaching boundary for `T-00A`:
  - it is a definition/relationship page, not a traversal page
  - it currently covers ordinary-tree vs binary-tree examples plus node-relationship inspection
  - existing formal `T-01 /modules/binary-tree` remains unchanged

### Next Step
- Open `/modules/tree-definition` and review whether the current first pass teaches the right baseline concepts clearly enough before any follow-up polish.

## 2026-08-28 (priority corrected back to graph line)

### Today Done
- Corrected the session priority after the user clarified that the graph line is not finished yet.
- Confirmed the earlier graph-definition/storage context is still preserved in repo docs, including the adjacency-list-related baseline recorded through `G-01`.
- Marked the new temporary `T-00A /modules/tree-definition` page as parked local work rather than the active next module.

### Current State
- Active priority is back on the graph-definition/storage line.
- Accepted current graph boundary:
  - `G-01 /modules/graph-representation`
  - temporary `G-02A /modules/graph-adjacency-matrix`
- Still important:
  - old `G-02 /modules/dfs` numbering stays untouched
  - adjacency-list-related graph follow-up remains active context and was not completed by switching to tree

### Next Step
- Resume from the graph line and clarify/implement the next adjacency-list-related graph page or follow-up instead of continuing tree-definition work.

## 2026-08-28 (tree paused graph basic line first)

### Today Done
- User explicitly confirmed that tree work should stop here for now.
- Re-synced docs so the active session priority is now unambiguous:
  - finish the basic graph-content line first
  - keep `T-00A /modules/tree-definition` paused

### Current State
- Active priority:
  - graph-definition/storage follow-up
- Paused local work:
  - `T-00A /modules/tree-definition`
- Still-active graph context:
  - accepted `G-01`
  - accepted temporary `G-02A`
  - adjacency-list-related follow-up still pending

### Next Step
- Continue from the graph line only, and do not resume tree-definition work unless the user reopens it later.

## 2026-09-14 (stack/queue variants split into standalone entries)

### Today Done
- Split the stack/queue structural variants that were previously selected inside the control panel into standalone navigation entries and routes:
  - `L-04 /modules/sequential-stack`
  - `L-04B /modules/linked-stack`
  - `L-05 /modules/sequential-queue`
  - `L-05B /modules/linked-queue`
  - `L-05C /modules/circular-queue`
- Kept legacy compatibility routes in place:
  - `/modules/stack` still opens the sequential stack page
  - `/modules/queue` still opens the sequential queue page
- Updated registry/catalog/router/i18n wiring so the home page, module list, and sidebar can address the split modules directly.
- Removed the queue control-panel structure switch; queue pages now derive their mode from the route.
- Adjusted stack/queue workbench rendering so each split page shows only its own structure, title, description, metadata, pseudocode, and stage visualization.
- Added a linked-queue node/connector visualization for the new `L-05B` page.

### Verification
- Passed:
  - `npm run build`
  - targeted stack/queue/module-list tests
  - `npm run check:docs`
  - `git diff --check`
- Full `npm run check` result:
  - docs passed
  - all tests passed: `103` files / `327` tests
  - lint remains blocked by existing React lint issues in `useStageAnchorPanel.ts`, `HuffmanTreePage.tsx`, and `StackPage.tsx`, plus existing warnings in `LinkedListPage.tsx` and `QueuePage.tsx`.
- Browser smoke was not completed because the local Playwright browser executable is missing; Playwright reported that browser installation is required.

### Next Step
- Open the five split routes in the app and confirm the sidebar/module-card entry flow matches the intended product structure.
- If accepted, follow up by addressing the existing lint blockers so `npm run check` can complete green again.

## 2026-09-14 (stack canvas background and full Chinese names)

### Today Done
- Removed the extra white lane/card layer from the split stack pages by giving the stack stage a single-variant layout and transparent lane styling.
- Expanded Chinese display names to avoid abbreviated structural names:
  - `顺序存储栈`
  - `链式栈`
  - `顺序队列`
  - `链式队列`
  - `循环队列`
- Updated the sequential queue runtime label so the stage/status chips no longer show the old `普通队列` wording.

### Verification
- Passed:
  - targeted stack/queue tests: `5` files / `40` tests
  - `npm run build`
- Full `npm run check`:
  - docs passed
  - all tests passed: `103` files / `327` tests
  - lint remains blocked by the same existing React lint issues recorded earlier.

### Next Step
- Visually confirm `/modules/sequential-stack` and `/modules/linked-stack` no longer show the extra white canvas layer.

## 2026-09-14 (module workbench top bar restyled)

### Today Done
- Restyled the module workbench global top bar so entering a module no longer shows the old homepage-style header.
- Scoped the change to `.app-shell-module` only:
  - compact 60px workbench bar
  - neutral blue-gray border/background to match the canvas command bar
  - compact module picker chip
  - smaller nav/language controls
- Left the homepage/top-level landing header styling unchanged.

### Verification
- Passed:
  - `npm run build`

### Next Step
- Visually confirm a representative module route from the app sidebar/home entry and check that the top bar now matches the new workbench style.

## 2026-09-14 (home surface aligned to workbench style)

### Today Done
- Reworked the homepage/global surface styling toward the module workbench direction the user preferred:
  - removed the earthy green/tan global background feel
  - switched the body background to a cool blue-gray grid-like work surface
  - compacted the global top bar typography/buttons
  - made the quick-navigation homepage use the full viewport width instead of a centered, roomy cover-like layout
  - tightened sidebar, toolbar, module cards, and right panels to reduce empty space
  - kept category accents but moved the dominant palette back toward the module workbench blue-gray language

### Verification
- Passed:
  - `npm run build`

### Next Step
- Visually review the homepage at `/` or `/modules`; if the direction is accepted, continue tightening any remaining homepage card density or typography details.

## 2026-09-14 (stack stage status moved beside structure)

### Today Done
- Removed the old stack lane header from the split stack canvas.
- Moved stack status information into a small two-line inline note beside the stack structure:
  - current stack state
  - current stack element count
- Applied the layout to both standalone stack pages:
  - `/modules/sequential-stack`
  - `/modules/linked-stack`
- Added zh/en translation keys for the new inline labels.
- Follow-up fix:
  - restored visible top/bottom pointers after the inline layout by allowing horizontal overflow in stack containers and reserving side space for linked-stack pointers.
  - replaced visually rendered arrow characters with CSS-drawn short pointer lines, so isolated arrow glyphs no longer appear as stray shapes near the bottom of the stack.

### Verification
- Passed:
  - targeted stack tests: `4` files / `25` tests
  - `npm run build`

### Next Step
- Visually confirm both stack routes: the status/count should sit near the structure and no longer float at the old top-left/top-right lane positions.
