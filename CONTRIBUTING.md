# Contributing Guide

This repository is in active development with docs + frontend code.

## Workflow

1. Create a branch for one focused scope (`docs/*` or `feat/*`).
2. Keep changes scoped and reviewable.
3. Use clear commit messages with a prefix like `docs:`, `feat:`, `fix:`, `test:`.
4. Open a pull request with:
   - scope summary
   - changed files
   - risks/assumptions

## Quality Checklist

- [ ] Run `npm run check` and ensure it passes.
- [ ] No stale generated text in docs (for example, "请提示继续").
- [ ] Dates are explicit (`YYYY-MM-DD`) in docs updates.
- [ ] Links and file names match real repository paths.
- [ ] `git status` is clean before push.

## Docs Consistency

- Keep terminology aligned with `docs/15 GOVERNANCE_STANDARDS.md`.
- Keep module counts aligned with `docs/3 MODULES_FINAL_LIST.md`.
- If you change routing or module IDs, update `docs/6 ROUTING_MAP.md` together.
