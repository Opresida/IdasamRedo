import React, { useState, useEffect } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/contexts/auth-context';
import PageLoader from '@/components/page-loader';
import ProtectedRoute from '@/components/protected-route';
import Home from '@/pages/home';
import Projetos from '@/pages/projetos';
import NoticiasPage from '@/pages/noticias';
import LoginPage from '@/pages/login';
import AdminDashboard from './pages/admin';
import AdminLayout from './components/admin-layout';
import DashboardPage from './pages/dashboard';
import ImprensaPage from './pages/imprensa';
import FinanceiroPage from './pages/financeiro';
import AgendaPage from './pages/agenda';
import ProjetosAdminPage from './pages/projetos-admin';
import NotFound from '@/pages/not-found';
import PaginaDeDoacao from '@/PaginaDeDoacao';
import PaginaDeDoacaoEUR from '@/PaginaDeDoacaoEUR';

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
        <Route path="/dashboard" component={() => (
          <ProtectedRoute>
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        )} />
        <Route path="/imprensa" component={() => (
          <ProtectedRoute>
            <AdminLayout>
              <ImprensaPage />
            </AdminLayout>
          </ProtectedRoute>
        )} />
        <Route path="/financeiro" component={() => (
          <ProtectedRoute>
            <AdminLayout>
              <FinanceiroPage />
            </AdminLayout>
          </ProtectedRoute>
        )} />
        <Route path="/agenda" component={() => (
          <ProtectedRoute>
            <AdminLayout>
              <AgendaPage />
            </AdminLayout>
          </ProtectedRoute>
        )} />
        <Route path="/projetos-admin" component={() => (
          <ProtectedRoute>
            <AdminLayout>
              <ProjetosAdminPage />
            </AdminLayout>
          </ProtectedRoute>
        )} />
        <Route path="/admin-old" component={() => <ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/doacao-usd" component={PaginaDeDoacao} />
        <Route path="/doacao-eur" component={PaginaDeDoacaoEUR} />
        <Route component={NotFound} />
      </Switch>
    </PageLoader>
  );
}

export default function App() {
  return (
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
  );
}