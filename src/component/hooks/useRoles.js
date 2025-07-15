import { useAuth } from '../context/AuthContext';

export const useRoles = () => {
  const { user } = useAuth();
  return user?.role || null;
};