/**
 * profile.js — プロフィールパターン群
 *
 * Patterns: profile-bio, team-grid, step-detail-photo-aside, speaker-card
 *
 * Theme: modern-tech
 *   near-white background, soft violet accent, rounded cards
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   COL_UNIT = 96.6667  (column width + gutter)
 *   colX(n)  = 72 + (n-1) * 96.6667
 *   colW(n)  = n * 96.6667 - 24
 *
 * All vertical_offset_px and row_height_px are taken directly from layout-profile.md spec.
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

// ── Pattern: profile-bio ──────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,                      // action title (So-What)
 *   photo_side?: 'left' | 'right',      // default 'left'
 *   name: string,                       // 氏名
 *   furigana?: string,                  // フリガナ
 *   position: string,                   // 肩書・所属
 *   profile_items: Array<{ label, value }>,  // プロフィール項目
 *   source?: string
 * }
 *
 * Structure (photo_side: left):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   photo_area        col 1-4   offset 160  height 480
 *   name_block        col 5-12  offset 160  height 96
 *   profile_table     col 5-12  offset 264  height 352
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('profile-bio', (c) => {
  const title = c.title ?? '';
  const photoSide = c.photo_side ?? 'left';
  const name = c.name ?? '';
  const furigana = c.furigana ?? '';
  const position = c.position ?? '';
  const profileItems = c.profile_items ?? [];
  const source = c.source ?? '';

  const atb = colRange(1, 12);
  const sb = colRange(1, 12);

  // Photo left (default) or right
  const photoRange = photoSide === 'right' ? colRange(9, 12) : colRange(1, 4);
  const infoRange  = photoSide === 'right' ? colRange(1, 8)  : colRange(5, 12);

  // Profile items rows — fill up to 352px (each row ~56px for up to 6 items)
  const maxItems = Math.min(profileItems.length, 6);
  const ROW_H = maxItems > 0 ? Math.floor(352 / maxItems) : 56;

  const profileRowsHtml = profileItems.slice(0, maxItems).map((item, idx) => {
    const rowTop = 264 + idx * ROW_H;
    const isLast = idx === maxItems - 1;
    return `
<div data-region="profile_row_${idx + 1}" class="ts-region" style="
  left:${infoRange.left}px; top:${rowTop}px; width:${infoRange.width}px; height:${ROW_H}px;
  display:flex; align-items:center; gap:0;
  box-sizing:border-box; padding:0 16px;
  background:var(--surface);
  border-bottom:${isLast ? 'none' : '1px solid var(--bg, #f8f8f8)'};
">
  <div style="
    flex-shrink:0;
    width:120px;
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    font-weight:600;
    letter-spacing:0.04em;
    white-space:nowrap;
  ">${item.label ?? ''}</div>
  <div style="
    flex:1; min-width:0;
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--text);
    line-height:1.5;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${item.value ?? ''}</div>
</div>`;
  }).join('\n');

  return `
<div data-region="action_title_bar" class="ts-region" style="
  left:${atb.left}px; top:56px; width:${atb.width}px; height:88px;
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

<div data-region="photo_area" class="ts-region" style="
  left:${photoRange.left}px; top:160px; width:${photoRange.width}px; height:480px;
  background:var(--muted);
  opacity:0.35;
  border-radius:var(--radius, 8px);
  display:flex; align-items:center; justify-content:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--bg, #fff);
    text-transform:uppercase;
    letter-spacing:0.12em;
    opacity:0.7;
  ">PHOTO</div>
</div>

<div data-region="name_block" class="ts-region" style="
  left:${infoRange.left}px; top:160px; width:${infoRange.width}px; height:96px;
  box-sizing:border-box; padding:8px 16px;
  display:flex; flex-direction:column; justify-content:center;
">
  ${furigana ? `<div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--muted);
    letter-spacing:0.06em;
    margin-bottom:2px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${furigana}</div>` : ''}
  <div style="
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.15;
    margin-bottom:4px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${name}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--accent);
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${position}</div>
</div>

${profileRowsHtml}

${source ? `<div data-region="source_note" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: team-grid ────────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   members: Array<{ name, furigana?, role, note? }>,   // 2-4 members
 *   source?: string
 * }
 *
 * Structure (3 members default):
 *   action_title_bar  col 1-12  offset 56   height 88
 *   member_card_1     col 1-4   offset 160  height 480
 *   member_card_2     col 5-8   offset 160  height 480
 *   member_card_3     col 9-12  offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('team-grid', (c) => {
  const title = c.title ?? '';
  const members = c.members ?? [];
  const source = c.source ?? '';

  const atb = colRange(1, 12);
  const sb = colRange(1, 12);

  const n = Math.max(2, Math.min(4, members.length));

  // Column ranges for n members: equal split across 12 cols
  const colSplits = {
    2: [[1, 6], [7, 12]],
    3: [[1, 4], [5, 8], [9, 12]],
    4: [[1, 3], [4, 6], [7, 9], [10, 12]],
  };
  const splits = colSplits[n] || colSplits[3];

  // Photo placeholder height inside each card: ~half the 480px card
  const CARD_H = 480;
  const PHOTO_H = 240;
  const NAME_H = 56;
  const ROLE_H = 48;
  const NOTE_H = CARD_H - PHOTO_H - NAME_H - ROLE_H; // remainder for note

  const cardsHtml = members.slice(0, n).map((member, idx) => {
    const [cs, ce] = splits[idx];
    const cr = colRange(cs, ce);
    return `
<div data-region="member_card_${idx + 1}" class="ts-region" style="
  left:${cr.left}px; top:160px; width:${cr.width}px; height:${CARD_H}px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  overflow:hidden;
  display:flex; flex-direction:column;
">
  <!-- photo placeholder -->
  <div style="
    width:100%; height:${PHOTO_H}px;
    background:var(--muted);
    opacity:0.35;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  ">
    <div style="
      font-family:var(--font-body);
      font-size:var(--caption, 13px);
      color:var(--bg, #fff);
      text-transform:uppercase;
      letter-spacing:0.12em;
      opacity:0.7;
    ">PHOTO</div>
  </div>
  <!-- name -->
  <div style="
    padding:12px 16px 4px;
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:700;
    line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${member.name ?? ''}${member.furigana ? `<div style="font-family:var(--font-body);font-size:var(--caption,13px);color:var(--muted);font-weight:400;margin-top:2px;">${member.furigana}</div>` : ''}</div>
  <!-- role -->
  <div style="
    padding:0 16px;
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    font-weight:600;
    line-height:1.4;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${member.role ?? ''}</div>
  ${member.note ? `<!-- note -->
  <div style="
    padding:8px 16px 0;
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--muted);
    line-height:1.5;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${member.note}</div>` : ''}
</div>`;
  }).join('\n');

  return `
<div data-region="action_title_bar" class="ts-region" style="
  left:${atb.left}px; top:56px; width:${atb.width}px; height:88px;
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

${cardsHtml}

${source ? `<div data-region="source_note" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: step-detail-photo-aside ─────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   steps: Array<{ number, heading, body }>,   // 3 steps
 *   person: { name, role },
 *   source?: string
 * }
 *
 * Structure:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   step_markers      col 1-1   offset 160  height 480
 *   step_blocks       col 2-9   offset 160  height 480
 *   profile_aside     col 10-12 offset 160  height 480
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('step-detail-photo-aside', (c) => {
  const title = c.title ?? '';
  const steps = c.steps ?? [];
  const person = c.person ?? {};
  const source = c.source ?? '';

  const atb = colRange(1, 12);
  const sm = colRange(1, 1);
  const sbl = colRange(2, 9);
  const pa = colRange(10, 12);
  const sb = colRange(1, 12);

  const STEP_COUNT = 3;
  const STEP_H = Math.floor(480 / STEP_COUNT); // 160px each

  // Step marker dots + connecting line in col 1
  const markersHtml = steps.slice(0, STEP_COUNT).map((step, idx) => {
    const dotTop = 160 + idx * STEP_H + Math.floor(STEP_H / 2) - 20;
    return `
<div data-region="step_dot_${idx + 1}" class="ts-region" style="
  left:${sm.left}px; top:${dotTop}px; width:${sm.width}px; height:40px;
  display:flex; align-items:center; justify-content:center;
">
  <div style="
    width:32px; height:32px;
    border-radius:50%;
    background:var(--accent);
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head);
    font-size:var(--caption, 13px);
    color:#fff;
    font-weight:700;
    z-index:1;
    position:relative;
  ">${step.number ?? String(idx + 1)}</div>
</div>`;
  }).join('\n');

  // Vertical connecting line in col 1
  const lineTop = 160 + Math.floor(STEP_H / 2);
  const lineBottom = 160 + (STEP_COUNT - 1) * STEP_H + Math.floor(STEP_H / 2);
  const lineH = lineBottom - lineTop;
  const lineLeft = sm.left + Math.floor(sm.width / 2) - 1;

  const connectorHtml = `
<div data-region="step_connector" class="ts-region" style="
  left:${lineLeft}px; top:${lineTop}px; width:2px; height:${lineH}px;
  background:var(--accent);
  opacity:0.4;
"></div>`;

  // Step blocks in col 2-9
  const stepBlocksHtml = steps.slice(0, STEP_COUNT).map((step, idx) => {
    const blockTop = 160 + idx * STEP_H;
    const isLast = idx === STEP_COUNT - 1;
    return `
<div data-region="step_block_${idx + 1}" class="ts-region" style="
  left:${sbl.left}px; top:${blockTop}px; width:${sbl.width}px; height:${STEP_H}px;
  box-sizing:border-box; padding:16px 16px 12px 24px;
  border-bottom:${isLast ? 'none' : '1px solid var(--muted)'};
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="
    font-family:var(--font-head);
    font-size:var(--h3, 18px);
    color:var(--text);
    font-weight:700;
    line-height:1.3;
    margin-bottom:6px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${step.heading ?? ''}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--muted);
    line-height:1.6;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${step.body ?? ''}</div>
</div>`;
  }).join('\n');

  // Profile aside in col 10-12
  const ASIDE_PHOTO_H = 280;

  const profileAsideHtml = `
<div data-region="profile_aside" class="ts-region" style="
  left:${pa.left}px; top:160px; width:${pa.width}px; height:480px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  overflow:hidden;
  display:flex; flex-direction:column; align-items:center;
">
  <!-- photo placeholder -->
  <div style="
    width:100%; height:${ASIDE_PHOTO_H}px;
    background:var(--muted);
    opacity:0.35;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  ">
    <div style="
      font-family:var(--font-body);
      font-size:var(--caption, 13px);
      color:var(--bg, #fff);
      text-transform:uppercase;
      letter-spacing:0.12em;
      opacity:0.7;
    ">PHOTO</div>
  </div>
  <!-- name & role -->
  <div style="
    padding:16px 12px 8px;
    text-align:center;
    width:100%; box-sizing:border-box;
  ">
    <div style="
      font-family:var(--font-head);
      font-size:var(--h3, 18px);
      color:var(--text);
      font-weight:700;
      line-height:1.2;
      margin-bottom:6px;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${person.name ?? ''}</div>
    <div style="
      font-family:var(--font-body);
      font-size:var(--caption, 13px);
      color:var(--accent);
      font-weight:600;
      line-height:1.4;
      white-space:normal; overflow-wrap:break-word; word-break:keep-all;
    ">${person.role ?? ''}</div>
  </div>
</div>`;

  return `
<div data-region="action_title_bar" class="ts-region" style="
  left:${atb.left}px; top:56px; width:${atb.width}px; height:88px;
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

${connectorHtml}
${markersHtml}
${stepBlocksHtml}
${profileAsideHtml}

${source ? `<div data-region="source_note" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: speaker-card ─────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   name: string,
 *   furigana?: string,
 *   position: string,
 *   bio: string,
 *   contact_items: Array<{ label, value }>,   // 3-4 items
 *   source?: string
 * }
 *
 * Structure:
 *   action_title_bar  col 1-12  offset 56   height 88
 *   photo_hero        col 1-5   offset 160  height 480
 *   name_block        col 6-12  offset 160  height 120
 *   bio_block         col 6-12  offset 288  height 200
 *   contact_block     col 6-12  offset 496  height 144
 *   source_note       col 1-12  offset 640  height 24
 */
definePattern('speaker-card', (c) => {
  const title = c.title ?? '';
  const name = c.name ?? '';
  const furigana = c.furigana ?? '';
  const position = c.position ?? '';
  const bio = c.bio ?? '';
  const contactItems = c.contact_items ?? [];
  const source = c.source ?? '';

  const atb = colRange(1, 12);
  const ph = colRange(1, 5);
  const nb = colRange(6, 12);
  const bb = colRange(6, 12);
  const cb = colRange(6, 12);
  const sb = colRange(1, 12);

  const contactRowsHtml = contactItems.slice(0, 4).map((item, idx) => `
<div style="
  display:flex; align-items:flex-start; gap:12px;
  margin-bottom:${idx < contactItems.length - 1 ? '10px' : '0'};
">
  <div style="
    flex-shrink:0;
    min-width:80px;
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--accent);
    font-weight:600;
    letter-spacing:0.04em;
    white-space:nowrap;
  ">${item.label ?? ''}</div>
  <div style="
    flex:1; min-width:0;
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--text);
    line-height:1.5;
    white-space:normal; overflow-wrap:break-word; word-break:break-all;
  ">${item.value ?? ''}</div>
</div>`).join('\n');

  return `
<div data-region="action_title_bar" class="ts-region" style="
  left:${atb.left}px; top:56px; width:${atb.width}px; height:88px;
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

<div data-region="photo_hero" class="ts-region" style="
  left:${ph.left}px; top:160px; width:${ph.width}px; height:480px;
  background:var(--muted);
  opacity:0.35;
  border-radius:var(--radius, 8px);
  display:flex; align-items:center; justify-content:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--bg, #fff);
    text-transform:uppercase;
    letter-spacing:0.12em;
    opacity:0.7;
  ">PHOTO</div>
</div>

<div data-region="name_block" class="ts-region" style="
  left:${nb.left}px; top:160px; width:${nb.width}px; height:120px;
  box-sizing:border-box; padding:12px 16px;
  display:flex; flex-direction:column; justify-content:center;
">
  ${furigana ? `<div style="
    font-family:var(--font-body);
    font-size:var(--caption, 13px);
    color:var(--muted);
    letter-spacing:0.06em;
    margin-bottom:2px;
  ">${furigana}</div>` : ''}
  <div style="
    font-family:var(--font-head);
    font-size:var(--h1, 28px);
    color:var(--text);
    font-weight:700;
    line-height:1.15;
    margin-bottom:6px;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${name}</div>
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--accent);
    line-height:1.3;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${position}</div>
</div>

<div data-region="bio_block" class="ts-region" style="
  left:${bb.left}px; top:288px; width:${bb.width}px; height:200px;
  background:var(--surface);
  border-radius:var(--radius, 8px);
  box-sizing:border-box; padding:16px;
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="
    font-family:var(--font-body);
    font-size:var(--body, 14px);
    color:var(--text);
    line-height:1.7;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${bio}</div>
</div>

<div data-region="contact_block" class="ts-region" style="
  left:${cb.left}px; top:496px; width:${cb.width}px; height:144px;
  box-sizing:border-box; padding:16px 16px 8px;
  display:flex; flex-direction:column; justify-content:center;
">
  ${contactRowsHtml}
</div>

${source ? `<div data-region="source_note" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div class="ts-source" style="position:static;">${source}</div>
</div>` : ''}
`.trim();
});
