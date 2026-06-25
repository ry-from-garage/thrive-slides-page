/**
 * kpi-stat.js — inner HTML for a KPI / metric card
 *
 * Use inside a cardGrid cell or any .ts-card container.
 *
 * @param {{ label, value, sub, badge }} opts
 * @returns {string} inner HTML (not a positioned region)
 */
export function kpiStat({ label = '', value = '', sub = '', badge = '' } = {}) {
  const badgeHtml = badge
    ? `<span class="ts-kpi-badge">${badge}</span>`
    : '';

  const subHtml = sub
    ? `<div class="ts-kpi-sub">${sub}</div>`
    : '';

  return `<div class="ts-kpi">
  <div class="ts-kpi-label">${label}${badgeHtml}</div>
  <div class="ts-kpi-value">${value}</div>
  ${subHtml}
</div>`;
}
