import { useEffect, useRef, type ComponentProps, type Ref } from "react";

export function SmoothDetails({ children, ref: externalRef, ...props }: ComponentProps<"details"> & { ref?: Ref<HTMLDetailsElement> }) {
  const nodeRef=useRef<HTMLDetailsElement|null>(null);
  useEffect(()=>{
    const node=nodeRef.current;if(!node)return;
    let timer:number|undefined;let wasOpen=node.open;let closing=false;
    const inertContent=(value:boolean)=>{for(const child of Array.from(node.children))if(child instanceof HTMLElement&&child.tagName!=="SUMMARY")child.inert=value;};
    const close=()=>{
      if(closing)return;closing=true;node.open=true;node.dataset.exiting="true";inertContent(true);
      timer=window.setTimeout(()=>{node.open=false;wasOpen=false;closing=false;delete node.dataset.exiting;inertContent(false);},window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?0:180);
    };
    const click=(event:MouseEvent)=>{
      if(!(event.target instanceof Element)||!event.target.closest("summary")||event.target.closest("details")!==node)return;
      if(closing){event.preventDefault();window.clearTimeout(timer);closing=false;delete node.dataset.exiting;inertContent(false);node.open=true;wasOpen=true;}
      else if(node.open){event.preventDefault();close();}
    };
    const observer=new MutationObserver(()=>{if(!node.open&&wasOpen&&!closing)close();else if(node.open)wasOpen=true;});
    const keydown=(event:KeyboardEvent)=>{if(event.key==="Escape"&&node.open){event.preventDefault();event.stopPropagation();node.querySelector<HTMLElement>("summary")?.focus({preventScroll:true});close();}};
    observer.observe(node,{attributes:true,attributeFilter:["open"]});node.addEventListener("click",click);
    node.addEventListener("keydown",keydown);
    return()=>{observer.disconnect();node.removeEventListener("click",click);node.removeEventListener("keydown",keydown);window.clearTimeout(timer);};
  },[]);
  return <details {...props} ref={node=>{nodeRef.current=node;if(typeof externalRef==="function")externalRef(node);else if(externalRef)externalRef.current=node;}}>{children}</details>;
}
