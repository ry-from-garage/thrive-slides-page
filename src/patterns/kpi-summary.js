/**
 * kpi-summary.js — KPI・まとめパターン群
 *
 * Patterns:
 *   three-kpi-big-number   3 equal-width KPI cards (cardGrid(3, kpis.map(kpiStat)))
 *   kgi-kpi-dashboard      4-layer goal→KGI→KPI→initiative dashboard
 *   summary-three-points   SUMMARY left panel + 3-point checklist
 *   action-items-list      ACTION ITEMS table (label-band + table)
 *   key-takeaways          KEY INSIGHT panel (left 4-col) + TAKEAWAYS list (right 8-col)
 *
 * Theme: vibrant-pitch (white bg, electric purple #6600FF, accent #FF6000)
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   col_start(n) = 72 + (n-1) * 96.6667  (n = 1..12)
 *   col_width(n) = n * 96.6667 - 24       (span of n columns)
 *
 * All vertical_offset_px and row_height_px taken directly from layout spec.
 */

import { definePattern } from './registry.js';
import { cardGrid }       from '../components/card-grid.js';
import { kpiStat }        from '../components/kpi-stat.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT  = 96.6667;
const SAFE_LEFT = 72;

function colX(n)      { return SAFE_LEFT + (n - 1) * COL_UNIT; }
function colW(n)      { return n * COL_UNIT - 24; }
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Shared title region ───────────────────────────────────────────────────────
function titleBar(text) {
  const r = colRange(1, 12);
  return `<div data-region="action_title_bar" class="ts-region" style="
  left:${r.left}px; top:56px; width:${r.width}px; height:88px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${text}</div>
</div>`;
}

// ── Shared source note ────────────────────────────────────────────────────────
function sourceNote(text) {
  if (!text) return '';
  const r = colRange(1, 12);
  return `<div data-region="source_note" class="ts-region" style="
  left:${r.left}px; top:640px; width:${r.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${text}</div>
</div>`;
}

// ── Pattern: three-kpi-big-number ─────────────────────────────────────────────
/**
 * content: {
 *   title:  string,
 *   kpis:   Array<{ label, value, sub, badge? }>,   // exactly 3
 *   source?: string
 * }
 *
 * Layout (layout-kpi-summary.md):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   kpi_card_left     col 1-4   offset 160  height 480   (cardGrid handles 3-equal)
 *   kpi_card_center   col 5-8   offset 160  height 480
 *   kpi_card_right    col 9-12  offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 *
 * MUST use cardGrid(3, kpis.map(kpiStat)) so all 3 cards are equal-width + evenly spaced.
 */
definePattern('three-kpi-big-number', (c) => {
  const title  = c.title  ?? '';
  const kpis   = c.kpis   ?? [];
  const source = c.source ?? '';

  const kpiItems = kpis.slice(0, 3).map(kpi =>
    `<div style="
      padding:32px 24px;
      box-sizing:border-box;
      height:100%;
      display:flex;
      flex-direction:column;
      justify-content:center;
    ">${kpiStat(kpi)}</div>`
  );

  return `
${titleBar(title)}

${cardGrid(3, kpiItems, { top: 160, height: 480 })}

${sourceNote(source)}
`.trim();
});

// ── Pattern: kgi-kpi-dashboard ────────────────────────────────────────────────
/**
 * content: {
 *   title:       string,
 *   goal:        string,                                       // ゴール帯テキスト
 *   kgis:        Array<{ badge, label, value, deadline }>,     // 3 items
 *   kpis:        Array<{ badge, label, progress }>,            // 3 items
 *   initiatives: Array<{ badge, title }>,                      // 2 items
 *   source?:     string
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   goal_band         col 1-12  offset 160  height 48
 *   kgi_row           col 1-12  offset 216  height 152
 *   kpi_row           col 1-12  offset 376  height 152
 *   initiative_row    col 1-12  offset 536  height 96
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('kgi-kpi-dashboard', (c) => {
  const title       = c.title       ?? '';
  const goal        = c.goal        ?? '';
  const kgis        = c.kgis        ?? [];
  const kpiList     = c.kpis        ?? [];
  const initiatives = c.initiatives ?? [];
  const source      = c.source      ?? '';

  const full = colRange(1, 12);

  // ── goal_band ────────────────────────────────────────────────────────────────
  const goalBand = `<div data-region="goal_band" class="ts-region" style="
  left:${full.left}px; top:160px; width:${full.width}px; height:48px;
  background:var(--surface);
  display:flex; align-items:center; padding:0 20px; box-sizing:border-box;
  border-left:4px solid var(--primary);
">
  <div style="
    font-family:var(--font-head); font-size:var(--body); font-weight:700;
    color:var(--text); white-space:normal; overflow-wrap:break-word;
  ">${goal}</div>
</div>`;

  // ── kgi_row: 3 absolutely-positioned cards using slide coordinate space ────
  // Each card is a ts-region div with its own left/top/width/height
  const kgiColW = Math.round((full.width - 2 * 24) / 3);
  const kgiCards = kgis.slice(0, 3).map((k, i) => {
    const left = full.left + i * (kgiColW + 24);
    return `<div data-region="kgi_card_${i}" class="ts-region" style="
  left:${left}px; top:216px; width:${kgiColW}px; height:152px;
  box-sizing:border-box; padding:12px 16px;
  border:1px solid var(--surface); border-radius:var(--radius);
  overflow:hidden;
">
  <div style="
    display:inline-block;
    background:var(--primary); color:#fff;
    font-family:var(--font-head); font-size:11px; font-weight:700;
    padding:2px 8px; border-radius:3px; margin-bottom:8px;
  ">${k.badge ?? 'KGI'}</div>
  <div style="font-family:var(--font-body);font-size:13px;color:var(--muted);margin-bottom:4px;white-space:normal;overflow-wrap:break-word;">${k.label ?? ''}</div>
  <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--primary);line-height:1.2;white-space:normal;overflow-wrap:break-word;">${k.value ?? ''}</div>
  ${k.deadline ? `<div style="font-family:var(--font-body);font-size:12px;color:var(--muted);margin-top:6px;">${k.deadline}</div>` : ''}
</div>`;
  }).join('\n');

  // ── kpi_row: 3 absolutely-positioned cards ────────────────────────────────
  const kpiCards = kpiList.slice(0, 3).map((k, i) => {
    const left = full.left + i * (kgiColW + 24);
    return `<div data-region="kpi_card_${i}" class="ts-region" style="
  left:${left}px; top:376px; width:${kgiColW}px; height:152px;
  box-sizing:border-box; padding:12px 16px;
  border:1px solid var(--surface); border-radius:var(--radius);
  overflow:hidden;
">
  <div style="
    display:inline-block;
    background:var(--secondary); color:#fff;
    font-family:var(--font-head); font-size:11px; font-weight:700;
    padding:2px 8px; border-radius:3px; margin-bottom:8px;
  ">${k.badge ?? 'KPI'}</div>
  <div style="font-family:var(--font-body);font-size:13px;color:var(--muted);margin-bottom:8px;white-space:normal;overflow-wrap:break-word;">${k.label ?? ''}</div>
  <div style="font-family:var(--font-head);font-size:20px;font-weight:700;color:var(--text);line-height:1.2;">${k.progress ?? ''}</div>
</div>`;
  }).join('\n');

  // ── initiative_row: 2 absolutely-positioned cards ─────────────────────────
  const initColW = Math.round((full.width - 24) / 2);
  const initCards = initiatives.slice(0, 2).map((ini, i) => {
    const left = full.left + i * (initColW + 24);
    return `<div data-region="initiative_card_${i}" class="ts-region" style="
  left:${left}px; top:536px; width:${initColW}px; height:96px;
  box-sizing:border-box; padding:10px 16px;
  background:var(--surface); border-radius:var(--radius);
  display:flex; flex-direction:column; justify-content:center;
  overflow:hidden;
">
  <div style="
    display:inline-block;
    background:var(--accent); color:#fff;
    font-family:var(--font-head); font-size:11px; font-weight:700;
    padding:2px 8px; border-radius:3px; margin-bottom:6px;
    align-self:flex-start;
  ">${ini.badge ?? '重点施策'}</div>
  <div style="font-family:var(--font-head);font-size:var(--body);font-weight:700;color:var(--text);white-space:normal;overflow-wrap:break-word;">${ini.title ?? ''}</div>
</div>`;
  }).join('\n');

  return `
${titleBar(title)}
${goalBand}
${kgiCards}
${kpiCards}
${initCards}
${sourceNote(source)}
`.trim();
});

// ── Pattern: summary-three-points ─────────────────────────────────────────────
/**
 * content: {
 *   title:   string,
 *   points:  Array<{ heading, body }>,   // 3 items
 *   source?: string
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   section_label_col col 1-3   offset 160  height 480  (mid-gray)
 *   points_col        col 4-12  offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('summary-three-points', (c) => {
  const title  = c.title  ?? '';
  const points = c.points ?? [];
  const source = c.source ?? '';

  const labelR  = colRange(1, 3);
  const pointsR = colRange(4, 12);

  // ── section_label_col ─────────────────────────────────────────────────────
  const sectionCol = `<div data-region="section_label_col" class="ts-region" style="
  left:${labelR.left}px; top:160px; width:${labelR.width}px; height:480px;
  background:var(--surface);
  display:flex; align-items:center; justify-content:center;
">
  <div style="
    font-family:var(--font-head); font-size:var(--h2); font-weight:700;
    color:var(--muted); letter-spacing:0.12em;
    writing-mode:vertical-rl; text-orientation:mixed;
    transform:rotate(180deg);
    user-select:none;
  ">SUMMARY</div>
</div>`;

  // ── points_col: 3 equal rows ──────────────────────────────────────────────
  const rowH = Math.floor(480 / 3); // 160px each
  const pointsHtml = points.slice(0, 3).map((p, i) => {
    const top = i * rowH;
    const isLast = i === 2;
    const borderBottom = isLast ? '' : `border-bottom:1px solid var(--surface);`;
    return `<div style="
      position:absolute; left:0; top:${top}px;
      width:100%; height:${rowH}px;
      box-sizing:border-box; padding:20px 24px;
      display:flex; align-items:flex-start; gap:16px;
      ${borderBottom}
    ">
      <div style="
        flex-shrink:0;
        width:32px; height:32px;
        border:2px solid var(--primary);
        border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-family:var(--font-head); font-size:16px; font-weight:700;
        color:var(--primary);
        margin-top:4px;
      ">✓</div>
      <div style="flex:1; min-width:0;">
        <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:6px;white-space:normal;overflow-wrap:break-word;">${p.heading ?? ''}</div>
        <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.6;white-space:normal;overflow-wrap:break-word;">${p.body ?? ''}</div>
      </div>
    </div>`;
  }).join('');

  const pointsCol = `<div data-region="points_col" class="ts-region" style="
  left:${pointsR.left}px; top:160px; width:${pointsR.width}px; height:480px;
  position:relative;
">
  ${pointsHtml}
</div>`;

  return `
${titleBar(title)}
${sectionCol}
${pointsCol}
${sourceNote(source)}
`.trim();
});

// ── Pattern: action-items-list ────────────────────────────────────────────────
/**
 * content: {
 *   title:   string,
 *   items:   Array<{ action, owner?, deadline? }>,   // 4-6 rows
 *   source?: string
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   label_band        col 1-12  offset 160  height 40
 *   table_header      col 1-12  offset 208  height 40   (mid-gray)
 *   table_body        col 1-12  offset 256  height 384
 *   source_note       col 1-12  offset 640  height 24
 *
 * Uses table component layout (direct HTML for full customization of badge + row look).
 */
definePattern('action-items-list', (c) => {
  const title  = c.title  ?? '';
  const items  = c.items  ?? [];
  const source = c.source ?? '';

  const full = colRange(1, 12);

  // ── label_band ─────────────────────────────────────────────────────────────
  const labelBand = `<div data-region="label_band" class="ts-region" style="
  left:${full.left}px; top:160px; width:${full.width}px; height:40px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-head); font-size:13px; font-weight:700;
    color:var(--primary); letter-spacing:0.1em;
  ">ACTION ITEMS</div>
</div>`;

  // ── table_header ──────────────────────────────────────────────────────────
  const tableHeader = `<div data-region="table_header" class="ts-region" style="
  left:${full.left}px; top:208px; width:${full.width}px; height:40px;
  background:var(--surface);
  display:flex; align-items:center;
  padding:0 16px; box-sizing:border-box;
  border-radius:var(--radius) var(--radius) 0 0;
">
  <div style="width:48px;flex-shrink:0;font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.06em;">No.</div>
  <div style="flex:1;font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.06em;">アクション内容</div>
  <div style="width:120px;flex-shrink:0;font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.06em;">担当者</div>
  <div style="width:96px;flex-shrink:0;font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.06em;text-align:right;">期限</div>
</div>`;

  // ── table_body rows ───────────────────────────────────────────────────────
  const rowH = Math.floor(384 / Math.max(items.length, 1));
  const clampedRowH = Math.min(rowH, 96); // guard tall rows
  const bodyRows = items.slice(0, 6).map((item, i) => {
    const isLast = i === items.length - 1 || i === 5;
    const borderBottom = isLast ? '' : `border-bottom:1px solid var(--surface);`;
    const owner = item.owner ?? '';
    const deadline = item.deadline ?? '';
    return `<div style="
      display:flex; align-items:center;
      padding:0 16px; height:${clampedRowH}px;
      box-sizing:border-box;
      ${borderBottom}
    ">
      <div style="
        width:48px; flex-shrink:0;
        display:flex; align-items:center; justify-content:center;
      ">
        <span style="
          display:inline-block;
          background:var(--primary); color:#fff;
          font-family:var(--font-head); font-size:12px; font-weight:700;
          width:28px; height:28px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
        ">${String(i + 1).padStart(2, '0')}</span>
      </div>
      <div style="flex:1;font-family:var(--font-body);font-size:var(--body);color:var(--text);line-height:1.5;white-space:normal;overflow-wrap:break-word;">${item.action ?? ''}</div>
      ${owner ? `<div style="width:120px;flex-shrink:0;font-family:var(--font-body);font-size:var(--body);color:var(--muted);">
        <span style="background:var(--surface);padding:2px 8px;border-radius:3px;white-space:nowrap;">${owner}</span>
      </div>` : '<div style="width:120px;flex-shrink:0;"></div>'}
      ${deadline ? `<div style="width:96px;flex-shrink:0;font-family:var(--font-body);font-size:var(--body);color:var(--muted);text-align:right;white-space:nowrap;">${deadline}</div>` : '<div style="width:96px;flex-shrink:0;"></div>'}
    </div>`;
  }).join('');

  const tableBody = `<div data-region="table_body" class="ts-region" style="
  left:${full.left}px; top:256px; width:${full.width}px; height:384px;
  overflow:hidden;
">
  ${bodyRows}
</div>`;

  return `
${titleBar(title)}
${labelBand}
${tableHeader}
${tableBody}
${sourceNote(source)}
`.trim();
});

// ── Pattern: key-takeaways ────────────────────────────────────────────────────
/**
 * content: {
 *   title:      string,
 *   insight:    { label?, text, data? },         // KEY INSIGHT panel
 *   takeaways:  Array<{ heading, body }>,         // 4-5 items
 *   source?:    string
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   insight_panel     col 1-4   offset 160  height 480  (dark bg)
 *   takeaways_col     col 5-12  offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('key-takeaways', (c) => {
  const title     = c.title     ?? '';
  const insight   = c.insight   ?? {};
  const takeaways = c.takeaways ?? [];
  const source    = c.source    ?? '';

  const insightR   = colRange(1, 4);
  const takeawaysR = colRange(5, 12);

  // ── insight_panel (dark-gray → uses var(--primary)) ───────────────────────
  const insightPanel = `<div data-region="insight_panel" class="ts-region" style="
  left:${insightR.left}px; top:160px; width:${insightR.width}px; height:480px;
  background:var(--primary);
  box-sizing:border-box; padding:28px 24px;
  display:flex; flex-direction:column;
  border-radius:var(--radius);
">
  <div style="
    font-family:var(--font-head); font-size:11px; font-weight:700;
    color:rgba(255,255,255,0.6); letter-spacing:0.12em; margin-bottom:20px;
  ">${insight.label ?? 'KEY INSIGHT'}</div>
  <div style="
    flex:1;
    font-family:var(--font-head); font-size:var(--h2); font-weight:700;
    color:#fff; line-height:1.45;
    white-space:normal; overflow-wrap:break-word;
  ">${insight.text ?? ''}</div>
  ${insight.data ? `<div style="
    margin-top:20px; padding-top:16px;
    border-top:1px solid rgba(255,255,255,0.2);
    font-family:var(--font-body); font-size:var(--caption);
    color:rgba(255,255,255,0.65); line-height:1.4;
    white-space:normal; overflow-wrap:break-word;
  ">${insight.data}</div>` : ''}
</div>`;

  // ── takeaways_col ─────────────────────────────────────────────────────────
  const itemCount = Math.min(takeaways.length, 5);
  const rowH = itemCount > 0 ? Math.floor(480 / itemCount) : 96;
  const takeawayRows = takeaways.slice(0, 5).map((t, i) => {
    const isLast = i === itemCount - 1;
    const borderBottom = isLast ? '' : `border-bottom:1px solid var(--surface);`;
    return `<div style="
      display:flex; align-items:flex-start; gap:14px;
      padding:16px 24px;
      height:${rowH}px; box-sizing:border-box;
      ${borderBottom}
    ">
      <div style="
        flex-shrink:0;
        font-family:var(--font-head); font-size:18px; font-weight:700;
        color:var(--primary); width:24px; text-align:center; margin-top:2px;
        line-height:1;
      ">${String(i + 1).padStart(2, '0')}</div>
      <div style="flex:1; min-width:0;">
        <div style="font-family:var(--font-head);font-size:var(--body);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:4px;white-space:normal;overflow-wrap:break-word;">${t.heading ?? ''}</div>
        <div style="font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1.55;white-space:normal;overflow-wrap:break-word;">${t.body ?? ''}</div>
      </div>
    </div>`;
  }).join('');

  const takeawaysCol = `<div data-region="takeaways_col" class="ts-region" style="
  left:${takeawaysR.left}px; top:160px; width:${takeawaysR.width}px; height:480px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head); font-size:11px; font-weight:700;
    color:var(--primary); letter-spacing:0.12em;
    padding:0 24px; height:40px; display:flex; align-items:center;
    border-bottom:2px solid var(--primary);
  ">TAKEAWAYS</div>
  <div style="position:relative;">
    ${takeawayRows}
  </div>
</div>`;

  return `
${titleBar(title)}
${insightPanel}
${takeawaysCol}
${sourceNote(source)}
`.trim();
});
