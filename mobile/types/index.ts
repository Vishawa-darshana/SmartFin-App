export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export interface TransactionItem {
  id: string;
  amount: number;
  type: TransactionType;
  category_name: string;
  description: string;
  date: string;
  payment_method?: string;
  notes?: string;
}
