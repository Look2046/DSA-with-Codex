# Data Structure Algorithm Visualizor

This repository tracks design and implementation artifacts for the project.

## Current Phase

- Phase: M3 quality gates
- Scope: docs + frontend implementation

## Git Workflow

1. Create a branch for each scope, e.g. `docs/*` or `feat/*`.
2. Keep each branch focused on one milestone.
3. Commit with clear scope, e.g. `docs: ...` or `feat: ...`.
4. Merge back to `main` after review.

## Useful Commands

```bash
# check change set
git status
git diff

# validate local markdown links in docs
./scripts/check-doc-links.sh

# install dependencies
npm install

# run dev server
npm run dev

# lint
npm run lint

# run full quality gate
npm run check

# create branch for one scope
git switch -c <docs-or-feat>/<topic>

# stage and commit
git add docs
git commit -m "docs: <change summary>"
```
