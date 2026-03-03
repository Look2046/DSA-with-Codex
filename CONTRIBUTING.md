# Contributing Guide

This repository is currently in a docs-first phase.

## Workflow

1. Create a branch for one focused topic.
2. Keep changes scoped and reviewable.
3. Use clear commit messages with a prefix like `docs:` or `feat:`.
4. Open a pull request with:
   - scope summary
   - changed files
   - risks/assumptions

## Documentation Changes

- Keep terminology aligned with `docs/15 GOVERNANCE_STANDARDS.md`.
- Keep module counts aligned with `docs/3 MODULES_FINAL_LIST.md`.
- If you change routing or module IDs, update `docs/6 ROUTING_MAP.md` together.

## Quality Checklist

- [ ] No stale generated text (for example, "请提示继续").
- [ ] Dates are explicit (`YYYY-MM-DD`).
- [ ] Links and file names match real repository paths.
- [ ] `git status` is clean before push.
