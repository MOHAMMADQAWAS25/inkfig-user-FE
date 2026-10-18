import { useEffect, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 500;

export function useDebouncedSearch(value: string): string {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [value]);
  return settled;
}
