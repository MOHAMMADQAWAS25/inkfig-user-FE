import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import pages from "./pages.json";

/** Keep metadata correct during SPA navigation, not only on initial page loads. */
export function PageMetadata() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const language = segments[0] === "ar" ? "ar" : "en";
    const localized = segments[0] === "en" || segments[0] === "ar";
    const home = pathname === "/" || (localized && segments.length === 1);
    const exhibition = localized && segments.length === 2 && segments[1] === "exhibition";
    const publicPage = home || exhibition;
    const kind = home ? "home" : exhibition ? "exhibition" : "private";
    const page = pages[language][kind];
    const suffix = exhibition ? "exhibition/" : "";
    const canonical = `${pages.origin}/${language}/${suffix}`;
    document.title = page.title;
    document.head.querySelectorAll("[data-seo]").forEach(element => element.remove());
    function meta(key: string, content: string, attribute = "name") {
      const element = document.createElement("meta");
      element.dataset.seo = ""; element.setAttribute(attribute, key); element.content = content;
      document.head.append(element);
    }
    function link(rel: string, href: string, languageCode?: string) {
      const element = document.createElement("link");
      element.dataset.seo = ""; element.rel = rel; element.href = href;
      if (languageCode) element.hreflang = languageCode;
      document.head.append(element);
    }
    meta("description", page.description);
    meta("robots", publicPage && !search ? "index, follow, max-image-preview:large" : "noindex, follow");
    // Never canonicalize an account or individual record to an unrelated gallery.
    if (publicPage) {
      link("canonical", canonical);
      for (const code of ["en", "ar"]) link("alternate", `${pages.origin}/${code}/${suffix}`, code);
      link("alternate", `${pages.origin}/en/${suffix}`, "x-default");
      meta("og:url", canonical, "property");
    }
    meta("og:type", "website", "property"); meta("og:site_name", "InkFig", "property");
    meta("og:title", page.title, "property"); meta("og:description", page.description, "property");
    meta("og:locale", language === "ar" ? "ar_PS" : "en_US", "property");
    meta("twitter:card", "summary"); meta("twitter:title", page.title); meta("twitter:description", page.description);
    if (home) {
      const schema = document.createElement("script"); schema.dataset.seo = ""; schema.type = "application/ld+json";
      schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "InkFig", alternateName: ["Inkfig", "InkFig Hebron University"], url: pages.origin + "/", inLanguage: ["en", "ar"] });
      document.head.append(schema);
    }
  }, [pathname, search]);
  return null;
}
