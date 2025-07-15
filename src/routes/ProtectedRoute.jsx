import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role, roles }) => {
  const userRole = sessionStorage.getItem('role');
  const normalizedUserRole = userRole ? userRole.toLowerCase() : null; // Safe check

  console.log('ProtectedRoute userRole:', userRole); // Debug log

  if (!normalizedUserRole || (role && normalizedUserRole !== role.toLowerCase()) || (roles && !roles.map(r => r.toLowerCase()).includes(normalizedUserRole))) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;