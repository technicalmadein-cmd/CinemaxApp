import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiUser, login as apiLogin, logout as apiLogout, restoreSession, signup as apiSignup } from "./api";

type AuthCtx = {
  user: ApiUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ApiUser>;
  signUp: (email: string, password: string, name?: string) => Promise<ApiUser>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const value: AuthCtx = {
    user,
    loading,
    signIn: async (e, p) => {
      const u = await apiLogin(e, p);
      setUser(u);
      return u;
    },
    signUp: async (e, p, n) => {
      const u = await apiSignup(e, p, n);
      setUser(u);
      return u;
    },
    signOut: async () => {
      await apiLogout();
      setUser(null);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
