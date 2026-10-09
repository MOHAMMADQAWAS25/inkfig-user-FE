import { Minus, Move, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { TranslationKey } from "../../i18n/resources";

type Point = { x:number; y:number };
type ImageSize = { width:number; height:number };

export function ProfileAvatarCropDialog({busy,file,onCancel,onSave,t}:{
  busy:boolean; file:File; onCancel:()=>void; onSave:(file:File)=>Promise<void>;
  t:(key:TranslationKey)=>string;
}) {
  const viewportRef=useRef<HTMLDivElement>(null);
  const dragRef=useRef<{pointerId:number;startX:number;startY:number;offset:Point}|null>(null);
  const [imageUrl,setImageUrl]=useState("");
  const [imageSize,setImageSize]=useState<ImageSize>({width:0,height:0});
  const [cropSize,setCropSize]=useState(360);
  const [zoom,setZoom]=useState(1);
  const [offset,setOffset]=useState<Point>({x:0,y:0});

  useEffect(()=>{const url=URL.createObjectURL(file);setImageUrl(url);return()=>URL.revokeObjectURL(url);},[file]);
  useEffect(()=>{const viewport=viewportRef.current;if(!viewport)return;const measure=()=>setCropSize(viewport.getBoundingClientRect().width);measure();const observer=new ResizeObserver(measure);observer.observe(viewport);return()=>observer.disconnect();},[]);
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!busy)onCancel();};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[busy,onCancel]);

  const frameSize=cropSize*.76;
  const baseScale=imageSize.width&&imageSize.height?Math.max(frameSize/imageSize.width,frameSize/imageSize.height):1;
  function clampOffset(next:Point,nextZoom=zoom):Point{const scale=baseScale*nextZoom;const maxX=Math.max(0,(imageSize.width*scale-frameSize)/2);const maxY=Math.max(0,(imageSize.height*scale-frameSize)/2);return{x:Math.max(-maxX,Math.min(maxX,next.x)),y:Math.max(-maxY,Math.min(maxY,next.y))};}
  function changeZoom(next:number){const value=Math.max(1,Math.min(3,next));setZoom(value);setOffset(current=>clampOffset(current,value));}
  function pointerDown(event:React.PointerEvent<HTMLDivElement>){if(busy)return;event.currentTarget.setPointerCapture(event.pointerId);dragRef.current={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,offset};}
  function pointerMove(event:React.PointerEvent<HTMLDivElement>){const drag=dragRef.current;if(!drag||drag.pointerId!==event.pointerId)return;setOffset(clampOffset({x:drag.offset.x+event.clientX-drag.startX,y:drag.offset.y+event.clientY-drag.startY}));}
  function pointerUp(event:React.PointerEvent<HTMLDivElement>){if(dragRef.current?.pointerId===event.pointerId)dragRef.current=null;}
  async function save(){if(!imageUrl||!imageSize.width||busy)return;const image=new window.Image();image.src=imageUrl;await image.decode();const scale=baseScale*zoom;const sourceSize=frameSize/scale;const sourceX=imageSize.width/2-sourceSize/2-offset.x/scale;const sourceY=imageSize.height/2-sourceSize/2-offset.y/scale;const canvas=document.createElement("canvas");canvas.width=512;canvas.height=512;const context=canvas.getContext("2d");if(!context)throw new Error("Canvas is unavailable");context.drawImage(image,sourceX,sourceY,sourceSize,sourceSize,0,0,512,512);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Crop failed")),"image/jpeg",.9));await onSave(new File([blob],"profile-picture.jpg",{type:"image/jpeg",lastModified:Date.now()}));}

  return <div className="profile-crop-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&!busy&&onCancel()}><section className="profile-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-crop-title"><header><h2 id="profile-crop-title">{t("profile.cropTitle")}</h2><button type="button" disabled={busy} aria-label={t("profile.cropCancel")} onClick={onCancel}><X aria-hidden="true" size={20}/></button></header><div className="profile-crop-viewport" ref={viewportRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>{imageUrl&&<img src={imageUrl} alt="" draggable={false} onLoad={event=>{setImageSize({width:event.currentTarget.naturalWidth,height:event.currentTarget.naturalHeight});setZoom(1);setOffset({x:0,y:0});}} style={{width:imageSize.width*baseScale*zoom,height:imageSize.height*baseScale*zoom,transform:`translate(calc(-50% + ${offset.x}px),calc(-50% + ${offset.y}px))`}}/>}<div className="profile-crop-mask" aria-hidden="true"/><span className="profile-crop-drag-hint"><Move aria-hidden="true" size={16}/>{t("profile.cropDrag")}</span></div><div className="profile-crop-controls"><Minus aria-hidden="true" size={18}/><label><span className="sr-only">{t("profile.cropZoom")}</span><input type="range" min="1" max="3" step="0.01" value={zoom} disabled={busy} onChange={event=>changeZoom(Number(event.target.value))}/></label><Plus aria-hidden="true" size={18}/></div><footer><button type="button" disabled={busy} onClick={onCancel}>{t("profile.cropCancel")}</button><button className="primary" type="button" disabled={busy||!imageSize.width} onClick={()=>void save()}>{t(busy?"profile.cropSaving":"profile.cropSave")}</button></footer></section></div>;
}
