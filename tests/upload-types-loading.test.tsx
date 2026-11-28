import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { translations } from "../src/i18n/resources";
import { UploadWorkPage } from "../src/features/works/UploadWorkPage";
import { getWorkTypes, type WorkType } from "../src/features/works/worksApi";
import { cacheWorkTypes } from "../src/features/works/workTypesCache";

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
beforeEach(() => { vi.resetAllMocks(); sessionStorage.clear(); });
afterEach(()=>{cleanup();sessionStorage.clear();vi.unstubAllGlobals();vi.restoreAllMocks();});

it.each(["en", "ar"] as const)("does not flash an empty/error message while types load (%s)", async language => {
  const request = deferred(); vi.mocked(getWorkTypes).mockReturnValue(request.promise);
  mount(language);
  expect(screen.queryByText(translations[language]["works.noTypes"])).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByRole("radio")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe(translations[language]["works.loadingTypes"]);
  expect(document.querySelectorAll(".work-type-skeleton")).toHaveLength(9);
  expect(screen.getByRole<HTMLButtonElement>("button", { name: translations[language]["works.publish"] }).disabled).toBe(true);
  await act(async () => request.resolve(types));
  expect(screen.getByRole("radio", { name: language === "en" ? "Digital Art" : "فن رقمي" })).toBeTruthy();
  expect(screen.queryByText(translations[language]["works.noTypes"])).toBeNull();
});

it("renders cached official type buttons on the first render rather than waiting for an effect",()=>{
  cacheWorkTypes(types);vi.mocked(getWorkTypes).mockReturnValue(new Promise(()=>{}));
  mount();expect(screen.getByRole("radio",{name:"Digital Art"})).toBeTruthy();
  expect(document.querySelector(".work-type-skeleton")).toBeNull();
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
it.each([["en",true],["ar",true],["en",false],["ar",false]] as const)("places one editable links section in the correct %s layout (phone=%s)",(language,mobile)=>{
  vi.stubGlobal("matchMedia",()=>({matches:mobile,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  cacheWorkTypes(types);vi.mocked(getWorkTypes).mockReturnValue(new Promise(()=>{}));
  const {container}=mount(language);
  const field=screen.getByRole("group",{name:translations[language]["works.links"]});
  expect(container.querySelectorAll(".work-links-field")).toHaveLength(1);
  expect(Boolean(field.closest(".upload-details"))).toBe(mobile);
  expect(Boolean(field.closest(".upload-media-panel"))).toBe(!mobile);
  if(mobile){
    expect(field.previousElementSibling?.querySelector("textarea")).toBeTruthy();
    expect(field.compareDocumentPosition(container.querySelector(".upload-actions")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }
  fireEvent.change(screen.getByRole("textbox",{name:translations[language]["works.linkLabel"]}),{target:{value:"Portfolio"}});
  expect(screen.getByRole<HTMLInputElement>("textbox",{name:translations[language]["works.linkLabel"]}).value).toBe("Portfolio");
  fireEvent.click(screen.getByRole("button",{name:translations[language]["works.addLink"]}));
  expect(field.querySelectorAll(".work-link-row")).toHaveLength(2);
});
it.each([["en",true],["ar",true],["en",false],["ar",false]] as const)("starts the %s upload at the top only on phones (phone=%s), not on every edit",(language,mobile)=>{
  vi.stubGlobal("matchMedia",()=>({matches:mobile,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  const scroll=vi.spyOn(window,"scrollTo").mockImplementation(()=>{});
  cacheWorkTypes(types);vi.mocked(getWorkTypes).mockReturnValue(new Promise(()=>{}));
  const {container}=mount(language);
  if(mobile)expect(scroll).toHaveBeenCalledExactlyOnceWith({top:0,left:0,behavior:"instant"});
  else expect(scroll).not.toHaveBeenCalled();
  scroll.mockClear();
  fireEvent.change(container.querySelector("textarea")!,{target:{value:"A description"}});
  expect(scroll).not.toHaveBeenCalled();
});
