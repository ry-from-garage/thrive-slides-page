/**
 * marimekko.js — variable-width 100% stacked bar (Mekko chart)
 *
 * marimekko({ columns, w, h })
 *   columns — array of { label, segments: [{ label, value }] }
 *   w, h    — SVG canvas size
 *
 * Column widths ∝ column totals.
 * Each column is 100% filled — segment heights ∝ within-column share.
 *
 * Pure helpers exported:
 *   columnWidths(totals, plotW) → array of pixel widths summing to plotW ±0.5
 *   segmentHeights(values, plotH) → array of pixel heights summing to plotH ±0.5
 */

const PAD_TOP = 8;
const PAD_BOTTOM = 40;
const PAD_LEFT = 4;
const PAD_RIGHT = 4;
const COL_GAP = 3;

const SERIES_CLASSES = [
  'ts-chart-series-1',
  'ts-chart-series-2',
  'ts-chart-series-3',
  'ts-chart-pos',
  'ts-chart-neg',
];

/**
 * Pure helper: distribute plotW pixels proportionally among totals.
 * Adjusts last column to absorb rounding so sum == plotW exactly.
 */
export function columnWidths(totals, plotW) {
  const grand = totals.reduce((s, t) => s + Math.abs(t), 0);
  if (grand === 0) return totals.map(() => 0);
  const raw = totals.map(t => Math.abs(t) / grand * plotW);
  const sum = raw.reduce((s, v) => s + v, 0);
  raw[raw.length - 1] += plotW - sum;
  return raw;
}

/**
 * Pure helper: distribute plotH pixels proportionally among values within a column.
 * Adjusts last segment to absorb rounding so sum == plotH exactly.
 */
export function segmentHeights(values, plotH) {
  const total = values.reduce((s, v) => s + Math.abs(v), 0);
  if (total === 0) return values.map(() => 0);
  const raw = values.map(v => Math.abs(v) / total * plotH);
  const sum = raw.reduce((s, v) => s + v, 0);
  raw[raw.length - 1] += plotH - sum;
  return raw;
}

export function marimekko({ columns = [], w = 400, h = 300 }) {
  const nCols = columns.length;
  if (nCols === 0) return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" data-region xmlns="http://www.w3.org/2000/svg"></svg>`;

  const totalGap = COL_GAP * (nCols - 1);
  const plotX = PAD_LEFT;
  const plotY = PAD_TOP;
  const plotW = w - PAD_LEFT - PAD_RIGHT - totalGap;
  const plotH = h - PAD_TOP - PAD_BOTTOM;

  const totals = columns.map(col =>
    (col.segments ?? []).reduce((s, seg) => s + Math.abs(seg.value ?? 0), 0),
  );
  const widths = columnWidths(totals, plotW);

  let rects = '';
  let xLabels = '';

  let cx = plotX;
  for (let ci = 0; ci < nCols; ci++) {
    const col = columns[ci];
    const cw = widths[ci];
    const segs = col.segments ?? [];
    const segVals = segs.map(s => s.value ?? 0);
    const heights = segmentHeights(segVals, plotH);

    // Draw segments top-to-bottom
    let sy = plotY;
    for (let si = 0; si < segs.length; si++) {
      const sh = heights[si];
      const cls = SERIES_CLASSES[si % SERIES_CLASSES.length];
      rects += `<rect class="${cls}" x="${r(cx)}" y="${r(sy)}" width="${r(cw)}" height="${r(sh)}"/>`;
      sy += sh;
    }

    // Column label
    const labelX = cx + cw / 2;
    xLabels += `<text class="ts-chart-axis-label" x="${r(labelX)}" y="${r(plotY + plotH + 16)}" text-anchor="middle">${escXml(col.label ?? '')}</text>`;

    cx += cw + COL_GAP;
  }

  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" data-region xmlns="http://www.w3.org/2000/svg">
  ${rects}
  ${xLabels}
</svg>`;
}

function r(n) { return Math.round(n * 100) / 100; }
function escXml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
