/**
 * list-row.js — a list row with lead marker, heading, body
 *
 * Returns inner HTML for one row. Stack multiple rows inside a panel or region.
 *
 * @param {{ lead, heading, body }} opts
 * @returns {string} inner HTML
 */
export function listRow({ lead = '', heading = '', body = '' } = {}) {
  return `<div class="ts-list-row">
  <div class="ts-list-lead">${lead}</div>
  <div class="ts-list-content">
    <div class="ts-list-heading">${heading}</div>
    <div class="ts-list-body">${body}</div>
  </div>
</div>`;
}
