import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { AuthSession } from "../../shared/types";

interface AuthContextValue {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  signOut: () => void;
}

const SESSION_KEY = "inkfig.auth-session";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(loadSession);
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession: (nextSession) => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        setSessionState(nextSession);
      },
      signOut: () => {
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
    return JSON.parse(value) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
