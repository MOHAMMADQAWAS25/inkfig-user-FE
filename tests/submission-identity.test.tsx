import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SubmissionArtist, SubmissionThumbnail } from "../src/features/exhibitions/SubmissionIdentity";
afterEach(cleanup);
it.each([[400,200,true],[200,400,true],[200,200,false]])("blurs only spare thumbnail margins for %sx%s",(width,height,gaps)=>{
  const {container}=render(<SubmissionThumbnail url="/art.png"/>);
  const image=container.querySelector<HTMLImageElement>(".record-thumbnail-original")!;
  Object.defineProperties(image,{naturalWidth:{value:width},naturalHeight:{value:height}});
  fireEvent.load(image);
  expect(Boolean(container.querySelector(".record-thumbnail-blur"))).toBe(gaps);
  fireEvent.error(image);
  expect(container.querySelector("img")).toBeNull();
});
it("shows the real artist avatar with an initial fallback and no hover dependency",()=>{
  const {container,rerender}=render(<SubmissionArtist name="Artist" avatar="/avatar.png" language="en"/>);
  expect(container.textContent).toBe("Artist");
  fireEvent.error(container.querySelector("img")!);
  expect(container.querySelector(".submission-artist-initial")?.textContent).toBe("A");
  rerender(<SubmissionArtist name="Artist" avatar="/next.png" language="en"/>);
  expect(container.querySelector("img")?.getAttribute("src")).toBe("/next.png");
});
