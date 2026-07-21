# Repo Workspace Policy

## Purpose

Keep the repository easy to review by separating source code, official docs, accepted verification evidence, and local-only working material.

## Directory Classes

### 1. Runtime Source
- `src/`
- `public/`
- `scripts/`
- `package.json`
- `playwright-cli.json`

These files define the product and are eligible for normal feature commits.

### 2. Official Project Docs
- `docs/SESSION_BRIEF.md`
- `docs/HANDOFF.md`
- `docs/DECISIONS.md`
- `TODO.md`
- `docs/modules/`
- `docs/IMPLEMENTATION_PLAN_P*.md`

These files track roadmap, handoff, and enduring technical decisions.

### 3. Accepted Verification Evidence
- `output/playwright/p*.png`
- `output/playwright/p*-acceptance-report.txt`
- `output/playwright/p*-smoke-report.txt`
- `output/playwright/t07-huffman-smoke.png`

These files may stay versioned when they are referenced by milestone docs or acceptance notes.

### 4. Local-Only Working Material
- `docs/design-prototypes/`
- `output/design/`
- `output/playwright/scratch/`
- `output/playwright/dev-logs/`
- `student-dist/`
- `start-project-wsl.bat`

These files are not part of the durable product history and should be ignored or kept outside review commits.

## Cleanup Rules

1. Do not reorganize `src/` in the same change that cleans local artifacts.
2. Do not move historical `output/playwright/p*` artifacts that are already referenced by docs unless the docs are updated in the same commit.
3. New scratch screenshots and local logs go under `output/playwright/scratch/` or `output/playwright/dev-logs/`, not directly under `output/playwright/`.
4. Design experiments stay under `docs/design-prototypes/` and `output/design/` until deliberately promoted into official docs.
5. Local launchers and local distribution packages stay out of the repo root review path.
