import * as fs from 'fs';
import { Expense } from './types';

export const DEFAULT_FILE = 'data/expenses.json';

export function loadExpenses(file: string = DEFAULT_FILE): Expense[] {
  if (!fs.existsSync(file)) {
    return [];
  }
  const raw = fs.readFileSync(file, 'utf-8');
  return JSON.parse(raw);
}

export function saveExpenses(expenses: Expense[], file: string = DEFAULT_FILE): void {
  fs.writeFileSync(file, JSON.stringify(expenses, null, 2));
}
