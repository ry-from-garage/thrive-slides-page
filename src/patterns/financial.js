/**
 * financial.js — Financial / Investor パターン群
 *
 * Patterns: unit-economics-stack, fundraising-ask, cap-table-summary,
 *           financial-three-statement, cohort-retention-heatmap
 *
 * Theme: strategy-consulting
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   COL_UNIT = 96.6667  (column width + gutter)
 *   colX(n)  = 72 + (n-1) * 96.6667
 *   colW(n)  = n * 96.6667 - 24
 *
 * All vertical_offset_px and row_height_px taken directly from
 * references/layouts/layout-financial.md.
 */

import { definePattern } from './registry.js';
import { pieDonut } from '../charts/pie-donut.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

function colX(n) { return SAFE_LEFT + (n - 1) * COL_UNIT; }
function colW(n) { return n * COL_UNIT - 24; }
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

function titleBar(text, { top = 56, height = 80 } = {}) {
  const r = colRange(1, 12);
  return `<div data-region="action_title_bar" class="ts-region" style="
  left:${r.left}px; top:${top}px; width:${r.width}px; height:${height}px;
  background:var(--surface);
  display:flex; align-items:center; box-sizing:border-box; padding:0 20px;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${text}</div>
</div>`;
}

function sourceNote(text, { top = 640 } = {}) {
  if (!text) return '';
  const r = colRange(1, 12);
  return `<div data-region="source_bar" class="ts-region" style="
  left:${r.left}px; top:${top}px; width:${r.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${text}</div>
</div>`;
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Pattern: unit-economics-stack ───────────────────────────────────────────────
/**
 * content: {
 *   title:   string,
 *   ltv:     { value, breakdown: Array<{label, value}> },      // 3-4 breakdown rows
 *   cac:     { value, breakdown: Array<{label, value}> },
 *   payback: { value, breakdown: Array<{label, value}> },
 *   source?: string
 * }
 *
 * Layout:
 *   action_title_bar        col 1-12  offset 56   height 80  (light-gray)
 *   ltv_block_number        col 1-4   offset 160  height 136
 *   ltv_block_breakdown     col 5-12  offset 160  height 136 (light-gray)
 *   connector_a             col 1-12  offset 296  height 24
 *   cac_block_number        col 1-4   offset 320  height 136
 *   cac_block_breakdown     col 5-12  offset 320  height 136 (light-gray)
 *   connector_b             col 1-12  offset 456  height 24
 *   payback_block_number    col 1-4   offset 480  height 128
 *   payback_block_breakdown col 5-12  offset 480  height 128 (light-gray)
 *   source_bar              col 1-12  offset 640  height 24
 */
definePattern('unit-economics-stack', (c) => {
  const title   = c.title   ?? '';
  const ltv     = c.ltv     ?? {};
  const cac     = c.cac     ?? {};
  const payback = c.payback ?? {};
  const source  = c.source  ?? '';

  const numR = colRange(1, 4);
  const bdR  = colRange(5, 12);
  const full = colRange(1, 12);

  function numberBlock(id, top, height, value) {
    return `<div data-region="${id}" class="ts-region" style="
  left:${numR.left}px; top:${top}px; width:${numR.width}px; height:${height}px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-head);font-size:var(--display);font-weight:700;color:var(--primary);line-height:1.1;white-space:normal;overflow-wrap:break-word;">${esc(value)}</div>
</div>`;
  }

  function breakdownBlock(id, top, height, rows) {
    return `<div data-region="${id}" class="ts-region" style="
  left:${bdR.left}px; top:${top}px; width:${bdR.width}px; height:${height}px;
  background:var(--surface);
  border-radius:var(--radius);
  box-sizing:border-box; padding:12px 20px;
  display:flex; flex-direction:column; justify-content:center; gap:6px;
">
  ${(rows ?? []).slice(0, 4).map(row => `<div style="display:flex; justify-content:space-between; font-family:var(--font-body); font-size:14px;">
    <span style="color:var(--muted);">${esc(row.label)}</span>
    <span style="color:var(--text);font-weight:600;">${esc(row.value)}</span>
  </div>`).join('')}
</div>`;
  }

  function connector(id, top) {
    return `<div data-region="${id}" class="ts-region" style="
  left:${full.left}px; top:${top}px; width:${full.width}px; height:24px;
  display:flex; align-items:center; justify-content:center;
">
  <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 3v14M6 12l6 6 6-6" stroke="var(--muted)" stroke-width="2" fill="none"/></svg>
</div>`;
  }

  return `
${titleBar(title)}
${numberBlock('ltv_block_number', 160, 136, ltv.value)}
${breakdownBlock('ltv_block_breakdown', 160, 136, ltv.breakdown)}
${connector('connector_a', 296)}
${numberBlock('cac_block_number', 320, 136, cac.value)}
${breakdownBlock('cac_block_breakdown', 320, 136, cac.breakdown)}
${connector('connector_b', 456)}
${numberBlock('payback_block_number', 480, 128, payback.value)}
${breakdownBlock('payback_block_breakdown', 480, 128, payback.breakdown)}
${sourceNote(source)}
`.trim();
});

// ── Pattern: fundraising-ask ─────────────────────────────────────────────────────
/**
 * content: {
 *   title:      string,
 *   amount:     string,
 *   round:      string,
 *   valuation:  string,
 *   fund_usage: Array<{ label, pct, amount }>,   // 3-5 items, pct sums to ~100
 *   key_terms:  Array<{ label, value }>,          // 3-4 items
 *   source?:    string
 * }
 *
 * Layout:
 *   action_title_bar   col 1-12  offset 56   height 80  (light-gray)
 *   ask_amount_block    col 1-5   offset 160  height 200
 *   fund_usage_chart    col 6-12  offset 160  height 304 (light-gray)
 *   round_info_block    col 1-5   offset 368  height 96
 *   key_terms_row       col 1-12  offset 488  height 80  (light-gray)
 *   source_bar          col 1-12  offset 640  height 24
 */
definePattern('fundraising-ask', (c) => {
  const title     = c.title      ?? '';
  const amount    = c.amount     ?? '';
  const round     = c.round      ?? '';
  const valuation = c.valuation  ?? '';
  const fundUsage = c.fund_usage ?? [];
  const keyTerms  = c.key_terms  ?? [];
  const source    = c.source     ?? '';

  const askR   = colRange(1, 5);
  const chartR = colRange(6, 12);
  const full   = colRange(1, 12);

  const askBlock = `<div data-region="ask_amount_block" class="ts-region" style="
  left:${askR.left}px; top:160px; width:${askR.width}px; height:200px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-head);font-size:var(--display);font-weight:700;color:var(--primary);line-height:1.1;white-space:normal;overflow-wrap:break-word;">${esc(amount)}</div>
</div>`;

  const roundInfo = `<div data-region="round_info_block" class="ts-region" style="
  left:${askR.left}px; top:368px; width:${askR.width}px; height:96px;
">
  <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);margin-bottom:6px;">${esc(round)}</div>
  <div style="font-family:var(--font-body);font-size:14px;color:var(--muted);">Post-money: ${esc(valuation)}</div>
</div>`;

  const usageRows = fundUsage.slice(0, 5).map(u => {
    const pct = Number(u.pct ?? 0);
    return `<div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
    <div style="flex:1; height:14px; background:var(--bg); border-radius:7px; overflow:hidden;">
      <div style="width:${Math.max(pct, 2)}%; height:100%; background:var(--primary); border-radius:7px;"></div>
    </div>
    <div style="width:210px; flex-shrink:0; font-family:var(--font-body); font-size:13px; color:var(--text);">${esc(u.label)} <span style="color:var(--muted);">${esc(u.pct)}% / ${esc(u.amount)}</span></div>
  </div>`;
  }).join('');

  const fundUsageChart = `<div data-region="fund_usage_chart" class="ts-region" style="
  left:${chartR.left}px; top:160px; width:${chartR.width}px; height:304px;
  background:var(--surface);
  border-radius:var(--radius);
  box-sizing:border-box; padding:20px 24px;
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.08em;margin-bottom:14px;">資金使途</div>
  ${usageRows}
</div>`;

  const termsColW = Math.round((full.width - (keyTerms.length - 1) * 16) / Math.max(keyTerms.length, 1));
  const keyTermsRow = `<div data-region="key_terms_row" class="ts-region" style="
  left:${full.left}px; top:488px; width:${full.width}px; height:80px;
  background:var(--surface);
  border-radius:var(--radius);
  display:flex; align-items:center; box-sizing:border-box; padding:0 20px; gap:16px;
">
  ${keyTerms.slice(0, 4).map(t => `<div style="flex:1;">
    <div style="font-family:var(--font-body);font-size:11px;color:var(--muted);letter-spacing:0.06em;margin-bottom:4px;">${esc(t.label)}</div>
    <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--text);">${esc(t.value)}</div>
  </div>`).join('')}
</div>`;

  return `
${titleBar(title)}
${askBlock}
${fundUsageChart}
${roundInfo}
${keyTermsRow}
${sourceNote(source)}
`.trim();
});

// ── Pattern: cap-table-summary ──────────────────────────────────────────────────
/**
 * content: {
 *   title:         string,
 *   shareholders:  Array<{ name, pct, shares, type }>,   // 5-7 rows
 *   total_raised:  string,
 *   valuation:     string,
 *   esop_pool:     string,
 *   source?:       string
 * }
 *
 * Layout:
 *   action_title_bar   col 1-12  offset 56   height 80  (light-gray)
 *   donut_chart_area    col 1-5   offset 160  height 384
 *   shareholder_table   col 6-12  offset 160  height 384
 *   key_metrics_bar     col 1-12  offset 560  height 80  (light-gray)
 *   source_bar          col 1-12  offset 640  height 24
 */
definePattern('cap-table-summary', (c) => {
  const title        = c.title        ?? '';
  const shareholders = c.shareholders  ?? [];
  const totalRaised  = c.total_raised ?? '';
  const valuation    = c.valuation    ?? '';
  const esopPool     = c.esop_pool    ?? '';
  const source       = c.source       ?? '';

  const donutR = colRange(1, 5);
  const tableR = colRange(6, 12);
  const full   = colRange(1, 12);

  const donutSize = 300;
  const slices = shareholders.slice(0, 6).map(s => ({ label: s.name, value: Number(s.pct ?? 0) }));
  const donutSvg = pieDonut({ slices, w: donutSize, h: donutSize, donut: true });

  const donutArea = `<div data-region="donut_chart_area" class="ts-region" style="
  left:${donutR.left}px; top:160px; width:${donutR.width}px; height:384px;
  display:flex; align-items:center; justify-content:center; position:relative;
">
  ${donutSvg}
  <div style="position:absolute; text-align:center; font-family:var(--font-head); font-size:13px; font-weight:700; color:var(--muted);">100%</div>
</div>`;

  const rows = shareholders.slice(0, 7).map(s => `<tr>
    <td style="font-family:var(--font-body);font-size:14px;color:var(--text);padding:8px 12px;border-bottom:1px solid var(--surface);">${esc(s.name)}</td>
    <td style="font-family:var(--font-body);font-size:14px;color:var(--text);padding:8px 12px;border-bottom:1px solid var(--surface);text-align:right;font-weight:700;">${esc(s.pct)}%</td>
    <td style="font-family:var(--font-body);font-size:13px;color:var(--muted);padding:8px 12px;border-bottom:1px solid var(--surface);text-align:right;">${esc(s.shares)}</td>
    <td style="font-family:var(--font-body);font-size:12px;color:var(--muted);padding:8px 12px;border-bottom:1px solid var(--surface);">${esc(s.type)}</td>
  </tr>`).join('');

  const table = `<div data-region="shareholder_table" class="ts-region" style="
  left:${tableR.left}px; top:160px; width:${tableR.width}px; height:384px;
">
  <table style="width:100%; border-collapse:collapse;">
    <thead><tr>
      <th style="font-family:var(--font-head);font-size:11px;color:var(--muted);letter-spacing:0.06em;text-align:left;padding:0 12px 8px;border-bottom:2px solid var(--primary);">株主名</th>
      <th style="font-family:var(--font-head);font-size:11px;color:var(--muted);letter-spacing:0.06em;text-align:right;padding:0 12px 8px;border-bottom:2px solid var(--primary);">持分%</th>
      <th style="font-family:var(--font-head);font-size:11px;color:var(--muted);letter-spacing:0.06em;text-align:right;padding:0 12px 8px;border-bottom:2px solid var(--primary);">株数</th>
      <th style="font-family:var(--font-head);font-size:11px;color:var(--muted);letter-spacing:0.06em;text-align:left;padding:0 12px 8px;border-bottom:2px solid var(--primary);">種類</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>`;

  const keyMetricsBar = `<div data-region="key_metrics_bar" class="ts-region" style="
  left:${full.left}px; top:560px; width:${full.width}px; height:80px;
  background:var(--surface);
  border-radius:var(--radius);
  display:flex; align-items:center; box-sizing:border-box; padding:0 20px;
">
  ${[['総調達額', totalRaised], ['Post-money', valuation], ['ESOP Pool', esopPool]].map(([label, value]) => `<div style="flex:1;">
    <div style="font-family:var(--font-body);font-size:11px;color:var(--muted);letter-spacing:0.06em;margin-bottom:4px;">${label}</div>
    <div style="font-family:var(--font-head);font-size:18px;font-weight:700;color:var(--text);">${esc(value)}</div>
  </div>`).join('')}
</div>`;

  return `
${titleBar(title)}
${donutArea}
${table}
${keyMetricsBar}
${sourceNote(source)}
`.trim();
});

// ── Pattern: financial-three-statement ──────────────────────────────────────────
/**
 * content: {
 *   title:   string,
 *   pl:      Array<{ label, value, highlight? }>,   // 5-7 rows, last usually 純利益
 *   bs:      Array<{ label, value, highlight? }>,
 *   cf:      Array<{ label, value, highlight? }>,
 *   source?: string
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 80  (light-gray)
 *   pl_card           col 1-4   offset 160  height 456 (light-gray)
 *   bs_card           col 5-8   offset 160  height 456 (light-gray)
 *   cf_card           col 9-12  offset 160  height 456 (light-gray)
 *   source_bar        col 1-12  offset 640  height 24
 */
definePattern('financial-three-statement', (c) => {
  const title  = c.title ?? '';
  const source = c.source ?? '';

  function card(id, region, label, rows) {
    const rowsHtml = (rows ?? []).slice(0, 7).map(row => `<div style="
      display:flex; justify-content:space-between; align-items:baseline;
      padding:8px 0; border-bottom:1px solid var(--bg);
      ${row.highlight ? 'border-top:2px solid var(--primary);margin-top:6px;padding-top:12px;' : ''}
    ">
      <span style="font-family:var(--font-body);font-size:13px;color:${row.highlight ? 'var(--text)' : 'var(--muted)'};${row.highlight ? 'font-weight:700;' : ''}">${esc(row.label)}</span>
      <span style="font-family:var(--font-head);font-size:${row.highlight ? '17px' : '14px'};font-weight:${row.highlight ? '700' : '400'};color:var(--text);">${esc(row.value)}</span>
    </div>`).join('');

    return `<div data-region="${id}" class="ts-region" style="
  left:${region.left}px; top:160px; width:${region.width}px; height:456px;
  background:var(--surface);
  border-radius:var(--radius);
  box-sizing:border-box; padding:16px 18px;
">
  <div style="font-family:var(--font-head);font-size:14px;font-weight:700;color:var(--primary);letter-spacing:0.06em;margin-bottom:12px;">${label}</div>
  ${rowsHtml}
</div>`;
  }

  return `
${titleBar(title)}
${card('pl_card', colRange(1, 4), 'P&L', c.pl)}
${card('bs_card', colRange(5, 8), 'B/S', c.bs)}
${card('cf_card', colRange(9, 12), 'C/F', c.cf)}
${sourceNote(source)}
`.trim();
});

// ── Pattern: cohort-retention-heatmap ───────────────────────────────────────────
/**
 * content: {
 *   title:   string,
 *   months:  string[],                              // X-axis labels (経過月), e.g. ["M0",...,"M6"]
 *   cohorts: Array<{ label, values: number[0-100], avg }>,   // Y-axis rows, 6-12 rows
 *   source?: string
 * }
 *
 * Layout:
 *   action_title_bar     col 1-12  offset 56   height 80  (light-gray)
 *   x_axis_labels         col 2-11  offset 160  height 24
 *   summary_col_header     col 12    offset 160  height 24  (mid-gray)
 *   heatmap_grid           col 2-11  offset 192  height 408
 *   y_axis_labels          col 1     offset 160  height 456
 *   summary_col            col 12    offset 192  height 408 (mid-gray)
 *   legend_bar             col 1-12  offset 600  height 40
 *   source_bar             col 1-12  offset 640  height 24
 */
definePattern('cohort-retention-heatmap', (c) => {
  const title   = c.title   ?? '';
  const months  = c.months  ?? [];
  const cohorts = c.cohorts ?? [];
  const source  = c.source  ?? '';

  const yLabelR  = colRange(1, 1);
  const gridR    = colRange(2, 11);
  const summaryR = colRange(12, 12);

  function cellFill(v) {
    if (v >= 80) return 'var(--bg)';
    if (v >= 60) return 'var(--surface)';
    if (v >= 40) return 'var(--muted)';
    return 'var(--primary)';
  }
  function cellTextColor(v) {
    return v < 40 || (v >= 40 && v < 60) ? '#fff' : 'var(--text)';
  }

  const rowH = Math.floor(408 / Math.max(cohorts.length, 1));
  const colW2 = Math.floor(gridR.width / Math.max(months.length, 1));

  const xAxis = `<div data-region="x_axis_labels" class="ts-region" style="
  left:${gridR.left}px; top:160px; width:${gridR.width}px; height:24px;
  display:flex;
">
  ${months.map(m => `<div style="flex:1; text-align:center; font-family:var(--font-body); font-size:11px; color:var(--muted);">${esc(m)}</div>`).join('')}
</div>`;

  const summaryHeader = `<div data-region="summary_col_header" class="ts-region" style="
  left:${summaryR.left}px; top:160px; width:${summaryR.width}px; height:24px;
  background:var(--surface);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-head); font-size:11px; font-weight:700; color:var(--muted);
">Avg</div>`;

  const yLabels = `<div data-region="y_axis_labels" class="ts-region" style="
  left:${yLabelR.left}px; top:192px; width:${yLabelR.width}px; height:408px;
  display:flex; flex-direction:column;
">
  ${cohorts.map(() => '').length ? cohorts.map(row => `<div style="flex:1; display:flex; align-items:center; font-family:var(--font-body); font-size:11px; color:var(--muted);">${esc(row.label)}</div>`).join('') : ''}
</div>`;

  const gridRows = cohorts.map(row => {
    const cells = (row.values ?? []).slice(0, months.length).map(v => `<div style="
      flex:1; display:flex; align-items:center; justify-content:center;
      background:${cellFill(v)};
      font-family:var(--font-body); font-size:12px; font-weight:600; color:${cellTextColor(v)};
      border:1px solid var(--bg);
    ">${v}%</div>`).join('');
    return `<div style="display:flex; height:${rowH}px;">${cells}</div>`;
  }).join('');

  const heatmapGrid = `<div data-region="heatmap_grid" class="ts-region" style="
  left:${gridR.left}px; top:192px; width:${gridR.width}px; height:408px;
  display:flex; flex-direction:column;
">
  ${gridRows}
</div>`;

  const summaryCol = `<div data-region="summary_col" class="ts-region" style="
  left:${summaryR.left}px; top:192px; width:${summaryR.width}px; height:408px;
  background:var(--surface);
  display:flex; flex-direction:column;
">
  ${cohorts.map(row => `<div style="flex:1; display:flex; align-items:center; justify-content:center; font-family:var(--font-head); font-size:12px; font-weight:700; color:var(--text);">${esc(row.avg)}%</div>`).join('')}
</div>`;

  const legend = `<div data-region="legend_bar" class="ts-region" style="
  left:${gridR.left}px; top:600px; width:${colRange(2,12).width}px; height:40px;
  display:flex; align-items:center; gap:12px;
">
  <span style="font-family:var(--font-body);font-size:11px;color:var(--muted);">低</span>
  ${['var(--primary)', 'var(--muted)', 'var(--surface)', 'var(--bg)'].map(color => `<div style="width:28px; height:14px; background:${color}; border:1px solid var(--muted);"></div>`).join('')}
  <span style="font-family:var(--font-body);font-size:11px;color:var(--muted);">高（継続率）</span>
</div>`;

  return `
${titleBar(title)}
${xAxis}
${summaryHeader}
${yLabels}
${heatmapGrid}
${summaryCol}
${legend}
${sourceNote(source)}
`.trim();
});
