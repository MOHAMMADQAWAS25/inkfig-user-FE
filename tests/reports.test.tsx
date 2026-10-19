import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportDialog } from "../src/features/reports/ReportDialog";
import { createReport, getReportingEligibility } from "../src/features/reports/reportsApi";
import { translations as resources, type TranslationKey } from "../src/i18n/resources";

vi.mock("../src/features/reports/reportsApi", () => ({ createReport: vi.fn(), getReportingEligibility: vi.fn() }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); vi.mocked(createReport).mockResolvedValue(undefined); vi.mocked(getReportingEligibility).mockResolvedValue({allowed:true}); });
async function dialog(targetType: "user" | "work", language: "en" | "ar" = "en") {
  const view=render(<ReportDialog targetType={targetType} targetUserId="target" targetWorkId={targetType === "work" ? "work" : undefined}
    onClose={vi.fn()} t={(key: TranslationKey) => resources[language][key]} />);
  await screen.findByRole("radio",{name:resources[language][targetType==="user"?"reports.userReason.impersonation":"reports.reason.harassment"]});return view;
}

describe("report reasons and required details", () => {
  it("shows blocked reporting access without allowing a submission",async()=>{
    vi.mocked(getReportingEligibility).mockResolvedValue({allowed:false});
    render(<ReportDialog targetType="user" targetUserId="target" onClose={vi.fn()} t={key=>resources.en[key]}/>);
    await screen.findByText(resources.en["reports.reportingBlocked"]);
    expect(screen.queryByRole("radio")).toBeNull();expect(createReport).not.toHaveBeenCalled();
  });
  it("does not enable submissions when eligibility checking fails",async()=>{
    vi.mocked(getReportingEligibility).mockRejectedValue(new Error("offline"));
    render(<ReportDialog targetType="user" targetUserId="target" onClose={vi.fn()} t={key=>resources.en[key]}/>);
    await screen.findByText(resources.en["reports.failed"]);
    expect(screen.queryByRole("radio")).toBeNull();expect(createReport).not.toHaveBeenCalled();
    vi.mocked(getReportingEligibility).mockResolvedValue({allowed:true});
    fireEvent.click(screen.getByRole("button",{name:resources.en["admin.refresh"]}));
    await screen.findByRole("radio",{name:"Impersonation or fake account"});
  });
  it("handles a restriction imposed after the form was opened",async()=>{
    await dialog("work");
    vi.mocked(createReport).mockRejectedValue(new Error("Your reporting privileges have been blocked by an administrator."));
    fireEvent.submit(screen.getByRole("dialog"));
    await screen.findByText(resources.en["reports.reportingBlocked"]);
    expect(screen.queryByRole("radio")).toBeNull();
  });
  it("shows the duplicate error without a success message",async()=>{
    await dialog("user");vi.mocked(createReport).mockRejectedValue(new Error("You have already reported this subject."));
    fireEvent.submit(screen.getByRole("dialog"));
    await screen.findByText(resources.en["reports.duplicate"]);
    expect(screen.queryByText(resources.en["reports.success"])).toBeNull();
  });
  it("uses separate user reasons and the agreed default", async () => {
    await dialog("user");
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect((screen.getByRole("radio", {name:"Impersonation or fake account"}) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole("radio", {name:"Spam or scam"})).toBeTruthy();
    expect(screen.queryByRole("radio", {name:/Sexual|Violence|Copyright/})).toBeNull();
  });
  it("preserves post reasons and default without sexual content", async () => {
    await dialog("work");
    expect(screen.getAllByRole("radio")).toHaveLength(7);
    expect((screen.getByRole("radio", {name:"Harassment or bullying"}) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole("radio", {name:"Copyright violation"})).toBeTruthy();
    expect(screen.queryByRole("radio", {name:"Sexual content"})).toBeNull();
  });
  it.each(["user", "work"] as const)("requires normalized details for Other on %s", async target => {
    await dialog(target);
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
    await dialog("user");
    fireEvent.click(screen.getByRole("radio", {name:"Other"}));
    fireEvent.click(screen.getByRole("radio", {name:"Spam or scam"}));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).required).toBe(false);
    fireEvent.submit(screen.getByRole("dialog"));
    await waitFor(() => expect(createReport).toHaveBeenCalledWith(expect.objectContaining({reasonCode:"spam",details:""})));
  });
  it("localizes required details and user reasons in Arabic", async () => {
    await dialog("user", "ar");
    expect(screen.getByRole("radio", {name:resources.ar["reports.userReason.impersonation"]})).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", {name:resources.ar["reports.reason.other"]}));
    expect(screen.getByText(resources.ar["reports.detailsRequired"])).toBeTruthy();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).maxLength).toBe(2000);
  });
});
