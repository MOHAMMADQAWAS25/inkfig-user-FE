import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { usePageScrollLock } from "../src/features/layout/usePageScrollLock";
function Lock({active}:{active:boolean}){usePageScrollLock(active);return null;}
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();document.body.style.overflow="";});
it("keeps nested layers locked until the last owner releases and restores the original scroll",()=>{
  vi.stubGlobal("scrollY",120);const scroll=vi.spyOn(window,"scrollTo").mockImplementation(()=>{});
  document.body.style.overflow="auto";
  const view=render(<><Lock active/><Lock active={false}/></>);
  expect(document.body.style.top).toBe("-120px");
  view.rerender(<><Lock active/><Lock active/></>);
  view.rerender(<><Lock active={false}/><Lock active/></>);
  expect(document.body.style.position).toBe("fixed");expect(scroll).not.toHaveBeenCalled();
  view.rerender(<><Lock active={false}/><Lock active={false}/></>);
  expect(document.body.style.overflow).toBe("auto");expect(document.body.style.position).toBe("");
  expect(scroll).toHaveBeenCalledExactlyOnceWith({top:120,behavior:"instant"});
});
