import React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnimatedPresence } from "../src/features/layout/AnimatedPresence";
import { SmoothDetails } from "../src/features/layout/SmoothDetails";
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it("retains closing content and cancels stale closes when reopened",async()=>{
  const view=render(<AnimatedPresence open><span>Menu</span></AnimatedPresence>);
  view.rerender(<AnimatedPresence open={false}><span>Menu</span></AnimatedPresence>);
  expect(view.container.querySelector('[data-exiting="true"]')).toBeTruthy();
  view.rerender(<AnimatedPresence open><span>Reopened</span></AnimatedPresence>);
  await new Promise(resolve=>setTimeout(resolve,220));
  expect(view.container.textContent).toBe("Reopened");
  view.rerender(<AnimatedPresence open={false}><span>Reopened</span></AnimatedPresence>);
  await waitFor(()=>expect(view.container.textContent).toBe(""));
});
it("keeps native details content present through summary and outside dismissal",async()=>{
  const {container}=render(<SmoothDetails><summary>Open</summary><div>Menu</div></SmoothDetails>);
  const details=container.querySelector("details")!;const summary=container.querySelector("summary")!;
  fireEvent.click(summary);await waitFor(()=>expect(details.open).toBe(true));
  fireEvent.click(summary);expect(details.open).toBe(true);expect(details.dataset.exiting).toBe("true");
  await waitFor(()=>expect(details.open).toBe(false));
  fireEvent.click(summary);await waitFor(()=>expect(details.open).toBe(true));
  details.removeAttribute("open");await waitFor(()=>expect(details.dataset.exiting).toBe("true"));
  expect(details.open).toBe(true);
  fireEvent.click(summary);expect(details.dataset.exiting).toBeUndefined();
  await new Promise(resolve=>setTimeout(resolve,220));expect(details.open).toBe(true);
  fireEvent.keyDown(summary,{key:"Escape"});expect(details.dataset.exiting).toBe("true");
  await waitFor(()=>expect(details.open).toBe(false));
});
it("skips the closing delay when reduced motion is preferred",async()=>{
  vi.stubGlobal("matchMedia",vi.fn().mockReturnValue({matches:true}));
  const view=render(<AnimatedPresence open><span>Menu</span></AnimatedPresence>);
  view.rerender(<AnimatedPresence open={false}><span>Menu</span></AnimatedPresence>);
  await waitFor(()=>expect(view.container.textContent).toBe(""),{timeout:100});
});
