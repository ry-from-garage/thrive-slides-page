/**
 * frame.js — slide frame elements (title, source, page number)
 *
 * Safe area: x 72..1208, y 56..664
 * Title uses .clip-guard so it wraps rather than clips.
 */

/**
 * renderFrame({ title, source, page })
 * Returns HTML string for the frame chrome of a slide.
 * All parameters are optional; omitted elements are not rendered.
 */
export function renderFrame({ title, source, page } = {}) {
  let html = '';

  if (title != null) {
    html += `<div class="ts-title clip-guard">${title}</div>`;
  }

  if (source != null) {
    html += `<div class="ts-source">${source}</div>`;
  }

  if (page != null) {
    html += `<div class="ts-pageno">${page}</div>`;
  }

  return html;
}
