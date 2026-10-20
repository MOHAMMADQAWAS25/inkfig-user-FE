import React from "react";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useReportCount } from "../src/features/reports/useReportCount";
import { useReportsLive } from "../src/features/reports/useReportsLive";
import { AppSidebar } from "../src/features/navigation/AppSidebar";
import { AdminReportsPage } from "../src/features/admin/AdminReportsPage";
import { getPendingReportCount, getReports, reviewReport, setReporterRestriction, type ReportItem } from "../src/features/reports/reportsApi";
import { translations } from "../src/i18n/resources";
import { getWork } from "../src/features/works/worksApi";
import { getPublicProfile } from "../src/features/profile/profileApi";

const state=vi.hoisted(()=>({permissions:["reports.manage"] as string[],language:"en" as "en"|"ar"}));
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"manager",role:"admin",permissions:state.permissions},signOut:vi.fn()})}));
vi.mock("../src/i18n/I18nProvider",()=>({useI18n:()=>({language:state.language,t:(key:keyof typeof translations.en)=>translations[state.language][key]})}));
vi.mock("../src/features/exhibitions/useExhibitionCounts",()=>({useExhibitionCounts:()=>undefined}));
vi.mock("../src/features/notifications/useNotificationInbox",()=>({useNotificationInbox:()=>({items:[],unread:0,loading:false,cursor:null,loadingMore:false})}));
vi.mock("../src/features/notifications/notificationApi",()=>({getWebSocketTicket:vi.fn().mockResolvedValue({websocket_url:"wss://example.test",ticket:"ticket"}),notificationTarget:()=>"/en"}));
vi.mock("../src/features/reports/reportsApi",()=>({getPendingReportCount:vi.fn(),getReports:vi.fn(),reviewReport:vi.fn(),setReporterRestriction:vi.fn()}));
vi.mock("../src/features/profile/profileApi",()=>({getPublicProfile:vi.fn().mockResolvedValue({avatar_url:null}),searchProfilesPage:vi.fn()}));
vi.mock("../src/features/works/worksApi",()=>({getWork:vi.fn(),deleteWorkAsModerator:vi.fn()}));
vi.mock("../src/features/admin/administrationApi",()=>({setManagedUserStatus:vi.fn()}));

class Socket {
  static instances:Socket[]=[];
  onopen:(()=>void)|null=null;onmessage:((event:{data:string})=>void)|null=null;onclose:(()=>void)|null=null;
  constructor(){Socket.instances.push(this);}
  close(){}
}
const clients:QueryClient[]=[];
function wrapper({children}:{children:React.ReactNode}){
  return <MemoryRouter><QueryClientProvider client={clients[clients.length-1]}>{children}</QueryClientProvider></MemoryRouter>;
}
beforeEach(()=>{
  vi.clearAllMocks();state.permissions=["reports.manage"];state.language="en";Socket.instances=[];
  clients.push(new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}}));
  vi.stubGlobal("WebSocket",Socket);
  vi.stubGlobal("matchMedia",vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
  vi.spyOn(document,"hidden","get").mockReturnValue(false);
  vi.mocked(getPendingReportCount).mockResolvedValue({pending_count:4});
  vi.mocked(getReports).mockResolvedValue({items:[],next_cursor:null});
  vi.mocked(setReporterRestriction).mockResolvedValue(undefined);
  vi.mocked(getPublicProfile).mockResolvedValue({avatar_url:null} as Awaited<ReturnType<typeof getPublicProfile>>);
  Object.defineProperty(HTMLDialogElement.prototype,"showModal",{configurable:true,value:vi.fn(function(this:HTMLDialogElement){this.setAttribute("open","");})});
  Object.defineProperty(HTMLDialogElement.prototype,"close",{configurable:true,value:vi.fn(function(this:HTMLDialogElement){this.removeAttribute("open");})});
  vi.spyOn(window,"scrollTo").mockImplementation(()=>undefined);
});
afterEach(()=>{cleanup();for(const client of clients)client.clear();clients.length=0;vi.restoreAllMocks();vi.unstubAllGlobals();});
const signal=()=>window.dispatchEvent(new Event("inkfig:reports-changed"));

it("loads only a summary with the reports page closed and coalesces signals",async()=>{
  const view=renderHook(()=>useReportCount(),{wrapper});
  await waitFor(()=>expect(view.result.current).toBe(4));
  expect(getReports).not.toHaveBeenCalled();
  vi.mocked(getPendingReportCount).mockResolvedValue({pending_count:5});
  act(()=>{signal();signal();signal();});
  await waitFor(()=>expect(view.result.current).toBe(5));
  expect(getPendingReportCount).toHaveBeenCalledTimes(2);
  expect(getReports).not.toHaveBeenCalled();
});
it("does not fetch counts without management permission",()=>{
  state.permissions=[];const view=renderHook(()=>useReportCount(),{wrapper});
  expect(view.result.current).toBeUndefined();expect(getPendingReportCount).not.toHaveBeenCalled();
});
it("defers hidden-tab updates and stops listening after unmount",async()=>{
  const view=renderHook(()=>useReportCount(),{wrapper});
  await waitFor(()=>expect(view.result.current).toBe(4));
  vi.spyOn(document,"hidden","get").mockReturnValue(true);
  act(()=>signal());await new Promise(resolve=>setTimeout(resolve,200));
  expect(getPendingReportCount).toHaveBeenCalledOnce();
  vi.spyOn(document,"hidden","get").mockReturnValue(false);
  act(()=>document.dispatchEvent(new Event("visibilitychange")));
  await waitFor(()=>expect(getPendingReportCount).toHaveBeenCalledTimes(2));
  view.unmount();act(()=>signal());await new Promise(resolve=>setTimeout(resolve,200));
  expect(getPendingReportCount).toHaveBeenCalledTimes(2);
});
it("does not lose a signal arriving during the first count request",async()=>{
  let resolve!:(value:{pending_count:number})=>void;
  vi.mocked(getPendingReportCount).mockImplementationOnce(()=>new Promise(done=>{resolve=done;})).mockResolvedValue({pending_count:9});
  const view=renderHook(()=>useReportCount(),{wrapper});
  act(()=>signal());await waitFor(()=>expect(view.result.current).toBe(9));
  await act(async()=>resolve({pending_count:2}));
  expect(view.result.current).toBe(9);
});
it("updates the desktop Reports badge through websocket messages and reconnect",async()=>{
  render(<AppSidebar/>,{wrapper});
  const link=screen.getByRole("link",{name:translations.en["nav.reports"]});
  await waitFor(()=>expect(link.querySelector(".notification-badge")?.textContent).toBe("4"));
  await waitFor(()=>expect(Socket.instances).toHaveLength(1));
  vi.mocked(getPendingReportCount).mockResolvedValue({pending_count:7});
  act(()=>Socket.instances[0].onmessage?.({data:JSON.stringify({type:"reports.changed"})}));
  await waitFor(()=>expect(link.querySelector(".notification-badge")?.textContent).toBe("7"));
  vi.mocked(getPendingReportCount).mockResolvedValue({pending_count:0});
  act(()=>Socket.instances[0].onopen?.());
  await waitFor(()=>expect(link.querySelector(".notification-badge")).toBeNull());
  expect(getReports).not.toHaveBeenCalled();
});
it("refreshes report lists only while open and mounted",async()=>{
  const refresh=vi.fn();const view=renderHook(({enabled})=>useReportsLive(refresh,enabled),{initialProps:{enabled:false}});
  act(()=>signal());await new Promise(resolve=>setTimeout(resolve,230));expect(refresh).not.toHaveBeenCalled();
  view.rerender({enabled:true});act(()=>{signal();signal();});await waitFor(()=>expect(refresh).toHaveBeenCalledOnce());
  view.unmount();act(()=>signal());await new Promise(resolve=>setTimeout(resolve,230));expect(refresh).toHaveBeenCalledOnce();
});
const report={report_id:"report",reporter_user_id:"reporter",reporter_name:"Reporter",reporter_reporting_blocked:false,reporter_can_be_restricted:true,target_type:"user",target_user_id:"target",target_user_name:"Target",target_work_id:null,target_work_title:null,reason_code:"spam",details:null,status:"pending",reviewer_notes:null,created_at:"2026-10-19T12:00:00Z",reviewed_at:null} as ReportItem;
it("blocks and restores the reporter, not the reported target",async()=>{
  vi.spyOn(window,"confirm").mockReturnValue(true);
  vi.mocked(getReports).mockResolvedValue({items:[report],next_cursor:null});
  const view=render(<AdminReportsPage/>,{wrapper});
  await waitFor(()=>expect(view.container.querySelector(".moderation-target")).not.toBeNull());
  fireEvent.click(view.container.querySelector(".moderation-target")!);
  fireEvent.click(await screen.findByRole("button",{name:translations.en["reports.blockReporter"]}));
  await waitFor(()=>expect(setReporterRestriction).toHaveBeenCalledWith("reporter",true));
  fireEvent.click(await screen.findByRole("button",{name:translations.en["reports.unblockReporter"]}));
  await waitFor(()=>expect(setReporterRestriction).toHaveBeenCalledWith("reporter",false));
});

async function openReport(item=report) {
  vi.mocked(getReports).mockResolvedValue({items:[item],next_cursor:null});
  const view=render(<AdminReportsPage/>,{wrapper});
  await waitFor(()=>expect(view.container.querySelector(".moderation-target")).not.toBeNull());
  const trigger=view.container.querySelector<HTMLButtonElement>(".moderation-target")!;
  fireEvent.click(trigger);
  return {...view,trigger,dialog:screen.getByRole("dialog",{name:translations[state.language]["reports.detailsTitle"]})};
}

it("opens report details in a native popup without shrinking/reloading the table and restores focus",async()=>{
  const {container,trigger,dialog}=await openReport();
  expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce();
  expect(container.querySelector(".moderation-layout.has-selection")).toBeNull();
  expect(container.querySelector("aside.moderation-detail")).toBeNull();
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  expect(document.body.style.position).toBe("fixed");
  const close=within(dialog).getByRole("button",{name:translations.en["reports.closeDetails"]});
  expect(document.activeElement).toBe(close);
  expect(within(dialog).queryByRole("button",{name:translations.en["reports.suspendUser"]})).toBeNull();
  fireEvent.click(close);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(document.body.style.position).toBe("");
  expect(getReports).toHaveBeenCalledOnce();
  expect(container.querySelector(".moderation-target")).toBe(trigger);
});

it("closes on native Escape cancellation without applying a moderation action",async()=>{
  const {dialog}=await openReport();
  fireEvent(dialog,new Event("cancel",{cancelable:true}));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(reviewReport).not.toHaveBeenCalled();
});

it("closes only for backdrop clicks, not dialog content or its inside padding",async()=>{
  const {dialog}=await openReport();
  vi.spyOn(dialog,"getBoundingClientRect").mockReturnValue({left:100,right:600,top:100,bottom:700} as DOMRect);
  fireEvent.click(within(dialog).getByRole("heading",{name:translations.en["reports.detailsTitle"]}));
  fireEvent.click(dialog,{clientX:120,clientY:120});
  expect(screen.getByRole("dialog")).toBe(dialog);
  fireEvent.click(dialog,{clientX:20,clientY:20});
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("prevents dismissal during review and closes cleanly when the reviewed row leaves the pending filter",async()=>{
  let finish!:()=>void;
  vi.mocked(reviewReport).mockReturnValueOnce(new Promise<void>(resolve=>{finish=resolve;}));
  const {dialog}=await openReport();
  fireEvent.click(within(dialog).getByRole("button",{name:translations.en["reports.markReviewed"]}));
  const close=within(dialog).getByRole<HTMLButtonElement>("button",{name:translations.en["reports.closeDetails"]});
  expect(close.disabled).toBe(true);
  fireEvent(dialog,new Event("cancel",{cancelable:true}));
  fireEvent.click(dialog,{clientX:-1,clientY:-1});
  expect(screen.getByRole("dialog")).toBe(dialog);
  await act(async()=>finish());
  expect(reviewReport).toHaveBeenCalledWith("report","reviewed");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.body.style.position).toBe("");
});

it("shows moderation errors inside the popup rather than behind it",async()=>{
  vi.mocked(reviewReport).mockRejectedValueOnce(new Error("Offline"));
  const {dialog}=await openReport();
  fireEvent.click(within(dialog).getByRole("button",{name:translations.en["reports.markReviewed"]}));
  expect((await within(dialog).findByRole("alert")).textContent).toBe(translations.en["reports.actionFailed"]);
  expect(screen.getAllByRole("alert")).toHaveLength(1);
});

it("keeps work deletion and account suspension controls permission-gated inside the popup",async()=>{
  state.permissions=["reports.manage","works.delete_any","users.status.manage"];
  vi.mocked(getWork).mockResolvedValue({work_id:"work",image_url:"/art.png",title:"Reported artwork",type_name_en:"Digital Art"} as Awaited<ReturnType<typeof getWork>>);
  const {dialog}=await openReport({...report,target_type:"work",target_work_id:"work",target_work_title:"Reported artwork"});
  expect(within(dialog).getByRole("button",{name:translations.en["reports.deleteWork"]})).toBeTruthy();
  expect(within(dialog).getByRole("button",{name:translations.en["reports.suspendUser"]})).toBeTruthy();
  expect(within(dialog).getByRole("link",{name:translations.en["reports.viewPost"]}).getAttribute("href")).toContain("work=work");
});

it("preserves selected filters and loaded pages when the popup closes",async()=>{
  const second={...report,report_id:"second",target_user_name:"Second target"};
  vi.mocked(getReports).mockResolvedValueOnce({items:[report],next_cursor:25}).mockResolvedValueOnce({items:[report],next_cursor:25}).mockResolvedValueOnce({items:[second],next_cursor:null});
  const view=render(<AdminReportsPage/>,{wrapper});
  await screen.findByRole("button",{name:translations.en["reports.loadMore"]});
  const reason=screen.getByRole<HTMLSelectElement>("combobox",{name:translations.en["reports.reason"]});
  fireEvent.change(reason,{target:{value:"spam"}});
  await waitFor(()=>expect(getReports).toHaveBeenCalledTimes(2));
  fireEvent.click(await screen.findByRole("button",{name:translations.en["reports.loadMore"]}));
  await waitFor(()=>expect(view.container.querySelectorAll(".moderation-target")).toHaveLength(2));
  fireEvent.click(view.container.querySelectorAll(".moderation-target")[1]);
  fireEvent.click(screen.getByRole("button",{name:translations.en["reports.closeDetails"]}));
  expect(reason.value).toBe("spam");
  expect(view.container.querySelectorAll(".moderation-target")).toHaveLength(2);
  expect(getReports).toHaveBeenCalledTimes(3);
});

it("sends type/reason/sort to the server before loading the next filtered batch",async()=>{
  const matched={...report,report_id:"matched",target_user_name:"Server match"};
  vi.mocked(getReports).mockImplementation(async(_status,cursor,filters)=>({items:filters?.reasonCode==="copyright"?[{...matched,report_id:cursor?"next-match":"matched"}]:[],next_cursor:filters?.reasonCode==="copyright"&&cursor===0?25:null,total:50,type_counts:{all:50,work:40,user:10}}));
  const view=render(<AdminReportsPage/>,{wrapper});
  await screen.findByText("Showing 0 of 50 matching reports");
  fireEvent.click(view.container.querySelectorAll(".moderation-tabs button")[1]);
  await waitFor(()=>expect(getReports).toHaveBeenLastCalledWith("pending",0,expect.objectContaining({targetType:"work"})));
  fireEvent.change(screen.getByRole("combobox",{name:translations.en["reports.reason"]}),{target:{value:"copyright"}});
  await screen.findByText("Server match");
  fireEvent.change(screen.getByRole("combobox",{name:translations.en["reports.sort"]}),{target:{value:"oldest"}});
  await waitFor(()=>expect(getReports).toHaveBeenLastCalledWith("pending",0,{targetType:"work",reasonCode:"copyright",sort:"oldest"}));
  fireEvent.click(await screen.findByRole("button",{name:translations.en["reports.loadMore"]}));
  await waitFor(()=>expect(getReports).toHaveBeenLastCalledWith("pending",25,{targetType:"work",reasonCode:"copyright",sort:"oldest"}));
  await waitFor(()=>expect(view.container.querySelectorAll(".moderation-target")).toHaveLength(2));
});

it("ignores old report batches when the filter changes during a request",async()=>{
  let finish!:(value:{items:ReportItem[];next_cursor:null;total:number})=>void;
  vi.mocked(getReports).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockResolvedValue({items:[{...report,target_user_name:"New report scope"}],next_cursor:null,total:1,type_counts:{all:1,work:0,user:1}});
  render(<AdminReportsPage/>,{wrapper});
  fireEvent.change(screen.getByRole("combobox",{name:translations.en["reports.reason"]}),{target:{value:"spam"}});
  await screen.findByText("New report scope");
  await act(async()=>finish({items:[{...report,target_user_name:"Stale report scope"}],next_cursor:null,total:900}));
  expect(screen.queryByText("Stale report scope")).toBeNull();
  expect(screen.getByText("Showing 1 of 1 matching reports")).toBeTruthy();
});

it("places the reported artwork in the media column and all details/actions in the other column",async()=>{
  vi.mocked(getWork).mockResolvedValue({work_id:"work",image_url:"/reported-art.png",title:"Reported artwork",type_name_en:"Digital Art"} as Awaited<ReturnType<typeof getWork>>);
  const {dialog}=await openReport({...report,target_type:"work",target_work_id:"work",target_work_title:"Reported artwork"});
  const media=dialog.querySelector<HTMLElement>(".moderation-detail-media")!;
  const content=dialog.querySelector<HTMLElement>(".moderation-detail-content")!;
  const image=await within(media).findByRole("img",{name:"Reported artwork"});
  expect(image.getAttribute("src")).toBe("/reported-art.png");
  expect(image.getAttribute("draggable")).toBe("false");
  expect(fireEvent.contextMenu(image)).toBe(false);
  expect(within(content).getByRole("heading",{name:translations.en["reports.detailsTitle"]})).toBeTruthy();
  expect(within(content).getByRole("button",{name:translations.en["reports.markReviewed"]})).toBeTruthy();
  expect(within(media).queryByRole("button")).toBeNull();
  expect(within(content).queryByRole("img")).toBeNull();
});

it("places an account avatar in the media column and preserves Arabic detail direction",async()=>{
  state.language="ar";
  vi.mocked(getPublicProfile).mockResolvedValue({avatar_url:"/reported-avatar.png"} as Awaited<ReturnType<typeof getPublicProfile>>);
  const {dialog}=await openReport();
  const media=dialog.querySelector<HTMLElement>(".moderation-detail-media")!;
  const content=dialog.querySelector<HTMLElement>(".moderation-detail-content")!;
  expect((await within(media).findByRole("img",{name:"Target"})).getAttribute("src")).toBe("/reported-avatar.png");
  expect(content.dir).toBe("rtl");
  expect(within(content).getByRole("heading",{name:translations.ar["reports.detailsTitle"]})).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button",{name:translations.ar["reports.closeDetails"]}));
  expect(screen.queryByRole("dialog")).toBeNull();
});
