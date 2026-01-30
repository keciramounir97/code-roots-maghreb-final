/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "../../lib/api";

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: number; // roleId mapped to role
  roleName?: string;
  status: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (fullName: string, phone: string | undefined, email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<User>;
  requestReset: (email: string) => Promise<any>;
  verifyReset: (email: string, code: string, newPassword: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeEmail = (value: string | undefined | null) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      return res.data;
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      return null;
    }
  }, []);

  /* LOAD SESSION */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  useEffect(() => {
    const onAuthExpired = () => {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    };

    const onAuthMissing = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:expired", onAuthExpired);
    // @ts-ignore - custom event
    window.addEventListener("auth:missing", onAuthMissing);
    return () => {
      window.removeEventListener("auth:expired", onAuthExpired);
      // @ts-ignore
      window.removeEventListener("auth:missing", onAuthMissing);
    };
  }, []);

  /* SIGNUP */
  const signup = (fullName: string, phone: string | undefined, email: string, password: string) =>
    api.post("/auth/signup", {
      fullName: fullName?.trim(),
      phone: phone?.trim(),
      email: normalizeEmail(email),
      password,
    });

  /* LOGIN */
  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", {
      email: normalizeEmail(email),
      password,
    });
    localStorage.setItem("token", res.data.token);
    if (res.data.refreshToken) {
      localStorage.setItem("refreshToken", res.data.refreshToken);
    }

    setUser(res.data.user);

    return res.data.user;
  };

  /* PASSWORD RESET */
  const requestReset = (email: string) =>
    api.post("/auth/reset", { email: normalizeEmail(email) });

  const verifyReset = (email: string, code: string, newPassword: string) =>
    api.post("/auth/reset/verify", {
      email: normalizeEmail(email),
      code: String(code || "").trim(),
      newPassword,
    });

  /* LOGOUT */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        requestReset,
        verifyReset,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
