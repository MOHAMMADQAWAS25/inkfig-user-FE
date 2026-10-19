import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MobileNavigation } from "../src/features/navigation/MobileNavigation";
import { useProfileSwipe } from "../src/features/profile/useProfileSwipe";
import { useScrollHeader } from "../src/features/home/useScrollHeader";
import { ProfilePager } from "../src/features/profile/ProfilePager";
import { translations } from "../src/i18n/resources";

const state = vi.hoisted(() => ({ language: "en", signOut: vi.fn(), setLanguage: vi.fn() }));
vi.mock("../src/i18n/I18nProvider", () => ({ useI18n: () => ({ language: state.language, setLanguage: state.setLanguage, t: (key: keyof typeof translations.en) => translations.en[key] }) }));
vi.mock("../src/features/auth/AuthContext", () => ({ useAuth: () => ({ session: { userId: "me", fullName: "Viewer" }, signOut: state.signOut }) }));
vi.mock("../src/features/profile/profileApi", () => ({ getPublicProfile: vi.fn().mockResolvedValue({ avatar_url: "/avatar.png" }) }));
vi.mock("../src/theme/ThemeToggle", () => ({ ThemeToggle: () => <button aria-label="Theme"><svg /></button> }));
vi.mock("../src/i18n/LanguageToggle", () => ({ LanguageToggle: () => <button className="language-toggle" aria-label="Language" onClick={() => state.setLanguage("immediate")}><svg /></button> }));
beforeEach(() => {
  vi.useFakeTimers(); state.language = "en"; vi.clearAllMocks();
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({ matches: query.includes("max-width"), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it("shows the exhibition request counter on its mobile drawer icon",()=>{
  render(<MemoryRouter initialEntries={["/en"]}><MobileNavigation unreadCount={0} notificationsOpen={false} onNotifications={vi.fn()} onAccounts={vi.fn()} administration reports exhibitionCount={105}/><header><span id="mobile-menu-slot"/><span id="mobile-notifications-slot"/></header></MemoryRouter>);
  fireEvent.click(screen.getByRole("button",{name:"Menu"}));
  expect(screen.getByRole("button",{name:translations.en["nav.exhibition"]}).querySelector(".exhibition-count")?.textContent).toBe("99+");
});
function Probe() { return <output>{useLocation().pathname}</output>; }
const notifications = vi.fn(), accounts = vi.fn();
function navigation() {
  return render(<MemoryRouter initialEntries={[`/${state.language}`]}><MobileNavigation unreadCount={2} notificationsOpen={false} onNotifications={notifications} onAccounts={accounts} administration={false} reports={false}/><header><span id="mobile-menu-slot"/><span id="mobile-notifications-slot"/></header><Probe/></MemoryRouter>);
}
it.each(["en", "ar"])("mirrors three bottom links with the language in %s", language => {
  state.language = language;
  const { container } = navigation();
  const nav = container.querySelector(".mobile-bottom-nav")!;
  expect(nav.getAttribute("dir")).toBe(language === "ar" ? "rtl" : "ltr");
  expect(Array.from(nav.querySelectorAll("a")).map(link => link.getAttribute("href"))).toEqual([`/${language}`, `/${language}/upload`, `/${language}/profile`]);
  fireEvent.click(nav.querySelectorAll("a")[2]);
  expect(screen.getByRole("status").textContent).toBe(`/${language}/profile`);
});
it("portals hamburger and unread bell into the home header slots", () => {
  const { container } = render(<MemoryRouter initialEntries={["/en"]}><MobileNavigation unreadCount={2} notificationsOpen={false} onNotifications={notifications} onAccounts={accounts} administration={false} reports={false}/><header><span id="mobile-menu-slot"/><span id="mobile-notifications-slot"/></header></MemoryRouter>);
  expect(container.querySelector("#mobile-menu-slot button")?.getAttribute("aria-label")).toBe("Menu");
  expect(container.querySelector("#mobile-notifications-slot .notification-badge")?.textContent).toBe("2");
  fireEvent.click(screen.getByRole("button", { name: "Notifications" })); expect(notifications).toHaveBeenCalledOnce();
});
it("does not show menu or notification controls on pages without home header slots", () => {
  render(<MemoryRouter initialEntries={["/en/profile"]}><MobileNavigation unreadCount={2} notificationsOpen={false} onNotifications={notifications} onAccounts={accounts} administration={false} reports={false}/></MemoryRouter>);
  expect(screen.queryByRole("button", {name:"Menu"})).toBeNull();
  expect(screen.queryByRole("button", {name:"Notifications"})).toBeNull();
  expect(screen.getAllByRole("link")).toHaveLength(3);
});
it("uses the profile image and falls back to the user's initial if it fails", async () => {
  const {container} = navigation();
  await act(async () => {});
  const image = container.querySelector<HTMLImageElement>(".mobile-nav-avatar img")!;
  expect(image.getAttribute("src")).toBe("/avatar.png");
  fireEvent.error(image);
  expect(container.querySelector(".mobile-nav-avatar")?.textContent).toBe("V");
});
it("shows labeled drawer rows, restores Find users, and puts Settings before final logout", () => {
  navigation(); fireEvent.click(screen.getByRole("button", {name:"Menu"}));
  const rows = Array.from(document.querySelectorAll(".mobile-drawer-grid button"));
  expect(rows.slice(-2).map(row => row.textContent)).toEqual(["Settings", "Log out"]);
  const find = screen.getByRole("button", {name:"Find users"});
  expect(find.textContent).toBe("Find users"); expect(find.querySelector(".mobile-find-users-icon")).toBeTruthy();
  const header=document.querySelector(".mobile-drawer-header")!;
  expect(header.querySelector("img")?.getAttribute("src")).toContain("inkfig-logo");
  expect(header.querySelector(".mobile-drawer-close")).toBeTruthy();
  const preferences=document.querySelector(".mobile-drawer-preferences")!;
  expect(preferences.querySelectorAll("button")).toHaveLength(2);
  expect(preferences.textContent).toBe("");
  expect(document.body.style.position).toBe("fixed"); expect(document.documentElement.style.overflow).toBe("hidden");
});
it("moves profile content with the finger, settles on the next page and keeps inactive pages inert",()=>{
  function Pager(){const [section,select]=React.useState<"posts"|"saved"|"likes">("posts");return <ProfilePager section={section} select={select} enabled>{page=><p>{page}</p>}</ProfilePager>;}
  const {container}=render(<Pager/>);
  const area=container.querySelector<HTMLElement>(".profile-swipe-area")!;
  fireEvent.touchStart(area,{touches:[{clientX:220,clientY:100}]});
  fireEvent.touchMove(area,{touches:[{clientX:100,clientY:102}]});
  expect(area.style.getPropertyValue("--profile-drag")).toBe("-120px");
  expect(area.getAttribute("data-dragging")).toBe("true");
  expect(container.querySelector('.profile-swipe-slide[data-active="true"]')?.textContent).toBe("posts");
  fireEvent.touchEnd(area,{touches:[],changedTouches:[{clientX:100,clientY:102}]});
  expect(area.style.getPropertyValue("--profile-index")).toBe("1");
  expect(area.getAttribute("data-dragging")).toBeNull();
  expect(container.querySelector('.profile-swipe-slide[data-active="true"]')?.textContent).toBe("saved");
  expect(container.querySelectorAll('.profile-swipe-slide[inert]')).toHaveLength(2);
});
it("cancels short profile drags and leaves the next deliberate tap usable after scrolling",()=>{
  const click=vi.fn();
  function Pager(){const [section,select]=React.useState<"posts"|"saved"|"likes">("posts");return <ProfilePager section={section} select={select} enabled>{page=><button className="artwork-image-button" onClick={click}>{page}</button>}</ProfilePager>;}
  const {container}=render(<Pager/>); const area=container.querySelector<HTMLElement>(".profile-swipe-area")!;
  fireEvent.touchStart(area,{touches:[{clientX:220,clientY:100}]});fireEvent.touchMove(area,{touches:[{clientX:200,clientY:100}]});
  fireEvent.touchEnd(area,{touches:[],changedTouches:[{clientX:200,clientY:100}]});
  expect(area.style.getPropertyValue("--profile-index")).toBe("0");
  fireEvent.touchStart(area,{touches:[{clientX:200,clientY:100}]});fireEvent.touchMove(area,{touches:[{clientX:198,clientY:220}]});
  fireEvent.touchEnd(area,{touches:[],changedTouches:[{clientX:198,clientY:220}]});
  const button=screen.getByRole("button",{name:"posts"});
  fireEvent.touchStart(button,{touches:[{clientX:190,clientY:120}]});fireEvent.touchEnd(button,{touches:[],changedTouches:[{clientX:190,clientY:120}]});fireEvent.click(button);
  expect(click).toHaveBeenCalledOnce();
});
it("consumes an outside gesture and restores the page scroll position after closing", () => {
  const action=vi.fn();
  Object.defineProperty(window,"scrollY",{configurable:true,value:350});
  const {container}=render(<MemoryRouter initialEntries={["/en"]}><MobileNavigation unreadCount={0} notificationsOpen={false} onNotifications={notifications} onAccounts={accounts} administration={false} reports={false}/><header><span id="mobile-menu-slot"/><span id="mobile-notifications-slot"/></header><button onClick={action}>Artwork</button></MemoryRouter>);
  fireEvent.click(screen.getByRole("button",{name:"Menu"}));
  expect(document.body.style.top).toBe("-350px");
  const outside=screen.getByRole("button",{name:"Artwork"});
  fireEvent.pointerDown(outside);fireEvent.pointerUp(outside);fireEvent.click(outside);
  expect(action).not.toHaveBeenCalled();expect(document.querySelector(".is-closing")).toBeTruthy();
  act(()=>vi.advanceTimersByTime(240));
  expect(document.body.style.position).toBe("");expect(window.scrollTo).toHaveBeenCalledWith({top:350,behavior:"instant"});
  fireEvent.click(outside);expect(action).toHaveBeenCalledOnce();
  expect(container.querySelector(".mobile-drawer-layer")).toBeNull();
  Object.defineProperty(window,"scrollY",{configurable:true,value:0});
});
it.each(["Escape", "backdrop", "close"])("retains the drawer during smooth %s dismissal and restores scrolling", method => {
  navigation(); fireEvent.click(screen.getByRole("button", { name: "Menu" }));
  expect(document.body.style.overflow).toBe("hidden");
  expect(screen.getByRole("dialog")).toBeTruthy();
  if (method === "Escape") fireEvent.keyDown(document, { key: "Escape" });
  else fireEvent.click(screen.getAllByRole("button", { name: "Close menu" })[method === "backdrop" ? 0 : 1]);
  expect(document.querySelector(".is-closing")).toBeTruthy();
  act(() => vi.advanceTimersByTime(240));
  expect(screen.queryByRole("dialog")).toBeNull(); expect(document.body.style.overflow).toBe("");
});
it("closes before opening Find users or changing language", () => {
  navigation(); fireEvent.click(screen.getByRole("button", { name: "Menu" }));
  fireEvent.click(screen.getByRole("button", { name: "Find users" })); expect(accounts).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(240)); expect(accounts).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Menu" }));
  fireEvent.click(screen.getByRole("button", { name: "Language" })); expect(state.setLanguage).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(240)); expect(state.setLanguage).toHaveBeenCalledWith("ar");
});
function SwipeProbe() {
  const [section, select] = React.useState<"posts" | "saved" | "likes">("posts");
  return <div data-testid="swipe" {...useProfileSwipe(true, section, select)}>{section}</div>;
}
function swipe(node: HTMLElement, x: number, y = 0) {
  fireEvent.touchStart(node, { touches: [{ clientX: 200, clientY: 100 }] });
  fireEvent.touchEnd(node, { touches: [], changedTouches: [{ clientX: 200 + x, clientY: 100 + y }] });
}
it("swipes posts/saved/likes in both directions, clamps ends and ignores vertical gestures", () => {
  render(<SwipeProbe/>); const area = screen.getByTestId("swipe");
  swipe(area, 100); expect(area.textContent).toBe("posts");
  swipe(area, -90, 140); expect(area.textContent).toBe("posts");
  swipe(area, -100); expect(area.textContent).toBe("saved");
  swipe(area, -100); expect(area.textContent).toBe("likes");
  swipe(area, -100); expect(area.textContent).toBe("likes");
  swipe(area, 100); expect(area.textContent).toBe("saved");
  swipe(area, 100); expect(area.textContent).toBe("posts");
});
it("leaves desktop touch gestures unchanged", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  render(<SwipeProbe/>); const area = screen.getByTestId("swipe");
  swipe(area, -100); expect(area.textContent).toBe("posts");
});
it("ignores multi-touch and prevents a swipe from opening an artwork", () => {
  const click = vi.fn();
  function Grid() { return <div data-testid="swipe" {...useProfileSwipe(true, "posts", vi.fn())}><button onClick={click}>Artwork</button></div>; }
  render(<Grid/>); const area = screen.getByTestId("swipe");
  fireEvent.touchStart(area, { touches: [{clientX:200,clientY:100}, {clientX:220,clientY:100}] });
  fireEvent.touchEnd(area, { touches: [], changedTouches: [{clientX:50,clientY:100}] });
  fireEvent.click(screen.getByRole("button", {name:"Artwork"})); expect(click).toHaveBeenCalledOnce();
  swipe(area, -100);
  fireEvent.click(screen.getByRole("button", {name:"Artwork"})); expect(click).toHaveBeenCalledOnce();
});
it("moves the mobile header gradually with scroll distance in both directions", () => {
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => window.setTimeout(callback, 0));
  vi.stubGlobal("cancelAnimationFrame", window.clearTimeout);
  function Header() { return <header data-testid="header" data-progress={useScrollHeader()}/>; }
  render(<Header/>);
  act(() => { Object.defineProperty(window, "scrollY", { configurable: true, value: 80 }); fireEvent.scroll(window); vi.advanceTimersByTime(1); });
  expect(screen.getByTestId("header").getAttribute("data-progress")).toBe("0.5");
  act(() => { Object.defineProperty(window, "scrollY", { configurable: true, value: 200 }); fireEvent.scroll(window); vi.advanceTimersByTime(1); });
  expect(screen.getByTestId("header").getAttribute("data-progress")).toBe("1");
  act(() => { Object.defineProperty(window, "scrollY", { configurable: true, value: 120 }); fireEvent.scroll(window); vi.advanceTimersByTime(1); });
  expect(screen.getByTestId("header").getAttribute("data-progress")).toBe("0.5");
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});
it("does not interpret drawer scroll restoration as a downward gesture", () => {
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => window.setTimeout(callback, 0));
  vi.stubGlobal("cancelAnimationFrame", window.clearTimeout);
  function Header() { return <output data-testid="progress">{useScrollHeader()}</output>; }
  render(<Header/>);
  const scroll = (y:number) => act(()=>{Object.defineProperty(window,"scrollY",{configurable:true,value:y});fireEvent.scroll(window);vi.advanceTimersByTime(1);});
  scroll(200); expect(screen.getByTestId("progress").textContent).toBe("1");
  document.body.style.position="fixed"; scroll(0);
  document.body.style.position=""; scroll(200);
  expect(screen.getByTestId("progress").textContent).toBe("0");
  scroll(280); expect(screen.getByTestId("progress").textContent).toBe("0.5");
  Object.defineProperty(window,"scrollY",{configurable:true,value:0});
});
it.each(["notifications-panel","account-discovery-panel"])("resumes header tracking after %s closes, even with focus on a header button",id=>{
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>window.setTimeout(callback,0));
  vi.stubGlobal("cancelAnimationFrame",window.clearTimeout);
  function Header({open}:{open:boolean}){return <><header className="gallery-header"><button>Header control</button><output data-testid="progress">{useScrollHeader()}</output></header>{open&&<div id={id}/>}</>;}
  const view=render(<Header open/>);
  const scroll=(y:number)=>act(()=>{Object.defineProperty(window,"scrollY",{configurable:true,value:y});fireEvent.scroll(window);vi.advanceTimersByTime(1);});
  scroll(200);expect(screen.getByTestId("progress").textContent).toBe("0");
  view.rerender(<Header open={false}/>);screen.getByRole("button",{name:"Header control"}).focus();
  scroll(280);expect(screen.getByTestId("progress").textContent).toBe("0.5");
  Object.defineProperty(window,"scrollY",{configurable:true,value:0});
});
it.each(["resize","pageshow","keyboard resize"])("rebases header tracking after %s and responds to the next gesture",event=>{
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>window.setTimeout(callback,0));vi.stubGlobal("cancelAnimationFrame",window.clearTimeout);
  const viewport=new EventTarget();vi.stubGlobal("visualViewport",viewport);
  function Header(){return <output data-testid="progress">{useScrollHeader()}</output>;}
  render(<Header/>);
  const scroll=(y:number)=>act(()=>{Object.defineProperty(window,"scrollY",{configurable:true,value:y});fireEvent.scroll(window);vi.advanceTimersByTime(1);});
  scroll(200);expect(screen.getByTestId("progress").textContent).toBe("1");
  act(()=>{if(event==="keyboard resize")viewport.dispatchEvent(new Event("resize"));else window.dispatchEvent(new Event(event));});
  expect(screen.getByTestId("progress").textContent).toBe("0");
  scroll(280);expect(screen.getByTestId("progress").textContent).toBe("0.5");
  Object.defineProperty(window,"scrollY",{configurable:true,value:0});
});
it("releases stale search focus when the phone keyboard closes",()=>{
  const viewport=Object.assign(new EventTarget(),{height:400});vi.stubGlobal("visualViewport",viewport);
  function Header(){return <header className="gallery-header"><input aria-label="Search"/><output>{useScrollHeader()}</output></header>;}
  render(<Header/>);const input=screen.getByRole("textbox");input.focus();expect(document.activeElement).toBe(input);
  act(()=>{viewport.height=720;viewport.dispatchEvent(new Event("resize"));});
  expect(document.activeElement).not.toBe(input);
});
