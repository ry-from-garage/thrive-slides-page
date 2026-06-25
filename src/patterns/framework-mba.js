/**
 * framework-mba.js — 7 MBA/strategy-consulting framework patterns
 *
 * Patterns:
 *   swot-2x2                 SWOT 4-quadrant matrix
 *   porter-five-forces       5 panels + inline SVG arrows → center
 *   business-model-canvas    9-block BMC layout
 *   value-chain              support bands + primary columns + margin bar
 *   ansoff-matrix            2×2 product×market growth matrix
 *   3c-analysis              3 equal panels (Company / Customer / Competitor)
 *   pestel                   6 panels in 3×2 grid
 *
 * Safe area: x 72..1208 (width 1136), y 56..664, slide 1280×720
 */

import { definePattern } from './registry.js';
import { panel } from '../components/panel.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

function colX(n) { return SAFE_LEFT + (n - 1) * COL_UNIT; }
function colW(n) { return n * COL_UNIT - 24; }
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function titleDiv(title, top = 56, height = 72) {
  const r = colRange(1, 12);
  return `<div data-region="action_title_bar" class="ts-region" style="left:${r.left}px;top:${top}px;width:${r.width}px;height:${height}px;display:flex;align-items:center;">
  <div class="ts-title clip-guard" style="position:static;width:100%;font-family:var(--font-head);font-size:var(--h1);font-weight:700;color:var(--text);line-height:1.2;white-space:normal;overflow-wrap:break-word;word-break:keep-all;">${title}</div>
</div>`;
}

function sourceDiv(source, top = 640) {
  if (!source) return '';
  const r = colRange(1, 12);
  return `<div data-region="source_bar" class="ts-region" style="left:${r.left}px;top:${top}px;width:${r.width}px;height:24px;display:flex;align-items:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>`;
}

function bulletList(items, fontSize = 'var(--body)') {
  const lis = (items ?? []).map(item =>
    `<li style="font-family:var(--font-body);font-size:${fontSize};color:var(--text);margin-bottom:4px;line-height:1.5;white-space:normal;overflow-wrap:break-word;">${item}</li>`
  ).join('');
  return `<ul style="margin:0;padding-left:14px;list-style:disc;">${lis}</ul>`;
}

function quadrantBody(headingLabel, headingEn, intensity, items) {
  const intensityHtml = intensity
    ? `<div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);margin-bottom:6px;">${intensity}</div>`
    : '';
  return `<div style="padding:12px 12px 8px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;overflow:hidden;">
  <div style="font-family:var(--font-head);font-size:var(--h3);font-weight:700;color:var(--text);margin-bottom:2px;">${headingLabel}</div>
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);margin-bottom:6px;">${headingEn}</div>
  ${intensityHtml}
  ${bulletList(items, 'var(--caption)')}
</div>`;
}

// ── Pattern: swot-2x2 ─────────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   strengths:     {items:[string]},
 *   weaknesses:    {items:[string]},
 *   opportunities: {items:[string]},
 *   threats:       {items:[string]},
 *   source?: string
 * }
 *
 * Layout (from spec):
 *   action_title_bar  col 1-12  y=56   h=80
 *   axis_header_row   col 1-12  y=152  h=32
 *   quadrant_strengths     col 1-6   y=200  h=232  fill=light-gray
 *   quadrant_opportunities col 7-12  y=200  h=232
 *   row_divider       col 1-12  y=440  h=8
 *   quadrant_weaknesses    col 1-6   y=456  h=184  fill=light-gray
 *   quadrant_threats       col 7-12  y=456  h=184
 *   col_divider (SVG) x=middle        y=200..640
 *   source_bar        col 1-12  y=640  h=24
 */
definePattern('swot-2x2', (c) => {
  const title   = c.title ?? '';
  const source  = c.source ?? '';
  const S       = c.strengths     ?? {};
  const W       = c.weaknesses    ?? {};
  const O       = c.opportunities ?? {};
  const T       = c.threats       ?? {};

  const fullR   = colRange(1, 12);
  const leftR   = colRange(1, 6);
  const rightR  = colRange(7, 12);

  // axis header row (y=152 h=32)
  const axisHtml = `
<div data-region="axis_header_row" class="ts-region" style="left:${fullR.left}px;top:152px;width:${fullR.width}px;height:32px;display:flex;align-items:center;">
  <div style="width:50%;text-align:center;font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">内部環境</div>
  <div style="width:50%;text-align:center;font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">外部環境</div>
</div>`;

  // Upper quadrants (y=200 h=232)
  const sqPanel = panel({ left: leftR.left,  top: 200, width: leftR.width,  height: 232, title: '強み（Strengths）',     body: bulletList(S.items, 'var(--caption)'), fill: 'surface' });
  const oqPanel = panel({ left: rightR.left, top: 200, width: rightR.width, height: 232, title: '機会（Opportunities）', body: bulletList(O.items, 'var(--caption)'), fill: 'none'    });

  // Row divider (y=440 h=8)
  const rowDiv = `<div data-region="row_divider" class="ts-region" style="left:${fullR.left}px;top:440px;width:${fullR.width}px;height:8px;background:var(--muted);opacity:0.25;"></div>`;

  // Lower quadrants (y=456 h=184)
  const wqPanel = panel({ left: leftR.left,  top: 456, width: leftR.width,  height: 184, title: '弱み（Weaknesses）', body: bulletList(W.items, 'var(--caption)'), fill: 'surface' });
  const tqPanel = panel({ left: rightR.left, top: 456, width: rightR.width, height: 184, title: '脅威（Threats）',    body: bulletList(T.items, 'var(--caption)'), fill: 'none'    });

  // Vertical col divider via inline SVG overlay (x = midpoint between col6 and col7)
  const midX = Math.round((leftR.left + leftR.width + rightR.left) / 2);
  const colDivSvg = `<svg style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible;" viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <line x1="${midX}" y1="200" x2="${midX}" y2="640" stroke="var(--muted)" stroke-width="1.5" opacity="0.3"/>
</svg>`;

  return `
${titleDiv(title, 56, 80)}
${axisHtml}
${sqPanel}
${oqPanel}
${rowDiv}
${wqPanel}
${tqPanel}
${colDivSvg}
${sourceDiv(source, 640)}
`.trim();
});

// ── Pattern: porter-five-forces ───────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   rivalry:       {intensity, items:[string]},
 *   new_entrants:  {intensity, items:[string]},
 *   suppliers:     {intensity, items:[string]},
 *   buyers:        {intensity, items:[string]},
 *   substitutes:   {intensity, items:[string]},
 *   source?: string
 * }
 *
 * Layout (from spec):
 *   action_title_bar  col 1-12  y=56    h=72
 *   force_top         col 4-9   y=144   h=104   fill=light-gray
 *   center_rivalry    col 5-8   y=256   h=216   fill=mid-gray
 *   force_left        col 1-3   y=256   h=216   fill=light-gray
 *   force_right       col 10-12 y=256   h=216   fill=light-gray
 *   force_bottom      col 4-9   y=520   h=112   fill=light-gray
 *   SVG overlay: 4 arrows pointing inward to center_rivalry
 *   source_bar        col 1-12  y=640   h=24
 */
definePattern('porter-five-forces', (c) => {
  const title       = c.title ?? '';
  const source      = c.source ?? '';
  const rivalry     = c.rivalry      ?? {};
  const newEntrants = c.new_entrants ?? {};
  const suppliers   = c.suppliers    ?? {};
  const buyers      = c.buyers       ?? {};
  const substitutes = c.substitutes  ?? {};

  // Region coordinates (pixel-exact from spec + colRange)
  const topR    = colRange(4, 9);
  const leftR   = colRange(1, 3);
  const centerR = colRange(5, 8);
  const rightR  = colRange(10, 12);
  const botR    = colRange(4, 9);

  // Panel bodies — dark-background variant uses light colors to stay readable on primary fill
  function forceBody(label, en, intensity, items) {
    return `<div style="padding:10px 12px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;overflow:hidden;">
      <div style="font-family:var(--font-head);font-size:var(--body);font-weight:700;color:var(--text);margin-bottom:2px;">${label}</div>
      <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);margin-bottom:4px;">${en}</div>
      ${intensity ? `<div style="font-family:var(--font-body);font-size:var(--caption);color:var(--accent);font-weight:600;margin-bottom:4px;">${intensity}</div>` : ''}
      ${bulletList(items, 'var(--caption)')}
    </div>`;
  }

  // Light-text variant for primary-filled (dark) center panel
  function forceLightBody(label, en, intensity, items) {
    const lis = (items ?? []).map(item =>
      `<li style="font-family:var(--font-body);font-size:var(--caption);color:var(--bg);margin-bottom:4px;line-height:1.5;white-space:normal;overflow-wrap:break-word;">${item}</li>`
    ).join('');
    const bulletHtml = `<ul style="margin:0;padding-left:14px;list-style:disc;">${lis}</ul>`;
    return `<div style="padding:10px 12px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;overflow:hidden;">
      <div style="font-family:var(--font-head);font-size:var(--body);font-weight:700;color:var(--bg);margin-bottom:2px;">${label}</div>
      <div style="font-family:var(--font-body);font-size:var(--caption);color:rgba(255,255,255,0.65);margin-bottom:4px;">${en}</div>
      ${intensity ? `<div style="font-family:var(--font-body);font-size:var(--caption);color:#ffd080;font-weight:600;margin-bottom:4px;">${intensity}</div>` : ''}
      ${bulletHtml}
    </div>`;
  }

  const topPanel    = panel({ left: topR.left,    top: 144, width: topR.width,    height: 104, title: '', body: forceBody('新規参入の脅威', 'Threat of New Entrants', newEntrants.intensity, newEntrants.items ?? []), fill: 'surface' });
  const leftPanel   = panel({ left: leftR.left,   top: 256, width: leftR.width,   height: 216, title: '', body: forceBody('売り手の交渉力', 'Bargaining Power of Suppliers', suppliers.intensity, suppliers.items ?? []),  fill: 'surface' });
  const centerPanel = panel({ left: centerR.left, top: 256, width: centerR.width, height: 216, title: '', body: forceLightBody('業界内競合', 'Industry Rivalry',              rivalry.intensity,     rivalry.items    ?? []),  fill: 'primary' });
  const rightPanel  = panel({ left: rightR.left,  top: 256, width: rightR.width,  height: 216, title: '', body: forceBody('買い手の交渉力', 'Bargaining Power of Buyers',    buyers.intensity,      buyers.items     ?? []),  fill: 'surface' });
  const botPanel    = panel({ left: botR.left,    top: 520, width: botR.width,    height: 112, title: '', body: forceBody('代替品の脅威',   'Threat of Substitutes',         substitutes.intensity, substitutes.items ?? []), fill: 'surface' });

  // Arrow overlay SVG — all arrows point INWARD toward center_rivalry
  // Center of each region (absolute slide coords):
  const cxCenter = centerR.left + centerR.width / 2;
  const cyCenter = 256 + 216 / 2;   // 364

  // Top panel center-bottom → center top edge
  const topCX  = topR.left + topR.width / 2;
  const topCY  = 144 + 104;   // bottom of top panel = 248

  // Left panel center-right → center left edge
  const leftCX = leftR.left + leftR.width;  // right edge of left panel
  const leftCY = 256 + 216 / 2;             // 364

  // Right panel center-left → center right edge
  const rightCX = rightR.left;              // left edge of right panel
  const rightCY = 256 + 216 / 2;           // 364

  // Bottom panel center-top → center bottom edge
  const botCX  = botR.left + botR.width / 2;
  const botCY  = 520;   // top of bottom panel

  // Arrow targets: center panel edges
  const arrowGap = 8;
  const topTarget_y    = 256;                          // top edge of center
  const botTarget_y    = 256 + 216;                    // bottom edge
  const leftTarget_x   = centerR.left;                 // left edge of center
  const rightTarget_x  = centerR.left + centerR.width; // right edge of center

  // Helper: draw a line + arrowhead pointing toward (ex, ey)
  function arrowLine(x1, y1, x2, y2) {
    // arrowhead triangle at (x2,y2) pointing in direction (x2-x1, y2-y1)
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const headLen = 10;
    const headWid = 5;
    // tip at (x2, y2); base midpoint at tip - headLen*(ux,uy)
    const bx = x2 - headLen * ux;
    const by = y2 - headLen * uy;
    // perpendicular
    const px = -uy;
    const py = ux;
    const p1x = bx + headWid * px;
    const p1y = by + headWid * py;
    const p2x = bx - headWid * px;
    const p2y = by - headWid * py;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${(x2 - headLen * ux).toFixed(1)}" y2="${(y2 - headLen * uy).toFixed(1)}" stroke="var(--muted)" stroke-width="2" opacity="0.6"/>
<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}" fill="var(--muted)" opacity="0.6"/>`;
  }

  const arrowSvg = `<svg style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible;" viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  ${arrowLine(topCX,   topCY + arrowGap,   topCX,   topTarget_y  - arrowGap)}
  ${arrowLine(leftCX  - arrowGap, leftCY,  leftTarget_x  + arrowGap, leftCY)}
  ${arrowLine(rightCX + arrowGap, rightCY, rightTarget_x - arrowGap, rightCY)}
  ${arrowLine(botCX,  botCY  - arrowGap,  botCX,   botTarget_y  + arrowGap)}
</svg>`;

  return `
${titleDiv(title, 56, 72)}
${topPanel}
${leftPanel}
${centerPanel}
${rightPanel}
${botPanel}
${arrowSvg}
${sourceDiv(source, 640)}
`.trim();
});

// ── Pattern: business-model-canvas ───────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   kp: {items:[string]},  — Key Partners
 *   ka: {items:[string]},  — Key Activities
 *   kr: {items:[string]},  — Key Resources
 *   vp: {items:[string]},  — Value Proposition
 *   cr: {items:[string]},  — Customer Relationships
 *   ch: {items:[string]},  — Channels
 *   cs: {items:[string]},  — Customer Segments
 *   cost:    {items:[string]},
 *   revenue: {items:[string]},
 *   source?: string
 * }
 *
 * Layout (from spec):
 *   title       col 1-12  y=56   h=72
 *   kp_block    col 1-2   y=144  h=368
 *   ka_block    col 3-4   y=144  h=176
 *   kr_block    col 3-4   y=336  h=176
 *   vp_block    col 5-8   y=144  h=368   fill=primary
 *   cr_block    col 9-10  y=144  h=176
 *   ch_block    col 9-10  y=336  h=176
 *   cs_block    col 11-12 y=144  h=368
 *   cost_block  col 1-6   y=528  h=112
 *   revenue_blk col 7-12  y=528  h=112
 *   source_bar  col 1-12  y=640  h=24
 */
definePattern('business-model-canvas', (c) => {
  const title   = c.title   ?? '';
  const source  = c.source  ?? '';
  const kp = c.kp ?? {};
  const ka = c.ka ?? {};
  const kr = c.kr ?? {};
  const vp = c.vp ?? {};
  const cr = c.cr ?? {};
  const ch = c.ch ?? {};
  const cs = c.cs ?? {};
  const cost    = c.cost    ?? {};
  const revenue = c.revenue ?? {};

  const r12 = colRange(1, 12);
  const r12_half_L = colRange(1, 6);
  const r12_half_R = colRange(7, 12);

  // Column ranges
  const rKP  = colRange(1, 2);
  const rKA  = colRange(3, 4);
  const rVP  = colRange(5, 8);
  const rCR  = colRange(9, 10);
  const rCS  = colRange(11, 12);

  // BMC uses compact padding for narrow columns; VP (4-col) uses body-size text
  function bmcPanel(left, top, width, height, title, items, fillStyle, fontSize = 'var(--caption)') {
    // Narrow panels (2-col ≈ 170px) use 10px padding; wide panels keep 14px
    const pad = width < 250 ? '10px' : '14px';
    const lis = (items ?? []).map(item =>
      `<li style="font-family:var(--font-body);font-size:${fontSize};color:${fillStyle === 'primary' ? 'var(--bg)' : 'var(--text)'};margin-bottom:3px;line-height:1.4;white-space:normal;overflow-wrap:break-word;">${item}</li>`
    ).join('');
    const bodyHtml = `<ul style="margin:0;padding-left:12px;list-style:disc;">${lis}</ul>`;
    const titleColor = fillStyle === 'primary' ? 'var(--bg)' : 'var(--text)';
    const innerHtml = `<div style="padding:${pad};box-sizing:border-box;height:100%;display:flex;flex-direction:column;overflow:hidden;">
      <div style="font-family:var(--font-head);font-size:var(--caption);font-weight:700;color:${titleColor};margin-bottom:6px;line-height:1.3;">${title}</div>
      ${bodyHtml}
    </div>`;
    const fillClass = `ts-panel--${fillStyle}`;
    return `<div class="ts-region ts-panel ${fillClass}" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px;padding:0;">${innerHtml}</div>`;
  }

  const kpPanel  = bmcPanel(rKP.left,  144, rKP.width,  368, '主要パートナー (KP)',      kp.items,  'surface');
  const kaPanel  = bmcPanel(rKA.left,  144, rKA.width,  176, '主要活動 (KA)',            ka.items,  'surface');
  const krPanel  = bmcPanel(rKA.left,  336, rKA.width,  176, '主要リソース (KR)',        kr.items,  'surface');
  const vpPanel  = bmcPanel(rVP.left,  144, rVP.width,  368, '価値提案 (VP)',            vp.items,  'primary', 'var(--body)');
  const crPanel  = bmcPanel(rCR.left,  144, rCR.width,  176, '顧客との関係 (CR)',        cr.items,  'surface');
  const chPanel  = bmcPanel(rCR.left,  336, rCR.width,  176, 'チャネル (CH)',            ch.items,  'surface');
  const csPanel  = bmcPanel(rCS.left,  144, rCS.width,  368, '顧客セグメント (CS)',      cs.items,  'surface');
  const costPanel    = bmcPanel(r12_half_L.left, 528, r12_half_L.width, 112, 'コスト構造 (Cost Structure)',  cost.items,    'none');
  const revenuePanel = bmcPanel(r12_half_R.left, 528, r12_half_R.width, 112, '収益の流れ (Revenue Streams)', revenue.items, 'none');

  return `
${titleDiv(title, 56, 72)}
${kpPanel}
${kaPanel}
${krPanel}
${vpPanel}
${crPanel}
${chPanel}
${csPanel}
${costPanel}
${revenuePanel}
${sourceDiv(source, 640)}
`.trim();
});

// ── Pattern: value-chain ──────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   support: [
 *     {label, note},  — 企業インフラ
 *     {label, note},  — 人事・労務
 *     {label, note},  — 技術開発
 *     {label, note},  — 調達
 *   ],
 *   primary: [
 *     {label, items:[string]},  — 購買物流
 *     {label, items:[string]},  — 製造
 *     {label, items:[string]},  — 出荷物流
 *     {label, items:[string]},  — M&S
 *     {label, items:[string]},  — サービス
 *   ],
 *   margin_label?: string,
 *   source?: string
 * }
 *
 * Layout (from spec):
 *   title             col 1-12  y=56   h=72
 *   support_firm_infra col 1-11  y=144  h=64   fill=surface
 *   support_hr         col 1-11  y=216  h=64   fill=surface
 *   support_tech       col 1-11  y=288  h=64   fill=surface
 *   support_procurement col 1-11 y=360  h=64   fill=surface
 *   margin_bar         col 12    y=144  h=488  fill=primary
 *   primary_inbound    col 1-2   y=440  h=192
 *   primary_operations col 3-5   y=440  h=192
 *   primary_outbound   col 6-7   y=440  h=192
 *   primary_marketing  col 8-9   y=440  h=192
 *   primary_service    col 10-11 y=440  h=192
 *   source_bar         col 1-12  y=640  h=24
 */
definePattern('value-chain', (c) => {
  const title       = c.title        ?? '';
  const source      = c.source       ?? '';
  const support     = c.support      ?? [{}, {}, {}, {}];
  const primary     = c.primary      ?? [{}, {}, {}, {}, {}];
  const marginLabel = c.margin_label ?? 'Margin\n利益';

  // Support band ranges (col 1-11)
  const supR  = colRange(1, 11);
  // Margin bar (col 12)
  const marR  = colRange(12, 12);
  // Primary activity column ranges
  const pR = [
    colRange(1, 2),   // inbound
    colRange(3, 5),   // operations
    colRange(6, 7),   // outbound
    colRange(8, 9),   // marketing
    colRange(10, 11), // service
  ];
  const supLabels = ['企業インフラ', '人事・労務管理', '技術開発・R&D', '調達活動'];

  // Support activity bands
  const supOffsets = [144, 216, 288, 360];
  const supHtml = supOffsets.map((topY, i) => {
    const s   = support[i] ?? {};
    const lbl = s.label ?? supLabels[i];
    const note = s.note ?? '';
    const body = `<div style="display:flex;align-items:center;height:100%;gap:12px;padding:0 8px;">
      <div style="font-family:var(--font-head);font-size:var(--caption);font-weight:700;color:var(--text);min-width:80px;white-space:pre-wrap;line-height:1.3;">${lbl}</div>
      <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);white-space:pre-wrap;line-height:1.4;overflow:hidden;">${note}</div>
    </div>`;
    return panel({ left: supR.left, top: topY, width: supR.width, height: 64, title: '', body, fill: 'surface' });
  }).join('\n');

  // Margin bar
  const marginBody = `<div style="height:100%;display:flex;align-items:center;justify-content:center;">
    <div style="font-family:var(--font-head);font-size:var(--caption);font-weight:700;color:#fff;writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;white-space:pre-wrap;line-height:1.4;">${marginLabel}</div>
  </div>`;
  const marginHtml = panel({ left: marR.left, top: 144, width: marR.width, height: 488, title: '', body: marginBody, fill: 'primary' });

  // Primary activity columns
  const priLabels = ['購買物流', '製造・オペレーション', '出荷物流', 'マーケティング・販売', 'アフターサービス'];
  const priHtml = pR.map((r, i) => {
    const p   = primary[i] ?? {};
    const lbl = p.label ?? priLabels[i];
    const body = `<div style="padding:10px 8px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;overflow:hidden;">
      <div style="font-family:var(--font-head);font-size:var(--caption);font-weight:700;color:var(--text);margin-bottom:6px;line-height:1.3;">${lbl}</div>
      ${bulletList(p.items ?? [], 'var(--caption)')}
    </div>`;
    return panel({ left: r.left, top: 440, width: r.width, height: 192, title: '', body, fill: 'none' });
  }).join('\n');

  return `
${titleDiv(title, 56, 72)}
${supHtml}
${marginHtml}
${priHtml}
${sourceDiv(source, 640)}
`.trim();
});

// ── Pattern: ansoff-matrix ────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   penetration:     {risk, items:[string]},
 *   product_dev:     {risk, items:[string]},
 *   market_dev:      {risk, items:[string]},
 *   diversification: {risk, items:[string]},
 *   risk_note?: string,
 *   source?: string
 * }
 *
 * Layout (from spec):
 *   title                   col 1-12  y=56   h=72
 *   col_header_existing     col 4-7   y=144  h=32
 *   col_header_new          col 8-12  y=144  h=32
 *   row_header_existing_mkt col 1-3   y=192  h=232
 *   row_header_new_mkt      col 1-3   y=432  h=200
 *   quadrant_penetration    col 4-7   y=192  h=232   fill=surface
 *   quadrant_product_dev    col 8-12  y=192  h=232
 *   row_separator           col 4-12  y=424  h=8
 *   quadrant_market_dev     col 4-7   y=432  h=200
 *   quadrant_diversification col 8-12 y=432  h=200
 *   risk_arrow_note         col 4-12  y=640  h=24
 */
definePattern('ansoff-matrix', (c) => {
  const title       = c.title           ?? '';
  const source      = c.source          ?? '';
  const pen         = c.penetration     ?? {};
  const prodDev     = c.product_dev     ?? {};
  const mktDev      = c.market_dev      ?? {};
  const divers      = c.diversification ?? {};
  const riskNote    = c.risk_note       ?? '↗ リスク増加方向：市場浸透（低）→ 多角化（高）';

  const axisLabelR  = colRange(1, 3);
  const colHdrExR   = colRange(4, 7);
  const colHdrNewR  = colRange(8, 12);
  const quadR_TL    = colRange(4, 7);
  const quadR_TR    = colRange(8, 12);
  const sepR        = colRange(4, 12);
  const riskR       = colRange(4, 12);

  function quadBody(stratLabel, stratEn, risk, items) {
    return `<div style="padding:12px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;overflow:hidden;">
      <div style="font-family:var(--font-head);font-size:var(--body);font-weight:700;color:var(--text);margin-bottom:2px;">${stratLabel}</div>
      <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);margin-bottom:4px;">${stratEn}</div>
      ${risk ? `<div style="font-family:var(--font-body);font-size:var(--caption);color:var(--accent);font-weight:600;margin-bottom:6px;">リスク：${risk}</div>` : ''}
      ${bulletList(items ?? [], 'var(--caption)')}
    </div>`;
  }

  // Column and row axis headers
  const colHeaderExHtml = `<div data-region="col_header_existing" class="ts-region" style="left:${colHdrExR.left}px;top:144px;width:${colHdrExR.width}px;height:32px;display:flex;align-items:center;justify-content:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">既存製品</div>
</div>`;
  const colHeaderNewHtml = `<div data-region="col_header_new" class="ts-region" style="left:${colHdrNewR.left}px;top:144px;width:${colHdrNewR.width}px;height:32px;display:flex;align-items:center;justify-content:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">新規製品</div>
</div>`;
  const rowHdrExHtml = `<div data-region="row_header_existing" class="ts-region" style="left:${axisLabelR.left}px;top:192px;width:${axisLabelR.width}px;height:232px;display:flex;align-items:center;justify-content:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);writing-mode:vertical-rl;transform:rotate(180deg);">既存市場</div>
</div>`;
  const rowHdrNewHtml = `<div data-region="row_header_new" class="ts-region" style="left:${axisLabelR.left}px;top:432px;width:${axisLabelR.width}px;height:200px;display:flex;align-items:center;justify-content:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);writing-mode:vertical-rl;transform:rotate(180deg);">新規市場</div>
</div>`;

  // Quadrant panels
  const penPanel   = panel({ left: quadR_TL.left, top: 192, width: quadR_TL.width, height: 232, title: '', body: quadBody('市場浸透', 'Market Penetration',  pen.risk,     pen.items),     fill: 'surface' });
  const prodPanel  = panel({ left: quadR_TR.left, top: 192, width: quadR_TR.width, height: 232, title: '', body: quadBody('製品開発', 'Product Development', prodDev.risk, prodDev.items), fill: 'none'    });
  const rowSep     = `<div data-region="row_separator" class="ts-region" style="left:${sepR.left}px;top:424px;width:${sepR.width}px;height:8px;background:var(--muted);opacity:0.25;"></div>`;
  const mktPanel   = panel({ left: quadR_TL.left, top: 432, width: quadR_TL.width, height: 200, title: '', body: quadBody('市場開発', 'Market Development',  mktDev.risk,  mktDev.items),  fill: 'none'    });
  const divPanel   = panel({ left: quadR_TR.left, top: 432, width: quadR_TR.width, height: 200, title: '', body: quadBody('多角化',   'Diversification',      divers.risk,  divers.items),  fill: 'none'    });

  // Vertical col divider between col 7 and 8
  const midX = Math.round((quadR_TL.left + quadR_TL.width + quadR_TR.left) / 2);
  const colDivSvg = `<svg style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible;" viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <line x1="${midX}" y1="192" x2="${midX}" y2="632" stroke="var(--muted)" stroke-width="1.5" opacity="0.25"/>
</svg>`;

  // Risk note
  const riskNoteHtml = `<div data-region="risk_arrow_note" class="ts-region" style="left:${riskR.left}px;top:640px;width:${riskR.width}px;height:24px;display:flex;align-items:center;">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${riskNote}${source ? '　' + source : ''}</div>
</div>`;

  return `
${titleDiv(title, 56, 72)}
${colHeaderExHtml}
${colHeaderNewHtml}
${rowHdrExHtml}
${rowHdrNewHtml}
${penPanel}
${prodPanel}
${rowSep}
${mktPanel}
${divPanel}
${colDivSvg}
${riskNoteHtml}
`.trim();
});

// ── Pattern: 3c-analysis ──────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   company:    {items:[string]},
 *   customer:   {items:[string]},
 *   competitor: {items:[string]},
 *   ksf?: string,
 *   source?: string
 * }
 *
 * Layout (from spec):
 *   title           col 1-12  y=56   h=72
 *   panel_company   col 1-4   y=144  h=464  fill=primary
 *   panel_customer  col 5-8   y=144  h=464  fill=surface
 *   panel_competitor col 9-12 y=144  h=464  fill=surface
 *   ksf_source_bar  col 1-12  y=624  h=24
 */
definePattern('3c-analysis', (c) => {
  const title      = c.title      ?? '';
  const source     = c.source     ?? '';
  const company    = c.company    ?? {};
  const customer   = c.customer   ?? {};
  const competitor = c.competitor ?? {};
  const ksf        = c.ksf        ?? '';

  const rC  = colRange(1, 4);
  const rCu = colRange(5, 8);
  const rCo = colRange(9, 12);
  const rFull = colRange(1, 12);

  function cBody(items, light = false) {
    const color = light ? 'var(--bg)' : 'var(--text)';
    const lis = (items ?? []).map(item =>
      `<li style="font-family:var(--font-body);font-size:var(--body);color:${color};margin-bottom:4px;line-height:1.5;white-space:normal;overflow-wrap:break-word;">${item}</li>`
    ).join('');
    return `<ul style="margin:0;padding-left:14px;list-style:disc;">${lis}</ul>`;
  }

  // Panels fill content area y=144..624 (h=480), leaving 24px for KSF bar at y=632
  const companyPanel    = panel({ left: rC.left,  top: 144, width: rC.width,  height: 480, title: '自社（Company）',    body: cBody(company.items, true),  fill: 'primary' });
  const customerPanel   = panel({ left: rCu.left, top: 144, width: rCu.width, height: 480, title: '顧客（Customer）',   body: cBody(customer.items),        fill: 'surface' });
  const competitorPanel = panel({ left: rCo.left, top: 144, width: rCo.width, height: 480, title: '競合（Competitor）', body: cBody(competitor.items),      fill: 'surface' });

  // KSF + source bar (y=632 h=24) — moved down to fill slide height
  const ksfHtml = (ksf || source) ? `<div data-region="ksf_source_bar" class="ts-region" style="left:${rFull.left}px;top:632px;width:${rFull.width}px;height:24px;display:flex;align-items:center;gap:16px;">
  ${ksf    ? `<div style="font-family:var(--font-body);font-size:var(--caption);color:var(--text);font-weight:600;">KSF: ${ksf}</div>` : ''}
  ${source ? `<div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>` : ''}
</div>` : '';

  return `
${titleDiv(title, 56, 72)}
${companyPanel}
${customerPanel}
${competitorPanel}
${ksfHtml}
`.trim();
});

// ── Pattern: pestel ───────────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   political:     {items:[string]},
 *   economic:      {items:[string]},
 *   social:        {items:[string]},
 *   technological: {items:[string]},
 *   environmental: {items:[string]},
 *   legal:         {items:[string]},
 *   source?: string
 * }
 *
 * Layout (from spec):
 *   title           col 1-12  y=56   h=72
 *   block_political    col 1-4   y=144  h=240  fill=surface
 *   block_economic     col 5-8   y=144  h=240  fill=surface
 *   block_social       col 9-12  y=144  h=240  fill=surface
 *   block_technological col 1-4  y=400  h=200
 *   block_environmental col 5-8  y=400  h=200
 *   block_legal         col 9-12 y=400  h=200
 *   source_bar       col 1-12  y=640  h=24
 */
definePattern('pestel', (c) => {
  const title  = c.title         ?? '';
  const source = c.source        ?? '';
  const P      = c.political     ?? {};
  const E      = c.economic      ?? {};
  const S      = c.social        ?? {};
  const T      = c.technological ?? {};
  const Env    = c.environmental ?? {};
  const L      = c.legal         ?? {};

  const r1 = colRange(1, 4);
  const r2 = colRange(5, 8);
  const r3 = colRange(9, 12);

  function pBody(items) {
    return bulletList(items ?? [], 'var(--caption)');
  }

  // Upper row (y=144 h=240)
  const pPanel   = panel({ left: r1.left, top: 144, width: r1.width, height: 240, title: '政治（Political）',     body: pBody(P.items),   fill: 'surface' });
  const ePanel   = panel({ left: r2.left, top: 144, width: r2.width, height: 240, title: '経済（Economic）',     body: pBody(E.items),   fill: 'surface' });
  const sPanel   = panel({ left: r3.left, top: 144, width: r3.width, height: 240, title: '社会（Social）',       body: pBody(S.items),   fill: 'surface' });

  // Lower row (y=400 h=200)
  const tPanel   = panel({ left: r1.left, top: 400, width: r1.width, height: 200, title: '技術（Technological）', body: pBody(T.items),   fill: 'none' });
  const envPanel = panel({ left: r2.left, top: 400, width: r2.width, height: 200, title: '環境（Environmental）', body: pBody(Env.items), fill: 'none' });
  const lPanel   = panel({ left: r3.left, top: 400, width: r3.width, height: 200, title: '法的（Legal）',         body: pBody(L.items),   fill: 'none' });

  return `
${titleDiv(title, 56, 72)}
${pPanel}
${ePanel}
${sPanel}
${tPanel}
${envPanel}
${lPanel}
${sourceDiv(source, 640)}
`.trim();
});
