import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { VerifyEmailPage } from "../features/auth/VerifyEmailPage";
import { PasswordResetPage } from "../features/auth/PasswordResetPage";
import { HomePage } from "../features/home/HomePage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { UploadWorkPage } from "../features/works/UploadWorkPage";
import { AdminUsersPage } from "../features/admin/AdminUsersPage";
import { FeaturePlaceholderPage } from "../features/navigation/FeaturePlaceholderPage";
import { SettingsPage } from "../features/settings/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/:language" element={<HomePage />} />
      <Route path="/:language/login" element={<LoginPage />} />
      <Route path="/:language/signup" element={<SignupPage />} />
      <Route path="/:language/verify-email" element={<VerifyEmailPage />} />
      <Route path="/:language/reset-password" element={<PasswordResetPage />} />
      <Route path="/:language/upload" element={<UploadWorkPage />} />
      <Route path="/:language/profile" element={<ProfilePage />} />
      <Route path="/:language/profile/:userId" element={<ProfilePage />} />
      <Route path="/:language/exhibition" element={<FeaturePlaceholderPage feature="exhibition" />} />
      <Route path="/:language/notifications" element={<FeaturePlaceholderPage feature="notifications" />} />
      <Route path="/:language/settings" element={<SettingsPage />} />
      <Route path="/:language/admin/users" element={<AdminUsersPage />} />
      <Route path="*" element={<Navigate replace to="/en" />} />
    </Routes>
  );
}
