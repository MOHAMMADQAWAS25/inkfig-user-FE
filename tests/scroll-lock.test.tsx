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
it("locks a phone without fixing the body or forcing a scroll on release",()=>{
  vi.stubGlobal("matchMedia",()=>({matches:true}));
  vi.stubGlobal("scrollY",350);
  const scroll=vi.spyOn(window,"scrollTo").mockImplementation(()=>{});
  const view=render(<Lock active/>);
  expect(document.body.style.position).toBe("");
  expect(document.body.style.top).toBe("");
  expect(document.documentElement.style.overflow).toBe("hidden");
  const move=new Event("touchmove",{bubbles:true,cancelable:true});
  Object.defineProperty(move,"touches",{value:[{clientY:100}]});
  document.body.dispatchEvent(move);
  expect(move.defaultPrevented).toBe(true);
  view.unmount();
  expect(document.documentElement.style.overflow).toBe("");
  expect(scroll).not.toHaveBeenCalled();
});
it("restores phone scroll only if the browser moved it while locked",()=>{
  vi.stubGlobal("matchMedia",()=>({matches:true}));vi.stubGlobal("scrollY",350);
  const scroll=vi.spyOn(window,"scrollTo").mockImplementation(()=>{});
  const view=render(<Lock active/>);
  vi.stubGlobal("scrollY",0);view.unmount();
  expect(scroll).toHaveBeenCalledExactlyOnceWith({top:350,behavior:"instant"});
});
it("allows a phone panel to scroll internally but contains overscroll at its boundaries",()=>{
  vi.stubGlobal("matchMedia",()=>({matches:true}));
  render(<><Lock active/><section data-testid="panel" style={{overflowY:"auto"}}/></>);
  const panel=document.querySelector("section")!;
  Object.defineProperties(panel,{scrollHeight:{value:1000},clientHeight:{value:200},scrollTop:{value:100,writable:true}});
  const touch=(type:string,y:number)=>{
    const event=new Event(type,{bubbles:true,cancelable:true});
    Object.defineProperty(event,"touches",{value:[{clientY:y}]});panel.dispatchEvent(event);return event;
  };
  touch("touchstart",200);
  expect(touch("touchmove",150).defaultPrevented).toBe(false);
  panel.scrollTop=800;expect(touch("touchmove",100).defaultPrevented).toBe(true);
  panel.scrollTop=0;expect(touch("touchmove",150).defaultPrevented).toBe(true);
});
