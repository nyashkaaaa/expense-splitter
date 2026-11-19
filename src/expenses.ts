import { Expense, Share, Debt } from './types';

// Calculates how much each participant owes for one expense
export function calculateSplit(expense: Expense): Share[] {
  const shares: Share[] = [];

  if (expense.splitType === 'equal') {
    const each = expense.amount / expense.participants.length;
    for (const p of expense.participants) {
      shares.push({ person: p, amount: each });
    }
  } else if (expense.splitType === 'percent') {
    expense.participants.forEach((p, i) => {
      const percent = expense.values![i];
      shares.push({ person: p, amount: (expense.amount * percent) / 100 });
    });
  } else if (expense.splitType === 'exact') {
    expense.participants.forEach((p, i) => {
      shares.push({ person: p, amount: expense.values![i] });
    });
  }

  return shares;
}

// Basic validation before saving an expense
export function validateExpense(expense: Expense): string | null {
  if (!expense.description) {
    return 'Description is required';
  }
  if (expense.participants.length === 0) {
    return 'At least one participant is required';
  }

  if (expense.splitType === 'equal') {
    // nothing extra to check
  } else if (expense.splitType === 'percent') {
    if (!expense.values || expense.values.length !== expense.participants.length) {
      return 'Percent split needs one value per participant';
    }
  } else if (expense.splitType === 'exact') {
    if (!expense.values || expense.values.length !== expense.participants.length) {
      return 'Exact split needs one value per participant';
    }
  } else {
    return 'Unknown split type: ' + expense.splitType;
  }

  return null;
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
