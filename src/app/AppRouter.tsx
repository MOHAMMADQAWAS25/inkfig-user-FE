import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AppShell } from "../features/layout/AppShell";
import { LoginPage } from "../features/auth/LoginPage";
import { AuthLandingPage } from "../features/auth/AuthLandingPage";
import { RequireAuth } from "../features/auth/RequireAuth";
import { SignupPage } from "../features/auth/SignupPage";
import { VerifyEmailPage } from "../features/auth/VerifyEmailPage";
import { PasswordResetPage } from "../features/auth/PasswordResetPage";
import { HomePage } from "../features/home/HomePage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/:language" element={<HomePage />} />
      <Route path="/:language/welcome" element={<AuthLandingPage />} />
      <Route path="/:language/login" element={<LoginPage />} />
      <Route path="/:language/signup" element={<SignupPage />} />
      <Route path="/:language/verify-email" element={<VerifyEmailPage />} />
      <Route path="/:language/reset-password" element={<PasswordResetPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/:language/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/ar" />} />
    </Routes>
  );
}
