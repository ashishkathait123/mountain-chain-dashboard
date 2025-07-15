import { api } from '../utils/api';

export const getTrips = async () => {
  const response = await api.get('/trips');
  return response.data;
};