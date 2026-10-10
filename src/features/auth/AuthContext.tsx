import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { AuthSession } from "../../shared/types";
import { logoutUser } from "./authenticationApi";

interface AuthContextValue {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  signOut: () => void;
}

const SESSION_KEY = "inkfig.auth-session";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSessionState] = useState<AuthSession | null>(loadSession);
  useEffect(() => {
    const expire = () => { queryClient.clear(); localStorage.removeItem(SESSION_KEY); setSessionState(null); };
    window.addEventListener("inkfig:auth-expired", expire);
    return () => window.removeEventListener("inkfig:auth-expired", expire);
  }, [queryClient]);
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession: (nextSession) => {
        queryClient.clear();
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        setSessionState(nextSession);
      },
      signOut: () => {
        queryClient.clear();
        void logoutUser().catch(() => undefined);
        localStorage.removeItem(SESSION_KEY);
        setSessionState(null);
      },
    }),
    [session, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}

function loadSession(): AuthSession | null {
  const value = localStorage.getItem(SESSION_KEY);
  if (!value) return null;
  try {
    const stored = JSON.parse(value) as AuthSession;
    if (!stored.email || !stored.fullName || !stored.userId || !stored.role || !Array.isArray(stored.permissions)) throw new Error("Invalid session");
    const session: AuthSession = { email: stored.email, fullName: stored.fullName, permissions: stored.permissions, role: stored.role, userId: stored.userId };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
