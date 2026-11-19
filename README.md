# Expense Splitter

A small command-line tool to track shared expenses between friends and see who owes whom.

## Features

- Add an expense and split it **equally**, **by percent** or **by exact amounts**
- List all expenses
- Show the net balance of each person
- Show the minimal list of payments to settle up

All data is stored locally in `data/expenses.json` (sample data uses fake names only).

## Setup

```bash
npm install
npm run build
```

## Usage

```bash
# add an expense split equally
node dist/index.js add "Pizza" 6000 --paid-by Alice --with Alice,Bob,Chris

# split by percent
node dist/index.js add "Taxi" 2500 --paid-by Bob --with Alice,Bob --split percent --values 40,60

# split by exact amounts
node dist/index.js add "Groceries" 5000 --paid-by Chris --with Alice,Chris --split exact --values 2000,3000

node dist/index.js list
node dist/index.js balance
node dist/index.js settle
```

## Tests

```bash
npm test
npm run lint
```

## Project structure

```
src/
  index.ts      CLI entry point
  expenses.ts   split, validation, balance and settle logic
  storage.ts    load/save JSON file
  types.ts      shared types
tests/
  expenses.test.ts
data/
  expenses.json sample data
```
