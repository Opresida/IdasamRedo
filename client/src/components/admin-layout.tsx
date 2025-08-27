
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

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Imprensa', href: '/imprensa', icon: Newspaper },
    { name: 'Financeiro', href: '/financeiro', icon: PiggyBank },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Projetos', href: '/projetos-admin', icon: FolderKanban },
  ];

  const handleLogout = () => {
    logout();
    setLocation('/admin');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-lg">
        {/* Header da Sidebar */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-idasam-green-dark to-idasam-green-medium">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-idasam-green-dark" />
            </div>
            <span className="text-white font-bold text-lg">IDASAM</span>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="flex items-center px-4 py-4 border-b border-gray-200">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarFallback className="bg-idasam-green-dark text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrador' : 'Editor'}
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-idasam-green-dark text-white hover:bg-idasam-green-dark/90'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setLocation(item.href)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </nav>

        {/* Botão de Sair */}
        <div className="px-2 pb-4">
          <Button
            variant="outline"
            className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </div>

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header do Conteúdo */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {navigation.find(item => item.href === location)?.name || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Sistema de Gestão de Conteúdo IDASAM
            </p>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
