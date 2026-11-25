import apiClient from './api';

export const reportService = {
  getMonthlySummary: (month: number, year: number) =>
    apiClient.get('/reports/monthly', { params: { month, year } }),
  getFinancialSummary: () => apiClient.get('/reports/financial-summary'),
  getPdfReportUrl: (month: number, year: number) =>
    `${apiClient.defaults.baseURL}/reports/export/pdf?month=${month}&year=${year}`,
};
