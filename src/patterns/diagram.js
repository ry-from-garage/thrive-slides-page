/**
 * diagram.js — ダイアグラムパターン群 (strategy-consulting theme)
 *
 * Patterns:
 *   cycle-diagram          — PDCA/サイクル図（4ステップ環状）
 *   hub-spoke              — ハブ＆スポーク図（中心+放射）
 *   four-quadrant-center   — 2×2象限＋中央ハブ
 *   circle-hub-list-right  — 左円ハブ＋右リスト
 *   center-illustration-spoke — 中央ビジュアル＋スポーク
 *   org-chart-tree         — 組織図ツリー（3階層）
 *   bilateral-flow         — 双方向フロー（2主体）
 *
 * Theme: strategy-consulting
 *   white bg, navy (--text), crimson (--accent), serif titles
 *
 * Grid (safe-area x 72..1208, y 56..664):
 *   12 cols, COL_UNIT = 96.6667px
 *   colX(n) = 72 + (n-1) * 96.6667
 *   colW(n) = n * 96.6667 - 24
 */

import { definePattern } from './registry.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

function colX(n) {
  return SAFE_LEFT + (n - 1) * COL_UNIT;
}

function colW(n) {
  return n * COL_UNIT - 24;
}

function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Shared: title region ──────────────────────────────────────────────────────
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

// ── Pattern: cycle-diagram ────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   center_label: string,
 *   steps: Array<{ label, body? }>,   // 3–6 steps, clockwise from top
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar   col 1-12  offset 56   height 80
 *   lead_text   col 1-12  offset 152  height 40
 *   diagram_area col 1-12 offset 208  height 416
 *   source_bar  col 1-12  offset 640  height 24
 *
 * Cycle center: x=640, y=416 (208+208).
 * Ring outer radius: 160px; segment labels radius: ~270px.
 * All geometry fits y 208..624.
 */
definePattern('cycle-diagram', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const centerLabel = c.center_label ?? '';
  const steps = (c.steps ?? []).slice(0, 6);
  const source = c.source ?? '';

  const N = steps.length || 4;
  const CX = 640;
  const CY = 416; // 208 + 208

  // Radii
  const R_INNER = 56;   // center circle
  const R_RING_IN = 80; // ring inner edge
  const R_RING_OUT = 160; // ring outer edge
  const R_LABEL = 240;  // label box center

  // Label box dims
  const LABEL_W = 160;
  const LABEL_H = 72;

  // Build SVG for ring + arrows + center circle
  // Start angle: top = -90deg
  const angleStep = (2 * Math.PI) / N;
  const startAngle = -Math.PI / 2;

  // Segment paths (donut segments)
  const GAP_RAD = 0.05; // gap between segments

  let svgContent = '';

  // Draw ring segments
  for (let i = 0; i < N; i++) {
    const a0 = startAngle + i * angleStep + GAP_RAD / 2;
    const a1 = startAngle + (i + 1) * angleStep - GAP_RAD / 2;

    const x0i = Math.cos(a0) * R_RING_IN;
    const y0i = Math.sin(a0) * R_RING_IN;
    const x1i = Math.cos(a1) * R_RING_IN;
    const y1i = Math.sin(a1) * R_RING_IN;
    const x0o = Math.cos(a0) * R_RING_OUT;
    const y0o = Math.sin(a0) * R_RING_OUT;
    const x1o = Math.cos(a1) * R_RING_OUT;
    const y1o = Math.sin(a1) * R_RING_OUT;

    const largeArc = angleStep > Math.PI ? 1 : 0;
    const d = [
      `M ${x0o} ${y0o}`,
      `A ${R_RING_OUT} ${R_RING_OUT} 0 ${largeArc} 1 ${x1o} ${y1o}`,
      `L ${x1i} ${y1i}`,
      `A ${R_RING_IN} ${R_RING_IN} 0 ${largeArc} 0 ${x0i} ${y0i}`,
      `Z`
    ].join(' ');

    svgContent += `<path d="${d}" fill="var(--surface)" stroke="var(--bg, #fff)" stroke-width="2"/>`;
  }

  // Draw arrows between segments (clockwise arrowheads at segment midpoints on outer ring)
  for (let i = 0; i < N; i++) {
    // Arrow at the boundary between segment i and i+1
    const boundaryAngle = startAngle + (i + 1) * angleStep;
    const arrowAngle = boundaryAngle;
    // Place arrow head slightly outside ring
    const R_ARROW = R_RING_OUT + 12;
    const ax = Math.cos(arrowAngle) * R_ARROW;
    const ay = Math.sin(arrowAngle) * R_ARROW;
    // tangent direction (clockwise = +90deg from radial)
    const tx = -Math.sin(arrowAngle);
    const ty = Math.cos(arrowAngle);
    const ARR = 8;
    svgContent += `<polygon points="
      ${ax - tx * ARR + ty * 4},${ay - ty * ARR - tx * 4}
      ${ax + tx * ARR},${ay + ty * ARR}
      ${ax - tx * ARR - ty * 4},${ay - ty * ARR + tx * 4}
    " fill="var(--muted)" opacity="0.6"/>`;
  }

  // Center circle
  svgContent += `<circle cx="0" cy="0" r="${R_INNER}" fill="var(--text)" opacity="0.85"/>`;

  // SVG is rendered centered at (0,0); we'll translate via the container
  // Compute diagram_area SVG viewBox centered
  const SVG_W = 1136; // safe area width
  const SVG_H = 416;  // diagram_area height
  const SVG_CX = CX - SAFE_LEFT; // cx relative to safe left = 640 - 72 = 568
  const SVG_CY = CY - 208; // cy relative to diagram_area top = 208

  const diagramSvg = `<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="${-SVG_CX} ${-SVG_CY} ${SVG_W} ${SVG_H}"
  width="${SVG_W}" height="${SVG_H}"
  style="display:block; overflow:visible;"
>
  ${svgContent}
</svg>`;

  // Center label text (absolute positioned)
  const centerLabelHtml = `<div data-region="center_label" class="ts-region" style="
  left:${CX - R_INNER}px; top:${CY - R_INNER}px;
  width:${R_INNER * 2}px; height:${R_INNER * 2}px;
  display:flex; align-items:center; justify-content:center;
  border-radius:50%;
  text-align:center;
  box-sizing:border-box; padding:4px;
  pointer-events:none;
">
  <div style="
    font-family:var(--font-head);
    font-size:12px;
    color:#fff;
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    text-align:center;
  ">${centerLabel}</div>
</div>`;

  // Step label boxes
  const labelBoxes = steps.map((step, i) => {
    const angle = startAngle + (i + 0.5) * angleStep;
    const lx = CX + Math.cos(angle) * R_LABEL;
    const ly = CY + Math.sin(angle) * R_LABEL;
    const boxLeft = Math.round(lx - LABEL_W / 2);
    const boxTop = Math.round(ly - LABEL_H / 2);

    // Clamp within diagram_area bounds (y 208..624) and safe x (72..1208)
    const safeLeft = Math.max(SAFE_LEFT, Math.min(1208 - LABEL_W, boxLeft));
    const safeTop = Math.max(208, Math.min(624 - LABEL_H, boxTop));

    // Connector line from ring outer edge to label
    const edgeX = CX + Math.cos(angle) * (R_RING_OUT + 4);
    const edgeY = CY + Math.sin(angle) * (R_RING_OUT + 4);
    const labelCX = safeLeft + LABEL_W / 2;
    const labelCY = safeTop + LABEL_H / 2;

    return `<svg data-region="step_conn_${i + 1}" class="ts-region" style="
  left:0px; top:0px; width:1280px; height:720px;
  pointer-events:none; overflow:visible; position:absolute;
" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <line x1="${Math.round(edgeX)}" y1="${Math.round(edgeY)}" x2="${Math.round(labelCX)}" y2="${Math.round(labelCY)}" stroke="var(--muted)" stroke-width="1.5" opacity="0.5"/>
</svg>
<div data-region="step_label_${i + 1}" class="ts-region" style="
  left:${safeLeft}px; top:${safeTop}px;
  width:${LABEL_W}px; height:${LABEL_H}px;
  border:1px solid var(--muted);
  border-radius:4px;
  box-sizing:border-box; padding:6px 8px;
  background:var(--bg, #fff);
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:13px;
    color:var(--text);
    font-weight:600;
    line-height:1.3;
    margin-bottom:3px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${step.label ?? ''}</div>
  ${step.body ? `<div style="
    font-family:var(--font-body);
    font-size:11px;
    color:var(--muted);
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${step.body}</div>` : ''}
</div>`;
  }).join('\n');

  return `
${titleHtml(title)}
${leadHtml(lead)}

<div data-region="diagram_area" class="ts-region" style="
  left:${SAFE_LEFT}px; top:208px; width:${Math.round(colW(12))}px; height:416px;
  overflow:hidden;
">
  ${diagramSvg}
</div>

${centerLabelHtml}
${labelBoxes}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: hub-spoke ────────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   hub_label: string,
 *   spokes: Array<{ heading, body? }>,   // 4–6 spokes
 *   source?: string
 * }
 *
 * Hub center: x=640, y=416. Hub radius 72px.
 * Spokes end at radius ~220px from center.
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

  const R_HUB = 72;
  const R_BADGE = 200; // badge (number circle) radius from center
  const R_TEXT = 240;  // text start radius

  const BADGE_R = 18;
  const TEXT_W = 180;
  const TEXT_H = 80;

  const startAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / N;

  // Hub SVG
  const hubSvg = `<svg data-region="hub_shape" class="ts-region" style="
  left:${CX - R_HUB}px; top:${CY - R_HUB}px;
  width:${R_HUB * 2}px; height:${R_HUB * 2}px;
  border-radius:50%; overflow:visible;
" viewBox="${-R_HUB} ${-R_HUB} ${R_HUB * 2} ${R_HUB * 2}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="0" cy="0" r="${R_HUB}" fill="var(--text)"/>
</svg>`;

  const hubLabelHtml = `<div data-region="hub_label" class="ts-region" style="
  left:${CX - R_HUB}px; top:${CY - R_HUB}px;
  width:${R_HUB * 2}px; height:${R_HUB * 2}px;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
">
  <div style="
    font-family:var(--font-head);
    font-size:13px;
    color:#fff;
    font-weight:700;
    text-align:center;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    padding:4px;
    box-sizing:border-box;
  ">${hubLabel}</div>
</div>`;

  const spokesHtml = spokes.map((spoke, i) => {
    const angle = startAngle + i * angleStep;
    const bx = Math.round(CX + Math.cos(angle) * R_BADGE);
    const by = Math.round(CY + Math.sin(angle) * R_BADGE);
    const tx = Math.round(CX + Math.cos(angle) * R_TEXT);
    const ty = Math.round(CY + Math.sin(angle) * R_TEXT);

    // Align text left/right based on angle; for near-vertical spokes, place text
    // to one side of the badge so the number circle never obscures the label.
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);
    const isRight = cosA > 0.1;
    const isLeft  = cosA < -0.1;
    const isNearVertical = Math.abs(sinA) > Math.abs(cosA); // |sin| > |cos| → mostly up/down

    let textLeft;
    if (isNearVertical) {
      // Place text to the right of the badge so the number circle doesn't overlap.
      textLeft = bx + BADGE_R + 10;
    } else if (isRight) {
      textLeft = tx;
    } else if (isLeft) {
      textLeft = tx - TEXT_W;
    } else {
      textLeft = tx - TEXT_W / 2;
    }
    const safeTextLeft = Math.max(SAFE_LEFT, Math.min(1208 - TEXT_W, Math.round(textLeft)));

    // For near-vertical spokes, vertically centre the text on the badge so the
    // label sits alongside the number circle rather than above/below it.
    const textTopRaw = isNearVertical
      ? by - TEXT_H / 2           // vertically centre on badge Y
      : Math.round(ty - TEXT_H / 2);
    const safeTextTop = Math.max(208, Math.min(624 - TEXT_H, Math.round(textTopRaw)));

    // Spoke line from hub edge to badge
    const hubEdgeX = Math.round(CX + Math.cos(angle) * R_HUB);
    const hubEdgeY = Math.round(CY + Math.sin(angle) * R_HUB);

    return `<svg data-region="spoke_line_${i + 1}" class="ts-region" style="
  left:0px; top:0px; width:1280px; height:720px;
  pointer-events:none; overflow:visible; position:absolute;
" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <line x1="${hubEdgeX}" y1="${hubEdgeY}" x2="${bx}" y2="${by}" stroke="var(--muted)" stroke-width="1.5" opacity="0.5"/>
</svg>
<div data-region="spoke_badge_${i + 1}" class="ts-region" style="
  left:${bx - BADGE_R}px; top:${by - BADGE_R}px;
  width:${BADGE_R * 2}px; height:${BADGE_R * 2}px;
  border-radius:50%;
  background:var(--surface);
  border:1.5px solid var(--muted);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-body);
  font-size:10px;
  color:var(--text);
  font-weight:600;
">${String(i + 1).padStart(2, '0')}</div>
<div data-region="spoke_text_${i + 1}" class="ts-region" style="
  left:${safeTextLeft}px; top:${safeTextTop}px;
  width:${TEXT_W}px; height:${TEXT_H}px;
  box-sizing:border-box; padding:0 4px;
  overflow:hidden;
  ${isLeft ? 'text-align:right;' : ''}
">
  <div style="
    font-family:var(--font-head);
    font-size:14px;
    color:var(--text);
    font-weight:600;
    line-height:1.3;
    margin-bottom:4px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${spoke.heading ?? ''}</div>
  ${spoke.body ? `<div style="
    font-family:var(--font-body);
    font-size:11px;
    color:var(--muted);
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${spoke.body}</div>` : ''}
</div>`;
  }).join('\n');

  return `
${titleHtml(title)}
${leadHtml(lead)}

<div data-region="diagram_area" class="ts-region" style="
  left:${SAFE_LEFT}px; top:208px; width:${Math.round(colW(12))}px; height:416px;
  overflow:hidden;
"></div>

${hubSvg}
${hubLabelHtml}
${spokesHtml}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: four-quadrant-center ─────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   center_label: string,
 *   top_left: { heading, body },
 *   top_right: { heading, body },
 *   bottom_left: { heading, body },
 *   bottom_right: { heading, body },
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar          col 1-12  offset 56   height 80
 *   quadrant_top_left  col 1-6   offset 152  height 288
 *   quadrant_top_right col 7-12  offset 152  height 288
 *   quadrant_btm_left  col 1-6   offset 464  height 176
 *   quadrant_btm_right col 7-12  offset 464  height 176
 *   center_hub         col 5-8   offset 320  height 88  (overlaid)
 *   source_bar         col 1-12  offset 640  height 24
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
  const qbl = colRange(1, 6);
  const qbr = colRange(7, 12);
  const hub = colRange(5, 8);

  function quadHtml(region, col, top, height, q) {
    return `<div data-region="${region}" class="ts-region" style="
  left:${col.left}px; top:${top}px; width:${col.width}px; height:${height}px;
  background:var(--surface);
  box-sizing:border-box; padding:24px 20px 16px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:600;
    line-height:1.3;
    margin-bottom:8px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${q.heading ?? ''}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.6;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${q.body ?? ''}</div>
</div>`;
  }

  // center_hub: col 5-8 = left≈447, width≈340; offset 320, height 88
  // Center of hub: x = hub.left + hub.width/2, y = 320 + 44 = 364
  const hubCX = hub.left + Math.round(hub.width / 2);
  const hubCY = 364;
  const hubR = 44;

  const hubHtml = `<svg data-region="center_hub_shape" class="ts-region" style="
  left:${hub.left}px; top:320px; width:${hub.width}px; height:88px;
  overflow:visible; pointer-events:none;
" viewBox="0 0 ${hub.width} 88" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${Math.round(hub.width / 2)}" cy="44" r="${hubR}" fill="var(--text)"/>
</svg>
<div data-region="center_hub_label" class="ts-region" style="
  left:${hubCX - hubR}px; top:${hubCY - hubR}px;
  width:${hubR * 2}px; height:${hubR * 2}px;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
">
  <div style="
    font-family:var(--font-head);
    font-size:11px;
    color:#fff;
    font-weight:700;
    text-align:center;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${centerLabel}</div>
</div>`;

  return `
${titleHtml(title)}
${quadHtml('quadrant_top_left', qtl, 152, 288, topLeft)}
${quadHtml('quadrant_top_right', qtr, 152, 288, topRight)}
${quadHtml('quadrant_bottom_left', qbl, 464, 176, btmLeft)}
${quadHtml('quadrant_bottom_right', qbr, 464, 176, btmRight)}
${hubHtml}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: circle-hub-list-right ───────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   hub_label: string,
 *   items: Array<{ heading, body? }>,   // 5–7 items
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar  col 1-12  offset 56   height 80
 *   hub_area   col 1-4   offset 152  height 464
 *   list_area  col 5-12  offset 152  height 464
 *   source_bar col 1-12  offset 640  height 24
 */
definePattern('circle-hub-list-right', (c) => {
  const title = c.title ?? '';
  const hubLabel = c.hub_label ?? '';
  const items = (c.items ?? []).slice(0, 7);
  const source = c.source ?? '';

  const hubArea = colRange(1, 4);
  const listArea = colRange(5, 12);

  // Hub: centered in hub_area, diameter ≈ 60% of hub height = 0.6 * 464 ≈ 278
  const HUB_D = 240;
  const HUB_CX = hubArea.left + Math.round(hubArea.width / 2);
  const HUB_CY = 152 + Math.round(464 / 2); // 384

  const hubSvg = `<svg data-region="hub_circle" class="ts-region" style="
  left:${HUB_CX - HUB_D / 2}px; top:${HUB_CY - HUB_D / 2}px;
  width:${HUB_D}px; height:${HUB_D}px;
  border-radius:50%; overflow:visible;
" viewBox="${-HUB_D / 2} ${-HUB_D / 2} ${HUB_D} ${HUB_D}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="0" cy="0" r="${HUB_D / 2}" fill="var(--text)"/>
</svg>
<div data-region="hub_label" class="ts-region" style="
  left:${HUB_CX - HUB_D / 2}px; top:${HUB_CY - HUB_D / 2}px;
  width:${HUB_D}px; height:${HUB_D}px;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
">
  <div style="
    font-family:var(--font-head);
    font-size:18px;
    color:#fff;
    font-weight:700;
    text-align:center;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    padding:8px;
    box-sizing:border-box;
  ">${hubLabel}</div>
</div>`;

  // List items: evenly spaced in list_area (offset 152, height 464)
  const LIST_TOP = 152;
  const LIST_H = 464;
  const itemCount = items.length;
  const rowH = Math.floor(LIST_H / itemCount);
  const BADGE_R = 16;
  const BADGE_GAP = 12;

  const listHtml = items.map((item, i) => {
    const rowTop = LIST_TOP + i * rowH;
    const badgeCX = listArea.left + BADGE_R;
    const badgeCY = rowTop + Math.round(rowH / 2);

    // Connector line from hub right edge to badge
    const hubEdgeX = HUB_CX + HUB_D / 2;
    const connY = badgeCY;

    const rowContent = rowH < 56
      ? `<div style="font-family:var(--font-head);font-size:13px;color:var(--text);font-weight:600;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${item.heading ?? ''}</div>`
      : `<div style="font-family:var(--font-head);font-size:14px;color:var(--text);font-weight:600;line-height:1.3;margin-bottom:3px;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${item.heading ?? ''}</div>
      ${item.body ? `<div style="font-family:var(--font-body);font-size:11px;color:var(--muted);line-height:1.4;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${item.body}</div>` : ''}`;

    return `<svg data-region="item_conn_${i + 1}" class="ts-region" style="
  left:0px; top:0px; width:1280px; height:720px;
  pointer-events:none; overflow:visible; position:absolute;
" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <line x1="${Math.round(hubEdgeX)}" y1="${connY}" x2="${badgeCX + BADGE_R}" y2="${connY}" stroke="var(--muted)" stroke-width="1" opacity="0.4"/>
</svg>
<div data-region="item_badge_${i + 1}" class="ts-region" style="
  left:${listArea.left}px; top:${badgeCY - BADGE_R}px;
  width:${BADGE_R * 2}px; height:${BADGE_R * 2}px;
  border-radius:50%;
  background:var(--surface);
  border:1.5px solid var(--muted);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-body);
  font-size:9px;
  color:var(--muted);
  font-weight:600;
">${String(i + 1).padStart(2, '0')}</div>
<div data-region="item_text_${i + 1}" class="ts-region" style="
  left:${listArea.left + BADGE_R * 2 + BADGE_GAP}px;
  top:${rowTop + 4}px;
  width:${listArea.width - BADGE_R * 2 - BADGE_GAP}px;
  height:${rowH - 8}px;
  box-sizing:border-box;
  display:flex; flex-direction:column; justify-content:center;
  overflow:hidden;
  border-bottom:${i < itemCount - 1 ? '1px solid var(--muted)' : 'none'};
  opacity:0.9;
">
  ${rowContent}
</div>`;
  }).join('\n');

  return `
${titleHtml(title)}

<div data-region="hub_area" class="ts-region" style="
  left:${hubArea.left}px; top:152px; width:${hubArea.width}px; height:464px;
  overflow:hidden;
"></div>

<div data-region="list_area" class="ts-region" style="
  left:${listArea.left}px; top:152px; width:${listArea.width}px; height:464px;
  overflow:hidden;
"></div>

${hubSvg}
${listHtml}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: center-illustration-spoke ───────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   center_label: string,
 *   spokes: Array<{ label, sub? }>,   // 4–6 spokes
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar    col 1-12  offset 56   height 80
 *   diagram_area col 1-12  offset 152  height 480
 *   source_bar   col 1-12  offset 640  height 24
 *
 * Center placeholder: 280×280, center at x=640, y=392 (152+240)
 * diagram_area: y 152..632
 */
definePattern('center-illustration-spoke', (c) => {
  const title = c.title ?? '';
  const centerLabel = c.center_label ?? '';
  const spokes = (c.spokes ?? []).slice(0, 6);
  const source = c.source ?? '';

  const N = spokes.length || 5;

  const CX = 640;
  const CY = 392; // 152 + 240

  const PLATE_W = 240;
  const PLATE_H = 200;
  const PLATE_R = Math.max(PLATE_W, PLATE_H) / 2; // effective collision radius

  const NODE_R = 28;
  const R_SPOKE = 280; // distance from center to spoke node center

  // Spoke angles: standard top/top-left/top-right/bottom-left/bottom-right for 5 spokes
  // For N spokes: evenly spaced starting from top-left (-120deg for 5)
  const startAngle = N === 5 ? -Math.PI * 0.85 : -Math.PI / 2;
  const angleStep = (2 * Math.PI) / N;

  const LABEL_W = 140;
  const LABEL_H = 48;

  // Center placeholder
  const plateLeft = CX - PLATE_W / 2;
  const plateTop = CY - PLATE_H / 2;

  const centerHtml = `<div data-region="center_placeholder" class="ts-region" style="
  left:${Math.round(plateLeft)}px; top:${Math.round(plateTop)}px;
  width:${PLATE_W}px; height:${PLATE_H}px;
  background:var(--surface);
  border-radius:8px;
  border:2px solid var(--muted);
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:8px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:700;
    text-align:center;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${centerLabel}</div>
</div>`;

  const spokesHtml = spokes.map((spoke, i) => {
    const angle = startAngle + i * angleStep;
    const nx = Math.round(CX + Math.cos(angle) * R_SPOKE);
    const ny = Math.round(CY + Math.sin(angle) * R_SPOKE);

    // Arrow: from node edge toward center placeholder edge
    const dx = CX - nx;
    const dy = CY - ny;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / dist;
    const uy = dy / dist;

    const arrowStartX = Math.round(nx + ux * NODE_R);
    const arrowStartY = Math.round(ny + uy * NODE_R);
    const arrowEndX = Math.round(CX - ux * (PLATE_R + 4));
    const arrowEndY = Math.round(CY - uy * (PLATE_R + 4));

    // Clamp node within diagram_area (y 152..632)
    const safeNY = Math.max(152 + NODE_R, Math.min(632 - NODE_R, ny));
    const safeNX = Math.max(SAFE_LEFT + NODE_R, Math.min(1208 - NODE_R, nx));

    // Label position: outward from node
    const labelX = Math.round(safeNX + Math.cos(angle) * (NODE_R + 8));
    const labelY = Math.round(safeNY + Math.sin(angle) * (NODE_R + 8));
    const labelLeft = Math.max(SAFE_LEFT, Math.min(1208 - LABEL_W, labelX - LABEL_W / 2));
    const labelTop = Math.max(152, Math.min(632 - LABEL_H, labelY - LABEL_H / 2));

    return `<svg data-region="spoke_arrow_${i + 1}" class="ts-region" style="
  left:0px; top:0px; width:1280px; height:720px;
  pointer-events:none; overflow:visible; position:absolute;
" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <line x1="${arrowStartX}" y1="${arrowStartY}" x2="${arrowEndX}" y2="${arrowEndY}"
    stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>
  <polygon points="
    ${arrowEndX + ux * 8 - uy * 4},${arrowEndY + uy * 8 + ux * 4}
    ${arrowEndX},${arrowEndY}
    ${arrowEndX + ux * 8 + uy * 4},${arrowEndY + uy * 8 - ux * 4}
  " fill="var(--muted)" opacity="0.7"/>
</svg>
<div data-region="spoke_node_${i + 1}" class="ts-region" style="
  left:${safeNX - NODE_R}px; top:${safeNY - NODE_R}px;
  width:${NODE_R * 2}px; height:${NODE_R * 2}px;
  border-radius:50%;
  background:var(--surface);
  border:1.5px solid var(--muted);
  box-sizing:border-box;
"></div>
<div data-region="spoke_label_${i + 1}" class="ts-region" style="
  left:${Math.round(labelLeft)}px; top:${Math.round(labelTop)}px;
  width:${LABEL_W}px; height:${LABEL_H}px;
  box-sizing:border-box; padding:2px 4px;
  overflow:hidden; text-align:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:13px;
    color:var(--text);
    font-weight:600;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${spoke.label ?? ''}</div>
  ${spoke.sub ? `<div style="
    font-family:var(--font-body);
    font-size:10px;
    color:var(--muted);
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${spoke.sub}</div>` : ''}
</div>`;
  }).join('\n');

  return `
${titleHtml(title)}

<div data-region="diagram_area" class="ts-region" style="
  left:${SAFE_LEFT}px; top:152px; width:${Math.round(colW(12))}px; height:480px;
  overflow:hidden;
"></div>

${centerHtml}
${spokesHtml}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: org-chart-tree ───────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   top_nodes: string[],              // 1–2 top nodes
 *   departments: Array<{
 *     name: string,
 *     roles: string[]                 // 4–6 items
 *   }>,                               // 3–5 departments
 *   source?: string
 * }
 *
 * Structure (from spec):
 *   title_bar   col 1-12  offset 56   height 72
 *   level_1_row col 1-12  offset 144  height 64
 *   connector_v1 col 1-12 offset 208  height 24
 *   level_2_row col 1-12  offset 256  height 64
 *   connector_v2 col 1-12 offset 320  height 24
 *   level_3_row col 1-12  offset 360  height 264
 *   source_bar  col 1-12  offset 640  height 24
 */
definePattern('org-chart-tree', (c) => {
  const title = c.title ?? '';
  const topNodes = (c.top_nodes ?? []).slice(0, 2);
  const departments = (c.departments ?? []).slice(0, 5);
  const source = c.source ?? '';

  const full = colRange(1, 12);
  const FULL_W = full.width;
  const FULL_L = full.left;

  // Level 1: top nodes centered
  const L1_TOP = 144;
  const L1_H = 64;
  const NODE_W = 180;
  const NODE_H = 44;

  const topCount = topNodes.length || 1;
  const topSpacing = Math.round(FULL_W / topCount);

  const topNodesHtml = topNodes.map((label, i) => {
    const nodeLeft = FULL_L + i * topSpacing + Math.round((topSpacing - NODE_W) / 2);
    return `<div data-region="top_node_${i + 1}" class="ts-region" style="
  left:${nodeLeft}px; top:${L1_TOP + Math.round((L1_H - NODE_H) / 2)}px;
  width:${NODE_W}px; height:${NODE_H}px;
  background:var(--text);
  border-radius:4px;
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:4px 8px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:13px;
    color:#fff;
    font-weight:700;
    text-align:center;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${label}</div>
</div>`;
  }).join('\n');

  // Connector V1: from top nodes down to horizontal branch line
  // Level 2 starts at 256; connector at y=208, height 24
  const V1_MID_X = FULL_L + Math.round(FULL_W / 2);
  const V1_TOP_Y = L1_TOP + L1_H; // 208
  const V1_BOT_Y = 256;

  // Level 2: department nodes
  const L2_TOP = 256;
  const L2_H = 64;
  const DEPT_COUNT = departments.length;
  const DEPT_W = DEPT_COUNT > 0 ? Math.min(180, Math.floor((FULL_W - (DEPT_COUNT - 1) * 16) / DEPT_COUNT)) : 180;
  const DEPT_TOTAL_W = DEPT_COUNT * DEPT_W + (DEPT_COUNT - 1) * 16;
  const DEPT_LEFT_START = FULL_L + Math.round((FULL_W - DEPT_TOTAL_W) / 2);

  const deptCenters = departments.map((_, i) => DEPT_LEFT_START + i * (DEPT_W + 16) + Math.round(DEPT_W / 2));

  const deptNodesHtml = departments.map((dept, i) => {
    const dLeft = DEPT_LEFT_START + i * (DEPT_W + 16);
    return `<div data-region="dept_node_${i + 1}" class="ts-region" style="
  left:${dLeft}px; top:${L2_TOP + Math.round((L2_H - 44) / 2)}px;
  width:${DEPT_W}px; height:44px;
  background:var(--surface);
  border-radius:4px;
  border:1.5px solid var(--muted);
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:4px 8px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:12px;
    color:var(--text);
    font-weight:600;
    text-align:center;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${dept.name ?? ''}</div>
</div>`;
  }).join('\n');

  // Level 3: role list boxes
  const L3_TOP = 360;
  const L3_H = 264;

  const roleBoxes = departments.map((dept, i) => {
    const roles = (dept.roles ?? []).slice(0, 6);
    const boxLeft = DEPT_LEFT_START + i * (DEPT_W + 16);
    const ROW_H = Math.floor(L3_H / Math.max(roles.length, 1));
    const rowsHtml = roles.map((role, j) => `
  <div style="
    height:${ROW_H}px;
    display:flex; align-items:center;
    border-bottom:${j < roles.length - 1 ? '1px solid var(--muted)' : 'none'};
    padding:0 8px;
    overflow:hidden;
  ">
    <div style="
      font-family:var(--font-body);
      font-size:11px;
      color:var(--muted);
      line-height:1.3;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${role}</div>
  </div>`).join('');

    return `<div data-region="role_box_${i + 1}" class="ts-region" style="
  left:${boxLeft}px; top:${L3_TOP}px; width:${DEPT_W}px; height:${L3_H}px;
  background:var(--surface);
  border-radius:4px;
  border:1px solid var(--muted);
  box-sizing:border-box;
  overflow:hidden;
">
  ${rowsHtml}
</div>`;
  }).join('\n');

  // SVG connectors
  // V1: from each top node center down to branch line, then branch line to dept nodes
  const topNodeCenters = topNodes.map((_, i) => FULL_L + i * topSpacing + Math.round(topSpacing / 2));
  // branch Y at midpoint of connector_v1
  const BRANCH_Y = 232;

  // Vertical mid Y of the top node boxes (used for direct horizontal bridge)
  const TOP_NODE_MID_Y = L1_TOP + Math.round(L1_H / 2);

  let svgLines = '';

  // Direct horizontal bridge between the two top nodes at their vertical midpoint.
  // This makes the peer relationship (board ↔ audit committee) visually explicit.
  if (topNodeCenters.length > 1) {
    // Right edge of node 0 → left edge of node 1
    const node0Right = FULL_L + Math.round((topSpacing - NODE_W) / 2) + NODE_W;
    const node1Left  = FULL_L + topSpacing + Math.round((topSpacing - NODE_W) / 2);
    svgLines += `<line x1="${node0Right}" y1="${TOP_NODE_MID_Y}" x2="${node1Left}" y2="${TOP_NODE_MID_Y}" stroke="var(--muted)" stroke-width="1.5" opacity="0.8"/>`;
  }

  // Primary root: descend from the first top node (取締役会, the board) down through the tree.
  // Use the first node's center as the trunk origin so the tree hangs from the board.
  const trunkX = topNodeCenters.length > 0 ? topNodeCenters[0] : V1_MID_X;
  const trunkBottomOfNode = L1_TOP + Math.round((L1_H - NODE_H) / 2) + NODE_H;

  // Vertical line from bottom of primary root node down to BRANCH_Y
  svgLines += `<line x1="${trunkX}" y1="${trunkBottomOfNode}" x2="${trunkX}" y2="${BRANCH_Y}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
  // Horizontal junction at BRANCH_Y from trunkX to dept-span midpoint (V1_MID_X)
  if (trunkX !== V1_MID_X) {
    svgLines += `<line x1="${trunkX}" y1="${BRANCH_Y}" x2="${V1_MID_X}" y2="${BRANCH_Y}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
  }
  // Single vertical from branch to dept horizontal
  svgLines += `<line x1="${V1_MID_X}" y1="${BRANCH_Y}" x2="${V1_MID_X}" y2="${L2_TOP}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;

  // Horizontal at L2_TOP spanning dept nodes
  if (deptCenters.length > 1) {
    svgLines += `<line x1="${deptCenters[0]}" y1="${L2_TOP}" x2="${deptCenters[deptCenters.length - 1]}" y2="${L2_TOP}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
  }

  // Dept nodes down to connector_v2 → L3
  deptCenters.forEach(cx => {
    svgLines += `<line x1="${cx}" y1="${L2_TOP + L2_H}" x2="${cx}" y2="${L3_TOP}" stroke="var(--muted)" stroke-width="1.5" opacity="0.6"/>`;
  });

  const connSvg = `<svg data-region="org_connectors" class="ts-region" style="
  left:0px; top:0px; width:1280px; height:720px;
  pointer-events:none; overflow:visible; position:absolute;
" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  ${svgLines}
</svg>`;

  return `
${titleHtml(title, 72)}

${topNodesHtml}
${connSvg}
${deptNodesHtml}
${roleBoxes}
${sourceHtml(source)}
`.trim();
});

// ── Pattern: bilateral-flow ───────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   left_label: string,
 *   left_sub: string[],               // 2–4 items
 *   right_label: string,
 *   right_sub: string[],              // 2–4 items
 *   flow_right: string,               // left→right flow label
 *   flow_left: string,                // right→left flow label
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar         col 1-12  offset 56   height 80
 *   left_circle_area  col 1-4   offset 152  height 480
 *   center_arrow_area col 5-8   offset 152  height 480
 *   right_circle_area col 9-12  offset 152  height 480
 *   source_bar        col 1-12  offset 640  height 24
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

  // Circle diameters: fit within each area
  const L_CIRC_D = Math.min(leftArea.width, AREA_H) - 16; // ~288
  const R_CIRC_D = Math.min(rightArea.width, AREA_H) - 16;

  const L_CX = leftArea.left + Math.round(leftArea.width / 2);
  const R_CX = rightArea.left + Math.round(rightArea.width / 2);

  // Left circle
  const leftCircle = `<svg data-region="left_circle" class="ts-region" style="
  left:${L_CX - L_CIRC_D / 2}px; top:${AREA_CY - L_CIRC_D / 2}px;
  width:${L_CIRC_D}px; height:${L_CIRC_D}px;
  border-radius:50%; overflow:visible;
" viewBox="${-L_CIRC_D / 2} ${-L_CIRC_D / 2} ${L_CIRC_D} ${L_CIRC_D}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="0" cy="0" r="${L_CIRC_D / 2}" fill="var(--text)"/>
</svg>`;

  // Left circle label + subs
  const subTagH = 28;
  const totalSubH = leftSub.length * (subTagH + 6);
  const subStartY = AREA_CY + 16;

  const leftContent = `<div data-region="left_label" class="ts-region" style="
  left:${L_CX - L_CIRC_D / 2}px; top:${AREA_CY - L_CIRC_D / 2 + 16}px;
  width:${L_CIRC_D}px; height:${Math.round(L_CIRC_D / 3)}px;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
">
  <div style="
    font-family:var(--font-head);
    font-size:16px;
    color:#fff;
    font-weight:700;
    text-align:center;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    padding:0 8px;
    box-sizing:border-box;
  ">${leftLabel}</div>
</div>
${leftSub.map((sub, i) => `<div data-region="left_sub_${i + 1}" class="ts-region" style="
  left:${L_CX - Math.round(L_CIRC_D * 0.35)}px;
  top:${subStartY + i * (subTagH + 4)}px;
  width:${Math.round(L_CIRC_D * 0.7)}px; height:${subTagH}px;
  background:rgba(255,255,255,0.15);
  border-radius:3px;
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:2px 6px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-body);
    font-size:11px;
    color:#fff;
    text-align:center;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${sub}</div>
</div>`).join('\n')}`;

  // Right circle
  const rightCircle = `<svg data-region="right_circle" class="ts-region" style="
  left:${R_CX - R_CIRC_D / 2}px; top:${AREA_CY - R_CIRC_D / 2}px;
  width:${R_CIRC_D}px; height:${R_CIRC_D}px;
  border-radius:50%; overflow:visible;
" viewBox="${-R_CIRC_D / 2} ${-R_CIRC_D / 2} ${R_CIRC_D} ${R_CIRC_D}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="0" cy="0" r="${R_CIRC_D / 2}" fill="var(--surface)"/>
</svg>`;

  const rightSubStartY = AREA_CY + 16;
  const rightContent = `<div data-region="right_label" class="ts-region" style="
  left:${R_CX - R_CIRC_D / 2}px; top:${AREA_CY - R_CIRC_D / 2 + 16}px;
  width:${R_CIRC_D}px; height:${Math.round(R_CIRC_D / 3)}px;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
">
  <div style="
    font-family:var(--font-head);
    font-size:16px;
    color:var(--text);
    font-weight:700;
    text-align:center;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    padding:0 8px;
    box-sizing:border-box;
  ">${rightLabel}</div>
</div>
${rightSub.map((sub, i) => `<div data-region="right_sub_${i + 1}" class="ts-region" style="
  left:${R_CX - Math.round(R_CIRC_D * 0.35)}px;
  top:${rightSubStartY + i * (subTagH + 4)}px;
  width:${Math.round(R_CIRC_D * 0.7)}px; height:${subTagH}px;
  background:var(--muted);
  border-radius:3px;
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:2px 6px;
  opacity:0.4;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-body);
    font-size:11px;
    color:var(--text);
    text-align:center;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${sub}</div>
</div>`).join('\n')}`;

  // Arrows in center area
  const cLeft = centerArea.left;
  const cW = centerArea.width;
  const ARR_MID_Y = AREA_CY;
  const ARR_GAP = 24;
  const ARR_TOP_Y = ARR_MID_Y - ARR_GAP;
  const ARR_BOT_Y = ARR_MID_Y + ARR_GAP;
  const ARR_H = 16;

  const arrowHtml = `<div data-region="center_arrows" class="ts-region" style="
  left:${cLeft}px; top:${AREA_TOP}px; width:${cW}px; height:${AREA_H}px;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:16px;
  box-sizing:border-box; padding:0 8px;
  overflow:hidden;
">
  <div style="width:100%; display:flex; flex-direction:column; align-items:center; gap:8px;">
    <div style="
      font-family:var(--font-body);
      font-size:11px;
      color:var(--muted);
      text-align:center;
      line-height:1.2;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
      margin-bottom:4px;
    ">${flowRight}</div>
    <svg viewBox="0 0 ${cW - 16} 16" width="${cW - 16}" height="16" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <line x1="0" y1="8" x2="${cW - 28}" y2="8" stroke="var(--muted)" stroke-width="2.5" opacity="0.7"/>
      <polygon points="${cW - 28},4 ${cW - 16},8 ${cW - 28},12" fill="var(--muted)" opacity="0.8"/>
    </svg>
    <svg viewBox="0 0 ${cW - 16} 16" width="${cW - 16}" height="16" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <line x1="${cW - 16}" y1="8" x2="12" y2="8" stroke="var(--muted)" stroke-width="2.5" opacity="0.7"/>
      <polygon points="12,4 0,8 12,12" fill="var(--muted)" opacity="0.8"/>
    </svg>
    <div style="
      font-family:var(--font-body);
      font-size:11px;
      color:var(--muted);
      text-align:center;
      line-height:1.2;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
      margin-top:4px;
    ">${flowLeft}</div>
  </div>
</div>`;

  return `
${titleHtml(title)}

<div data-region="left_circle_area" class="ts-region" style="
  left:${leftArea.left}px; top:${AREA_TOP}px; width:${leftArea.width}px; height:${AREA_H}px;
  overflow:hidden;
"></div>
<div data-region="right_circle_area" class="ts-region" style="
  left:${rightArea.left}px; top:${AREA_TOP}px; width:${rightArea.width}px; height:${AREA_H}px;
  overflow:hidden;
"></div>

${leftCircle}
${leftContent}
${rightCircle}
${rightContent}
${arrowHtml}
${sourceHtml(source)}
`.trim();
});
