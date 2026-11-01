import React from "react";
import {act,cleanup,fireEvent,render,screen} from "@testing-library/react";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import {MemoryRouter,Routes,Route,useNavigate} from "react-router-dom";
import {afterEach,expect,it,vi} from "vitest";
import {ProfilePage} from "../src/features/profile/ProfilePage";
import {I18nProvider} from "../src/i18n/I18nProvider";
import {getPublicProfile,type PublicProfile} from "../src/features/profile/profileApi";
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>({session:{userId:"viewer",permissions:["profile.read_own","reports.create"]},signOut:vi.fn()})}));
vi.mock("../src/features/navigation/AppSidebar",()=>({AppSidebar:()=>null}));
vi.mock("../src/features/profile/profileApi",()=>({getPublicProfile:vi.fn(),getProfileConnections:vi.fn(),setProfileFollow:vi.fn()}));
vi.mock("../src/features/works/worksApi",()=>({getUserWorks:vi.fn().mockResolvedValue({items:[],next_cursor:null}),getLikedWorks:vi.fn(),getSavedWorks:vi.fn(),getWorkTypes:vi.fn(),setWorkLike:vi.fn(),setWorkSave:vi.fn(),getWork:vi.fn(),updateWork:vi.fn(),deleteWork:vi.fn()}));
afterEach(()=>{cleanup();vi.restoreAllMocks();});
function Page(){const navigate=useNavigate();return <><button onClick={()=>navigate("/en/profile/two")}>Switch profile</button><ProfilePage/></>;}
it("ignores delayed profile responses after switching accounts",async()=>{
  let finish!:(profile:PublicProfile)=>void;
  const profile={user_id:"two",full_name:"Current Artist",avatar_url:null,follower_count:0,following_count:0,like_count:0,is_self:false,is_following:false};
  vi.mocked(getPublicProfile).mockImplementation(id=>id==="one"?new Promise(resolve=>{finish=resolve;}):Promise.resolve(profile));
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={["/en/profile/one"]}><I18nProvider><Routes><Route path="/:language/profile/:userId" element={<Page/>}/></Routes></I18nProvider></MemoryRouter></QueryClientProvider>);
  fireEvent.click(screen.getByRole("button",{name:"Switch profile"}));
  await screen.findByRole("heading",{name:"Current Artist"});
  await act(async()=>finish({...profile,user_id:"one",full_name:"Previous Artist"}));
  expect(screen.getByRole("heading",{name:"Current Artist"})).toBeTruthy();
  expect(screen.queryByRole("heading",{name:"Previous Artist"})).toBeNull();
  expect(getPublicProfile).toHaveBeenCalledTimes(2);
});
