import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { GLOBAL_BASE_URL, DEFAULT_HEADERS } from "../../api/client";

interface AuthContextType {
  token: string | null;
  roles: string[];
  isLoading: boolean;
  setAuth: (token: string | null, roles?: string[]) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token');
    } catch (e) {
      console.warn('Could not read token from localStorage', e);
      return null;
    }
  });

  const [roles, setRolesState] = useState<string[]>(() => {
    try {
      const storedRoles = localStorage.getItem('roles');
      if (!storedRoles) return [];
      const parsedRoles = JSON.parse(storedRoles);
      return Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles].filter(Boolean);
    } catch (e) {
      console.warn('Could not read roles from localStorage', e);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const setAuth = (token: string | null, roles?: string[]) => {
    setTokenState(token);
    const nextRoles = roles ?? [];
    setRolesState(nextRoles);
    try {
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('roles', JSON.stringify(nextRoles));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
      }
    } catch (e) {
      console.warn('Could not write token to localStorage', e);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await fetch(`${GLOBAL_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: DEFAULT_HEADERS,
        body: token
      });
    } catch (e) {
      console.warn('Logout request failed', e);
    } finally {
      setAuth(null, []);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ token, roles, isLoading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};