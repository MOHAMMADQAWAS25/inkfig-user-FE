import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FeedWork } from "../works/worksApi";
import { useI18n } from "../../i18n/I18nProvider";
import { FeedLayout, visiblePositions, type LayoutResult, type Position } from "./feedLayout";
import { useFeedSentinel } from "./useFeedSentinel";

const scrollMemory = new Map<string, number>();
type FeedProps = {
  items: FeedWork[]; cacheKey: string; layout?: "list" | "masonry"; listMaxWidth?: number;
  loading: boolean; loadingMore: boolean; error: unknown; hasNextPage: boolean;
  loadMore: () => void; retry: () => void; emptyMessage: string;
  renderItem: (work: FeedWork, width: number, priority: boolean) => ReactNode;
};

/** Window-scroll virtualization without scroll event listeners or per-card observers. */
export function Feed({ items, cacheKey, layout = "masonry", listMaxWidth = 470, loading, loadingMore, error, hasNextPage, loadMore, retry, emptyMessage, renderItem }: FeedProps) {
  const { language, t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const calculator = useRef(new FeedLayout());
  const [width, setWidth] = useState(0);
  const [range, setRange] = useState({ top: 0, bottom: window.innerHeight * 3 });
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const skeletons = useMemo(() => Array.from({ length: 12 }, (_, index) => ({ work_id: `skeleton-${index}`, media: { width: 4, height: index % 3 + 3 } })), []);
  const positions = useMemo(() => calculator.current.compute(loading ? skeletons : items, width, layout, language === "ar", listMaxWidth),
    [items, width, layout, language, listMaxWidth, loading, skeletons]);
  const previousLayout = useRef<LayoutResult | null>(null);
  const previousWidth = useRef(0);
  const restored = useRef(false);
  const lastScroll = useRef(window.scrollY);
  const sentinelRef = useFeedSentinel(!loading && !loadingMore && !error && hasNextPage, loadMore);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setWidth(container.getBoundingClientRect().width);
    let timer = 0;
    const observer = new ResizeObserver(([entry]) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setWidth(entry.contentRect.width), 80);
    });
    observer.observe(container);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !width) return;
    const previous = previousLayout.current;
    if (previous && previousWidth.current !== width && !loading) {
      const top = -container.getBoundingClientRect().top;
      const anchor = visiblePositions(previous, top, top + window.innerHeight)[0];
      const next = anchor && positions.positions.find(position => position.id === anchor.id);
      if (anchor && next && top >= 0) window.scrollBy({ top: next.y - anchor.y, behavior: "instant" });
    }
    previousLayout.current = positions;
    previousWidth.current = width;
  }, [width, positions, loading]);

  useLayoutEffect(() => {
    if (!width || loading || restored.current) return;
    restored.current = true;
    lastScroll.current = scrollMemory.get(cacheKey) ?? 0;
    window.scrollTo({ top: lastScroll.current, behavior: "instant" });
  }, [cacheKey, width, loading]);

  useLayoutEffect(() => {
    return () => {
      if (!restored.current) return;
      scrollMemory.delete(cacheKey);
      scrollMemory.set(cacheKey, lastScroll.current);
      while (scrollMemory.size > 8) scrollMemory.delete(scrollMemory.keys().next().value!);
    };
  }, [cacheKey]);

  useLayoutEffect(() => {
    let frame = 0, measuredScroll = NaN, lastHeight = 0;
    const measure = () => {
      if (window.scrollY !== measuredScroll || window.innerHeight !== lastHeight) {
        measuredScroll = window.scrollY; lastHeight = window.innerHeight;
        if (restored.current) lastScroll.current = measuredScroll;
        const top = -(containerRef.current?.getBoundingClientRect().top ?? 0);
        // Two screens in each direction, with a practical minimum for small windows.
        const buffer = Math.max(800, lastHeight * 2);
        setRange({ top: top - buffer, bottom: top + lastHeight + buffer });
      }
      if (!document.hidden) frame = requestAnimationFrame(measure);
    };
    const resume = () => { cancelAnimationFrame(frame); measuredScroll = NaN; measure(); };
    measure();
    document.addEventListener("visibilitychange", resume);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", resume); };
  }, [width, cacheKey]);

  const visible = visiblePositions(positions, range.top, range.bottom);
  if (focusedId && !visible.some(position => position.id === focusedId)) {
    const focused = positions.positions.find(position => position.id === focusedId);
    if (focused) visible.push(focused);
  }
  const firstVisible = visible.find(position => position.y + position.height >= Math.max(0, range.top + Math.max(800, window.innerHeight * 2)))?.index ?? 0;
  const style = (position: Position) => ({ width: position.width, height: position.height,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)` });

  return <>
    <div className={`artwork-virtual-feed artwork-virtual-feed--${layout}`} ref={containerRef} role="feed"
      aria-label={t("home.collectionTitle")} aria-busy={loading || loadingMore} style={{ height: width ? positions.height : 0 }}>
      {width > 0 && visible.map(position => loading
        ? <div className="feed-position feed-skeleton" key={position.id} style={style(position)} aria-hidden="true" />
        : <article className="artwork-card feed-position" key={position.id} style={style(position)}
            aria-posinset={position.index + 1} aria-setsize={hasNextPage ? -1 : items.length}
            onFocusCapture={() => setFocusedId(position.id)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedId(null); }}>
            {renderItem(items[position.index], position.width, position.index >= firstVisible && position.index < firstVisible + 2)}
          </article>)}
    </div>
    {!loading && !error && items.length === 0 && <p className="gallery-state">{emptyMessage}</p>}
    <p className="sr-only" aria-live="polite" aria-atomic="true">{loading ? t("works.loading") : `${items.length} ${t("feed.loaded")}`}</p>
    <div className="gallery-scroll-sentinel" ref={sentinelRef}>
      {loadingMore && <span role="status">{t("works.loadingMore")}</span>}
      {!loading && !error && !hasNextPage && items.length > 0 && <p>{t("feed.end")}</p>}
    </div>
    {error ? <div className="pagination-error" role="alert"><p>{t("works.loadFailed")}</p>
      <button className="pagination-load-more" type="button" disabled={loadingMore} onClick={retry}>{t("feed.retry")}</button></div> : null}
    {!error && !loading && hasNextPage && typeof IntersectionObserver === "undefined" && <button className="pagination-load-more" onClick={loadMore}>{t("works.loadMore")}</button>}
  </>;
}
