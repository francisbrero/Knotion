import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // Redirect already authenticated users away from auth pages
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 