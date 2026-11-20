import { Expense, Share, SplitType } from './types';

// Strategy pattern: each split type knows how to validate and calculate itself
export interface SplitStrategy {
  validate(expense: Expense): string | null;
  calculate(expense: Expense): Share[];
}

const equalSplit: SplitStrategy = {
  validate: () => null,
  calculate: (expense) => {
    const each = expense.amount / expense.participants.length;
    return expense.participants.map((p) => ({ person: p, amount: each }));
  },
};

// Allowed difference when comparing sums (protects against small rounding like 33.33 + 33.33 + 33.34)
const TOLERANCE = 0.01;

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

const percentSplit: SplitStrategy = {
  validate: (expense) => {
    if (!expense.values || expense.values.length !== expense.participants.length) {
      return 'Percent split needs one value per participant';
    }
    // written as !(a <= b) so that NaN is also rejected
    if (!(Math.abs(sum(expense.values) - 100) <= TOLERANCE)) {
      return 'Percent values must add up to 100';
    }
    return null;
  },
  calculate: (expense) =>
    expense.participants.map((p, i) => ({
      person: p,
      amount: (expense.amount * expense.values![i]) / 100,
    })),
};

const exactSplit: SplitStrategy = {
  validate: (expense) => {
    if (!expense.values || expense.values.length !== expense.participants.length) {
      return 'Exact split needs one value per participant';
    }
    if (!(Math.abs(sum(expense.values) - expense.amount) <= TOLERANCE)) {
      return 'Exact values must add up to the amount';
    }
    return null;
  },
  calculate: (expense) =>
    expense.participants.map((p, i) => ({ person: p, amount: expense.values![i] })),
};

const strategies: Record<SplitType, SplitStrategy> = {
  equal: equalSplit,
  percent: percentSplit,
  exact: exactSplit,
};

export function getSplitStrategy(type: string): SplitStrategy | undefined {
  return strategies[type as SplitType];
}
