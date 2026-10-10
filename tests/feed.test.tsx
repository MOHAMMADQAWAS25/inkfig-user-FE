import React, { type ReactNode } from "react";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { FeedLayout, columnCount, visiblePositions } from "../src/features/feed/feedLayout";
import { useInfiniteFeed } from "../src/features/feed/useInfiniteFeed";
import { useFeedSentinel } from "../src/features/feed/useFeedSentinel";
import { LazyImage } from "../src/features/feed/LazyImage";
import { Feed } from "../src/features/feed/Feed";
import { getFeed, searchWorks, type FeedWork, type InfiniteFeedPage } from "../src/features/works/worksApi";

vi.mock("../src/features/works/worksApi", () => ({ getFeed: vi.fn(), searchWorks: vi.fn() }));
const clients: QueryClient[] = [];
const observers: Observer[] = [];
class Observer {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  observe = vi.fn(); disconnect = vi.fn();
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback; this.options = options; observers.push(this);
  }
  intersect() { this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
}
function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); clients.push(client);
  return { client, Wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> };
}
function work(id: number, width = 400, height = 600): FeedWork {
  return { work_id: String(id), title: `Art ${id}`, owner_user_id: "artist", artist_name: "Artist", type_id: "type",
    type_name_en: "Digital art", type_name_ar: "فن رقمي", description: "", links: [], image_url: `/art-${id}.png`,
    mime_type: "image/png", created_at: "2026-10-11T12:00:00Z", like_count: 0, liked_by_me: false, saved_by_me: false,
    media: { width, height, url: `/art-${id}.png`, dominantColor: "#123456", sizes: [{ w: 236, url: "/small.webp" }, { w: 736, url: "/large.webp" }] } };
}
function page(items: FeedWork[], nextCursor: string | null = null): InfiniteFeedPage { return { items, nextCursor, hasNextPage: nextCursor !== null }; }
beforeEach(() => {
  vi.clearAllMocks(); observers.length = 0;
  vi.stubGlobal("IntersectionObserver", Observer);
  vi.stubGlobal("ResizeObserver", class { observe = vi.fn(); disconnect = vi.fn(); });
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  vi.spyOn(window, "scrollBy").mockImplementation(() => undefined);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 1000, top: 0, height: 500 } as DOMRect);
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); });

describe("precomputed masonry", () => {
  it("places the next card in the shortest column with no overlap", () => {
    const result = new FeedLayout().compute([work(1, 400, 800), work(2, 400, 400), work(3, 400, 200)], 400, "masonry");
    expect(result.positions.map(p => p.column)).toEqual([0, 1, 1]);
    expect(result.positions[2].y).toBe(result.positions[1].height + 12);
    expect(result.height).toBe(result.positions[0].height);
  });
  it("preserves existing positions when appending or liking", () => {
    const engine = new FeedLayout(); const items = Array.from({ length: 40 }, (_, i) => work(i));
    const first = engine.compute(items, 1000, "masonry");
    const next = engine.compute([...items.map(item => ({ ...item, liked_by_me: true })), work(41)], 1000, "masonry");
    expect(next.positions.slice(0, 40)).toEqual(first.positions);
  });
  it("recomputes for rotation, deletion and RTL", () => {
    const engine = new FeedLayout(); const items = [work(1), work(2), work(3)];
    const desktop = engine.compute(items, 1200, "masonry");
    const mobile = engine.compute(items, 360, "masonry", true);
    expect(mobile.columns).toHaveLength(2);
    expect(mobile.positions[0].x).toBeGreaterThan(mobile.positions[1].x);
    expect(mobile.positions[0].width).toBeLessThan(desktop.positions[0].width);
    expect(engine.compute(items.slice(1), 360, "masonry").positions[0].id).toBe("2");
  });
  it("uses a centered configurable list without cropping extreme ratios", () => {
    const result = new FeedLayout().compute([work(1, 100, 2000)], 1000, "list");
    expect(result.positions[0]).toMatchObject({ x: 265, width: 470, height: 9400 });
    expect(new FeedLayout().compute([work(1)], 300, "list", false, 250).positions[0].width).toBe(250);
  });
  it("renders a bounded viewport range for 10,000 items", () => {
    const result = new FeedLayout().compute(Array.from({ length: 10_000 }, (_, i) => work(i)), 1000, "masonry");
    expect(visiblePositions(result, 100_000, 104_000).length).toBeLessThan(70);
    expect(visiblePositions(result, 100_000, 104_000).every(p => p.y + p.height >= 100_000 && p.y <= 104_000)).toBe(true);
    expect(columnCount(360)).toBe(2); expect(columnCount(700)).toBe(3); expect(columnCount(2000)).toBe(6);
  });
});

describe("infinite feed query", () => {
  it("appends and deduplicates IDs, locks duplicate requests, and ends", async () => {
    let resolve!: (value: InfiniteFeedPage) => void;
    vi.mocked(getFeed).mockResolvedValueOnce(page([work(1), work(2)], "next"))
      .mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    const { Wrapper } = wrapper(); const { result } = renderHook(() => useInfiniteFeed({ viewer: "guest" }), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    act(() => { result.current.loadMore(); result.current.loadMore(); });
    expect(getFeed).toHaveBeenCalledTimes(2);
    await act(async () => resolve(page([work(2), work(3)])));
    await waitFor(() => expect(result.current.items.map(w => w.work_id)).toEqual(["1", "2", "3"]));
    expect(result.current.hasNextPage).toBe(false);
  });
  it("exposes a failed next page and retries without clearing loaded cards", async () => {
    vi.mocked(getFeed).mockResolvedValueOnce(page([work(1)], "next")).mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(page([work(2)]));
    const { Wrapper } = wrapper(); const { result } = renderHook(() => useInfiniteFeed({ viewer: "guest" }), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.items).toHaveLength(1);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.error).toBeNull();
  });
  it("aborts old scope and unmount requests, ignores late success", async () => {
    let oldSignal!: AbortSignal; let resolve!: (value: InfiniteFeedPage) => void;
    vi.mocked(getFeed).mockImplementationOnce((_type, _cursor, _owner, signal) => {
      oldSignal = signal!; return new Promise(done => { resolve = done; });
    }).mockResolvedValueOnce(page([work(2)]));
    const { Wrapper } = wrapper();
    const { result, rerender, unmount } = renderHook(({ category }) => useInfiniteFeed({ viewer: "guest", category }), { initialProps: { category: "first" }, wrapper: Wrapper });
    await waitFor(() => expect(getFeed).toHaveBeenCalledTimes(1));
    rerender({ category: "second" });
    await waitFor(() => expect(result.current.items[0]?.work_id).toBe("2"));
    expect(oldSignal.aborted).toBe(true);
    await act(async () => resolve(page([work(1)])));
    expect(result.current.items[0].work_id).toBe("2"); unmount();
  });
  it("cancels on unmount and retains successful pages for navigation back", async () => {
    vi.mocked(getFeed).mockResolvedValue(page([work(1)]));
    const { Wrapper } = wrapper();
    const first = renderHook(() => useInfiniteFeed({ viewer: "guest" }), { wrapper: Wrapper });
    await waitFor(() => expect(first.result.current.items).toHaveLength(1)); first.unmount();
    const second = renderHook(() => useInfiniteFeed({ viewer: "guest" }), { wrapper: Wrapper });
    expect(second.result.current.items).toHaveLength(1); expect(getFeed).toHaveBeenCalledTimes(1); second.unmount();
    let signal!: AbortSignal;
    vi.mocked(getFeed).mockImplementationOnce((_a, _b, _c, s) => { signal = s!; return new Promise(() => {}); });
    const pending = renderHook(() => useInfiniteFeed({ viewer: "other" }), { wrapper: Wrapper });
    await waitFor(() => expect(signal).toBeDefined()); pending.unmount(); expect(signal.aborted).toBe(true);
  });
  it("uses separate viewer scopes, preserves ranked search and stops repeated cursors", async () => {
    vi.mocked(searchWorks).mockResolvedValue({ items: [work(1)], next_cursor: 20 });
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useInfiniteFeed({ viewer: "user", search: "olive", category: "hand-art", ownerId: "artist" }), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(searchWorks).toHaveBeenCalledWith("olive", "hand-art", undefined, "artist", expect.any(AbortSignal));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });
  it("updates loaded items without losing the rest of the cached pages", async () => {
    vi.mocked(getFeed).mockResolvedValue(page([work(1), work(2)]));
    const { Wrapper } = wrapper(); const { result } = renderHook(() => useInfiniteFeed({ viewer: "guest" }), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    act(() => result.current.setItems(items => items.map(w => ({ ...w, liked_by_me: true }))));
    await waitFor(() => expect(result.current.items.every(w => w.liked_by_me)).toBe(true));
  });
});

describe("sentinel and media", () => {
  it("restores scroll after width measurement in Strict Mode", async () => {
    const props = { items: [work(1)], cacheKey: "strict-restore-test", loading: false, loadingMore: false, error: null,
      hasNextPage: false, loadMore: vi.fn(), retry: vi.fn(), emptyMessage: "Empty", renderItem: (item: FeedWork) => <button>{item.title}</button> };
    const Wrapper = ({ children }: { children: ReactNode }) => <React.StrictMode><MemoryRouter initialEntries={["/en"]}><I18nProvider>{children}</I18nProvider></MemoryRouter></React.StrictMode>;
    const first = render(<Feed {...props} />, {wrapper:Wrapper});
    Object.defineProperty(window, "scrollY", { configurable:true, value:1200 });
    await act(async () => { await new Promise(resolve=>requestAnimationFrame(()=>resolve(undefined))); });
    first.unmount();
    Object.defineProperty(window, "scrollY", { configurable:true, value:0 });
    vi.mocked(window.scrollTo).mockClear();
    render(<Feed {...props} />, {wrapper:Wrapper});
    expect(window.scrollTo).toHaveBeenCalledWith({top:1200,behavior:"instant"});
  });
  it("renders list mode and initial skeleton geometry", () => {
    const props = { items: [work(1)], cacheKey: "list-test", loading: true, loadingMore: false, error: null,
      hasNextPage: false, loadMore: vi.fn(), retry: vi.fn(), emptyMessage: "Empty", renderItem: (item: FeedWork) => <button>{item.title}</button> };
    const Wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={["/en"]}><I18nProvider>{children}</I18nProvider></MemoryRouter>;
    const {container,rerender} = render(<Feed {...props} layout="list" />, {wrapper:Wrapper});
    expect(container.querySelectorAll(".feed-skeleton").length).toBeGreaterThan(0);
    expect(screen.getByRole("feed").getAttribute("aria-busy")).toBe("true");
    rerender(<Feed {...props} loading={false} layout="list" />);
    const article=container.querySelector("article")!;
    expect(article.style.width).toBe("470px");
    expect(article.style.transform).toContain("265px");
  });
  it("prefetches 1200px ahead and disconnects, disabled on failure", () => {
    const load = vi.fn();
    function Sentinel({ enabled }: { enabled: boolean }) { const ref = useFeedSentinel(enabled, load); return <div ref={ref} />; }
    const { rerender, unmount } = render(<Sentinel enabled />);
    expect(observers[0].options?.rootMargin).toBe("1200px 0px");
    act(() => observers[0].intersect()); expect(load).toHaveBeenCalledOnce();
    rerender(<Sentinel enabled={false} />); expect(observers[0].disconnect).toHaveBeenCalledOnce(); unmount();
  });
  it("reserves dimensions, uses responsive variants, and shows a fixed-size failure placeholder", () => {
    render(<LazyImage work={work(1)} width={240} priority failureLabel="Unavailable" />);
    const image = screen.getByAltText("Art 1");
    expect(image.getAttribute("width")).toBe("400"); expect(image.getAttribute("height")).toBe("600");
    expect(image.getAttribute("fetchpriority")).toBe("high"); expect(image.getAttribute("loading")).toBe("eager");
    expect(image.getAttribute("srcset")).toContain("236w");
    fireEvent.error(image); expect(screen.getByLabelText("Art 1: Unavailable")).toBeTruthy();
  });
  it("uses lazy decoding and lower quality on Save-Data", () => {
    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
    render(<LazyImage work={work(1)} width={400} failureLabel="Unavailable" />);
    const image = screen.getByAltText("Art 1");
    expect(image.getAttribute("loading")).toBe("lazy"); expect(image.getAttribute("decoding")).toBe("async");
    expect(image.getAttribute("srcset")).not.toContain("736w");
    Object.defineProperty(navigator, "connection", { configurable: true, value: undefined });
  });
  it("keeps DOM bounded with 10,000 items and exposes retry, empty and end states", () => {
    const retry = vi.fn(); const props = { items: Array.from({ length: 10_000 }, (_, i) => work(i)), cacheKey: "large-test", loading: false,
      loadingMore: false, error: null as unknown, hasNextPage: false, loadMore: vi.fn(), retry, emptyMessage: "Empty",
      renderItem: (item: FeedWork) => <button>{item.title}</button> };
    const Wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={["/en"]}><I18nProvider>{children}</I18nProvider></MemoryRouter>;
    const { container, rerender } = render(<Feed {...props} />, { wrapper: Wrapper });
    expect(container.querySelectorAll("article").length).toBeLessThan(60);
    expect(parseFloat((screen.getByRole("feed") as HTMLElement).style.height)).toBeGreaterThan(100_000);
    expect(screen.getByText("You're all caught up")).toBeTruthy();
    rerender(<Feed {...props} error={new Error("offline")} />);
    fireEvent.click(screen.getByText("Retry")); expect(retry).toHaveBeenCalledOnce();
    rerender(<Feed {...props} items={[]} />); expect(screen.getByText("Empty")).toBeTruthy();
  });
});
