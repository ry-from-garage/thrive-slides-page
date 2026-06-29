/**
 * _meta.js — gallery meta slides (intro + category dividers)
 *
 * Patterns: _intro, _divider
 *
 * Grid: safe-area x 72..1208, y 56..664
 *   colX(n)  = 72 + (n-1) * 96.6667
 *   colW(n)  = n * 96.6667 - 24
 */

import { definePattern } from './registry.js';

// ── Grid helpers ─────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

function colX(n) { return SAFE_LEFT + (n - 1) * COL_UNIT; }
function colW(n) { return n * COL_UNIT - 24; }
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Pattern: _intro ───────────────────────────────────────────────────────────
/**
 * Gallery title slide.
 * content: { title?, subtitle?, note? }
 * Defaults supply sensible gallery text so the spec can omit them.
 */
definePattern('_intro', (c) => {
  const title    = c.title    ?? 'thrive-slides — Slide Pattern Gallery';
  const subtitle = c.subtitle ?? '5 テーマ × 14 カテゴリ × 83 パターン';
  const note     = c.note     ?? '← / → で移動　Esc でスライド一覧（オーバービュー）';

  // title_block: col 1-12, top 184, height 200
  const tb = colRange(1, 12);

  // accent_bar: col 1-3, top 164, height 8
  const ab = colRange(1, 3);

  // subtitle_block: col 1-9, top 400, height 72
  const sb = colRange(1, 9);

  // note_block: col 1-10, top 488, height 40
  const nb = colRange(1, 10);

  // decoration strip: full width, top 160, height 4
  const ds = colRange(1, 12);

  return `
<div data-region="accent_bar" class="ts-region" style="
  left:${ab.left}px; top:164px; width:${ab.width}px; height:6px;
  background:var(--accent);
  border-radius:3px;
"></div>

<div data-region="title_block" class="ts-region" style="
  left:${tb.left}px; top:184px; width:${tb.width}px; height:200px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--display);
    color:var(--text);
    line-height:1.1;
    letter-spacing:-0.01em;
    white-space:normal;
    overflow-wrap:break-word;
    word-break:keep-all;
  ">${title}</div>
</div>

<div data-region="subtitle_block" class="ts-region" style="
  left:${sb.left}px; top:400px; width:${sb.width}px; height:72px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h2);
    color:var(--accent);
    line-height:1.3;
    letter-spacing:0.02em;
    white-space:normal;
    overflow-wrap:break-word;
  ">${subtitle}</div>
</div>

<div data-region="note_block" class="ts-region" style="
  left:${nb.left}px; top:504px; width:${nb.width}px; height:40px;
  display:flex; align-items:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption);
    color:var(--muted);
    white-space:normal;
    overflow-wrap:break-word;
  ">${note}</div>
</div>
`.trim();
});

// ── Pattern: _divider ─────────────────────────────────────────────────────────
/**
 * Category divider slide.
 * content: { title, theme_name?, count? }
 *   title      — category label with emoji, e.g. "📊 チャート・データ"
 *   theme_name — theme display name (optional)
 *   count      — number of patterns in the category (optional)
 */
definePattern('_divider', (c) => {
  const title     = c.title      ?? 'カテゴリ';
  const themeName = c.theme_name ?? '';
  const count     = c.count      != null ? String(c.count) : '';

  // category_name: col 1-11, top 224, height 240
  const cn = colRange(1, 11);

  // meta_row: col 1-8, top 488, height 48
  const mr = colRange(1, 8);

  // accent line: col 1-2, top 216, height 5
  const al = colRange(1, 2);

  const metaParts = [];
  if (themeName) metaParts.push(`テーマ: ${themeName}`);
  if (count)     metaParts.push(`${count} パターン`);
  const meta = metaParts.join('　／　');

  return `
<div data-region="accent_line" class="ts-region" style="
  left:${al.left}px; top:216px; width:${al.width}px; height:5px;
  background:var(--accent);
  border-radius:3px;
"></div>

<div data-region="category_name" class="ts-region" style="
  left:${cn.left}px; top:232px; width:${cn.width}px; height:240px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static;
    width:100%;
    font-family:var(--font-head);
    font-size:var(--display);
    color:var(--text);
    line-height:1.1;
    white-space:normal;
    overflow-wrap:break-word;
    word-break:keep-all;
  ">${title}</div>
</div>

${meta ? `
<div data-region="meta_row" class="ts-region" style="
  left:${mr.left}px; top:488px; width:${mr.width}px; height:48px;
  display:flex; align-items:center;
  gap:32px;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body);
    color:var(--muted);
    white-space:normal;
    overflow-wrap:break-word;
  ">${meta}</div>
</div>
` : ''}
`.trim();
});
