import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfilePage } from "../src/features/profile/ProfilePage";
import { translations } from "../src/i18n/resources";
import { removeProfileAvatar } from "../src/features/profile/profileAvatarUpload";

const { session, signOut, artwork } = vi.hoisted(()=>({
  session:{userId:"viewer",fullName:"Viewer",permissions:["profile.read_own","works.upload","works.like","works.save"]},
  signOut:vi.fn(),
  artwork:{work_id:"work",owner_user_id:"viewer",artist_name:"Viewer",title:"My artwork",description:"Art",type_id:"art",type_name_en:"Art",type_name_ar:"Art",image_url:"/art.png",mime_type:"image/png",created_at:"2026-10-14T12:00:00Z",links:[],like_count:0,liked_by_me:false,saved_by_me:false},
}));
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session,signOut})}));
vi.mock("../src/i18n/I18nProvider",()=>({useI18n:()=>({language:"en",t:(key:keyof typeof translations.en)=>translations.en[key]})}));
vi.mock("../src/features/navigation/AppSidebar",()=>({AppSidebar:()=>null}));
vi.mock("../src/features/profile/profileApi",()=>({getPublicProfile:vi.fn().mockResolvedValue({user_id:"viewer",full_name:"Viewer",avatar_url:"/avatar.png",follower_count:12,following_count:7,like_count:4,is_self:true}),getProfileConnections:vi.fn(),setProfileFollow:vi.fn()}));
vi.mock("../src/features/profile/profileAvatarUpload",()=>({PROFILE_AVATAR_ACCEPT:"image/*",isValidProfileAvatarSource:()=>true,removeProfileAvatar:vi.fn().mockResolvedValue(undefined),uploadProfileAvatar:vi.fn()}));
vi.mock("../src/features/profile/ProfileAvatarCropDialog",()=>({ProfileAvatarCropDialog:()=>null}));
vi.mock("../src/features/works/worksApi",()=>({getUserWorks:vi.fn().mockResolvedValue({items:[artwork],next_cursor:null}),getLikedWorks:vi.fn().mockResolvedValue({items:[],next_cursor:null}),getSavedWorks:vi.fn().mockResolvedValue({items:[],next_cursor:null}),getWorkTypes:vi.fn().mockResolvedValue([]),setWorkLike:vi.fn(),setWorkSave:vi.fn(),deleteWork:vi.fn(),deleteWorkAsModerator:vi.fn(),updateWork:vi.fn()}));
beforeEach(()=>{vi.clearAllMocks();vi.spyOn(window,"confirm").mockReturnValue(true);});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});

describe("mobile profile controls",()=>{
  it("keeps avatar upload and removal accessible through the camera menu",async()=>{
    const {container}=render(<MemoryRouter><ProfilePage/></MemoryRouter>);
    await screen.findByRole("heading",{name:"Viewer"});
    const camera=container.querySelector<HTMLDetailsElement>(".profile-avatar-camera")!;
    fireEvent.click(camera.querySelector("summary")!);expect(camera.open).toBe(true);
    const input=container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const pick=vi.spyOn(input,"click");fireEvent.click(camera.querySelector("button")!);
    expect(pick).toHaveBeenCalledTimes(1);expect(camera.open).toBe(false);
    fireEvent.click(camera.querySelector("summary")!);fireEvent.click(camera.querySelectorAll("button")[1]);
    await waitFor(()=>expect(removeProfileAvatar).toHaveBeenCalledTimes(1));
    await waitFor(()=>expect(container.querySelector(".profile-avatar > img")).toBeNull());
    fireEvent.click(screen.getByRole("button",{name:translations.en["nav.logout"]}));expect(signOut).toHaveBeenCalledTimes(1);
  });
  it("preserves owner editing inside opened artwork when mobile card menus are hidden",async()=>{
    const {container}=render(<MemoryRouter><ProfilePage/></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button",{name:`${translations.en["works.viewDetails"]}: My artwork`}));
    expect(screen.getByRole("dialog")).toBeTruthy();
    const actions=container.querySelector(".artwork-modal-owner-actions")!;
    expect(actions.querySelectorAll("button")).toHaveLength(2);
    vi.useFakeTimers();
    fireEvent.click(actions.querySelector("button")!);
    await act(async()=>{await vi.advanceTimersByTimeAsync(240);});
    expect(container.querySelector(".work-edit-dialog")).toBeTruthy();
  });
});
