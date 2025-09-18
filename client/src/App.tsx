import React, { useState, useEffect } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/contexts/auth-context';
import PageLoader from '@/components/page-loader';
import ProtectedRoute from '@/components/protected-route';
import ErrorBoundary from '@/components/error-boundary';
import Home from '@/pages/home';
import Projetos from '@/pages/projetos';
import NoticiasPage from '@/pages/noticias';
import LoginPage from '@/pages/login';
import NotFound from '@/pages/not-found';
import PaginaDeDoacao from '@/PaginaDeDoacao';
import PaginaDeDoacaoEUR from '@/PaginaDeDoacaoEUR';
import AdminLayout from '@/components/admin-layout';
import DashboardPage from '@/pages/dashboard';
import ImprensaPage from '@/pages/imprensa';
import DashboardFinanceiroPage from '@/pages/dashboard/financeiro';
import AgendaPage from '@/pages/agenda';
import ProjetosAdminPage from '@/pages/projetos-admin';
import TransparenciaPage from './pages/transparencia';
import BioPage from './pages/bio';

function AppContent() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <PageLoader isLoading={isLoading}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projetos" component={Projetos} />
        <Route path="/noticias" component={NoticiasPage} />
        <Route path="/admin" component={LoginPage} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/imprensa">
          <ProtectedRoute>
            <AdminLayout>
              <ImprensaPage />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/financeiro">
          <ProtectedRoute>
            <AdminLayout>
              <DashboardFinanceiroPage />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/agenda">
          <ProtectedRoute>
            <AdminLayout>
              <AgendaPage />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/projetos-admin">
          <ProtectedRoute>
            <AdminLayout>
              <ProjetosAdminPage />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/projetos">
          <ProtectedRoute>
            <AdminLayout>
              <ProjetosAdminPage />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/doacao-usd" component={PaginaDeDoacao} />
        <Route path="/doacao-eur" component={PaginaDeDoacaoEUR} />
        <Route path="/transparencia" component={TransparenciaPage} />
        <Route path="/bio" component={BioPage} />
        <Route component={NotFound} />
      </Switch>
    </PageLoader>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}