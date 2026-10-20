import React, { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useExhibitionClock, useExhibitionGallery } from "../src/features/exhibitions/useExhibitionGallery";
import { getExhibition, getSubmissions, type Exhibition, type Page, type Submission } from "../src/features/exhibitions/exhibitionApi";

vi.mock("../src/features/exhibitions/exhibitionApi", () => ({getExhibition: vi.fn(), getSubmissions: vi.fn()}));
const event = { exhibition_id: "one", event_at: "2020-01-01T00:00:00Z", event_ends_at: "2090-01-01T00:00:00Z" } as Exhibition;
const first = {submission_id:"a",title:"First"} as Submission;
const second = {submission_id:"b",title:"Second"} as Submission;
const clients: QueryClient[] = [];
function setup() {
  const client = new QueryClient({defaultOptions:{queries:{retry:false}}});
  clients.push(client);
  const wrapper = ({children}:{children:React.ReactNode}) => <StrictMode><QueryClientProvider client={client}>{children}</QueryClientProvider></StrictMode>;
  return {client,wrapper};
}
function deferred<T>() { let resolve!:(value:T)=>void; let reject!:(error:Error)=>void; const promise = new Promise<T>((done,fail)=>{resolve=done;reject=fail;}); return {promise,resolve,reject}; }
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getExhibition).mockResolvedValue(event);
  vi.mocked(getSubmissions).mockResolvedValue({items:[first],next_cursor:null});
});
afterEach(() => {cleanup(); clients.forEach(client=>client.clear()); clients.length=0; vi.useRealTimers(); vi.restoreAllMocks();});

it("has one initial loading stage, deduplicates Strict Mode requests and restores cached navigation", async () => {
  const pending = deferred<Page<Submission>>();
  vi.mocked(getSubmissions).mockReturnValue(pending.promise);
  const {wrapper}=setup();
  const hook=renderHook(()=>useExhibitionGallery("one","guest"),{wrapper});
  await waitFor(()=>expect(getSubmissions).toHaveBeenCalledOnce());
  expect(hook.result.current.loading).toBe(true);
  expect(getExhibition).toHaveBeenCalledOnce();
  await act(async()=>pending.resolve({items:[first],next_cursor:null}));
  await waitFor(()=>expect(hook.result.current.loading).toBe(false));
  hook.unmount();
  const back=renderHook(()=>useExhibitionGallery("one","guest"),{wrapper});
  expect(back.result.current.loading).toBe(false);
  expect(back.result.current.submissions).toEqual([first]);
  expect(getSubmissions).toHaveBeenCalledOnce();
});

it("keeps existing cards and pagination during live refresh and refreshes every loaded page", async()=>{
  vi.mocked(getSubmissions).mockImplementation(async(_id,_scope,cursor)=>cursor===20?{items:[second],next_cursor:null}:{items:[first],next_cursor:20});
  const {wrapper}=setup();
  const hook=renderHook(()=>useExhibitionGallery("one","guest"),{wrapper});
  await waitFor(()=>expect(hook.result.current.loading).toBe(false));
  await act(async()=>{await hook.result.current.works.fetchNextPage();});
  await waitFor(()=>expect(hook.result.current.submissions).toEqual([first,second]));
  const pending=deferred<Page<Submission>>();
  vi.mocked(getSubmissions).mockImplementationOnce(()=>pending.promise);
  act(()=>window.dispatchEvent(new CustomEvent("inkfig:exhibitions-changed",{detail:{exhibition_id:"one"}})));
  await waitFor(()=>expect(hook.result.current.works.isRefetching).toBe(true));
  expect(hook.result.current.loading).toBe(false);
  expect(hook.result.current.submissions).toEqual([first,second]);
  await act(async()=>pending.resolve({items:[{...first,title:"Updated"}],next_cursor:20}));
  await waitFor(()=>expect(hook.result.current.works.isRefetching).toBe(false));
  expect(hook.result.current.submissions.map(item=>item.title)).toEqual(["Updated","Second"]);
  expect(getSubmissions).toHaveBeenLastCalledWith("one","public",20);
});

it("retains cards on refresh failure and isolates exhibition/viewer caches and delayed responses",async()=>{
  const {wrapper}=setup();
  const hook=renderHook(({id,viewer})=>useExhibitionGallery(id,viewer),{wrapper,initialProps:{id:"one",viewer:"a"}});
  await waitFor(()=>expect(hook.result.current.loading).toBe(false));
  vi.mocked(getSubmissions).mockRejectedValueOnce(new Error("Offline"));
  await act(async()=>{await hook.result.current.works.refetch();});
  expect(hook.result.current.submissions).toEqual([first]);
  await waitFor(()=>expect(hook.result.current.error?.message).toBe("Offline"));
  const pending=deferred<Exhibition>();
  vi.mocked(getExhibition).mockReturnValueOnce(pending.promise);
  hook.rerender({id:"two",viewer:"a"});
  expect(hook.result.current.submissions).toEqual([]);
  hook.rerender({id:"three",viewer:"b"});
  await waitFor(()=>expect(hook.result.current.loading).toBe(false));
  await act(async()=>pending.resolve({...event,exhibition_id:"two"}));
  expect(hook.result.current.selected?.exhibition_id).not.toBe("two");
  expect(getExhibition).toHaveBeenCalledWith("three");
});

it("never loads public submissions for upcoming exhibitions",async()=>{
  vi.mocked(getExhibition).mockResolvedValue({...event,event_at:"2090-01-01T00:00:00Z",event_ends_at:"2090-01-02T00:00:00Z"});
  const {wrapper}=setup();const hook=renderHook(()=>useExhibitionGallery("one","guest"),{wrapper});
  await waitFor(()=>expect(hook.result.current.loading).toBe(false));
  expect(getSubmissions).not.toHaveBeenCalled();
});

it("updates only at start/end boundaries, including timer cleanup",()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date("2026-10-20T12:00:00Z"));
  const render=vi.fn();
  const hook=renderHook(()=>{render();return useExhibitionClock("2026-10-20T12:01:00Z","2026-10-20T12:02:00Z");});
  render.mockClear();
  act(()=>vi.advanceTimersByTime(59_000));expect(render).not.toHaveBeenCalled();
  act(()=>vi.advanceTimersByTime(1000));expect(hook.result.current).toBe(Date.parse("2026-10-20T12:01:00Z"));
  act(()=>vi.advanceTimersByTime(60_000));expect(hook.result.current).toBe(Date.parse("2026-10-20T12:02:00Z"));
  hook.unmount();expect(vi.getTimerCount()).toBe(0);
});
