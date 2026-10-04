import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

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
  const [session, setSessionState] = useState<AuthSession | null>(loadSession);
  useEffect(() => {
    const expire = () => { localStorage.removeItem(SESSION_KEY); setSessionState(null); };
    window.addEventListener("inkfig:auth-expired", expire);
    return () => window.removeEventListener("inkfig:auth-expired", expire);
  }, []);
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession: (nextSession) => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        setSessionState(nextSession);
      },
      signOut: () => {
        void logoutUser().catch(() => undefined);
        localStorage.removeItem(SESSION_KEY);
        setSessionState(null);
      },
    }),
    [session],
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
    if (!stored.email || !stored.fullName || !stored.userId || !Array.isArray(stored.permissions)) throw new Error("Invalid session");
    const session: AuthSession = { email: stored.email, fullName: stored.fullName, permissions: stored.permissions, userId: stored.userId };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
