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

const percentSplit: SplitStrategy = {
  validate: (expense) =>
    !expense.values || expense.values.length !== expense.participants.length
      ? 'Percent split needs one value per participant'
      : null,
  calculate: (expense) =>
    expense.participants.map((p, i) => ({
      person: p,
      amount: (expense.amount * expense.values![i]) / 100,
    })),
};

const exactSplit: SplitStrategy = {
  validate: (expense) =>
    !expense.values || expense.values.length !== expense.participants.length
      ? 'Exact split needs one value per participant'
      : null,
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
