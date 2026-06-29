/**
 * svg.js — shared SVG helpers for the diagram patterns.
 *
 * All diagram connectors/shapes are drawn into a single full-slide overlay SVG
 * (viewBox "0 0 1280 720") so geometry uses absolute slide coordinates and the
 * paths can attach precisely to HTML node boxes/circles placed elsewhere.
 *
 * Theming: colors come from CSS vars via `currentColor` or explicit var(--…).
 * The overlay <svg> sets `color: var(--muted)` so markers/strokes that use
 * `currentColor` pick up the theme. No hardcoded hex.
 */

let uid = 0;
function nextId(prefix) {
  uid += 1;
  return `${prefix}-${uid}`;
}

/**
 * arrowMarker({ id, color, size }) → { id, def }
 *
 * Returns an SVG <marker> definition with orient="auto" so the arrowhead
 * rotates to point ALONG the line/path it terminates. `color` defaults to
 * currentColor (theme --muted via the overlay <svg> color).
 *
 * The marker is authored pointing to the right (+x) at refX=size so the tip
 * sits exactly at the path end; orient="auto" then aligns it to path direction.
 */
export function arrowMarker({ id, color = 'currentColor', size = 9 } = {}) {
  const markerId = id || nextId('ts-arrow');
  const w = size;
  const h = size * 0.8;
  const def = `<marker id="${markerId}" markerWidth="${w}" markerHeight="${h}"
    refX="${w - 0.5}" refY="${h / 2}" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M0,0 L${w},${h / 2} L0,${h} Z" fill="${color}"/>
  </marker>`;
  return { id: markerId, def };
}

/**
 * overlaySvg({ defs, body, region }) → string
 *
 * Wraps connector/marker markup in a full-slide, pointer-events:none overlay
 * SVG. `color: var(--muted)` makes currentColor resolve to the theme muted
 * tone for strokes/markers. overflow:visible so nothing is clipped.
 */
export function overlaySvg({ defs = '', body = '', region = 'diagram_connectors' } = {}) {
  return `<svg data-region="${region}" class="ts-region" style="
  left:0px; top:0px; width:1280px; height:720px;
  position:absolute; pointer-events:none; overflow:visible;
  color:var(--muted);
" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  ${defs ? `<defs>${defs}</defs>` : ''}
  ${body}
</svg>`;
}

/** Round a number to 1 decimal for compact path data. */
export function r1(n) {
  return Math.round(n * 10) / 10;
}

/**
 * line({ x1, y1, x2, y2, markerEnd, width, opacity, color }) → string
 * A themed connector line. `markerEnd` is a marker id (no url() needed).
 */
export function line({ x1, y1, x2, y2, markerEnd, width = 1.5, opacity = 1, color = 'currentColor', dash } = {}) {
  const m = markerEnd ? ` marker-end="url(#${markerEnd})"` : '';
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"
    stroke="${color}" stroke-width="${width}" opacity="${opacity}"${d}${m}/>`;
}

/**
 * pathEl({ d, markerEnd, width, opacity, color }) → string
 * A themed connector path (fill:none). Used for d3 link generators.
 */
export function pathEl({ d, markerEnd, width = 1.5, opacity = 1, color = 'currentColor' } = {}) {
  const m = markerEnd ? ` marker-end="url(#${markerEnd})"` : '';
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}"${m}/>`;
}
