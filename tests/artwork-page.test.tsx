import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { ArtworkPage } from "../src/features/works/ArtworkPage";
import { ApiError } from "../src/api/httpClient";
import { getWork, setWorkLike, setWorkSave, type FeedWork } from "../src/features/works/worksApi";
import { getRelatedArtworks } from "../src/features/works/relatedArtworksApi";
import { getPublicProfile, setProfileFollow } from "../src/features/profile/profileApi";
import { safeArtworkReturn } from "../src/features/works/artworkNavigation";
import { updateArtworkCache } from "../src/features/works/updateArtworkCache";

const auth = vi.hoisted(() => ({ session: { userId: "viewer", permissions: ["works.like", "works.save", "reports.create"] } as null | { userId: string; permissions: string[] } }));
vi.mock("../src/features/auth/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("../src/features/navigation/AppSidebar", () => ({ AppSidebar: () => <nav /> }));
vi.mock("../src/features/works/worksApi", () => ({ getWork: vi.fn(), setWorkLike: vi.fn(), setWorkSave: vi.fn(), deleteWork: vi.fn(), deleteWorkAsModerator: vi.fn() }));
vi.mock("../src/features/works/relatedArtworksApi", () => ({ getRelatedArtworks: vi.fn() }));
vi.mock("../src/features/profile/profileApi", () => ({ getPublicProfile: vi.fn(), setProfileFollow: vi.fn() }));
vi.mock("../src/features/feed/Feed", () => ({ Feed: ({ items, renderItem, loadMore, hasNextPage, error, retry, restoreScroll }: any) => <section data-testid="related-feed" data-restore={String(restoreScroll)}>{items.map((item: FeedWork) => <div key={item.work_id}>{renderItem(item, 250, false)}</div>)}{hasNextPage && <button onClick={loadMore}>Load more related</button>}{error && <button onClick={retry}>Retry related</button>}</section> }));
const sample: FeedWork = { work_id: "one", owner_user_id: "artist", artist_name: "Artist", artist_avatar_url: "/avatar.png", title: "Jerusalem’s Serenity", description: "A peaceful moment in Jerusalem.", type_id: "art", type_name_en: "Digital Art", type_name_ar: "فن رقمي", image_url: "/art.png", mime_type: "image/png", links: [{ url: "https://example.com", label: "Portfolio" }], created_at: "2026-10-11T12:00:00Z", like_count: 12, liked_by_me: false, saved_by_me: false };
function Page() { const location = useLocation(); return <ArtworkPage key={location.pathname} />; }
function Probe() { const location = useLocation(); return <output data-testid="route">{location.pathname}{location.search}</output>; }
function mount(language = "en", state: object | null = null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[{ pathname: `/${language}/artwork/one`, state }]}><I18nProvider><Routes><Route path="/:language/artwork/:workId" element={<Page />} /><Route path="*" element={<div>Origin</div>} /></Routes><Probe /></I18nProvider></MemoryRouter></QueryClientProvider>);
  return client;
}
beforeEach(() => {
  vi.resetAllMocks(); auth.session = { userId: "viewer", permissions: ["works.like", "works.save", "reports.create"] };
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  vi.mocked(getWork).mockImplementation(async id => ({ ...sample, work_id: id, title: id === "one" ? sample.title : "Related artwork" }));
  vi.mocked(getRelatedArtworks).mockImplementation(async (_id, cursor) => ({ items: [{ ...sample, work_id: cursor ? "three" : "two", title: cursor ? "Third artwork" : "Second artwork" }], next_cursor: cursor ? null : "next" }));
  vi.mocked(getPublicProfile).mockResolvedValue({ user_id: "artist", full_name: "Artist", avatar_url: "/avatar.png", follower_count: 1, following_count: 0, like_count: 0, is_following: false, is_self: false });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("renders a full page, real metadata and existing homepage cards below", async () => {
  mount();
  expect(await screen.findByRole("heading", { level: 1, name: sample.title })).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByText(sample.description)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Portfolio" }).getAttribute("rel")).toBe("noopener noreferrer");
  expect(screen.getByText("Created")).toBeTruthy();
  expect(await screen.findByRole("link", { name: "View artwork details: Second artwork" })).toHaveProperty("href", expect.stringContaining("/en/artwork/two"));
  expect(screen.getByTestId("related-feed").dataset.restore).toBe("false");
  expect(document.querySelector('.artwork-page-media-original')?.getAttribute("draggable")).toBe("false");
  expect(document.querySelector('.artwork-modal-media')).toBeNull();
});

it("paginates related artwork and navigates to another standalone page", async () => {
  mount();
  fireEvent.click(await screen.findByRole("button", { name: "Load more related" }));
  await screen.findByRole("link", { name: "View artwork details: Third artwork" });
  expect(getRelatedArtworks).toHaveBeenCalledWith("one", "next", expect.any(AbortSignal));
  fireEvent.click(screen.getByRole("link", { name: "View artwork details: Second artwork" }));
  expect(await screen.findByRole("heading", { level: 1, name: "Related artwork" })).toBeTruthy();
  expect(screen.getByTestId("route").textContent).toBe("/en/artwork/two");
});

it("preserves like/save actions and rolls back a failed mutation", async () => {
  mount(); await screen.findByRole("heading", { name: sample.title });
  const actions = within(document.querySelector(".artwork-page-actions") as HTMLElement);
  fireEvent.click(actions.getByRole("button", { name: "12 likes" }));
  await waitFor(() => expect(setWorkLike).toHaveBeenCalledWith("one", true));
  expect(actions.getByRole("button", { name: "13 likes" }).getAttribute("aria-pressed")).toBe("true");
  vi.mocked(setWorkSave).mockRejectedValueOnce(new Error("Offline"));
  fireEvent.click(within(document.querySelector(".artwork-page-actions") as HTMLElement).getByRole("button", { name: "Save", exact: true }));
  await screen.findByRole("alert");
  expect(within(document.querySelector(".artwork-page-actions") as HTMLElement).getByRole("button", { name: "Save", exact: true }).getAttribute("aria-pressed")).toBe("false");
});

it("supports follow and canonical copy-link sharing", async () => {
  const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: clipboard });
  mount(); fireEvent.click(await screen.findByRole("button", { name: "Follow" }));
  await waitFor(() => expect(setProfileFollow).toHaveBeenCalledWith("artist", true));
  fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
  await waitFor(() => expect(clipboard.writeText).toHaveBeenCalledWith(new URL("/en/artwork/one", window.location.origin).href));
});

it("handles unavailable artwork without requesting recommendations", async () => {
  vi.mocked(getWork).mockRejectedValue(new ApiError(404, "Not found"));
  mount(); expect(await screen.findByRole("heading", { name: "This artwork is no longer available." })).toBeTruthy();
  expect(getRelatedArtworks).not.toHaveBeenCalled();
});

it("offers owner edit navigation and localizes Arabic", async () => {
  auth.session = { userId: "artist", permissions: ["works.upload"] };
  mount("ar"); await screen.findByRole("heading", { level: 1, name: sample.title });
  expect(screen.getByRole("link", { name: "تعديل المنشور" }).getAttribute("href")).toBe("/ar/profile?edit=one");
  expect(screen.getByRole("heading", { name: "أعمال فنية ذات صلة" })).toBeTruthy();
});

it("synchronizes cached profile collections without losing unrelated cards", () => {
  const client = new QueryClient();
  client.setQueryData(["profile-gallery", "viewer", "artist"], { posts: [sample], likes: [{ ...sample, liked_by_me: true }], saved: [sample] });
  updateArtworkCache(client, { ...sample, liked_by_me: false, saved_by_me: false });
  const data = client.getQueryData<any>(["profile-gallery", "viewer", "artist"]);
  expect(data.posts).toHaveLength(1); expect(data.likes).toHaveLength(0); expect(data.saved).toHaveLength(0);
  expect(safeArtworkReturn("https://evil.example", "/en")).toBe("/en");
  expect(safeArtworkReturn("/en/profile?section=saved", "/en")).toBe("/en/profile?section=saved");
});

it("adds newly liked or saved artwork only to the viewer's own cached collections", () => {
  const client = new QueryClient();
  const own = ["profile-gallery", "viewer", "viewer"];
  const other = ["profile-gallery", "viewer", "artist"];
  for (const key of [own, other]) client.setQueryData(key, { posts: [], likes: [], saved: [] });
  updateArtworkCache(client, { ...sample, liked_by_me: true, saved_by_me: true });
  expect(client.getQueryData<any>(own).likes).toHaveLength(1);
  expect(client.getQueryData<any>(own).saved).toHaveLength(1);
  expect(client.getQueryData<any>(other).likes).toHaveLength(0);
  updateArtworkCache(client, sample, true);
  expect(client.getQueryData<any>(own).saved).toHaveLength(0);
});

it("closes moderator deletion with Escape without deleting artwork", async () => {
  auth.session = { userId: "moderator", permissions: ["works.delete_any"] };
  mount();
  fireEvent.click(await screen.findByRole("button", { name: "Delete as administrator" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});
