import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AdminUsersPage } from "../src/features/admin/AdminUsersPage";
import { getManagedUsersPage, setManagedUserStatus, type ManagedUserPage } from "../src/features/admin/administrationApi";
import { translations } from "../src/i18n/resources";

const auth=vi.hoisted(()=>({permissions:["users.read","users.status.manage"]}));
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"manager",role:"system_administrator",permissions:auth.permissions}})}));
vi.mock("../src/features/navigation/AppSidebar",()=>({AppSidebar:()=>null}));
vi.mock("../src/i18n/I18nProvider",()=>({useI18n:()=>({language:"en",t:(key:keyof typeof translations.en)=>translations.en[key]})}));
vi.mock("../src/features/admin/administrationApi",()=>({getManagedUsersPage:vi.fn(),setManagedUserRole:vi.fn(),setManagedUserStatus:vi.fn()}));
const clients:QueryClient[]=[];
const user={user_id:"artist",email:"artist@example.com",full_name:"Remote match",role:"user" as const,is_active:true};
const page:ManagedUserPage={items:[user],total:31,next_cursor:10,summary:{total:1000,active:800,administrators:5}};
function mount(){const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});clients.push(client);return render(<QueryClientProvider client={client}><MemoryRouter><AdminUsersPage/></MemoryRouter></QueryClientProvider>);}
beforeEach(()=>{vi.resetAllMocks();auth.permissions=["users.read","users.status.manage"];vi.mocked(getManagedUsersPage).mockResolvedValue(page);});
afterEach(()=>{cleanup();clients.forEach(client=>client.clear());clients.length=0;});

it("requests only the selected server page and uses server totals for page numbers and overview",async()=>{
  mount();await screen.findByText("Remote match");
  expect(getManagedUsersPage).toHaveBeenCalledTimes(1);
  expect(getManagedUsersPage).toHaveBeenLastCalledWith(0,expect.objectContaining({limit:10}),expect.any(AbortSignal));
  expect(screen.getByText("1000")).toBeTruthy();expect(screen.getByText("31 results")).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:translations.en["admin.next"]}));
  await waitFor(()=>expect(getManagedUsersPage).toHaveBeenLastCalledWith(10,expect.any(Object),expect.any(AbortSignal)));
  expect(await screen.findByText("Page 2 of 4")).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:translations.en["admin.previous"]}));
  await screen.findByText("Page 1 of 4");
});

it("sends filters and debounced search to the server, always resetting changed scopes to page one",async()=>{
  mount();await screen.findByText("Remote match");
  fireEvent.click(screen.getByRole("button",{name:translations.en["admin.next"]}));await screen.findByText("Page 2 of 4");
  fireEvent.change(screen.getByRole("combobox",{name:translations.en["admin.filterRole"]}),{target:{value:"supervisor"}});
  await waitFor(()=>expect(getManagedUsersPage).toHaveBeenLastCalledWith(0,expect.objectContaining({role:"supervisor"}),expect.any(AbortSignal)));
  fireEvent.change(screen.getByRole("combobox",{name:translations.en["admin.filterStatus"]}),{target:{value:"suspended"}});
  await waitFor(()=>expect(getManagedUsersPage).toHaveBeenLastCalledWith(0,expect.objectContaining({role:"supervisor",isActive:false}),expect.any(AbortSignal)));
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"  missing artist  "}});
  await waitFor(()=>expect(getManagedUsersPage).toHaveBeenLastCalledWith(0,expect.objectContaining({query:"missing artist",role:"supervisor",isActive:false}),expect.any(AbortSignal)));
});

it("does not allow an old in-flight filter response to replace the current results",async()=>{
  let finish!:(value:ManagedUserPage)=>void;
  vi.mocked(getManagedUsersPage).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockResolvedValue({...page,items:[{...user,full_name:"New filter result"}]});
  mount();fireEvent.change(screen.getByRole("combobox",{name:translations.en["admin.filterRole"]}),{target:{value:"supervisor"}});
  await screen.findByText("New filter result");
  await act(async()=>finish(page));
  expect(screen.queryByText("Remote match")).toBeNull();
});

it("refreshes server data and summaries after changing a user rather than filtering the local page",async()=>{
  vi.mocked(setManagedUserStatus).mockResolvedValue({...user,is_active:false});
  mount();await screen.findByText("Remote match");
  fireEvent.click(screen.getByRole("button",{name:translations.en["admin.suspend"]}));
  vi.mocked(getManagedUsersPage).mockResolvedValue({...page,items:[],total:0,summary:{total:1000,active:799,administrators:5}});
  fireEvent.click(screen.getByRole("button",{name:translations.en["admin.confirm"]}));
  await waitFor(()=>expect(setManagedUserStatus).toHaveBeenCalledWith("artist",false));
  await waitFor(()=>expect(getManagedUsersPage).toHaveBeenCalledTimes(2));
  expect(await screen.findByText("799")).toBeTruthy();
});

it("does not fetch the protected directory without permission",()=>{
  auth.permissions=[];mount();expect(getManagedUsersPage).not.toHaveBeenCalled();
});

it("returns to a valid page when a refresh reduces the number of matching pages",async()=>{
  mount();await screen.findByText("Remote match");
  fireEvent.click(screen.getByRole("button",{name:translations.en["admin.next"]}));await screen.findByText("Page 2 of 4");
  vi.mocked(getManagedUsersPage).mockResolvedValue({...page,total:1,next_cursor:null});
  fireEvent.click(screen.getByRole("button",{name:translations.en["admin.refresh"]}));
  await waitFor(()=>expect(getManagedUsersPage).toHaveBeenLastCalledWith(0,expect.any(Object),expect.any(AbortSignal)));
  await screen.findByText("1 results");
  expect(screen.queryByRole("button",{name:translations.en["admin.next"]})).toBeNull();
});

it("shows a fetch error rather than claiming a failed filtered request has no results",async()=>{
  vi.mocked(getManagedUsersPage).mockRejectedValue(new Error("Offline"));
  mount();await screen.findByRole("alert");
  expect(screen.queryByText(translations.en["admin.noUsers"])).toBeNull();
});
