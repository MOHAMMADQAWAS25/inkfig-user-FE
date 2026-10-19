import React from "react";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useReportCount } from "../src/features/reports/useReportCount";
import { useReportsLive } from "../src/features/reports/useReportsLive";
import { AppSidebar } from "../src/features/navigation/AppSidebar";
import { AdminReportsPage } from "../src/features/admin/AdminReportsPage";
import { getPendingReportCount, getReports, setReporterRestriction, type ReportItem } from "../src/features/reports/reportsApi";
import { translations } from "../src/i18n/resources";

const state=vi.hoisted(()=>({permissions:["reports.manage"] as string[]}));
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"manager",role:"admin",permissions:state.permissions},signOut:vi.fn()})}));
vi.mock("../src/i18n/I18nProvider",()=>({useI18n:()=>({language:"en",t:(key:keyof typeof translations.en)=>translations.en[key]})}));
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
  vi.clearAllMocks();state.permissions=["reports.manage"];Socket.instances=[];
  clients.push(new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}}));
  vi.stubGlobal("WebSocket",Socket);
  vi.stubGlobal("matchMedia",vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
  vi.spyOn(document,"hidden","get").mockReturnValue(false);
  vi.mocked(getPendingReportCount).mockResolvedValue({pending_count:4});
  vi.mocked(getReports).mockResolvedValue({items:[],next_cursor:null});
  vi.mocked(setReporterRestriction).mockResolvedValue(undefined);
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
