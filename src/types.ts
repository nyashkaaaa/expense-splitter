export type SplitType = 'equal' | 'percent' | 'exact';

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  splitType: SplitType;
  // for 'percent': percentages per participant, for 'exact': amounts per participant
  values?: number[];
  date: string;
}

export interface Share {
  person: string;
  amount: number;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}
