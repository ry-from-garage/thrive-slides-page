/**
 * card-grid.js — カードグリッドパターン群
 *
 * Patterns:
 *   cards-2x2               4 cards / 2-row × 2-col
 *   cards-2x3               6 cards / 2-row × 3-col
 *   cards-2x4               8 cards / 2-row × 4-col
 *   three-col-icon-card     3 tall cards with icon area (1 row)
 *   three-card-icon-subheading  3 tall cards with section divider + numbered banner
 *   two-column-split-boxes  2 wide boxes, compare / contrast
 *   feature-metrics-cells   4 cards with feature desc + KPI metrics (1 row)
 *
 * Theme: vibrant-pitch (white bg, electric purple #6600FF, accent #FF6000)
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   cardGrid(n, items, {top, height}) computes equal-width columns.
 *   For col-range helpers we still use the same COL_UNIT = 96.6667 formula.
 */

import { definePattern } from './registry.js';
import { cardGrid } from '../components/card-grid.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667; // column width + gutter (12-col, 1136px wide, 24px gutter)
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

// ── Shared badge helper ───────────────────────────────────────────────────────
function badge(num) {
  return `<span style="
    display:inline-block;
    background:var(--primary);
    color:#fff;
    font-family:var(--font-head);
    font-size:11px;
    font-weight:700;
    line-height:1;
    padding:3px 7px;
    border-radius:4px;
    letter-spacing:0.04em;
    margin-bottom:8px;
  ">${num}</span>`;
}

// ── Pattern: cards-2x2 ────────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   cards: Array<{ number, heading, body }>,  // 4 items
 *   source?: string
 * }
 *
 * Layout (layout-card-grid.md):
 *   title_bar   col 1-12  offset 56   height 80
 *   row1 cards  2 cols    offset 152  height 224
 *   row2 cards  2 cols    offset 400  height 224
 *   source_bar  col 1-12  offset 640  height 24
 */
definePattern('cards-2x2', (c) => {
  const title = c.title ?? '';
  const cards = c.cards ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const sb = colRange(1, 12);

  // card inner HTML builder
  function cardInner(item) {
    return `<div style="padding:20px 18px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;">
      ${badge(item.number ?? '01')}
      <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:8px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.6;white-space:normal;overflow-wrap:break-word;">${item.body ?? ''}</div>
    </div>`;
  }

  const row1Items = [cards[0], cards[1]].map(item => cardInner(item ?? {}));
  const row2Items = [cards[2], cards[3]].map(item => cardInner(item ?? {}));

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${cardGrid(2, row1Items, { top: 152, height: 224 })}
${cardGrid(2, row2Items, { top: 400, height: 224 })}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: cards-2x3 ────────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   cards: Array<{ number, heading, body }>,  // 6 items
 *   source?: string
 * }
 *
 * Layout:
 *   title_bar  offset 56   height 80
 *   row1 (3)   offset 152  height 224
 *   row2 (3)   offset 400  height 224
 *   source_bar offset 640  height 24
 */
definePattern('cards-2x3', (c) => {
  const title = c.title ?? '';
  const cards = c.cards ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const sb = colRange(1, 12);

  function cardInner(item) {
    return `<div style="padding:18px 16px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;">
      ${badge(item.number ?? '01')}
      <div style="font-family:var(--font-head);font-size:20px;font-weight:700;color:var(--text);line-height:1.3;margin-bottom:8px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.6;white-space:normal;overflow-wrap:break-word;">${item.body ?? ''}</div>
    </div>`;
  }

  const row1Items = [cards[0], cards[1], cards[2]].map(item => cardInner(item ?? {}));
  const row2Items = [cards[3], cards[4], cards[5]].map(item => cardInner(item ?? {}));

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${cardGrid(3, row1Items, { top: 152, height: 224 })}
${cardGrid(3, row2Items, { top: 400, height: 224 })}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: cards-2x4 ────────────────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   cards: Array<{ number, heading, body }>,  // 8 items
 *   source?: string
 * }
 *
 * Layout:
 *   title_bar  offset 56   height 80
 *   row1 (4)   offset 152  height 224
 *   row2 (4)   offset 400  height 224
 *   source_bar offset 640  height 24
 */
definePattern('cards-2x4', (c) => {
  const title = c.title ?? '';
  const cards = c.cards ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const sb = colRange(1, 12);

  function cardInner(item) {
    return `<div style="padding:14px 12px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;">
      ${badge(item.number ?? '01')}
      <div style="font-family:var(--font-head);font-size:17px;font-weight:700;color:var(--text);line-height:1.3;margin-bottom:6px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1.55;white-space:normal;overflow-wrap:break-word;">${item.body ?? ''}</div>
    </div>`;
  }

  const row1Items = [cards[0], cards[1], cards[2], cards[3]].map(item => cardInner(item ?? {}));
  const row2Items = [cards[4], cards[5], cards[6], cards[7]].map(item => cardInner(item ?? {}));

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${cardGrid(4, row1Items, { top: 152, height: 224 })}
${cardGrid(4, row2Items, { top: 400, height: 224 })}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: three-col-icon-card ─────────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   cards: Array<{ icon_label?, heading, body, cta? }>,  // 3 items
 *   source?: string
 * }
 *
 * Layout:
 *   title_bar    col 1-12  offset 56   height 80
 *   lead_text    col 1-12  offset 152  height 32
 *   3 tall cards (3-col)   offset 208  height 432
 *   source_bar   col 1-12  offset 640  height 24
 */
definePattern('three-col-icon-card', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const cards = c.cards ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const lt = colRange(1, 12);
  const sb = colRange(1, 12);

  function cardInner(item) {
    const iconLabel = item.icon_label ?? '';
    const ctaHtml = item.cta
      ? `<div style="margin-top:auto;padding-top:12px;">
           <div style="display:inline-block;background:var(--surface);border:1px solid var(--primary);color:var(--primary);font-family:var(--font-body);font-size:13px;font-weight:700;padding:6px 14px;border-radius:var(--radius);">${item.cta}</div>
         </div>`
      : '';

    return `<div style="padding:24px 20px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;align-items:center;text-align:center;">
      <div style="width:64px;height:64px;border:2px solid var(--primary);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;flex-shrink:0;font-size:28px;">${iconLabel || '◆'}</div>
      <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:10px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.65;white-space:normal;overflow-wrap:break-word;flex:1;">${item.body ?? ''}</div>
      ${ctaHtml}
    </div>`;
  }

  const cardItems = [cards[0], cards[1], cards[2]].map(item => cardInner(item ?? {}));

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${lead ? `<div data-region="lead_text" class="ts-region" style="
  left:${lt.left}px; top:152px; width:${lt.width}px; height:32px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);white-space:normal;overflow-wrap:break-word;">${lead}</div>
</div>` : ''}

${cardGrid(3, cardItems, { top: 208, height: 432 })}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: three-card-icon-subheading ──────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   section_label: string,  // divider heading text (e.g. "3つの強み")
 *   cards: Array<{ number, icon_label?, heading, body }>,  // 3 items
 *   source?: string
 * }
 *
 * Layout:
 *   title_bar       col 1-12  offset 56   height 80
 *   section_divider col 1-12  offset 152  height 32
 *   3 tall cards (3-col)      offset 208  height 432
 *   source_bar      col 1-12  offset 640  height 24
 */
definePattern('three-card-icon-subheading', (c) => {
  const title = c.title ?? '';
  const sectionLabel = c.section_label ?? '';
  const cards = c.cards ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const sd = colRange(1, 12);
  const sb = colRange(1, 12);

  function cardInner(item) {
    const num = item.number ?? '01';
    const iconLabel = item.icon_label ?? '';
    return `<div style="display:flex;flex-direction:column;height:100%;">
      <!-- Number banner -->
      <div style="background:var(--primary);height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:var(--radius) var(--radius) 0 0;">
        <span style="font-family:var(--font-head);font-size:14px;font-weight:700;color:#fff;letter-spacing:0.08em;">${num}</span>
      </div>
      <!-- Card body -->
      <div style="flex:1;padding:20px 18px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;text-align:center;">
        <div style="width:56px;height:56px;border:2px solid var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:14px;flex-shrink:0;font-size:24px;">${iconLabel || '◆'}</div>
        <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:10px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
        <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.65;white-space:normal;overflow-wrap:break-word;">${item.body ?? ''}</div>
      </div>
    </div>`;
  }

  const cardItems = [cards[0], cards[1], cards[2]].map(item => cardInner(item ?? {}));

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

<div data-region="section_divider" class="ts-region" style="
  left:${sd.left}px; top:152px; width:${sd.width}px; height:32px;
  display:flex; align-items:center; gap:16px;
">
  <div style="flex:1;height:1px;background:var(--muted);opacity:0.4;"></div>
  <div style="font-family:var(--font-head);font-size:14px;font-weight:700;color:var(--muted);letter-spacing:0.1em;white-space:nowrap;">${sectionLabel}</div>
  <div style="flex:1;height:1px;background:var(--muted);opacity:0.4;"></div>
</div>

${cardGrid(3, cardItems, { top: 208, height: 432 })}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: two-column-split-boxes ──────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   left: { heading, body },
 *   right: { heading, body },
 *   connector?: string,   // symbol or short label in center (e.g. "→")
 *   source?: string
 * }
 *
 * Layout:
 *   title_bar  col 1-12  offset 56   height 80
 *   lead_text  col 1-12  offset 152  height 32
 *   box_left   col 1-6   offset 208  height 432
 *   box_right  col 7-12  offset 208  height 432
 *   connector  col 5-8   offset 384  height 80    (overlay)
 *   source_bar col 1-12  offset 640  height 24
 */
definePattern('two-column-split-boxes', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const left = c.left ?? {};
  const right = c.right ?? {};
  const connector = c.connector ?? '';
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const lt = colRange(1, 12);
  const blr = colRange(1, 6);
  const brr = colRange(7, 12);
  const cr = colRange(5, 8);
  const sb = colRange(1, 12);

  // For the two boxes we use cardGrid to get perfectly equal columns
  function boxInner(item) {
    return `<div style="padding:28px 24px;box-sizing:border-box;height:100%;display:flex;flex-direction:column;">
      <div style="font-family:var(--font-head);font-size:var(--h2);font-weight:700;color:var(--text);line-height:1.3;margin-bottom:14px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);line-height:1.7;white-space:normal;overflow-wrap:break-word;">${item.body ?? ''}</div>
    </div>`;
  }

  const boxItems = [left, right].map(item => boxInner(item));

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${lead ? `<div data-region="lead_text" class="ts-region" style="
  left:${lt.left}px; top:152px; width:${lt.width}px; height:32px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);white-space:normal;overflow-wrap:break-word;">${lead}</div>
</div>` : ''}

${cardGrid(2, boxItems, { top: 208, height: 432 })}

${connector ? `<div data-region="connector" class="ts-region" style="
  left:${cr.left}px; top:384px; width:${cr.width}px; height:80px;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
  z-index:10;
">
  <div style="
    background:var(--surface);
    border:2px solid var(--primary);
    border-radius:50%;
    width:56px; height:56px;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head); font-size:22px; font-weight:700;
    color:var(--primary);
  ">${connector}</div>
</div>` : ''}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>` : ''}
`.trim();
});

// ── Pattern: feature-metrics-cells ───────────────────────────────────────────
/**
 * content: {
 *   title: string,
 *   lead?: string,
 *   cards: Array<{ number, icon_label?, heading, body, metrics: Array<{label, value}> }>,  // 4
 *   source?: string
 * }
 *
 * Layout:
 *   title_bar  col 1-12  offset 56   height 80
 *   lead_text  col 1-12  offset 152  height 32
 *   4 tall cards (4-col)  offset 208  height 432
 *   source_bar col 1-12  offset 640  height 24
 */
definePattern('feature-metrics-cells', (c) => {
  const title = c.title ?? '';
  const lead = c.lead ?? '';
  const cards = c.cards ?? [];
  const source = c.source ?? '';

  const tb = colRange(1, 12);
  const lt = colRange(1, 12);
  const sb = colRange(1, 12);

  function cardInner(item) {
    const num = item.number ?? '01';
    const iconLabel = item.icon_label ?? '';
    const metrics = item.metrics ?? [];
    const metricsHtml = metrics.map(m => `
      <div style="margin-bottom:8px;">
        <div style="font-family:var(--font-body);font-size:12px;color:var(--muted);line-height:1.3;">${m.label ?? ''}</div>
        <div style="font-family:var(--font-head);font-size:20px;font-weight:700;color:var(--primary);line-height:1.2;">${m.value ?? ''}</div>
      </div>`).join('');

    return `<div style="display:flex;flex-direction:column;height:100%;padding:16px 14px;box-sizing:border-box;">
      <!-- Header zone -->
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;">
        <span style="
          display:inline-block;
          background:var(--primary);
          color:#fff;
          font-family:var(--font-head);
          font-size:10px;
          font-weight:700;
          padding:2px 6px;
          border-radius:3px;
          flex-shrink:0;
          margin-top:2px;
        ">${num}</span>
        ${iconLabel ? `<div style="width:36px;height:36px;border:2px solid var(--primary);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">${iconLabel}</div>` : ''}
      </div>
      <div style="font-family:var(--font-head);font-size:17px;font-weight:700;color:var(--text);line-height:1.3;margin-bottom:6px;white-space:normal;overflow-wrap:break-word;">${item.heading ?? ''}</div>
      <div style="font-family:var(--font-body);font-size:14px;color:var(--muted);line-height:1.55;white-space:normal;overflow-wrap:break-word;margin-bottom:12px;">${item.body ?? ''}</div>
      <!-- Metrics zone -->
      <div style="margin-top:auto;border-top:1px solid var(--surface);padding-top:10px;">
        ${metricsHtml}
      </div>
    </div>`;
  }

  const cardItems = [cards[0], cards[1], cards[2], cards[3]].map(item => cardInner(item ?? {}));

  return `
<div data-region="title_bar" class="ts-region" style="
  left:${tb.left}px; top:56px; width:${tb.width}px; height:80px;
  display:flex; align-items:center;
">
  <div class="ts-title clip-guard" style="
    position:static; width:100%;
    font-family:var(--font-head); font-size:var(--h1); font-weight:700;
    color:var(--text); line-height:1.2;
    white-space:normal; overflow-wrap:break-word; word-break:keep-all;
  ">${title}</div>
</div>

${lead ? `<div data-region="lead_text" class="ts-region" style="
  left:${lt.left}px; top:152px; width:${lt.width}px; height:32px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--body);color:var(--muted);white-space:normal;overflow-wrap:break-word;">${lead}</div>
</div>` : ''}

${cardGrid(4, cardItems, { top: 208, height: 432 })}

${source ? `<div data-region="source_bar" class="ts-region" style="
  left:${sb.left}px; top:640px; width:${sb.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:var(--caption);color:var(--muted);">${source}</div>
</div>` : ''}
`.trim();
});
