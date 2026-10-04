import api from './api';

export const userService = {
  getDirectory: async (params?: any) => {
    const response = await api.get('/users/directory', { params });
    return response.data;
  },
  getProfile: async (id: string = 'me') => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  updateAvatar: async (data: FormData) => {
    const response = await api.patch('/users/profile/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  // Admin
  getAll: async (params?: any) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  exportMembers: async () => {
    const response = await api.get('/users/export', { responseType: 'blob' });
    return response.data;
  },
  promote: async (id: string, role: string) => {
    const response = await api.patch(`/users/${id}/promote`, { role });
    return response.data;
  },
  updateDues: async (id: string, duesPaidUntil: string | null) => {
    const response = await api.patch(`/users/${id}/dues`, { duesPaidUntil });
    return response.data;
  },
  deactivate: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/users/${id}/deactivate`, { isActive });
    return response.data;
  }
};
