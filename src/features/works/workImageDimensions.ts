export const MIN_WORK_IMAGE_WIDTH = 200;
export const MIN_WORK_IMAGE_HEIGHT = 300;

export class WorkImageDimensionsError extends Error {
  constructor(public readonly issue: "too-small" | "invalid") {
    super(issue === "too-small"
      ? "Artwork images must be at least 200 pixels wide and 300 pixels tall."
      : "The image could not be read. Choose a valid image.");
  }
}

/** Decode actual dimensions before creating a draft or uploading to storage. */
export function validateWorkImageDimensions(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    const finish = (issue?: "too-small" | "invalid") => {
      window.clearTimeout(timer);
      image.onload = null; image.onerror = null;
      URL.revokeObjectURL(url);
      if (issue) reject(new WorkImageDimensionsError(issue)); else resolve();
    };
    const timer = window.setTimeout(() => finish("invalid"), 15_000);
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) finish("invalid");
      else finish(image.naturalWidth < MIN_WORK_IMAGE_WIDTH || image.naturalHeight < MIN_WORK_IMAGE_HEIGHT ? "too-small" : undefined);
    };
    image.onerror = () => finish("invalid");
    image.src = url;
  });
}
