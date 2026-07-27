import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../store/authStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // If authenticated but role doesn't match, redirect to their specific dashboard or a generic unauthorized page
    if (user.role === 'SCHOOL_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and role matches, render children routes
  return <Outlet />;
};
