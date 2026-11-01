import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { ExhibitionLeaderboardPage } from "../src/features/exhibitions/ExhibitionLeaderboardPage";
import { requestJson } from "../src/api/httpClient";

vi.mock("../src/api/httpClient", () => ({ mainApiBaseUrl: "https://main.test", requestJson: vi.fn() }));
vi.mock("../src/features/navigation/AppSidebar", () => ({ AppSidebar: () => null }));
vi.mock("../src/features/exhibitions/ExhibitionArtworkPopup", () => ({ ExhibitionArtworkPopup: (props: {workId: string; exhibitionId?: string; onClose: () => void}) => <div role="dialog">{props.workId}<span>{props.exhibitionId ? "voting enabled" : "read only"}</span><button onClick={props.onClose}>Close</button></div> }));
const entry = (id: string, rank: number) => ({ work_id: id, rank, title: `Art ${id}`, artist_name: "Artist", artist_avatar_url: "/avatar.png", image_url: "/image.png", type_name_en: "Digital Art", type_name_ar: "فن رقمي", average: 4.5, vote_count: 2 });
const page = { exhibition: {name: "Show"}, fetched_at: "2026-11-01T12:00:00Z", started: true, voting_open: true, total: 2, items: [entry("a", 1)], next_cursor: 20 };
let client: QueryClient;
function mount() {
  client = new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/en/exhibition/show/leaderboard"]}><Routes><Route path="/:language/exhibition/:exhibitionId/leaderboard" element={<I18nProvider><ExhibitionLeaderboardPage/></I18nProvider>}/></Routes></MemoryRouter></QueryClientProvider>);
}
beforeEach(() => { vi.clearAllMocks(); vi.mocked(requestJson).mockResolvedValue({data:page,status:200}); });
afterEach(() => { cleanup(); client.clear(); });

it("appends server order, deduplicates moved rows, opens read-only details and refreshes from page one", async () => {
  mount();
  fireEvent.click(await screen.findByRole("button", {name:"View artwork: Art a"}));
  expect(screen.getByRole("dialog").textContent).toContain("read only");
  fireEvent.click(screen.getByText("Close"));
  vi.mocked(requestJson).mockResolvedValueOnce({data:{...page,items:[entry("a",1),entry("b",2)],next_cursor:null},status:200});
  fireEvent.click(screen.getByText("Load more"));
  await screen.findByRole("button", {name:"View artwork: Art b"});
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(vi.mocked(requestJson).mock.calls.at(-1)?.[2]).toContain("cursor=20");
  expect(screen.getAllByText("4.50 / 5")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", {name:"Refresh"}));
  await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1));
  expect(vi.mocked(requestJson).mock.calls.at(-1)?.[2]).toContain("cursor=0");
});

it("shows a genuine empty state without unrated entries", async () => {
  vi.mocked(requestJson).mockResolvedValue({data:{...page,items:[],total:0,next_cursor:null},status:200});
  mount();
  await screen.findByText("No artworks have counted votes yet.");
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  expect(screen.queryByText("Load more")).toBeNull();
});
