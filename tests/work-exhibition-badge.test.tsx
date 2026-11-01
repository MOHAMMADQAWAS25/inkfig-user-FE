import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { WorkExhibitionBadge } from "../src/features/works/WorkExhibitionBadge";

afterEach(cleanup);
const exhibitions=[{exhibition_id:"one",name:"Annual exhibition",year:2026},{exhibition_id:"two",name:"Earlier exhibition",year:2025}];
function mount(detail=false,language="en",entries=exhibitions){
  return render(<MemoryRouter initialEntries={[`/${language}`]}><Routes><Route path="/:language" element={<I18nProvider><WorkExhibitionBadge exhibitions={entries} detail={detail}/></I18nProvider>}/></Routes></MemoryRouter>);
}
it("omits badge markup entirely when there is no exhibition",()=>{
  const {container}=mount(false,"en",[]);
  expect(container.querySelector(".work-exhibition-badge")).toBeNull();
});
it("renders only an accessible trophy without year, name or count on cards",()=>{
  const {container}=mount(false,"en",[...exhibitions,exhibitions[0]]);
  expect(screen.getByRole("img",{name:"Exhibition"})).toBeTruthy();
  expect(container.querySelectorAll(".work-exhibition-overlay")).toHaveLength(1);
  expect(screen.queryByRole("link")).toBeNull(); // underlying card retains its navigation
  expect(container.querySelector(".work-exhibition-overlay")?.textContent).toBe("");
  expect(container.querySelector("svg")?.getAttribute("width")).toBe("21");
});
it.each(["en","ar"])("detail badges expose exhibition names/years and localized links in %s",language=>{
  const {container}=mount(true,language);
  const links=screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  expect(links[0].getAttribute("href")).toBe(`/${language}/exhibition/one`);
  expect(links[0].textContent).toContain(language==="ar"?"معرض2026":"Exhibition2026");
  expect(screen.getByText("Annual exhibition")).toBeTruthy();
  expect(container.querySelector(".work-exhibition-overlay")).toBeNull();
});
it("renders the trophy from a lightweight boolean without needing detail metadata",()=>{
  render(<MemoryRouter><I18nProvider><WorkExhibitionBadge hasExhibition/></I18nProvider></MemoryRouter>);
  expect(screen.getByRole("img")).toBeTruthy();
  expect(screen.queryByText("2026")).toBeNull();
});
it.each(["en","ar"])("does not repeat a generic Arabic exhibition name inside the %s badge",language=>{
  const {container}=mount(true,language,[{exhibition_id:"one",name:"معرض 2026",year:2026}]);
  expect(container.querySelector(".work-exhibition-name")).toBeNull();
  expect(screen.getByRole("link").textContent).toBe(language==="ar"?"معرض2026":"Exhibition2026");
});
