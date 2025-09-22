
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Lock, User, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { useAnalyticsAndSEO } from '../hooks/use-analytics';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  
  const { login, isLoading, isAuthenticated } = useAuth();
  const { trackPageView, updateSEO } = useAnalyticsAndSEO();

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  // Configurar SEO
  useEffect(() => {
    updateSEO({
      title: 'Login Administrativo | IDASAM',
      description: 'Acesso restrito ao painel administrativo do IDASAM',
      keywords: ['login', 'admin', 'IDASAM', 'administrativo'],
      url: `${window.location.origin}/admin`,
      type: 'website'
    });

    trackPageView('/admin', 'Admin Login');
  }, [updateSEO, trackPageView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      setLocation('/dashboard');
    } else {
      setError('Email ou senha incorretos. Tente novamente.');
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'editor') => {
    if (type === 'admin') {
      setEmail('admin@idasam.org');
      setPassword('idasam2024');
    } else {
      setEmail('editor@idasam.org');
      setPassword('editor2024');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-idasam-green-light/20 via-white to-idasam-green-medium/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-6 text-center">
          <div className="mx-auto w-20 h-20 bg-idasam-green-dark rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-idasam-text-main">
              Painel Administrativo
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Acesso restrito aos administradores do IDASAM
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-idasam-green-dark hover:bg-idasam-green-medium text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Credenciais de demonstração */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 text-center mb-3">
              Credenciais de demonstração:
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('admin')}
                className="w-full text-xs"
                disabled={isLoading}
              >
                Admin: admin@idasam.org / idasam2024
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('editor')}
                className="w-full text-xs"
                disabled={isLoading}
              >
                Editor: editor@idasam.org / editor2024
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Acesso restrito aos membros autorizados da equipe IDASAM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
