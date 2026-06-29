/**
 * timeline.js — horizontal timeline with step markers
 *
 * Simple structural version; detailed variants should be built in patterns.
 *
 * Layout: horizontal line at vertical center; step circles + labels above/below.
 *
 * @param {{ steps, top, left, width }} opts
 *   steps: Array<{ label, sub? }> — timeline step items
 * @returns {string} positioned HTML
 */
export function timeline({
  steps = [],
  top = 280,
  left = 72,
  width = 1136,
} = {}) {
  const HEIGHT = 160;
  const LINE_Y = HEIGHT / 2;
  const DOT_R = 10;
  const LABEL_GAP = 16;
  const LABEL_H = 48;

  const count = steps.length;
  if (count === 0) {
    return `<div class="ts-region ts-timeline" style="left:${left}px;top:${top}px;width:${width}px;height:${HEIGHT}px"></div>`;
  }

  // Even spacing: first and last dots at margins
  const MARGIN = 48;
  const stepSpacing = count > 1 ? (width - MARGIN * 2) / (count - 1) : 0;

  let svgContent = '';
  // Horizontal line
  svgContent += `<line x1="${MARGIN}" y1="${LINE_Y}" x2="${width - MARGIN}" y2="${LINE_Y}" stroke="var(--primary)" stroke-width="2"/>`;

  let labelsHtml = '';

  steps.forEach((step, i) => {
    const cx = count > 1 ? MARGIN + i * stepSpacing : width / 2;

    // Dot
    svgContent += `<circle cx="${cx}" cy="${LINE_Y}" r="${DOT_R}" fill="var(--primary)"/>`;

    // Label above for even indices, below for odd
    const isAbove = i % 2 === 0;
    const labelTop = isAbove
      ? top + LINE_Y - DOT_R - LABEL_GAP - LABEL_H
      : top + LINE_Y + DOT_R + LABEL_GAP;

    const subHtml = step.sub
      ? `<div class="ts-timeline-sub">${step.sub}</div>`
      : '';

    labelsHtml += `<div class="ts-region ts-timeline-label" style="left:${left + cx - 64}px;top:${labelTop}px;width:128px;height:${LABEL_H}px;text-align:center;">
  <div class="ts-timeline-step">${step.label}</div>
  ${subHtml}
</div>`;
  });

  const svgHtml = `<svg class="ts-region ts-timeline-track" style="left:${left}px;top:${top}px;width:${width}px;height:${HEIGHT}px" viewBox="0 0 ${width} ${HEIGHT}">
  ${svgContent}
</svg>`;

  return svgHtml + labelsHtml;
}
