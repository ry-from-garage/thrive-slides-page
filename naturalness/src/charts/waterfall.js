/**
 * waterfall.js — waterfall / bridge chart
 *
 * waterfall({ start, deltas, end, w, h, labels })
 *   start   — opening bar value
 *   deltas  — array of signed delta values
 *   end     — closing / total bar value (optional; if omitted, computed)
 *   w, h    — SVG canvas size
 *   labels  — labels for [start, ...deltas, end]
 *
 * Pure helpers exported:
 *   cumulative(start, deltas) → array of running totals for each delta (after applying)
 *   validateWaterfall(start, deltas, end) → throws if sum doesn't match end (within ε)
 */

const PAD_TOP = 16;
const PAD_BOTTOM = 40;
const PAD_LEFT = 4;
const PAD_RIGHT = 4;
const BAR_GAP = 6;
const CONNECTOR_DASH = '3,3';

/**
 * Pure helper: compute running totals after each delta.
 * Result[i] is the value after applying deltas[0..i].
 */
export function cumulative(start, deltas) {
  const result = [];
  let acc = start;
  for (const d of deltas) {
    acc += d;
    result.push(acc);
  }
  return result;
}

/**
 * Pure helper: validate that start + sum(deltas) ≈ end (within 0.0001).
 * Throws if mismatch.
 */
export function validateWaterfall(start, deltas, end) {
  const computed = start + deltas.reduce((s, d) => s + d, 0);
  if (Math.abs(computed - end) > 0.0001) {
    throw new Error(
      `Waterfall mismatch: start(${start}) + sum(deltas) = ${computed}, expected end = ${end}`,
    );
  }
}

export function waterfall({ start = 0, deltas = [], end, w = 400, h = 300, labels = [] }) {
  // Compute end if not provided
  const computedEnd = start + deltas.reduce((s, d) => s + d, 0);
  const finalEnd = end !== undefined ? end : computedEnd;

  // Validate (clamp if mismatch — use computed value, warn in comment)
  let endNote = '';
  if (end !== undefined && Math.abs(computedEnd - finalEnd) > 0.0001) {
    endNote = `<!-- waterfall: start+deltas=${computedEnd} != end=${finalEnd}, clamped to computed -->`;
  }
  const actualEnd = computedEnd; // always use computed for bar positions

  const runs = cumulative(start, deltas);
  const allVals = [start, ...runs, actualEnd];
  const maxVal = Math.max(...allVals);
  const minVal = Math.min(...allVals, 0);
  const range = maxVal - minVal || 1;

  const plotX = PAD_LEFT;
  const plotY = PAD_TOP;
  const plotW = w - PAD_LEFT - PAD_RIGHT;
  const plotH = h - PAD_TOP - PAD_BOTTOM;
  const zeroY = plotY + plotH * (maxVal / range); // y-coordinate of value=0

  const nBars = 2 + deltas.length; // start + deltas + end
  const barW = Math.max(2, (plotW - BAR_GAP * (nBars + 1)) / nBars);

  function valToY(v) { return plotY + (maxVal - v) / range * plotH; }

  // Build bars array: [start bar, ...delta bars, end bar]
  const barDefs = [
    { value: start, base: 0, label: labels[0] ?? 'Start', type: 'start' },
    ...deltas.map((d, i) => ({
      value: d,
      base: runs[i] - d, // floating bar starts from previous cumulative
      label: labels[i + 1] ?? '',
      type: d >= 0 ? 'pos' : 'neg',
    })),
    { value: actualEnd, base: 0, label: labels[deltas.length + 1] ?? 'End', type: 'end' },
  ];

  let bars = '';
  let connectors = '';
  let xLabels = '';

  for (let i = 0; i < barDefs.length; i++) {
    const bd = barDefs[i];
    const bx = plotX + BAR_GAP + i * (barW + BAR_GAP);

    let topVal, bottomVal;
    if (bd.type === 'start' || bd.type === 'end') {
      topVal = bd.value >= 0 ? bd.value : 0;
      bottomVal = bd.value >= 0 ? 0 : bd.value;
    } else {
      // floating bar
      const lo = Math.min(bd.base, bd.base + bd.value);
      const hi = Math.max(bd.base, bd.base + bd.value);
      topVal = hi;
      bottomVal = lo;
    }

    const y1 = valToY(topVal);
    const y2 = valToY(bottomVal);
    const barH = Math.max(1, Math.abs(y2 - y1));

    let cls;
    if (bd.type === 'start' || bd.type === 'end') {
      cls = 'ts-chart-series-1';
    } else if (bd.type === 'pos') {
      cls = 'ts-chart-pos';
    } else {
      cls = 'ts-chart-neg';
    }

    bars += `<rect class="${cls}" x="${r(bx)}" y="${r(y1)}" width="${r(barW)}" height="${r(barH)}" rx="1"/>`;

    // Connector: horizontal line from top of this bar to next bar (skip for last)
    if (i < barDefs.length - 1) {
      const nextBd = barDefs[i + 1];
      // connector starts at the level of the end of this bar
      let connY;
      if (bd.type === 'start' || bd.type === 'end') {
        connY = valToY(bd.value);
      } else {
        connY = valToY(bd.base + bd.value);
      }
      const nextBx = plotX + BAR_GAP + (i + 1) * (barW + BAR_GAP);
      connectors += `<line class="ts-chart-connector" x1="${r(bx + barW)}" y1="${r(connY)}" x2="${r(nextBx)}" y2="${r(connY)}" stroke-dasharray="${CONNECTOR_DASH}"/>`;
    }

    // x-axis label
    xLabels += `<text class="ts-chart-axis-label" x="${r(bx + barW / 2)}" y="${r(plotY + plotH + 16)}" text-anchor="middle">${escXml(bd.label)}</text>`;
  }

  // Zero baseline
  const baselineY = valToY(0);

  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" data-region xmlns="http://www.w3.org/2000/svg">
  ${endNote}
  <line class="ts-chart-axis" x1="${r(plotX)}" y1="${r(baselineY)}" x2="${r(plotX + plotW)}" y2="${r(baselineY)}"/>
  ${connectors}
  ${bars}
  ${xLabels}
</svg>`;
}

function r(n) { return Math.round(n * 100) / 100; }
function escXml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
