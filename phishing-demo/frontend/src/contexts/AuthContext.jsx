import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("session") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      localStorage.removeItem("session");
      return;
    }
    localStorage.setItem("session", JSON.stringify(session));
  }, [session]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      const nextSession = { email: data.email, role: data.role };
      setSession(nextSession);
      return nextSession;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
  };

  const value = useMemo(
    () => ({ session, login, logout, loading }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
