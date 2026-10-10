export type LayoutItem = { work_id: string; media?: { width: number; height: number } | null };
export type Position = { id: string; index: number; x: number; y: number; width: number; height: number; column: number };
export type LayoutResult = { positions: Position[]; columns: Position[][]; height: number };

export function columnCount(width: number): number {
  if (width < 600) return width < 240 ? 1 : 2;
  return Math.max(3, Math.min(6, Math.floor((width + 18) / 238)));
}

export function imageRatio(item: LayoutItem): number {
  const width = item.media?.width ?? 1, height = item.media?.height ?? 1;
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 ? height / width : 1;
}

/** Incremental placement: appends do not move an existing card. */
export class FeedLayout {
  private signature = "";
  private ratios: number[] = [];
  private result: LayoutResult = { positions: [], columns: [], height: 0 };
  compute(items: LayoutItem[], width: number, layout: "list" | "masonry", rtl = false, maxListWidth = 470): LayoutResult {
    const count = layout === "list" ? 1 : columnCount(width);
    const gap = width < 600 ? 12 : 18;
    const cardWidth = layout === "list" ? Math.min(maxListWidth, width) : Math.max(1, (width - gap * (count - 1)) / count);
    const signature = `${width}:${count}:${rtl}:${layout}:${maxListWidth}`;
    const unchanged = this.signature === signature && this.result.positions.length <= items.length &&
      this.result.positions.every((position, i) => position.id === items[i].work_id && this.ratios[i] === imageRatio(items[i]));
    const positions = unchanged ? [...this.result.positions] : [];
    const columns = unchanged ? this.result.columns.map(column => [...column]) : Array.from({ length: count }, () => [] as Position[]);
    const heights = columns.map(column => column.length ? column[column.length - 1].y + column[column.length - 1].height + gap : 0);
    for (let index = positions.length; index < items.length; index++) {
      const shortest = heights.indexOf(Math.min(...heights));
      const height = cardWidth * imageRatio(items[index]);
      const x = layout === "list" ? (width - cardWidth) / 2 : (rtl ? count - 1 - shortest : shortest) * (cardWidth + gap);
      const position = { id: items[index].work_id, index, x, y: heights[shortest], width: cardWidth, height, column: shortest };
      positions.push(position); columns[shortest].push(position); heights[shortest] += height + gap;
    }
    this.signature = signature;
    this.ratios = items.map(imageRatio);
    return this.result = { positions, columns, height: Math.max(0, ...heights) - (positions.length ? gap : 0) };
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
