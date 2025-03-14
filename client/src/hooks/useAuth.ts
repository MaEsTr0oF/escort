import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setAuth({
      isAuthenticated: !!token,
      token,
      loading: false
    });
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('adminToken', newToken);
    setAuth({
      isAuthenticated: true,
      token: newToken,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAuth({
      isAuthenticated: false,
      token: null,
      loading: false
    });
  };

  return { ...auth, login, logout };
};
