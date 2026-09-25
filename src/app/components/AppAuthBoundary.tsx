import React from 'react';
import { AuthProvider } from '../../contexts/AuthContext';

type AppAuthBoundaryProps = {
  children: React.ReactNode;
};

/**
 * Keeps Supabase authentication out of the public-site bootstrap.
 * This module is lazy-loaded only when a private /app route is rendered.
 */
const AppAuthBoundary: React.FC<AppAuthBoundaryProps> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

export default AppAuthBoundary;
