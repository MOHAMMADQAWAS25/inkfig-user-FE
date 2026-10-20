import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { translations } from "../src/i18n/resources";
import { UploadWorkPage } from "../src/features/works/UploadWorkPage";
import { getWorkTypes, type WorkType } from "../src/features/works/worksApi";

vi.mock("../src/features/auth/AuthContext", () => ({ useAuth: () => ({ session: { userId: "viewer", permissions: ["works.upload"] } }) }));
vi.mock("../src/features/navigation/AppSidebar", () => ({ AppSidebar: () => null }));
vi.mock("../src/features/works/worksApi", async importOriginal => ({ ...await importOriginal<typeof import("../src/features/works/worksApi")>(), getWorkTypes: vi.fn() }));

function deferred() {
  let resolve!: (items: WorkType[]) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<WorkType[]>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const types: WorkType[] = [{ type_id: "art", code: "digital-art", name_en: "Digital Art", name_ar: "فن رقمي" }];
function mount(language: "en" | "ar" = "en") {
  return render(<MemoryRouter initialEntries={[`/${language}/upload`]}><I18nProvider><UploadWorkPage /></I18nProvider></MemoryRouter>);
}
beforeEach(() => { vi.resetAllMocks(); });
afterEach(cleanup);

it.each(["en", "ar"] as const)("does not flash an empty/error message while types load (%s)", async language => {
  const request = deferred(); vi.mocked(getWorkTypes).mockReturnValue(request.promise);
  mount(language);
  expect(screen.queryByText(translations[language]["works.noTypes"])).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByRole("radio")).toBeNull();
  expect(screen.getByRole<HTMLButtonElement>("button", { name: translations[language]["works.publish"] }).disabled).toBe(true);
  await act(async () => request.resolve(types));
  expect(screen.getByRole("radio", { name: language === "en" ? "Digital Art" : "فن رقمي" })).toBeTruthy();
  expect(screen.queryByText(translations[language]["works.noTypes"])).toBeNull();
});

it("shows the empty state only after a successful empty response", async () => {
  const request = deferred(); vi.mocked(getWorkTypes).mockReturnValue(request.promise);
  mount(); expect(screen.queryByText(translations.en["works.noTypes"])).toBeNull();
  await act(async () => request.resolve([]));
  expect(screen.getByRole("status").textContent).toBe(translations.en["works.noTypes"]);
  expect(screen.queryByRole("alert")).toBeNull();
});

it("keeps failure distinct from empty data and retries without flashing either message", async () => {
  const first = deferred(), retry = deferred();
  vi.mocked(getWorkTypes).mockReturnValueOnce(first.promise).mockReturnValueOnce(retry.promise);
  mount(); await act(async () => first.reject(new Error("Offline")));
  expect(screen.getByRole("alert").textContent).toContain(translations.en["works.loadFailed"]);
  expect(screen.queryByText(translations.en["works.noTypes"])).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: translations.en["feed.retry"] }));
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByText(translations.en["works.noTypes"])).toBeNull();
  await act(async () => retry.resolve(types));
  expect(screen.getByRole("radio", { name: "Digital Art" })).toBeTruthy();
  expect(getWorkTypes).toHaveBeenCalledTimes(2);
});

it("ignores a previous page's pending request after unmount", async () => {
  const old = deferred(), current = deferred();
  vi.mocked(getWorkTypes).mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
  mount().unmount(); mount();
  await act(async () => old.resolve([]));
  expect(screen.queryByText(translations.en["works.noTypes"])).toBeNull();
  await act(async () => current.resolve(types));
  expect(screen.getByRole("radio", { name: "Digital Art" })).toBeTruthy();
});
