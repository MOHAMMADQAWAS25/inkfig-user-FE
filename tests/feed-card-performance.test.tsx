import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PostCard } from "../src/features/feed/PostCard";
import { LazyImage } from "../src/features/feed/LazyImage";
import type { FeedWork } from "../src/features/works/worksApi";

vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:null})}));
vi.mock("../src/i18n/I18nProvider",()=>({useI18n:()=>({language:"en",t:(key:string)=>key})}));
vi.mock("../src/features/feed/LazyImage",()=>({LazyImage:vi.fn(({work}:{work:FeedWork})=><img alt={work.title}/>)}));
beforeEach(()=>vi.clearAllMocks());
afterEach(cleanup);
const work:FeedWork={work_id:"one",title:"Artwork",owner_user_id:"artist",artist_name:"Artist",type_id:"type",type_name_en:"Digital art",type_name_ar:"فن رقمي",description:"",links:[],image_url:"/art.png",mime_type:"image/png",created_at:"2026-10-19T00:00:00Z",like_count:0,liked_by_me:false,saved_by_me:false};

it("skips unchanged cards but updates artwork, priority and action callbacks",()=>{
  const props={work,width:200,priority:false,onOpen:vi.fn(),onLike:vi.fn(),onSave:vi.fn()};
  const view=render(<PostCard {...props}/>,{wrapper:MemoryRouter});
  expect(LazyImage).toHaveBeenCalledTimes(1);
  view.rerender(<PostCard {...props}/>);
  expect(LazyImage).toHaveBeenCalledTimes(1);
  const updated={...work,title:"Updated",like_count:1};
  view.rerender(<PostCard {...props} work={updated}/>);
  expect(LazyImage).toHaveBeenCalledTimes(2);
  expect(view.getByAltText("Updated")).toBeTruthy();
  view.rerender(<PostCard {...props} work={updated} priority/>);
  expect(LazyImage).toHaveBeenCalledTimes(3);
  const onOpen=vi.fn();
  view.rerender(<PostCard {...props} work={updated} priority onOpen={onOpen}/>);
  fireEvent.click(view.getByRole("button",{name:"works.viewDetails: Updated"}));
  expect(onOpen).toHaveBeenCalledWith(updated);
  expect(props.onOpen).not.toHaveBeenCalled();
});
