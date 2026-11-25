import apiClient from './api';

export interface SavingsGoal {
  id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
}

export const savingsService = {
  getAll: () => apiClient.get('/savings-goals'),
  create: (data: SavingsGoal) => apiClient.post('/savings-goals', data),
  update: (id: string, data: Partial<SavingsGoal>) => apiClient.put(`/savings-goals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/savings-goals/${id}`),
  addContribution: (goalId: string, amount: number, notes?: string) =>
    apiClient.post(`/savings-goals/${goalId}/contributions`, { amount, notes }),
};
