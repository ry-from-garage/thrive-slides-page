/**
 * consulting.js — 8 strategy-consulting patterns
 *
 * Patterns:
 *   action-title-pyramid        3-pillar with action title bar
 *   horizontal-waterfall        bridge/waterfall chart
 *   marimekko                   variable-width stacked bar (Mekko)
 *   strategic-2x2-bubble        bubble chart in 2x2 matrix with legend
 *   storyline-ghost-deck        3-box ghost deck with arrows
 *   issue-tree-mece             MECE issue tree (root → L1 → L2)
 *   harvey-balls-comparison     Harvey ball comparison table
 *   executive-summary-sowhat    Situation / Complication / Insight + So-What
 *
 * Safe area: x 72..1208 (width 1136), y 56..664, slide 1280×720
 */

import { definePattern } from './registry.js';
import { cardGrid } from '../components/card-grid.js';
import { panel } from '../components/panel.js';
import { table } from '../components/table.js';
import { waterfall } from '../charts/waterfall.js';
import { marimekko } from '../charts/marimekko.js';
import { bubble2x2 } from '../charts/bubble2x2.js';
import { harveyBalls } from '../charts/harvey-balls.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

function colX(n) { return SAFE_LEFT + (n - 1) * COL_UNIT; }
function colW(n) { return n * COL_UNIT - 24; }
function colRange(s, e) { return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) }; }

// ── Shared helpers ────────────────────────────────────────────────────────────
function titleDiv(title, top = 56, height = 88) {
  const r = colRange(1, 12);
  return `<div data-region="action_title_bar" class="ts-region" style="left:${r.left}px;top:${top}px;width:${r.width}px;height:${height}px;display:flex;align-items:center;">
    <div class="ts-title clip-guard" style="position:static;width:100%;font-family:var(--font-head);font-size:var(--h1);font-weight:700;color:var(--text);line-height:1.2;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${title}</div>
  </div>`;
}

function sourceDiv(source) {
  if (!source) return '';
  const r = colRange(1, 12);
  return `<div data-region="source_bar" class="ts-region" style="left:${r.left}px;top:640px;width:${r.width}px;height:24px;display:flex;align-items:center;">
    <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
  </div>`;
}

// ── Pattern: action-title-pyramid ────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   pillars: [{heading, value, body}] × 3,
 *   source?: string
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  y=56   h=120  bg=surface
 *   divider           col 1-12  y=184  h=8
 *   3 pillar cards    col 1-12  y=200  h=424
 *   source_bar        col 1-12  y=640  h=24
 */
definePattern('action-title-pyramid', (c) => {
  const title = c.title ?? '';
  const pillars = c.pillars ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);

  function pillarInner(item) {
    return `<div style="padding:24px 20px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;align-items:center;text-align:center;">
      <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:12px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
      <div style="font-family:var(--font-head);font-size:40px;font-weight:700;color:var(--primary);line-height:1.1;margin-bottom:14px;white-space:nowrap;">${item.value ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.65;white-space:normal;overflow-wrap:break-word;">${item.body ?? ''}</div>
    </div>`;
  }

  const pillarItems = [pillars[0], pillars[1], pillars[2]].map(p => pillarInner(p ?? {}));

  return `
<div data-region="action_title_bar" class="ts-region" style="left:${tb.left}px;top:56px;width:${tb.width}px;height:120px;display:flex;align-items:center;background:var(--surface);border-radius:4px;">
  <div class="ts-title clip-guard" style="position:static;width:100%;padding:0 16px;font-family:var(--font-head);font-size:var(--h1);font-weight:700;color:var(--text);line-height:1.2;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${title}</div>
</div>

<div data-region="divider" class="ts-region" style="left:${tb.left}px;top:184px;width:${tb.width}px;height:4px;background:var(--muted);opacity:0.3;"></div>

${cardGrid(3, pillarItems, { top: 200, height: 424 })}

${sourceDiv(source)}
`.trim();
});

// ── Pattern: horizontal-waterfall ────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   start_label: string,
 *   start_value: number,
 *   deltas: [{label, value}],
 *   end_label: string,
 *   end_value: number,
 *   source?: string
 * }
 */
definePattern('horizontal-waterfall', (c) => {
  const title = c.title ?? '';
  const source = c.source ?? '';
  const deltas = (c.deltas ?? []).map(d => d.value ?? 0);
  const labels = [
    c.start_label ?? 'Start',
    ...(c.deltas ?? []).map(d => d.label ?? ''),
    c.end_label ?? 'End',
  ];

  const r = colRange(1, 12);
  const svgHtml = waterfall({
    start: c.start_value ?? 0,
    deltas,
    end: c.end_value,
    w: 1136,
    h: 448,
    labels,
  });

  return `
${titleDiv(title, 56, 88)}

<div data-region="chart_area" class="ts-region" style="left:${r.left}px;top:160px;width:${r.width}px;height:448px;overflow:hidden;">
  ${svgHtml}
</div>

${sourceDiv(source)}
`.trim();
});

// ── Pattern: marimekko ───────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   columns: [{label, segments:[{label,value}]}],
 *   source?: string
 * }
 */
definePattern('marimekko', (c) => {
  const title = c.title ?? '';
  const source = c.source ?? '';
  const columns = c.columns ?? [];

  const r = colRange(1, 12);
  const svgHtml = marimekko({ columns, w: 1136, h: 448 });

  return `
${titleDiv(title, 56, 88)}

<div data-region="chart_area" class="ts-region" style="left:${r.left}px;top:160px;width:${r.width}px;height:448px;overflow:hidden;">
  ${svgHtml}
</div>

${sourceDiv(source)}
`.trim();
});

// ── Pattern: strategic-2x2-bubble ────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   axis_x: {name, lo, hi},
 *   axis_y: {name, lo, hi},
 *   quadrant_labels: [TL, TR, BL, BR],
 *   items: [{label, x, y, size}],
 *   legend_note?: string,
 *   source?: string
 * }
 */
definePattern('strategic-2x2-bubble', (c) => {
  const title = c.title ?? '';
  const source = c.source ?? '';
  const items = c.items ?? [];
  const axisX = { lo: c.axis_x?.lo ?? '', hi: c.axis_x?.hi ?? '' };
  const axisY = { lo: c.axis_y?.lo ?? '', hi: c.axis_y?.hi ?? '' };
  const legendNote = c.legend_note ?? '';

  const chartR = { left: 72, width: 943 };
  const legendLeft = 1039;
  const legendWidth = 169;

  const svgHtml = bubble2x2({ items, w: 943, h: 464, axisX, axisY });

  const legendBody = `<div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);white-space:pre-wrap;line-height:1.6;">${legendNote}</div>`;
  const legendHtml = panel({ left: legendLeft, top: 152, width: legendWidth, height: 464, title: '凡例', body: legendBody, fill: 'surface' });

  return `
${titleDiv(title, 56, 80)}

<div data-region="chart_area" class="ts-region" style="left:${chartR.left}px;top:152px;width:${chartR.width}px;height:464px;overflow:hidden;">
  ${svgHtml}
</div>

${legendHtml}

${sourceDiv(source)}
`.trim();
});

// ── Pattern: storyline-ghost-deck ────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   boxes: [{text}] × 3,
 *   logic_type?: string,
 *   note?: string
 * }
 *
 * Layout:
 *   deck_title   col 1-12  y=56  h=72
 *   3 boxes + 2 arrows  y=232  h=168
 *   logic_type   col 1-12  y=576 h=32
 *   note         col 1-12  y=640 h=24
 */
definePattern('storyline-ghost-deck', (c) => {
  const title = c.title ?? '';
  const boxes = c.boxes ?? [];
  const logicType = c.logic_type ?? '';
  const note = c.note ?? '';

  const tb = colRange(1, 12);
  const ltb = colRange(1, 12);

  // Box positions (pre-computed)
  const box1 = { left: 72, width: 267 };
  const arrow12 = { left: 362, width: 73 };
  const box2 = { left: 459, width: 267 };
  const arrow23 = { left: 748, width: 73 };
  const box3 = { left: 845, width: 267 };
  const boxTop = 232;
  const boxHeight = 168;

  function boxHtml(pos, item) {
    const text = item?.text ?? '';
    return `<div data-region="box" class="ts-region" style="left:${pos.left}px;top:${boxTop}px;width:${pos.width}px;height:${boxHeight}px;background:var(--surface);border:1px solid var(--muted);border-radius:4px;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;">
      <div style="font-family:var(--font-body);font-size:var(--body);color:var(--text);line-height:1.6;text-align:center;white-space:normal;overflow-wrap:break-word;">${text}</div>
    </div>`;
  }

  function arrowHtml(pos) {
    const midH = boxHeight / 2;
    return `<div data-region="arrow" class="ts-region" style="left:${pos.left}px;top:${boxTop}px;width:${pos.width}px;height:${boxHeight}px;display:flex;align-items:center;justify-content:center;">
      <svg viewBox="0 0 ${pos.width} 40" width="${pos.width}" height="40" xmlns="http://www.w3.org/2000/svg">
        <line x1="4" y1="20" x2="${pos.width - 16}" y2="20" stroke="var(--muted)" stroke-width="2"/>
        <polygon points="${pos.width - 16},14 ${pos.width - 4},20 ${pos.width - 16},26" fill="var(--muted)"/>
      </svg>
    </div>`;
  }

  return `
<div data-region="deck_title_area" class="ts-region" style="left:${tb.left}px;top:56px;width:${tb.width}px;height:72px;display:flex;align-items:center;">
  <div class="ts-title clip-guard" style="position:static;width:100%;font-family:var(--font-head);font-size:var(--h1);font-weight:700;color:var(--text);line-height:1.2;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${title}</div>
</div>

${boxHtml(box1, boxes[0])}
${arrowHtml(arrow12)}
${boxHtml(box2, boxes[1])}
${arrowHtml(arrow23)}
${boxHtml(box3, boxes[2])}

<div data-region="logic_type_label" class="ts-region" style="left:${ltb.left}px;top:576px;width:${ltb.width}px;height:32px;display:flex;align-items:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${logicType}</div>
</div>

${note ? `<div data-region="note_area" class="ts-region" style="left:${ltb.left}px;top:640px;width:${ltb.width}px;height:24px;display:flex;align-items:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${note}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: issue-tree-mece ─────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   root: string,
 *   l1_nodes: [{label}] × 3,
 *   l2_nodes: [{label}] × 6,
 *   mece_note?: string
 * }
 */
definePattern('issue-tree-mece', (c) => {
  const title = c.title ?? '';
  const root = c.root ?? '';
  const l1 = c.l1_nodes ?? [];
  const l2 = c.l2_nodes ?? [];
  const meceNote = c.mece_note ?? '';

  const tb = colRange(1, 12);

  // Box dimensions
  const rootBox = { left: 72, top: 248, width: 170, height: 112 };
  const l1Left = 362;
  const l1Width = 267;
  const l1Height = 112;
  const l1Tops = [144, 272, 416];

  const l2Left = 748;
  const l2Width = 267;
  const l2Height = 64;
  // 6 nodes, distributed: 2 per L1 parent
  const l2Tops = [152, 228, 284, 360, 424, 500];

  // SVG connector overlay: full tree area
  const svgLeft = 72;
  const svgTop = 144;
  const svgWidth = 1136;
  const svgHeight = 496;

  // In SVG coords (origin = svgLeft, svgTop)
  const rootCX = rootBox.left - svgLeft + rootBox.width; // right edge of root = 170
  const rootCY = rootBox.top - svgTop + rootBox.height / 2; // center y of root = 248-144+56=160

  const midX1 = 290; // between root right (170) and L1 left (362-72=290)
  const l1LeftSvg = l1Left - svgLeft; // 290

  const l1CenterYs = l1Tops.map(t => t - svgTop + l1Height / 2); // [56, 184, 328]

  const l2LeftSvg = l2Left - svgLeft; // 676
  const l1RightSvg = l1Left - svgLeft + l1Width; // 290+267=557
  const midX2 = 620; // between L1 right (557) and L2 left (676)

  const l2CenterYs = l2Tops.map(t => t - svgTop + l2Height / 2);

  // Build connector SVG
  let connLines = '';

  // Root → L1: horizontal line from root right (170, rootCY) to midX1 (290, rootCY),
  // then vertical spine from top L1 to bottom L1 center,
  // then horizontal branches from spine to L1 left edges
  const l1SpineTop = l1CenterYs[0];
  const l1SpineBot = l1CenterYs[2];

  connLines += `<line x1="${rootCX}" y1="${rootCY}" x2="${midX1}" y2="${rootCY}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
  connLines += `<line x1="${midX1}" y1="${l1SpineTop}" x2="${midX1}" y2="${l1SpineBot}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
  for (const cy of l1CenterYs) {
    connLines += `<line x1="${midX1}" y1="${cy}" x2="${l1LeftSvg}" y2="${cy}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
  }

  // L1 → L2: each L1 connects to its 2 L2 children
  for (let i = 0; i < 3; i++) {
    const parentY = l1CenterYs[i];
    const child0Y = l2CenterYs[i * 2];
    const child1Y = l2CenterYs[i * 2 + 1];
    const spineTop = Math.min(child0Y, child1Y);
    const spineBot = Math.max(child0Y, child1Y);

    connLines += `<line x1="${l1RightSvg}" y1="${parentY}" x2="${midX2}" y2="${parentY}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
    connLines += `<line x1="${midX2}" y1="${spineTop}" x2="${midX2}" y2="${spineBot}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
    connLines += `<line x1="${midX2}" y1="${child0Y}" x2="${l2LeftSvg}" y2="${child0Y}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
    connLines += `<line x1="${midX2}" y1="${child1Y}" x2="${l2LeftSvg}" y2="${child1Y}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
  }

  const connectorSvg = `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;left:0;top:0;pointer-events:none;">${connLines}</svg>`;

  // Build node boxes
  const rootHtml = `<div data-region="tree_root" class="ts-region" style="left:${rootBox.left}px;top:${rootBox.top}px;width:${rootBox.width}px;height:${rootBox.height}px;background:var(--primary);border-radius:4px;display:flex;align-items:center;justify-content:center;padding:10px;box-sizing:border-box;">
    <div style="font-family:var(--font-head);font-size:14px;font-weight:700;color:#fff;line-height:1.4;text-align:center;white-space:pre-wrap;overflow-wrap:break-word;">${root}</div>
  </div>`;

  const l1Html = l1.map((node, i) => `<div data-region="tree_l1" class="ts-region" style="left:${l1Left}px;top:${l1Tops[i]}px;width:${l1Width}px;height:${l1Height}px;background:var(--surface);border:1px solid var(--muted);border-radius:4px;display:flex;align-items:center;justify-content:center;padding:10px;box-sizing:border-box;">
    <div style="font-family:var(--font-body);font-size:var(--body);font-weight:600;color:var(--text);line-height:1.4;text-align:center;white-space:pre-wrap;overflow-wrap:break-word;">${node.label ?? ''}</div>
  </div>`).join('\n');

  const l2Html = l2.map((node, i) => `<div data-region="tree_l2" class="ts-region" style="left:${l2Left}px;top:${l2Tops[i]}px;width:${l2Width}px;height:${l2Height}px;background:var(--surface);border:1px solid var(--muted);border-radius:4px;display:flex;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;">
    <div style="font-family:var(--font-body);font-size:14px;color:var(--text);line-height:1.35;text-align:center;white-space:pre-wrap;overflow-wrap:break-word;">${node.label ?? ''}</div>
  </div>`).join('\n');

  return `
${titleDiv(title, 56, 72)}

<div data-region="tree_body" class="ts-region" style="left:${svgLeft}px;top:${svgTop}px;width:${svgWidth}px;height:${svgHeight}px;position:relative;">
  ${connectorSvg}
</div>

${rootHtml}
${l1Html}
${l2Html}

${meceNote ? `<div data-region="mece_note" class="ts-region" style="left:${tb.left}px;top:640px;width:${tb.width}px;height:24px;display:flex;align-items:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${meceNote}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: harvey-balls-comparison ─────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   criteria: [string] × 5,
 *   options: [{name, scores:[0-4]×5, overall?}] × 4,
 *   legend?: string,
 *   source?: string
 * }
 */
definePattern('harvey-balls-comparison', (c) => {
  const title = c.title ?? '';
  const criteria = c.criteria ?? [];
  const options = c.options ?? [];
  const legend = c.legend ?? '';
  const source = c.source ?? '';

  const tb = colRange(1, 12);

  const headers = ['', ...criteria, '総合'];
  const rows = options.map(opt => [
    opt.name ?? '',
    ...(opt.scores ?? []).map(s => harveyBalls(s, 28)),
    opt.overall != null ? harveyBalls(opt.overall, 28) : '',
  ]);

  const tableHtml = table({
    headers,
    rows,
    highlightCol: 0,
    top: 144,
    height: 472,
    left: 72,
    width: 1136,
  });

  return `
${titleDiv(title, 56, 72)}

${tableHtml}

${legend ? `<div data-region="legend_bar" class="ts-region" style="left:${tb.left}px;top:626px;width:${tb.width}px;height:24px;display:flex;align-items:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${legend}</div>
</div>` : ''}

${source ? `<div data-region="source_bar" class="ts-region" style="left:${tb.left}px;top:652px;width:${tb.width}px;height:24px;display:flex;align-items:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: executive-summary-sowhat ────────────────────────────────────────
/**
 * content: {
 *   situation: {heading, items:[string]},
 *   complication: {heading, items:[string]},
 *   insights: {heading, items:[string]},
 *   sowhat: string,
 *   source?: string
 * }
 */
definePattern('executive-summary-sowhat', (c) => {
  const situation = c.situation ?? {};
  const complication = c.complication ?? {};
  const insights = c.insights ?? {};
  const sowhat = c.sowhat ?? '';
  const source = c.source ?? '';

  const dividerR = colRange(1, 12);

  function bulletList(items) {
    const lis = (items ?? []).map(item =>
      `<li style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);margin-bottom:6px;line-height:1.55;white-space:normal;overflow-wrap:break-word;">${item}</li>`
    ).join('');
    return `<ul style="margin:0;padding-left:16px;list-style:disc;">${lis}</ul>`;
  }

  const situationHtml = panel({
    left: 72, top: 56, width: 363, height: 288,
    title: situation.heading ?? '状況',
    body: bulletList(situation.items),
    fill: 'surface',
  });

  const complicationHtml = panel({
    left: 459, top: 56, width: 363, height: 288,
    title: complication.heading ?? '論点',
    body: bulletList(complication.items),
    fill: 'surface',
  });

  const insightsHtml = panel({
    left: 845, top: 56, width: 363, height: 288,
    title: insights.heading ?? '主要示唆',
    body: bulletList(insights.items),
    fill: 'surface',
  });

  const sowhatBody = `<div style="font-family:var(--font-head);font-size:var(--h1);font-weight:700;color:var(--text);line-height:1.3;white-space:normal;overflow-wrap:break-word;">${sowhat}</div>`;
  const sowhatHtml = panel({
    left: 72, top: 376, width: 1136, height: 200,
    title: 'So-What',
    body: sowhatBody,
    fill: 'surface',
  });

  return `
${situationHtml}
${complicationHtml}
${insightsHtml}

<div data-region="block_divider" class="ts-region" style="left:${dividerR.left}px;top:352px;width:${dividerR.width}px;height:8px;background:var(--muted);opacity:0.25;border-radius:2px;"></div>

${sowhatHtml}

${sourceDiv(source)}
`.trim();
});
