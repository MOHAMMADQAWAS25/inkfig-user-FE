import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../src/features/auth/AuthContext";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { SiteFooter } from "../src/features/layout/SiteFooter";
import { logoutUser } from "../src/features/auth/authenticationApi";

vi.mock("../src/features/auth/authenticationApi",()=>({logoutUser:vi.fn().mockResolvedValue(undefined)}));
afterEach(()=>{cleanup();localStorage.clear();vi.clearAllMocks();});
function LogoutProbe(){const {signOut,session}=useAuth();const location=useLocation();return <><button onClick={signOut}>Logout</button><output>{location.pathname}:{session?"signed-in":"signed-out"}</output></>;}
it.each(["en","ar"])("logout clears account/cache and routes to %s sign-in",language=>{
  localStorage.setItem("inkfig.auth-session",JSON.stringify({userId:"viewer",email:"viewer@example.com",fullName:"Viewer",role:"student",permissions:[]}));
  const client=new QueryClient();client.setQueryData(["private"],"data");
  render(<MemoryRouter initialEntries={[`/${language}/profile`]}><QueryClientProvider client={client}><I18nProvider><AuthProvider><LogoutProbe/></AuthProvider></I18nProvider></QueryClientProvider></MemoryRouter>);
  fireEvent.click(screen.getByRole("button",{name:"Logout"}));
  expect(screen.getByText(`/${language}/login:signed-out`)).toBeTruthy();expect(localStorage.getItem("inkfig.auth-session")).toBeNull();
  expect(client.getQueryData(["private"])).toBeUndefined();expect(logoutUser).toHaveBeenCalledTimes(1);
});
it.each([["/en"," site-footer-app"],["/en/profile"," site-footer-app"],["/ar/upload"," site-footer-app"],["/en/login",""]])("shows shared footer with correct navigation clearance on %s",(route,suffix)=>{
  const {container}=render(<MemoryRouter initialEntries={[route]}><I18nProvider><SiteFooter/></I18nProvider></MemoryRouter>);
  expect(container.querySelector("footer")?.className).toBe(`site-footer${suffix}`);expect(screen.getByRole("img",{name:"InkFig"})).toBeTruthy();
});
