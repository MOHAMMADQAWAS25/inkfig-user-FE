import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { getPendingReportCount } from "./reportsApi";

/** Fetch only a summary while the reports page is closed. */
export function useReportCount() {
  const { session } = useAuth();
  const enabled = Boolean(session && hasPermission(session.permissions, "reports.manage"));
  const client = useQueryClient();
  const userId = session?.userId;
  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let dirty = false;
    let active = true;
    const update = () => {
      dirty = true;
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(async () => {
        dirty = false;
        const queryKey = ["report-count", userId];
        // A signal during the initial fetch must not be lost behind an older count.
        await client.cancelQueries({ queryKey });
        if (active) void client.invalidateQueries({ queryKey });
      }, 150);
    };
    const visible = () => { if (dirty && !document.hidden) update(); };
    window.addEventListener("inkfig:reports-changed", update);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      window.clearTimeout(timer);
      window.removeEventListener("inkfig:reports-changed", update);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [client, enabled, userId]);
  const query = useQuery({
    queryKey: ["report-count", userId],
    queryFn: ({ signal }) => getPendingReportCount(signal),
    enabled, staleTime: 30_000, retry: false, refetchOnWindowFocus: true,
  });
  return enabled ? query.data?.pending_count : undefined;
}
