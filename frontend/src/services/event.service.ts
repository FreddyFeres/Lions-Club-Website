import api from './api';

export const eventService = {
  getAll: async (params?: any) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get(`/events/${slug}`);
    return response.data;
  },
  book: async (id: string) => {
    const response = await api.post(`/events/${id}/book`);
    return response.data;
  },
  cancelBooking: async (id: string) => {
    const response = await api.delete(`/events/${id}/book`);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get('/events/my/bookings');
    return response.data;
  },
  // Admin functions
  create: async (data: FormData) => {
    const response = await api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  update: async (id: string, data: FormData) => {
    const response = await api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  getAllBookings: async (id: string) => {
    const response = await api.get(`/events/${id}/bookings`);
    return response.data;
  },
  checkIn: async (eventId: string, bookingId: string) => {
    const response = await api.patch(`/events/${eventId}/bookings/${bookingId}/checkin`);
    return response.data;
  }
};
