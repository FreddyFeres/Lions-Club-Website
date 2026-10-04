import api from './api';

export const financeService = {
  // Public
  getDonations: async () => {
    const response = await api.get('/finances/donations');
    return response.data;
  },
  donate: async (data: any) => {
    const response = await api.post('/finances/donations', data);
    return response.data;
  },
  // Admin
  getTransactions: async (params?: any) => {
    const response = await api.get('/finances/transactions', { params });
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/finances/summary');
    return response.data;
  },
  createTransaction: async (data: FormData) => {
    const response = await api.post('/finances/transactions', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  updateTransaction: async (id: string, data: FormData) => {
    const response = await api.put(`/finances/transactions/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  deleteTransaction: async (id: string) => {
    const response = await api.delete(`/finances/transactions/${id}`);
    return response.data;
  }
};
