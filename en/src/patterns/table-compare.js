/**
 * table-compare.js — テーブル・比較パターン群
 *
 * Patterns (layout-table-compare.md):
 *   comparison-matrix          行=比較軸 × 列=比較対象のマトリクス表（ハイライト列対応）
 *   pricing-plan-cards         3プランカード横並び（中央=推奨）
 *   pricing-comparison-table   左端ラベル列 + 3プラン列格子テーブル
 *   status-progress-table      プロジェクト進捗一覧テーブル（ステータス識別子付き）
 *   before-after-two-col       BEFORE/AFTER 2カラム対比
 *   risk-matrix-2x2            影響度×発生確率 2×2リスクマトリクス
 *
 * Theme: corporate-trust
 *
 * Grid constants (safe-area x 72..1208, y 56..664, width 1136):
 *   COL_UNIT = 96.6667px  (col width + 24px gutter)
 */

import { definePattern } from './registry.js';
import { table } from '../components/table.js';
import { cardGrid } from '../components/card-grid.js';
import { matrix2x2 } from '../components/matrix.js';
import { panel } from '../components/panel.js';
import { harveyBalls } from '../charts/harvey-balls.js';

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

// ── Shared helpers ─────────────────────────────────────────────────────────────

function titleDiv(title) {
  const tb = colRange(1, 12);
  return `<div data-region="action_title_bar" class="ts-region" style="
    left:${tb.left}px; top:56px; width:${tb.width}px; height:88px;
    display:flex; align-items:center;
  ">
    <div class="ts-title clip-guard" style="
      position:static; width:100%;
      font-family:var(--font-head); font-size:var(--h1); font-weight:700;
      color:var(--text); line-height:1.2;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${title}</div>
  </div>`;
}

function sourceDiv(source) {
  if (!source) return '';
  const sb = colRange(1, 12);
  return `<div data-region="source_note" class="ts-region" style="
    left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
    display:flex; align-items:center;
  ">
    <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
  </div>`;
}

// ── Pattern: comparison-matrix ────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   headers: string[],        // first cell empty, then comparison target names
 *   rows: string[][],         // each row: [rowHeader, cell1, cell2, ...]
 *   highlightCol?: number,    // 1-based column index to highlight (incl. row header)
 *   source?: string
 * }
 *
 * Layout (layout-table-compare.md comparison-matrix):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   table_header_row  col 1-12  offset 160  height 48
 *   table_body        col 1-12  offset 216  height 424  (rows fill this)
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('comparison-matrix', (c) => {
  const title = c.title ?? '';
  const headers = c.headers ?? [];
  const rows = c.rows ?? [];
  // highlightCol is 1-based user-facing; table component uses 0-based
  const highlightCol = c.highlightCol != null ? c.highlightCol - 1 : -1;
  const source = c.source ?? '';

  const tableHtml = table({
    headers,
    rows,
    highlightCol,
    top: 160,
    height: 480,  // header(48) + body(424) + source gap — table wraps both
    left: 72,
    width: 1136,
  });

  return `
${titleDiv(title)}
${tableHtml}
${sourceDiv(source)}
`.trim();
});

// ── Pattern: pricing-plan-cards ───────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   plans: Array<{
 *     name: string,
 *     price: string,
 *     unit?: string,
 *     badge?: string,       // e.g. "おすすめ"
 *     features: string[],   // 3-6 items
 *     highlight?: boolean   // true = center/recommended
 *   }>,   // exactly 3 items [left, center, right]
 *   source?: string
 * }
 *
 * Layout (layout-table-compare.md pricing-plan-cards):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   card_left         col 1-4   offset 160  height 480
 *   card_center       col 5-8   offset 160  height 480
 *   card_right        col 9-12  offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('pricing-plan-cards', (c) => {
  const title = c.title ?? '';
  const plans = c.plans ?? [];
  const source = c.source ?? '';

  function planCard(plan) {
    const isHighlight = !!plan.highlight;
    const bgStyle = isHighlight
      ? 'background:var(--primary);'
      : 'background:var(--surface);border:1px solid var(--muted);';
    const textColor = isHighlight ? '#fff' : 'var(--text)';
    const mutedColor = isHighlight ? 'rgba(255,255,255,0.75)' : 'var(--muted)';
    const badgeHtml = plan.badge
      ? `<div style="
          display:inline-block;
          background:${isHighlight ? '#fff' : 'var(--primary)'};
          color:${isHighlight ? 'var(--primary)' : '#fff'};
          font-family:var(--font-body);font-size:12px;font-weight:700;
          padding:3px 10px;border-radius:12px;margin-bottom:10px;
          white-space:nowrap;
        ">${plan.badge}</div>`
      : '';
    const featuresHtml = (plan.features ?? []).map(f =>
      `<div style="
        font-family:var(--font-body);font-size:14px;color:${mutedColor};
        line-height:1.5;padding:5px 0;border-bottom:1px solid ${isHighlight ? 'rgba(255,255,255,0.2)' : 'var(--surface)'};
        white-space:normal;overflow-wrap:break-word;
      ">・${f}</div>`
    ).join('');

    return `<div style="
      padding:24px 20px;box-sizing:border-box;height:100%;
      display:flex;flex-direction:column;
      ${bgStyle}border-radius:var(--radius);
    ">
      ${badgeHtml}
      <div style="font-family:var(--font-head);font-size:20px;font-weight:700;color:${textColor};margin-bottom:8px;white-space:normal;overflow-wrap:break-word;">${plan.name ?? ''}</div>
      <div style="font-family:var(--font-head);font-size:32px;font-weight:700;color:${textColor};line-height:1.1;margin-bottom:4px;">${plan.price ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:13px;color:${mutedColor};margin-bottom:16px;">${plan.unit ?? ''}</div>
      <div style="flex:1;">${featuresHtml}</div>
    </div>`;
  }

  const cardItems = [plans[0], plans[1], plans[2]].map(p => planCard(p ?? {}));

  return `
${titleDiv(title)}
${cardGrid(3, cardItems, { top: 160, height: 480 })}
${sourceDiv(source)}
`.trim();
});

// ── Pattern: pricing-comparison-table ────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   sub_heading: string,
 *   lead: string,
 *   headers: string[],        // ["項目", "ライト", "スタンダード★", "プレミアム"]
 *   rows: string[][],         // each row: [label, val1, val2, val3]
 *   highlightCol?: number,    // 1-based; recommended plan column
 *   source?: string
 * }
 *
 * Layout (layout-table-compare.md pricing-comparison-table):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   lead_band         col 1-12  offset 160  height 48
 *   table_area        col 1-12  offset 216  height 424
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('pricing-comparison-table', (c) => {
  const title = c.title ?? '';
  const subHeading = c.sub_heading ?? '';
  const lead = c.lead ?? '';
  const headers = c.headers ?? [];
  const rows = c.rows ?? [];
  const highlightCol = c.highlightCol != null ? c.highlightCol - 1 : -1;
  const source = c.source ?? '';

  const lb = colRange(1, 12);
  const leadBandHtml = `<div data-region="lead_band" class="ts-region" style="
    left:${lb.left}px; top:160px; width:${lb.width}px; height:48px;
    display:flex; flex-direction:column; justify-content:center; gap:2px;
  ">
    ${subHeading ? `<div style="font-family:var(--font-head);font-size:16px;font-weight:700;color:var(--text);white-space:normal;overflow-wrap:break-word;">${subHeading}</div>` : ''}
    ${lead ? `<div style="font-family:var(--font-body);font-size:13px;color:var(--muted);white-space:normal;overflow-wrap:break-word;">${lead}</div>` : ''}
  </div>`;

  const tableHtml = table({
    headers,
    rows,
    highlightCol,
    top: 216,
    height: 424,
    left: 72,
    width: 1136,
  });

  return `
${titleDiv(title)}
${leadBandHtml}
${tableHtml}
${sourceDiv(source)}
`.trim();
});

// ── Pattern: status-progress-table ───────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   headers?: string[],       // default ["施策・プロジェクト名", "ステータス", "完了日 / 備考"]
 *   rows: Array<{
 *     name: string,
 *     status: 'done' | 'in-progress' | 'delayed' | 'planned',
 *     status_label: string,  // e.g. "完了", "進行中", "遅延", "計画中"
 *     note: string
 *   }>,
 *   source?: string
 * }
 *
 * Layout (layout-table-compare.md status-progress-table):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   table_header      col 1-12  offset 160  height 40
 *   table_body        col 1-12  offset 208  height 432
 *   source_note       col 1-12  offset 640  height 24
 *
 * Status symbols (symbol + label, never color-only):
 *   done       ✓ 完了
 *   in-progress ○ 進行中
 *   delayed    △ 遅延
 *   planned    — 計画中
 */
definePattern('status-progress-table', (c) => {
  const title = c.title ?? '';
  const headers = c.headers ?? ['施策・プロジェクト名', 'ステータス', '完了日 / 備考'];
  const rowData = c.rows ?? [];
  const source = c.source ?? '';

  const STATUS_SYMBOL = {
    'done':        '✓',
    'in-progress': '○',
    'delayed':     '△',
    'planned':     '—',
  };

  const tableRows = rowData.map(r => {
    const sym = STATUS_SYMBOL[r.status] ?? '—';
    const label = r.status_label ?? r.status ?? '';
    const statusCell = `${sym} ${label}`;
    return [r.name ?? '', statusCell, r.note ?? ''];
  });

  const tableHtml = table({
    headers,
    rows: tableRows,
    highlightCol: -1,
    top: 160,
    height: 480,
    left: 72,
    width: 1136,
  });

  return `
${titleDiv(title)}
${tableHtml}
${sourceDiv(source)}
`.trim();
});

// ── Pattern: before-after-two-col ─────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   left_label?: string,      // default "BEFORE"
 *   right_label?: string,     // default "AFTER"
 *   arrow?: string,           // default "→"
 *   left_items: string[],     // 3-4 items
 *   right_items: string[],    // 3-4 items, matching order
 *   source?: string
 * }
 *
 * Layout (layout-table-compare.md before-after-two-col):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   left_col          col 1-5   offset 160  height 480
 *   arrow_zone        col 6-7   offset 160  height 480
 *   right_col         col 8-12  offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('before-after-two-col', (c) => {
  const title = c.title ?? '';
  const leftLabel = c.left_label ?? 'BEFORE';
  const rightLabel = c.right_label ?? 'AFTER';
  const arrow = c.arrow ?? '→';
  const leftItems = c.left_items ?? [];
  const rightItems = c.right_items ?? [];
  const source = c.source ?? '';

  // col 1-5 = 5 cols
  const leftR = colRange(1, 5);
  // col 6-7 = 2 cols
  const arrowR = colRange(6, 7);
  // col 8-12 = 5 cols
  const rightR = colRange(8, 12);

  function colPanel(label, items, fill) {
    const isBefore = fill === 'before';
    const labelStyle = isBefore
      ? 'color:var(--muted);'
      : 'color:var(--primary);';
    const itemsHtml = items.map(item =>
      `<div style="
        font-family:var(--font-body);font-size:15px;color:var(--text);
        line-height:1.6;padding:8px 0;border-bottom:1px solid var(--surface);
        white-space:normal;overflow-wrap:break-word;
      ">・${item}</div>`
    ).join('');
    return `<div style="
      padding:20px 18px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;
    ">
      <div style="
        font-family:var(--font-head);font-size:13px;font-weight:700;letter-spacing:0.1em;
        ${labelStyle}margin-bottom:14px;
      ">${label}</div>
      <div style="flex:1;">${itemsHtml}</div>
    </div>`;
  }

  const leftPanelHtml = panel({
    left: leftR.left,
    top: 160,
    width: leftR.width,
    height: 480,
    title: '',
    body: colPanel(leftLabel, leftItems, 'before'),
    fill: 'surface',
  });

  const rightPanelHtml = panel({
    left: rightR.left,
    top: 160,
    width: rightR.width,
    height: 480,
    title: '',
    body: colPanel(rightLabel, rightItems, 'after'),
    fill: 'surface',
  });

  const arrowHtml = `<div data-region="arrow_zone" class="ts-region" style="
    left:${arrowR.left}px; top:160px; width:${arrowR.width}px; height:480px;
    display:flex; align-items:center; justify-content:center;
  ">
    <div style="
      font-family:var(--font-head); font-size:36px; font-weight:700;
      color:var(--primary);
    ">${arrow}</div>
  </div>`;

  return `
${titleDiv(title)}
${leftPanelHtml}
${arrowHtml}
${rightPanelHtml}
${sourceDiv(source)}
`.trim();
});

// ── Pattern: risk-matrix-2x2 ──────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   axis_x?: { low: string, high: string },   // default 発生確率
 *   axis_y?: { low: string, high: string },   // default 影響度
 *   quadrants: [
 *     { label: string, items: string[] },  // TL: 高影響×低確率 = 重点管理
 *     { label: string, items: string[] },  // TR: 高影響×高確率 = 最優先対応
 *     { label: string, items: string[] },  // BL: 低影響×低確率 = 経過観察
 *     { label: string, items: string[] },  // BR: 低影響×高確率 = 対応計画
 *   ],
 *   legend: Array<{ label: string, desc: string }>,
 *   source?: string
 * }
 *
 * Layout (layout-table-compare.md risk-matrix-2x2):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   matrix_body       col 1-9   offset 160  height 480
 *   legend_panel      col 10-12 offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('risk-matrix-2x2', (c) => {
  const title = c.title ?? '';
  const axisX = c.axis_x ?? { low: '低 ←', high: '→ 高' };
  const axisY = c.axis_y ?? { low: '低', high: '高' };
  const quadrants = c.quadrants ?? [];
  const legend = c.legend ?? [];
  const source = c.source ?? '';

  // matrix_body: col 1-9 (9 cols)
  const matrixR = colRange(1, 9);
  // legend_panel: col 10-12 (3 cols)
  const legendR = colRange(10, 12);

  const matrixHtml = matrix2x2({
    axisX,
    axisY,
    quadrants,
    top: 160,
    height: 480,
    left: matrixR.left,
    width: matrixR.width,
  });

  const legendItems = legend.map(item =>
    `<div style="margin-bottom:12px;">
      <div style="font-family:var(--font-head);font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;white-space:normal;overflow-wrap:break-word;">${item.label ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:12px;color:var(--muted);line-height:1.5;white-space:normal;overflow-wrap:break-word;">${item.desc ?? ''}</div>
    </div>`
  ).join('');

  const legendPanelHtml = panel({
    left: legendR.left,
    top: 160,
    width: legendR.width,
    height: 480,
    title: '凡例',
    body: legendItems,
    fill: 'surface',
  });

  return `
${titleDiv(title)}
${matrixHtml}
${legendPanelHtml}
${sourceDiv(source)}
`.trim();
});
