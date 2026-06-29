/**
 * toc.js — 目次パターン群
 *
 * Patterns: numbered-agenda, two-column-toc, sidebar-toc-panel, category-toc, section-progress-toc
 *
 * Theme: corporate-trust
 *   --primary:#1565C0  --secondary:#3B88C3  --bg:#F0F4F9  --surface:#D6E2F0
 *   --accent:#A84300   --text:#0D1B2A       --muted:#4A5568
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

// ── Pattern: numbered-agenda ───────────────────────────────────────────────────
/**
 * content: {
 *   section_label: string,   // e.g. "AGENDA"
 *   title: string,           // slide title e.g. "目次"
 *   items: Array<{ number, name, page }>  // up to 8 items
 *   source: string           // optional source bar text
 * }
 */
definePattern('numbered-agenda', (c) => {
  const sectionLabel = c.section_label ?? 'AGENDA';
  const title = c.title ?? '目次';
  const items = c.items ?? [];
  const source = c.source ?? '';

  // title_bar: col 1-12, offset 56, height 80
  const tb = colRange(1, 12);
  // list_area: col 1-12, offset 152, height 456
  const la = colRange(1, 12);
  // source_bar: col 1-12, offset 640, height 24
  const sb = colRange(1, 12);

  // Each list row height: 456 / 8 = 57px, use 56 (8px multiple)
  const rowH = items.length > 0 ? Math.floor(456 / Math.max(items.length, 1)) : 57;

  const itemsHtml = items.map((item, i) => {
    const top = 152 + i * rowH;
    const num = item.number ?? String(i + 1).padStart(2, '0');
    const name = item.name ?? '';
    const page = item.page ?? '';

    return `
<div data-region="list_item_${i}" class="ts-region" style="
  left:${la.left}px; top:${top}px; width:${la.width}px; height:${rowH}px;
  display:flex; align-items:center;
  border-bottom:1px solid var(--surface);
  box-sizing:border-box;
">
  <div style="
    min-width:48px;
    font-family:var(--font-head);
    font-size:var(--h2);
    color:var(--primary);
    font-weight:700;
    flex-shrink:0;
  ">${num}</div>
  <div style="
    width:2px; height:24px;
    background:var(--muted);
    opacity:0.3;
    margin:0 16px;
    flex-shrink:0;
  "></div>
  <div style="
    flex:3;
    font-family:var(--font-body);
    font-size:var(--body);
    color:var(--text);
    white-space:normal;
    overflow-wrap:break-word;
    min-width:0;
  ">${name}</div>
  <div style="
    flex:1;
    border-bottom:2px dotted var(--muted);
    opacity:0.3;
    margin:0 16px;
    height:1px;
    align-self:center;
    min-width:32px;
  "></div>
  <div style="
    min-width:56px;
    text-align:right;
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
    flex-shrink:0;
  ">${page}</div>
</div>`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--primary);
    letter-spacing:0.1em;
    text-transform:uppercase;
    margin-bottom:4px;
  ">${sectionLabel}</div>
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h1);
    color:var(--text);
    line-height:1.2;
  ">${title}</div>
</div>

${itemsHtml}

${source ? `
<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
  ">${source}</div>
</div>
` : ''}
`.trim();
});

// ── Pattern: two-column-toc ────────────────────────────────────────────────────
/**
 * content: {
 *   section_label: string,
 *   title: string,
 *   left_items: Array<{ number, name, page }>,   // up to 6 items
 *   right_items: Array<{ number, name, page }>,  // up to 6 items
 *   source: string
 * }
 */
definePattern('two-column-toc', (c) => {
  const sectionLabel = c.section_label ?? 'TABLE OF CONTENTS';
  const title = c.title ?? '目次';
  const leftItems = c.left_items ?? [];
  const rightItems = c.right_items ?? [];
  const source = c.source ?? '';

  // title_bar: col 1-12, offset 56, height 80
  const tb = colRange(1, 12);
  // left_list: col 1-6, offset 152, height 480
  const ll = colRange(1, 6);
  // right_list: col 7-12, offset 152, height 480
  const rl = colRange(7, 12);
  // source_bar: col 1-12, offset 640, height 24
  const sb = colRange(1, 12);

  function renderItems(items, leftPx, widthPx, topOffset) {
    const maxItems = Math.max(items.length, 1);
    const rowH = Math.floor(480 / maxItems);
    return items.map((item, i) => {
      const top = topOffset + i * rowH;
      const num = item.number ?? String(i + 1).padStart(2, '0');
      const name = item.name ?? '';
      const page = item.page ?? '';
      return `
<div data-region="list_item_col_${leftPx}_${i}" class="ts-region" style="
  left:${leftPx}px; top:${top}px; width:${widthPx}px; height:${rowH}px;
  display:flex; align-items:center;
  border-bottom:1px solid var(--surface);
  box-sizing:border-box;
  padding:0 8px;
">
  <div style="
    min-width:36px;
    font-family:var(--font-head);
    font-size:var(--h2);
    color:var(--primary);
    font-weight:700;
    flex-shrink:0;
  ">${num}</div>
  <div style="
    flex:3;
    font-family:var(--font-body);
    font-size:var(--body);
    color:var(--text);
    margin-left:12px;
    white-space:normal;
    overflow-wrap:break-word;
    min-width:0;
  ">${name}</div>
  <div style="
    flex:0 0 24px;
    border-bottom:2px dotted var(--muted);
    opacity:0.3;
    margin:0 8px;
    height:1px;
    align-self:center;
  "></div>
  <div style="
    min-width:48px;
    text-align:right;
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
    flex-shrink:0;
  ">${page}</div>
</div>`;
    }).join('\n');
  }

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--primary);
    letter-spacing:0.1em;
    text-transform:uppercase;
    margin-bottom:4px;
  ">${sectionLabel}</div>
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h1);
    color:var(--text);
    line-height:1.2;
  ">${title}</div>
</div>

${renderItems(leftItems, ll.left, ll.width, 152)}
${renderItems(rightItems, rl.left, rl.width, 152)}

${source ? `
<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
  ">${source}</div>
</div>
` : ''}
`.trim();
});

// ── Pattern: sidebar-toc-panel ─────────────────────────────────────────────────
/**
 * content: {
 *   panel_label: string,     // e.g. "INDEX"
 *   right_header: string,    // optional right header title
 *   items: Array<{ number, name }>,  // 4-7 items with badge numbers
 *   source: string
 * }
 */
definePattern('sidebar-toc-panel', (c) => {
  const panelLabel = c.panel_label ?? 'INDEX';
  const rightHeader = c.right_header ?? '';
  const items = c.items ?? [];
  const source = c.source ?? '';

  // left_panel: col 1-3, offset 56, height 608
  const lp = colRange(1, 3);
  // right_header: col 4-12, offset 72, height 40
  const rh = colRange(4, 12);
  // items_area: col 4-12, offset 128, height 512
  const ia = colRange(4, 12);
  // source_bar: col 4-12, offset 640, height 24
  const ss = colRange(4, 12);

  const maxItems = Math.max(items.length, 1);
  const itemRowH = Math.floor(512 / maxItems);

  const itemsHtml = items.map((item, i) => {
    const top = 128 + i * itemRowH;
    const num = item.number ?? String(i + 1);
    const name = item.name ?? '';
    return `
<div data-region="item_row_${i}" class="ts-region" style="
  left:${ia.left}px; top:${top}px; width:${ia.width}px; height:${itemRowH}px;
  display:flex; align-items:center;
  gap:20px;
  box-sizing:border-box;
">
  <div style="
    width:40px; height:40px;
    background:var(--primary);
    color:var(--bg);
    border-radius:var(--radius);
    font-family:var(--font-head);
    font-size:var(--h2);
    font-weight:700;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  ">${num}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body);
    color:var(--text);
    line-height:1.3;
    white-space:normal;
    overflow-wrap:break-word;
  ">${name}</div>
</div>`;
  }).join('\n');

  return `
<div data-region="left_panel" class="ts-region" style="
  left:${lp.left}px; top:56px; width:${lp.width}px; height:608px;
  background:var(--primary);
  display:flex; align-items:center; justify-content:center;
  border-radius:var(--radius);
  box-sizing:border-box;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h1);
    color:var(--bg);
    letter-spacing:0.08em;
    writing-mode:vertical-rl;
    text-orientation:mixed;
    transform:rotate(180deg);
    line-height:1.2;
  ">${panelLabel}</div>
</div>

${rightHeader ? `
<div data-region="right_header" class="ts-region" style="
  left:${rh.left}px; top:72px; width:${rh.width}px; height:40px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h2);
    color:var(--text);
  ">${rightHeader}</div>
</div>
` : ''}

${itemsHtml}

${source ? `
<div data-region="source_bar" class="ts-region" style="
  left:${ss.left}px; top:640px; width:${ss.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
  ">${source}</div>
</div>
` : ''}
`.trim();
});

// ── Pattern: category-toc ──────────────────────────────────────────────────────
/**
 * content: {
 *   section_label: string,
 *   title: string,
 *   categories: Array<{
 *     en_heading: string,     // e.g. "COMPANY"
 *     ja_subtitle: string,    // e.g. "会社概要"
 *     items: string[]
 *   }>,
 *   show_image: boolean,      // whether to show image_area (default false)
 *   source: string
 * }
 */
definePattern('category-toc', (c) => {
  const sectionLabel = c.section_label ?? 'TABLE OF CONTENTS';
  const title = c.title ?? '目次';
  const categories = c.categories ?? [];
  const showImage = c.show_image ?? false;
  const source = c.source ?? '';

  // title_bar: col 1-12, offset 56, height 72
  const tb = colRange(1, 12);
  // category_list_area: col 1-8 (with image) or col 1-12 (without), offset 144, height 480
  const catEndCol = showImage ? 8 : 12;
  const ca = colRange(1, catEndCol);
  // image_area: col 9-12, offset 144, height 480
  const ima = colRange(9, 12);
  // source_bar: col 1-12, offset 640, height 24
  const sb = colRange(1, 12);

  const maxCats = Math.max(categories.length, 1);
  const catBlockH = Math.floor(480 / maxCats);

  const categoriesHtml = categories.map((cat, i) => {
    const top = 144 + i * catBlockH;
    const enHeading = cat.en_heading ?? '';
    const jaSub = cat.ja_subtitle ?? '';
    const catItems = cat.items ?? [];

    const itemsHtml = catItems.map(item => `
  <div style="
    font-family:var(--font-body);
    font-size:var(--body);
    color:var(--text);
    padding:2px 0 2px 12px;
    line-height:1.5;
  ">${item}</div>`).join('');

    return `
<div data-region="category_block_${i}" class="ts-region" style="
  left:${ca.left}px; top:${top}px; width:${ca.width}px; height:${catBlockH}px;
  display:flex; flex-direction:column; justify-content:center;
  box-sizing:border-box;
  border-left:3px solid var(--primary);
  padding-left:16px;
">
  <div style="display:flex; align-items:baseline; gap:12px; margin-bottom:4px;">
    <div style="
      font-family:var(--font-head);
      font-size:var(--h2);
      color:var(--primary);
      font-weight:700;
      letter-spacing:0.05em;
    ">${enHeading}</div>
    <div style="
      font-family:var(--font-body);
      font-size:var(--caption);
      color:var(--muted);
    ">${jaSub}</div>
  </div>
  <div style="
    border-left:2px solid var(--surface);
    padding-left:12px;
  ">${itemsHtml}</div>
</div>`;
  }).join('\n');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:72px;
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--primary);
    letter-spacing:0.1em;
    text-transform:uppercase;
    margin-bottom:4px;
  ">${sectionLabel}</div>
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h1);
    color:var(--text);
    line-height:1.2;
  ">${title}</div>
</div>

${categoriesHtml}

${showImage ? `
<div data-region="image_area" class="ts-region" style="
  left:${ima.left}px; top:144px; width:${ima.width}px; height:480px;
  background:var(--surface);
  border-radius:var(--radius);
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--caption);
    color:var(--muted);
    letter-spacing:0.08em;
    text-transform:uppercase;
    opacity:0.5;
  ">IMAGE</div>
</div>
` : ''}

${source ? `
<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
  ">${source}</div>
</div>
` : ''}
`.trim();
});

// ── Pattern: section-progress-toc ──────────────────────────────────────────────
/**
 * content: {
 *   deck_title: string,         // e.g. "AIプロダクト戦略 2026"
 *   section_label: string,      // e.g. "Section 2 / 5"
 *   progress_ratio: number,     // 0.0..1.0 e.g. 0.4 for 2/5
 *   current_number: string,     // e.g. "02"
 *   current_name: string,       // current section name
 *   current_desc: string,       // optional description
 *   prev_sections: string[],    // past section names (small, muted)
 *   next_sections: string[],    // future section names (small, muted)
 *   source: string
 * }
 */
definePattern('section-progress-toc', (c) => {
  const deckTitle = c.deck_title ?? '';
  const sectionLabel = c.section_label ?? '';
  const progressRatio = Math.min(1, Math.max(0, c.progress_ratio ?? 0.4));
  const currentNumber = c.current_number ?? '01';
  const currentName = c.current_name ?? '';
  const currentDesc = c.current_desc ?? '';
  const prevSections = c.prev_sections ?? [];
  const nextSections = c.next_sections ?? [];
  const source = c.source ?? '';

  // title_bar: col 1-12, offset 56, height 72
  const tb = colRange(1, 12);
  // progress_track: col 1-12, offset 144, height 8
  const pt = colRange(1, 12);
  // current_section_area: col 3-10, offset 176, height 456
  const cs = colRange(3, 10);
  // prev_sections: col 1-2, offset 176, height 456
  const ps = colRange(1, 2);
  // next_sections: col 11-12, offset 176, height 456
  const ns = colRange(11, 12);
  // source_bar: col 1-12, offset 640, height 24
  const sb = colRange(1, 12);

  // Progress bar fill width
  const progressFillWidth = Math.round(pt.width * progressRatio);

  const prevHtml = prevSections.map((name, i) => `
<div style="
  font-family:var(--font-body);
  font-size:var(--caption);
  color:var(--muted);
  opacity:0.6;
  padding:4px 0;
  white-space:normal;
  overflow-wrap:break-word;
  line-height:1.4;
">${name}</div>`).join('');

  const nextHtml = nextSections.map((name, i) => `
<div style="
  font-family:var(--font-body);
  font-size:var(--caption);
  color:var(--muted);
  opacity:0.6;
  padding:4px 0;
  white-space:normal;
  overflow-wrap:break-word;
  line-height:1.4;
  text-align:right;
">${name}</div>`).join('');

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:72px;
  display:flex; align-items:center; justify-content:space-between;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h2);
    color:var(--text);
  ">${deckTitle}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--primary);
    letter-spacing:0.06em;
  ">${sectionLabel}</div>
</div>

<div data-region="progress_track" class="ts-region" style="
  left:${pt.left}px; top:144px; width:${pt.width}px; height:8px;
  background:var(--surface);
  border-radius:4px;
  overflow:hidden;
">
  <div style="
    width:${progressFillWidth}px; height:8px;
    background:var(--primary);
    border-radius:4px;
  "></div>
</div>

<div data-region="prev_sections" class="ts-region" style="
  left:${ps.left}px; top:176px; width:${ps.width}px; height:456px;
  display:flex; flex-direction:column; justify-content:center;
  box-sizing:border-box;
  padding:16px 8px;
">
  ${prevHtml}
</div>

<div data-region="current_section_area" class="ts-region" style="
  left:${cs.left}px; top:176px; width:${cs.width}px; height:456px;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center;
  box-sizing:border-box;
  padding:24px;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--display);
    color:var(--primary);
    font-weight:700;
    line-height:1;
    margin-bottom:16px;
  ">${currentNumber}</div>
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--h1);
    color:var(--text);
    text-align:center;
    line-height:1.25;
    margin-bottom:16px;
    white-space:normal;
    overflow-wrap:break-word;
  ">${currentName}</div>
  ${currentDesc ? `
  <div style="
    font-family:var(--font-body);
    font-size:var(--body);
    color:var(--muted);
    text-align:center;
    line-height:1.5;
    white-space:normal;
    overflow-wrap:break-word;
  ">${currentDesc}</div>
  ` : ''}
</div>

<div data-region="next_sections" class="ts-region" style="
  left:${ns.left}px; top:176px; width:${ns.width}px; height:456px;
  display:flex; flex-direction:column; justify-content:center;
  box-sizing:border-box;
  padding:16px 8px;
  text-align:right;
">
  ${nextHtml}
</div>

${source ? `
<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
  ">${source}</div>
</div>
` : ''}
`.trim();
});
