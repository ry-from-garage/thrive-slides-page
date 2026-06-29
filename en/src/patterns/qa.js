/**
 * qa.js — Q&A・FAQ パターン群
 *
 * Patterns:
 *   faq-grid              3×2 (or 2×2) grid of FAQ cells
 *   faq-single-column     3 full-width Q&A boxes, stacked
 *   faq-stacked-qa-boxes  Q行＋A行ペアを3組縦積み（fill contrast）
 *   qa-session-closing    Q&A セッション開始クロージング
 *
 * Theme: corporate-trust
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   COL_UNIT = 96.6667  (column + gutter)
 *   col_start(n) = 72 + (n-1) * 96.6667
 *   col_width(n) = n * 96.6667 - 24
 *
 * All vertical_offset_px / row_height_px taken directly from layout-qa.md.
 */

import { definePattern } from './registry.js';
import { cardGrid }       from '../components/card-grid.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT  = 96.6667;
const SAFE_LEFT = 72;

function colX(n)        { return SAFE_LEFT + (n - 1) * COL_UNIT; }
function colW(n)        { return n * COL_UNIT - 24; }
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Shared: action_title_bar ──────────────────────────────────────────────────
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

// ── Shared: source_note ───────────────────────────────────────────────────────
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

// ── Pattern: faq-grid ─────────────────────────────────────────────────────────
/**
 * FAQ を3列×2行グリッド（または2列×2行）に均等配置。
 * 各セルに番号バッジ・質問見出し・回答本文を縦積み。
 *
 * content: {
 *   title:   string,
 *   faqs:    Array<{ number, question, answer }>,   // 6 items (3×2) or 4 items (2×2)
 *   source?: string
 * }
 *
 * Layout (layout-qa.md § faq-grid):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   faq_cell_r1c*     3-col     offset 160  height 232
 *   faq_cell_r2c*     3-col     offset 400  height 232
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('faq-grid', (c) => {
  const title  = c.title  ?? '';
  const faqs   = c.faqs   ?? [];
  const source = c.source ?? '';

  // Determine columns: 6 items → 3col, 4 items → 2col
  const cols = faqs.length <= 4 ? 2 : 3;

  // Number badge (uses --primary accent)
  function qBadge(num) {
    return `<span style="
      display:inline-block;
      background:var(--primary);
      color:#fff;
      font-family:var(--font-head);
      font-size:11px;
      font-weight:700;
      line-height:1;
      padding:3px 8px;
      border-radius:3px;
      letter-spacing:0.06em;
      margin-bottom:10px;
    ">${num}</span>`;
  }

  function cellInner(item) {
    if (!item) return '';
    return `<div style="
      padding:18px 16px;
      box-sizing:border-box;
      height:100%;
      display:flex;
      flex-direction:column;
      background:var(--surface);
      border-radius:var(--radius);
      overflow:hidden;
    ">
      ${qBadge(item.number ?? 'Q1')}
      <div style="
        font-family:var(--font-head);
        font-size:17px;
        font-weight:700;
        color:var(--text);
        line-height:1.35;
        margin-bottom:8px;
        white-space:normal;
        overflow-wrap:break-word;
      ">${item.question ?? ''}</div>
      <div style="
        font-family:var(--font-body);
        font-size:15px;
        color:var(--muted);
        line-height:1.5;
        white-space:normal;
        overflow-wrap:break-word;
        display:-webkit-box;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:3;
        overflow:hidden;
        text-overflow:ellipsis;
      ">${item.answer ?? ''}</div>
    </div>`;
  }

  const row1 = faqs.slice(0, cols).map(item => cellInner(item));
  const row2 = faqs.slice(cols, cols * 2).map(item => cellInner(item));

  return `
${titleBar(title)}

${cardGrid(cols, row1, { top: 160, height: 232 })}
${cardGrid(cols, row2, { top: 400, height: 232 })}

${sourceNote(source)}
`.trim();
});

// ── Pattern: faq-single-column ────────────────────────────────────────────────
/**
 * 重要な Q&A を1カラム全幅に3件縦積み。各ボックスに質問ラベル・質問文・回答文。
 *
 * content: {
 *   title:   string,
 *   faqs:    Array<{ number, question, answer }>,   // 3 items
 *   source?: string
 * }
 *
 * Layout (layout-qa.md § faq-single-column):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   qa_box_1          col 1-12  offset 160  height 152
 *   qa_box_2          col 1-12  offset 320  height 152
 *   qa_box_3          col 1-12  offset 480  height 152
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('faq-single-column', (c) => {
  const title  = c.title  ?? '';
  const faqs   = c.faqs   ?? [];
  const source = c.source ?? '';

  const full = colRange(1, 12);

  const offsets = [160, 320, 480];

  const boxes = faqs.slice(0, 3).map((item, i) => {
    const top = offsets[i];
    return `<div data-region="qa_box_${i + 1}" class="ts-region" style="
  left:${full.left}px; top:${top}px; width:${full.width}px; height:152px;
  background:var(--surface);
  border-radius:var(--radius);
  box-sizing:border-box;
  padding:0;
  overflow:hidden;
  display:flex;
  align-items:stretch;
">
  <!-- Q label accent strip -->
  <div style="
    width:6px;
    flex-shrink:0;
    background:var(--primary);
    border-radius:var(--radius) 0 0 var(--radius);
  "></div>
  <!-- Content -->
  <div style="
    flex:1;
    padding:16px 20px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    justify-content:center;
    min-width:0;
  ">
    <div style="
      display:flex;
      align-items:center;
      gap:10px;
      margin-bottom:6px;
    ">
      <span style="
        display:inline-block;
        background:var(--primary);
        color:#fff;
        font-family:var(--font-head);
        font-size:11px;
        font-weight:700;
        padding:2px 8px;
        border-radius:3px;
        letter-spacing:0.06em;
        flex-shrink:0;
      ">${item.number ?? 'Q' + (i + 1)}</span>
      <div style="
        font-family:var(--font-head);
        font-size:var(--h2);
        font-weight:700;
        color:var(--text);
        line-height:1.3;
        white-space:normal;
        overflow-wrap:break-word;
      ">${item.question ?? ''}</div>
    </div>
    <div style="
      font-family:var(--font-body);
      font-size:var(--body);
      color:var(--muted);
      line-height:1.6;
      white-space:normal;
      overflow-wrap:break-word;
    ">${item.answer ?? ''}</div>
  </div>
</div>`;
  }).join('\n');

  return `
${titleBar(title)}

${boxes}

${sourceNote(source)}
`.trim();
});

// ── Pattern: faq-stacked-qa-boxes ─────────────────────────────────────────────
/**
 * Q行（mid-gray）＋A行（light-gray）の上下ペアを3組縦積み。
 * fill の濃淡差で Q/A を視覚的に区別。
 *
 * content: {
 *   title:   string,
 *   faqs:    Array<{ number, question, answer }>,   // 3 items
 *   source?: string
 * }
 *
 * Layout (layout-qa.md § faq-stacked-qa-boxes):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   q_box_1           col 1-12  offset 160  height 48   (mid-gray = var(--surface) darker)
 *   a_box_1           col 1-12  offset 208  height 96   (light-gray = var(--surface))
 *   q_box_2           col 1-12  offset 312  height 48
 *   a_box_2           col 1-12  offset 360  height 96
 *   q_box_3           col 1-12  offset 464  height 48
 *   a_box_3           col 1-12  offset 512  height 96
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('faq-stacked-qa-boxes', (c) => {
  const title  = c.title  ?? '';
  const faqs   = c.faqs   ?? [];
  const source = c.source ?? '';

  const full = colRange(1, 12);

  // Q-box offsets and A-box offsets per pair
  const qOffsets = [160, 312, 464];
  const aOffsets = [208, 360, 512];

  const pairs = faqs.slice(0, 3).map((item, i) => {
    const qTop = qOffsets[i];
    const aTop = aOffsets[i];
    const num  = item.number ?? 'Q' + (i + 1);

    const qBox = `<div data-region="q_box_${i + 1}" class="ts-region" style="
  left:${full.left}px; top:${qTop}px; width:${full.width}px; height:48px;
  background:var(--primary);
  border-radius:var(--radius) var(--radius) 0 0;
  box-sizing:border-box;
  padding:0 20px;
  display:flex;
  align-items:center;
  gap:12px;
  overflow:hidden;
">
  <span style="
    font-family:var(--font-head);
    font-size:12px;
    font-weight:700;
    color:rgba(255,255,255,0.85);
    letter-spacing:0.1em;
    flex-shrink:0;
    white-space:nowrap;
  ">${num}</span>
  <div style="
    font-family:var(--font-head);
    font-size:var(--body);
    font-weight:700;
    color:#fff;
    line-height:1.3;
    white-space:normal;
    overflow-wrap:break-word;
  ">${item.question ?? ''}</div>
</div>`;

    const aBox = `<div data-region="a_box_${i + 1}" class="ts-region" style="
  left:${full.left}px; top:${aTop}px; width:${full.width}px; height:96px;
  background:var(--surface);
  border-radius:0 0 var(--radius) var(--radius);
  box-sizing:border-box;
  padding:0 20px;
  display:flex;
  align-items:center;
  gap:12px;
  overflow:hidden;
">
  <span style="
    font-family:var(--font-head);
    font-size:12px;
    font-weight:700;
    color:var(--primary);
    letter-spacing:0.1em;
    flex-shrink:0;
    white-space:nowrap;
    align-self:flex-start;
    padding-top:4px;
  ">A.</span>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body);
    color:var(--muted);
    line-height:1.6;
    white-space:normal;
    overflow-wrap:break-word;
  ">${item.answer ?? ''}</div>
</div>`;

    return qBox + '\n' + aBox;
  }).join('\n');

  return `
${titleBar(title)}

${pairs}

${sourceNote(source)}
`.trim();
});

// ── Pattern: qa-session-closing ───────────────────────────────────────────────
/**
 * Q&A セッション開始クロージングスライド。
 * 左: 大きな "Q&A" ヒーローパネル (dark-gray = var(--primary))
 * 右上: セッション案内テキスト
 * 右下: 連絡先情報
 *
 * content: {
 *   title:    string,
 *   hero_label?: string,         // default "Q&A"
 *   session_items: string[],     // 2-3 bullet items for session info
 *   contact: {
 *     name:   string,
 *     org?:   string,
 *     email?: string,
 *     sns?:   string,
 *   },
 *   source?: string
 * }
 *
 * Layout (layout-qa.md § qa-session-closing):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   qa_hero_panel     col 1-5   offset 160  height 480   (dark-gray)
 *   session_info_col  col 6-12  offset 160  height 224   (none)
 *   contact_info_col  col 6-12  offset 400  height 240   (light-gray)
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('qa-session-closing', (c) => {
  const title       = c.title         ?? '';
  const heroLabel   = c.hero_label    ?? 'Q&A';
  const sessionItems = c.session_items ?? [];
  const contact     = c.contact       ?? {};
  const source      = c.source        ?? '';

  const heroR    = colRange(1, 5);
  const rightR   = colRange(6, 12);

  // ── qa_hero_panel ──────────────────────────────────────────────────────────
  const heroPanel = `<div data-region="qa_hero_panel" class="ts-region" style="
  left:${heroR.left}px; top:160px; width:${heroR.width}px; height:480px;
  background:var(--primary);
  border-radius:var(--radius);
  box-sizing:border-box;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:80px;
    font-weight:700;
    color:#fff;
    letter-spacing:0.04em;
    line-height:1;
    text-align:center;
    user-select:none;
  ">${heroLabel}</div>
</div>`;

  // ── session_info_col ───────────────────────────────────────────────────────
  const bulletItems = sessionItems.map(item =>
    `<div style="
      display:flex;
      align-items:flex-start;
      gap:10px;
      margin-bottom:10px;
    ">
      <span style="
        flex-shrink:0;
        width:6px;
        height:6px;
        border-radius:50%;
        background:var(--primary);
        margin-top:8px;
      "></span>
      <div style="
        font-family:var(--font-body);
        font-size:var(--body);
        color:var(--text);
        line-height:1.6;
        white-space:normal;
        overflow-wrap:break-word;
      ">${item}</div>
    </div>`
  ).join('');

  const sessionCol = `<div data-region="session_info_col" class="ts-region" style="
  left:${rightR.left}px; top:160px; width:${rightR.width}px; height:224px;
  box-sizing:border-box;
  padding:20px 20px 16px;
  overflow:hidden;
">
  <div style="
    font-family:var(--font-head);
    font-size:11px;
    font-weight:700;
    color:var(--primary);
    letter-spacing:0.12em;
    margin-bottom:14px;
  ">SESSION INFO</div>
  ${bulletItems}
</div>`;

  // ── contact_info_col ───────────────────────────────────────────────────────
  const contactRows = [
    contact.name  ? `<div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);margin-bottom:6px;">${contact.name}</div>` : '',
    contact.org   ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);margin-bottom:8px;">${contact.org}</div>` : '',
    contact.email ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--primary);margin-bottom:4px;">✉ ${contact.email}</div>` : '',
    contact.sns   ? `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);">${contact.sns}</div>` : '',
  ].filter(Boolean).join('');

  const contactCol = `<div data-region="contact_info_col" class="ts-region" style="
  left:${rightR.left}px; top:400px; width:${rightR.width}px; height:240px;
  background:var(--surface);
  border-radius:var(--radius);
  box-sizing:border-box;
  padding:20px 20px;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  justify-content:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:11px;
    font-weight:700;
    color:var(--muted);
    letter-spacing:0.12em;
    margin-bottom:14px;
  ">CONTACT</div>
  ${contactRows}
</div>`;

  return `
${titleBar(title)}

${heroPanel}

${sessionCol}

${contactCol}

${sourceNote(source)}
`.trim();
});
