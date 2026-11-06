import React, { useEffect } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate, useParams } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AppRouter } from "../src/app/AppRouter";
import { artworkNavigationState, mobileArtworkBackground } from "../src/features/works/artworkNavigation";
import { useRouteActivity } from "../src/app/RouteActivity";

const state=vi.hoisted(()=>({mounts:0,unmounts:0}));
vi.mock("../src/seo/PageMetadata",()=>({PageMetadata:()=>null}));
vi.mock("../src/features/layout/SiteFooter",()=>({SiteFooter:()=>null}));
function Gallery(){
  const location=useLocation(),navigate=useNavigate(),active=useRouteActivity();
  useEffect(()=>{state.mounts++;return()=>{state.unmounts++;};},[]);
  return <main data-testid="gallery" data-active={String(active)}><button onClick={()=>navigate("/en/artwork/one",{state:artworkNavigationState(location)})}>Open artwork</button></main>;
}
vi.mock("../src/features/home/HomePage",()=>({HomePage:()=> <Gallery/>}));
vi.mock("../src/features/profile/ProfilePage",()=>({ProfilePage:()=> <Gallery/>}));
vi.mock("../src/features/works/ArtworkPage",()=>({ArtworkPage:()=>{
  const navigate=useNavigate(),location=useLocation(),{workId}=useParams();
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});},[workId]);
  return <main><h1>{workId}</h1><button onClick={()=>navigate(-1)}>Artwork back</button><button onClick={()=>navigate("/en/artwork/two",{state:artworkNavigationState(location)})}>Related</button></main>;
}}));
beforeEach(()=>{
  state.mounts=0;state.unmounts=0;
  vi.stubGlobal("scrollY",420);
  vi.stubGlobal("matchMedia",()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  vi.spyOn(window,"scrollTo").mockImplementation(options=>{if(typeof options==="object")vi.stubGlobal("scrollY",options.top??0);});
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
function BrowserBack(){const navigate=useNavigate();return <button onClick={()=>navigate(-1)}>History back</button>;}
it.each(["/en","/en/profile","/en/profile/other"])("retains %s and restores its scroll for browser Back and in-app Back",async path=>{
  render(<MemoryRouter initialEntries={[path]}><AppRouter/><BrowserBack/></MemoryRouter>);
  const gallery=screen.getByTestId("gallery");
  fireEvent.click(screen.getByRole("button",{name:"Open artwork"}));
  expect(screen.getByRole("heading",{name:"one"})).toBeTruthy();
  expect(screen.getByTestId("gallery")).toBe(gallery);
  expect(gallery.closest("[inert]")).toBeTruthy();
  expect(gallery.getAttribute("data-active")).toBe("false");
  fireEvent.click(screen.getByRole("button",{name:"History back"}));
  await waitFor(()=>expect(gallery.getAttribute("data-active")).toBe("true"));
  expect(window.scrollY).toBe(420);
  expect(state.mounts).toBe(1);expect(state.unmounts).toBe(0);
  fireEvent.click(screen.getByRole("button",{name:"Open artwork"}));
  fireEvent.click(screen.getByRole("button",{name:"Artwork back"}));
  await waitFor(()=>expect(screen.queryByRole("heading",{name:"one"})).toBeNull());
  expect(screen.getByTestId("gallery")).toBe(gallery);
  expect(state.mounts).toBe(1);expect(window.scrollY).toBe(420);
});
it("keeps a single bounded gallery background through related artwork history",async()=>{
  render(<MemoryRouter initialEntries={["/en"]}><AppRouter/></MemoryRouter>);
  fireEvent.click(screen.getByRole("button",{name:"Open artwork"}));
  fireEvent.click(screen.getByRole("button",{name:"Related"}));
  expect(screen.getByRole("heading",{name:"two"})).toBeTruthy();
  expect(screen.getAllByTestId("gallery")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button",{name:"Artwork back"}));
  await waitFor(()=>expect(screen.getByRole("heading",{name:"one"})).toBeTruthy());
  fireEvent.click(screen.getByRole("button",{name:"Artwork back"}));
  await waitFor(()=>expect(screen.queryByRole("heading")).toBeNull());
  expect(state.mounts).toBe(1);expect(window.scrollY).toBe(420);
});
it("does not introduce retained backgrounds on desktop",()=>{
  vi.stubGlobal("matchMedia",()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  render(<MemoryRouter initialEntries={["/en"]}><AppRouter/></MemoryRouter>);
  fireEvent.click(screen.getByRole("button",{name:"Open artwork"}));
  expect(screen.queryByTestId("gallery")).toBeNull();expect(state.unmounts).toBe(1);
});
it("rejects invalid or external background routes and invalid scroll offsets",()=>{
  for(const pathname of ["https://example.com","//example.com/en","/en/login","/en/artwork/x","/en/profile/x/extra"]){
    expect(mobileArtworkBackground({artworkBackground:{location:{pathname},scrollY:0}})).toBeNull();
  }
  expect(mobileArtworkBackground({artworkBackground:{location:{pathname:"/en"},scrollY:-1}})).toBeNull();
});
