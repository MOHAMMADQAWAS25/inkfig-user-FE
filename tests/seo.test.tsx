import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import { PageMetadata } from "../src/seo/PageMetadata";
import brand from "../src/seo/brand.json";

afterEach(() => {
  cleanup();
  document.head.querySelectorAll("[data-seo]").forEach(element => element.remove());
});
const meta = (name: string) => document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content;
const canonical = () => document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
function page(path: string) {
  render(<MemoryRouter initialEntries={[path]}><PageMetadata />
    <Link to="/ar/">Arabic</Link><Link to="/en/settings">Account</Link>
    <Link to="/en/exhibition/">Exhibitions</Link><Link to="/en/">Home</Link>
  </MemoryRouter>);
}

it("updates locale, canonicals, alternatives and schema without duplicates on navigation", () => {
  page("/en/");
  expect(document.title).toContain("Hebron University");
  expect(canonical()).toBe("https://inkfig-hu.com/en/");
  expect(document.head.querySelectorAll('link[rel="alternate"]')).toHaveLength(3);
  expect(meta("robots")).toContain("index, follow");
  expect(JSON.parse(document.head.querySelector('script[type="application/ld+json"]')!.textContent!)["@type"]).toBe("WebSite");
  const schema = JSON.parse(document.head.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(schema.name).toBe(brand.name);
  expect(schema.alternateName).toEqual(brand.alternateName);
  expect(schema["@id"]).toBe("https://inkfig-hu.com/#website");
  fireEvent.click(screen.getByText("Arabic"));
  expect(document.title).toContain("جامعة الخليل");
  expect(canonical()).toBe("https://inkfig-hu.com/ar/");
  expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  fireEvent.click(screen.getByText("Exhibitions"));
  expect(canonical()).toBe("https://inkfig-hu.com/en/exhibition/");
  expect(document.title).toContain("Art Exhibitions");
  expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull();
});

it.each(["/en/settings", "/ar/admin/users", "/en/login", "/ar/exhibition/id/review", "/en/exhibition/id/submissions", "/en/profile/user", "/unknown", "/fr", "/en/?q=portrait", "/en/?work=123"])("excludes non-discovery and query URLs: %s", path => {
  page(path);
  expect(meta("robots")).toBe("noindex, follow");
});

it("clears stale canonical/alternates on account routes and restores public metadata", () => {
  page("/ar/");
  fireEvent.click(screen.getByText("Account"));
  expect(canonical()).toBeUndefined();
  expect(document.head.querySelector('link[rel="alternate"]')).toBeNull();
  expect(meta("robots")).toBe("noindex, follow");
  expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull();
  fireEvent.click(screen.getByText("Home"));
  expect(canonical()).toBe("https://inkfig-hu.com/en/");
  expect(meta("robots")).toBe("index, follow, max-image-preview:large");
});
