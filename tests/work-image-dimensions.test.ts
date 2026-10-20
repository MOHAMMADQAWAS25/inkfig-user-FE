import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { validateWorkImageDimensions, WorkImageDimensionsError } from "../src/features/works/workImageDimensions";
import { uploadWork } from "../src/features/works/worksApi";
import { requestJson } from "../src/api/httpClient";

vi.mock("../src/api/httpClient", () => ({ mainApiBaseUrl: "/api", requestJson: vi.fn() }));
let current: HTMLImageElement;
beforeEach(() => {
  vi.stubGlobal("Image", class {
    naturalWidth = 200; naturalHeight = 300;
    onload: (() => void) | null = null; onerror: (() => void) | null = null;
    src = "";
    constructor() { current = this as unknown as HTMLImageElement; }
  });
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:dimensions") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  vi.clearAllMocks();
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const file = () => new File(["image"], "work.png", { type: "image/png" });

it.each([[200,300], [201,301], [500,300]])("accepts %i × %i including the exact minimum", async (width,height) => {
  const result = validateWorkImageDimensions(file());
  Object.assign(current, { naturalWidth: width, naturalHeight: height }); current.onload?.(new Event("load"));
  await expect(result).resolves.toBeUndefined();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:dimensions");
});

it.each([[199,300], [200,299], [300,200], [1000,299]])("rejects %i × %i without silently swapping dimensions", async (width,height) => {
  const result = validateWorkImageDimensions(file());
  Object.assign(current, { naturalWidth: width, naturalHeight: height }); current.onload?.(new Event("load"));
  await expect(result).rejects.toMatchObject({ issue: "too-small" });
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
});

it("rejects an unreadable image and releases its URL", async () => {
  const result = validateWorkImageDimensions(file()); current.onerror?.(new Event("error"));
  await expect(result).rejects.toBeInstanceOf(WorkImageDimensionsError);
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
});

it("times out instead of leaving upload busy indefinitely", async () => {
  vi.useFakeTimers(); const result = validateWorkImageDimensions(file());
  const rejected = expect(result).rejects.toMatchObject({ issue: "invalid" });
  await vi.advanceTimersByTimeAsync(15_000); await rejected;
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
});

it("rejects undersized images before creating any backend draft", async () => {
  const result = uploadWork({ typeId:"type", title:"Test", description:"", links:[], file:file() });
  Object.assign(current, { naturalWidth:199 }); current.onload?.(new Event("load"));
  await expect(result).rejects.toMatchObject({ issue:"too-small" });
  expect(requestJson).not.toHaveBeenCalled();
});
