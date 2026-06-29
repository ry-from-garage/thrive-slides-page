/**
 * bubble2x2.js — 2×2 scatter/bubble chart with quadrant gridlines
 *
 * bubble2x2({ items, w, h, axisX, axisY })
 *   items  — array of { label, x, y, size }
 *             x, y in [0..1] (normalised position in 2×2 field)
 *             size ∝ bubble radius
 *   w, h   — SVG canvas size
 *   axisX  — { lo, hi } labels for x axis ends (optional)
 *   axisY  — { lo, hi } labels for y axis ends (optional)
 */

const PAD = 36; // uniform padding for axis labels

export function bubble2x2({ items = [], w = 400, h = 300, axisX = {}, axisY = {} }) {
  const plotX = PAD;
  const plotY = PAD;
  const plotW = w - PAD * 2;
  const plotH = h - PAD * 2;

  // Max size for radius normalisation
  const maxSize = Math.max(...items.map(it => it.size ?? 1), 1);
  const maxR = Math.min(plotW, plotH) * 0.1;

  // Quadrant gridlines (center cross)
  const midX = plotX + plotW / 2;
  const midY = plotY + plotH / 2;

  let bubbles = '';
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const cx = plotX + (it.x ?? 0.5) * plotW;
    const cy = plotY + (1 - (it.y ?? 0.5)) * plotH; // y=0 at bottom
    const rad = Math.max(4, Math.sqrt((it.size ?? 1) / maxSize) * maxR);
    const cls = `ts-chart-series-${(i % 3) + 1}`;
    bubbles += `<circle class="${cls} ts-chart-bubble" cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}"/>`;
    if (it.label) {
      bubbles += `<text class="ts-chart-label" x="${r(cx)}" y="${r(cy - rad - 3)}" text-anchor="middle">${escXml(it.label)}</text>`;
    }
  }

  // Axis labels
  let axLabels = '';
  if (axisX.lo) axLabels += `<text class="ts-chart-axis-label" x="${r(plotX)}" y="${r(plotY + plotH + 18)}" text-anchor="start">${escXml(axisX.lo)}</text>`;
  if (axisX.hi) axLabels += `<text class="ts-chart-axis-label" x="${r(plotX + plotW)}" y="${r(plotY + plotH + 18)}" text-anchor="end">${escXml(axisX.hi)}</text>`;
  if (axisY.lo) axLabels += `<text class="ts-chart-axis-label" x="${r(plotX - 4)}" y="${r(plotY + plotH)}" text-anchor="end">${escXml(axisY.lo)}</text>`;
  if (axisY.hi) axLabels += `<text class="ts-chart-axis-label" x="${r(plotX - 4)}" y="${r(plotY + 6)}" text-anchor="end">${escXml(axisY.hi)}</text>`;

  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" data-region xmlns="http://www.w3.org/2000/svg">
  <!-- plot border -->
  <rect class="ts-chart-plot-bg" x="${r(plotX)}" y="${r(plotY)}" width="${r(plotW)}" height="${r(plotH)}" fill="none"/>
  <!-- quadrant gridlines -->
  <line class="ts-chart-grid" x1="${r(midX)}" y1="${r(plotY)}" x2="${r(midX)}" y2="${r(plotY + plotH)}"/>
  <line class="ts-chart-grid" x1="${r(plotX)}" y1="${r(midY)}" x2="${r(plotX + plotW)}" y2="${r(midY)}"/>
  <!-- axes -->
  <line class="ts-chart-axis" x1="${r(plotX)}" y1="${r(plotY + plotH)}" x2="${r(plotX + plotW)}" y2="${r(plotY + plotH)}"/>
  <line class="ts-chart-axis" x1="${r(plotX)}" y1="${r(plotY)}" x2="${r(plotX)}" y2="${r(plotY + plotH)}"/>
  ${bubbles}
  ${axLabels}
</svg>`;
}

function r(n) { return Math.round(n * 100) / 100; }
function escXml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
