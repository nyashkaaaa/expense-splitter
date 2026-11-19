import { Expense, Share, Debt } from './types';
import { getSplitStrategy } from './splitStrategies';

// Calculates how much each participant owes for one expense
export function calculateSplit(expense: Expense): Share[] {
  const strategy = getSplitStrategy(expense.splitType);
  return strategy ? strategy.calculate(expense) : [];
}

// Basic validation before saving an expense
export function validateExpense(expense: Expense): string | null {
  if (!expense.description) {
    return 'Description is required';
  }
  if (expense.participants.length === 0) {
    return 'At least one participant is required';
  }

  const strategy = getSplitStrategy(expense.splitType);
  if (!strategy) {
    return 'Unknown split type: ' + expense.splitType;
  }
  return strategy.validate(expense);
}

// Net balance per person: positive = others owe them, negative = they owe others
export function calculateBalances(expenses: Expense[]): Record<string, number> {
  const balances: Record<string, number> = {};

  for (const e of expenses) {
    balances[e.paidBy] = (balances[e.paidBy] || 0) + e.amount;
    const shares = calculateSplit(e);
    for (const s of shares) {
      balances[s.person] = (balances[s.person] || 0) - s.amount;
    }
  }

  return balances;
}

// Turns balances into a list of "who pays whom"
export function settleDebts(balances: Record<string, number>): Debt[] {
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < 0)
    .map(([person, v]) => ({ person, amount: -v }));
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0)
    .map(([person, v]) => ({ person, amount: v }));

  const debts: Debt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    debts.push({ from: debtors[i].person, to: creditors[j].person, amount: pay });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return debts;
}
