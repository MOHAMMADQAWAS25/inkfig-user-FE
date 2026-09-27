import type { ReactNode } from "react";

import { AuthProvider } from "../features/auth/AuthContext";
import { I18nProvider } from "../i18n/I18nProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nProvider>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
}
