/**
 * bar.js — vertical bar chart (single or grouped series)
 *
 * bar({ series, w, h, labels, valueLabels })
 *   series      — array of { name, values[] } or a single { values[] }
 *   w, h        — SVG canvas size
 *   labels      — category labels (x-axis), length == values.length
 *   valueLabels — if true, render value text above each bar
 */

const PAD_LEFT = 0;
const PAD_RIGHT = 20;
const PAD_TOP = 16;
const PAD_BOTTOM = 40; // room for x-axis labels

/**
 * Pure helper: compute bar heights given values and plot height.
 * Returns array of { value, height } normalised to plotH.
 */
export function barHeights(values, plotH) {
  const maxVal = Math.max(...values.map(Math.abs), 0);
  if (maxVal === 0) return values.map(v => ({ value: v, height: 0 }));
  return values.map(v => ({
    value: v,
    height: Math.abs(v) / maxVal * plotH,
  }));
}

const SERIES_CLASSES = [
  'ts-chart-series-1',
  'ts-chart-series-2',
  'ts-chart-series-3',
];

export function bar({ series = [], w = 400, h = 300, labels = [], valueLabels = false }) {
  // Normalise to array of series
  const seriesArr = Array.isArray(series) ? series : [series];
  const nSeries = seriesArr.length;
  const nCats = seriesArr[0]?.values?.length ?? 0;

  const plotX = PAD_LEFT;
  const plotY = PAD_TOP;
  const plotW = w - PAD_LEFT - PAD_RIGHT;
  const plotH = h - PAD_TOP - PAD_BOTTOM;
  const baseline = plotY + plotH;

  // Find global max
  const allVals = seriesArr.flatMap(s => s.values ?? []).map(Math.abs);
  const maxVal = Math.max(...allVals, 0);

  const groupW = nCats > 0 ? plotW / nCats : plotW;
  const barGap = 4;
  const barW = nCats > 0
    ? Math.max(2, (groupW - barGap * (nSeries + 1)) / nSeries)
    : groupW;

  let bars = '';
  let xLabels = '';
  let vLabels = '';

  for (let ci = 0; ci < nCats; ci++) {
    const groupX = plotX + ci * groupW;
    const catLabel = labels[ci] ?? '';

    for (let si = 0; si < nSeries; si++) {
      const val = seriesArr[si]?.values?.[ci] ?? 0;
      const barH = maxVal > 0 ? Math.abs(val) / maxVal * plotH : 0;
      const bx = groupX + barGap + si * (barW + barGap);
      const by = baseline - barH;
      const cls = SERIES_CLASSES[si % SERIES_CLASSES.length];
      bars += `<rect class="${cls}" x="${r(bx)}" y="${r(by)}" width="${r(barW)}" height="${r(barH)}" rx="1"/>`;

      if (valueLabels && val !== 0) {
        vLabels += `<text class="ts-chart-label" x="${r(bx + barW / 2)}" y="${r(by - 3)}" text-anchor="middle">${val}</text>`;
      }
    }

    // Category label centred under group (supports \n for multi-line)
    const labelX = groupX + groupW / 2;
    const labelLines = String(catLabel).split('\n');
    if (labelLines.length > 1) {
      const tspans = labelLines.map((line, li) =>
        `<tspan x="${r(labelX)}" dy="${li === 0 ? 0 : 12}">${escXml(line)}</tspan>`
      ).join('');
      xLabels += `<text class="ts-chart-axis-label" x="${r(labelX)}" y="${r(baseline + 16)}" text-anchor="middle">${tspans}</text>`;
    } else {
      xLabels += `<text class="ts-chart-axis-label" x="${r(labelX)}" y="${r(baseline + 16)}" text-anchor="middle">${escXml(catLabel)}</text>`;
    }
  }

  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" data-region xmlns="http://www.w3.org/2000/svg">
  <!-- baseline -->
  <line class="ts-chart-axis" x1="${r(plotX)}" y1="${r(baseline)}" x2="${r(plotX + plotW)}" y2="${r(baseline)}"/>
  ${bars}
  ${xLabels}
  ${vLabels}
</svg>`;
}

function r(n) { return Math.round(n * 100) / 100; }
function escXml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
