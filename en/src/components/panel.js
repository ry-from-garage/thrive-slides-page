/**
 * panel.js — generic positioned content panel
 *
 * fill options: 'none' | 'surface' | 'primary'
 * Mapped to CSS classes: ts-panel--none, ts-panel--surface, ts-panel--primary
 *
 * @param {{ left, top, width, height, title, body, fill }} opts
 * @returns {string} positioned HTML region
 */
export function panel({
  left = 72,
  top = 120,
  width = 560,
  height = 400,
  title = '',
  body = '',
  fill = 'surface',
} = {}) {
  const fillClass = `ts-panel--${fill}`;
  const titleHtml = title ? `<div class="ts-panel-title">${title}</div>` : '';

  return `<div class="ts-region ts-panel ${fillClass}" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px">
  ${titleHtml}
  <div class="ts-panel-body">${body}</div>
</div>`;
}
