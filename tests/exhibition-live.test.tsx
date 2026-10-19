import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useNotificationInbox } from "../src/features/notifications/useNotificationInbox";
import { useExhibitionLive } from "../src/features/exhibitions/useExhibitionLive";
import { useExhibitionCounts } from "../src/features/exhibitions/useExhibitionCounts";
import { getNotifications, getUnreadNotificationCount, markNotificationsRead, notificationTarget, type NotificationItem } from "../src/features/notifications/notificationApi";
import { getExhibitionCounts } from "../src/features/exhibitions/exhibitionApi";

const state=vi.hoisted(()=>({permissions:["exhibitions.manage"] as string[]}));
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"manager",permissions:state.permissions}})}));
vi.mock("../src/features/notifications/notificationApi",async original=>({...await original<object>(),getNotifications:vi.fn(),getUnreadNotificationCount:vi.fn(),markNotificationsRead:vi.fn()}));
vi.mock("../src/features/exhibitions/exhibitionApi",()=>({getExhibitionCounts:vi.fn()}));
beforeEach(()=>{
  vi.clearAllMocks();state.permissions=["exhibitions.manage"];
  vi.mocked(getNotifications).mockResolvedValue({items:[],unread_count:0,next_cursor:null});
  vi.mocked(getUnreadNotificationCount).mockResolvedValue({unread_count:3});
  vi.mocked(markNotificationsRead).mockResolvedValue(undefined);
  vi.mocked(getExhibitionCounts).mockResolvedValue({total:5,items:[{exhibition_id:"event",submissions:3,withdrawals:2}]});
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});
const signal=(id?:string)=>window.dispatchEvent(new CustomEvent("inkfig:exhibitions-changed",{detail:{exhibition_id:id}}));

it("closed notification panels fetch only unread counts, even on live events",async()=>{
  const hook=renderHook(()=>useNotificationInbox("student",false));
  await waitFor(()=>expect(hook.result.current.unread).toBe(3));
  expect(getNotifications).not.toHaveBeenCalled();
  act(()=>window.dispatchEvent(new Event("inkfig:notifications-changed")));
  await waitFor(()=>expect(getUnreadNotificationCount).toHaveBeenCalledTimes(2));
  expect(getNotifications).not.toHaveBeenCalled();expect(markNotificationsRead).not.toHaveBeenCalled();
});
it("open panels fetch their list, mark it read, and refresh live without closed background lists",async()=>{
  vi.mocked(getNotifications).mockResolvedValue({items:[],unread_count:2,next_cursor:null});
  const hook=renderHook(({open})=>useNotificationInbox("student",open),{initialProps:{open:false}});
  await waitFor(()=>expect(hook.result.current.unread).toBe(3));
  hook.rerender({open:true});
  await waitFor(()=>expect(markNotificationsRead).toHaveBeenCalledOnce());
  act(()=>window.dispatchEvent(new Event("inkfig:notifications-changed")));
  await waitFor(()=>expect(getNotifications).toHaveBeenCalledTimes(2));
  hook.rerender({open:false});
  act(()=>window.dispatchEvent(new Event("inkfig:notifications-changed")));
  await waitFor(()=>expect(getUnreadNotificationCount).toHaveBeenCalledTimes(3));
  expect(getNotifications).toHaveBeenCalledTimes(2);
});
it("discards delayed list responses after closing or switching account",async()=>{
  let resolve!:(value:Awaited<ReturnType<typeof getNotifications>>)=>void;
  vi.mocked(getNotifications).mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));
  const hook=renderHook(({user,open})=>useNotificationInbox(user,open),{initialProps:{user:"one",open:true}});
  hook.rerender({user:"two",open:false});
  await act(async()=>resolve({items:[{notification_id:"old"} as NotificationItem],unread_count:50,next_cursor:null}));
  await waitFor(()=>expect(hook.result.current.unread).toBe(3));
  expect(hook.result.current.items).toEqual([]);expect(markNotificationsRead).not.toHaveBeenCalled();
});
it("refreshes only an open matching submission list and coalesces event bursts",async()=>{
  const refresh=vi.fn();const view=renderHook(({enabled})=>useExhibitionLive("event",refresh,enabled),{initialProps:{enabled:true}});
  act(()=>signal("another"));await new Promise(resolve=>setTimeout(resolve,250));expect(refresh).not.toHaveBeenCalled();
  act(()=>{signal("event");signal("event");signal("event");});
  await waitFor(()=>expect(refresh).toHaveBeenCalledOnce());
  view.rerender({enabled:false});act(()=>signal("event"));await new Promise(resolve=>setTimeout(resolve,250));expect(refresh).toHaveBeenCalledOnce();
});
it("defers hidden submission updates and refreshes once when visible",async()=>{
  vi.spyOn(document,"hidden","get").mockReturnValue(true);
  const refresh=vi.fn();renderHook(()=>useExhibitionLive("event",refresh));
  act(()=>signal("event"));await new Promise(resolve=>setTimeout(resolve,250));expect(refresh).not.toHaveBeenCalled();
  vi.spyOn(document,"hidden","get").mockReturnValue(false);
  act(()=>document.dispatchEvent(new Event("visibilitychange")));
  await waitFor(()=>expect(refresh).toHaveBeenCalledOnce());
});
it("shares lightweight manager counters and invalidates on live updates",async()=>{
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
  const wrapper=({children}:{children:React.ReactNode})=><QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const hook=renderHook(()=>[useExhibitionCounts(),useExhibitionCounts()],{wrapper});
  await waitFor(()=>expect(hook.result.current[0]?.total).toBe(5));
  expect(getExhibitionCounts).toHaveBeenCalledOnce();
  act(()=>signal("event"));await waitFor(()=>expect(getExhibitionCounts).toHaveBeenCalledTimes(2));
  hook.unmount();client.clear();
});
it("does not request admin counters for students",async()=>{
  state.permissions=[];const client=new QueryClient();
  const wrapper=({children}:{children:React.ReactNode})=><QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const hook=renderHook(()=>useExhibitionCounts(),{wrapper});
  expect(hook.result.current).toBeUndefined();expect(getExhibitionCounts).not.toHaveBeenCalled();hook.unmount();client.clear();
});
it("links student decisions to their own submission list, with a safe deleted-exhibition fallback",()=>{
  const item={event_type:"withdrawal_approved",exhibition_id:"event"} as NotificationItem;
  expect(notificationTarget(item,"ar")).toBe("/ar/exhibition/event/submissions");
  expect(notificationTarget({...item,exhibition_id:null},"en")).toBe("/en/exhibition");
});
