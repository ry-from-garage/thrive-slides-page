/**
 * table.js — positioned HTML table component
 *
 * Returns a .ts-region div containing a <table class="ts-table">.
 * Header row is themed with --primary/surface. An optional column index
 * can be highlighted.
 *
 * @param {{ headers, rows, highlightCol, top, height, left, width }} opts
 * @returns {string} positioned HTML region
 */
export function table({
  headers = [],
  rows = [],
  highlightCol = -1,
  top = 160,
  height = 440,
  left = 72,
  width = 1136,
} = {}) {
  const thCells = headers.map((h, i) => {
    const cls = i === highlightCol ? ' class="ts-table-hl"' : '';
    return `<th${cls}>${h}</th>`;
  }).join('');

  const trRows = rows.map((row) => {
    const tds = row.map((cell, i) => {
      const cls = i === highlightCol ? ' class="ts-table-hl"' : '';
      return `<td${cls}>${cell}</td>`;
    }).join('');
    return `<tr>${tds}</tr>`;
  }).join('');

  return `<div class="ts-region ts-table-wrap" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px">
  <table class="ts-table">
    <thead><tr>${thCells}</tr></thead>
    <tbody>${trRows}</tbody>
  </table>
</div>`;
}
