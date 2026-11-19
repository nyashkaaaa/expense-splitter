import { describe, it, expect } from 'vitest';
import { calculateSplit, validateExpense, calculateBalances, settleDebts } from '../src/expenses';
import { Expense } from '../src/types';

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 1,
    description: 'Pizza',
    amount: 6000,
    paidBy: 'Alice',
    participants: ['Alice', 'Bob', 'Chris'],
    splitType: 'equal',
    date: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('calculateSplit', () => {
  it('splits equally between participants', () => {
    const shares = calculateSplit(makeExpense());
    expect(shares).toEqual([
      { person: 'Alice', amount: 2000 },
      { person: 'Bob', amount: 2000 },
      { person: 'Chris', amount: 2000 },
    ]);
  });

  it('splits by percent', () => {
    const shares = calculateSplit(makeExpense({ splitType: 'percent', values: [50, 30, 20] }));
    expect(shares.map((s) => s.amount)).toEqual([3000, 1800, 1200]);
  });

  it('splits by exact amounts', () => {
    const shares = calculateSplit(makeExpense({ splitType: 'exact', values: [1000, 2000, 3000] }));
    expect(shares.map((s) => s.amount)).toEqual([1000, 2000, 3000]);
  });
});

describe('validateExpense', () => {
  it('accepts a valid expense', () => {
    expect(validateExpense(makeExpense())).toBeNull();
  });

  it('rejects missing description', () => {
    expect(validateExpense(makeExpense({ description: '' }))).toBe('Description is required');
  });
});

describe('balances and settling', () => {
  it('calculates who owes whom', () => {
    const balances = calculateBalances([makeExpense()]);
    expect(balances).toEqual({ Alice: 4000, Bob: -2000, Chris: -2000 });

    const debts = settleDebts(balances);
    expect(debts).toEqual([
      { from: 'Bob', to: 'Alice', amount: 2000 },
      { from: 'Chris', to: 'Alice', amount: 2000 },
    ]);
  });
});
