import api from './api';

export const documentService = {
  getAll: async (params?: any) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },
  upload: async (data: FormData) => {
    const response = await api.post('/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  getDownloadUrl: (id: string) => {
    return `${import.meta.env.VITE_API_URL || '/api'}/documents/${id}/download`;
  }
};
