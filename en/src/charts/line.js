/**
 * line.js — line chart (polyline per series) with axes and points
 *
 * line({ series, w, h, labels })
 *   series  — array of { name, values[] }
 *   w, h    — SVG canvas size
 *   labels  — x-axis labels (length == values.length)
 */

const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 40;

const SERIES_CLASSES = [
  'ts-chart-series-1',
  'ts-chart-series-2',
  'ts-chart-series-3',
];

export function line({ series = [], w = 400, h = 300, labels = [] }) {
  const seriesArr = Array.isArray(series) ? series : [series];
  const nCats = seriesArr[0]?.values?.length ?? 0;

  const plotX = PAD_LEFT;
  const plotY = PAD_TOP;
  const plotW = w - PAD_LEFT - PAD_RIGHT;
  const plotH = h - PAD_TOP - PAD_BOTTOM;
  const baseline = plotY + plotH;

  const allVals = seriesArr.flatMap(s => s.values ?? []);
  const minVal = Math.min(...allVals, 0);
  const maxVal = Math.max(...allVals, 0);
  const range = maxVal - minVal || 1;

  function xOf(i) { return plotX + (nCats <= 1 ? plotW / 2 : i / (nCats - 1) * plotW); }
  function yOf(v) { return baseline - (v - minVal) / range * plotH; }

  let polylines = '';
  let points = '';

  for (let si = 0; si < seriesArr.length; si++) {
    const vals = seriesArr[si]?.values ?? [];
    const cls = SERIES_CLASSES[si % SERIES_CLASSES.length];
    const pts = vals.map((v, i) => `${r(xOf(i))},${r(yOf(v))}`).join(' ');
    polylines += `<polyline class="${cls} ts-chart-line" points="${pts}" fill="none"/>`;
    for (let i = 0; i < vals.length; i++) {
      points += `<circle class="${cls} ts-chart-dot" cx="${r(xOf(i))}" cy="${r(yOf(vals[i]))}" r="3"/>`;
    }
  }

  let xLabels = '';
  for (let i = 0; i < nCats; i++) {
    const lbl = labels[i] ?? '';
    xLabels += `<text class="ts-chart-axis-label" x="${r(xOf(i))}" y="${r(baseline + 16)}" text-anchor="middle">${escXml(lbl)}</text>`;
  }

  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" data-region xmlns="http://www.w3.org/2000/svg">
  <line class="ts-chart-axis" x1="${r(plotX)}" y1="${r(baseline)}" x2="${r(plotX + plotW)}" y2="${r(baseline)}"/>
  ${polylines}
  ${points}
  ${xLabels}
</svg>`;
}

function r(n) { return Math.round(n * 100) / 100; }
function escXml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
