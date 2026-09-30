import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AppShell } from "../features/layout/AppShell";
import { LoginPage } from "../features/auth/LoginPage";
import { AuthLandingPage } from "../features/auth/AuthLandingPage";
import { RequireAuth } from "../features/auth/RequireAuth";
import { SignupPage } from "../features/auth/SignupPage";
import { VerifyEmailPage } from "../features/auth/VerifyEmailPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/:language/welcome" element={<AuthLandingPage />} />
      <Route path="/:language/login" element={<LoginPage />} />
      <Route path="/:language/signup" element={<SignupPage />} />
      <Route path="/:language/verify-email" element={<VerifyEmailPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/:language" element={<Navigate replace to="dashboard" />} />
          <Route path="/:language/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/ar/welcome" />} />
    </Routes>
  );
}
