import { api } from '../utils/api';

export const getBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};