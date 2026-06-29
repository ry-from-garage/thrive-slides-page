/**
 * text-list.js — テキストリストパターン群
 *
 * Patterns: numbered-list-body, icon-left-text, numbered-two-col,
 *           three-tier-segment, two-section-stacked, image-left-text-right
 *
 * Theme: modern-tech
 *   near-white background, soft violet accent, rounded cards
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   COL_UNIT = 96.6667  (column width + gutter)
 *   colX(n)  = 72 + (n-1) * 96.6667
 *   colW(n)  = n * 96.6667 - 24
 *
 * All vertical_offset_px and row_height_px are taken directly from layout spec.
 */

import { definePattern } from './registry.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

/** Left x of column n (1-based) */
function colX(n) {
  return SAFE_LEFT + (n - 1) * COL_UNIT;
}

/** Width of a span of n columns (including internal gutters, excluding trailing gutter) */
function colW(n) {
  return n * COL_UNIT - 24;
}

/** { left, width } for columns s..e (1-based, inclusive) */
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Pattern: numbered-list-body ───────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   items: Array<{ number, heading, body }>,   // 3 items
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar  col 1-12  offset 56   height 80
 *   list_area  col 1-12  offset 152  height 488
 *   source_bar col 1-12  offset 640  height 24
 */
definePattern('numbered-list-body', (c) => {
  const title = c.title ?? '';
  const items = c.items ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const la = colRange(1, 12);
  const sb = colRange(1, 12);

  // 3 rows inside list_area (488px); each row height = 488/3 ≈ 162px; divider 1px
  const ROW_H = Math.floor(488 / 3); // 162px

  const rowsHtml = items.slice(0, 3).map((item, idx) => {
    const rowTop = 152 + idx * ROW_H;
    const isLast = idx === items.length - 1 || idx === 2;
    return `
<div data-region="list_row_${idx + 1}" class="ts-region" style="
  left:${la.left}px; top:${rowTop}px; width:${la.width}px; height:${ROW_H}px;
  display:flex; align-items:center; gap:24px;
  box-sizing:border-box; padding:0 16px;
  border-bottom:${isLast ? 'none' : '1px solid var(--muted)'};
  opacity: ${isLast ? 1 : 1};
">
  <div style="
    flex-shrink:0;
    width:56px; height:56px;
    border-radius:50%;
    background:var(--accent);
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:#fff;
    font-weight:700;
    letter-spacing:0.02em;
  ">${item.number ?? String(idx + 1).padStart(2, '0')}</div>
  <div style="flex:1; min-width:0;">
    <div style="
      font-family:var(--font-head);
      font-size:var(--h3, 18px);
      color:var(--text);
      font-weight:600;
      line-height:1.3;
      margin-bottom:6px;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${item.heading ?? ''}</div>
    <div style="
      font-family:var(--font-body);
      font-size:var(--body, 14px);
      color:var(--muted);
      line-height:1.6;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${item.body ?? ''}</div>
  </div>
</div>`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
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
</div>

${rowsHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: icon-left-text ───────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   items: Array<{ icon, heading, body }>,   // 3-4 items
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar  col 1-12  offset 56   height 80
 *   list_area  col 1-12  offset 152  height 488
 *   source_bar col 1-12  offset 640  height 24
 */
definePattern('icon-left-text', (c) => {
  const title = c.title ?? '';
  const items = c.items ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const la = colRange(1, 12);
  const sb = colRange(1, 12);

  const count = Math.min(items.length, 4);
  const ROW_H = Math.floor(488 / count);

  const rowsHtml = items.slice(0, count).map((item, idx) => {
    const rowTop = 152 + idx * ROW_H;
    const isLast = idx === count - 1;
    return `
<div data-region="icon_row_${idx + 1}" class="ts-region" style="
  left:${la.left}px; top:${rowTop}px; width:${la.width}px; height:${ROW_H}px;
  display:flex; align-items:center; gap:24px;
  box-sizing:border-box; padding:0 16px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  border-bottom:${isLast ? 'none' : '4px solid var(--bg, #f8f8f8)'};
">
  <div style="
    flex-shrink:0;
    width:64px; height:64px;
    border-radius:var(--radius, 8px);
    background:var(--accent);
    opacity:0.85;
    display:flex; align-items:center; justify-content:center;
    font-size:28px;
  ">${item.icon ?? '★'}</div>
  <div style="flex:1; min-width:0;">
    <div style="
      font-family:var(--font-head);
      font-size:var(--h3, 18px);
      color:var(--text);
      font-weight:600;
      line-height:1.3;
      margin-bottom:6px;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${item.heading ?? ''}</div>
    <div style="
      font-family:var(--font-body);
      font-size:var(--body, 14px);
      color:var(--muted);
      line-height:1.6;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${item.body ?? ''}</div>
  </div>
</div>`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
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
</div>

${rowsHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: numbered-two-col ─────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   items: Array<{ number, heading, details: string[] }>,  // 3-4 items
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar  col 1-12  offset 56   height 80
 *   list_area  col 1-12  offset 152  height 488
 *   source_bar col 1-12  offset 640  height 24
 *
 * Each row: left col 1-5 (badge + heading), right col 6-12 (bullet details)
 */
definePattern('numbered-two-col', (c) => {
  const title = c.title ?? '';
  const items = c.items ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const sb = colRange(1, 12);

  // left part: col 1-5
  const leftPart = colRange(1, 5);
  // right part: col 6-12
  const rightPart = colRange(6, 12);

  const count = Math.min(items.length, 4);
  const ROW_H = Math.floor(488 / count);

  const rowsHtml = items.slice(0, count).map((item, idx) => {
    const rowTop = 152 + idx * ROW_H;
    const isLast = idx === count - 1;
    const details = item.details ?? [];

    const bulletsHtml = details.map(d => `
      <div style="
        display:flex; align-items:flex-start; gap:8px;
        margin-bottom:6px;
      ">
        <span style="color:var(--accent); font-size:10px; margin-top:4px; flex-shrink:0;">▶</span>
        <span style="
          font-family:var(--font-body);
          font-size:var(--body, 14px);
          color:var(--muted);
          line-height:1.5;
          white-space:normal; overflow-wrap:break-word; word-break:keep-all;
        ">${d}</span>
      </div>`).join('');

    return `
<div data-region="two_col_row_${idx + 1}" class="ts-region" style="
  left:${leftPart.left}px; top:${rowTop}px; width:${leftPart.width}px; height:${ROW_H}px;
  display:flex; align-items:center; gap:16px;
  box-sizing:border-box; padding:0 16px 0 0;
  border-bottom:${isLast ? 'none' : '1px solid var(--muted)'};
  border-right:2px solid var(--accent);
">
  <div style="
    flex-shrink:0;
    width:48px; height:48px;
    border-radius:var(--radius, 8px);
    background:var(--accent);
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head);
    font-size:var(--caption, 13px);
    color:#fff;
    font-weight:700;
    letter-spacing:0.05em;
  ">${item.number ?? String(idx + 1).padStart(2, '0')}</div>
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:600;
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${item.heading ?? ''}</div>
</div>
<div data-region="two_col_row_right_${idx + 1}" class="ts-region" style="
  left:${rightPart.left}px; top:${rowTop}px; width:${rightPart.width}px; height:${ROW_H}px;
  display:flex; flex-direction:column; justify-content:center;
  box-sizing:border-box; padding:12px 0;
  border-bottom:${isLast ? 'none' : '1px solid var(--muted)'};
">
  ${bulletsHtml}
</div>`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
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
</div>

${rowsHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: three-tier-segment ───────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   category_label?: string,
 *   category_heading: string,
 *   segments: Array<{ icon?, label, heading, subtitle, bullets: string[] }>,  // 3
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar          col 1-12  offset 56   height 72
 *   left_label_panel   col 1-3   offset 144  height 480
 *   right_segment_list col 4-12  offset 144  height 480
 *   source_bar         col 1-12  offset 640  height 24
 */
definePattern('three-tier-segment', (c) => {
  const title = c.title ?? '';
  const categoryLabel = c.category_label ?? 'CATEGORY';
  const categoryHeading = c.category_heading ?? '';
  const segments = c.segments ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const lp = colRange(1, 3);
  const rs = colRange(4, 12);
  const sb = colRange(1, 12);

  const SEG_H = Math.floor(480 / 3); // 160px per segment

  const segmentsHtml = segments.slice(0, 3).map((seg, idx) => {
    const segTop = 144 + idx * SEG_H;
    const isLast = idx === 2;
    const bullets = seg.bullets ?? [];

    const bulletsHtml = bullets.map(b => `
      <div style="
        display:flex; align-items:flex-start; gap:6px;
        margin-bottom:4px;
      ">
        <span style="color:var(--accent); font-size:9px; margin-top:4px; flex-shrink:0;">●</span>
        <span style="
          font-family:var(--font-body);
          font-size:var(--caption, 13px);
          color:var(--muted);
          line-height:1.4;
          white-space:normal; overflow-wrap:break-word; word-break:keep-all;
        ">${b}</span>
      </div>`).join('');

    return `
<div data-region="segment_${idx + 1}" class="ts-region" style="
  left:${rs.left}px; top:${segTop}px; width:${rs.width}px; height:${SEG_H}px;
  display:flex; align-items:center; gap:16px;
  box-sizing:border-box; padding:0 16px;
  border-bottom:${isLast ? 'none' : '1px solid var(--muted)'};
">
  <div style="
    flex-shrink:0;
    width:48px; height:48px;
    border-radius:50%;
    background:var(--surface);
    border:2px solid var(--accent);
    display:flex; align-items:center; justify-content:center;
    font-size:20px;
  ">${seg.icon ?? '◎'}</div>
  <div style="flex:1; min-width:0;">
    <div style="
      font-family:var(--font-body);
      font-size:var(--caption, 13px);
      color:var(--accent);
      font-weight:600;
      text-transform:uppercase;
      letter-spacing:0.08em;
      margin-bottom:2px;
    ">${seg.label ?? ''}</div>
    <div style="
      font-family:var(--font-head);
      font-size:var(--h3, 18px);
      color:var(--text);
      font-weight:600;
      line-height:1.2;
      margin-bottom:3px;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${seg.heading ?? ''}</div>
    <div style="
      font-family:var(--font-body);
      font-size:var(--caption, 13px);
      color:var(--muted);
      margin-bottom:6px;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${seg.subtitle ?? ''}</div>
    ${bulletsHtml}
  </div>
</div>`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:72px;
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
</div>

<div data-region="left_label_panel" class="ts-region" style="
  left:${lp.left}px; top:144px; width:${lp.width}px; height:480px;
  display:flex; flex-direction:column; justify-content:center;
  box-sizing:border-box; padding:0 16px;
  border-right:1px dashed var(--muted);
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.1em;
    margin-bottom:12px;
  ">${categoryLabel}</div>
  <div style="
    font-family:var(--font-head);
    font-size:var(--h2, 22px);
    color:var(--text);
    font-weight:700;
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${categoryHeading}</div>
</div>

${segmentsHtml}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: two-section-stacked ──────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   upper_heading: string,
 *   upper_body: string,
 *   lower_heading: string,
 *   lower_body: string,
 *   lower_items?: string[],   // up to 3 numbered items
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar      col 1-12  offset 56   height 80
 *   upper_section  col 1-12  offset 152  height 224
 *   section_divider col 1-12 offset 376  height 8
 *   lower_section  col 1-12  offset 400  height 240
 *   source_bar     col 1-12  offset 640  height 24
 */
definePattern('two-section-stacked', (c) => {
  const title = c.title ?? '';
  const upperHeading = c.upper_heading ?? '';
  const upperBody = c.upper_body ?? '';
  const lowerHeading = c.lower_heading ?? '';
  const lowerBody = c.lower_body ?? '';
  const lowerItems = c.lower_items ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const us = colRange(1, 12);
  const div = colRange(1, 12);
  const ls = colRange(1, 12);
  const sb = colRange(1, 12);

  const numberedItemsHtml = lowerItems.slice(0, 3).map((item, idx) => `
    <div style="
      display:flex; align-items:flex-start; gap:12px;
      margin-bottom:8px;
    ">
      <div style="
        flex-shrink:0;
        width:28px; height:28px;
        border-radius:50%;
        background:var(--accent);
        display:flex; align-items:center; justify-content:center;
        font-family:var(--font-head);
        font-size:var(--caption, 13px);
        color:#fff;
        font-weight:700;
      ">${idx + 1}</div>
      <div style="
        font-family:var(--font-body);
        font-size:var(--body, 14px);
        color:var(--text);
        line-height:1.5;
        padding-top:4px;
        white-space:normal; overflow-wrap:break-word; word-break:keep-all;
      ">${item}</div>
    </div>`).join('');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
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
</div>

<div data-region="upper_section" class="ts-region" style="
  left:${us.left}px; top:152px; width:${us.width}px; height:224px;
  box-sizing:border-box; padding:16px 16px 16px 32px;
  border-left:4px solid var(--accent);
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h2, 22px);
    color:var(--text);
    font-weight:700;
    line-height:1.3;
    margin-bottom:12px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${upperHeading}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.7;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${upperBody}</div>
</div>

<div data-region="section_divider" class="ts-region" style="
  left:${div.left}px; top:376px; width:${div.width}px; height:8px;
  background:var(--muted);
  opacity:0.3;
"></div>

<div data-region="lower_section" class="ts-region" style="
  left:${ls.left}px; top:400px; width:${ls.width}px; height:240px;
  box-sizing:border-box; padding:16px 16px 16px 32px;
  border-left:4px solid var(--secondary, var(--accent));
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h2, 22px);
    color:var(--text);
    font-weight:700;
    line-height:1.3;
    margin-bottom:8px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${lowerHeading}</div>
  ${lowerBody ? `<div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.6;
    margin-bottom:10px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${lowerBody}</div>` : ''}
  ${numberedItemsHtml}
</div>

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: image-left-text-right ────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   image_label?: string,
 *   area_label?: string,
 *   text_heading: string,
 *   bullets: string[],   // 3-4 items
 *   source?: string
 * }
 *
 * Structure:
 *   title_bar  col 1-12   offset 56   height 80
 *   image_area col 1-4    offset 152  height 488
 *   text_area  col 5-12   offset 152  height 488
 *   source_bar col 1-12   offset 640  height 24
 */
definePattern('image-left-text-right', (c) => {
  const title = c.title ?? '';
  const imageLabel = c.image_label ?? 'IMAGE';
  const areaLabel = c.area_label ?? '';
  const textHeading = c.text_heading ?? '';
  const bullets = c.bullets ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const ia = colRange(1, 4);
  const ta = colRange(5, 12);
  const sb = colRange(1, 12);

  const bulletsHtml = bullets.slice(0, 4).map(b => `
    <div style="
      display:flex; align-items:flex-start; gap:12px;
      margin-bottom:12px;
    ">
      <span style="
        color:var(--accent);
        font-size:18px;
        line-height:1;
        flex-shrink:0;
        margin-top:2px;
      ">・</span>
      <div style="
        font-family:var(--font-body);
        font-size:var(--body, 14px);
        color:var(--text);
        line-height:1.6;
        white-space:normal; overflow-wrap:break-word; word-break:keep-all;
      ">${b}</div>
    </div>`).join('');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
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
</div>

<div data-region="image_area" class="ts-region" style="
  left:${ia.left}px; top:152px; width:${ia.width}px; height:488px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  display:flex; align-items:center; justify-content:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--muted);
    text-transform:uppercase;
    letter-spacing:0.1em;
    opacity:0.6;
  ">${imageLabel}</div>
</div>

<div data-region="text_area" class="ts-region" style="
  left:${ta.left}px; top:152px; width:${ta.width}px; height:488px;
  box-sizing:border-box; padding:24px 16px;
  display:flex; flex-direction:column; justify-content:center;
">
  ${areaLabel ? `<div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.1em;
    margin-bottom:8px;
  ">${areaLabel}</div>` : ''}
  <div style="
    font-family:var(--font-head);
    font-size:var(--h2, 22px);
    color:var(--text);
    font-weight:700;
    line-height:1.3;
    margin-bottom:12px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${textHeading}</div>
  <div style="
    width:120px; height:3px;
    background:var(--accent);
    border-radius:2px;
    margin-bottom:20px;
  "></div>
  ${bulletsHtml}
</div>

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});
