import apiClient from './api';

export interface Budget {
  id?: string;
  category_name: string;
  monthly_limit: number;
  month: number;
  year: number;
}

export const budgetService = {
  getAll: (params?: Record<string, any>) => apiClient.get('/budgets', { params }),
  create: (data: Budget) => apiClient.post('/budgets', data),
  update: (id: string, data: Partial<Budget>) => apiClient.put(`/budgets/${id}`, data),
  delete: (id: string) => apiClient.delete(`/budgets/${id}`),
};
