# T-01 Preorder Trace Rules (Reusable)

This document captures the canonical preorder trace drawing rules used by the binary-tree canvas and can be reused by other tree modules.

## 1. Geometry Contract

- Node clearance radius: `nodeRadius + 10px`
- Null-node clearance radius: `nullRadius + 10px`
- Edge lane offset: `10px` (with radius-safe cap)
- Root entry line:
  - start at `40px` above root circumference
  - end at `10px` above root circumference
- Trace style:
  - dashed red stroke
  - arrowheads only on line-segment endpoints
  - one moving front arrow while playback is in progress

## 2. Left/Right Definition

- Left/right is judged in **canvas absolute coordinates** (not by local edge direction labels).
- For each tree edge, compute two offset lanes and map them to absolute `left` / `right` by x-position.

## 3. Data Node Rule

For every real data node, the trace follows this local order:

1. Enter from `up-left` (near node).
2. Turn counterclockwise (CCW) to `left-down-left`.
3. Go away along left-down-left lane to left child/subtree.
4. Return from left subtree on `left-down-right`.
5. Turn CCW to `right-down-left`.
6. Go away along right-down-left lane to right child/subtree.
7. Return from right subtree on `right-down-right`.
8. Turn CCW to `up-right`.
9. Go away along `up-right` lane back to parent.

## 4. Null Node Rule

For a null node, it has one logical `up` edge only:

1. Enter from `up-left`.
2. Turn CCW around null clearance circle to `up-right`.
3. Return along `up-right` lane.

## 5. Root Special Rule

- Root has a virtual `up` entry for start.
- Current canonical route starts with the root top vertical segment, then follows node rules for left/right subtree traversal.
- Route currently ends at the root-side return point after right subtree (no extra final arc).

## 6. Generator Shape (Recursive)

- Build lanes per edge with `left/right` pair.
- `traceChild(edgeContext)`:
  - if real node: recurse with data-node rule
  - else: apply null-node rule
- Root sequence:
  - entry line
  - root turn to left branch + recurse left
  - root turn to right branch + recurse right

## 7. Validation Invariants

- Segment chain must be continuous: end of segment `i` equals start of segment `i+1` (within tiny tolerance).
- `arrowCount === lineSegmentCount`.
- For empty input or root=`null`, no trace segments are produced.

## 8. Playback Rendering Contract

- Future segments must stay hidden until reached by playback.
- In-progress segment shows partial visible length (`0..segmentLength`).
- Completed segments keep dashed style and line-end arrows.
- Moving front arrow must reuse the same arrow geometry as line-end arrows.
- Playback starts from root top entry segment and ends at the canonical terminal return point.

## 9. Node Entry Markers (`1/2/3`)

- Marker meaning for real (data) nodes:
  - `1`: entering node from the `up` edge (parent/upstream side)
  - `2`: entering node from the `left-down` edge (after finishing left subtree)
  - `3`: entering node from the `right-down` edge (after finishing right subtree)
- Root also follows the same semantics:
  - root-top entry is `1`
  - return from left subtree into root is `2`
  - return from right subtree into root is `3`
- Markers are tied to route progress:
  - each marker has a `revealLength` on the canonical path
  - marker appears only when `traceDrawLength >= revealLength`
  - do not pre-show all markers before playback reaches them

## 10. Reuse Guidance

When migrating this trace logic into other tree modules (for example `T-01` main traversal page):

- Reuse the same geometry constants and absolute-left/right rule.
- Keep data/null/root local rules unchanged.
- Keep output as ordered segments so play/step can animate along one canonical route.
- Keep entry-marker semantics (`1/2/3`) and reveal-by-progress behavior unchanged.
