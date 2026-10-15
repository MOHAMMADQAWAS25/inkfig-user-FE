import { useEffect, useState } from "react";

export function useMobileViewport() {
  const [mobile, setMobile] = useState(() => window.matchMedia?.("(max-width: 720px)").matches ?? false);
  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 720px)");
    if (!query) return;
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return mobile;
}
