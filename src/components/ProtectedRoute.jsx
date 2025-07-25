import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has required role
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const adminRoutes = ['/admin', '/admin/users'];
  const currentPath = window.location.pathname;
  const isAdminRoute = adminRoutes.some(route => currentPath.startsWith(route));

  // If accessing an admin route
  if (isAdminRoute) {
    if (!isAuthenticated) {
      // Not logged in, redirect to admin login
      return <Navigate to="/admin/login" replace />;
    }
    if (user?.role !== 'admin') {
      // Logged in but not admin, redirect to unauthorized
      return <Navigate to="/unauthorized" replace />;
    }
    // Admin accessing admin route: allow
    return <Outlet />;
  }

  // Allow admins to access all routes (no restriction)
  return <Outlet />;
};

export default ProtectedRoute;