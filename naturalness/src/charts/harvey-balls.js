/**
 * harvey-balls.js — a single Harvey ball SVG
 *
 * harveyBalls(level, size)
 *   level — integer 0..4 (0=empty, 1=quarter, 2=half, 3=three-quarter, 4=full)
 *   size  — diameter in px (default 24)
 *
 * Pure helper exported:
 *   fillFraction(level) → fill fraction 0 | 0.25 | 0.5 | 0.75 | 1.0
 *
 * The fill is implemented as a pie-arc path clipped to the circle.
 * Circle outline always rendered. For level=0 or level=4 special cases are used.
 */

/**
 * Pure helper: map level 0..4 to fill fraction.
 */
export function fillFraction(level) {
  const fractions = [0, 0.25, 0.5, 0.75, 1.0];
  const i = Math.max(0, Math.min(4, Math.round(level)));
  return fractions[i];
}

/** Convert fraction [0..1] to SVG arc path string centered on cx,cy with radius r */
function fractionArcPath(cx, cy, radius, fraction) {
  if (fraction <= 0) return '';
  if (fraction >= 1) {
    // Full circle
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} Z`;
  }
  const angleDeg = fraction * 360;
  const rad = (angleDeg - 90) * Math.PI / 180; // start from top (12 o'clock)
  const ex = cx + radius * Math.cos(rad);
  const ey = cy + radius * Math.sin(rad);
  const largeArc = fraction > 0.5 ? 1 : 0;
  // Start at top (12 o'clock = cx, cy-r), sweep clockwise
  return `M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey} Z`;
}

export function harveyBalls(level = 0, size = 24) {
  const frac = fillFraction(level);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 1; // 1px inset for stroke

  const fillPath = fractionArcPath(cx, cy, outerR, frac);

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <circle class="ts-harvey-bg" cx="${cx}" cy="${cy}" r="${outerR}"/>
  ${fillPath ? `<path class="ts-harvey-fill" d="${fillPath}"/>` : ''}
  <circle class="ts-harvey-ring" cx="${cx}" cy="${cy}" r="${outerR}" fill="none"/>
</svg>`;
}
