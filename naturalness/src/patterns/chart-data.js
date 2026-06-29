/**
 * chart-data.js — グラフ・データパターン群
 *
 * Patterns (layout-chart-data.md):
 *   bar-chart-full            全幅棒グラフ + KPI バッジ
 *   chart-left-text-right     左グラフ + 右系列解説テキスト
 *   pie-donut-left-list-right 左ドーナツ + 右内訳リスト
 *   three-donut-row           3ドーナツ横並び
 *   kpi-with-chart            左 KPI バンド + 右棒グラフ
 *   list-and-chart            左リスト + 右チャート
 *   multi-chart-grid          3パネルグラフグリッド
 *
 * Theme: strategy-consulting
 *
 * Grid constants (safe-area x 72..1208, y 56..664, width 1136):
 *   COL_UNIT = 96.6667px  (col width + 24px gutter)
 */

import { definePattern } from './registry.js';
import { bar } from '../charts/bar.js';
import { line } from '../charts/line.js';
import { pieDonut } from '../charts/pie-donut.js';
import { kpiStat } from '../components/kpi-stat.js';
import { listRow } from '../components/list-row.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;
const SAFE_TOP = 56;

function colX(n) {
  return SAFE_LEFT + (n - 1) * COL_UNIT;
}
function colW(n) {
  return n * COL_UNIT - 24;
}
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Shared helpers ────────────────────────────────────────────────────────────

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

// ── Pattern: bar-chart-full ───────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   kpi_value: string,      // e.g. "¥12.4B"
 *   kpi_growth: string,     // e.g. "+23% YoY"
 *   kpi_period: string,     // e.g. "FY2025"
 *   annotation: string,     // legend / unit label
 *   series: Array<{name, values[]}>,
 *   labels: string[],       // x-axis labels
 *   source: string,
 * }
 *
 * Layout (layout-chart-data.md § bar-chart-full):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   annotation_row    col 1-8   offset 160  height 32
 *   kpi_badge_area    col 9-12  offset 160  height 64
 *   chart_area        col 1-12  offset 232  height 384
 *   x_axis_labels     col 1-12  offset 616  height 24
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('bar-chart-full', (c) => {
  const title = c.title ?? '';
  const kpiValue = c.kpi_value ?? '';
  const kpiGrowth = c.kpi_growth ?? '';
  const kpiPeriod = c.kpi_period ?? '';
  const annotation = c.annotation ?? '';
  const series = c.series ?? [];
  const labels = c.labels ?? [];
  const source = c.source ?? '';

  const annR = colRange(1, 8);
  const kpiR = colRange(9, 12);
  const chartR = colRange(1, 12);

  // chart_area: offset 232, height 384 — bar chart fills it
  const chartSvg = bar({
    series,
    w: chartR.width,
    h: 384,
    labels,
    valueLabels: true,
  });

  return `
${titleDiv(title)}

<div data-region="annotation_row" class="ts-region" style="
  left:${annR.left}px; top:160px; width:${annR.width}px; height:32px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${annotation}</div>
</div>

<div data-region="kpi_badge_area" class="ts-region" style="
  left:${kpiR.left}px; top:160px; width:${kpiR.width}px; height:64px;
  background:var(--surface);
  border-radius:4px;
  display:flex; flex-direction:column; align-items:flex-start; justify-content:center;
  padding:8px 12px; box-sizing:border-box;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);line-height:1.3;">${kpiPeriod}</div>
  <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--primary);line-height:1.2;">${kpiValue}</div>
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--positive);font-weight:600;">${kpiGrowth}</div>
</div>

<div data-region="chart_area" class="ts-region" style="
  left:${chartR.left}px; top:232px; width:${chartR.width}px; height:384px;
  overflow:hidden;
">
  ${chartSvg}
</div>

${sourceDiv(source)}
`.trim();
});

// ── Pattern: chart-left-text-right ────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   series: Array<{name, values[]}>,
 *   labels: string[],
 *   series_descriptions: Array<{marker, heading, body}>,
 *   callout?: { value, body },
 *   source: string,
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   chart_area        col 1-7   offset 160  height 496
 *   text_panel        col 8-12  offset 160  height 472
 *   source_note       col 8-12  offset 640  height 24
 */
definePattern('chart-left-text-right', (c) => {
  const title = c.title ?? '';
  const series = c.series ?? [];
  const labels = c.labels ?? [];
  const descriptions = c.series_descriptions ?? [];
  const callout = c.callout ?? null;
  const source = c.source ?? '';

  const chartR = colRange(1, 7);
  const textR = colRange(8, 12);
  const srcR = colRange(8, 12);

  // chart_area: 7 cols wide, 496px tall
  const chartSvg = bar({
    series,
    w: chartR.width,
    h: 496,
    labels,
    valueLabels: true,
  });

  const descHtml = descriptions.map(d => `
    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;">
      <div style="
        width:12px; height:12px; border-radius:50%; margin-top:3px; flex-shrink:0;
        background:var(${d.marker ?? '--primary'});
      "></div>
      <div>
        <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:4px;white-space:normal;overflow-wrap:break-word;">${d.heading ?? ''}</div>
        <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.6;white-space:normal;overflow-wrap:break-word;">${d.body ?? ''}</div>
      </div>
    </div>`).join('');

  const calloutHtml = callout ? `
    <div style="
      border:2px solid var(--primary); border-radius:4px;
      padding:12px 14px; margin-top:16px;
    ">
      <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--primary);margin-bottom:4px;">${callout.value ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.5;white-space:normal;overflow-wrap:break-word;">${callout.body ?? ''}</div>
    </div>` : '';

  return `
${titleDiv(title)}

<div data-region="chart_area" class="ts-region" style="
  left:${chartR.left}px; top:160px; width:${chartR.width}px; height:496px;
  overflow:hidden;
">
  ${chartSvg}
</div>

<div data-region="text_panel" class="ts-region" style="
  left:${textR.left}px; top:160px; width:${textR.width}px; height:472px;
  overflow:hidden;
">
  ${descHtml}
  ${calloutHtml}
</div>

<div data-region="source_note" class="ts-region" style="
  left:${srcR.left}px; top:640px; width:${srcR.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>
`.trim();
});

// ── Pattern: pie-donut-left-list-right ────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   slices: Array<{label, value}>,    // for pieDonut
 *   donut_center?: string,            // center text (donut mode)
 *   chart_caption?: string,
 *   items: Array<{marker, heading, value_badge, sub}>,
 *   source: string,
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   chart_zone        col 1-5   offset 160  height 440
 *   chart_caption     col 1-5   offset 608  height 32
 *   list_panel        col 6-12  offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('pie-donut-left-list-right', (c) => {
  const title = c.title ?? '';
  const slices = c.slices ?? [];
  const donutCenter = c.donut_center ?? '';
  const chartCaption = c.chart_caption ?? '';
  const items = c.items ?? [];
  const source = c.source ?? '';

  const chartR = colRange(1, 5);
  const captionR = colRange(1, 5);
  const listR = colRange(6, 12);

  const donutSvg = pieDonut({
    slices,
    w: chartR.width,
    h: 440,
    donut: true,
  });

  // overlay center text if needed
  // holeW ≈ innerR * 2 = outerR * 0.5 * 2 = outerR. outerR = min(w,h)/2 - 8
  // For w=chartR.width, h=440: outerR ≈ min(chartR.width,440)/2 - 8; holeW ≈ outerR
  const _outerR = Math.min(chartR.width, 440) / 2 - 8;
  const holeW = Math.round(_outerR);
  const centerOverlay = donutCenter ? `
    <div style="
      position:absolute;
      left:0; top:0; width:${chartR.width}px; height:440px;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none;
    ">
      <div style="
        font-family:var(--font-head);font-size:20px;font-weight:700;color:var(--text);
        text-align:center;line-height:1.25;
        width:${holeW}px; max-width:${holeW}px;
        overflow:hidden; word-break:break-word; overflow-wrap:break-word;
        display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical;
      ">${donutCenter}</div>
    </div>` : '';

  const MARKER_VARS = ['--primary', '--secondary', '--accent', '--positive', '--negative'];

  const listHtml = items.map((item, i) => `
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--surface);">
      <div style="
        width:12px; height:12px; border-radius:2px; margin-top:4px; flex-shrink:0;
        background:var(${item.marker ?? MARKER_VARS[i % MARKER_VARS.length]});
      "></div>
      <div style="flex:1;">
        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px;">
          <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
          <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--primary);white-space:nowrap;">${item.value_badge ?? ''}</div>
        </div>
        ${item.sub ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.5;white-space:normal;overflow-wrap:break-word;">${item.sub}</div>` : ''}
      </div>
    </div>`).join('');

  return `
${titleDiv(title)}

<div data-region="chart_zone" class="ts-region" style="
  left:${chartR.left}px; top:160px; width:${chartR.width}px; height:440px;
  position:relative; overflow:hidden;
">
  ${donutSvg}
  ${centerOverlay}
</div>

${chartCaption ? `<div data-region="chart_caption" class="ts-region" style="
  left:${captionR.left}px; top:608px; width:${captionR.width}px; height:32px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${chartCaption}</div>
</div>` : ''}

<div data-region="list_panel" class="ts-region" style="
  left:${listR.left}px; top:160px; width:${listR.width}px; height:480px;
  overflow:hidden;
">
  ${listHtml}
</div>

${sourceDiv(source)}
`.trim();
});

// ── Pattern: three-donut-row ──────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   headline: string,
 *   headline_sub?: string,
 *   donuts: Array<{
 *     slices: Array<{label, value}>,
 *     center: string,
 *     heading: string,
 *     body?: string,
 *   }>,
 *   source: string,
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   headline_area     col 1-12  offset 160  height 96
 *   donut_a           col 1-4   offset 280  height 296
 *   donut_b           col 5-8   offset 280  height 296
 *   donut_c           col 9-12  offset 280  height 296
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('three-donut-row', (c) => {
  const title = c.title ?? '';
  const headline = c.headline ?? '';
  const headlineSub = c.headline_sub ?? '';
  const donuts = c.donuts ?? [];
  const source = c.source ?? '';

  const headlineR = colRange(1, 12);
  const donutARng = colRange(1, 4);
  const donutBRng = colRange(5, 8);
  const donutCRng = colRange(9, 12);
  const donutRngs = [donutARng, donutBRng, donutCRng];
  const donutIds = ['donut_a', 'donut_b', 'donut_c'];

  const donutsHtml = donuts.slice(0, 3).map((d, i) => {
    const rng = donutRngs[i];
    const id = donutIds[i];
    // donut chart: 4 cols wide, fit within 296px cell
    // leave ~60px for heading+body below chart
    const chartH = 180;
    const chartW = rng.width;
    const svgHtml = pieDonut({
      slices: d.slices ?? [],
      w: chartW,
      h: chartH,
      donut: true,
    });

    const centerOverlay = d.center ? `
      <div style="
        position:absolute; left:0; top:0; width:${chartW}px; height:${chartH}px;
        display:flex; align-items:center; justify-content:center;
        pointer-events:none;
      ">
        <div style="font-family:var(--font-head);font-size:22px;font-weight:700;color:var(--text);text-align:center;line-height:1.2;">${d.center}</div>
      </div>` : '';

    return `<div data-region="${id}" class="ts-region" style="
      left:${rng.left}px; top:280px; width:${rng.width}px; height:296px;
      display:flex; flex-direction:column; align-items:center;
      overflow:hidden;
    ">
      <div style="position:relative; width:${chartW}px; height:${chartH}px; flex-shrink:0;">
        ${svgHtml}
        ${centerOverlay}
      </div>
      <div style="text-align:center; padding:8px 8px 0; width:100%; box-sizing:border-box;">
        <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:4px;white-space:normal;overflow-wrap:break-word;">${d.heading ?? ''}</div>
        ${d.body ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.5;white-space:normal;overflow-wrap:break-word;">${d.body}</div>` : ''}
      </div>
    </div>`;
  }).join('\n');

  return `
${titleDiv(title)}

<div data-region="headline_area" class="ts-region" style="
  left:${headlineR.left}px; top:160px; width:${headlineR.width}px; height:96px;
  overflow:hidden;
">
  <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.4;margin-bottom:8px;white-space:normal;overflow-wrap:break-word;">${headline}</div>
  ${headlineSub ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.5;white-space:normal;overflow-wrap:break-word;">${headlineSub}</div>` : ''}
</div>

${donutsHtml}

${sourceDiv(source)}
`.trim();
});

// ── Pattern: kpi-with-chart ───────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   kpi_label: string,
 *   kpi_value: string,
 *   kpi_sub: string,
 *   kpi_period?: string,
 *   series: Array<{name, values[]}>,
 *   labels: string[],
 *   chart_sub?: string,   // legend / extra label row
 *   source: string,
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   kpi_band          col 1-4   offset 160  height 480
 *   chart_main        col 5-12  offset 160  height 456
 *   chart_sub         col 5-12  offset 624  height 16
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('kpi-with-chart', (c) => {
  const title = c.title ?? '';
  const kpiLabel = c.kpi_label ?? '';
  const kpiValue = c.kpi_value ?? '';
  const kpiSub = c.kpi_sub ?? '';
  const kpiPeriod = c.kpi_period ?? '';
  const series = c.series ?? [];
  const labels = c.labels ?? [];
  const chartSubText = c.chart_sub ?? '';
  const source = c.source ?? '';

  const kpiR = colRange(1, 4);
  const chartR = colRange(5, 12);
  const chartSubR = colRange(5, 12);

  const chartSvg = bar({
    series,
    w: chartR.width,
    h: 456,
    labels,
    valueLabels: true,
  });

  const kpiHtml = kpiStat({
    label: kpiLabel,
    value: kpiValue,
    sub: kpiSub,
  });

  return `
${titleDiv(title)}

<div data-region="kpi_band" class="ts-region" style="
  left:${kpiR.left}px; top:160px; width:${kpiR.width}px; height:480px;
  background:var(--surface);
  display:flex; flex-direction:column; justify-content:center; align-items:flex-start;
  padding:24px 20px; box-sizing:border-box;
  overflow:hidden;
">
  ${kpiPeriod ? `<div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);margin-bottom:8px;">${kpiPeriod}</div>` : ''}
  ${kpiHtml}
</div>

<div data-region="chart_main" class="ts-region" style="
  left:${chartR.left}px; top:160px; width:${chartR.width}px; height:456px;
  overflow:hidden;
">
  ${chartSvg}
</div>

${chartSubText ? `<div data-region="chart_sub" class="ts-region" style="
  left:${chartSubR.left}px; top:624px; width:${chartSubR.width}px; height:16px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${chartSubText}</div>
</div>` : ''}

${sourceDiv(source)}
`.trim();
});

// ── Pattern: list-and-chart ───────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead: string,
 *   items: Array<{icon, heading, body}>,
 *   chart_slices?: Array<{label, value}>,  // for pieDonut in right zone
 *   chart_type?: 'pie-donut' | 'bar',      // default 'pie-donut'
 *   chart_series?: Array<{name, values[]}>,
 *   chart_labels?: string[],
 *   chart_key?: string,                    // key metric text
 *   source: string,
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   lead_text         col 1-12  offset 160  height 48
 *   list_area         col 1-6   offset 224  height 384
 *   chart_zone        col 7-12  offset 224  height 384
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('list-and-chart', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const items = c.items ?? [];
  const chartType = c.chart_type ?? 'pie-donut';
  const chartSlices = c.chart_slices ?? [];
  const chartSeries = c.chart_series ?? [];
  const chartLabels = c.chart_labels ?? [];
  const chartKey = c.chart_key ?? '';
  const source = c.source ?? '';

  const leadR = colRange(1, 12);
  const listR = colRange(1, 6);
  const chartR = colRange(7, 12);

  let chartSvg = '';
  if (chartType === 'bar') {
    chartSvg = bar({
      series: chartSeries,
      w: chartR.width,
      h: 384,
      labels: chartLabels,
      valueLabels: true,
    });
  } else {
    // pie-donut (default)
    chartSvg = pieDonut({
      slices: chartSlices,
      w: chartR.width,
      h: 340,
      donut: true,
    });
  }

  const listHtml = items.map(item => `
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;">
      <div style="font-size:20px;flex-shrink:0;line-height:1.4;">${item.icon ?? '◆'}</div>
      <div>
        <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:4px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
        <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.5;white-space:normal;overflow-wrap:break-word;">${item.body ?? ''}</div>
      </div>
    </div>`).join('');

  return `
${titleDiv(title)}

<div data-region="lead_text" class="ts-region" style="
  left:${leadR.left}px; top:160px; width:${leadR.width}px; height:48px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);white-space:normal;overflow-wrap:break-word;">${lead}</div>
</div>

<div data-region="list_area" class="ts-region" style="
  left:${listR.left}px; top:224px; width:${listR.width}px; height:384px;
  overflow:hidden;
">
  ${listHtml}
</div>

<div data-region="chart_zone" class="ts-region" style="
  left:${chartR.left}px; top:224px; width:${chartR.width}px; height:384px;
  overflow:hidden; display:flex; flex-direction:column; align-items:center;
">
  ${chartKey ? `<div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--primary);margin-bottom:8px;text-align:center;">${chartKey}</div>` : ''}
  ${chartSvg}
</div>

${sourceDiv(source)}
`.trim();
});

// ── Pattern: multi-chart-grid ─────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   headline: string,
 *   headline_sub?: string,
 *   panels: Array<{
 *     heading: string,
 *     chart_type: 'bar' | 'line' | 'pie-donut',
 *     series?: Array<{name, values[]}>,
 *     labels?: string[],
 *     slices?: Array<{label, value}>,
 *     sub?: string,   // legend / footnote inside panel
 *   }>,
 *   source: string,
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   headline_band     col 1-12  offset 160  height 88
 *   panel_a           col 1-4   offset 272  height 280
 *   panel_b           col 5-8   offset 272  height 280
 *   panel_c           col 9-12  offset 272  height 280
 *   source_note       col 1-12  offset 616  height 24
 */
definePattern('multi-chart-grid', (c) => {
  const title = c.title ?? '';
  const headline = c.headline ?? '';
  const headlineSub = c.headline_sub ?? '';
  const panels = c.panels ?? [];
  const source = c.source ?? '';

  const headlineR = colRange(1, 12);
  const panelARng = colRange(1, 4);
  const panelBRng = colRange(5, 8);
  const panelCRng = colRange(9, 12);
  const panelRngs = [panelARng, panelBRng, panelCRng];
  const panelIds = ['panel_a', 'panel_b', 'panel_c'];
  const srcR = colRange(1, 12);

  const panelsHtml = panels.slice(0, 3).map((p, i) => {
    const rng = panelRngs[i];
    const id = panelIds[i];
    const chartH = 200;
    const chartW = rng.width;

    let chartSvg = '';
    if (p.chart_type === 'line') {
      chartSvg = line({
        series: p.series ?? [],
        w: chartW,
        h: chartH,
        labels: p.labels ?? [],
      });
    } else if (p.chart_type === 'pie-donut') {
      chartSvg = pieDonut({
        slices: p.slices ?? [],
        w: chartW,
        h: chartH,
        donut: true,
      });
    } else {
      // default: bar
      chartSvg = bar({
        series: p.series ?? [],
        w: chartW,
        h: chartH,
        labels: p.labels ?? [],
        valueLabels: false,
      });
    }

    return `<div data-region="${id}" class="ts-region" style="
      left:${rng.left}px; top:272px; width:${rng.width}px; height:280px;
      background:var(--surface);
      border-radius:4px;
      display:flex; flex-direction:column;
      padding:10px 8px 8px; box-sizing:border-box;
      overflow:hidden;
    ">
      <div style="font-family:var(--font-head);font-size:var(--body);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:6px;white-space:normal;overflow-wrap:break-word;">${p.heading ?? ''}</div>
      <div style="flex:1;overflow:hidden;">
        ${chartSvg}
      </div>
      ${p.sub ? `<div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);margin-top:4px;white-space:normal;overflow-wrap:break-word;">${p.sub}</div>` : ''}
    </div>`;
  }).join('\n');

  return `
${titleDiv(title)}

<div data-region="headline_band" class="ts-region" style="
  left:${headlineR.left}px; top:160px; width:${headlineR.width}px; height:88px;
  overflow:hidden;
">
  <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.4;margin-bottom:6px;white-space:normal;overflow-wrap:break-word;">${headline}</div>
  <div style="height:1px;background:var(--muted);opacity:0.3;margin-bottom:6px;"></div>
  ${headlineSub ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.5;white-space:normal;overflow-wrap:break-word;">${headlineSub}</div>` : ''}
</div>

${panelsHtml}

<div data-region="source_note" class="ts-region" style="
  left:${srcR.left}px; top:616px; width:${srcR.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>
`.trim();
});
