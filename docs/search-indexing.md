# Google Search setup

`npm run build` generates a real robots.txt, sitemap.xml, Cloudflare _headers,
and localized HTML heads for /en/, /ar/, /en/exhibition/ and /ar/exhibition/.
Both public languages have self-canonicals, reciprocal hreflang, descriptions,
social metadata, and home-page WebSite structured data. React updates metadata
on navigation. The gallery contents still load through JavaScript; this is not
full server rendering or an artwork-level sitemap.

Only the four public discovery pages are submitted initially. Account pages,
moderation, submissions and individual records are excluded from the sitemap;
the React head uses noindex on other routes and query/filter URLs. Private
entry routes also receive X-Robots-Tag headers before JavaScript, via Cloudflare
static assets. These are indexing preferences, not access-control mechanisms.
Existing backend authorization is unchanged. Individual artwork, exhibition
and public-profile SEO can be added later with accurate record-level metadata
and proper missing-record handling. Do not list private or unverified records.

## Owner verification (Google account required)

1. Sign into https://search.google.com/search-console with the owner's account.
2. Add Domain property `inkfig-hu.com`.
3. Copy Google's `google-site-verification=...` TXT value.
4. In the domain's Cloudflare DNS zone add TXT at `@` with that exact value,
   automatic TTL. Preserve all existing records. Do not change nameservers.
5. Verify in Search Console and keep the TXT record afterward.
6. Submit `https://inkfig-hu.com/sitemap.xml` under Sitemaps.
7. Inspect the English and Arabic homepage URLs, test live URLs, and request
   indexing. Check rendered content, canonical selection and Page Indexing
   reports afterward. Submission does not guarantee indexing, timing or rank.

Never share a Google password, session cookie or two-factor code. Search Console
verification cannot be fabricated or completed without the owner's Google
session and DNS access. No Google Analytics, cookies or tracking are required.

References: [ownership verification](https://support.google.com/webmasters/answer/9008080?hl=en),
[JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
