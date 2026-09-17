# Repository Working Files Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate runtime source, official docs, accepted verification artifacts, local-only design exploration, and local distribution outputs so the repository stays reviewable and the current dirty worktree can be cleaned without losing useful files.

**Architecture:** Use a policy-first cleanup instead of a broad source-code reorganization. Keep `src/` and historically referenced acceptance artifacts in place, introduce explicit local-only lanes through `.gitignore`, move scratch outputs out of the top-level scan path, and record the current dirty-tree file groups before any feature commits are attempted.

**Tech Stack:** Git, WSL bash, React 19, TypeScript, Vite, Playwright artifacts, Markdown docs

---

## File Structure Map

- Keep as runtime source of truth:
  - `src/`
  - `public/`
  - `scripts/`
  - `package.json`
  - `playwright-cli.json`
- Keep as official project docs:
  - `docs/SESSION_BRIEF.md`
  - `docs/HANDOFF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
  - `docs/modules/`
  - `docs/IMPLEMENTATION_PLAN_P*.md`
- Keep as accepted evidence already referenced by docs:
  - `output/playwright/p*.png`
  - `output/playwright/p*-acceptance-report.txt`
  - `output/playwright/p*-smoke-report.txt`
  - `output/playwright/t07-huffman-smoke.png`
- Treat as local-only working material after cleanup:
  - `docs/design-prototypes/`
  - `output/design/`
  - `output/playwright/scratch/`
  - `output/playwright/dev-logs/`
  - `student-dist/`
  - `start-project-wsl.bat`
- Do **not** do in this cleanup wave:
  - move files inside `src/modules/**`
  - rename routes
  - rewrite module architecture
  - relocate already-referenced historical `output/playwright/p*` evidence

## Current Dirty-Tree Grouping

- `T-07 Huffman Tree` functional files:
  - `src/modules/tree/huffman.ts`
  - `src/modules/tree/huffman.test.ts`
  - `src/modules/tree/huffmanTimelineReplay.test.ts`
  - `src/pages/modules/HuffmanTreePage.tsx`
- `Modules/Home redesign` files:
  - `src/app/layout/Layout.tsx`
  - `src/pages/HomePage.tsx`
  - `src/pages/ModulesPage.tsx`
  - `src/app/recentModuleVisits.ts`
  - `src/components/CatalogHeroArt.tsx`
  - `src/pages/moduleCatalog.ts`
- Mixed-touchpoint files that need review before commit splitting:
  - `src/app/router.tsx`
  - `src/data/moduleRegistry.ts`
  - `src/i18n/translations.ts`
  - `docs/HANDOFF.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/DECISIONS.md`
  - `TODO.md`
- Repository-noise files and directories:
  - `docs/design-prototypes/`
  - `output/design/`
  - scratch screenshots under `output/playwright/` such as `t01-*`, `modules-console-check*`, `modules-home-merged*`, `modules-redesign*`, `home-review-*`, and `visualgo-bst-layout.png`
  - local distribution and launcher files: `student-dist/`, `start-project-wsl.bat`

### Task 1: Freeze Repository Directory Policy

**Files:**
- Create: `docs/REPO_WORKSPACE_POLICY.md`
- Verify: `docs/HANDOFF.md`
- Verify: `docs/SESSION_BRIEF.md`

- [ ] **Step 1: Capture the inventory baseline**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
git status --short --branch
find docs -maxdepth 2 -type d | sort
find output -maxdepth 2 -type d | sort
du -sh output docs/design-prototypes student-dist 2>/dev/null || true
```

Expected:
- `feat/p14-backlog-wave` is still the active branch
- `output/` is much larger than source and docs scratch directories
- `docs/design-prototypes/` and `student-dist/` appear as local-only candidates

- [ ] **Step 2: Create the policy document**

Write `docs/REPO_WORKSPACE_POLICY.md` with this initial content:

```markdown
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
```

- [ ] **Step 3: Verify docs still pass the docs-only gate**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
./scripts/check-doc-links.sh
```

Expected:
- The script exits successfully with no broken doc links

- [ ] **Step 4: Commit the policy document**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
git add docs/REPO_WORKSPACE_POLICY.md
git commit -m "docs: add repository workspace policy"
```

### Task 2: Add Ignore Rules for Local-Only Working Material

**Files:**
- Modify: `.gitignore`
- Verify: `docs/REPO_WORKSPACE_POLICY.md`

- [ ] **Step 1: Record current ignore behavior**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
git check-ignore -v dist/ 2>/dev/null || true
git check-ignore -v docs/design-prototypes/ output/design/ student-dist/ start-project-wsl.bat 2>/dev/null || true
```

Expected:
- `dist/` is already ignored
- the local-only directories are not yet consistently ignored

- [ ] **Step 2: Update `.gitignore`**

Append this block to `.gitignore`:

```gitignore
# Local design, scratch, and personal distribution artifacts
docs/design-prototypes/
output/design/
output/playwright/scratch/
output/playwright/dev-logs/
student-dist/
start-project-wsl.bat
```

- [ ] **Step 3: Verify the new ignore behavior**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
git status --short --ignored | sed -n '1,120p'
```

Expected:
- ignored entries appear for `docs/design-prototypes/`, `output/design/`, `student-dist/`, and `start-project-wsl.bat`
- accepted tracked artifacts under `output/playwright/p*` remain visible to git when modified

- [ ] **Step 4: Commit the ignore rules**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
git add .gitignore
git commit -m "chore: ignore local workspace artifacts"
```

### Task 3: Move Scratch Outputs into Explicit Local-Only Lanes

**Files:**
- Create: `output/playwright/scratch/`
- Create: `output/playwright/dev-logs/`
- Move: scratch files currently sitting directly under `output/playwright/`

- [ ] **Step 1: Create the scratch directories**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
mkdir -p \
  output/playwright/scratch/t01 \
  output/playwright/scratch/modules \
  output/playwright/scratch/home \
  output/playwright/scratch/misc \
  output/playwright/dev-logs
```

Expected:
- the new local-only lanes exist before any files are moved

- [ ] **Step 2: Move current scratch screenshots and logs**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
mv output/playwright/t01-* output/playwright/scratch/t01/ 2>/dev/null || true
mv output/playwright/modules-console-check* output/playwright/scratch/modules/ 2>/dev/null || true
mv output/playwright/modules-home-merged* output/playwright/scratch/modules/ 2>/dev/null || true
mv output/playwright/modules-redesign* output/playwright/scratch/modules/ 2>/dev/null || true
mv output/playwright/modules-workbench-live-directory-v1.png output/playwright/scratch/modules/ 2>/dev/null || true
mv output/playwright/home-review-* output/playwright/scratch/home/ 2>/dev/null || true
mv output/playwright/visualgo-bst-layout.png output/playwright/scratch/misc/ 2>/dev/null || true
mv output/playwright/dev-server-manual.log output/playwright/dev-logs/ 2>/dev/null || true
mv output/playwright/p12-dev-server.log output/playwright/dev-logs/ 2>/dev/null || true
```

Do **not** move:
- `output/playwright/t07-huffman-smoke.png`
- any `output/playwright/p*.png`
- any `output/playwright/p*-report.txt`

- [ ] **Step 3: Remove empty legacy scratch directories if they are empty**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
rmdir output/playwright/feedback 2>/dev/null || true
rmdir output/playwright/feedback-new 2>/dev/null || true
```

Expected:
- empty scratch-only directories disappear
- non-empty directories stay untouched

- [ ] **Step 4: Verify the top-level artifact directory is quieter**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
find output/playwright -maxdepth 1 -type f | sort | sed -n '1,120p'
git status --short output/playwright
```

Expected:
- mostly milestone evidence remains at the top level
- scratch screenshots and local logs no longer dominate `git status`

### Task 4: Record the Current Worktree Split Before Any Feature Commit Cleanup

**Files:**
- Create: `docs/CURRENT_WORKTREE_CHANGESET_MAP.md`
- Verify: `git status --short --branch`

- [ ] **Step 1: Create the current change-set map**

Write `docs/CURRENT_WORKTREE_CHANGESET_MAP.md` with this initial content:

```markdown
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
```

- [ ] **Step 2: Verify the map matches the live working tree**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
git status --short --branch
```

Expected:
- every modified or untracked path can be explained by one of the three buckets in `docs/CURRENT_WORKTREE_CHANGESET_MAP.md`

- [ ] **Step 3: Commit the changeset map**

Run:

```bash
cd /home/haoyu/data-structure-algorithm-visualizor
git add docs/CURRENT_WORKTREE_CHANGESET_MAP.md
git commit -m "docs: map current worktree change sets"
```

## Self-Review

- Spec coverage:
  - Covers root directory policy
  - Covers ignore strategy for local-only material
  - Covers movement of scratch screenshots/logs into explicit lanes
  - Covers recording current dirty-tree groups before feature-commit cleanup
- Placeholder scan:
  - No `TBD`, `TODO`, or implicit "clean this up later" placeholders remain in task steps
- Type consistency:
  - Directory names and file paths are consistent across the policy, ignore rules, move commands, and change-set map
