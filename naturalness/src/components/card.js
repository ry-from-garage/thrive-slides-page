/**
 * card.js — generic card inner HTML (heading + body + optional icon)
 *
 * Use inside a cardGrid cell or any .ts-card container.
 *
 * @param {{ heading, body, icon }} opts
 * @returns {string} inner HTML
 */
export function card({ heading = '', body = '', icon = '' } = {}) {
  const iconHtml = icon
    ? `<div class="ts-card-icon">${icon}</div>`
    : '';

  return `${iconHtml}<div class="ts-card-heading">${heading}</div><div class="ts-card-body">${body}</div>`;
}
