import React from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = api.getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
