import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { translations } from "../src/i18n/resources";
import { ApiError } from "../src/api/httpClient";
import { ExhibitionArtworkCard } from "../src/features/exhibitions/ExhibitionArtworkCard";
import { ExhibitionRatingControls } from "../src/features/exhibitions/ExhibitionRatingControls";
import { RatingSummary } from "../src/features/exhibitions/RatingSummary";
import { WorkExhibitionBadge } from "../src/features/works/WorkExhibitionBadge";
import { changeExhibitionRating } from "../src/features/exhibitions/exhibitionRatingsApi";
import { updateRatingCaches } from "../src/features/exhibitions/updateRatingCaches";
import type { RatingState } from "../src/features/exhibitions/exhibitionRatingTypes";

const auth=vi.hoisted(()=>({session:{userId:"voter"} as {userId:string}|null}));
vi.mock("../src/features/auth/AuthContext",()=>({useAuth:()=>auth}));
vi.mock("../src/features/exhibitions/exhibitionRatingsApi",()=>({changeExhibitionRating:vi.fn()}));
const initial:RatingState={average:4.3,vote_count:28,my_rating:null,can_rate:true};
const clients:QueryClient[]=[];
const openArtwork=vi.fn();
function Probe(){const location=useLocation();return <output data-testid="route">{location.pathname}</output>;}
function mount(rating:RatingState=initial,options:{language?:"en"|"ar";open?:boolean;card?:boolean}={}){
  const language=options.language??"en";
  const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}}); clients.push(client);
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[`/${language}/exhibition/event`]}><Routes><Route path="/:language/*" element={<I18nProvider>
    {options.card?<ExhibitionArtworkCard onOpen={openArtwork} exhibitionId="event" votingOpen={options.open??true} item={{submission_id:"submission",work_id:"art",user_id:"artist",artist_name:"Artist",title:"Painting",image_url:"/art.png",status:"approved",rejection_reason:null,created_at:"2026-11-01T10:00:00Z",rating}}/>:
      <ExhibitionRatingControls exhibitionId="event" workId="art" rating={rating} votingOpen={options.open??true}/>}
    <Probe/>
  </I18nProvider>}/></Routes></MemoryRouter></QueryClientProvider>);
  return client;
}
beforeEach(()=>{vi.resetAllMocks();auth.session={userId:"voter"};});
afterEach(()=>{cleanup();clients.forEach(client=>client.clear());clients.length=0;});

it("requires explicit submission and does not navigate or duplicate in-flight votes",async()=>{
  let finish!:(value:RatingState)=>void;
  vi.mocked(changeExhibitionRating).mockReturnValue(new Promise(resolve=>{finish=resolve;}));
  mount(initial,{card:true});
  fireEvent.click(screen.getByRole("radio",{name:"4 out of 5 stars"}));
  expect(changeExhibitionRating).not.toHaveBeenCalled();
  expect(screen.getByTestId("route").textContent).toBe("/en/exhibition/event");
  const submit=screen.getByRole<HTMLButtonElement>("button",{name:"Submit rating"});
  expect(submit.closest("a")).toBeNull();
  fireEvent.click(submit);fireEvent.click(submit);
  expect(changeExhibitionRating).toHaveBeenCalledTimes(1);
  expect(screen.getByRole<HTMLButtonElement>("button",{name:"Saving…"}).disabled).toBe(true);
  expect(changeExhibitionRating).toHaveBeenCalledWith("event","art",4,expect.any(AbortSignal));
  await act(async()=>finish({...initial,average:4.2,vote_count:29,my_rating:4}));
  expect(screen.getByText("4.2 / 5 · 29 votes")).toBeTruthy();
  expect(screen.getByText("Your rating: 4 / 5")).toBeTruthy();
  expect(openArtwork).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button",{name:"View artwork details: Painting"}));
  expect(openArtwork).toHaveBeenCalledOnce();expect(openArtwork).toHaveBeenCalledWith("art");
  expect(screen.getByTestId("route").textContent).toBe("/en/exhibition/event");
});

it("changes a vote without adding to its count and removes the existing vote",async()=>{
  vi.mocked(changeExhibitionRating).mockResolvedValueOnce({...initial,average:4.4,my_rating:5}).mockResolvedValueOnce({...initial,average:4.2,vote_count:27,my_rating:null});
  mount({...initial,my_rating:3});
  fireEvent.click(screen.getByRole("radio",{name:"5 out of 5 stars"}));
  fireEvent.click(screen.getByRole("button",{name:"Change rating"}));
  await screen.findByText("Your rating: 5 / 5");
  expect(screen.getByText("4.4 / 5 · 28 votes")).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:"Remove rating"}));
  await screen.findByText("Your rating was removed.");
  expect(screen.getByText("4.2 / 5 · 27 votes")).toBeTruthy();
  expect(changeExhibitionRating).toHaveBeenLastCalledWith("event","art",null,expect.any(AbortSignal));
  expect(screen.queryByText("Your rating: 5 / 5")).toBeNull();
  expect(screen.getByRole<HTMLButtonElement>("button",{name:"Submit rating"}).disabled).toBe(true);
});

it("previews all stars up to the hovered star without changing the selected score",()=>{
  mount({...initial,my_rating:2});
  const stars=screen.getAllByRole("radio");
  const fills=()=>stars.map(star=>star.parentElement?.querySelector("svg")?.getAttribute("fill"));
  fireEvent.pointerEnter(stars[3].parentElement!,{pointerType:"mouse"});
  expect(fills()).toEqual(["currentColor","currentColor","currentColor","currentColor","none"]);
  expect((stars[1] as HTMLInputElement).checked).toBe(true);
  expect(changeExhibitionRating).not.toHaveBeenCalled();
  fireEvent.pointerLeave(stars[0].closest(".exhibition-rating-stars")!);
  expect(fills()).toEqual(["currentColor","currentColor","none","none","none"]);
});

it.each(["en","ar"])("links the exhibition card artist and avatar without opening the artwork (%s)",language=>{
  mount(initial,{card:true,language:language as "en"|"ar"});
  const artist=screen.getByRole("link",{name:"Artist"});
  expect(artist.getAttribute("href")).toBe(`/${language}/profile/artist`);
  expect(artist.querySelector(".profile-avatar-initial")).toBeTruthy();
  fireEvent.click(artist);
  expect(openArtwork).not.toHaveBeenCalled();
  expect(screen.getByTestId("route").textContent).toBe(`/${language}/profile/artist`);
});

it.each(["own_work","organizer","restricted","closed"])("keeps %s galleries read-only",reason=>{
  mount({...initial,can_rate:false,unavailable_reason:reason},{open:reason!=="closed"});
  expect(screen.queryByRole("radio")).toBeNull();
  expect(screen.getByText("4.3 / 5 · 28 votes")).toBeTruthy();
  expect(changeExhibitionRating).not.toHaveBeenCalled();
});

it("shows guests results and a sign-in link, not voting controls",()=>{
  auth.session=null;mount({...initial,can_rate:false,unavailable_reason:"signed_out"});
  expect(screen.queryByRole("radio")).toBeNull();
  expect(screen.getByRole("link",{name:"Sign in to rate in this gallery"}).getAttribute("href")).toBe("/en/login");
});

it("preserves confirmed results on a failed request and permits a retry",async()=>{
  vi.mocked(changeExhibitionRating).mockRejectedValueOnce(new ApiError(503,"Unavailable")).mockResolvedValueOnce({...initial,my_rating:2,vote_count:29});
  mount();fireEvent.click(screen.getByRole("radio",{name:"2 out of 5 stars"}));fireEvent.click(screen.getByRole("button",{name:"Submit rating"}));
  await screen.findByRole("alert");expect(screen.getByText("4.3 / 5 · 28 votes")).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:"Submit rating"}));
  await screen.findByText("Your rating was saved.");expect(screen.queryByRole("alert")).toBeNull();
});

it("refreshes eligibility when the server rejects a vote at the end boundary",async()=>{
  vi.mocked(changeExhibitionRating).mockRejectedValue(new ApiError(409,"Voting is closed."));
  const client=mount();const invalidate=vi.spyOn(client,"invalidateQueries");
  fireEvent.click(screen.getByRole("radio",{name:"3 out of 5 stars"}));fireEvent.click(screen.getByRole("button",{name:"Submit rating"}));
  await screen.findByRole("alert");expect(screen.queryByRole("radio")).toBeNull();
  expect(invalidate).toHaveBeenCalledWith({queryKey:["exhibition-public-works","voter","event"]});
});

it("supports Arabic stars and localized read-only counts",async()=>{
  vi.mocked(changeExhibitionRating).mockResolvedValue({...initial,my_rating:5});
  mount(initial,{language:"ar"});
  fireEvent.click(screen.getByRole("radio",{name:translations.ar["ratings.stars"].replace("{score}","5")}));
  fireEvent.click(screen.getByRole("button",{name:translations.ar["ratings.submit"]}));
  await screen.findByText(translations.ar["ratings.saved"]);
  expect(screen.getByText(/أصوات/).textContent).toContain(new Intl.NumberFormat("ar").format(28));
});

it("read-only summaries and artwork detail badges never render voting controls",()=>{
  render(<MemoryRouter><I18nProvider><RatingSummary rating={{average:null,vote_count:0}}/>
    <WorkExhibitionBadge detail exhibitions={[{exhibition_id:"event",name:"Student show",year:2026,rating:initial}]}/></I18nProvider></MemoryRouter>);
  expect(screen.getByText("No ratings yet")).toBeTruthy();
  expect(screen.getByText("4.3 / 5 · 28 votes")).toBeTruthy();
  expect(screen.queryByRole("radio")).toBeNull();expect(screen.queryByRole("button")).toBeNull();
  expect(screen.getByRole("link",{name:"Exhibition 2026"}).getAttribute("href")).toBe("/en/exhibition/event");
});

it("updates only the matching exhibition and viewer cache while preserving pagination",()=>{
  const client=new QueryClient();clients.push(client);
  const summary={exhibition_id:"event",year:2026,average:4,vote_count:2};
  const work={work_id:"art",exhibition_rating:summary,exhibitions:[{exhibition_id:"event",rating:{average:4,vote_count:2}},{exhibition_id:"other",rating:{average:1,vote_count:10}}]};
  client.setQueryData(["artwork-feed","voter"],{pages:[{items:[work],nextCursor:"next"}],pageParams:[null]});
  client.setQueryData(["artwork-detail","someone","art"],work);
  client.setQueryData(["exhibition-public-works","voter","event"],{pages:[{items:[{work_id:"art",rating:initial}],next_cursor:20}]});
  updateRatingCaches(client,"voter","event","art",{...initial,average:5,vote_count:3,my_rating:5});
  expect(client.getQueryData(["artwork-feed","voter"])).toMatchObject({pages:[{items:[{exhibition_rating:{average:5,vote_count:3},exhibitions:[{rating:{average:5,vote_count:3}},{rating:{average:1,vote_count:10}}]}],nextCursor:"next"}]});
  expect(client.getQueryData(["artwork-detail","someone","art"])).toEqual(work);
  expect(client.getQueryData(["exhibition-public-works","voter","event"])).toMatchObject({pages:[{items:[{rating:{my_rating:5}}],next_cursor:20}]});
});

it("aborts pending UI work on leaving the gallery and does not update stale caches",async()=>{
  let finish!:(value:RatingState)=>void;
  vi.mocked(changeExhibitionRating).mockReturnValue(new Promise(resolve=>{finish=resolve;}));
  const client=mount();const update=vi.spyOn(client,"setQueryData");
  fireEvent.click(screen.getByRole("radio",{name:"4 out of 5 stars"}));fireEvent.click(screen.getByRole("button",{name:"Submit rating"}));
  const signal=vi.mocked(changeExhibitionRating).mock.calls[0][3];
  cleanup();expect(signal?.aborted).toBe(true);
  await act(async()=>finish({...initial,my_rating:4}));expect(update).not.toHaveBeenCalled();
});
