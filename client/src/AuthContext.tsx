import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  restaurantSlug?: string | null; // Optional, for display/SEO only
  restaurantId: string | null;
  login: (email: string, password: string) => Promise<boolean | string>;
  logout: () => void;
  register: (email: string, password: string, restaurantSlug: string, restaurantName?: string) => Promise<boolean | string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
  interface ImportMeta {
    env: {
      VITE_API_BASE_URL: string;
      [key: string]: any;
    };
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not defined. Please set it in your .env file and restart the dev server.');
}
const API_URL = API_BASE + '/api/auth';

export const AuthProvider = ({ children }: { children: any }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  // Remove restaurantSlug state, only keep restaurantId
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedId = localStorage.getItem('restaurantId');
    setToken(storedToken);
    setRestaurantId(storedId);
    setIsAuthenticated(!!storedToken);
  }, []);

  const login = async (email: string, password: string): Promise<boolean | string> => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.restaurantId) {
        setIsAuthenticated(true);
        setRestaurantId(data.restaurantId);
        // Store restaurantId in localStorage for persistence
        localStorage.setItem('restaurantId', data.restaurantId);
        return true;
      } else {
        return data.error || 'Login failed.';
      }
    } catch (err) {
      return 'Network error.';
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setRestaurantId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('restaurantId');
  };

  const register = async (email: string, password: string, restaurantSlug: string, restaurantName?: string): Promise<boolean | string> => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, restaurantSlug, restaurantName }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) return true;
      return data.error || 'Registration failed.';
    } catch (err) {
      return 'Network error.';
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, restaurantId, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext) as AuthContextType | undefined;
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 