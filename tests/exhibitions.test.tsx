import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ExhibitionsPage } from "../src/features/exhibitions/ExhibitionsPage";
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
  getMyWorks: vi
    .fn()
    .mockResolvedValue({
      items: [{ work_id: "mine", title: "My painting" }],
      next_cursor: null,
    }),
}));
vi.mock("../src/features/exhibitions/exhibitionApi", () => ({
  listExhibitions: vi.fn(),
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
it("submits an owned selected work and shows pending confirmation", async () => {
  view();
  await screen.findByText("My painting");
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "mine" } });
  fireEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
  await waitFor(() =>
    expect(api.submitWork).toHaveBeenCalledWith("event", "mine"),
  );
  expect(await screen.findByRole("status")).toBeTruthy();
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
  await screen.findByText("My painting");
  expect(
    (
      screen.getByRole("button", {
        name: "Submit for approval",
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
