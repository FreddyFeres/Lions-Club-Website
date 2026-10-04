import api from './api';

export const meetingService = {
  getAll: async (params?: any) => {
    const response = await api.get('/meetings', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/meetings/${id}`);
    return response.data;
  },
  rsvp: async (id: string, status: 'yes' | 'no' | 'maybe') => {
    const response = await api.post(`/meetings/${id}/rsvp`, { rsvpStatus: status });
    return response.data;
  },
  getMyRsvps: async () => {
    const response = await api.get('/meetings/my/rsvps');
    return response.data;
  },
  // Admin functions
  create: async (data: FormData) => {
    const response = await api.post('/meetings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  update: async (id: string, data: FormData) => {
    const response = await api.put(`/meetings/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/meetings/${id}`);
    return response.data;
  },
  getAttendance: async (id: string) => {
    const response = await api.get(`/meetings/${id}/attendance`);
    return response.data;
  },
  checkIn: async (meetingId: string, attendanceId: string, status: 'present' | 'absent' | 'excused') => {
    const response = await api.patch(`/meetings/${meetingId}/attendance/${attendanceId}/checkin`, { status });
    return response.data;
  }
};
