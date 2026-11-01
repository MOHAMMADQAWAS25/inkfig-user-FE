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
it("renders a compact year and extra-exhibition count without duplicate entries",()=>{
  const {container}=mount(false,"en",[...exhibitions,exhibitions[0]]);
  expect(screen.getByText("Exhibition · 2026 +1")).toBeTruthy();
  expect(container.querySelectorAll(".work-exhibition-overlay")).toHaveLength(1);
  expect(screen.queryByRole("link")).toBeNull(); // underlying card retains its navigation
  expect(container.querySelector(".work-exhibition-overlay")?.getAttribute("title")).toContain("Earlier exhibition · 2025");
});
it.each(["en","ar"])("detail badges expose exhibition names/years and localized links in %s",language=>{
  const {container}=mount(true,language);
  const links=screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  expect(links[0].getAttribute("href")).toBe(`/${language}/exhibition/one`);
  expect(links[0].textContent).toContain(language==="ar"?"معرض · 2026":"Exhibition · 2026");
  expect(screen.getByText("Annual exhibition")).toBeTruthy();
  expect(container.querySelector(".work-exhibition-overlay")).toBeNull();
});
