import api from './api';

export const notificationService = {
  getAll: async (params?: any) => await api.get('/notifications', { params }),
  markAsRead: async (id: string) => await api.patch(`/notifications/${id}/read`),
  markAllAsRead: async () => await api.patch('/notifications/read-all'),
  delete: async (id: string) => await api.delete(`/notifications/${id}`),
};
