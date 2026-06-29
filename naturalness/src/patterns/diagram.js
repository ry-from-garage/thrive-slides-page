/**
 * diagram.js — ダイアグラムパターン群 (strategy-consulting theme)
 *
 * Patterns:
 *   cycle-diagram          — PDCA/サイクル図（環状ステップ + 時計回り矢印）
 *   hub-spoke              — ハブ＆スポーク図（中心 + 放射スポーク）
 *   four-quadrant-center   — 2×2象限 + 中央ハブ
 *   circle-hub-list-right  — 左円ハブ + 右リスト
 *   center-illustration-spoke — 中央ビジュアル + 集約スポーク
 *   org-chart-tree         — 組織図ツリー（3階層）
 *   bilateral-flow         — 双方向フロー（2主体）
 *
 * Geometry is library-backed (build-time, Node):
 *   - d3-shape  arc()         → cycle ring segments
 *   - d3-shape  linkVertical()→ org-chart connectors (attach to box edges)
 *   - d3-hierarchy tree()     → org-chart node layout
 *   - src/diagrams/radial.js  → shared hub/spoke/center placement, edge-to-edge
 *                               connectors, angle-based label sides
 *   - src/diagrams/svg.js     → themed overlay SVG, <marker orient="auto"> arrows
 *   - src/diagrams/text.js    → no-DOM text measurement to size circles to fit
 *
 * Output is STATIC themed SVG (no client JS). Colors via CSS vars / currentColor.
 *
 * Grid (safe-area x 72..1208, y 56..664): 12 cols, COL_UNIT = 96.6667px.
 */

import { definePattern } from './registry.js';
import { arc as d3arc } from 'd3-shape';
import { hierarchy as d3hierarchy, tree as d3tree } from 'd3-hierarchy';
import { linkVertical } from 'd3-shape';
import { radialLayout, labelPlacement } from '../diagrams/radial.js';
import { arrowMarker, overlaySvg, line as svgLine, pathEl, r1 } from '../diagrams/svg.js';
import { fitCircleRadius } from '../diagrams/text.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;
const SAFE_RIGHT = 1208;

function colX(n) {
  return SAFE_LEFT + (n - 1) * COL_UNIT;
}
function colW(n) {
  return n * COL_UNIT - 24;
}
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// HTML-escape newline → <br> within label text (labels may carry "\n").
function brs(str = '') {
  return String(str).replace(/\n/g, '<br>');
}

// ── Shared: title / lead / source regions ──────────────────────────────────────
function titleHtml(title, height = 80) {
  const r = colRange(1, 12);
  return `<div data-region="title_bar" class="ts-region" style="
  left:${r.left}px; top:56px; width:${r.width}px; height:${height}px;
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
</div>`;
}

function leadHtml(lead, top = 152, height = 40) {
  if (!lead) return '';
  const r = colRange(1, 12);
  return `<div data-region="lead_text" class="ts-region" style="
  left:${r.left}px; top:${top}px; width:${r.width}px; height:${height}px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${lead}</div>
</div>`;
}

function sourceHtml(source) {
  if (!source) return '';
  const r = colRange(1, 12);
  return `<div data-region="source_bar" class="ts-region" style="
  left:${r.left}px; top:640px; width:${r.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>`;
}

// Reusable filled hub circle + centered label (used by several patterns).
function hubCircle({ cx, cy, r, region = 'hub_shape', fill = 'var(--primary)' }) {
  return `<div data-region="${region}" class="ts-region" style="
  left:${Math.round(cx - r)}px; top:${Math.round(cy - r)}px;
  width:${Math.round(r * 2)}px; height:${Math.round(r * 2)}px;
  border-radius:50%; background:${fill};
"></div>`;
}

function hubLabelBox({ cx, cy, r, label, region = 'hub_label', fontSize = 16, color = 'var(--bg)' }) {
  return `<div data-region="${region}" class="ts-region" style="
  left:${Math.round(cx - r)}px; top:${Math.round(cy - r)}px;
  width:${Math.round(r * 2)}px; height:${Math.round(r * 2)}px;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none; box-sizing:border-box; padding:6px;
">
  <div style="
    font-family:var(--font-head);
    font-size:${fontSize}px;
    color:${color};
    font-weight:700;
    text-align:center;
    line-height:1.25;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${brs(label)}</div>
</div>`;
}

// ── Pattern: cycle-diagram ────────────────────────────────────────────────────
/**
 * Ring of N segments (d3 arc) around a center label, clockwise arrows on the
 * ring boundaries, step label boxes radially outside each segment with a
 * connector line to the ring edge.
 */
definePattern('cycle-diagram', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const centerLabel = c.center_label ?? '';
  const steps = (c.steps ?? []).slice(0, 6);
  const source = c.source ?? '';

  const N = steps.length || 4;
  const CX = 640;
  const CY = 416; // diagram_area center (208 + 208)

  // Center label circle sized to fit its text; ring sits just outside it.
  const R_INNER = fitCircleRadius(centerLabel, 13, { padding: 12, min: 52, max: 72 });
  const R_RING_IN = R_INNER + 20; // ring inner edge
  const R_RING_OUT = R_RING_IN + 72; // ring outer edge
  const R_LABEL = 248;    // step-label box center radius

  const LABEL_W = 168;
  const LABEL_H = 76;

  const startAngle = -Math.PI / 2; // top
  const step = (2 * Math.PI) / N;
  const GAP = 0.06; // radians between segments

  // d3 arc generator (centered at origin; we translate into the overlay later).
  const ring = d3arc().innerRadius(R_RING_IN).outerRadius(R_RING_OUT).cornerRadius(2);

  // Build defs (arrow marker) once.
  const arrow = arrowMarker({ id: 'cyc-arrow', color: 'var(--secondary)', size: 11 });

  let body = '';

  // Ring segments — d3 arc path, translated to (CX,CY).
  for (let i = 0; i < N; i++) {
    // d3 arc angles: 0 = up (12 o'clock), clockwise positive. Our screen "top"
    // start maps to d3 angle 0; segment i spans [i*step, (i+1)*step].
    const a0 = i * step + GAP / 2;
    const a1 = (i + 1) * step - GAP / 2;
    const d = ring({ startAngle: a0, endAngle: a1 });
    body += `<path d="${d}" transform="translate(${CX},${CY})"
      fill="var(--surface)" stroke="var(--bg)" stroke-width="2"/>`;
  }

  // Clockwise arrows on each segment boundary (just outside the ring).
  for (let i = 0; i < N; i++) {
    const boundary = startAngle + (i + 1) * step; // screen-space angle of boundary
    const rA = (R_RING_IN + R_RING_OUT) / 2;
    const px = CX + Math.cos(boundary) * rA;
    const py = CY + Math.sin(boundary) * rA;
    // Tangent (clockwise) direction for a tiny oriented arrow segment.
    const tx = -Math.sin(boundary);
    const ty = Math.cos(boundary);
    const L = 9;
    body += svgLine({
      x1: px - tx * L, y1: py - ty * L,
      x2: px + tx * L, y2: py + ty * L,
      markerEnd: arrow.id, width: 2.5, opacity: 0.95, color: 'var(--secondary)',
    });
  }

  // Connector lines: ring outer edge → step label box center.
  const labels = steps.map((stepData, i) => {
    const angle = startAngle + (i + 0.5) * step; // mid-segment angle
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const lx = CX + ux * R_LABEL;
    const ly = CY + uy * R_LABEL;
    let boxLeft = lx - LABEL_W / 2;
    let boxTop = ly - LABEL_H / 2;
    boxLeft = Math.max(SAFE_LEFT, Math.min(SAFE_RIGHT - LABEL_W, boxLeft));
    boxTop = Math.max(212, Math.min(620 - LABEL_H, boxTop));
    const boxCX = boxLeft + LABEL_W / 2;
    const boxCY = boxTop + LABEL_H / 2;

    // Connector from ring outer edge toward the box (stop at box edge).
    const edgeX = CX + ux * (R_RING_OUT + 2);
    const edgeY = CY + uy * (R_RING_OUT + 2);
    body += svgLine({
      x1: edgeX, y1: edgeY, x2: boxCX - ux * (LABEL_W / 2), y2: boxCY - uy * (LABEL_H / 2),
      width: 1.25, opacity: 0.5,
    });

    return `<div data-region="step_label_${i + 1}" class="ts-region" style="
  left:${Math.round(boxLeft)}px; top:${Math.round(boxTop)}px;
  width:${LABEL_W}px; height:${LABEL_H}px;
  border:1px solid var(--muted);
  border-radius:4px;
  box-sizing:border-box; padding:8px 10px;
  background:var(--bg);
  overflow:hidden;
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:13px; color:var(--text); font-weight:700;
    line-height:1.25; margin-bottom:3px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${stepData.label ?? ''}</div>
  ${stepData.body ? `<div style="
    font-family:var(--font-body);
    font-size:11px; color:var(--muted); line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${stepData.body}</div>` : ''}
</div>`;
  }).join('\n');

  const overlay = overlaySvg({ defs: arrow.def, body, region: 'cycle_diagram' });

  // Center label circle (filled) + text.
  const centerShape = hubCircle({ cx: CX, cy: CY, r: R_INNER, region: 'center_shape', fill: 'var(--primary)' });
  const centerText = hubLabelBox({ cx: CX, cy: CY, r: R_INNER, label: centerLabel, region: 'center_label', fontSize: 13 });

  return `
${titleHtml(title)}
${leadHtml(lead)}
${overlay}
${centerShape}
${centerText}
${labels}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: hub-spoke ────────────────────────────────────────────────────────
/**
 * Central hub circle with N spokes on a circle. Connector runs hub-edge →
 * badge-edge. Each spoke's heading/body box sits on the angle-correct side
 * (left of node on the left half, right on the right half, above/below for
 * top/bottom) via the shared radial helper.
 */
definePattern('hub-spoke', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const hubLabel = c.hub_label ?? '';
  const spokes = (c.spokes ?? []).slice(0, 6);
  const source = c.source ?? '';

  const N = spokes.length || 5;
  const CX = 640;
  const CY = 416;

  const R_HUB = fitCircleRadius(hubLabel, 16, { padding: 14, min: 64, max: 86 });
  const R_SPOKE = 190;  // badge center radius
  const BADGE_R = 19;
  const TEXT_W = 188;
  const TEXT_H = 76;

  const { nodes } = radialLayout({
    cx: CX, cy: CY, n: N, radius: R_SPOKE,
    hubR: R_HUB, nodeR: BADGE_R, startAngle: -Math.PI / 2,
  });

  const bounds = { left: SAFE_LEFT, right: SAFE_RIGHT, top: 212, bottom: 620 };

  let body = '';
  // Connectors hub-edge → badge-edge (no arrowheads; equal radial relationship).
  for (const node of nodes) {
    body += svgLine({
      x1: node.conn.x1, y1: node.conn.y1, x2: node.conn.x2, y2: node.conn.y2,
      width: 1.5, opacity: 0.45,
    });
  }
  const overlay = overlaySvg({ body, region: 'hub_spoke' });

  const hubShape = hubCircle({ cx: CX, cy: CY, r: R_HUB, fill: 'var(--primary)' });
  const hubText = hubLabelBox({ cx: CX, cy: CY, r: R_HUB, label: hubLabel, fontSize: 16 });

  const spokesHtml = nodes.map((node, i) => {
    const spoke = spokes[i] ?? {};
    const place = labelPlacement(node, { nodeR: BADGE_R, gap: 12, width: TEXT_W, height: TEXT_H, bounds });

    return `<div data-region="spoke_badge_${i + 1}" class="ts-region" style="
  left:${Math.round(node.x - BADGE_R)}px; top:${Math.round(node.y - BADGE_R)}px;
  width:${BADGE_R * 2}px; height:${BADGE_R * 2}px;
  border-radius:50%; background:var(--surface);
  border:1.5px solid var(--secondary);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-body); font-size:11px; color:var(--primary); font-weight:700;
">${String(i + 1).padStart(2, '0')}</div>
<div data-region="spoke_text_${i + 1}" class="ts-region" style="
  left:${place.left}px; top:${place.top}px;
  width:${place.width}px; height:${place.height}px;
  box-sizing:border-box;
  overflow:hidden; text-align:${place.align};
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:14px; color:var(--text); font-weight:700;
    line-height:1.3; margin-bottom:4px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${spoke.heading ?? ''}</div>
  ${spoke.body ? `<div style="
    font-family:var(--font-body);
    font-size:11px; color:var(--muted); line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${spoke.body}</div>` : ''}
</div>`;
  }).join('\n');

  return `
${titleHtml(title)}
${leadHtml(lead)}
${overlay}
${hubShape}
${hubText}
${spokesHtml}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: four-quadrant-center ─────────────────────────────────────────────
/**
 * 2×2 quadrant blocks with a center hub circle overlaid at the grid crossing.
 * Thin connectors run from the hub edge into each quadrant for a "radiates
 * from core" read.
 */
definePattern('four-quadrant-center', (c) => {
  const title = c.title ?? '';
  const centerLabel = c.center_label ?? '';
  const topLeft = c.top_left ?? {};
  const topRight = c.top_right ?? {};
  const btmLeft = c.bottom_left ?? {};
  const btmRight = c.bottom_right ?? {};
  const source = c.source ?? '';

  const qtl = colRange(1, 6);
  const qtr = colRange(7, 12);
  const hub = colRange(5, 8);

  function quadHtml(region, col, top, height, q, padTop) {
    return `<div data-region="${region}" class="ts-region" style="
  left:${col.left}px; top:${top}px; width:${col.width}px; height:${height}px;
  background:var(--surface);
  box-sizing:border-box; padding:${padTop}px 24px 16px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px); color:var(--text); font-weight:700;
    line-height:1.3; margin-bottom:8px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${q.heading ?? ''}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px); color:var(--muted); line-height:1.6;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${q.body ?? ''}</div>
</div>`;
  }

  // Hub center at the crossing of the 2×2 grid.
  const hubCX = hub.left + Math.round(hub.width / 2);
  const hubCY = 364;
  const hubR = 46;

  // Connectors from hub edge toward each quadrant inner corner.
  const corners = [
    { x: qtl.left + qtl.width - 40, y: 152 + 288 - 40 },   // toward TL inner-bottom-right
    { x: qtr.left + 40,            y: 152 + 288 - 40 },     // toward TR inner-bottom-left
    { x: qtl.left + qtl.width - 40, y: 464 + 40 },          // toward BL inner-top-right
    { x: qtr.left + 40,            y: 464 + 40 },            // toward BR inner-top-left
  ];
  let body = '';
  for (const corner of corners) {
    const dx = corner.x - hubCX;
    const dy = corner.y - hubCY;
    const dist = Math.hypot(dx, dy) || 1;
    const sx = hubCX + (dx / dist) * hubR;
    const sy = hubCY + (dy / dist) * hubR;
    body += svgLine({ x1: sx, y1: sy, x2: corner.x, y2: corner.y, width: 1, opacity: 0.3, dash: '3 4' });
  }
  const overlay = overlaySvg({ body, region: 'quadrant_connectors' });

  const hubShape = hubCircle({ cx: hubCX, cy: hubCY, r: hubR, region: 'center_hub_shape', fill: 'var(--primary)' });
  const hubText = hubLabelBox({ cx: hubCX, cy: hubCY, r: hubR, label: centerLabel, region: 'center_hub_label', fontSize: 12 });

  return `
${titleHtml(title)}
${overlay}
${quadHtml('quadrant_top_left', qtl, 152, 288, topLeft, 24)}
${quadHtml('quadrant_top_right', qtr, 152, 288, topRight, 24)}
${quadHtml('quadrant_bottom_left', qtl, 464, 176, btmLeft, 20)}
${quadHtml('quadrant_bottom_right', qtr, 464, 176, btmRight, 20)}
${hubShape}
${hubText}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: circle-hub-list-right ───────────────────────────────────────────
/**
 * Big left hub circle; right column of numbered rows. Each connector runs from
 * the hub's right-edge to the row badge (a clean curve), so the lines visibly
 * originate at the hub.
 */
definePattern('circle-hub-list-right', (c) => {
  const title = c.title ?? '';
  const hubLabel = c.hub_label ?? '';
  const items = (c.items ?? []).slice(0, 7);
  const source = c.source ?? '';

  const hubArea = colRange(1, 4);
  const listArea = colRange(5, 12);

  const HUB_R = fitCircleRadius(hubLabel, 18, { padding: 18, min: 96, max: 124 });
  const HUB_CX = hubArea.left + Math.round(hubArea.width / 2);
  const HUB_CY = 152 + Math.round(464 / 2); // 384

  const LIST_TOP = 152;
  const LIST_H = 464;
  const itemCount = items.length || 1;
  const rowH = Math.floor(LIST_H / itemCount);
  const BADGE_R = 16;
  const BADGE_GAP = 14;

  const badgeCX = listArea.left + BADGE_R;
  const hubEdgeX = HUB_CX + HUB_R;

  // Connectors: hub right-edge → each badge left-edge (gentle quadratic curve).
  let body = '';
  items.forEach((_, i) => {
    const rowTop = LIST_TOP + i * rowH;
    const cy = rowTop + Math.round(rowH / 2);
    const x1 = hubEdgeX;
    const y1 = HUB_CY + (cy - HUB_CY) * (HUB_R / (HUB_R + 40)); // start a touch toward the row
    const x2 = badgeCX - BADGE_R;
    const midX = (x1 + x2) / 2;
    body += pathEl({
      d: `M ${r1(x1)} ${r1(HUB_CY + (cy - HUB_CY) * 0.0)} C ${r1(midX)} ${r1(HUB_CY)}, ${r1(midX)} ${r1(cy)}, ${r1(x2)} ${r1(cy)}`,
      width: 1, opacity: 0.35,
    });
  });
  const overlay = overlaySvg({ body, region: 'hub_list_connectors' });

  const hubShape = hubCircle({ cx: HUB_CX, cy: HUB_CY, r: HUB_R, region: 'hub_circle', fill: 'var(--primary)' });
  const hubText = hubLabelBox({ cx: HUB_CX, cy: HUB_CY, r: HUB_R, label: hubLabel, fontSize: 18 });

  const listHtml = items.map((item, i) => {
    const rowTop = LIST_TOP + i * rowH;
    const cy = rowTop + Math.round(rowH / 2);
    const compact = rowH < 60;
    const rowContent = compact
      ? `<div style="font-family:var(--font-head);font-size:13px;color:var(--text);font-weight:700;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${item.heading ?? ''}</div>
         ${item.body ? `<div style="font-family:var(--font-body);font-size:11px;color:var(--muted);line-height:1.3;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${item.body}</div>` : ''}`
      : `<div style="font-family:var(--font-head);font-size:15px;color:var(--text);font-weight:700;line-height:1.3;margin-bottom:3px;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${item.heading ?? ''}</div>
         ${item.body ? `<div style="font-family:var(--font-body);font-size:12px;color:var(--muted);line-height:1.4;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${item.body}</div>` : ''}`;

    return `<div data-region="item_badge_${i + 1}" class="ts-region" style="
  left:${listArea.left}px; top:${cy - BADGE_R}px;
  width:${BADGE_R * 2}px; height:${BADGE_R * 2}px;
  border-radius:50%; background:var(--primary);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-body); font-size:10px; color:var(--bg); font-weight:700;
">${String(i + 1).padStart(2, '0')}</div>
<div data-region="item_text_${i + 1}" class="ts-region" style="
  left:${listArea.left + BADGE_R * 2 + BADGE_GAP}px;
  top:${rowTop + 4}px;
  width:${listArea.width - BADGE_R * 2 - BADGE_GAP}px;
  height:${rowH - 8}px;
  box-sizing:border-box;
  display:flex; flex-direction:column; justify-content:center;
  overflow:hidden;
  border-bottom:${i < itemCount - 1 ? '1px solid var(--surface)' : 'none'};
">
  ${rowContent}
</div>`;
  }).join('\n');

  return `
${titleHtml(title)}
${overlay}
${hubShape}
${hubText}
${listHtml}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: center-illustration-spoke ───────────────────────────────────────
/**
 * Central plate (platform). N source nodes on a circle; each node is a circle
 * sized to fit its label OR carries the label outside. Arrows point INWARD
 * (node → center) to express aggregation, oriented along the connector via a
 * <marker orient="auto">.
 */
definePattern('center-illustration-spoke', (c) => {
  const title = c.title ?? '';
  const centerLabel = c.center_label ?? '';
  const spokes = (c.spokes ?? []).slice(0, 6);
  const source = c.source ?? '';

  const N = spokes.length || 5;
  const CX = 640;
  const CY = 392; // 152 + 240

  const PLATE_W = 236;
  const PLATE_H = 188;
  const PLATE_R = Math.hypot(PLATE_W, PLATE_H) / 2; // collision radius for arrow target

  const NODE_R = 26;          // small index node; label sits OUTSIDE it
  const R_SPOKE = 250;        // node center radius from center

  const LABEL_W = 168;
  const LABEL_H = 52;

  const bounds = { left: SAFE_LEFT, right: SAFE_RIGHT, top: 156, bottom: 628 };

  // Use top as the start so 5 spokes read top / upper-sides / lower-sides.
  const { nodes } = radialLayout({
    cx: CX, cy: CY, n: N, radius: R_SPOKE,
    hubR: PLATE_R, nodeR: NODE_R, startAngle: -Math.PI / 2,
  });

  // Inward aggregation arrows: from node edge → plate edge, arrowhead at plate.
  const arrow = arrowMarker({ id: 'cis-arrow', color: 'var(--secondary)', size: 11 });
  let body = '';
  for (const node of nodes) {
    // connIn already runs node-edge → hub-edge (inward). Trim the hub end to the
    // plate's elliptical edge along the node direction so the head meets the plate.
    const px = CX - node.ux * (PLATE_R * 0.7 + 6);
    const py = CY - node.uy * (PLATE_R * 0.62 + 6);
    body += svgLine({
      x1: node.connIn.x1, y1: node.connIn.y1, x2: px, y2: py,
      markerEnd: arrow.id, width: 2, opacity: 0.75, color: 'var(--secondary)',
    });
  }
  const overlay = overlaySvg({ defs: arrow.def, body, region: 'center_spoke' });

  // Center plate (rounded rect).
  const plate = `<div data-region="center_placeholder" class="ts-region" style="
  left:${Math.round(CX - PLATE_W / 2)}px; top:${Math.round(CY - PLATE_H / 2)}px;
  width:${PLATE_W}px; height:${PLATE_H}px;
  background:var(--primary); border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:12px; overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px); color:var(--bg); font-weight:700;
    text-align:center; line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${brs(centerLabel)}</div>
</div>`;

  const spokesHtml = nodes.map((node, i) => {
    const spoke = spokes[i] ?? {};
    const place = labelPlacement(node, { nodeR: NODE_R, gap: 8, width: LABEL_W, height: LABEL_H, bounds });
    return `<div data-region="spoke_node_${i + 1}" class="ts-region" style="
  left:${Math.round(node.x - NODE_R)}px; top:${Math.round(node.y - NODE_R)}px;
  width:${NODE_R * 2}px; height:${NODE_R * 2}px;
  border-radius:50%; background:var(--surface);
  border:1.5px solid var(--secondary);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-body); font-size:11px; color:var(--primary); font-weight:700;
  box-sizing:border-box;
">${String(i + 1).padStart(2, '0')}</div>
<div data-region="spoke_label_${i + 1}" class="ts-region" style="
  left:${place.left}px; top:${place.top}px;
  width:${place.width}px; height:${place.height}px;
  box-sizing:border-box; padding:0 4px;
  overflow:hidden; text-align:${place.align};
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:13px; color:var(--text); font-weight:700; line-height:1.25;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${spoke.label ?? ''}</div>
  ${spoke.sub ? `<div style="
    font-family:var(--font-body);
    font-size:10px; color:var(--muted); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${spoke.sub}</div>` : ''}
</div>`;
  }).join('\n');

  return `
${titleHtml(title)}
${overlay}
${plate}
${spokesHtml}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: org-chart-tree ───────────────────────────────────────────────────
/**
 * 3-level org chart. d3-hierarchy tree() positions the dept nodes; d3-shape
 * linkVertical() draws connectors whose endpoints sit on the BOX EDGES (bottom
 * of parent → top of child), so every connector visibly joins its boxes.
 * Role lists hang under each dept node.
 */
definePattern('org-chart-tree', (c) => {
  const title = c.title ?? '';
  const topNodes = (c.top_nodes ?? []).slice(0, 2);
  const departments = (c.departments ?? []).slice(0, 5);
  const source = c.source ?? '';

  const full = colRange(1, 12);
  const FULL_L = full.left;
  const FULL_W = full.width;

  const NODE_H = 44;
  const TOP_W = 176;
  const L1_CY = 144 + 32;   // top node row center
  const L2_CY = 256 + 32;   // dept node row center
  const L3_TOP = 360;
  const L3_H = 264;

  // Dept node sizing (equal width across the row).
  const DEPT_COUNT = departments.length || 1;
  const DEPT_GAP = 16;
  const DEPT_W = Math.min(184, Math.floor((FULL_W - (DEPT_COUNT - 1) * DEPT_GAP) / DEPT_COUNT));
  const DEPT_TOTAL_W = DEPT_COUNT * DEPT_W + (DEPT_COUNT - 1) * DEPT_GAP;
  const DEPT_LEFT_START = FULL_L + Math.round((FULL_W - DEPT_TOTAL_W) / 2);
  const deptCX = departments.map((_, i) => DEPT_LEFT_START + i * (DEPT_W + DEPT_GAP) + Math.round(DEPT_W / 2));

  // Primary root = first top node; the tree hangs from it.
  const topCount = topNodes.length || 1;
  const topSpacing = Math.round(FULL_W / topCount);
  const topCX = topNodes.map((_, i) => FULL_L + i * topSpacing + Math.round(topSpacing / 2));
  const rootCX = topCX.length ? topCX[0] : FULL_L + Math.round(FULL_W / 2);

  // Build a d3 hierarchy: root (primary top node) → departments.
  const rootData = { name: topNodes[0] ?? '', children: departments.map((d) => ({ name: d.name })) };
  const root = d3hierarchy(rootData);
  // Lay out only to get the parent→children link STRUCTURE; we override x/y with
  // our grid-fixed positions so connectors attach exactly to the box edges.
  d3tree().size([FULL_W, 1])(root);

  // Assign fixed positions (box edges) to root + each child.
  root.x = rootCX;
  root.y = L1_CY + NODE_H / 2;          // bottom edge of the top node
  root.children?.forEach((child, i) => {
    child.x = deptCX[i];
    child.y = L2_CY - NODE_H / 2;        // top edge of the dept node
  });

  // linkVertical with accessors reading our (x = horizontal, y = vertical).
  const linkV = linkVertical().x((d) => d.x).y((d) => d.y);

  let body = '';

  // Peer bridge between the two top nodes (board ↔ audit committee).
  if (topCX.length > 1) {
    const node0Right = topCX[0] + TOP_W / 2;
    const node1Left = topCX[1] - TOP_W / 2;
    body += svgLine({ x1: node0Right, y1: L1_CY, x2: node1Left, y2: L1_CY, width: 1.5, opacity: 0.7 });
  }

  // Top node bottom → each dept node top (d3 linkVertical, attaches to edges).
  root.links().forEach((lnk) => {
    body += pathEl({ d: linkV(lnk), width: 1.5, opacity: 0.55 });
  });

  // Dept node bottom → role box top (straight short connector to the box edge).
  deptCX.forEach((cx) => {
    body += svgLine({ x1: cx, y1: L2_CY + NODE_H / 2, x2: cx, y2: L3_TOP, width: 1.5, opacity: 0.55 });
  });

  const overlay = overlaySvg({ body, region: 'org_connectors' });

  // Top nodes (filled).
  const topNodesHtml = topNodes.map((label, i) => {
    const left = topCX[i] - TOP_W / 2;
    return `<div data-region="top_node_${i + 1}" class="ts-region" style="
  left:${Math.round(left)}px; top:${L1_CY - NODE_H / 2}px;
  width:${TOP_W}px; height:${NODE_H}px;
  background:var(--primary); border-radius:4px;
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:4px 10px; overflow:hidden;
">
  <div style="font-family:var(--font-head);font-size:14px;color:var(--bg);font-weight:700;
    text-align:center;line-height:1.25;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${label}</div>
</div>`;
  }).join('\n');

  // Dept nodes (outlined).
  const deptNodesHtml = departments.map((dept, i) => {
    const left = DEPT_LEFT_START + i * (DEPT_W + DEPT_GAP);
    return `<div data-region="dept_node_${i + 1}" class="ts-region" style="
  left:${left}px; top:${L2_CY - NODE_H / 2}px;
  width:${DEPT_W}px; height:${NODE_H}px;
  background:var(--surface); border-radius:4px;
  border:1.5px solid var(--secondary);
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:4px 8px; overflow:hidden;
">
  <div style="font-family:var(--font-head);font-size:13px;color:var(--text);font-weight:700;
    text-align:center;line-height:1.25;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${dept.name ?? ''}</div>
</div>`;
  }).join('\n');

  // Role boxes.
  const roleBoxes = departments.map((dept, i) => {
    const roles = (dept.roles ?? []).slice(0, 6);
    const left = DEPT_LEFT_START + i * (DEPT_W + DEPT_GAP);
    const rowH = Math.floor(L3_H / Math.max(roles.length, 1));
    const rows = roles.map((role, j) => `
  <div style="
    height:${rowH}px; display:flex; align-items:center;
    border-bottom:${j < roles.length - 1 ? '1px solid var(--bg)' : 'none'};
    padding:0 10px; overflow:hidden;
  ">
    <div style="font-family:var(--font-body);font-size:11px;color:var(--text);line-height:1.3;opacity:0.85;
      white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${role}</div>
  </div>`).join('');

    return `<div data-region="role_box_${i + 1}" class="ts-region" style="
  left:${left}px; top:${L3_TOP}px; width:${DEPT_W}px; height:${L3_H}px;
  background:var(--surface); border-radius:4px;
  border:1px solid var(--secondary);
  box-sizing:border-box; overflow:hidden;
">
  ${rows}
</div>`;
  }).join('\n');

  return `
${titleHtml(title, 72)}
${overlay}
${topNodesHtml}
${deptNodesHtml}
${roleBoxes}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: bilateral-flow ───────────────────────────────────────────────────
/**
 * Two large circles (subjects) with sub-tags inside, joined by two horizontal
 * arrows in the center (→ on top, ← on bottom) drawn with <marker orient="auto">,
 * each with a flow label. Sub-tags are sized to stay inside the circles.
 */
definePattern('bilateral-flow', (c) => {
  const title = c.title ?? '';
  const leftLabel = c.left_label ?? '';
  const leftSub = (c.left_sub ?? []).slice(0, 4);
  const rightLabel = c.right_label ?? '';
  const rightSub = (c.right_sub ?? []).slice(0, 4);
  const flowRight = c.flow_right ?? '';
  const flowLeft = c.flow_left ?? '';
  const source = c.source ?? '';

  const leftArea = colRange(1, 4);
  const centerArea = colRange(5, 8);
  const rightArea = colRange(9, 12);

  const AREA_TOP = 152;
  const AREA_H = 480;
  const AREA_CY = AREA_TOP + Math.round(AREA_H / 2); // 392

  const CIRC_D = Math.min(leftArea.width, AREA_H) - 8; // ~288
  const CIRC_R = CIRC_D / 2;
  const L_CX = leftArea.left + Math.round(leftArea.width / 2);
  const R_CX = rightArea.left + Math.round(rightArea.width / 2);

  // Sub-tag layout inside each circle (kept within the inscribed width).
  const subTagH = 26;
  const subTagW = Math.round(CIRC_D * 0.62);
  function circleContent(side, label, subs, labelColor, tagBg, tagColor) {
    const labelTop = AREA_CY - CIRC_R + Math.round(CIRC_R * 0.42);
    const cx = side === 'left' ? L_CX : R_CX;
    const subStartY = AREA_CY - 4;
    const tags = subs.map((sub, i) => `<div data-region="${side}_sub_${i + 1}" class="ts-region" style="
  left:${cx - Math.round(subTagW / 2)}px; top:${subStartY + i * (subTagH + 5)}px;
  width:${subTagW}px; height:${subTagH}px;
  background:${tagBg}; border-radius:4px;
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:2px 8px; overflow:hidden;
">
  <div style="font-family:var(--font-body);font-size:11px;color:${tagColor};text-align:center;line-height:1.2;
    white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${sub}</div>
</div>`).join('\n');

    const labelHtml = `<div data-region="${side}_label" class="ts-region" style="
  left:${cx - CIRC_R}px; top:${labelTop}px;
  width:${CIRC_D}px; height:36px;
  display:flex; align-items:center; justify-content:center; pointer-events:none;
">
  <div style="font-family:var(--font-head);font-size:18px;color:${labelColor};font-weight:700;
    text-align:center;line-height:1.2;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${label}</div>
</div>`;
    return labelHtml + '\n' + tags;
  }

  const leftCircle = hubCircle({ cx: L_CX, cy: AREA_CY, r: CIRC_R, region: 'left_circle', fill: 'var(--primary)' });
  const rightCircle = hubCircle({ cx: R_CX, cy: AREA_CY, r: CIRC_R, region: 'right_circle', fill: 'var(--surface)' });
  const leftContent = circleContent('left', leftLabel, leftSub, 'var(--bg)', 'rgba(255,255,255,0.18)', 'var(--bg)');
  const rightContent = circleContent('right', rightLabel, rightSub, 'var(--text)', 'var(--bg)', 'var(--text)');

  // Center arrows: between the two circle edges, in the center column.
  const gapStart = L_CX + CIRC_R + 8;
  const gapEnd = R_CX - CIRC_R - 8;
  const arrowR = arrowMarker({ id: 'bf-arrow-r', color: 'var(--secondary)', size: 12 });
  const arrowL = arrowMarker({ id: 'bf-arrow-l', color: 'var(--secondary)', size: 12 });
  const topY = AREA_CY - 26;
  const botY = AREA_CY + 26;
  let body = '';
  body += svgLine({ x1: gapStart, y1: topY, x2: gapEnd, y2: topY, markerEnd: arrowR.id, width: 3, opacity: 0.85, color: 'var(--secondary)' });
  body += svgLine({ x1: gapEnd, y1: botY, x2: gapStart, y2: botY, markerEnd: arrowL.id, width: 3, opacity: 0.85, color: 'var(--secondary)' });
  const overlay = overlaySvg({ defs: arrowR.def + arrowL.def, body, region: 'bilateral_arrows' });

  const cLeft = centerArea.left;
  const cW = centerArea.width;
  const flowLabels = `<div data-region="flow_right_label" class="ts-region" style="
  left:${cLeft}px; top:${topY - 34}px; width:${cW}px; height:24px;
  display:flex; align-items:center; justify-content:center;
">
  <div style="font-family:var(--font-body);font-size:11px;color:var(--muted);text-align:center;line-height:1.2;
    white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${flowRight}</div>
</div>
<div data-region="flow_left_label" class="ts-region" style="
  left:${cLeft}px; top:${botY + 12}px; width:${cW}px; height:24px;
  display:flex; align-items:center; justify-content:center;
">
  <div style="font-family:var(--font-body);font-size:11px;color:var(--muted);text-align:center;line-height:1.2;
    white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${flowLeft}</div>
</div>`;

  return `
${titleHtml(title)}
${overlay}
${leftCircle}
${rightCircle}
${leftContent}
${rightContent}
${flowLabels}
${sourceHtml(source)}
`.trim();
});
