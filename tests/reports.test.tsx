import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportDialog } from "../src/features/reports/ReportDialog";
import { createReport } from "../src/features/reports/reportsApi";
import { translations as resources, type TranslationKey } from "../src/i18n/resources";

vi.mock("../src/features/reports/reportsApi", () => ({ createReport: vi.fn() }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); vi.mocked(createReport).mockResolvedValue(undefined); });
function dialog(targetType: "user" | "work", language: "en" | "ar" = "en") {
  return render(<ReportDialog targetType={targetType} targetUserId="target" targetWorkId={targetType === "work" ? "work" : undefined}
    onClose={vi.fn()} t={(key: TranslationKey) => resources[language][key]} />);
}

describe("report reasons and required details", () => {
  it("uses separate user reasons and the agreed default", () => {
    dialog("user");
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect((screen.getByRole("radio", {name:"Impersonation or fake account"}) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole("radio", {name:"Spam or scam"})).toBeTruthy();
    expect(screen.queryByRole("radio", {name:/Sexual|Violence|Copyright/})).toBeNull();
  });
  it("preserves post reasons and default without sexual content", () => {
    dialog("work");
    expect(screen.getAllByRole("radio")).toHaveLength(7);
    expect((screen.getByRole("radio", {name:"Harassment or bullying"}) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole("radio", {name:"Copyright violation"})).toBeTruthy();
    expect(screen.queryByRole("radio", {name:"Sexual content"})).toBeNull();
  });
  it.each(["user", "work"] as const)("requires normalized details for Other on %s", async target => {
    dialog(target);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.required).toBe(false);
    fireEvent.click(screen.getByRole("radio", {name:"Other"}));
    expect(textarea.required).toBe(true);
    expect(screen.getByText("Additional details (required)")).toBeTruthy();
    for (const value of ["", "    ", "short", "a     b"]) {
      fireEvent.change(textarea, {target:{value}});
      fireEvent.submit(screen.getByRole("dialog"));
      expect(createReport).not.toHaveBeenCalled();
      expect(screen.getByRole("alert").textContent).toContain("at least 10");
    }
    fireEvent.change(textarea, {target:{value:"  Please   check this  "}});
    fireEvent.submit(screen.getByRole("dialog"));
    await waitFor(() => expect(createReport).toHaveBeenCalledWith(expect.objectContaining({targetType:target,reasonCode:"other",details:"Please check this"})));
  });
  it("makes details optional again after leaving Other", async () => {
    dialog("user");
    fireEvent.click(screen.getByRole("radio", {name:"Other"}));
    fireEvent.click(screen.getByRole("radio", {name:"Spam or scam"}));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).required).toBe(false);
    fireEvent.submit(screen.getByRole("dialog"));
    await waitFor(() => expect(createReport).toHaveBeenCalledWith(expect.objectContaining({reasonCode:"spam",details:""})));
  });
  it("localizes required details and user reasons in Arabic", () => {
    dialog("user", "ar");
    expect(screen.getByRole("radio", {name:resources.ar["reports.userReason.impersonation"]})).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", {name:resources.ar["reports.reason.other"]}));
    expect(screen.getByText(resources.ar["reports.detailsRequired"])).toBeTruthy();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).maxLength).toBe(2000);
  });
});
