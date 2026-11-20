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

  it('rejects percent split with wrong number of values', () => {
    expect(validateExpense(makeExpense({ splitType: 'percent', values: [50, 50] }))).toBe(
      'Percent split needs one value per participant'
    );
  });

  it('rejects exact split without values', () => {
    expect(validateExpense(makeExpense({ splitType: 'exact' }))).toBe(
      'Exact split needs one value per participant'
    );
  });

  it('rejects unknown split type', () => {
    const expense = makeExpense({ splitType: 'shares' as unknown as Expense['splitType'] });
    expect(validateExpense(expense)).toBe('Unknown split type: shares');
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

describe('mitigation C2/C3: split values must match the amount', () => {
  it('rejects percent values that do not add up to 100', () => {
    expect(validateExpense(makeExpense({ splitType: 'percent', values: [10, 10, 10] }))).toBe(
      'Percent values must add up to 100'
    );
  });

  it('accepts percent values that add up to 100 with small rounding', () => {
    expect(validateExpense(makeExpense({ splitType: 'percent', values: [33.33, 33.33, 33.34] }))).toBeNull();
  });

  it('rejects exact values that do not add up to the amount', () => {
    expect(validateExpense(makeExpense({ splitType: 'exact', values: [1000, 1000, 1000] }))).toBe(
      'Exact values must add up to the amount'
    );
  });
});

describe('mitigation C4: amount and values must be valid numbers', () => {
  it('rejects a non-numeric amount (NaN)', () => {
    expect(validateExpense(makeExpense({ amount: NaN }))).toBe('Amount must be a positive number');
  });

  it('rejects a negative amount', () => {
    expect(validateExpense(makeExpense({ amount: -500 }))).toBe('Amount must be a positive number');
  });

  it('rejects a zero amount', () => {
    expect(validateExpense(makeExpense({ amount: 0 }))).toBe('Amount must be a positive number');
  });

  it('rejects non-numeric or negative split values', () => {
    expect(
      validateExpense(makeExpense({ splitType: 'exact', values: [7000, -1000, NaN] }))
    ).toBe('Split values must be non-negative numbers');
  });
});
