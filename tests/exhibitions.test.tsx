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
import { MyExhibitionSubmissionsPage, ReviewExhibitionSubmissionsPage } from "../src/features/exhibitions/MyExhibitionSubmissionsPage";
import { ExhibitionCard } from "../src/features/exhibitions/ExhibitionCard";
import { ExhibitionNavbar } from "../src/features/exhibitions/ExhibitionNavbar";
import { getWork } from "../src/features/works/worksApi";
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
  getWork: vi.fn(), setWorkLike: vi.fn(), setWorkSave: vi.fn(),
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
  withdrawSubmission: vi.fn(), reviewWithdrawal: vi.fn(),
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
        <Route path="/:language/exhibition/:exhibitionId/review" element={<ReviewExhibitionSubmissionsPage/>}/>
      </Routes>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  state.role = "user";
  vi.mocked(getWork).mockResolvedValue({ work_id: "work", title: "Painting", owner_user_id: "me", artist_name: "Me", description: "Artwork detail", image_url: "/art.jpg", mime_type: "image/jpeg", links: [], created_at: "2026-10-18T12:00:00Z", like_count: 0, liked_by_me: false, saved_by_me: false, type_id: "art", type_name_en: "Art", type_name_ar: "Art" });
  vi.mocked(api.withdrawSubmission).mockResolvedValue(undefined);
  vi.mocked(api.reviewWithdrawal).mockResolvedValue(undefined);
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
it("keeps the fixed navbar aligned with its container and reserves wrapped height on resize", () => {
  let width = 1000, height = 68;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function(this: HTMLElement) {
    return { left: 180, width, height: this.classList.contains("exhibition-toolbar") ? height : 76 } as DOMRect;
  });
  const { container } = render(<ExhibitionNavbar label="Actions"><button>Action</button></ExhibitionNavbar>);
  const nav = screen.getByRole("navigation", { name: "Actions" });
  expect(nav.style.left).toBe("180px");
  expect(nav.style.width).toBe("1000px");
  expect((container.querySelector(".exhibition-toolbar-slot") as HTMLElement).style.height).toBe("68px");
  width = 600; height = 120;
  fireEvent.resize(window);
  expect(nav.style.width).toBe("600px");
  expect((container.querySelector(".exhibition-toolbar-slot") as HTMLElement).style.height).toBe("120px");
});
it("shows nothing below the exhibition card before its scheduled start", async () => {
  const { container } = view();
  await screen.findByText("Spring collection");
  expect(container.querySelector(".exhibition-public-works")).toBeNull();
  expect(screen.queryByText("No works in this section yet.")).toBeNull();
  expect(api.getSubmissions).not.toHaveBeenCalled();
});
function personalView() {
  return render(<MemoryRouter initialEntries={["/en/exhibition/event/submissions"]}><Routes><Route path="/:language/exhibition/:exhibitionId/submissions" element={<MyExhibitionSubmissionsPage/>}/></Routes></MemoryRouter>);
}
const record = { submission_id: "entry", work_id: "work", user_id: "me", artist_name: "Me", title: "Painting", image_url: "/art.jpg", status: "pending", rejection_reason: null, created_at: "2026-10-18T12:00:00Z" };
it("deletes a pending membership only after confirmation", async () => {
  vi.mocked(api.getSubmissions).mockResolvedValue({ items: [record], next_cursor: null });
  personalView();
  fireEvent.click(await screen.findByRole("button", { name: "Delete submission" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await waitFor(() => expect(api.withdrawSubmission).toHaveBeenCalledWith("event", "entry", undefined));
});
it("requires a reason to request deletion of approved membership", async () => {
  vi.mocked(api.getSubmissions).mockResolvedValue({ items: [{ ...record, status: "approved" }], next_cursor: null });
  personalView();
  fireEvent.click(await screen.findByRole("button", { name: "Request deletion" }));
  expect((screen.getByRole("button", { name: "Confirm" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByRole("textbox", { name: "Reason (required)" }), { target: { value: "I want to replace this work" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await waitFor(() => expect(api.withdrawSubmission).toHaveBeenCalledWith("event", "entry", "I want to replace this work"));
});
it("opens the full artwork card and displays the rejection reason", async () => {
  vi.mocked(api.getSubmissions).mockResolvedValue({ items: [{ ...record, status: "rejected", rejection_reason: "Does not match the theme" }], next_cursor: null });
  personalView();
  fireEvent.click(await screen.findByRole("button", { name: `${translations.en["works.viewDetails"]}: Painting` }));
  const modal = await screen.findByRole("dialog", { name: "Painting" });
  expect(within(modal).getByText("Does not match the theme")).toBeTruthy();
  expect(within(modal).getByText("Artwork detail")).toBeTruthy();
});
it("lets managers approve a pending deletion request from the record list", async () => {
  state.role = "supervisor";
  vi.mocked(api.getSubmissions).mockResolvedValue({ items: [{ ...record, status: "approved", withdrawal_status: "pending", withdrawal_reason: "Replace this work" }], next_cursor: null });
  render(<MemoryRouter initialEntries={["/en/exhibition/event/review"]}><Routes><Route path="/:language/exhibition/:exhibitionId/review" element={<ReviewExhibitionSubmissionsPage/>}/></Routes></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button", { name: "Approve deletion" }));
  expect(screen.getByText("Replace this work")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await waitFor(() => expect(api.reviewWithdrawal).toHaveBeenCalledWith("event", "entry", "approved", undefined));
});
it("opens the manager preview on the same page with only a close button and no social or navigation options", async () => {
  state.role = "admin";
  vi.mocked(api.getSubmissions).mockResolvedValue({ items: [{ ...record, status: "rejected", rejection_reason: "Please follow the theme" }], next_cursor: null });
  const { container } = render(<MemoryRouter initialEntries={["/en/exhibition/event/review"]}><Routes><Route path="/:language/exhibition/:exhibitionId/review" element={<ReviewExhibitionSubmissionsPage/>}/></Routes></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button", { name: `${translations.en["works.viewDetails"]}: Painting` }));
  const modal = await screen.findByRole("dialog", { name: "Painting" });
  expect(within(modal).getByText("Please follow the theme")).toBeTruthy();
  expect(modal.querySelector(".artwork-modal-actions")).toBeNull();
  expect(within(modal).queryAllByRole("link")).toHaveLength(0);
  expect(within(modal).getAllByRole("button")).toHaveLength(1);
  expect(within(modal).getByRole("button", { name: translations.en["works.closeDetails"] })).toBeTruthy();
  expect(container.querySelector(".exhibition-record-list")).toBeTruthy();
});
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
it("filters one personal record list with server-side status pagination", async () => {
  vi.mocked(api.getSubmissions).mockImplementation(async (_id, _scope, cursor = 0, status) => ({
    items: status === "pending" ? [{ submission_id: "pending", work_id: "work", user_id: "me", artist_name: "Me", title: "Pending painting", image_url: "/art.jpg", status: "pending", rejection_reason: null, created_at: "2026-10-18T12:00:00Z" }] : [],
    next_cursor: status === "pending" && cursor === 0 ? 20 : null,
  }));
  render(<MemoryRouter initialEntries={["/en/exhibition/event/submissions"]}><Routes><Route path="/:language/exhibition/:exhibitionId/submissions" element={<MyExhibitionSubmissionsPage/>}/></Routes></MemoryRouter>);
  await screen.findByRole("combobox", { name: "Status" });
  fireEvent.change(screen.getByRole("combobox", { name: "Status" }), { target: { value: "pending" } });
  const pending = await screen.findByRole("region", { name: "My submissions" });
  const back = screen.getByRole("link", { name: "Back to exhibition" });
  expect(back.getAttribute("href")).toBe("/en/exhibition/event");
  expect(back.textContent).toBe("");
  await within(pending).findByText("Pending painting");
  expect(api.getSubmissions).toHaveBeenCalledWith("event", "mine", 0, undefined);
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
    screen.getByRole("link", { name: "Review submissions" }),
  ).toBeTruthy();
});
it("hides manager controls from students", async () => {
  view();
  await screen.findByText("Spring collection");
  expect(screen.queryByRole("button", { name: "Edit exhibition" })).toBeNull();
  expect(
    screen.queryByRole("link", { name: "Review submissions" }),
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
    await screen.findByRole("link", { name: "Review submissions" }),
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
