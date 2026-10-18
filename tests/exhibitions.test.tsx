import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ExhibitionsPage } from "../src/features/exhibitions/ExhibitionsPage";
import { AssignExhibitionDialog } from "../src/features/exhibitions/AssignExhibitionDialog";
import { MyExhibitionSubmissionsPage } from "../src/features/exhibitions/MyExhibitionSubmissionsPage";
import { ExhibitionCard } from "../src/features/exhibitions/ExhibitionCard";
import * as api from "../src/features/exhibitions/exhibitionApi";
import { translations, type TranslationKey } from "../src/i18n/resources";

const state = vi.hoisted(() => ({ role: "user" as string }));
vi.mock("../src/features/auth/AuthContext", () => ({
  useAuth: () => ({
    session: { userId: "me", role: state.role, permissions: [] },
  }),
}));
vi.mock("../src/i18n/I18nProvider", () => ({
  useI18n: () => ({
    language: "en",
    t: (key: TranslationKey) => translations.en[key],
  }),
}));
vi.mock("../src/features/navigation/AppSidebar", () => ({
  AppSidebar: () => null,
}));
vi.mock("../src/features/works/worksApi", () => ({
  getMyWorks: vi.fn().mockResolvedValue({
    items: [{ work_id: "mine", title: "My painting" }],
    next_cursor: null,
  }),
}));
vi.mock("../src/features/exhibitions/exhibitionApi", () => ({
  listExhibitions: vi.fn(),
  getEligibleExhibitions: vi.fn(),
  getExhibition: vi.fn(),
  saveExhibition: vi.fn(),
  getSubmissions: vi.fn(),
  submitWork: vi.fn(),
  reviewSubmission: vi.fn(),
  blockParticipant: vi.fn(),
  unblockParticipant: vi.fn(),
  getBlocks: vi.fn(),
  uploadBanner: vi.fn(),
}));
const exhibition = {
  exhibition_id: "event",
  creator_user_id: "another",
  name: "Student exhibition",
  description: "Spring collection",
  event_at: "2026-12-10T12:00:00Z",
  participation_opens_at: "2026-10-01T12:00:00Z",
  participation_closes_at: "2026-12-01T12:00:00Z",
  banner_url: null,
  participation_open: true,
  created_at: "2026-10-01T12:00:00Z",
};
function view(path = "/en/exhibition/event") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/:language/exhibition/:exhibitionId?"
          element={<ExhibitionsPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  state.role = "user";
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  vi.mocked(api.getEligibleExhibitions).mockResolvedValue({ items: [exhibition], next_cursor: null });
  vi.mocked(api.getExhibition).mockResolvedValue(exhibition);
  vi.mocked(api.listExhibitions).mockResolvedValue({
    items: [exhibition],
    next_cursor: null,
  });
  vi.mocked(api.getSubmissions).mockResolvedValue({
    items: [],
    next_cursor: null,
  });
  vi.mocked(api.getBlocks).mockResolvedValue({ items: [], next_cursor: null });
  vi.mocked(api.submitWork).mockResolvedValue(undefined);
});
afterEach(cleanup);
afterEach(() => vi.restoreAllMocks());
it("uses an accessible arrow back control and one main exhibition title inside the card", async () => {
  const { container } = view();
  const title = await screen.findByRole("heading", { level: 1, name: "Student exhibition" });
  expect(title.closest(".exhibition-detail-card")).toBeTruthy();
  expect(container.querySelectorAll("h1")).toHaveLength(1);
  const back = screen.getByRole("link", { name: translations.en["exhibitions.back"] });
  expect(back.getAttribute("href")).toBe("/en/exhibition");
  expect(back.textContent).toBe("");
  expect(back.querySelector("svg")).toBeTruthy();
  expect(back.getAttribute("title")).toBe(translations.en["exhibitions.back"]);
});
it("assigns one profile work to an eligible exhibition and shows pending confirmation", async () => {
  render(<MemoryRouter><AssignExhibitionDialog workId="mine" onClose={vi.fn()}/></MemoryRouter>);
  fireEvent.click(await screen.findByRole("radio"));
  fireEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
  await waitFor(() => expect(api.submitWork).toHaveBeenCalledWith("event", "mine"));
  expect(api.getEligibleExhibitions).toHaveBeenCalledWith(0, "mine");
  expect(await screen.findByText("Your work was submitted and is pending review.")).toBeTruthy();
});
it("shows an empty eligible list and disables assignment", async () => {
  vi.mocked(api.getEligibleExhibitions).mockResolvedValue({ items: [], next_cursor: null });
  render(<MemoryRouter><AssignExhibitionDialog workId="mine" onClose={vi.fn()}/></MemoryRouter>);
  await screen.findByText(translations.en["exhibitions.noEligible"]);
  expect((screen.getByRole("button", { name: "Submit for approval" }) as HTMLButtonElement).disabled).toBe(true);
});
it("does not allow blocked or full exhibitions to offer an upload link", async () => {
  vi.mocked(api.getEligibleExhibitions).mockResolvedValue({ items: [], next_cursor: null });
  view();
  await screen.findByText("Spring collection");
  expect(screen.queryByRole("link", { name: "Participate" })).toBeNull();
  expect((screen.getByRole("button", { name: "Participate" }) as HTMLButtonElement).disabled).toBe(true);
});
it("loads approved and pending personal sections with independent status cursors", async () => {
  vi.mocked(api.getSubmissions).mockImplementation(async (_id, _scope, cursor = 0, status) => ({
    items: status === "pending" ? [{ submission_id: "pending", work_id: "work", user_id: "me", artist_name: "Me", title: "Pending painting", image_url: "/art.jpg", status: "pending", rejection_reason: null, created_at: "2026-10-18T12:00:00Z" }] : [],
    next_cursor: status === "pending" && cursor === 0 ? 20 : null,
  }));
  render(<MemoryRouter initialEntries={["/en/exhibition/event/submissions"]}><Routes><Route path="/:language/exhibition/:exhibitionId/submissions" element={<MyExhibitionSubmissionsPage/>}/></Routes></MemoryRouter>);
  const pending = await screen.findByRole("region", { name: "Pending works" });
  const back = screen.getByRole("link", { name: "Back to exhibition" });
  expect(back.getAttribute("href")).toBe("/en/exhibition/event");
  expect(back.textContent).toBe("");
  await within(pending).findByText("Pending painting");
  expect(api.getSubmissions).toHaveBeenCalledWith("event", "mine", 0, "approved");
  expect(api.getSubmissions).toHaveBeenCalledWith("event", "mine", 0, "pending");
  fireEvent.click(within(pending).getByRole("button", { name: "Load more" }));
  await waitFor(() => expect(api.getSubmissions).toHaveBeenCalledWith("event", "mine", 20, "pending"));
});
it("layers a decorative blurred banner behind the uncropped original", () => {
  const { container } = render(
    <MemoryRouter>
      <ExhibitionCard exhibition={{ ...exhibition, banner_url: "/banner.jpg" }} past={false} />
    </MemoryRouter>,
  );
  const blur = container.querySelector(".exhibition-banner-blur");
  const original = container.querySelector(".exhibition-banner-original");
  expect(blur?.getAttribute("src")).toBe("/banner.jpg");
  expect(blur?.getAttribute("aria-hidden")).toBe("true");
  expect(original?.getAttribute("src")).toBe("/banner.jpg");
  expect(container.querySelectorAll(".exhibition-card-media img")).toHaveLength(2);
});
it("keeps the fallback without blurred layers when no banner exists", () => {
  const { container } = render(
    <MemoryRouter><ExhibitionCard exhibition={exhibition} past={true} /></MemoryRouter>,
  );
  expect(container.querySelector(".exhibition-banner-fallback")).toBeTruthy();
  expect(container.querySelector(".exhibition-banner-blur")).toBeNull();
});
it("separates upcoming and past exhibitions with independent pagination", async () => {
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-18T12:00:00Z"));
  const previous = {
    ...exhibition,
    exhibition_id: "past",
    name: "Previous collection",
    event_at: "2026-09-01T12:00:00Z",
    participation_open: false,
  };
  vi.mocked(api.listExhibitions).mockImplementation(
    async (cursor = 0, period = "all") => ({
      items:
        period === "past" ? (cursor === 0 ? [previous] : []) : [exhibition],
      next_cursor: period === "past" && cursor === 0 ? 20 : null,
    }),
  );
  view("/en/exhibition");
  const upcoming = await screen.findByRole("region", {
    name: "Upcoming Exhibitions",
  });
  const past = screen.getByRole("region", { name: "Past Exhibitions" });
  expect(
    within(upcoming).getByRole("heading", { name: "Student exhibition" }),
  ).toBeTruthy();
  expect(within(upcoming).queryByText("Previous collection")).toBeNull();
  expect(
    within(past).getByRole("heading", { name: "Previous collection" }),
  ).toBeTruthy();
  expect(within(past).queryByRole("timer")).toBeNull();
  expect(within(upcoming).getByRole("timer")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Load more past exhibitions" }),
  );
  await waitFor(() =>
    expect(api.listExhibitions).toHaveBeenCalledWith(20, "past"),
  );
});
it("shows both empty sections when no exhibitions are available", async () => {
  vi.mocked(api.listExhibitions).mockResolvedValue({
    items: [],
    next_cursor: null,
  });
  view("/en/exhibition");
  expect(await screen.findByText("No upcoming exhibitions yet.")).toBeTruthy();
  expect(screen.getByText("No past exhibitions yet.")).toBeTruthy();
});
it("opens a single-work exhibition upload and links to my submissions from the toolbar", async () => {
  view();
  const participate = await screen.findByRole("link", { name: "Participate" });
  expect(participate.getAttribute("href")).toBe("/en/upload?exhibition=event");
  expect(participate.closest(".exhibition-toolbar")).toBeTruthy();
  expect(screen.getByRole("link", { name: "My submissions" }).getAttribute("href")).toBe("/en/exhibition/event/submissions");
  expect(screen.queryByRole("combobox")).toBeNull();
});
it("keeps exhibition details in the shared card and participation below it without a view action", async () => {
  vi.mocked(api.getExhibition).mockResolvedValue({ ...exhibition, banner_url: "/banner.jpg" });
  const { container } = view();
  await screen.findByText("Spring collection");
  const card = container.querySelector(".exhibition-detail-card") as HTMLElement;
  expect(card.tagName).toBe("SECTION");
  expect(card.querySelector(".exhibition-banner-original")?.getAttribute("src")).toBe("/banner.jpg");
  const content = card.querySelector(".exhibition-card-content") as HTMLElement;
  expect(within(content).getByText("Spring collection")).toBeTruthy();
  expect(within(content).getByRole("timer")).toBeTruthy();
  expect(content.querySelectorAll("dl dt")).toHaveLength(3);
  expect(within(content).queryByRole("button", { name: "Submit for approval" })).toBeNull();
  const participate = await screen.findByRole("link", { name: "Participate" });
  expect(participate.closest(".exhibition-detail-card")).toBeNull();
  expect(card.querySelector(".exhibition-card-link")).toBeNull();
  expect(container.querySelector(".exhibition-hero-banner")).toBeNull();
});
it("keeps the manager edit action without a plus in the blurred toolbar", async () => {
  state.role = "supervisor";
  const { container } = view();
  const edit = await screen.findByRole("button", { name: "Edit exhibition" });
  expect(edit.closest(".exhibition-card-content")).toBeNull();
  expect(edit.closest(".exhibition-toolbar")).toBeTruthy();
  expect(edit.querySelector(".lucide-plus")).toBeNull();
  expect(container.querySelectorAll(".exhibition-detail-card")).toHaveLength(1);
});
it("gives supervisors controls for an exhibition created by someone else", async () => {
  state.role = "supervisor";
  view();
  expect(
    await screen.findByRole("button", { name: "Edit exhibition" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Review submissions" }),
  ).toBeTruthy();
});
it("hides manager controls from students", async () => {
  view();
  await screen.findByText("Spring collection");
  expect(screen.queryByRole("button", { name: "Edit exhibition" })).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Review submissions" }),
  ).toBeNull();
});
it("prevents participation when the window is closed", async () => {
  vi.mocked(api.getExhibition).mockResolvedValue({
    ...exhibition,
    participation_open: false,
  });
  view();
  await screen.findByText("Spring collection");
  expect(
    (
      screen.getByRole("button", {
        name: "Participate",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});
it("requires a reason in the supervisor rejection dialog and sends the decision", async () => {
  state.role = "supervisor";
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  const entry = {
    submission_id: "submission",
    work_id: "work",
    user_id: "student",
    artist_name: "Student",
    title: "Painting",
    image_url: "/art.jpg",
    status: "pending",
    rejection_reason: null,
    created_at: "2026-10-18T12:00:00Z",
  };
  vi.mocked(api.getSubmissions).mockImplementation(async (_id, scope) => ({
    items: scope === "manage" ? [entry] : [],
    next_cursor: null,
  }));
  vi.mocked(api.reviewSubmission).mockResolvedValue(undefined);
  view();
  fireEvent.click(
    await screen.findByRole("button", { name: "Review submissions" }),
  );
  fireEvent.click(await screen.findByRole("button", { name: "Reject" }));
  expect(
    (screen.getByRole("button", { name: "Confirm" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.change(screen.getByRole("textbox", { name: "Reason (required)" }), {
    target: { value: "Please follow the exhibition theme." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await waitFor(() =>
    expect(api.reviewSubmission).toHaveBeenCalledWith(
      "event",
      "submission",
      "rejected",
      "Please follow the exhibition theme.",
    ),
  );
});
