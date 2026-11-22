import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { useExhibitionArtworkNavigation } from "../src/features/exhibitions/useExhibitionArtworkNavigation";

afterEach(cleanup);

function Preview({scope="event:viewer"}:{scope?:string}) {
  const popup=useExhibitionArtworkNavigation(scope),location=useLocation(),navigate=useNavigate();
  return <><output data-testid="url">{location.pathname+location.search+location.hash}</output>
    <output data-testid="state">{JSON.stringify(location.state)}</output>
    <button onClick={()=>popup.open("art",new DOMRect(10,20,200,300))}>Open</button>
    <button onClick={()=>navigate(-1)}>Browser Back</button><button onClick={()=>navigate(1)}>Browser Forward</button>
    {popup.workId&&<section role="dialog" aria-label={popup.workId}><button onClick={popup.close}>Close</button><span data-testid="origin">{popup.origin?.width}</span></section>}
  </>;
}

it.each(["/en/exhibition/current","/ar/exhibition/past","/en/exhibition/event/leaderboard"])("Back closes the preview without leaving %s; Forward restores it",async path=>{
  const mounted=vi.fn();
  function Gallery(){React.useEffect(()=>{mounted();},[]);return <Preview/>;}
  render(<MemoryRouter initialEntries={["/en/exhibition",path]}><Routes><Route path="*" element={<Gallery/>}/></Routes></MemoryRouter>);
  fireEvent.click(screen.getByText("Open"));expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe("art");
  expect(screen.getByTestId("origin").textContent).toBe("200");
  fireEvent.click(screen.getByText("Browser Back"));await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByTestId("url").textContent).toBe(path);expect(mounted).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("Browser Forward"));await screen.findByRole("dialog");
  fireEvent.click(screen.getByText("Close"));await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByTestId("url").textContent).toBe(path);
  fireEvent.click(screen.getByText("Browser Back"));await waitFor(()=>expect(screen.getByTestId("url").textContent).toBe("/en/exhibition"));
});

it("preserves query/hash/state, replaces repeated opens and ignores another viewer's preview",async()=>{
  const tree=(scope:string)=><MemoryRouter initialEntries={[{pathname:"/en/exhibition/event",search:"?page=2",hash:"#works",state:{retained:true}}]}><Preview scope={scope}/></MemoryRouter>;
  const view=render(tree("event:viewer"));
  fireEvent.click(screen.getByText("Open"));fireEvent.click(screen.getByText("Open"));
  expect(screen.getByTestId("url").textContent).toBe("/en/exhibition/event?page=2#works");
  expect(screen.getByTestId("state").textContent).toContain('"retained":true');
  view.rerender(tree("event:other"));expect(screen.queryByRole("dialog")).toBeNull();
  view.rerender(tree("event:viewer"));expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.click(screen.getByText("Close"));await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByTestId("state").textContent).toBe('{"retained":true}');
});
