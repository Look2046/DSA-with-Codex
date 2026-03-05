# SESSION_BRIEF

Use this file as the first thing to read in a new chat/session.

## 1) Current Snapshot

- Project: Data Structure Algorithm Visualizor
- Active branch (expected): `feat/l03-v1`
- Current phase: Cross-module visual regression baseline captured (playwright), preparing PR-ready summary and final manual sanity pass
- Last local quality gate: `npm run check` (passed, 2026-03-05)

## 2) What Is Already Done

- Frontend scaffold (Vite + React + TypeScript)
- Route shell and page placeholders
- zh/en one-click language toggle (UI text)
- S-01 bubble sort basic playback + bars/highlights + speed/data-size controls
- S-01 bubble sort enhanced demo with localized UI and pseudocode highlight
- Unit test baseline for bubble sort step generation
- CI workflow and unified local quality gate
- L-01 array insert v1 with validated input, timeline playback, explicit empty-slot shift steps, and insertion animation
- Unit tests for array insert step generation (deterministic + edge cases)

## 3) Next Priority

- Prepare PR-ready summary grouped by interaction model, visualization standardization, and validation/UX.
- Run one final manual sanity pass on `/modules/bubble-sort`, `/modules/array`, `/modules/linked-list` using latest local build before opening PR.

## 4) Guardrails

- Source of truth docs:
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Do not skip branch workflow (`docs/*`, `feat/*`)
- Avoid editing unrelated files in the same branch

## 5) Quick Start Commands

```bash
git fetch
git switch feat/l03-v1
git pull
npm install
npm run dev
```

## 6) Session Kickoff Prompt (Copy/Paste)

```text
Read docs/SESSION_BRIEF.md, docs/HANDOFF.md, docs/DECISIONS.md, and TODO.md first.
Then continue with the next priority only.
Before coding, restate scope and acceptance criteria in 3-5 bullets.
After coding, run npm run check and summarize file-level changes.
```

## 7) Update Rule

Update this file when any of the following changes:
- current phase/milestone
- default active branch
- next priority
- required quality gate commands
