
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/auth-context';
import PageLoader from './page-loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/admin');
    } else if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      // Se precisar de uma role específica e o usuário não tem
      setLocation('/admin');
    }
  }, [isAuthenticated, isLoading, setLocation, requiredRole, user]);

  if (isLoading) {
    return <PageLoader isLoading={true} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
