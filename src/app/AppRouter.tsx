import { useLayoutEffect, useRef } from "react";
import { useMobileViewport } from "../lib/useMobileViewport";
import { mobileArtworkBackground, type ArtworkBackground } from "../features/works/artworkNavigation";
import { RouteActivity } from "./RouteActivity";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { VerifyEmailPage } from "../features/auth/VerifyEmailPage";
import { PasswordResetPage } from "../features/auth/PasswordResetPage";
import { HomePage } from "../features/home/HomePage";
import { ArtworkPage } from "../features/works/ArtworkPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { UploadWorkPage } from "../features/works/UploadWorkPage";
import { AdminUsersPage } from "../features/admin/AdminUsersPage";
import { AdminReportsPage } from "../features/admin/AdminReportsPage";
import { FeaturePlaceholderPage } from "../features/navigation/FeaturePlaceholderPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { SiteFooter } from "../features/layout/SiteFooter";
import { PageMetadata } from "../seo/PageMetadata";
import { ExhibitionsPage } from "../features/exhibitions/ExhibitionsPage";
import { ExhibitionLeaderboardPage } from "../features/exhibitions/ExhibitionLeaderboardPage";
import { MyExhibitionSubmissionsPage, ReviewExhibitionSubmissionsPage } from "../features/exhibitions/MyExhibitionSubmissionsPage";

export function AppRouter() {
  const location = useLocation();
  const mobile = useMobileViewport();
  const background = mobile && /^\/(en|ar)\/artwork\/[^/]+\/?$/.test(location.pathname) ? mobileArtworkBackground(location.state) : null;
  const previousBackground = useRef<ArtworkBackground | null>(null);
  useLayoutEffect(() => {
    if (!mobile) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, [mobile]);
  useLayoutEffect(() => {
    const previous = previousBackground.current;
    if (!background && previous && location.pathname === previous.location.pathname) {
      window.scrollTo({ top: previous.scrollY, behavior: "instant" });
    }
    previousBackground.current = background;
  }, [background, location.key, location.pathname]);
  return (
    <><PageMetadata /><RouteActivity.Provider value={!background}><div key={background?.location.pathname ?? location.pathname} className={`site-content${background ? " mobile-route-background" : ""}`} inert={background ? true : undefined} aria-hidden={background ? true : undefined}><Routes location={background?.location ?? location}>
      <Route path="/:language" element={<HomePage />} />
      <Route path="/:language/artwork/:workId" element={<ArtworkPage />} />
      <Route path="/:language/login" element={<LoginPage />} />
      <Route path="/:language/signup" element={<SignupPage />} />
      <Route path="/:language/verify-email" element={<VerifyEmailPage />} />
      <Route path="/:language/reset-password" element={<PasswordResetPage />} />
      <Route path="/:language/upload" element={<UploadWorkPage />} />
      <Route path="/:language/profile" element={<ProfilePage />} />
      <Route path="/:language/profile/:userId" element={<ProfilePage />} />
      <Route path="/:language/exhibition" element={<ExhibitionsPage />} />
      <Route path="/:language/exhibition/:exhibitionId" element={<ExhibitionsPage />} />
      <Route path="/:language/exhibition/:exhibitionId/leaderboard" element={<ExhibitionLeaderboardPage />} />
      <Route path="/:language/exhibition/:exhibitionId/submissions" element={<MyExhibitionSubmissionsPage />} />
      <Route path="/:language/exhibition/:exhibitionId/review" element={<ReviewExhibitionSubmissionsPage />} />
      <Route path="/:language/notifications" element={<FeaturePlaceholderPage feature="notifications" />} />
      <Route path="/:language/settings" element={<SettingsPage />} />
      <Route path="/:language/admin/users" element={<AdminUsersPage />} />
      <Route path="/:language/admin/reports" element={<AdminReportsPage />} />
      <Route path="*" element={<Navigate replace to="/en" />} />
    </Routes></div></RouteActivity.Provider>{background && <div className="site-content mobile-artwork-foreground"><Routes><Route path="/:language/artwork/:workId" element={<ArtworkPage />} /></Routes></div>}<SiteFooter/></>
  );
}
