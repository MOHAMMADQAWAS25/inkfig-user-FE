import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { ArtworkHeader } from "../src/features/works/ArtworkHeader";
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"viewer",fullName:"Viewer"}})}));
vi.mock("../src/features/profile/profileApi",()=>({getPublicProfile:async()=>({avatar_url:"/viewer.png"}),searchProfiles:async()=>[{user_id:"artist",full_name:"Artist Name",avatar_url:null}]}));
afterEach(cleanup);
function mount(){function Path(){const location=useLocation();return <output data-testid="path">{location.pathname}{location.search}</output>;}return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter initialEntries={["/en/artwork/art"]}><I18nProvider><ArtworkHeader/><Path/></I18nProvider></MemoryRouter></QueryClientProvider>);}
it("keeps the profile avatar available and sends artwork searches to existing home results",async()=>{
  mount();const profile=screen.getByRole("link");expect(profile.getAttribute("href")).toBe("/en/profile");
  await waitFor(()=>expect(profile.querySelector("img")?.getAttribute("src")).toBe("/viewer.png"));
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"olive painting"}});
  fireEvent.submit(screen.getByRole("search"));
  expect(screen.getByTestId("path").textContent).toBe("/en?q=olive+painting");
});
it("selecting an @ account preserves the existing artist-scoped search contract",async()=>{
  mount();const input=screen.getByRole("searchbox");fireEvent.focus(input);fireEvent.change(input,{target:{value:"@Artist"}});
  fireEvent.click(await screen.findByRole("button",{name:"Artist Name"}));
  const route=screen.getByTestId("path").textContent!;expect(route).toContain("artist=artist");expect(route).toContain("artistName=Artist+Name");expect(route).toContain("q=%40Artist+Name");
});
