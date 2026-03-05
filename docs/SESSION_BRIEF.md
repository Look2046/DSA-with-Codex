# SESSION_BRIEF

Use this file as the first thing to read in a new chat/session.

## 1) Current Snapshot

- Project: Data Structure Algorithm Visualizor
- Active branch (expected): `feat/l03-v1`
- Current phase: P1 closure completed; moving into P2 execution planning
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

- Start P2-M1 timeline engine implementation (S-01 first) based on `docs/IMPLEMENTATION_PLAN_P2.md`.
- Keep rollout incremental: S-01 migration -> deterministic tests -> L-01/L-03 migration.

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
