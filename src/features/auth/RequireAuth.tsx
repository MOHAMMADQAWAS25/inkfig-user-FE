import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./AuthContext";
import { useI18n } from "../../i18n/I18nProvider";

export function RequireAuth() {
  const { session } = useAuth();
  const { language } = useI18n();
  const location = useLocation();

  if (session === null) {
    return <Navigate replace state={{ from: location.pathname }} to={`/${language}/login`} />;
  }

  return <Outlet />;
}
