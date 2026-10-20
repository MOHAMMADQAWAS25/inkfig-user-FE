import type { ReportReason } from "./reportsApi";

export const userReportReasons: readonly ReportReason[] = ["impersonation", "harassment", "spam", "hate_speech", "other"];
export const workReportReasons: readonly ReportReason[] = ["harassment", "hate_speech", "violence", "spam", "copyright", "impersonation", "other"];

// Historical work reports remain filterable even though this reason is no longer offered for new reports.
const historicalWorkReasons: readonly ReportReason[] = [...workReportReasons, "sexual_content"];
export function reportFilterReasons(type: "all" | "work" | "user"): readonly ReportReason[] {
  if (type === "user") return userReportReasons;
  if (type === "work") return historicalWorkReasons;
  return [...new Set([...historicalWorkReasons, ...userReportReasons])];
}
