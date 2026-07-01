import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string; currency?: string; language?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { name?: string; avatar?: string; currency?: string; language?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
};

export const expenseAPI = {
  getExpenses: (params?: any) => api.get('/expenses', { params }),
  getExpenseById: (id: string) => api.get(`/expenses/${id}`),
  createExpense: (data: any) => api.post('/expenses', data),
  updateExpense: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),
};

export const incomeAPI = {
  getIncome: (params?: any) => api.get('/income', { params }),
  getIncomeById: (id: string) => api.get(`/income/${id}`),
  createIncome: (data: any) => api.post('/income', data),
  updateIncome: (id: string, data: any) => api.put(`/income/${id}`, data),
  deleteIncome: (id: string) => api.delete(`/income/${id}`),
};

export const budgetAPI = {
  getBudgets: (params?: any) => api.get('/budgets', { params }),
  getBudgetById: (id: string) => api.get(`/budgets/${id}`),
  createBudget: (data: any) => api.post('/budgets', data),
  updateBudget: (id: string, data: any) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id: string) => api.delete(`/budgets/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getReports: (params?: any) => api.get('/analytics/reports', { params }),
  getMonthlyTrend: (params?: any) => api.get('/analytics/monthly-trend', { params }),
};

export const reminderAPI = {
  getReminders: (params?: any) => api.get('/reminders', { params }),
  getUpcoming: (params?: any) => api.get('/reminders/upcoming', { params }),
  getReminderById: (id: string) => api.get(`/reminders/${id}`),
  createReminder: (data: any) => api.post('/reminders', data),
  updateReminder: (id: string, data: any) => api.put(`/reminders/${id}`, data),
  deleteReminder: (id: string) => api.delete(`/reminders/${id}`),
};

export const insightsAPI = {
  getInsights: () => api.get('/insights'),
};

export default api;
