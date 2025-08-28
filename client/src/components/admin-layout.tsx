
import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import {
  LayoutDashboard,
  Newspaper,
  PiggyBank,
  Calendar,
  FolderKanban,
  LogOut,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/admin');
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      description: 'Visão geral do sistema'
    },
    {
      label: 'Imprensa',
      icon: Newspaper,
      path: '/imprensa',
      description: 'Gerenciar artigos e notícias'
    },
    {
      label: 'Financeiro',
      icon: PiggyBank,
      path: '/financeiro',
      description: 'Controle financeiro'
    },
    {
      label: 'Agenda',
      icon: Calendar,
      path: '/agenda',
      description: 'Cronograma e eventos'
    },
    {
      label: 'Projetos',
      icon: FolderKanban,
      path: '/projetos',
      description: 'Gestão de projetos'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo e Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-idasam-green-dark to-idasam-green-medium rounded-lg flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">IDASAM</h1>
              <p className="text-xs text-gray-600">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-idasam-green-dark text-white text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.role === 'admin' ? 'Administrador' : 'Editor'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-idasam-green-dark text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center text-gray-700 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair do Sistema
          </Button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Sistema v1.0 | IDASAM © 2024
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Sistema Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header Principal */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-600">
                  Bem-vindo ao painel administrativo
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocation('/')}
                className="text-gray-600"
              >
                Ver Site Público
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
