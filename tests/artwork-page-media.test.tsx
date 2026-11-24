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

it.each([[200,300,400,600,false],[300,200,300,200,true],[400,600,400,600,false],[100,1000,60,600,true],[300,400,450,600,false]])("fits %sx%s with full-height portraits and unchanged landscape sizing",(width,height,expectedWidth,expectedHeight,gaps)=>{
  vi.spyOn(HTMLElement.prototype,"clientWidth","get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype,"clientHeight","get").mockReturnValue(600);
  const view=render(<ArtworkPageMedia url="/art.png" title="Art" mimeType="image/png" failureLabel="Failed"/>);
  const image=screen.getByRole("img");
  Object.defineProperties(image,{naturalWidth:{value:width},naturalHeight:{value:height}});
  fireEvent.load(image);
  expect(image.style.width).toBe(`${expectedWidth}px`);expect(image.style.height).toBe(`${expectedHeight}px`);
  expect(Boolean(view.container.querySelector(".artwork-frame-color"))).toBe(gaps);
});
