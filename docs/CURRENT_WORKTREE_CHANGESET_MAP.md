# Current Worktree Changeset Map

## 1. T-07 Huffman Tree

Primary files:
- `src/modules/tree/huffman.ts`
- `src/modules/tree/huffman.test.ts`
- `src/modules/tree/huffmanTimelineReplay.test.ts`
- `src/pages/modules/HuffmanTreePage.tsx`
- `output/playwright/t07-huffman-smoke.png`

Likely companion files:
- `src/app/router.tsx`
- `src/data/moduleRegistry.ts`
- `src/i18n/translations.ts`
- `docs/HANDOFF.md`
- `docs/SESSION_BRIEF.md`
- `docs/DECISIONS.md`
- `TODO.md`

## 2. Modules/Home redesign

Primary files:
- `src/app/layout/Layout.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/ModulesPage.tsx`
- `src/app/recentModuleVisits.ts`
- `src/components/CatalogHeroArt.tsx`
- `src/pages/moduleCatalog.ts`
- `src/index.css`

Likely companion files:
- `src/app/router.tsx`
- `src/data/moduleRegistry.ts`
- `src/i18n/translations.ts`
- `docs/HANDOFF.md`
- `docs/SESSION_BRIEF.md`
- `docs/DECISIONS.md`
- `TODO.md`

## 3. Local-only workspace noise

Move or ignore:
- `docs/design-prototypes/`
- `output/design/`
- scratch screenshots under `output/playwright/`
- `student-dist/`
- `start-project-wsl.bat`

## Review Rule

Any file listed under both `T-07 Huffman Tree` and `Modules/Home redesign` must be reviewed manually before staging so one commit does not accidentally absorb the other feature wave.
