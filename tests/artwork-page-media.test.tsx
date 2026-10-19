import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ArtworkPageMedia } from "../src/features/works/ArtworkPageMedia";

afterEach(cleanup);

it.each([
  ["portrait", 1200, 2400], ["landscape", 2400, 1200], ["square", 1200, 1200],
  ["panorama", 8000, 600], ["very-tall", 600, 8000],
] as const)("renders one untransformed %s image without popup framing", (shape, width, height) => {
  const { container } = render(<ArtworkPageMedia url={`/${shape}.png`} title={shape} mimeType="image/png" failureLabel="Unavailable" />);
  const image = screen.getByRole("img", { name: shape });
  Object.defineProperties(image, { naturalWidth: { value: width }, naturalHeight: { value: height } });
  fireEvent.load(image);
  expect(container.querySelectorAll("img")).toHaveLength(1);
  expect(image.className).toBe("artwork-page-media-original");
  expect(image.style.transform).toBe("");
  expect(container.querySelector(".artwork-modal-media,.artwork-media-backdrop")).toBeNull();
  expect(image.getAttribute("draggable")).toBe("false");
  expect(fireEvent.contextMenu(image)).toBe(false);
  expect(fireEvent.dragStart(image)).toBe(false);
});

it("preserves localized failure text and recovers immediately when navigating to another source", () => {
  const { rerender } = render(<ArtworkPageMedia url="/broken.png" title="Broken" mimeType="image/png" failureLabel="Unavailable" />);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByRole("status").textContent).toBe("Unavailable");
  rerender(<ArtworkPageMedia url="/next.png" title="Next" mimeType="image/png" failureLabel="Unavailable" />);
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("img", { name: "Next" }).getAttribute("src")).toBe("/next.png");
});

it("retains video controls, inline playback and metadata-only preloading", () => {
  const { container } = render(<ArtworkPageMedia url="/clip.mp4" title="Clip" mimeType="video/mp4" failureLabel="Unavailable" />);
  const video = container.querySelector("video")!;
  expect(video.controls).toBe(true);
  expect(video.playsInline).toBe(true);
  expect(video.preload).toBe("metadata");
  expect(video.getAttribute("aria-label")).toBe("Clip");
  fireEvent.error(video);
  expect(screen.getByRole("status").textContent).toBe("Unavailable");
});
