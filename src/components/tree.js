/**
 * tree.js — hierarchical tree diagram (root box + child boxes with connectors)
 *
 * Simple structural version; detailed variants should be built in patterns.
 *
 * Layout: root box centered at top of region; children spread horizontally below.
 * Connector lines are SVG overlaid on the region.
 *
 * @param {{ root, levels, top, left, width, height }} opts
 *   root: string — root node label
 *   levels: string[][] — array of arrays of child labels per level
 *             (currently renders first level as children of root)
 * @returns {string} positioned HTML
 */
export function tree({
  root = '',
  levels = [],
  top = 120,
  left = 72,
  width = 1136,
  height = 480,
} = {}) {
  const BOX_W = 160;
  const BOX_H = 48;
  const ROOT_Y = 16;
  const CHILD_Y = ROOT_Y + BOX_H + 64;

  const rootX = left + (width - BOX_W) / 2;

  const rootHtml = `<div class="ts-region ts-tree-node ts-tree-root" style="left:${rootX}px;top:${top + ROOT_Y}px;width:${BOX_W}px;height:${BOX_H}px;display:flex;align-items:center;justify-content:center;">
  ${root}
</div>`;

  const children = levels[0] ?? [];
  const childCount = children.length;

  if (childCount === 0) {
    return `<div class="ts-region ts-tree" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px">${rootHtml}</div>`;
  }

  const childSpacing = width / childCount;
  let svgLines = '';
  let childNodesHtml = '';

  const rootCenterX = rootX - left + BOX_W / 2;
  const rootBottomY = ROOT_Y + BOX_H;

  children.forEach((child, i) => {
    const cx = i * childSpacing + (childSpacing - BOX_W) / 2;
    const childCenterX = cx + BOX_W / 2;
    const childTopY = CHILD_Y;

    svgLines += `<line x1="${rootCenterX}" y1="${rootBottomY}" x2="${childCenterX}" y2="${childTopY}" stroke="var(--muted)" stroke-width="1.5"/>`;

    childNodesHtml += `<div class="ts-region ts-tree-node ts-tree-child" style="left:${left + cx}px;top:${top + CHILD_Y}px;width:${BOX_W}px;height:${BOX_H}px;display:flex;align-items:center;justify-content:center;">
  ${child}
</div>`;
  });

  const svgHtml = `<svg class="ts-region ts-tree-connectors" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px" viewBox="0 0 ${width} ${height}" overflow="visible">
  ${svgLines}
</svg>`;

  return rootHtml + svgHtml + childNodesHtml;
}
