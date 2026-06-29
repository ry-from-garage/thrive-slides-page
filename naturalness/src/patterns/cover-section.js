/**
 * cover-section.js — 表紙・セクションパターン群
 *
 * Patterns: cover-title, cover-visual-split, section-divider, key-message, quote-statement
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   col_start(n) = 72 + (n-1) * 96.6667  (n = 1..12)
 *   col_width(n) = n * 96.6667 - 24       (span of n columns)
 *
 * All vertical_offset_px and row_height_px are taken directly from layout spec.
 */

import { definePattern } from './registry.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667; // col_width + gutter
const SAFE_LEFT = 72;

/** Left x of column n (1-based) */
function colX(n) {
  return SAFE_LEFT + (n - 1) * COL_UNIT;
}

/** Width of a span of n columns (including internal gutters, excluding trailing gutter) */
function colW(n) {
  return n * COL_UNIT - 24;
}

/** Width from col start(s) to col end(e) inclusive */
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Pattern: cover-title ─────────────────────────────────────────────────────
/**
 * content: { title, subtitle, presenter, date }
 */
definePattern('cover-title', (c) => {
  const title = c.title ?? '';
  const subtitle = c.subtitle ?? '';
  const presenter = c.presenter ?? '';
  const date = c.date ?? '';

  // title_block: col 1-10, vertical_offset 224, row_height 176
  const tb = colRange(1, 10);

  // subtitle_block: col 1-8, vertical_offset 416, row_height 64
  const sb = colRange(1, 8);

  // meta_bar: col 1-12, vertical_offset 608, row_height 56
  const mb = colRange(1, 12);

  return `
<div data-region="title_block" class="ts-region" style="
  left:${tb.left}px; top:224px; width:${tb.width}px; height:176px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--display);
    color:var(--text);
    line-height:1.15;
    white-space:normal;
    overflow-wrap:break-word;
    word-break:keep-all;
  ">${title}</div>
</div>

<div data-region="subtitle_block" class="ts-region" style="
  left:${sb.left}px; top:416px; width:${sb.width}px; height:64px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--h2);
    color:var(--muted);
    line-height:1.3;
    white-space:normal;
    overflow-wrap:break-word;
  ">${subtitle}</div>
</div>

<div data-region="meta_bar" class="ts-region" style="
  left:${mb.left}px; top:608px; width:${mb.width}px; height:56px;
  background:var(--surface);
  display:flex; align-items:center;
  padding:0 24px; box-sizing:border-box;
">
  <div style="
    flex:1;
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
  ">${presenter}${presenter && date ? '　' : ''}${date}</div>
  <div style="
    width:80px; height:32px;
    background:var(--secondary);
    opacity:0.35;
    border-radius:var(--radius);
  " title="ロゴスロット"></div>
</div>
`.trim();
});

// ── Pattern: cover-visual-split ───────────────────────────────────────────────
/**
 * content: { title, subtitle, meta, visual_label }
 */
definePattern('cover-visual-split', (c) => {
  const title = c.title ?? '';
  const subtitle = c.subtitle ?? '';
  const meta = c.meta ?? '';
  const visualLabel = c.visual_label ?? 'KEY VISUAL';

  // text_pane: col 1-6, vertical_offset 56, row_height 608
  const tp = colRange(1, 6);

  // visual_pane: col 7-12, full bleed (0..720), row_height 720
  const vp = { left: Math.round(colX(7) - 12), width: Math.round(1280 - colX(7) + 12) };

  // title_area: col 1-6, vertical_offset 192, row_height 160
  const ta = colRange(1, 6);

  // subtitle_area: col 1-5, vertical_offset 384, row_height 48
  const sa = colRange(1, 5);

  // meta_area: col 1-5, vertical_offset 608, row_height 40
  const ma = colRange(1, 5);

  return `
<div data-region="visual_pane" class="ts-region" style="
  left:${vp.left}px; top:0px; width:${vp.width}px; height:720px;
  background:var(--secondary);
  opacity:0.18;
"></div>
<div data-region="visual_pane_label" class="ts-region" style="
  left:${vp.left}px; top:0px; width:${vp.width}px; height:720px;
  display:flex; align-items:center; justify-content:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h2);
    color:var(--muted);
    letter-spacing:0.12em;
    text-transform:uppercase;
    opacity:0.5;
  ">${visualLabel}</div>
</div>

<div data-region="title_area" class="ts-region" style="
  left:${ta.left}px; top:192px; width:${ta.width}px; height:160px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h1);
    color:var(--text);
    line-height:1.2;
    white-space:normal;
    overflow-wrap:break-word;
    word-break:keep-all;
  ">${title}</div>
</div>

<div data-region="subtitle_area" class="ts-region" style="
  left:${sa.left}px; top:384px; width:${sa.width}px; height:48px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body);
    color:var(--muted);
    line-height:1.4;
    white-space:normal;
    overflow-wrap:break-word;
  ">${subtitle}</div>
</div>

<div data-region="meta_area" class="ts-region" style="
  left:${ma.left}px; top:608px; width:${ma.width}px; height:40px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
  ">${meta}</div>
</div>
`.trim();
});

// ── Pattern: section-divider ──────────────────────────────────────────────────
/**
 * content: { number, title }
 */
definePattern('section-divider', (c) => {
  const number = c.number ?? '01';
  const title = c.title ?? '';

  // section_number: col 1-4, vertical_offset 224, row_height 128
  const sn = colRange(1, 4);

  // divider_line: col 1-2, vertical_offset 360, row_height 8
  const dl = colRange(1, 2);

  // section_title: col 1-10, vertical_offset 376, row_height 96
  const st = colRange(1, 10);

  return `
<div data-region="section_number" class="ts-region" style="
  left:${sn.left}px; top:224px; width:${sn.width}px; height:128px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--display);
    color:var(--accent);
    line-height:1;
    letter-spacing:-0.02em;
  ">${number}</div>
</div>

<div data-region="divider_line" class="ts-region" style="
  left:${dl.left}px; top:360px; width:${dl.width}px; height:8px;
  background:var(--muted);
  opacity:0.4;
"></div>

<div data-region="section_title" class="ts-region" style="
  left:${st.left}px; top:376px; width:${st.width}px; height:96px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h1);
    color:var(--text);
    line-height:1.2;
    white-space:normal;
    overflow-wrap:break-word;
    word-break:keep-all;
  ">${title}</div>
</div>
`.trim();
});

// ── Pattern: key-message ──────────────────────────────────────────────────────
/**
 * content: { message, supplement }
 */
definePattern('key-message', (c) => {
  const message = c.message ?? '';
  const supplement = c.supplement ?? '';

  // separator_top: col 5-8, vertical_offset 224, row_height 8
  const sepTop = colRange(5, 8);

  // key_message_area: col 2-11, vertical_offset 240, row_height 160
  const km = colRange(2, 11);

  // separator_bottom: col 5-8, vertical_offset 408, row_height 8
  const sepBot = colRange(5, 8);

  // supplement_area: col 3-10, vertical_offset 432, row_height 48
  const sup = colRange(3, 10);

  return `
<div data-region="separator_top" class="ts-region" style="
  left:${sepTop.left}px; top:224px; width:${sepTop.width}px; height:8px;
  background:var(--muted);
  opacity:0.35;
"></div>

<div data-region="key_message_area" class="ts-region" style="
  left:${km.left}px; top:240px; width:${km.width}px; height:160px;
  display:flex; align-items:center; justify-content:center;
  text-align:center;
">
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h1);
    color:var(--text);
    text-align:center;
    line-height:1.3;
    white-space:normal;
    overflow-wrap:break-word;
    word-break:keep-all;
  ">${message}</div>
</div>

<div data-region="separator_bottom" class="ts-region" style="
  left:${sepBot.left}px; top:408px; width:${sepBot.width}px; height:8px;
  background:var(--muted);
  opacity:0.35;
"></div>

${supplement ? `
<div data-region="supplement_area" class="ts-region" style="
  left:${sup.left}px; top:432px; width:${sup.width}px; height:48px;
  display:flex; align-items:center; justify-content:center;
  text-align:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
    text-align:center;
    white-space:normal;
    overflow-wrap:break-word;
  ">${supplement}</div>
</div>
` : ''}
`.trim();
});

// ── Pattern: quote-statement ──────────────────────────────────────────────────
/**
 * content: { quote, attribution }
 */
definePattern('quote-statement', (c) => {
  const quote = c.quote ?? '';
  const attribution = c.attribution ?? '';

  // quote_mark_open: col 2-3, vertical_offset 152, row_height 96
  const qmo = colRange(2, 3);

  // quote_text_area: col 2-11, vertical_offset 240, row_height 192
  const qta = colRange(2, 11);

  // attribution_divider: col 5-8, vertical_offset 448, row_height 8
  const ad = colRange(5, 8);

  // attribution_area: col 3-10, vertical_offset 472, row_height 40
  const aa = colRange(3, 10);

  // quote_mark_close: col 10-11, vertical_offset 456, row_height 96
  const qmc = colRange(10, 11);

  return `
<div data-region="quote_mark_open" class="ts-region" style="
  left:${qmo.left}px; top:152px; width:${qmo.width}px; height:96px;
  display:flex; align-items:flex-start;
">
  <div style="
    font-family:var(--font-head);
    font-size:96px;
    color:var(--accent);
    line-height:1;
    opacity:0.6;
    user-select:none;
  ">“</div>
</div>

<div data-region="quote_text_area" class="ts-region" style="
  left:${qta.left}px; top:240px; width:${qta.width}px; height:192px;
  display:flex; align-items:center; justify-content:center;
  text-align:center;
">
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h2);
    color:var(--text);
    text-align:center;
    line-height:1.5;
    white-space:normal;
    overflow-wrap:break-word;
    word-break:keep-all;
  ">${quote}</div>
</div>

<div data-region="attribution_divider" class="ts-region" style="
  left:${ad.left}px; top:448px; width:${ad.width}px; height:8px;
  background:var(--muted);
  opacity:0.35;
"></div>

<div data-region="attribution_area" class="ts-region" style="
  left:${aa.left}px; top:472px; width:${aa.width}px; height:40px;
  display:flex; align-items:center; justify-content:center;
  text-align:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
    text-align:center;
    white-space:normal;
    overflow-wrap:break-word;
  ">${attribution}</div>
</div>

<div data-region="quote_mark_close" class="ts-region" style="
  left:${qmc.left}px; top:456px; width:${qmc.width}px; height:96px;
  display:flex; align-items:flex-end; justify-content:flex-end;
">
  <div style="
    font-family:var(--font-head);
    font-size:96px;
    color:var(--accent);
    line-height:1;
    opacity:0.6;
    user-select:none;
  ">”</div>
</div>
`.trim();
});
