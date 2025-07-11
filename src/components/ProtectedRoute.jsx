// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/accounts/sign-in" state={{ from: location }} replace />;
  }

  // If a specific role is required, you can add role-based checks here
  // For now, we'll just check authentication
  
  return children;
};

export default ProtectedRoute;