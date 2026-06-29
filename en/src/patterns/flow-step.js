/**
 * flow-step.js — フロー・ステップパターン群
 *
 * Patterns: horizontal-step-flow, step-card-flow, circle-node-flow,
 *           horizontal-milestone-timeline, vertical-step-flow,
 *           staircase-roadmap, two-feature-with-result
 *
 * Theme: modern-tech
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   COL_UNIT = 96.6667  (column width + gutter)
 *   colX(n)  = 72 + (n-1) * 96.6667
 *   colW(n)  = n * 96.6667 - 24
 *
 * All vertical_offset_px and row_height_px taken directly from layout spec.
 */

import { definePattern } from './registry.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

/** Left x of column n (1-based) */
function colX(n) {
  return SAFE_LEFT + (n - 1) * COL_UNIT;
}

/** Width of a span of n columns (including internal gutters, excluding trailing gutter) */
function colW(n) {
  return n * COL_UNIT - 24;
}

/** { left, width } for columns s..e (1-based, inclusive) */
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Pattern: horizontal-step-flow ────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   steps: Array<{ number, label }>,   // 4 steps
 *   callout_note?: string,             // optional top callout text
 *   callout_warn?: string,             // optional bottom callout text
 *   source?: string
 * }
 *
 * Structure (layout-flow-step.md):
 *   title_bar     col 1-12  offset 56   height 80
 *   lead_text     col 1-12  offset 152  height 40
 *   step_flow_area col 1-9  offset 208  height 416
 *   callout_column col 10-12 offset 208 height 416  (optional)
 *   source_bar    col 1-12  offset 640  height 24
 */
definePattern('horizontal-step-flow', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const steps = c.steps ?? [];
  const calloutNote = c.callout_note ?? '';
  const calloutWarn = c.callout_warn ?? '';
  const source = c.source ?? '';

  const hasCallout = calloutNote || calloutWarn;

  const tb = colRange(1, 12);
  const lt = colRange(1, 12);
  const stepArea = hasCallout ? colRange(1, 9) : colRange(1, 12);
  const calloutCol = colRange(10, 12);
  const sb = colRange(1, 12);

  // step_flow_area: offset 208, height 416
  const FLOW_TOP = 208;
  const FLOW_H = 416;
  const CARD_GAP = 24; // gutter between cards
  const CARD_COUNT = Math.min(steps.length, 4);

  // Total width of step_flow_area
  const flowW = stepArea.width;
  // Card width: (flowW - (count-1)*CARD_GAP) / count
  const cardW = Math.floor((flowW - (CARD_COUNT - 1) * CARD_GAP) / CARD_COUNT);

  // Arrow connector dims
  const ARROW_W = CARD_GAP;
  const ARROW_H = 20;

  const stepsHtml = steps.slice(0, CARD_COUNT).map((step, idx) => {
    const cardLeft = stepArea.left + idx * (cardW + CARD_GAP);
    const badgeSize = 32;

    const connectorHtml = idx < CARD_COUNT - 1 ? `
<div data-region="arrow_${idx + 1}" class="ts-region" style="
  left:${cardLeft + cardW}px;
  top:${FLOW_TOP + Math.floor(FLOW_H / 2) - Math.floor(ARROW_H / 2)}px;
  width:${CARD_GAP}px;
  height:${ARROW_H}px;
  display:flex; align-items:center; justify-content:center;
">
  <svg viewBox="0 0 ${CARD_GAP} ${ARROW_H}" width="${CARD_GAP}" height="${ARROW_H}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <line x1="1" y1="${ARROW_H / 2}" x2="${CARD_GAP - 8}" y2="${ARROW_H / 2}" stroke="var(--muted)" stroke-width="2"/>
    <polygon points="${CARD_GAP - 8},${ARROW_H / 2 - 5} ${CARD_GAP - 1},${ARROW_H / 2} ${CARD_GAP - 8},${ARROW_H / 2 + 5}" fill="var(--muted)"/>
  </svg>
</div>` : '';

    return `
<div data-region="step_card_${idx + 1}" class="ts-region" style="
  left:${cardLeft}px;
  top:${FLOW_TOP}px;
  width:${cardW}px;
  height:${FLOW_H}px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  box-sizing:border-box;
  display:flex; flex-direction:column; align-items:center;
  padding:40px 16px 24px;
  overflow:hidden;
">
  <div style="
    flex-shrink:0;
    width:${badgeSize}px; height:${badgeSize}px;
    border-radius:50%;
    background:var(--accent);
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head);
    font-size:var(--caption, 13px);
    color:#fff;
    font-weight:700;
    margin-bottom:16px;
  ">${step.number ?? String(idx + 1)}</div>
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:600;
    line-height:1.4;
    text-align:center;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    margin-bottom:16px;
  ">${step.label ?? ''}</div>
  ${step.body ? `<div style="
    font-family:var(--font-body);
    font-size:13px;
    color:var(--muted);
    line-height:1.5;
    text-align:center;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    display:-webkit-box;
    -webkit-box-orient:vertical;
    -webkit-line-clamp:3;
    overflow:hidden;
    text-overflow:ellipsis;
  ">${step.body}</div>` : `<div style="
    width:${Math.floor(cardW * 0.6)}px; height:${Math.floor(FLOW_H * 0.3)}px;
    border-radius:var(--radius, 8px);
    background:var(--muted);
    opacity:0.18;
    margin-top:auto;
  "></div>`}
</div>
${connectorHtml}`;
  }).join('\n');

  const calloutHtml = hasCallout ? `
<div data-region="callout_note" class="ts-region" style="
  left:${calloutCol.left}px;
  top:${FLOW_TOP}px;
  width:${calloutCol.width}px;
  height:${Math.floor(FLOW_H / 2) - 8}px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  box-sizing:border-box; padding:16px;
  display:flex; flex-direction:column; justify-content:center;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.08em;
    margin-bottom:8px;
  ">POINT</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--text);
    line-height:1.5;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${calloutNote}</div>
</div>
<div data-region="callout_warn" class="ts-region" style="
  left:${calloutCol.left}px;
  top:${FLOW_TOP + Math.floor(FLOW_H / 2) + 8}px;
  width:${calloutCol.width}px;
  height:${FLOW_H - Math.floor(FLOW_H / 2) - 8}px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  border-left:3px solid var(--accent);
  box-sizing:border-box; padding:16px;
  display:flex; flex-direction:column; justify-content:center;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--muted);
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.08em;
    margin-bottom:8px;
  ">NOTE</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--text);
    line-height:1.5;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${calloutWarn}</div>
</div>` : '';

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${lead ? `<div data-region="lead_text" class="ts-region" style="
  left:${lt.left}px; top:152px; width:${lt.width}px; height:40px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${lead}</div>
</div>` : ''}

${stepsHtml}

${calloutHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: step-card-flow ───────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   steps: Array<{ step_label, number, heading, bullets: string[] }>,  // 4 items
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar    col 1-12  offset 56   height 80
 *   lead_text    col 1-12  offset 152  height 40
 *   timeline_bar col 1-12  offset 208  height 24
 *   card_area    col 1-12  offset 248  height 384
 *   source_bar   col 1-12  offset 640  height 24
 */
definePattern('step-card-flow', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const steps = c.steps ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const lt = colRange(1, 12);
  const tl = colRange(1, 12);
  const ca = colRange(1, 12);
  const sb = colRange(1, 12);

  const CARD_COUNT = Math.min(steps.length, 4);
  const CARD_GAP = 16;
  const cardW = Math.floor((ca.width - (CARD_COUNT - 1) * CARD_GAP) / CARD_COUNT);

  // timeline_bar: offset 208, height 24
  // Dots are centered on each card
  const dotY = 208 + 12; // vertical center of timeline_bar
  const dotsHtml = steps.slice(0, CARD_COUNT).map((_, idx) => {
    const dotCX = ca.left + idx * (cardW + CARD_GAP) + Math.floor(cardW / 2);
    return `<circle cx="${dotCX}" cy="${dotY}" r="6" fill="var(--accent)" opacity="0.7"/>`;
  }).join('\n');

  const timelineHtml = `
<div data-region="timeline_bar" class="ts-region" style="
  left:${tl.left}px; top:208px; width:${tl.width}px; height:24px;
">
  <svg viewBox="0 0 ${tl.width} 24" width="${tl.width}" height="24" xmlns="http://www.w3.org/2000/svg" style="display:block; overflow:visible;">
    <line x1="0" y1="${dotY - 208}" x2="${tl.width}" y2="${dotY - 208}" stroke="var(--muted)" stroke-width="2" opacity="0.4"/>
    ${steps.slice(0, CARD_COUNT).map((_, idx) => {
      const dotCX = idx * (cardW + CARD_GAP) + Math.floor(cardW / 2);
      return `<circle cx="${dotCX}" cy="${dotY - 208}" r="6" fill="var(--accent)" opacity="0.7"/>`;
    }).join('\n')}
  </svg>
</div>`;

  const cardsHtml = steps.slice(0, CARD_COUNT).map((step, idx) => {
    const cardLeft = ca.left + idx * (cardW + CARD_GAP);
    const bullets = step.bullets ?? [];

    const bulletsHtml = bullets.slice(0, 3).map(b => `
      <div style="
        display:flex; align-items:flex-start; gap:6px;
        margin-bottom:6px;
      ">
        <span style="color:var(--accent); font-size:9px; margin-top:4px; flex-shrink:0;">●</span>
        <span style="
          font-family:var(--font-body);
          font-size:var(--caption, 13px);
          color:var(--muted);
          line-height:1.4;
          white-space:normal; overflow-wrap:break-word; word-break:keep-all;
        ">${b}</span>
      </div>`).join('');

    return `
<div data-region="step_card_${idx + 1}" class="ts-region" style="
  left:${cardLeft}px; top:248px; width:${cardW}px; height:384px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  box-sizing:border-box; padding:20px 16px 16px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-body);
    font-size:11px;
    color:var(--accent);
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.1em;
    margin-bottom:4px;
  ">${step.step_label ?? `STEP ${String(idx + 1).padStart(2, '0')}`}</div>
  <div style="
    font-family:var(--font-head);
    font-size:32px;
    color:var(--text);
    font-weight:700;
    line-height:1;
    margin-bottom:8px;
    opacity:0.15;
  ">${String(idx + 1).padStart(2, '0')}</div>
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:600;
    line-height:1.3;
    margin-bottom:10px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${step.heading ?? ''}</div>
  <div style="
    width:40px; height:2px;
    background:var(--accent);
    border-radius:1px;
    margin-bottom:12px;
    opacity:0.6;
  "></div>
  ${bulletsHtml}
</div>`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${lead ? `<div data-region="lead_text" class="ts-region" style="
  left:${lt.left}px; top:152px; width:${lt.width}px; height:40px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${lead}</div>
</div>` : ''}

${timelineHtml}

${cardsHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: circle-node-flow ─────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   nodes: Array<{ name, sub? }>,              // 3-6 nodes; last is goal
 *   details?: Array<{ heading, subtitle, bullets: string[] }>, // optional, per-node
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar  col 1-12  offset 56   height 80
 *   lead_text  col 1-12  offset 152  height 32
 *   node_row   col 1-12  offset 200  height 152
 *   detail_row col 1-12  offset 368  height 264
 *   source_bar col 1-12  offset 640  height 24
 */
definePattern('circle-node-flow', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const nodes = c.nodes ?? [];
  const details = c.details ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const lt = colRange(1, 12);
  const nr = colRange(1, 12);
  const dr = colRange(1, 12);
  const sb = colRange(1, 12);

  const NODE_COUNT = Math.min(nodes.length, 6);
  const hasDetails = details.length > 0;

  // node_row: offset 200, height 152
  const NODE_TOP = 200;
  const NODE_H = 152;
  const CIRC_D = Math.min(112, Math.floor((nr.width - (NODE_COUNT - 1) * 20) / NODE_COUNT));
  const nodeSpacing = Math.floor((nr.width - NODE_COUNT * CIRC_D) / (NODE_COUNT - 1 || 1));
  const nodeCY = NODE_TOP + Math.floor(NODE_H / 2);

  const nodesHtml = nodes.slice(0, NODE_COUNT).map((node, idx) => {
    const nodeCX = nr.left + idx * (CIRC_D + nodeSpacing) + Math.floor(CIRC_D / 2);
    const isGoal = idx === NODE_COUNT - 1;

    // Connector
    const connectorHtml = idx < NODE_COUNT - 1 ? `
<div data-region="node_conn_${idx + 1}" class="ts-region" style="
  left:${nodeCX + Math.floor(CIRC_D / 2)}px;
  top:${nodeCY - 2}px;
  width:${nodeSpacing}px;
  height:4px;
">
  <svg viewBox="0 0 ${nodeSpacing} 4" width="${nodeSpacing}" height="4" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <line x1="0" y1="2" x2="${nodeSpacing - 4}" y2="2" stroke="var(--muted)" stroke-width="2" opacity="0.5"/>
    <polygon points="${nodeSpacing - 6},0 ${nodeSpacing},2 ${nodeSpacing - 6},4" fill="var(--muted)" opacity="0.5"/>
  </svg>
</div>` : '';

    return `
<div data-region="node_${idx + 1}" class="ts-region" style="
  left:${nodeCX - Math.floor(CIRC_D / 2)}px;
  top:${nodeCY - Math.floor(CIRC_D / 2)}px;
  width:${CIRC_D}px;
  height:${CIRC_D}px;
  border-radius:50%;
  background:${isGoal ? 'var(--text)' : 'var(--surface)'};
  border:2px solid ${isGoal ? 'var(--text)' : 'var(--muted)'};
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  box-sizing:border-box; padding:8px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--caption, 13px);
    color:${isGoal ? '#fff' : 'var(--text)'};
    font-weight:600;
    text-align:center;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${node.name ?? ''}</div>
  ${node.sub ? `<div style="
    font-family:var(--font-body);
    font-size:11px;
    color:${isGoal ? 'rgba(255,255,255,0.7)' : 'var(--muted)'};
    text-align:center;
    margin-top:3px;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${node.sub}</div>` : ''}
</div>
${connectorHtml}`;
  }).join('\n');

  const detailsHtml = hasDetails ? details.slice(0, NODE_COUNT).map((det, idx) => {
    const nodeLeft = nr.left + idx * (CIRC_D + nodeSpacing);
    const detW = CIRC_D + nodeSpacing;
    const adjW = idx === NODE_COUNT - 1 ? CIRC_D : detW;
    const bullets = det.bullets ?? [];

    const bulletsHtml = bullets.slice(0, 3).map(b => `
      <div style="
        display:flex; align-items:flex-start; gap:4px; margin-bottom:4px;
      ">
        <span style="color:var(--accent); font-size:8px; margin-top:4px; flex-shrink:0;">▶</span>
        <span style="
          font-family:var(--font-body);
          font-size:var(--caption, 13px);
          color:var(--muted);
          line-height:1.4;
          white-space:normal; overflow-wrap:break-word; word-break:keep-all;
        ">${b}</span>
      </div>`).join('');

    return `
<div data-region="detail_${idx + 1}" class="ts-region" style="
  left:${nodeLeft}px; top:368px; width:${adjW}px; height:264px;
  box-sizing:border-box; padding:16px 12px 0;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:600;
    line-height:1.3;
    margin-bottom:4px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${det.heading ?? ''}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    margin-bottom:8px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${det.subtitle ?? ''}</div>
  <div style="width:32px; height:2px; background:var(--accent); border-radius:1px; margin-bottom:10px; opacity:0.5;"></div>
  ${bulletsHtml}
</div>`;
  }).join('\n') : '';

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${lead ? `<div data-region="lead_text" class="ts-region" style="
  left:${lt.left}px; top:152px; width:${lt.width}px; height:32px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${lead}</div>
</div>` : ''}

${nodesHtml}

${detailsHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: horizontal-milestone-timeline ────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   phases: string[],               // 4 phase labels e.g. ["Q1","Q2","Q3","Q4"]
 *   milestones: Array<{
 *     date: string,
 *     name: string,
 *     desc?: string,
 *     done: boolean,
 *     phase_idx: number            // 0-based phase index for x positioning
 *   }>,
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar        col 1-12  offset 56   height 80
 *   phase_label_row  col 1-12  offset 152  height 32
 *   timeline_area    col 1-12  offset 200  height 400
 *   legend_bar       col 1-12  offset 616  height 24
 *   source_bar       col 1-12  offset 640  height 24
 */
definePattern('horizontal-milestone-timeline', (c) => {
  const title = c.title ?? '';
  const phases = c.phases ?? ['Q1', 'Q2', 'Q3', 'Q4'];
  const milestones = c.milestones ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const plr = colRange(1, 12);
  const ta = colRange(1, 12);
  const lb = colRange(1, 12);
  const sb = colRange(1, 12);

  const PHASE_COUNT = phases.length;
  const phaseW = Math.floor(ta.width / PHASE_COUNT);

  // Phase labels row: offset 152, height 32
  const phasesHtml = phases.map((ph, idx) => {
    const phLeft = plr.left + idx * phaseW;
    const isLast = idx === PHASE_COUNT - 1;
    return `
<div data-region="phase_${idx + 1}" class="ts-region" style="
  left:${phLeft}px; top:152px; width:${phaseW}px; height:32px;
  display:flex; align-items:center; justify-content:center;
  border-right:${isLast ? 'none' : '1px solid var(--muted)'};
  box-sizing:border-box;
  opacity:0.9;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--muted);
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.08em;
  ">${ph}</div>
</div>`;
  }).join('\n');

  // timeline_area: offset 200, height 400
  // Horizontal axis line at vertical center of area (offset 200 + 160 = 360)
  const TL_TOP = 200;
  const TL_H = 400;
  const AXIS_Y = TL_TOP + Math.floor(TL_H / 2); // 400

  // Distribute milestones across their phases
  const msHtml = milestones.slice(0, 7).map((ms, idx) => {
    const phaseIdx = ms.phase_idx ?? Math.min(idx, PHASE_COUNT - 1);
    // Spread milestones within a phase horizontally
    const phaseMilestones = milestones.filter(m => (m.phase_idx ?? 0) === phaseIdx);
    const posInPhase = phaseMilestones.indexOf(ms);
    const totalInPhase = phaseMilestones.length;
    const phaseLeft = ta.left + phaseIdx * phaseW;
    const markerX = phaseLeft + Math.floor(phaseW * (posInPhase + 1) / (totalInPhase + 1));
    const MARKER_R = 8;

    return `
<div data-region="ms_marker_${idx + 1}" class="ts-region" style="
  left:${markerX - MARKER_R}px;
  top:${AXIS_Y - MARKER_R}px;
  width:${MARKER_R * 2}px;
  height:${MARKER_R * 2}px;
  border-radius:50%;
  background:${ms.done ? 'var(--accent)' : 'transparent'};
  border:2px solid var(--accent);
  box-sizing:border-box;
"></div>
<div data-region="ms_date_${idx + 1}" class="ts-region" style="
  left:${markerX - 24}px;
  top:${AXIS_Y - MARKER_R - 28}px;
  width:48px;
  height:24px;
  display:flex; align-items:center; justify-content:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:11px;
    color:var(--muted);
    text-align:center;
    white-space:nowrap;
  ">${ms.date ?? ''}</div>
</div>
<div data-region="ms_label_${idx + 1}" class="ts-region" style="
  left:${markerX - 40}px;
  top:${AXIS_Y + MARKER_R + 8}px;
  width:80px;
  height:56px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--caption, 13px);
    color:var(--text);
    font-weight:600;
    text-align:center;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${ms.name ?? ''}</div>
  ${ms.desc ? `<div style="
    font-family:var(--font-body);
    font-size:11px;
    color:var(--muted);
    text-align:center;
    margin-top:3px;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${ms.desc}</div>` : ''}
</div>`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${phasesHtml}

<div data-region="timeline_line" class="ts-region" style="
  left:${ta.left}px; top:${AXIS_Y}px; width:${ta.width}px; height:2px;
  background:var(--muted); opacity:0.3;
"></div>

${msHtml}

<div data-region="legend_bar" class="ts-region" style="
  left:${lb.left}px; top:616px; width:${lb.width}px; height:24px;
  display:flex; align-items:center; gap:20px;
">
  <div style="display:flex; align-items:center; gap:6px;">
    <div style="width:12px; height:12px; border-radius:50%; background:var(--accent);"></div>
    <span style="font-family:var(--font-body); font-size:var(--caption,13px); color:var(--muted);">完了</span>
  </div>
  <div style="display:flex; align-items:center; gap:6px;">
    <div style="width:12px; height:12px; border-radius:50%; border:2px solid var(--accent); box-sizing:border-box;"></div>
    <span style="font-family:var(--font-body); font-size:var(--caption,13px); color:var(--muted);">予定</span>
  </div>
</div>

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: vertical-step-flow ───────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   sidebar_label?: string,
 *   steps: Array<{ label, content }>,   // 4-6 steps; last is highlighted
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar  col 1-12  offset 56   height 72
 *   sidebar    col 1-2   offset 144  height 480  (optional)
 *   flow_area  col 3-12  offset 144  height 480
 *   source_bar col 1-12  offset 640  height 24
 */
definePattern('vertical-step-flow', (c) => {
  const title = c.title ?? '';
  const sidebarLabel = c.sidebar_label ?? '';
  const steps = c.steps ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const sidebar = colRange(1, 2);
  const fa = sidebarLabel ? colRange(3, 12) : colRange(1, 12);
  const sb = colRange(1, 12);

  const STEP_COUNT = Math.min(steps.length, 6);
  const FLOW_TOP = 144;
  const FLOW_H = 480;

  // Row: badge_w + gap + content_w; arrow connector between rows
  const BADGE_W = 100;
  const BADGE_GAP = 16;
  const CONTENT_W = fa.width - BADGE_W - BADGE_GAP;
  const ARROW_H = 12;
  const STEP_H = Math.floor((FLOW_H - (STEP_COUNT - 1) * ARROW_H) / STEP_COUNT);

  const stepsHtml = steps.slice(0, STEP_COUNT).map((step, idx) => {
    const isLast = idx === STEP_COUNT - 1;
    const rowTop = FLOW_TOP + idx * (STEP_H + ARROW_H);
    const badgeLeft = fa.left;
    const contentLeft = fa.left + BADGE_W + BADGE_GAP;

    const arrowHtml = !isLast ? `
<div data-region="step_arrow_${idx + 1}" class="ts-region" style="
  left:${badgeLeft + Math.floor(BADGE_W / 2) - 6}px;
  top:${rowTop + STEP_H}px;
  width:12px; height:${ARROW_H}px;
">
  <svg viewBox="0 0 12 ${ARROW_H}" width="12" height="${ARROW_H}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <line x1="6" y1="0" x2="6" y2="${ARROW_H - 4}" stroke="var(--muted)" stroke-width="2" opacity="0.5"/>
    <polygon points="2,${ARROW_H - 5} 6,${ARROW_H} 10,${ARROW_H - 5}" fill="var(--muted)" opacity="0.5"/>
  </svg>
</div>` : '';

    return `
<div data-region="step_badge_${idx + 1}" class="ts-region" style="
  left:${badgeLeft}px; top:${rowTop}px; width:${BADGE_W}px; height:${STEP_H}px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box;
">
  <div style="text-align:center;">
    <div style="
      font-family:var(--font-body);
      font-size:10px;
      color:var(--accent);
      font-weight:600;
      text-transform:uppercase;
      letter-spacing:0.1em;
      margin-bottom:3px;
    ">STEP</div>
    <div style="
      font-family:var(--font-head);
      font-size:var(--h2, 22px);
      color:var(--text);
      font-weight:700;
      line-height:1;
    ">${idx + 1}</div>
  </div>
</div>
<div data-region="step_content_${idx + 1}" class="ts-region" style="
  left:${contentLeft}px; top:${rowTop}px; width:${CONTENT_W}px; height:${STEP_H}px;
  background:${isLast ? 'var(--text)' : 'var(--surface)'};
  border-radius:var(--radius, 8px);
  display:flex; align-items:center;
  box-sizing:border-box; padding:12px 16px;
  overflow:hidden;
">
  <div>
    <div style="
      font-family:var(--font-body);
      font-size:var(--caption, 13px);
      color:${isLast ? 'rgba(255,255,255,0.6)' : 'var(--accent)'};
      font-weight:600;
      margin-bottom:4px;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${step.label ?? ''}</div>
    <div style="
      font-family:var(--font-body);
      font-size:var(--body, 14px);
      color:${isLast ? '#fff' : 'var(--text)'};
      line-height:1.5;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${step.content ?? ''}</div>
  </div>
</div>
${arrowHtml}`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:72px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${sidebarLabel ? `<div data-region="sidebar" class="ts-region" style="
  left:${sidebar.left}px; top:${FLOW_TOP}px; width:${sidebar.width}px; height:${FLOW_H}px;
  display:flex; align-items:center; justify-content:center;
  border-right:1px dashed var(--muted);
  box-sizing:border-box; padding:0 8px;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--caption, 13px);
    color:var(--muted);
    font-weight:600;
    writing-mode:vertical-rl;
    text-orientation:mixed;
    letter-spacing:0.1em;
    text-transform:uppercase;
  ">${sidebarLabel}</div>
</div>` : ''}

${stepsHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: staircase-roadmap ────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   phases: Array<{ year?, number, heading, description }>,   // 4 phases
 *   layer_bands?: Array<{ label }>,   // optional cross-cutting bands
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar      col 1-12  offset 56   height 72
 *   lead_text      col 1-12  offset 144  height 40
 *   staircase_area col 1-12  offset 200  height 376
 *   layer_bands    col 1-12  offset 576  height 56  (optional)
 *   source_bar     col 1-12  offset 640  height 24
 */
definePattern('staircase-roadmap', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const phases = c.phases ?? [];
  const layerBands = c.layer_bands ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const lt = colRange(1, 12);
  const sa = colRange(1, 12);
  const lbr = colRange(1, 12);
  const sb = colRange(1, 12);

  const PHASE_COUNT = Math.min(phases.length, 4);
  const STAIR_TOP = 200;
  const STAIR_H = 376;
  const STAIR_BOTTOM = STAIR_TOP + STAIR_H; // 576

  // Staircase: 4 blocks, left column narrower → right taller
  // Each block same width = sa.width / PHASE_COUNT
  const blockW = Math.floor(sa.width / PHASE_COUNT);

  // Heights: left=small, right=tall. Ratio from spec "left 1: right 4"
  // min_h ≈ STAIR_H/4, each step grows by (STAIR_H - min_h) / (PHASE_COUNT - 1) ≈ 62
  const minH = Math.floor(STAIR_H / PHASE_COUNT); // ~94
  const step = Math.floor((STAIR_H - minH) / (PHASE_COUNT - 1)); // ~94

  const phasesHtml = phases.slice(0, PHASE_COUNT).map((ph, idx) => {
    const blockLeft = sa.left + idx * blockW;
    const blockH = minH + idx * step;
    const blockTop = STAIR_BOTTOM - blockH;
    const isLast = idx === PHASE_COUNT - 1;

    // Arrow after last block
    const arrowHtml = isLast ? `
<div data-region="stair_arrow" class="ts-region" style="
  left:${blockLeft + blockW}px;
  top:${blockTop + Math.floor(blockH / 2) - 12}px;
  width:24px; height:24px;
">
  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <polygon points="0,4 16,12 0,20" fill="var(--muted)" opacity="0.6"/>
  </svg>
</div>` : '';

    return `
<div data-region="stair_block_${idx + 1}" class="ts-region" style="
  left:${blockLeft}px; top:${blockTop}px; width:${blockW}px; height:${blockH}px;
  background:var(--surface);
  border-radius:${isLast ? 'var(--radius, 8px)' : '0'};
  border-top:3px solid var(--accent);
  box-sizing:border-box; padding:16px 12px 12px;
  overflow:hidden;
">
  ${ph.year ? `<div style="
    font-family:var(--font-body);
    font-size:10px;
    color:var(--accent);
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.1em;
    margin-bottom:4px;
  ">${ph.year}</div>` : ''}
  <div style="
    font-family:var(--font-body);
    font-size:11px;
    color:var(--muted);
    margin-bottom:4px;
  ">${ph.number ?? `Step ${String(idx + 1).padStart(2, '0')}`}</div>
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:600;
    line-height:1.3;
    margin-bottom:8px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${ph.heading ?? ''}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--muted);
    line-height:1.5;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${ph.description ?? ''}</div>
</div>
${arrowHtml}`;
  }).join('\n');

  const layerBandsHtml = layerBands.length > 0 ? layerBands.slice(0, 3).map((band, idx) => {
    const bandH = Math.floor(56 / Math.min(layerBands.length, 3));
    return `
<div data-region="layer_band_${idx + 1}" class="ts-region" style="
  left:${lbr.left}px; top:${576 + idx * bandH}px; width:${lbr.width}px; height:${bandH}px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  display:flex; align-items:center;
  box-sizing:border-box; padding:0 16px;
  border-left:3px solid var(--accent);
  opacity:0.8;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--muted);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  ">${band.label ?? ''}</div>
</div>`;
  }).join('\n') : '';

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:72px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${lead ? `<div data-region="lead_text" class="ts-region" style="
  left:${lt.left}px; top:144px; width:${lt.width}px; height:40px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${lead}</div>
</div>` : ''}

${phasesHtml}

${layerBandsHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: two-feature-with-result ─────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   description?: string,
 *   feature_left: { area_label?, heading, body },
 *   feature_right: { area_label?, heading, body },
 *   result_label?: string,
 *   result_text: string,
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar          col 1-12  offset 56   height 80
 *   description_text   col 1-12  offset 152  height 48
 *   feature_card_left  col 1-6   offset 216  height 208
 *   feature_card_right col 7-12  offset 216  height 208
 *   arrow_area         col 1-12  offset 440  height 48
 *   result_box         col 1-12  offset 504  height 112
 *   source_bar         col 1-12  offset 640  height 24
 */
definePattern('two-feature-with-result', (c) => {
  const title = c.title ?? '';
  const description = c.description ?? '';
  const featureLeft = c.feature_left ?? {};
  const featureRight = c.feature_right ?? {};
  const resultLabel = c.result_label ?? '成果';
  const resultText = c.result_text ?? '';
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const dt = colRange(1, 12);
  const fcl = colRange(1, 6);
  const fcr = colRange(7, 12);
  const aa = colRange(1, 12);
  const rb = colRange(1, 12);
  const sb = colRange(1, 12);

  const featureCardHtml = (fc, region, col) => `
<div data-region="${region}" class="ts-region" style="
  left:${col.left}px; top:216px; width:${col.width}px; height:208px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  box-sizing:border-box; padding:20px 20px 16px;
  overflow:hidden;
">
  ${fc.area_label ? `<div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.08em;
    margin-bottom:8px;
  ">${fc.area_label}</div>` : ''}
  <div style="
    font-family:var(--font-head);
    font-size:var(--h2, 22px);
    color:var(--text);
    font-weight:700;
    line-height:1.3;
    margin-bottom:10px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${fc.heading ?? ''}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.6;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${fc.body ?? ''}</div>
</div>`;

  // Arrow: centered in arrow_area (offset 440, height 48)
  // Two branches from each card merging to center arrow
  const arrowCX = aa.left + Math.floor(aa.width / 2);
  const arrowTop = 440;
  const arrowH = 48;

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${description ? `<div data-region="description_text" class="ts-region" style="
  left:${dt.left}px; top:152px; width:${dt.width}px; height:48px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.5;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${description}</div>
</div>` : ''}

${featureCardHtml(featureLeft, 'feature_card_left', fcl)}
${featureCardHtml(featureRight, 'feature_card_right', fcr)}

<div data-region="arrow_area" class="ts-region" style="
  left:${aa.left}px; top:${arrowTop}px; width:${aa.width}px; height:${arrowH}px;
  display:flex; align-items:center; justify-content:center;
">
  <svg viewBox="0 0 ${aa.width} ${arrowH}" width="${aa.width}" height="${arrowH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <!-- Left branch from feature_left card center to midpoint -->
    <line x1="${Math.floor(fcl.width / 2)}" y1="0" x2="${Math.floor(aa.width / 2)}" y2="${arrowH - 10}" stroke="var(--muted)" stroke-width="2" opacity="0.5"/>
    <!-- Right branch from feature_right card center to midpoint -->
    <line x1="${Math.floor(fcl.width + (aa.width - fcl.width) / 2) + Math.floor(fcr.width / 2) - aa.left + aa.left - fcl.left}" y1="0" x2="${Math.floor(aa.width / 2)}" y2="${arrowH - 10}" stroke="var(--muted)" stroke-width="2" opacity="0.5"/>
    <!-- Arrow tip pointing down -->
    <polygon points="${Math.floor(aa.width / 2) - 7},${arrowH - 10} ${Math.floor(aa.width / 2) + 7},${arrowH - 10} ${Math.floor(aa.width / 2)},${arrowH}" fill="var(--muted)" opacity="0.6"/>
  </svg>
</div>

<div data-region="result_box" class="ts-region" style="
  left:${rb.left}px; top:504px; width:${rb.width}px; height:112px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  border-left:4px solid var(--accent);
  display:flex; align-items:center; gap:24px;
  box-sizing:border-box; padding:0 24px;
  overflow:hidden;
">
  <div style="
    flex-shrink:0;
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:0.1em;
    writing-mode:vertical-rl;
    text-orientation:mixed;
  ">${resultLabel}</div>
  <div style="
    flex:1; min-width:0;
    font-family:var(--font-head);
    font-size:var(--h2, 22px);
    color:var(--text);
    font-weight:700;
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${resultText}</div>
</div>

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});
