
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  handleSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function deriveDisplayInfo(email: string): { name: string; role: string } {
  const local = email.split("@")[0] || "user";
  const name = local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]/g, " ");
  return { name, role: "admin" };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('idasam_auth_user');
    const savedToken = localStorage.getItem('idasam_admin_token');
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${savedToken}` },
        }).then((res) => {
          if (res.ok) {
            setUser(parsedUser);
            setAdminToken(savedToken);
          } else if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('idasam_auth_user');
            localStorage.removeItem('idasam_admin_token');
            localStorage.setItem('idasam_session_expired', '1');
          } else {
            setUser(parsedUser);
            setAdminToken(savedToken);
          }
          setIsLoading(false);
        }).catch(() => {
          setUser(parsedUser);
          setAdminToken(savedToken);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        localStorage.removeItem('idasam_auth_user');
        localStorage.removeItem('idasam_admin_token');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setIsLoading(false);
        return false;
      }

      const data = await res.json();
      const display = deriveDisplayInfo(email);
      const authUser: User = {
        id: email,
        name: display.name,
        email,
        role: display.role,
      };

      setUser(authUser);
      setAdminToken(data.token);
      localStorage.setItem('idasam_auth_user', JSON.stringify(authUser));
      localStorage.setItem('idasam_admin_token', data.token);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Erro no login:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    const token = localStorage.getItem('idasam_admin_token');
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setUser(null);
    setAdminToken(null);
    localStorage.removeItem('idasam_auth_user');
    localStorage.removeItem('idasam_admin_token');
  };

  const handleSessionExpired = () => {
    setUser(null);
    setAdminToken(null);
    localStorage.removeItem('idasam_auth_user');
    localStorage.removeItem('idasam_admin_token');
    localStorage.setItem('idasam_session_expired', '1');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!adminToken,
    isLoading,
    adminToken,
    login,
    logout,
    handleSessionExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
