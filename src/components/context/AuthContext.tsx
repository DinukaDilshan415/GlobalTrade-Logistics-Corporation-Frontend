import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { GLOBAL_BASE_URL, DEFAULT_HEADERS } from "../../api/client";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
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

  const setToken = (token: string | null) => {
    setTokenState(token);
    try {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (e) {
      console.warn('Could not write token to localStorage', e);
    }
  };

  const logout = async () => {

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
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};