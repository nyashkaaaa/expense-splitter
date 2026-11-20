# AGENTS.md — Expense Splitter

Instructions for AI coding agents (Claude, Copilot, Codex, etc.) working in this repository.
Read this file fully before making any change.

## 1. Purpose

Expense Splitter is a small TypeScript command-line tool that records shared expenses,
splits them between people (equal / percent / exact) and calculates who owes whom.
It is a study project: there is no server, no database and no real user data.

## 2. Architecture

| Path | Responsibility |
|---|---|
| `src/index.ts` | CLI entry point: parses arguments, calls logic, prints output |
| `src/expenses.ts` | Business logic: `calculateSplit`, `validateExpense`, `calculateBalances`, `settleDebts` |
| `src/storage.ts` | Reads/writes the JSON data file (`data/expenses.json` by default) |
| `src/types.ts` | Shared types: `Expense`, `Share`, `Debt`, `SplitType` |
| `tests/expenses.test.ts` | Vitest unit tests for the business logic |
| `data/expenses.json` | Sample data with fake names only |

Rules:
- Business logic belongs in `src/expenses.ts` (or new modules under `src/`), **not** in `src/index.ts`.
- `src/index.ts` should only parse input, call functions and print results.
- File system access belongs only in `src/storage.ts`.

## 3. Setup

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run build
```

## 4. Safe commands (allowed without asking)

```bash
npm test              # run unit tests (vitest run)
npm run build         # compile TypeScript into dist/
npx tsc --noEmit      # type check only
node dist/index.js list
node dist/index.js balance
node dist/index.js settle
node dist/index.js add ... --file /tmp/test-expenses.json   # use a temporary file for manual tests
```

## 5. Coding conventions

- TypeScript with `strict` mode; do not disable strict checks or use `any` to silence errors.
- Small pure functions for logic; no side effects (console, fs) inside `src/expenses.ts`.
- Use `camelCase` for variables/functions, `PascalCase` for types.
- Keep changes minimal and focused on the task; do not reformat unrelated files.
- Comments and identifiers in English.

## 6. Test expectations

- Every behaviour change or bug fix must come with a new or updated test in `tests/`.
- `npm test` and `npm run build` must pass before a change is proposed as done.
- Report the **actual** command output (pass/fail totals). Never claim tests pass without running them.
- If a test cannot be run, say so explicitly.

## 7. Forbidden actions

The agent must NOT:
- Add, read or commit secrets, tokens, passwords or `.env` files.
- Put real personal data into `data/` or tests (use fake names like Alice, Bob, Chris).
- Run destructive commands: `rm -rf`, `git push --force`, `git reset --hard`, deleting `data/` or `tests/`.
- Overwrite `data/expenses.json` during experiments — use `--file /tmp/...` instead.
- Add, remove or upgrade dependencies (`npm install <pkg>`, editing `package.json` versions) without human approval.
- Deploy, publish (`npm publish`) or push to `main` directly.
- Delete or weaken existing tests to make them pass.

## 8. Review gates

1. Work on a separate branch (e.g. `agent/<short-task-name>`), never on `main`.
2. Provide: short change summary, the diff, test output and build output.
3. A human (repository owner) reviews and approves every diff before merge.
4. Dependency changes and changes to `AGENTS.md` itself always need explicit human approval.
