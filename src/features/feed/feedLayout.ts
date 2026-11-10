export type LayoutItem = { work_id: string; media?: { width: number; height: number } | null };
export type Position = { id: string; index: number; x: number; y: number; width: number; height: number; column: number };
export type FeaturedBlock = { height: number; minWidth?: number };
export type FeaturedPosition = { x: number; width: number; height: number; span: number; fullWidth: boolean };
export type LayoutResult = { positions: Position[]; columns: Position[][]; height: number; featured?: FeaturedPosition };
// Keep the visible creator/like footer outside the image's natural aspect ratio.
export const CREATOR_ROW_HEIGHT = 44;

export function columnCount(width: number, expanded = false): number {
  if (width < 600) return width < 240 ? 1 : 2;
  const count = Math.max(3, Math.floor((width + 18) / 238));
  return expanded ? count : Math.min(6, count);
}

export function imageRatio(item: LayoutItem): number {
  const width = item.media?.width ?? 1, height = item.media?.height ?? 1;
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 ? height / width : 1;
}

/** Reserve a multi-column detail block; narrow layouts put recommendations below it. */
export function featuredPosition(width: number, count: number, gap: number, rtl: boolean, block: FeaturedBlock): FeaturedPosition {
  const cardWidth = Math.max(1, (width - gap * (count - 1)) / count);
  // Keep details readable rather than letting them consume every extra column
  // revealed by desktop zoom-out. Recommendations use all remaining space.
  const readableSpan = Math.max(1, Math.floor((1280 + gap) / (cardWidth + gap)));
  let span = width < 1000 ? count : Math.max(1, Math.min(count - 2, readableSpan));
  while (span < count && span * cardWidth + (span - 1) * gap < (block.minWidth ?? 720)) span++;
  const blockWidth = span * cardWidth + (span - 1) * gap;
  return { x: rtl ? Math.max(0, width - blockWidth) : 0, width: blockWidth, height: Math.max(0, block.height), span, fullWidth: span === count };
}

/** Incremental placement: appends do not move an existing card. */
export class FeedLayout {
  private signature = "";
  private ratios: number[] = [];
  private result: LayoutResult = { positions: [], columns: [], height: 0 };
  compute(items: LayoutItem[], width: number, layout: "list" | "masonry", rtl = false, maxListWidth = 470, footerHeight = 0, featured?: FeaturedBlock): LayoutResult {
    const count = layout === "list" ? 1 : columnCount(width, Boolean(featured));
    const gap = width < 600 ? 12 : 18;
    const cardWidth = layout === "list" ? Math.min(maxListWidth, width) : Math.max(1, (width - gap * (count - 1)) / count);
    const block = featured ? featuredPosition(width, count, gap, rtl, featured) : undefined;
    const signature = `${width}:${count}:${rtl}:${layout}:${maxListWidth}:${footerHeight}:${block ? `${block.span}:${block.height}` : ""}`;
    const unchanged = this.signature === signature && this.result.positions.length <= items.length &&
      this.result.positions.every((position, i) => position.id === items[i].work_id && this.ratios[i] === imageRatio(items[i]));
    const positions = unchanged ? [...this.result.positions] : [];
    const columns = unchanged ? this.result.columns.map(column => [...column]) : Array.from({ length: count }, () => [] as Position[]);
    const heights = columns.map((column, index) => Math.max(
      column.length ? column[column.length - 1].y + column[column.length - 1].height + gap : 0,
      block && index < block.span ? block.height + gap : 0,
    ));
    for (let index = positions.length; index < items.length; index++) {
      const shortest = heights.indexOf(Math.min(...heights));
      const height = cardWidth * imageRatio(items[index]) + footerHeight;
      const x = layout === "list" ? (width - cardWidth) / 2 : (rtl ? count - 1 - shortest : shortest) * (cardWidth + gap);
      const position = { id: items[index].work_id, index, x, y: heights[shortest], width: cardWidth, height, column: shortest };
      positions.push(position); columns[shortest].push(position); heights[shortest] += height + gap;
    }
    this.signature = signature;
    this.ratios = items.map(imageRatio);
    return this.result = { positions, columns, height: Math.max(block?.height ?? 0, Math.max(0, ...heights) - (positions.length || block ? gap : 0)), ...(block ? { featured: block } : {}) };
  }
}

/** Binary-search each ordered column; work per frame depends on visible cards, not feed length. */
export function visiblePositions(layout: LayoutResult, top: number, bottom: number): Position[] {
  const visible: Position[] = [];
  for (const column of layout.columns) {
    let low = 0, high = column.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (column[middle].y + column[middle].height < top) low = middle + 1;
      else high = middle;
    }
    for (let i = low; i < column.length && column[i].y <= bottom; i++) visible.push(column[i]);
  }
  return visible.sort((a, b) => a.index - b.index);
}
