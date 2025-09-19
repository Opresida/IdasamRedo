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
import UsuariosPage from '@/pages/dashboard/usuarios';
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
        <Route path="/dashboard/usuarios">
          <ProtectedRoute>
            <AdminLayout>
              <UsuariosPage />
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
  useEffect(() => {
    // Enhanced WebSocket error suppression for Replit environment
    const handleWebSocketError = (event: Event) => {
      if (event.target instanceof WebSocket) {
        console.warn('WebSocket connection blocked (Replit environment)');
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Handle all fetch-related errors (including Vite ping attempts)
    const handleFetchError = (event: Event) => {
      const error = event.error || event;
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('fetch') ||
          error?.stack?.includes('ping')) {
        console.warn('Vite fetch attempt blocked (Replit environment)');
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason?.message?.includes('WebSocket') || 
          reason?.message?.includes('Failed to construct') ||
          reason?.message?.includes('Failed to fetch') ||
          reason?.stack?.includes('ping') ||
          reason?.stack?.includes('waitForSuccessfulPing')) {
        event.preventDefault(); // Prevent console spam
        console.warn('Vite connection attempt suppressed (Replit environment)');
      }
    };

    // Block WebSocket constructor entirely
    const originalWebSocket = window.WebSocket;
    window.WebSocket = class extends originalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        const urlStr = url.toString();
        if (urlStr.includes('vite') || urlStr.includes('hmr') || urlStr.includes('@vite')) {
          console.warn('Vite WebSocket blocked (Replit environment)');
          throw new Error('WebSocket blocked in Replit environment');
        }
        super(url, protocols);
      }
    };

    window.addEventListener('error', handleWebSocketError, true);
    window.addEventListener('error', handleFetchError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWebSocketError, true);
      window.removeEventListener('error', handleFetchError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      // Restore original WebSocket
      window.WebSocket = originalWebSocket;
    };
  }, []);

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