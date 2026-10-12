import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { translations } from "../src/i18n/resources";
import { relativeTime } from "../src/lib/relativeTime";
import { AppSidebar } from "../src/features/navigation/AppSidebar";
import { UploadWorkPage } from "../src/features/works/UploadWorkPage";
import { HomePage } from "../src/features/home/HomePage";
import { PostCard } from "../src/features/feed/PostCard";
import { ArtworkDetailModal } from "../src/features/home/ArtworkDetailModal";
import type { Work } from "../src/features/works/worksApi";
import { getWorkTypes, type FeedWork } from "../src/features/works/worksApi";
import { useInfiniteFeed } from "../src/features/feed/useInfiniteFeed";
import { requestJson } from "../src/api/httpClient";
vi.mock("../src/api/httpClient",()=>({userApiBaseUrl:"api",requestJson:vi.fn()}));

vi.mock("../src/i18n/I18nProvider",()=>({useI18n:()=>({language:"en",t:(key:keyof typeof translations.en)=>translations.en[key]})}));
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"viewer",role:"student",permissions:["works.upload","works.like","works.save"],fullName:"Viewer",email:"viewer@example.com"},signOut:vi.fn()})}));
vi.mock("../src/features/notifications/notificationApi",()=>({getNotifications:vi.fn().mockResolvedValue({items:[],unread_count:0,next_cursor:null}),getWebSocketTicket:vi.fn().mockRejectedValue(new Error("offline")),markNotificationsRead:vi.fn()}));
vi.mock("../src/features/profile/profileApi",()=>({getPublicProfile:vi.fn().mockResolvedValue({avatar_url:null}),searchProfiles:vi.fn().mockResolvedValue([]),searchProfilesPage:vi.fn().mockResolvedValue({items:[],next_cursor:null})}));
vi.mock("../src/features/works/worksApi",()=>({getWorkTypes:vi.fn(),getWork:vi.fn(),uploadWork:vi.fn(),setWorkLike:vi.fn(),setWorkSave:vi.fn(),deleteWorkAsModerator:vi.fn(),isValidWorkUrl:()=>true,validateWorkFile:(file:File)=>file.type.startsWith("image/")?null:"unsupported"}));
vi.mock("../src/features/feed/useInfiniteFeed",()=>({useInfiniteFeed:vi.fn()}));
vi.mock("../src/features/feed/Feed",()=>({Feed:()=>null}));
vi.mock("../src/features/feed/LazyImage",()=>({LazyImage:()=> <img alt="Artwork"/>}));
vi.mock("../src/i18n/LanguageToggle",()=>({LanguageToggle:()=>null}));
vi.mock("../src/theme/ThemeToggle",()=>({ThemeToggle:()=>null}));

beforeEach(()=>{
  vi.clearAllMocks();
  vi.spyOn(window,"scrollTo").mockImplementation(()=>undefined);
  vi.stubGlobal("URL",Object.assign(URL,{createObjectURL:vi.fn().mockReturnValue("blob:preview"),revokeObjectURL:vi.fn()}));
  vi.mocked(getWorkTypes).mockResolvedValue([{type_id:"art",code:"digital-art",name_en:"Digital art",name_ar:"فن رقمي"}]);
  vi.mocked(useInfiniteFeed).mockReturnValue({items:[],setItems:vi.fn(),cacheKey:"test",loading:false,loadingMore:false,error:null,hasNextPage:false,loadMore:vi.fn(),retry:vi.fn()} as unknown as ReturnType<typeof useInfiniteFeed>);
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
function RouteProbe(){const location=useLocation();return <output data-testid="route">{location.pathname}</output>;}

describe("home and panel interactions",()=>{
  it("shows exact history only while typing and executes a selected search once",async()=>{
    const items=["Anime Art","Flowers","Sketch","Painting","Older"].map(query=>({query,normalized_query:query.toLowerCase(),search_history_id:query,last_searched_at:new Date().toISOString()}));
    vi.mocked(requestJson).mockResolvedValue({data:items,status:200});
    render(<MemoryRouter><HomePage/><RouteProbe/></MemoryRouter>);
    const input=screen.getByRole("combobox");fireEvent.focus(input);
    await screen.findByRole("option",{name:"Anime Art"});
    expect(screen.getAllByRole("option")).toHaveLength(4);
    fireEvent.change(input,{target:{value:"Anime"}});
    expect(screen.queryByRole("option",{name:"Anime Art"})).toBeNull();
    fireEvent.change(input,{target:{value:" ANIME ART "}});
    expect(screen.getAllByRole("option")).toHaveLength(1);
    fireEvent.click(screen.getByRole("option",{name:"Anime Art"}));
    await waitFor(()=>expect(vi.mocked(requestJson).mock.calls.filter(call=>call[1]==="POST")).toHaveLength(1));
    expect((input as HTMLInputElement).value).toBe("Anime Art");
  });
  it("does not record focus, typing or remove-button clicks",async()=>{
    const item={query:"Anime Art",normalized_query:"anime art",search_history_id:"entry",last_searched_at:new Date().toISOString()};
    vi.mocked(requestJson).mockResolvedValue({data:[item],status:200});
    render(<MemoryRouter><HomePage/></MemoryRouter>);
    const input=screen.getByRole("combobox");fireEvent.focus(input);
    await screen.findByRole("option",{name:"Anime Art"});
    fireEvent.click(screen.getByRole("button",{name:"Remove search: Anime Art"}));
    expect(screen.queryByRole("option",{name:"Anime Art"})).toBeNull();
    await waitFor(()=>expect(vi.mocked(requestJson).mock.calls.some(call=>call[1]==="DELETE")).toBe(true));
    expect(vi.mocked(requestJson).mock.calls.some(call=>call[1]==="POST")).toBe(false);
    fireEvent.keyDown(input,{key:"Escape"});
    expect(screen.queryByRole("region",{name:"Recent Searches"})).toBeNull();
  });
  it.each(["Notifications","Find users"])("closes %s outside and keeps inside interaction open",async name=>{
    const {container}=render(<MemoryRouter><AppSidebar/><button>Outside control</button></MemoryRouter>);
    const trigger=screen.getByRole("button",{name,exact:true});
    fireEvent.click(trigger);
    const panel=container.querySelector(".account-discovery-panel")!;
    fireEvent.pointerDown(panel);
    expect(panel.classList.contains("sidebar-panel-exit")).toBe(false);
    fireEvent.pointerDown(trigger);
    expect(panel.classList.contains("sidebar-panel-exit")).toBe(false);
    fireEvent.pointerDown(screen.getByRole("button",{name:"Outside control"}));
    expect(panel.classList.contains("sidebar-panel-exit")).toBe(true);
    await waitFor(()=>expect(container.querySelector(".account-discovery-panel")).toBeNull());
  });
  it.each(["Home","InkFig"])("clears search, artist and category when clicking %s",async name=>{
    render(<MemoryRouter initialEntries={["/en?q=flowers&category=hand-art&artist=artist&artistName=Artist"]}><HomePage/></MemoryRouter>);
    await waitFor(()=>expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("flowers"));
    fireEvent.click(screen.getByRole("link",{name,exact:true}));
    await waitFor(()=>expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe(""));
    expect(vi.mocked(useInfiniteFeed).mock.lastCall?.[0]).toMatchObject({category:undefined,search:undefined,ownerId:undefined});
  });
  it.each(["Notifications","Find users"])("retains %s during its closing animation",async name=>{
    const {container}=render(<MemoryRouter><AppSidebar/></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name,exact:true}));
    expect(container.querySelector(".account-discovery-panel")).toBeTruthy();
    fireEvent.click(screen.getByRole("button",{name,exact:true}));
    expect(container.querySelector(".account-discovery-panel.sidebar-panel-exit")).toBeTruthy();
    await waitFor(()=>expect(container.querySelector(".account-discovery-panel")).toBeNull());
  });
  it("keeps a reopened panel open when an earlier close timer completes",async()=>{
    const {container}=render(<MemoryRouter><AppSidebar/></MemoryRouter>);
    const button=screen.getByRole("button",{name:"Notifications",exact:true});
    fireEvent.click(button);fireEvent.click(button);fireEvent.click(button);
    await new Promise(resolve=>setTimeout(resolve,320));
    expect(container.querySelector(".notifications-panel")).toBeTruthy();
    expect(container.querySelector(".sidebar-panel-exit")).toBeNull();
  });
  it("waits for slider closing before navigating",async()=>{
    const {container}=render(<MemoryRouter initialEntries={["/en"]}><AppSidebar/><RouteProbe/></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:"Find users",exact:true}));
    fireEvent.click(screen.getByRole("link",{name:"Upload",exact:true}));
    expect(screen.getByTestId("route").textContent).toBe("/en");
    expect(container.querySelector(".sidebar-panel-exit")).toBeTruthy();
    await waitFor(()=>expect(screen.getByTestId("route").textContent).toBe("/en/upload"));
  });
  it("does not cancel the closing timer when Escape is pressed twice",async()=>{
    const {container}=render(<MemoryRouter><AppSidebar/></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:"Find users",exact:true}));
    fireEvent.keyDown(window,{key:"Escape"});fireEvent.keyDown(window,{key:"Escape"});
    await waitFor(()=>expect(container.querySelector(".account-discovery-panel")).toBeNull());
  });
});

describe("upload preview and card reset",()=>{
  it("previews an image and revokes its object URL on unmount",async()=>{
    const view=render(<MemoryRouter><UploadWorkPage/></MemoryRouter>);
    const input=await screen.findByLabelText("Artwork image");
    fireEvent.change(input,{target:{files:[new File(["image"],"art.png",{type:"image/png"})]}});
    expect(await screen.findByRole("img",{name:"art.png"})).toBeTruthy();
    expect(screen.queryByRole("link",{name:/Back to home/i})).toBeNull();
    view.unmount();expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
  it("previews video locally and explains the existing image-only publishing contract",async()=>{
    const {container}=render(<MemoryRouter><UploadWorkPage/></MemoryRouter>);
    fireEvent.change(await screen.findByLabelText("Artwork image"),{target:{files:[new File(["video"],"art.mp4",{type:"video/mp4"})]}});
    await waitFor(()=>expect(container.querySelector("video")?.getAttribute("src")).toBe("blob:preview"));
    expect(screen.getByText(translations.en["works.videoPreviewOnly"])).toBeTruthy();
    expect((container.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
  });
  it("suppresses a card's overlay until the pointer moves again or a keyboard action",()=>{
    const work={work_id:"work",title:"Art",artist_name:"Artist",owner_user_id:"artist",type_name_en:"Digital art",type_name_ar:"فن",mime_type:"image/png",image_url:"/art.png",like_count:0,liked_by_me:false,saved_by_me:false} as FeedWork;
    const onOpen=vi.fn();const {container}=render(<MemoryRouter><PostCard work={work} width={200} priority={false} onOpen={onOpen} onLike={vi.fn()} onSave={vi.fn()}/></MemoryRouter>);
    fireEvent.click(container.querySelector(".artwork-image-button")!);
    expect(onOpen).toHaveBeenCalledWith(work);
    expect(container.querySelector(".hover-reset")).toBeTruthy();
    fireEvent.pointerEnter(container.querySelector(".artwork-pin-media")!);
    expect(container.querySelector(".hover-reset")).toBeTruthy();
    fireEvent.pointerMove(container.querySelector(".artwork-pin-media")!);
    expect(container.querySelector(".hover-reset")).toBeNull();
  });
});

describe("smooth artwork dismissal",()=>{
  const work={work_id:"work",title:"Art",artist_name:"Artist",owner_user_id:"artist",type_name_en:"Digital art",type_name_ar:"Art",mime_type:"image/png",image_url:"/art.png",like_count:0,liked_by_me:false,saved_by_me:false,created_at:"2026-10-11T12:00:00Z",links:[]} as Work;
  function modal(onClose:()=>void){return <MemoryRouter><ArtworkDetailModal language="en" work={work} canLike={false} canSave={false} onClose={onClose} onToggleLike={vi.fn()} onToggleSave={vi.fn()} t={key=>translations.en[key]}/></MemoryRouter>;}
  it.each(["button","backdrop","Escape"])("animates before dismissing via %s",async trigger=>{
    const onClose=vi.fn();const {container}=render(modal(onClose));
    if(trigger==="button")fireEvent.click(screen.getByRole("button",{name:translations.en["works.closeDetails"]}));
    else if(trigger==="backdrop")fireEvent.mouseDown(container.querySelector(".artwork-modal-backdrop")!);
    else fireEvent.keyDown(document,{key:"Escape"});
    expect(container.querySelector(".artwork-modal-closing")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document,{key:"Escape"});
    await waitFor(()=>expect(onClose).toHaveBeenCalledTimes(1));
  });
  it("cancels pending dismissal on unmount",async()=>{
    const onClose=vi.fn();const view=render(modal(onClose));
    fireEvent.keyDown(document,{key:"Escape"});view.unmount();
    await new Promise(resolve=>setTimeout(resolve,280));
    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("does not wait for animation when reduced motion is preferred",async()=>{
    vi.stubGlobal("matchMedia",vi.fn().mockReturnValue({matches:true}));
    const onClose=vi.fn();render(modal(onClose));
    fireEvent.keyDown(document,{key:"Escape"});
    await waitFor(()=>expect(onClose).toHaveBeenCalledTimes(1),{timeout:100});
  });
});

describe("relative publication dates",()=>{
  const now=Date.parse("2026-10-11T12:00:00Z");
  it.each([[1,"1 second ago"],[7200,"2 hours ago"],[4*2592000,"4 months ago"]])("formats %s seconds in English",(seconds,label)=>{
    expect(relativeTime(new Date(now-Number(seconds)*1000).toISOString(),"en",now)).toBe(label);
  });
  it("localizes Arabic dates and tolerates invalid timestamps",()=>{
    expect(relativeTime(new Date(now-7200000).toISOString(),"ar",now)).toBe(new Intl.RelativeTimeFormat("ar",{numeric:"always"}).format(-2,"hour"));
    expect(relativeTime("invalid","en",now)).toBe("");
  });
});
