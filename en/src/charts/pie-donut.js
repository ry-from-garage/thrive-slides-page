/**
 * pie-donut.js — pie or donut chart
 *
 * pieDonut({ slices, w, h, donut })
 *   slices — array of { label, value }
 *   w, h   — SVG canvas size
 *   donut  — if true, render as donut (inner hole)
 *
 * Pure helper exported: sliceAngles(values) → array of sweep angles summing to 360
 */

const SERIES_CLASSES = [
  'ts-chart-series-1',
  'ts-chart-series-2',
  'ts-chart-series-3',
  'ts-chart-pos',
  'ts-chart-neg',
];

/**
 * Pure helper: given an array of numeric values, return sweep angles (degrees)
 * that sum to exactly 360.
 */
export function sliceAngles(values) {
  const total = values.reduce((s, v) => s + Math.abs(v), 0);
  if (total === 0) return values.map(() => 0);
  const raw = values.map(v => Math.abs(v) / total * 360);
  // Adjust last slice to make sum exactly 360
  const sum = raw.reduce((s, a) => s + a, 0);
  raw[raw.length - 1] += 360 - sum;
  return raw;
}

/** Convert polar to cartesian */
function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function pieDonut({ slices = [], w = 300, h = 300, donut = false }) {
  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) / 2 - 8;
  const innerR = donut ? outerR * 0.5 : 0;

  const values = slices.map(s => s.value ?? 0);
  const angles = sliceAngles(values);

  let paths = '';
  let startAngle = 0;

  for (let i = 0; i < slices.length; i++) {
    const sweep = angles[i];
    if (sweep <= 0) { startAngle += sweep; continue; }
    const cls = SERIES_CLASSES[i % SERIES_CLASSES.length];

    // SVG arcs are degenerate when start == end (full 360°).
    // Split a near-360° sweep into two half-arcs.
    const isFull = sweep >= 359.9999;
    let d;

    if (isFull) {
      // Draw two 180° arcs to form a complete circle/annulus
      const [ox1, oy1] = polar(cx, cy, outerR, startAngle);
      const [oxMid, oyMid] = polar(cx, cy, outerR, startAngle + 180);
      if (donut) {
        const [ixMid, iyMid] = polar(cx, cy, innerR, startAngle + 180);
        const [ix1, iy1] = polar(cx, cy, innerR, startAngle);
        d = [
          `M ${r(ox1)} ${r(oy1)}`,
          `A ${r(outerR)} ${r(outerR)} 0 1 1 ${r(oxMid)} ${r(oyMid)}`,
          `A ${r(outerR)} ${r(outerR)} 0 1 1 ${r(ox1)} ${r(oy1)}`,
          `L ${r(ix1)} ${r(iy1)}`,
          `A ${r(innerR)} ${r(innerR)} 0 1 0 ${r(ixMid)} ${r(iyMid)}`,
          `A ${r(innerR)} ${r(innerR)} 0 1 0 ${r(ix1)} ${r(iy1)}`,
          'Z',
        ].join(' ');
      } else {
        d = [
          `M ${r(cx)} ${r(cy)}`,
          `L ${r(ox1)} ${r(oy1)}`,
          `A ${r(outerR)} ${r(outerR)} 0 1 1 ${r(oxMid)} ${r(oyMid)}`,
          `A ${r(outerR)} ${r(outerR)} 0 1 1 ${r(ox1)} ${r(oy1)}`,
          'Z',
        ].join(' ');
      }
    } else {
      const endAngle = startAngle + sweep;
      const largeArc = sweep > 180 ? 1 : 0;
      const [ox1, oy1] = polar(cx, cy, outerR, startAngle);
      const [ox2, oy2] = polar(cx, cy, outerR, endAngle);
      if (donut) {
        const [ix1, iy1] = polar(cx, cy, innerR, endAngle);
        const [ix2, iy2] = polar(cx, cy, innerR, startAngle);
        d = [
          `M ${r(ox1)} ${r(oy1)}`,
          `A ${r(outerR)} ${r(outerR)} 0 ${largeArc} 1 ${r(ox2)} ${r(oy2)}`,
          `L ${r(ix1)} ${r(iy1)}`,
          `A ${r(innerR)} ${r(innerR)} 0 ${largeArc} 0 ${r(ix2)} ${r(iy2)}`,
          'Z',
        ].join(' ');
      } else {
        d = [
          `M ${r(cx)} ${r(cy)}`,
          `L ${r(ox1)} ${r(oy1)}`,
          `A ${r(outerR)} ${r(outerR)} 0 ${largeArc} 1 ${r(ox2)} ${r(oy2)}`,
          'Z',
        ].join(' ');
      }
    }

    paths += `<path class="${cls}" d="${d}"/>`;
    startAngle += sweep;
  }

  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" data-region xmlns="http://www.w3.org/2000/svg">
  ${paths}
</svg>`;
}

function r(n) { return Math.round(n * 100) / 100; }
