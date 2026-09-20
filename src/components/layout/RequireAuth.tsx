import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth/AuthContext';
import { Role } from '../../types/domain';

interface RequireAuthProps {
  allowedRoles?: Role[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles }) => {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
