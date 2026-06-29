/**
 * card-grid.js — equal-width card layout across the content area
 *
 * Safe area: x 72..1208 (width 1136), 12-col grid, gutter 24px
 *
 * Formula (guaranteed equal, evenly-spaced cards):
 *   cardW   = (1136 - (n-1)*24) / n
 *   left_i  = 72 + i * (cardW + 24)
 *   right_n = 72 + (n-1)*(cardW+24) + cardW = 1208  ✓
 */

const SAFE_LEFT = 72;
const CONTENT_W = 1136;
const GUTTER = 24;

/**
 * cardGrid(n, items, opts)
 * @param {number} n         - number of equal columns
 * @param {string[]} items   - inner HTML for each card (length should be >= n)
 * @param {{ top?: number, height?: number }} opts
 * @returns {string} HTML string of n .ts-card divs
 */
export function cardGrid(n, items = [], { top = 200, height = 360 } = {}) {
  const cardW = (CONTENT_W - (n - 1) * GUTTER) / n;
  let html = '';

  for (let i = 0; i < n; i++) {
    const left = SAFE_LEFT + i * (cardW + GUTTER);
    const inner = items[i] ?? '';
    html += `<div class="ts-region ts-card" style="left:${left}px;top:${top}px;width:${cardW}px;height:${height}px">${inner}</div>`;
  }

  return html;
}
