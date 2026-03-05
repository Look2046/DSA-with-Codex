# SESSION_BRIEF

Use this file as the first thing to read in a new chat/session.

## 1) Current Snapshot

- Project: Data Structure Algorithm Visualizor
- Active branch (expected): `feat/p2-timeline-engine`
- Current phase: P2-M2 completed; moving into P2-M3 JSON import/export
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
- Reusable timeline engine hook (`useTimelinePlayer`) with reducer-driven playback tick loop
- S-01/L-01/L-03 migrated to timeline engine path (no direct playback store dependency in module pages)
- Deterministic S-01 replay test for seek/speed/resume stability
- Playwright cross-module regression artifacts refreshed for timeline migration

## 3) Next Priority

- Start P2-M3 JSON import/export (L-01 first) with schema validation + clear error feedback.
- Keep rollout incremental: L-01 import/export -> deterministic round-trip tests -> optional extension to L-03.

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
git switch feat/p2-timeline-engine
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
