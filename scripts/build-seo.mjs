import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const pages = JSON.parse(await readFile(new URL("src/seo/pages.json", root), "utf8"));
const brand = JSON.parse(await readFile(new URL("src/seo/brand.json", root), "utf8"));
const escape = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const languages = ["en", "ar"];
const kinds = ["home", "exhibition"];
export const pagePath = (language, kind) => `/${language}/${kind === "home" ? "" : "exhibition/"}`;

export function seoHead(language, kind) {
  const page = pages[language][kind];
  const canonical = pages.origin + pagePath(language, kind);
  const meta = (key, value, attribute = "name") => `<meta data-seo ${attribute}="${key}" content="${escape(value)}" />`;
  return [
    `<title>${escape(page.title)}</title>`,
    meta("description", page.description), meta("robots", "index, follow, max-image-preview:large"),
    `<link data-seo rel="canonical" href="${canonical}" />`,
    ...languages.map(code => `<link data-seo rel="alternate" hreflang="${code}" href="${pages.origin + pagePath(code, kind)}" />`),
    `<link data-seo rel="alternate" hreflang="x-default" href="${pages.origin + pagePath("en", kind)}" />`,
    meta("og:type", "website", "property"), meta("og:site_name", "InkFig", "property"),
    meta("og:title", page.title, "property"), meta("og:description", page.description, "property"),
    meta("og:url", canonical, "property"), meta("og:locale", language === "ar" ? "ar_PS" : "en_US", "property"),
    meta("twitter:card", "summary"), meta("twitter:title", page.title), meta("twitter:description", page.description),
    ...(kind === "home" ? [`<script data-seo type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", "@id": pages.origin + "/#website", name: brand.name, alternateName: brand.alternateName, url: pages.origin + "/", inLanguage: languages }).replace(/</g, "\\u003c")}</script>`] : []),
  ].join("\n    ");
}

export async function buildSeo(output = new URL("dist/", root)) {
  const shell = await readFile(new URL("index.html", output), "utf8");
  if (!shell.includes("<!-- seo:start -->") || !shell.includes("<!-- seo:end -->")) throw new Error("SEO head markers missing");
  const html = (language, kind) => shell
    .replace(/<html[^>]*>/, `<html lang="${language}" dir="${language === "ar" ? "rtl" : "ltr"}">`)
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n    ${seoHead(language, kind)}\n    <!-- seo:end -->`);
  // Keep the root usable, and serve localized metadata before JavaScript runs.
  await writeFile(new URL("index.html", output), html("en", "home"));
  const urls = [];
  for (const language of languages) for (const kind of kinds) {
    const path = pagePath(language, kind);
    const directory = new URL(path.slice(1), output);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL("index.html", directory), html(language, kind));
    urls.push(`<url><loc>${pages.origin + path}</loc>${languages.map(code => `<xhtml:link rel="alternate" hreflang="${code}" href="${pages.origin + pagePath(code, kind)}"/>`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${pages.origin + pagePath("en", kind)}"/></url>`);
  }
  await writeFile(new URL("sitemap.xml", output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
  await writeFile(new URL("robots.txt", output), `User-agent: *\nAllow: /\n\nSitemap: ${pages.origin}/sitemap.xml\n`);
  // Let crawlers read noindex; robots.txt blocking would hide this instruction.
  const privatePaths = ["login", "signup", "verify-email", "reset-password", "upload", "profile", "notifications", "settings", "admin/*", "exhibition/*/submissions", "exhibition/*/review"];
  const headers = languages.flatMap(language => privatePaths.flatMap(path => [`/${language}/${path}\n  X-Robots-Tag: noindex, follow`, ...(!path.includes("*") ? [`/${language}/${path}/\n  X-Robots-Tag: noindex, follow`] : [])]));
  await writeFile(new URL("_headers", output), headers.join("\n\n") + "\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await buildSeo();
