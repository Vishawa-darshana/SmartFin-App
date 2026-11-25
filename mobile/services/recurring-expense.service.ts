import apiClient from './api';

export interface RecurringExpense {
  id?: string;
  name: string;
  amount: number;
  category_name: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  start_date: string;
  next_payment_date: string;
  end_date?: string;
  is_active: boolean;
}

export const recurringExpenseService = {
  getAll: () => apiClient.get('/recurring-expenses'),
  create: (data: RecurringExpense) => apiClient.post('/recurring-expenses', data),
  update: (id: string, data: Partial<RecurringExpense>) => apiClient.put(`/recurring-expenses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/recurring-expenses/${id}`),
  markPaid: (id: string) => apiClient.post(`/recurring-expenses/${id}/mark-paid`),
};
