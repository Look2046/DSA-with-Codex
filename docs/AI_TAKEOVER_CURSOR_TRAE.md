# AI Takeover Guide (Cursor/Trae)

Purpose: let non-Codex AI tools continue current work safely with minimal context loss.

## 1) Current Snapshot (as of 2026-03-10)

- Repository: `data-structure-algorithm-visualizor`
- Current active branch: `feat/p8-m3-route-rules-spike`
- Main milestone: `P8-M3` (tree-track consistency + acceptance closure)
- Latest pushed commit on spike branch: `ccc94da`

## 2) Branch Strategy (Recommended)

- Keep `feat/p8-m3-route-rules-spike` as **experiment archive branch** (do not continue long-term module work here).
- Continue module implementation on `feat/p8-m2-bst` (module mainline branch).
- Integrate validated spike changes into module mainline with controlled cherry-pick.

Suggested integration flow:

```bash
git fetch
git switch feat/p8-m2-bst
git pull --ff-only

# pick validated spike commits
git cherry-pick 0712e4d 8289c51 ccc94da

npm run check
git push
```

## 3) Must-Read Files (order)

1. `docs/SESSION_BRIEF.md`
2. `docs/HANDOFF.md`
3. `docs/DECISIONS.md`
4. `TODO.md`
5. `docs/modules/T-01-preorder-trace-rules.md`

## 4) Non-Negotiable Workflow Rules

- Use Chinese for user-facing summaries unless user requests English.
- Unless user explicitly requests, do not take screenshots and do not do image-based analysis.
- Prefer DOM/programmatic checks for UI validation.
- Do not use destructive git commands.
- After meaningful code changes, run `npm run check`.
- If only docs changed, run `./scripts/check-doc-links.sh`.

## 5) What Was Proven In Spike

### 5.1 Route Generation

- Preorder route changed from sample-specific hardcode to rule-driven recursive generation.
- Works for arbitrary level-order trees including sparse/null-heavy cases.

Core local rules:

- Data node:
  - up-left in -> CCW -> left-down-left -> recurse left
  - return via left-down-right -> CCW -> right-down-left -> recurse right
  - return via right-down-right -> CCW -> up-right out
- Null node:
  - up-left in -> CCW -> up-right -> return
- Root:
  - virtual top edge entry; starts from top vertical segment

### 5.2 Route Playback Rendering

- Full route is not pre-shown.
- Playback draws progressively from root-top entry to terminal point.
- Future segments remain hidden.
- Completed segments remain dashed with line-end arrows.
- One moving front arrow follows current path front.

### 5.3 Entry Direction Markers (`1/2/3`)

- For each data node:
  - `1`: entered from up edge
  - `2`: entered from left-down edge
  - `3`: entered from right-down edge
- Markers are progress-driven (`revealLength`) and appear in drawing order (not all at once).

## 6) Key Commits (Spike)

- `0712e4d` route rules + progressive playback baseline + docs sync
- `8289c51` reveal `1/2/3` entry markers along trace drawing
- `ccc94da` docs sync for progressive `1/2/3` rules and handoff

## 7) Key Files

- Playground page implementation:
  - `src/pages/modules/BinaryTreeCanvasPlaygroundPage.tsx`
- Related styles:
  - `src/index.css`
- Reusable rules doc:
  - `docs/modules/T-01-preorder-trace-rules.md`

## 8) Acceptance Checklist (for future AI)

Before claiming completion:

1. `npm run check` passes.
2. Playback starts from root top segment and reaches terminal point.
3. Future segments are hidden during playback.
4. Completed segments keep dashed style + line-end arrows.
5. Moving front arrow is visible and uses same small-arrow geometry family.
6. `1/2/3` markers appear progressively with route progress.
7. Docs are synced when behavior changes (`SESSION_BRIEF` / `HANDOFF` / `DECISIONS` / `TODO`).

## 9) Ready Prompt For Cursor/Trae

Use this directly:

```text
Read docs/SESSION_BRIEF.md, docs/HANDOFF.md, docs/DECISIONS.md, TODO.md, and docs/modules/T-01-preorder-trace-rules.md first.
Then continue P8-M3 only.
Do not use screenshots unless explicitly requested; validate UI using DOM/programmatic checks.
When code changes are done, run npm run check.
If milestone state changes, sync docs (SESSION_BRIEF/HANDOFF/DECISIONS/TODO).
```

## 10) Notes

- This file is an operator handoff entrypoint for tools that do not follow Codex AGENTS rules automatically.
- Keep this file updated whenever branch strategy, required checks, or route semantics change.

## 11) Required Update Template (5 Docs)

When a task ends, the AI must update these files if applicable:

1. `docs/SESSION_BRIEF.md`
2. `docs/HANDOFF.md`
3. `docs/DECISIONS.md` (only for architecture/workflow decisions)
4. `TODO.md`
5. `docs/AI_TAKEOVER_CURSOR_TRAE.md`

Copy this template and fill it:

```text
[Task Summary]
- Branch:
- Goal:
- Result:

[Code/Docs Changed]
- Files:
- Behavior changed:

[Validation]
- Commands run:
- Result:

[Open Items]
- Blockers:
- Next step:

[Docs Sync]
- SESSION_BRIEF: updated / not needed
- HANDOFF: updated / not needed
- DECISIONS: updated / not needed
- TODO: updated / not needed
- AI_TAKEOVER_CURSOR_TRAE: updated / not needed
```

## 12) End-Of-Task Check Commands (Mandatory)

Run these before final response:

```bash
# 1) show what changed in docs
git diff -- docs/ TODO.md

# 2) doc links check (always if docs changed)
./scripts/check-doc-links.sh

# 3) full gate for meaningful code changes
npm run check

# 4) show clean/dirty state
git status --short --branch
```

The final message must include:

- what was changed,
- what was validated,
- exact current repo state (`working tree dirty` / `committed not pushed` / `pushed pending merge` / `merged`).
