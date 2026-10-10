import { useEffect, useRef } from "react";

export function useFeedSentinel(enabled: boolean, loadMore: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = ref.current;
    if (!enabled || !sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadMore();
    }, { rootMargin: "1200px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, loadMore]);
  return ref;
}
