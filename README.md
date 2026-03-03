# Data Structure Algorithm Visualizor

This repository tracks design and implementation artifacts for the project.

## Current Phase

- Phase: design review
- Scope: `docs/*.md`

## Git Workflow (Docs First)

1. Create a branch for each review topic, e.g. `docs/review-architecture`.
2. Make focused edits for one document set.
3. Commit with clear scope, e.g. `docs: refine state management constraints`.
4. Merge back to `main` after review.

## Useful Commands

```bash
# check change set
git status
git diff

# create branch for one design topic
git switch -c docs/review-<topic>

# stage and commit
git add docs
git commit -m "docs: <change summary>"
```

