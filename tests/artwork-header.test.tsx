import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { ArtworkHeader } from "../src/features/works/ArtworkHeader";
import { ThemeProvider } from "../src/theme/ThemeProvider";
const signOut=vi.hoisted(()=>vi.fn());
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"viewer",fullName:"Viewer",email:"viewer@example.com"},signOut})}));
vi.mock("../src/features/profile/profileApi",()=>({getPublicProfile:async()=>({avatar_url:"/viewer.png"}),searchProfiles:async()=>[{user_id:"artist",full_name:"Artist Name",avatar_url:null}]}));
afterEach(cleanup);
function mount(){function Path(){const location=useLocation();return <output data-testid="path">{location.pathname}{location.search}</output>;}return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter initialEntries={["/en/artwork/art"]}><ThemeProvider><I18nProvider><ArtworkHeader/><Path/></I18nProvider></ThemeProvider></MemoryRouter></QueryClientProvider>);}
it("keeps the profile avatar available and sends artwork searches to existing home results",async()=>{
  mount();const profile=document.querySelector(".artwork-header-menu summary")!;expect(profile.closest("details")).toBeTruthy();
  await waitFor(()=>expect(profile.querySelector("img")?.getAttribute("src")).toBe("/viewer.png"));
  fireEvent.click(document.querySelector(".gallery-search > svg")!);expect(document.activeElement).toBe(screen.getByRole("searchbox"));
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"olive painting"}});
  fireEvent.submit(screen.getByRole("search"));
  expect(screen.getByTestId("path").textContent).toBe("/en?q=olive+painting");
});
it("opens home-style profile preferences and logout rather than navigating immediately",async()=>{
  mount();const summary=document.querySelector<HTMLElement>(".artwork-header-menu summary")!;fireEvent.click(summary);
  const profile=await screen.findByRole("link",{name:/Viewer/});expect(profile.getAttribute("href")).toBe("/en/profile");
  expect(screen.getByText("viewer@example.com")).toBeTruthy();expect(document.querySelectorAll(".gallery-profile-preferences button")).toHaveLength(2);
  expect(screen.getByTestId("path").textContent).toBe("/en/artwork/art");
  fireEvent.click(screen.getByRole("button",{name:/log out/i}));expect(signOut).toHaveBeenCalledOnce();
});
it("selecting an @ account preserves the existing artist-scoped search contract",async()=>{
  mount();const input=screen.getByRole("searchbox");fireEvent.focus(input);fireEvent.change(input,{target:{value:"@Artist"}});
  fireEvent.click(await screen.findByRole("button",{name:"Artist Name"}));
  const route=screen.getByTestId("path").textContent!;expect(route).toContain("artist=artist");expect(route).toContain("artistName=Artist+Name");expect(route).toContain("q=%40Artist+Name");
});
