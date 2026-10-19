import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { buildSeo } from "../scripts/build-seo.mjs";

test("generates localized initial HTML, real crawl assets and private-route headers", async () => {
  const directory = await mkdtemp(join(tmpdir(), "inkfig-seo-"));
  const output = pathToFileURL(directory + "/");
  try {
    await writeFile(new URL("index.html", output), '<html lang="en" dir="ltr"><head><!-- seo:start -->old<!-- seo:end --></head><body><div id="root"></div><script src="/assets/app.js"></script></body></html>');
    await buildSeo(output);
    for (const language of ["en", "ar"]) for (const suffix of ["", "exhibition/"]) {
      const html = await readFile(new URL(`${language}/${suffix}index.html`, output), "utf8");
      assert.ok(html.includes(`<html lang="${language}" dir="${language === "ar" ? "rtl" : "ltr"}">`));
      assert.ok(html.includes(`rel="canonical" href="https://inkfig-hu.com/${language}/${suffix}"`));
      assert.equal((html.match(/<title>/g) || []).length, 1);
      for (const code of ["en", "ar", "x-default"]) assert.ok(html.includes(`hreflang="${code}"`));
      assert.ok(html.includes("/assets/app.js"));
      assert.ok(html.includes("index, follow, max-image-preview:large"));
      assert.equal(html.includes('"@type":"WebSite"'), suffix === "");
    }
    const root = await readFile(new URL("index.html", output), "utf8");
    assert.ok(root.includes('"url":"https://inkfig-hu.com/"'));
    const sitemap = await readFile(new URL("sitemap.xml", output), "utf8");
    assert.equal((sitemap.match(/<loc>/g) || []).length, 4);
    assert.equal((sitemap.match(/<xhtml:link/g) || []).length, 12);
    assert.doesNotMatch(sitemap, /signup|profile|admin|submissions|review|lastmod/);
    const robots = await readFile(new URL("robots.txt", output), "utf8");
    assert.match(robots, /Sitemap: https:\/\/inkfig-hu.com\/sitemap.xml/);
    assert.doesNotMatch(robots, /Disallow|<html/);
    const headers = await readFile(new URL("_headers", output), "utf8");
    for (const language of ["en", "ar"]) {
      for (const path of ["login", "signup", "verify-email", "reset-password", "settings", "profile", "upload", "notifications", "admin/*", "exhibition/*/review", "exhibition/*/submissions"]) {
        assert.ok(headers.includes(`/${language}/${path}\n  X-Robots-Tag: noindex, follow`));
      }
      assert.ok(!headers.includes(`/${language}/\n`));
      assert.ok(!headers.includes(`/${language}/exhibition/\n`));
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
