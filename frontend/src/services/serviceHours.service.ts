import api from './api';

export const serviceHoursService = {
  getLeaderboard: async () => {
    const response = await api.get('/service-hours/leaderboard');
    return response.data;
  },
  getMyHours: async () => {
    const response = await api.get('/service-hours/my');
    return response.data;
  },
  logHours: async (data: any) => {
    const response = await api.post('/service-hours', data);
    return response.data;
  },
  // Admin
  getAll: async (params?: any) => {
    const response = await api.get('/service-hours', { params });
    return response.data;
  },
  approve: async (id: string) => {
    const response = await api.patch(`/service-hours/${id}/approve`);
    return response.data;
  },
  reject: async (id: string, reason?: string) => {
    const response = await api.patch(`/service-hours/${id}/reject`, { reason });
    return response.data;
  }
};
