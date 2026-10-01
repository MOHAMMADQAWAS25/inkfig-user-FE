import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { VerifyEmailPage } from "../features/auth/VerifyEmailPage";
import { PasswordResetPage } from "../features/auth/PasswordResetPage";
import { HomePage } from "../features/home/HomePage";
import { UploadWorkPage } from "../features/works/UploadWorkPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/:language" element={<HomePage />} />
      <Route path="/:language/login" element={<LoginPage />} />
      <Route path="/:language/signup" element={<SignupPage />} />
      <Route path="/:language/verify-email" element={<VerifyEmailPage />} />
      <Route path="/:language/reset-password" element={<PasswordResetPage />} />
      <Route path="/:language/upload" element={<UploadWorkPage />} />
      <Route path="*" element={<Navigate replace to="/en" />} />
    </Routes>
  );
}
