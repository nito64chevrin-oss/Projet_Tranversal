import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGet, apiPost, setAuthToken } from "../services/http";
import { useLocalStorage } from "../hooks/useLocalStorage.ts";
import type { AuthResponse, User } from "../types/api";

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useLocalStorage<string | null>("token", null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setAuthToken(token);

    if (token) {
      apiGet<User>("/auth/me")
        .then((u) => setUser(u))
        .catch(() => {
          setToken(null);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [token]);

  async function login(email: string, password: string): Promise<void> {
    const data = await apiPost<AuthResponse>("/auth/login", { email, password });
    setToken(data.access_token);
  }

  async function register(email: string, password: string): Promise<void> {
    await apiPost<User>("/auth/register", { email, password });
    await login(email, password);
  }

  function logout(): void {
    setToken(null);
    setUser(null);
  }

  const value: AuthContextType = {
    token,
    user,
    login,
    register,
    logout,
    isAuthenticated: token !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}