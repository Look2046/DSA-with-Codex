# T-01 Recursive View Plan

## Goal

Add a toggleable "recursive view" to `T-01 Binary Tree Traversal` so learners can see:

- the recursive pseudocode for DFS traversals
- the current nested call stack (`root -> ... -> current frame`)
- how node-local checkpoints `1 / 2 / 3` map to recursion timing

This feature is for `preorder` first, but the data model and UI contract should remain reusable for `inorder` and `postorder`.

## Core Semantics

For every real node, reinterpret the existing route labels as recursion checkpoints:

- `1`: just entered `traverse(node)`
- `2`: left subtree has returned to `node`
- `3`: right subtree has returned to `node`

Traversal-mode visit timing:

- preorder visits at checkpoint `1`
- inorder visits at checkpoint `2`
- postorder visits at checkpoint `3`

## UX Shape

- Add a `Recursive view` toggle button near playback controls.
- When open, show a dedicated panel with two synchronized areas:
  1. recursive pseudocode
  2. current recursion call stack
- Keep the tree canvas visible; do not replace the main stage with a full-screen modal.

## MVP Scope

### Phase 1

- Land the panel and toggle on `T-01`
- Drive it with preorder first
- Store traversal-step metadata in a mode-agnostic format so inorder/postorder can reuse it

### Phase 2

- verify that inorder/postorder also render correct checkpoints without redesign
- decide whether to extend the panel to level-order with a queue-specific variant instead of recursion

## Step Metadata Contract

Each DFS traversal step should be able to expose:

- `recursionStack`: current node-index stack from root to active frame
- `recursionCheckpoint`: current checkpoint (`1 | 2 | 3 | null`)
- `recursionNullSide`: whether the active null-return event came from left or right

This keeps the panel independent from any single traversal mode.

## Recursive Pseudocode Contract

Use one shared template:

1. `traverse(node):`
2. `if node == null: return`
3. `(1) enter node`
4. `if preorder: visit(node)`
5. `traverse(node.left)`
6. `(2) left subtree returns`
7. `if inorder: visit(node)`
8. `traverse(node.right)`
9. `(3) right subtree returns`
10. `if postorder: visit(node)`
11. `return`

Active-line mapping is step-driven:

- enter-step -> line `3`, plus line `4` for preorder
- left-null -> lines `5 + 2`
- left-return -> line `6`, plus line `7` for inorder visit
- right-null -> lines `8 + 2`
- right-return -> line `9`, plus line `10` for postorder visit

## Acceptance For First Slice

- preorder page can open/close recursive view without breaking existing animation
- recursive panel highlights the expected pseudocode lines while stepping/playing
- call stack grows on descend and shrinks after returning
- current checkpoint text matches the node-local `1 / 2 / 3` semantics
- data contract stays reusable for inorder/postorder

## Git Recommendation

- No new branch needed right now: this remains part of the current `feat/p8-m3-route-rules-spike` tree-visualization work.
- Commit after the preorder-first slice and `npm run check` pass.
- Do not push until the interaction is accepted, because the recursive-view UX is still exploratory.
