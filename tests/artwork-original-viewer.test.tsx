import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { ArtworkPageMedia } from "../src/features/works/ArtworkPageMedia";
import { ArtworkImageExpand } from "../src/features/works/ArtworkImageExpand";
const labels={expand:"View full-size image",close:"Close full-size image",fit:"Fit to screen",actual:"Actual size",failed:"Unable to load image"};
const mount=(children:React.ReactNode)=>render(<MemoryRouter>{children}</MemoryRouter>);
beforeEach(()=>{
  vi.spyOn(window,"scrollTo").mockImplementation(()=>{});
  Object.defineProperty(HTMLDialogElement.prototype,"showModal",{configurable:true,value:vi.fn(function(this:HTMLDialogElement){this.open=true;})});
  Object.defineProperty(HTMLDialogElement.prototype,"close",{configurable:true,value:vi.fn(function(this:HTMLDialogElement){this.open=false;})});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});

it("opens a screen-fitting original without a toolbar and restores focus/scroll locking after its closing animation",async()=>{
  mount(<ArtworkImageExpand url="/original-8000.png" title="Artwork" labels={labels}/>);
  const button=screen.getByRole("button",{name:labels.expand});button.focus();fireEvent.click(button);
  const dialog=screen.getByRole("dialog",{name:"Artwork"});
  expect(dialog.parentElement).toBe(document.body);
  expect(within(dialog).getByRole("img").getAttribute("src")).toBe("/original-8000.png");
  expect(dialog.querySelector("header")).toBeNull();
  expect(document.documentElement.style.overflow).toBe("hidden");
  expect(within(dialog).queryByRole("button",{name:labels.fit})).toBeNull();
  expect(within(dialog).queryByRole("button",{name:labels.actual})).toBeNull();
  fireEvent.click(within(dialog).getByRole("button",{name:labels.close}));
  expect(dialog.getAttribute("data-closing")).toBe("true");
  await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());expect(document.activeElement).toBe(button);
  expect(document.documentElement.style.overflow).not.toBe("hidden");
});

it("Escape dismisses only the original viewer and nested scroll locks remain intact",async()=>{
  document.body.style.overflow="hidden";
  mount(<ArtworkImageExpand url="/original.png" title="Artwork" labels={labels}/>);
  fireEvent.click(screen.getByRole("button",{name:labels.expand}));
  fireEvent(screen.getByRole("dialog"),new Event("cancel",{cancelable:true}));
  await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());expect(document.body.style.overflow).toBe("hidden");
  document.body.style.overflow="";
});

it("shows a localized failure state without navigating away from the opened card",()=>{
  mount(<ArtworkImageExpand url="/missing.png" title="Artwork" labels={labels}/>);
  fireEvent.click(screen.getByRole("button",{name:labels.expand}));
  fireEvent.error(screen.getByRole("img"));expect(screen.getByRole("status").textContent).toBe(labels.failed);
  expect(screen.getByRole("button",{name:labels.close})).toBeTruthy();
});

it("clicking the empty popup background closes smoothly while clicking its image does not",async()=>{
  mount(<ArtworkImageExpand url="/original.png" title="Artwork" labels={labels}/>);
  fireEvent.click(screen.getByRole("button",{name:labels.expand}));
  fireEvent.click(screen.getByRole("img"));expect(screen.getByRole("dialog").getAttribute("data-closing")).toBe("false");
  fireEvent.click(screen.getByRole("dialog"));
  expect(screen.getByRole("dialog").getAttribute("data-closing")).toBe("true");
  await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
});

it("only offers image expansion after a successful load and resets on source changes",()=>{
  const view=mount(<ArtworkPageMedia url="/one.png" title="One" mimeType="image/png" failureLabel="Failed" imageLabels={labels}/>);
  expect(screen.queryByRole("button")).toBeNull();fireEvent.load(screen.getByRole("img"));
  expect(screen.getByRole("button",{name:labels.expand})).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:labels.expand}));expect(screen.getByRole("dialog")).toBeTruthy();
  view.rerender(<MemoryRouter><ArtworkPageMedia url="/two.png" title="Two" mimeType="image/png" failureLabel="Failed" imageLabels={labels}/></MemoryRouter>);
  expect(screen.queryByRole("dialog")).toBeNull();expect(screen.queryByRole("button")).toBeNull();
  fireEvent.error(screen.getByRole("img"));expect(screen.queryByRole("button")).toBeNull();
});

it("does not add an image viewer to video controls",()=>{
  const view=mount(<ArtworkPageMedia url="/clip.mp4" title="Clip" mimeType="video/mp4" failureLabel="Failed" imageLabels={labels}/>);
  fireEvent.loadedMetadata(view.container.querySelector("video")!);expect(screen.queryByRole("button")).toBeNull();
});

it("browser Back closes only the original image and Forward restores it at the same artwork URL",async()=>{
  function History(){const navigate=useNavigate(),location=useLocation();return <><output data-testid="path">{location.pathname}</output><button data-testid="back" onClick={()=>navigate(-1)}>Browser Back</button><button data-testid="forward" onClick={()=>navigate(1)}>Browser Forward</button></>;}
  render(<MemoryRouter initialEntries={["/en/artwork/art"]}><ArtworkImageExpand url="/original.png" title="Artwork" labels={labels}/><History/></MemoryRouter>);
  fireEvent.click(screen.getByRole("button",{name:labels.expand}));expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.click(screen.getByTestId("back"));await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByTestId("path").textContent).toBe("/en/artwork/art");
  fireEvent.click(screen.getByTestId("forward"));await screen.findByRole("dialog");
  expect(screen.getByTestId("path").textContent).toBe("/en/artwork/art");
});
