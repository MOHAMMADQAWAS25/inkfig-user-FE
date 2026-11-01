import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { translations } from "../src/i18n/resources";
import { ExhibitionsPage } from "../src/features/exhibitions/ExhibitionsPage";
import { getWork, setWorkLike, setWorkSave, type FeedWork } from "../src/features/works/worksApi";
import { ApiError } from "../src/api/httpClient";

const auth=vi.hoisted(()=>({permissions:["works.like","works.save","reports.create"] as string[]}));
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"viewer",role:"user",permissions:auth.permissions}})}));
vi.mock("../src/features/navigation/AppSidebar",()=>({AppSidebar:()=>null}));
vi.mock("../src/features/exhibitions/useExhibitionCounts",()=>({useExhibitionCounts:()=>undefined}));
vi.mock("../src/features/exhibitions/useExhibitionLive",()=>({useExhibitionLive:()=>undefined}));
vi.mock("../src/features/works/worksApi",()=>({getWork:vi.fn(),setWorkLike:vi.fn(),setWorkSave:vi.fn()}));
vi.mock("../src/features/exhibitions/exhibitionApi",()=>({
  getExhibition:vi.fn().mockResolvedValue({exhibition_id:"event",name:"Student show",creator_user_id:"organizer",description:"Exhibition",event_at:"2020-01-01T00:00:00Z",event_ends_at:"2040-01-01T00:00:00Z",participation_opens_at:"2019-01-01T00:00:00Z",participation_closes_at:"2019-12-01T00:00:00Z",participation_open:false,created_at:"2019-01-01T00:00:00Z",banner_url:null}),
  getSubmissions:vi.fn().mockResolvedValue({items:[{submission_id:"entry",work_id:"art",user_id:"artist",artist_name:"Artist",title:"Painting",description:"Card description",image_url:"/art.png",status:"approved",rejection_reason:null,created_at:"2026-10-01T00:00:00Z",rating:{average:4.5,vote_count:2,my_rating:null,can_rate:true}}],next_cursor:20}),
  getEligibleExhibitions:vi.fn().mockResolvedValue({items:[],next_cursor:null}),listExhibitions:vi.fn(),saveExhibition:vi.fn(),uploadBanner:vi.fn(),
}));
const work:FeedWork={work_id:"art",owner_user_id:"artist",artist_name:"Artist",title:"Full painting",description:"Full fetched description",type_id:"art",type_name_en:"Digital Art",type_name_ar:"فن رقمي",image_url:"/full.png",mime_type:"image/png",links:[],created_at:"2026-10-01T00:00:00Z",like_count:0,liked_by_me:false,saved_by_me:false,exhibitions:[{exhibition_id:"event",name:"Student show",year:2026,rating:{average:4.5,vote_count:2}}]};
const clients:QueryClient[]=[];
function Probe(){const location=useLocation();return <output data-testid="route">{location.pathname}</output>;}
function mount(language="en"){
  const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});clients.push(client);
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[`/${language}/exhibition/event`]}><Routes><Route path="/:language/exhibition/:exhibitionId" element={<I18nProvider><ExhibitionsPage/><Probe/></I18nProvider>}/></Routes></MemoryRouter></QueryClientProvider>);
}
beforeEach(()=>{
  vi.clearAllMocks();auth.permissions=["works.like","works.save","reports.create"];
  vi.mocked(getWork).mockResolvedValue(work);vi.mocked(setWorkLike).mockResolvedValue(undefined);vi.mocked(setWorkSave).mockResolvedValue(undefined);
  vi.stubGlobal("matchMedia",vi.fn((query:string)=>({matches:query.includes("prefers-reduced-motion"),addEventListener:vi.fn(),removeEventListener:vi.fn()})));
  vi.spyOn(window,"scrollTo").mockImplementation(()=>undefined);
  Object.defineProperty(HTMLDialogElement.prototype,"showModal",{configurable:true,value:vi.fn(function(this:HTMLDialogElement){this.setAttribute("open","");})});
  Object.defineProperty(HTMLDialogElement.prototype,"close",{configurable:true,value:vi.fn(function(this:HTMLDialogElement){this.removeAttribute("open");})});
});
afterEach(()=>{cleanup();clients.forEach(client=>client.clear());clients.length=0;vi.restoreAllMocks();vi.unstubAllGlobals();});

it("opens fetched details in one native popup without navigation and preserves gallery voting/pages",async()=>{
  mount();const open=await screen.findByRole("button",{name:"View artwork details: Painting"});open.focus();
  fireEvent.click(open);
  const dialog=await screen.findByRole("dialog",{name:"Full painting"});
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(dialog.parentElement).toBe(document.body);
  expect(screen.getByTestId("route").textContent).toBe("/en/exhibition/event");
  expect(within(dialog).getByText("Full fetched description")).toBeTruthy();
  expect(within(dialog).getByText("4.5 / 5 · 2 votes")).toBeTruthy();
  expect(within(dialog).queryByRole("radio")).toBeNull();
  expect(document.body.style.position).toBe("fixed");
  const image=within(dialog).getByRole("img",{name:"Full painting"});
  expect(image.getAttribute("draggable")).toBe("false");
  const menu=new MouseEvent("contextmenu",{bubbles:true,cancelable:true});fireEvent(image,menu);expect(menu.defaultPrevented).toBe(true);
  fireEvent.click(within(dialog).getByRole("button",{name:"Close artwork details"}));
  await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(open);expect(document.body.style.position).not.toBe("fixed");
  expect(screen.getAllByRole("radio")).toHaveLength(5);
  expect(screen.getByRole("button",{name:"Load more"})).toBeTruthy();
});

it("Escape closes during loading, cancels the old request and never displays its late result",async()=>{
  let finish!:(value:FeedWork)=>void;
  vi.mocked(getWork).mockReturnValueOnce(new Promise(resolve=>{finish=resolve;}));
  mount();fireEvent.click(await screen.findByRole("button",{name:"View artwork details: Painting"}));
  const dialog=await screen.findByRole("dialog");
  expect(within(dialog).getByRole("status")).toBeTruthy();
  const signal=vi.mocked(getWork).mock.calls[0][1];
  fireEvent(dialog,new Event("cancel",{cancelable:true}));
  await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
  expect(signal?.aborted).toBe(true);
  await act(async()=>finish(work));expect(screen.queryByRole("dialog")).toBeNull();
});

it("keeps failures in the popup and supports retry and outside dismissal",async()=>{
  vi.mocked(getWork).mockRejectedValueOnce(new ApiError(503,"Unavailable")).mockResolvedValue(work);
  mount();fireEvent.click(await screen.findByRole("button",{name:"View artwork details: Painting"}));
  let dialog=await screen.findByRole("dialog");await within(dialog).findByRole("alert");
  expect(screen.getByTestId("route").textContent).toBe("/en/exhibition/event");
  fireEvent.click(within(dialog).getByRole("button",{name:"Retry"}));
  dialog=await screen.findByRole("dialog",{name:"Full painting"});
  fireEvent.mouseDown(dialog.querySelector(".artwork-modal-backdrop")!);
  await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
});

it("preserves permission-gated like/save actions and refetches confirmed work data",async()=>{
  vi.mocked(getWork).mockResolvedValueOnce(work).mockResolvedValueOnce({...work,liked_by_me:true,like_count:1}).mockResolvedValue({...work,liked_by_me:true,like_count:1,saved_by_me:true});
  mount();fireEvent.click(await screen.findByRole("button",{name:"View artwork details: Painting"}));
  const dialog=await screen.findByRole("dialog",{name:"Full painting"});
  fireEvent.click(within(dialog).getByRole("button",{name:"0 likes"}));
  await within(dialog).findByRole("button",{name:"1 likes"});
  expect(setWorkLike).toHaveBeenCalledWith("art",true);
  fireEvent.click(within(dialog).getByRole("button",{name:"Save"}));
  await waitFor(()=>expect(setWorkSave).toHaveBeenCalledWith("art",true));
  await waitFor(()=>expect(getWork).toHaveBeenCalledTimes(3));
});

it("opens the popup from non-interactive card content but not from rating stars",async()=>{
  mount();fireEvent.click(await screen.findByRole("radio",{name:"4 out of 5 stars"}));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByText("Card description"));
  expect(await screen.findByRole("dialog",{name:"Full painting"})).toBeTruthy();
});

it("supports Arabic popup content and Escape dismissal",async()=>{
  auth.permissions=[];mount("ar");
  fireEvent.click(await screen.findByRole("button",{name:`${translations.ar["works.viewDetails"]}: Painting`}));
  const dialog=await screen.findByRole("dialog",{name:"Full painting"});
  expect(within(dialog).getByText("فن رقمي")).toBeTruthy();
  expect(within(dialog).queryByRole("button",{name:translations.ar["home.saveWork"]})).toBeNull();
  expect(within(dialog).getByRole<HTMLButtonElement>("button",{name:/0/}).disabled).toBe(true);
  fireEvent(dialog,new Event("cancel",{cancelable:true}));
  await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
});
