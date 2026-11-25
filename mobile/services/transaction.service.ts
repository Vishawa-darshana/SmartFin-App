import apiClient from './api';

export interface Transaction {
  id?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category_name: string;
  description: string;
  date: string;
  payment_method?: string;
  notes?: string;
}

export const transactionService = {
  getAll: (params?: Record<string, any>) => apiClient.get('/transactions', { params }),
  getById: (id: string) => apiClient.get(`/transactions/${id}`),
  create: (data: Transaction) => apiClient.post('/transactions', data),
  update: (id: string, data: Partial<Transaction>) => apiClient.put(`/transactions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/transactions/${id}`),
};
