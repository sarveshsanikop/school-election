import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('adminToken') === 'true'; // Simplified for implementation demonstration
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}