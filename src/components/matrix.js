/**
 * matrix.js — 2×2 matrix / quadrant diagram
 *
 * Layout: positioned .ts-region at safe area x=72..1208, default top=120.
 * Axis labels on outer edges; 4 quadrant cells fill the interior.
 *
 * @param {{ axisX, axisY, quadrants, top, height }} opts
 *   axisX: { low, high }  — bottom-left and bottom-right labels
 *   axisY: { low, high }  — bottom and top labels (left edge)
 *   quadrants: [{label, items}] × 4  — TL, TR, BL, BR order
 * @returns {string} positioned HTML
 */
export function matrix2x2({
  axisX = { low: '', high: '' },
  axisY = { low: '', high: '' },
  quadrants = [],
  top = 120,
  height = 520,
  left = 72,
  width = 1136,
} = {}) {
  const AXIS_W = 32;   // width of Y-axis label strip
  const AXIS_H = 28;   // height of X-axis label strip
  const SEP = 4;       // gap between axis strip and grid

  const gridLeft = left + AXIS_W + SEP;
  const gridTop = top + 4;
  const gridW = width - AXIS_W - SEP;
  const gridH = height - AXIS_H - SEP - 4;
  const cellW = gridW / 2;
  const cellH = gridH / 2;

  // quadrant cells: TL(0), TR(1), BL(2), BR(3)
  const positions = [
    { col: 0, row: 0 }, // TL
    { col: 1, row: 0 }, // TR
    { col: 0, row: 1 }, // BL
    { col: 1, row: 1 }, // BR
  ];

  const cellsHtml = positions.map((pos, i) => {
    const q = quadrants[i] ?? { label: '', items: [] };
    const cellLeft = gridLeft + pos.col * cellW;
    const cellTop = gridTop + pos.row * cellH;
    const border = `border:1px solid var(--muted);`;
    const itemsHtml = (q.items ?? []).map(item => `<div class="ts-matrix-item">${item}</div>`).join('');
    return `<div class="ts-region ts-matrix-cell" style="left:${cellLeft}px;top:${cellTop}px;width:${cellW}px;height:${cellH}px;${border}">
  <div class="ts-matrix-cell-label">${q.label}</div>
  ${itemsHtml}
</div>`;
  }).join('');

  // Y-axis label (rotated text via writing-mode or transform)
  const yHighTop = gridTop;
  const yLowTop = gridTop + gridH / 2;
  const yAxisHtml = `<div class="ts-region ts-matrix-axis-y-high" style="left:${left}px;top:${yHighTop}px;width:${AXIS_W}px;height:${gridH / 2}px;display:flex;align-items:center;justify-content:center;">
  <span style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:var(--caption);color:var(--muted);">${axisY.high}</span>
</div>
<div class="ts-region ts-matrix-axis-y-low" style="left:${left}px;top:${yLowTop}px;width:${AXIS_W}px;height:${gridH / 2}px;display:flex;align-items:center;justify-content:center;">
  <span style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:var(--caption);color:var(--muted);">${axisY.low}</span>
</div>`;

  // X-axis labels
  const xAxisTop = gridTop + gridH + SEP;
  const xAxisHtml = `<div class="ts-region ts-matrix-axis-x-low" style="left:${gridLeft}px;top:${xAxisTop}px;width:${cellW}px;height:${AXIS_H}px;display:flex;align-items:center;justify-content:center;">
  <span style="font-size:var(--caption);color:var(--muted);">${axisX.low}</span>
</div>
<div class="ts-region ts-matrix-axis-x-high" style="left:${gridLeft + cellW}px;top:${xAxisTop}px;width:${cellW}px;height:${AXIS_H}px;display:flex;align-items:center;justify-content:center;">
  <span style="font-size:var(--caption);color:var(--muted);">${axisX.high}</span>
</div>`;

  return cellsHtml + yAxisHtml + xAxisHtml;
}
