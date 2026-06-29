/**
 * grid-system.js — 5 grid-system layout patterns
 *
 * Patterns:
 *   bento-grid          Asymmetric bento: hero 6×2 left + 3×1+3×1 top-right + 6×1 bottom-right
 *   modular-3x3         9 equal cells, 3 cols × 3 rows (4×1 each)
 *   modular-2x3         6 equal cells, 3 cols × 2 rows (4×1 each, taller)
 *   z-pattern-hero      4 regions in Z order — title separate from hero area
 *   f-pattern-content   Top band + left main (8col) + right sidebar (4col)
 *
 * Theme: editorial-keynote (dark look; CSS vars --primary, --text, --muted, --surface)
 * Grid: safe area x 72..1208, y 56..664; 12-col, gutter 24, baseline 8.
 *
 * Grid helpers: COL_UNIT = (1136 + 24) / 12 = 96.6667
 *   colX(n) = 72 + (n-1)*96.6667          left x of column n (1-based)
 *   colW(n) = n*96.6667 - 24              pixel width of n-column span
 */

import { definePattern } from './registry.js';
import { panel } from '../components/panel.js';
import { cardGrid } from '../components/card-grid.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

function colX(n) { return SAFE_LEFT + (n - 1) * COL_UNIT; }
function colW(n) { return n * COL_UNIT - 24; }
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function titleDiv(title, top = 56, height = 80) {
  const r = colRange(1, 12);
  return `<div data-region="title_bar" class="ts-region" style="left:${r.left}px;top:${top}px;width:${r.width}px;height:${height}px;display:flex;align-items:center;">
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

// ── Pattern: bento-grid ───────────────────────────────────────────────────────
/**
 * Asymmetric bento grid: hero cell (col 1-6, h=488) + two top-right cells
 * (col 7-9 and col 10-12, h=232 each) + bottom-right cell (col 7-12, h=232).
 *
 * content: {
 *   title: string,
 *   hero: { heading, body },
 *   small_a: { label, value },
 *   small_b: { label, value },
 *   bottom: { items: [string] },
 *   source?: string
 * }
 *
 * Layout (from layout-grid-system.md §bento-grid):
 *   title_bar   col 1-12  y=56  h=80
 *   hero_cell   col 1-6   y=152 h=488   fill=surface
 *   small_top_a col 7-9   y=152 h=232   fill=surface
 *   small_top_b col 10-12 y=152 h=232   fill=surface
 *   small_bottom col 7-12 y=408 h=232   fill=none (border)
 *   source_bar  col 1-12  y=640 h=24
 *
 * Arithmetic:
 *   56+80=136 (title bottom), gap16→152
 *   152+488=640 (hero bottom) ✓
 *   152+232=384 (small top bottom), gap24→408
 *   408+232=640 (bottom bottom) ✓
 *   640+24=664 (source bottom) ✓
 */
definePattern('bento-grid', (c) => {
  const title = c.title ?? '';
  const hero = c.hero ?? {};
  const smallA = c.small_a ?? {};
  const smallB = c.small_b ?? {};
  const bottom = c.bottom ?? {};
  const source = c.source ?? '';

  // Hero cell: col 1-6
  const heroR = colRange(1, 6);
  // small top A: col 7-9
  const saR = colRange(7, 9);
  // small top B: col 10-12
  const sbR = colRange(10, 12);
  // bottom right: col 7-12
  const botR = colRange(7, 12);

  const heroBody = `<div style="padding:24px 20px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;">
    <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:16px;white-space:normal;overflow-wrap:break-word;">${hero.heading ?? ''}</div>
    <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.7;white-space:normal;overflow-wrap:break-word;flex:1;">${hero.body ?? ''}</div>
  </div>`;

  function kpiCell(item) {
    return `<div style="padding:20px 16px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;white-space:normal;overflow-wrap:break-word;">${item.label ?? ''}</div>
      <div style="font-family:var(--font-head);font-size:40px;font-weight:700;color:var(--primary);line-height:1.1;white-space:normal;overflow-wrap:break-word;">${item.value ?? ''}</div>
    </div>`;
  }

  const bottomItems = (bottom.items ?? []).map(item =>
    `<li style="font-family:var(--font-body);font-size:var(--body);color:var(--text);margin-bottom:6px;line-height:1.55;white-space:normal;overflow-wrap:break-word;">${item}</li>`
  ).join('');
  const bottomBody = `<div style="padding:20px 16px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;justify-content:center;">
    <ul style="margin:0;padding-left:16px;list-style:disc;">${bottomItems}</ul>
  </div>`;

  return `
${titleDiv(title)}

<div data-region="hero_cell" class="ts-region ts-panel ts-panel--surface" style="left:${heroR.left}px;top:152px;width:${heroR.width}px;height:488px;">
  ${heroBody}
</div>

<div data-region="small_top_a" class="ts-region ts-panel ts-panel--surface" style="left:${saR.left}px;top:152px;width:${saR.width}px;height:232px;">
  ${kpiCell(smallA)}
</div>

<div data-region="small_top_b" class="ts-region ts-panel ts-panel--surface" style="left:${sbR.left}px;top:152px;width:${sbR.width}px;height:232px;">
  ${kpiCell(smallB)}
</div>

<div data-region="small_bottom" class="ts-region" style="left:${botR.left}px;top:408px;width:${botR.width}px;height:232px;border:1px solid var(--muted);border-radius:4px;box-sizing:border-box;">
  ${bottomBody}
</div>

${sourceDiv(source)}
`.trim();
});

// ── Pattern: modular-3x3 ──────────────────────────────────────────────────────
/**
 * 9 equal cells in 3 cols × 3 rows. Each cell: col span 4, height 144px.
 *
 * content: {
 *   title: string,
 *   cells: Array<{ number, heading, body }>,  // 9 items
 *   source?: string
 * }
 *
 * Layout (from layout-grid-system.md §modular-3x3):
 *   title_bar  col 1-12  y=56  h=80
 *   Row1 (3 cells)  col 1-4 / 5-8 / 9-12  y=152  h=144
 *   Row2            col 1-4 / 5-8 / 9-12  y=320  h=144
 *   Row3            col 1-4 / 5-8 / 9-12  y=488  h=144
 *   source_bar  col 1-12  y=640  h=24
 *
 * Arithmetic:
 *   152+144=296 (R1 bottom), gap24→320
 *   320+144=464 (R2 bottom), gap24→488
 *   488+144=632 (R3 bottom), gap8→640 ✓
 */
definePattern('modular-3x3', (c) => {
  const title = c.title ?? '';
  const cells = c.cells ?? [];
  const source = c.source ?? '';

  function cellInner(item, rowTop) {
    const num = item?.number ?? '';
    const heading = item?.heading ?? '';
    const body = item?.body ?? '';
    return `<div style="padding:14px 14px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;">
      ${num ? `<div style="font-family:var(--font-head);font-size:11px;font-weight:700;color:var(--primary);letter-spacing:0.08em;margin-bottom:4px;">${num}</div>` : ''}
      <div style="font-family:var(--font-head);font-size:var(--h3);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:6px;white-space:normal;overflow-wrap:break-word;">${heading}</div>
      <div style="font-family:var(--font-body);font-size:14px;color:var(--muted);line-height:1.55;white-space:normal;overflow-wrap:break-word;">${body}</div>
    </div>`;
  }

  // Build 3 rows × 3 cols using cardGrid at each row offset
  const rows = [
    { top: 152, items: [cells[0], cells[1], cells[2]] },
    { top: 320, items: [cells[3], cells[4], cells[5]] },
    { top: 488, items: [cells[6], cells[7], cells[8]] },
  ];

  const rowsHtml = rows.map(row =>
    cardGrid(3, row.items.map(item => cellInner(item)), { top: row.top, height: 144 })
  ).join('\n');

  return `
${titleDiv(title)}

${rowsHtml}

${sourceDiv(source)}
`.trim();
});

// ── Pattern: modular-2x3 ──────────────────────────────────────────────────────
/**
 * 6 equal cells in 3 cols × 2 rows. Each cell: col span 4, height 232px.
 *
 * content: {
 *   title: string,
 *   cells: Array<{ number, heading, body }>,  // 6 items
 *   source?: string
 * }
 *
 * Layout (from layout-grid-system.md §modular-2x3):
 *   title_bar  col 1-12  y=56  h=80
 *   Row1 (3 cells)  col 1-4 / 5-8 / 9-12  y=152  h=232
 *   Row2 (3 cells)  col 1-4 / 5-8 / 9-12  y=408  h=232
 *   source_bar  col 1-12  y=640  h=24
 *
 * Arithmetic:
 *   152+232=384 (R1 bottom), gap24→408
 *   408+232=640 (R2 bottom) ✓
 *   640+24=664 (source bottom) ✓
 */
definePattern('modular-2x3', (c) => {
  const title = c.title ?? '';
  const cells = c.cells ?? [];
  const source = c.source ?? '';

  function cellInner(item) {
    const num = item?.number ?? '';
    const heading = item?.heading ?? '';
    const body = item?.body ?? '';
    return `<div style="padding:20px 16px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;">
      ${num ? `<div style="font-family:var(--font-head);font-size:11px;font-weight:700;color:var(--primary);letter-spacing:0.08em;margin-bottom:8px;">${num}</div>` : ''}
      <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:10px;white-space:normal;overflow-wrap:break-word;">${heading}</div>
      <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.65;white-space:normal;overflow-wrap:break-word;">${body}</div>
    </div>`;
  }

  const row1Items = [cells[0], cells[1], cells[2]].map(item => cellInner(item));
  const row2Items = [cells[3], cells[4], cells[5]].map(item => cellInner(item));

  return `
${titleDiv(title)}

${cardGrid(3, row1Items, { top: 152, height: 232 })}
${cardGrid(3, row2Items, { top: 408, height: 232 })}

${sourceDiv(source)}
`.trim();
});

// ── Pattern: z-pattern-hero ───────────────────────────────────────────────────
/**
 * Z-pattern eye-flow layout. Title bar occupies full-width top band.
 * Hero element (top-left anchor) and stat (top-right) are BELOW the title bar.
 * The hero number/word is placed in top_left_anchor region — NOT overlapping the title.
 *
 * content: {
 *   title: string,            // action title — Z起点 (left-top)
 *   hero_visual: string,      // large number/word in top-left anchor (BELOW title)
 *   hero_caption?: string,
 *   top_right: { label, value },   // KPI or sub-title in top-right
 *   bottom_left: { items: [string] },  // support bullets in bottom-left
 *   bottom_right: { cta: string },    // CTA in bottom-right (fill=surface)
 *   source?: string
 * }
 *
 * Layout (from layout-grid-system.md §z-pattern-hero):
 *   title_bar          col 1-12  y=56  h=80    ← Z起点 title ONLY
 *   top_left_anchor    col 1-7   y=152 h=320   fill=none  ← hero visual
 *   top_right_stat     col 8-12  y=152 h=320   fill=surface
 *   bottom_left_support col 1-6  y=496 h=144   fill=none
 *   bottom_right_cta   col 7-12  y=496 h=144   fill=surface (mid-gray)
 *   source_bar         col 1-12  y=640 h=24
 *
 * Arithmetic:
 *   56+80=136 (title bottom), gap16→152
 *   152+320=472 (upper bottom), gap24→496
 *   496+144=640 (lower bottom) ✓
 *   640+24=664 (source bottom) ✓
 *
 * CRITICAL: hero_visual lives in top_left_anchor (y=152..472), NOT overlapping
 *   the title_bar (y=56..136). Clear 16px gap between title bottom and anchor top.
 */
definePattern('z-pattern-hero', (c) => {
  const title = c.title ?? '';
  const heroVisual = c.hero_visual ?? '';
  const heroCaption = c.hero_caption ?? '';
  const topRight = c.top_right ?? {};
  const bottomLeft = c.bottom_left ?? {};
  const bottomRight = c.bottom_right ?? {};
  const source = c.source ?? '';

  // col ranges
  const tlaR = colRange(1, 7);   // top_left_anchor
  const trsR = colRange(8, 12);  // top_right_stat
  const blsR = colRange(1, 6);   // bottom_left_support
  const brcR = colRange(7, 12);  // bottom_right_cta

  const bulletItems = (bottomLeft.items ?? []).map(item =>
    `<li style="font-family:var(--font-body);font-size:var(--body);color:var(--text);margin-bottom:6px;line-height:1.55;white-space:normal;overflow-wrap:break-word;">${item}</li>`
  ).join('');

  return `
${titleDiv(title, 56, 80)}

<!-- top_left_anchor: hero visual lives BELOW title (y=152), no overlap -->
<div data-region="top_left_anchor" class="ts-region" style="left:${tlaR.left}px;top:152px;width:${tlaR.width}px;height:320px;display:flex;flex-direction:column;justify-content:center;padding:24px 20px;box-sizing:border-box;">
  <div style="font-family:var(--font-head);font-size:96px;font-weight:700;color:var(--primary);line-height:1;white-space:normal;overflow-wrap:break-word;">${heroVisual}</div>
  ${heroCaption ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);margin-top:12px;white-space:normal;overflow-wrap:break-word;">${heroCaption}</div>` : ''}
</div>

<div data-region="top_right_stat" class="ts-region ts-panel ts-panel--surface" style="left:${trsR.left}px;top:152px;width:${trsR.width}px;height:320px;">
  <div style="padding:24px 20px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;justify-content:center;">
    <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;white-space:normal;overflow-wrap:break-word;">${topRight.label ?? ''}</div>
    <div style="font-family:var(--font-head);font-size:32px;font-weight:700;color:var(--text);line-height:1.2;white-space:normal;overflow-wrap:break-word;">${topRight.value ?? ''}</div>
  </div>
</div>

<div data-region="bottom_left_support" class="ts-region" style="left:${blsR.left}px;top:496px;width:${blsR.width}px;height:144px;display:flex;flex-direction:column;justify-content:center;padding:16px 20px;box-sizing:border-box;">
  <ul style="margin:0;padding-left:16px;list-style:disc;">${bulletItems}</ul>
</div>

<div data-region="bottom_right_cta" class="ts-region ts-panel ts-panel--surface" style="left:${brcR.left}px;top:496px;width:${brcR.width}px;height:144px;">
  <div style="padding:20px 24px;box-sizing:border-box;height:100%;display:flex;align-items:center;justify-content:center;">
    <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);text-align:center;white-space:normal;overflow-wrap:break-word;">${bottomRight.cta ?? ''}</div>
  </div>
</div>

${sourceDiv(source)}
`.trim();
});

// ── Pattern: f-pattern-content ────────────────────────────────────────────────
/**
 * F-pattern information-dense layout.
 * Top band (full-width) → left main body (8col) + right sidebar (4col).
 *
 * content: {
 *   title: string,
 *   top_band: { summary: string },  // F字第1水平走査
 *   body: { items: Array<{ number, heading, detail }> },  // 3-5 bullets
 *   sidebar: { items: Array<{ label, value }> },
 *   source?: string
 * }
 *
 * Layout (from layout-grid-system.md §f-pattern-content):
 *   title_bar    col 1-12  y=56  h=80
 *   top_band     col 1-12  y=152 h=96   fill=surface
 *   left_body    col 1-8   y=272 h=344  fill=none
 *   right_sidebar col 9-12 y=272 h=344  fill=surface
 *   source_bar   col 1-12  y=640 h=24
 *
 * Arithmetic:
 *   56+80=136, gap16→152
 *   152+96=248, gap24→272
 *   272+344=616, gap24→640 ✓
 *   640+24=664 ✓
 */
definePattern('f-pattern-content', (c) => {
  const title = c.title ?? '';
  const topBand = c.top_band ?? {};
  const body = c.body ?? {};
  const sidebar = c.sidebar ?? {};
  const source = c.source ?? '';

  const tbandR = colRange(1, 12);
  const lbodyR = colRange(1, 8);
  const rsideR = colRange(9, 12);

  // Build left body bullet list
  const bodyItems = (body.items ?? []).map(item => {
    const num = item?.number ?? '•';
    const heading = item?.heading ?? '';
    const detail = item?.detail ?? '';
    return `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start;">
      <div style="font-family:var(--font-head);font-size:14px;font-weight:700;color:var(--primary);min-width:28px;flex-shrink:0;line-height:1.4;">${num}</div>
      <div>
        <div style="font-family:var(--font-head);font-size:var(--h3);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:2px;white-space:normal;overflow-wrap:break-word;">${heading}</div>
        ${detail ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.55;white-space:normal;overflow-wrap:break-word;">${detail}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // Build right sidebar items
  const sideItems = (sidebar.items ?? []).map(item =>
    `<div style="margin-bottom:16px;">
      <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);margin-bottom:2px;white-space:normal;overflow-wrap:break-word;">${item.label ?? ''}</div>
      <div style="font-family:var(--font-head);font-size:var(--h3);font-weight:700;color:var(--primary);white-space:normal;overflow-wrap:break-word;">${item.value ?? ''}</div>
    </div>`
  ).join('');

  return `
${titleDiv(title, 56, 80)}

<div data-region="top_band" class="ts-region ts-panel ts-panel--surface" style="left:${tbandR.left}px;top:152px;width:${tbandR.width}px;height:96px;display:flex;align-items:center;padding:0 20px;box-sizing:border-box;">
  <div style="font-family:var(--font-body);font-size:var(--body);color:var(--text);line-height:1.6;white-space:normal;overflow-wrap:break-word;">${topBand.summary ?? ''}</div>
</div>

<div data-region="left_body" class="ts-region" style="left:${lbodyR.left}px;top:272px;width:${lbodyR.width}px;height:344px;padding:20px 20px 20px 20px;box-sizing:border-box;overflow:hidden;">
  ${bodyItems}
</div>

<div data-region="right_sidebar" class="ts-region ts-panel ts-panel--surface" style="left:${rsideR.left}px;top:272px;width:${rsideR.width}px;height:344px;padding:20px 16px;box-sizing:border-box;">
  ${sideItems}
</div>

${sourceDiv(source)}
`.trim();
});
