import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const isBlacklistedOwner = user?.role === 'Owner' && user?.status_label === 'Blacklisted';

  useEffect(() => {
    if (isBlacklistedOwner) logout();
  }, [isBlacklistedOwner, logout]);

  if (!isAuthenticated || isBlacklistedOwner) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
