import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AppShell } from "../features/layout/AppShell";
import { LoginPage } from "../features/auth/LoginPage";
import { RequireAuth } from "../features/auth/RequireAuth";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/:language/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/:language" element={<Navigate replace to="dashboard" />} />
          <Route path="/:language/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/ar/dashboard" />} />
    </Routes>
  );
}
