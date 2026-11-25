import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ArtworkPageMedia } from "../src/features/works/ArtworkPageMedia";

afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});

it.each([
  ["portrait", 1200, 2400], ["landscape", 2400, 1200], ["square", 1200, 1200],
  ["panorama", 8000, 600], ["very-tall", 600, 8000],
  ["small-portrait", 200, 300], ["small-landscape", 300, 200], ["small-square", 200, 200],
] as const)("renders one untransformed %s image without popup framing", (shape, width, height) => {
  const { container } = render(<ArtworkPageMedia url={`/${shape}.png`} title={shape} mimeType="image/png" failureLabel="Unavailable" />);
  const image = screen.getByRole("img", { name: shape });
  Object.defineProperties(image, { naturalWidth: { value: width }, naturalHeight: { value: height } });
  fireEvent.load(image);
  expect(container.querySelectorAll("img")).toHaveLength(1);
  expect(image.className).toBe("artwork-page-media-original");
  expect(image.style.transform).toBe("");
  expect(container.querySelector(".artwork-modal-media,.artwork-media-backdrop")).toBeNull();
  expect(image.getAttribute("draggable")).toBe("false");
  expect(fireEvent.contextMenu(image)).toBe(false);
  expect(fireEvent.dragStart(image)).toBe(false);
});

it("preserves localized failure text and recovers immediately when navigating to another source", () => {
  const { rerender } = render(<ArtworkPageMedia url="/broken.png" title="Broken" mimeType="image/png" failureLabel="Unavailable" />);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByRole("status").textContent).toBe("Unavailable");
  rerender(<ArtworkPageMedia url="/next.png" title="Next" mimeType="image/png" failureLabel="Unavailable" />);
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("img", { name: "Next" }).getAttribute("src")).toBe("/next.png");
});

it("retains video controls, inline playback and metadata-only preloading", () => {
  const { container } = render(<ArtworkPageMedia url="/clip.mp4" title="Clip" mimeType="video/mp4" failureLabel="Unavailable" />);
  const video = container.querySelector("video")!;
  expect(video.controls).toBe(true);
  expect(video.playsInline).toBe(true);
  expect(video.preload).toBe("metadata");
  expect(video.getAttribute("aria-label")).toBe("Clip");
  fireEvent.error(video);
  expect(screen.getByRole("status").textContent).toBe("Unavailable");
});
it("locks the phone maximum height, not the natural image frame, across toolbar changes",()=>{
  vi.stubGlobal("matchMedia",()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  let width=350,height=300;
  vi.stubGlobal("innerHeight",600);
  vi.spyOn(HTMLElement.prototype,"getBoundingClientRect").mockImplementation(()=>({width,height}) as DOMRect);
  let resized=()=>{};
  const disconnect=vi.fn();
  vi.stubGlobal("ResizeObserver",class {constructor(callback:()=>void){resized=callback;}observe(){}disconnect=disconnect;});
  const view=render(<ArtworkPageMedia url="/portrait.png" title="Portrait" mimeType="image/png" failureLabel="Unavailable"/>);
  const element=view.container.querySelector<HTMLElement>(".artwork-page-media")!;
  expect(element.style.getPropertyValue("--artwork-mobile-media-limit")).toBe("300px");
  height=340;vi.stubGlobal("innerHeight",680);fireEvent.resize(window);act(()=>resized());
  expect(element.style.getPropertyValue("--artwork-mobile-media-limit")).toBe("300px");
  width=650;height=280;vi.stubGlobal("innerHeight",560);act(()=>resized());
  expect(element.style.getPropertyValue("--artwork-mobile-media-limit")).toBe("280px");
  view.unmount();expect(disconnect).toHaveBeenCalledOnce();
});
it("does not measure or freeze desktop media",()=>{
  vi.stubGlobal("matchMedia",()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  const rect=vi.spyOn(HTMLElement.prototype,"getBoundingClientRect");
  const {container}=render(<ArtworkPageMedia url="/art.png" title="Art" mimeType="image/png" failureLabel="Unavailable"/>);
  expect(rect).not.toHaveBeenCalled();
  expect(container.querySelector<HTMLElement>(".artwork-page-media")!.style.getPropertyValue("--artwork-mobile-media-limit")).toBe("");
});
it("reserves intrinsic image dimensions and drops the loading placeholder once ready",()=>{
  const {container}=render(<ArtworkPageMedia url="/wide.png" title="Wide" mimeType="image/png" failureLabel="Unavailable" dimensions={{width:1200,height:600}}/>);
  const image=screen.getByRole("img");
  expect(image.getAttribute("width")).toBe("1200");expect(image.getAttribute("height")).toBe("600");
  expect(container.querySelector(".artwork-page-media")?.getAttribute("data-ready")).toBe("false");
  fireEvent.load(image);
  expect(container.querySelector(".artwork-page-media")?.getAttribute("data-ready")).toBe("true");
});

it.each([[200,300,400,600,false,false],[300,200,400,800/3,true,true],[400,600,400,600,false,false],[100,1000,60,600,true,false],[300,400,450,600,false,false],[200,200,400,400,true,true],[398,200,398,200,true,false],[500,200,400,160,true,false]])("fits %sx%s and fills width only for four-sided gaps",(width,height,expectedWidth,expectedHeight,gaps,fourSideFill)=>{
  vi.spyOn(HTMLElement.prototype,"clientWidth","get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype,"clientHeight","get").mockReturnValue(600);
  const view=render(<ArtworkPageMedia url="/art.png" title="Art" mimeType="image/png" failureLabel="Failed"/>);
  const image=screen.getByRole("img");
  Object.defineProperties(image,{naturalWidth:{value:width},naturalHeight:{value:height}});
  fireEvent.load(image);
  expect(parseFloat(image.style.width)).toBeCloseTo(expectedWidth);expect(parseFloat(image.style.height)).toBeCloseTo(expectedHeight);
  expect(image.style.maxHeight).toBe(fourSideFill?"none":"");
  expect(Boolean(view.container.querySelector(".artwork-frame-color"))).toBe(gaps);
});

it.each([[100,420],[450,496],[1000,680]])("sizes wide frames around %spx details and removes the override for a portrait",(detailsHeight,expected)=>{
  vi.spyOn(HTMLElement.prototype,"clientWidth","get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype,"clientHeight","get").mockReturnValue(820);
  vi.spyOn(HTMLElement.prototype,"offsetTop","get").mockImplementation(function(this:HTMLElement){return this.dataset.details ? 22 : 0;});
  vi.spyOn(HTMLElement.prototype,"offsetHeight","get").mockImplementation(function(this:HTMLElement){return this.dataset.details ? detailsHeight : 0;});
  const content=(url:string)=><article className="artwork-page-hero"><ArtworkPageMedia url={url} title="Art" mimeType="image/png" failureLabel="Failed"/><section className="artwork-page-info" style={{paddingBottom:22}}><div data-details="true"/></section></article>;
  const view=render(content("/wide.png"));
  const image=screen.getByRole("img");Object.defineProperties(image,{naturalWidth:{value:1200},naturalHeight:{value:600}});fireEvent.load(image);
  const box=view.container.querySelector<HTMLElement>("article")!;
  expect(box.dataset.wideArtwork).toBe("true");expect(box.style.getPropertyValue("--artwork-wide-height")).toBe(`${expected}px`);
  expect(box.style.getPropertyValue("--artwork-wide-media-height")).toBe("224px");
  view.rerender(content("/portrait.png"));
  expect(box.dataset.wideArtwork).toBeUndefined();expect(box.style.getPropertyValue("--artwork-wide-height")).toBe("");
});

it("rechecks the baseline on resize without oscillating between enlarged and original sizing",()=>{
  let width=400,resize=()=>{};
  vi.spyOn(HTMLElement.prototype,"clientWidth","get").mockImplementation(()=>width);
  vi.spyOn(HTMLElement.prototype,"clientHeight","get").mockReturnValue(600);
  vi.stubGlobal("ResizeObserver",class {constructor(callback:()=>void){resize=callback;}observe(){}disconnect(){}});
  render(<ArtworkPageMedia url="/small.png" title="Art" mimeType="image/png" failureLabel="Failed"/>);
  const image=screen.getByRole("img");Object.defineProperties(image,{naturalWidth:{value:300},naturalHeight:{value:200}});fireEvent.load(image);
  expect(parseFloat(image.style.width)).toBe(400);
  act(()=>{resize();resize();});expect(parseFloat(image.style.width)).toBe(400);
  width=250;act(()=>resize());expect(parseFloat(image.style.width)).toBe(250);expect(image.style.maxHeight).toBe("");
});
