import type { SyntheticEvent } from "react";

// A lightweight interaction deterrent, not download or screenshot protection.
const preventArtworkImageDefault = (event: SyntheticEvent<HTMLImageElement>) => event.preventDefault();

export const artworkImageProtection = {
  draggable: false,
  onContextMenu: preventArtworkImageDefault,
  onDragStart: preventArtworkImageDefault,
} as const;
