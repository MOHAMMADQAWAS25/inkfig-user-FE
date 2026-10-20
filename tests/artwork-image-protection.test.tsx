import React from "react";
import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LazyImage } from "../src/features/feed/LazyImage";
import { ArtworkMedia } from "../src/features/home/ArtworkMedia";
import { SubmissionArtist, SubmissionThumbnail } from "../src/features/exhibitions/SubmissionIdentity";
import type { FeedWork } from "../src/features/works/worksApi";

afterEach(cleanup);

function expectProtected(image: HTMLImageElement) {
  expect(image.draggable).toBe(false);
  expect(fireEvent.contextMenu(image)).toBe(false);
  expect(fireEvent.dragStart(image)).toBe(false);
}

it("prevents artwork image context menus and dragging without blocking card clicks", () => {
  const open = vi.fn();
  render(<button onClick={open}><LazyImage work={{ title: "Artwork", image_url: "/art.png" } as FeedWork} width={300} failureLabel="Failed" /></button>);
  const image = screen.getByRole("img") as HTMLImageElement;
  expectProtected(image);
  fireEvent.click(image);
  expect(open).toHaveBeenCalledOnce();
  expect(image.getAttribute("loading")).toBe("lazy");
});

it("protects enlarged artwork images but leaves video controls and events unchanged", () => {
  const view = render(<ArtworkMedia url="/art.png" title="Artwork" mimeType="image/png" readOnly={false} failureLabel="Failed" />);
  expectProtected(screen.getByRole("img") as HTMLImageElement);
  view.rerender(<ArtworkMedia url="/art.mp4" title="Video" mimeType="video/mp4" readOnly={false} failureLabel="Failed" />);
  const video = view.container.querySelector("video")!;
  expect(video.controls).toBe(true);
  expect(fireEvent.contextMenu(video)).toBe(true);
});

it("protects exhibition artwork thumbnails and their blur layers, not creator avatars", () => {
  const view = render(<><SubmissionThumbnail url="/art.png" /><SubmissionArtist name="Artist" avatar="/avatar.png" language="en" /></>);
  const image = view.container.querySelector<HTMLImageElement>(".record-thumbnail-original")!;
  Object.defineProperties(image, { naturalWidth: { value: 400 }, naturalHeight: { value: 200 } });
  fireEvent.load(image);
  expectProtected(image);
  expectProtected(view.container.querySelector<HTMLImageElement>(".record-thumbnail-blur")!);
  const avatar = view.container.querySelector<HTMLImageElement>(".exhibition-record-artist img")!;
  expect(fireEvent.contextMenu(avatar)).toBe(true);
  expect(fireEvent.dragStart(avatar)).toBe(true);
});

it("covers profile, exhibition and moderation artwork while excluding local upload previews", () => {
  const source = (path: string) => readFileSync(`src/features/${path}`, "utf8");
  const profile = source("profile/ProfilePage.tsx");
  expect(profile).toContain('<img {...artworkImageProtection} className="artwork-image"');
  expect(profile).toContain('<img {...artworkImageProtection} src={editing.image_url}');
  expect(source("exhibitions/ExhibitionArtworkCard.tsx")).toContain('<img {...artworkImageProtection}');
  const admin = source("admin/AdminReportsPage.tsx");
  expect(admin).toContain('item.target_type === "work" ? artworkImageProtection : {}');
  expect(admin).toContain('<img {...artworkImageProtection} className="moderation-preview"');
  expect(source("works/UploadWorkPage.tsx")).not.toContain("artworkImageProtection");
});
