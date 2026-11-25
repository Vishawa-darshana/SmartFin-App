import apiClient from './api';

export interface CategoryItem {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  is_default: boolean;
  icon?: string;
  color?: string;
}

export const categoryService = {
  getAll: (type?: 'INCOME' | 'EXPENSE') =>
    apiClient.get<CategoryItem[]>('/categories', { params: type ? { type } : undefined }),
  create: (data: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string; color?: string }) =>
    apiClient.post<CategoryItem>('/categories', data),
};
