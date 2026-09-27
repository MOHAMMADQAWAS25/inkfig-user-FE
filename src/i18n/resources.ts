export type Language = "ar" | "en";

const en = {
  "app.name": "InkFig",
  "app.tagline": "Hebron University art community",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signIn": "Sign in",
  "auth.welcome": "Welcome back",
  "dashboard.description": "Your artwork, events, and community activity will appear here.",
  "dashboard.title": "Dashboard",
  "nav.dashboard": "Dashboard",
  "nav.logout": "Log out",
  "nav.menu": "Menu",
  "nav.primary": "Primary navigation",
  "status.foundation": "Foundation ready",
} as const;

export type TranslationKey = keyof typeof en;

const ar: Record<TranslationKey, string> = {
  "app.name": "إنكفِغ",
  "app.tagline": "مجتمع الفنون في جامعة الخليل",
  "auth.email": "البريد الإلكتروني",
  "auth.password": "كلمة المرور",
  "auth.signIn": "تسجيل الدخول",
  "auth.welcome": "مرحباً بعودتك",
  "dashboard.description": "ستظهر أعمالك الفنية وفعالياتك ونشاط المجتمع هنا.",
  "dashboard.title": "لوحة التحكم",
  "nav.dashboard": "لوحة التحكم",
  "nav.logout": "تسجيل الخروج",
  "nav.menu": "القائمة",
  "nav.primary": "التنقل الرئيسي",
  "status.foundation": "الأساس جاهز",
};

export const translations: Record<Language, Record<TranslationKey, string>> = { ar, en };
