/**
 * cx-ux.js — CX/UX パターン群
 *
 * Patterns: customer-journey-horizontal, persona-card, empathy-map,
 *           user-flow-swimlane, service-blueprint
 *
 * Theme: modern-tech
 *
 * Grid constants (safe-area x 72..1208, y 56..664):
 *   COL_UNIT = 96.6667  (column width + gutter)
 *   colX(n)  = 72 + (n-1) * 96.6667
 *   colW(n)  = n * 96.6667 - 24
 *
 * All vertical_offset_px and row_height_px taken directly from
 * references/layouts/layout-cx-ux.md.
 */

import { definePattern } from './registry.js';

// ── Grid helpers ──────────────────────────────────────────────────────────────
const COL_UNIT = 96.6667;
const SAFE_LEFT = 72;

function colX(n) { return SAFE_LEFT + (n - 1) * COL_UNIT; }
function colW(n) { return n * COL_UNIT - 24; }
function colRange(s, e) {
  return { left: Math.round(colX(s)), width: Math.round(colW(e - s + 1)) };
}

// ── Shared title region (action title bar) ─────────────────────────────────────
function titleBar(text, { top = 56, height = 64 } = {}) {
  const r = colRange(1, 12);
  return `<div data-region="action_title_bar" class="ts-region" style="
  left:${r.left}px; top:${top}px; width:${r.width}px; height:${height}px;
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

// ── Shared source note ────────────────────────────────────────────────────────
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

// ── Pattern: customer-journey-horizontal ────────────────────────────────────────
/**
 * content: {
 *   title:   string,
 *   phases:  Array<{ label, emotion, touchpoints: string[], painpoints: string[], solutions: string[] }>,  // 5 phases
 *   source?: string
 * }
 *
 * Layout (layout-cx-ux.md):
 *   action_title_bar   col 1-12  offset 56   height 72
 *   phase_header_row    col 1-12  offset 144  height 48   (mid-gray)
 *   emotion_curve_area  col 1-12  offset 208  height 160
 *   touchpoint_row      col 1-12  offset 384  height 80   (light-gray)
 *   painpoint_row       col 1-12  offset 480  height 80
 *   solution_row        col 1-12  offset 576  height 64   (light-gray)
 *   source_bar          col 1-12  offset 656  height 24
 *
 * emotion: -2..2 (negative..positive), drives the emotion curve polyline.
 */
definePattern('customer-journey-horizontal', (c) => {
  const title  = c.title  ?? '';
  const phases = (c.phases ?? []).slice(0, 5);
  const source = c.source ?? '';
  const full = colRange(1, 12);
  const n = Math.max(phases.length, 1);
  const colWpx = full.width / n;

  const phaseHeader = `<div data-region="phase_header_row" class="ts-region" style="
  left:${full.left}px; top:144px; width:${full.width}px; height:48px;
  background:var(--surface);
  display:flex;
">
  ${phases.map((p, i) => `<div style="
    flex:1; display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head); font-size:var(--body); font-weight:700; color:var(--text);
    border-left:${i === 0 ? 'none' : '1px solid var(--bg)'};
    white-space:normal; overflow-wrap:break-word;
  ">${esc(p.label)}</div>`).join('')}
</div>`;

  // ── emotion curve (SVG polyline, -2..2 mapped to y within 160px area) ──────
  const EMO_H = 160;
  const EMO_PAD_Y = 24;
  const plotH = EMO_H - EMO_PAD_Y * 2;
  const pts = phases.map((p, i) => {
    const emo = Math.max(-2, Math.min(2, Number(p.emotion ?? 0)));
    const x = (i + 0.5) * colWpx;
    const y = EMO_PAD_Y + plotH / 2 - (emo / 2) * (plotH / 2);
    return { x, y, emo };
  });
  const polyPoints = pts.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join(' ');
  const dots = pts.map(p => {
    const cls = p.emo >= 0.5 ? 'ts-chart-pos' : p.emo <= -0.5 ? 'ts-chart-neg' : 'ts-chart-series-1';
    return `<circle class="${cls}" cx="${Math.round(p.x)}" cy="${Math.round(p.y)}" r="6"/>`;
  }).join('');
  const emotionCurve = `<div data-region="emotion_curve_area" class="ts-region" style="
  left:${full.left}px; top:208px; width:${full.width}px; height:${EMO_H}px;
">
  <svg viewBox="0 0 ${full.width} ${EMO_H}" width="${full.width}" height="${EMO_H}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <line x1="0" y1="${EMO_PAD_Y + plotH / 2}" x2="${full.width}" y2="${EMO_PAD_Y + plotH / 2}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>
    <polyline points="${polyPoints}" fill="none" class="ts-chart-series-1" stroke-width="2.5"/>
    ${dots}
  </svg>
</div>`;

  function stripeRow(id, top, height, fill, field) {
    return `<div data-region="${id}" class="ts-region" style="
  left:${full.left}px; top:${top}px; width:${full.width}px; height:${height}px;
  ${fill ? 'background:var(--surface);' : ''}
  display:flex;
">
  ${phases.map((p, i) => `<div style="
    flex:1; box-sizing:border-box; padding:8px 12px;
    border-left:${i === 0 ? 'none' : '1px solid var(--bg)'};
    font-family:var(--font-body); font-size:12px; color:var(--text); line-height:1.4;
    white-space:normal; overflow-wrap:break-word;
  ">${(p[field] ?? []).map(t => `<div>・${esc(t)}</div>`).join('')}</div>`).join('')}
</div>`;
  }

  return `
${titleBar(title, { height: 72 })}
${phaseHeader}
${emotionCurve}
${stripeRow('touchpoint_row', 384, 80, true, 'touchpoints')}
${stripeRow('painpoint_row', 480, 80, false, 'painpoints')}
${stripeRow('solution_row', 576, 64, true, 'solutions')}
${sourceNote(source, { top: 656 })}
`.trim();
});

// ── Pattern: persona-card ───────────────────────────────────────────────────────
/**
 * content: {
 *   title:      string,
 *   name:       string,
 *   attributes: Array<{ label, value }>,   // 3-5
 *   goals:      string[],                  // 2-4
 *   painpoints: string[],                  // 2-3
 *   quote:      string,
 *   source?:    string
 * }
 *
 * Layout:
 *   action_title_bar    col 1-12  offset 56   height 64
 *   photo_placeholder    col 1-4   offset 136  height 456  (light-gray)
 *   persona_name_role    col 5-12  offset 136  height 88
 *   attributes_row       col 5-12  offset 240  height 80   (light-gray)
 *   goals_area           col 5-12  offset 336  height 112
 *   painpoints_area      col 5-8   offset 464  height 112
 *   quote_area           col 9-12  offset 464  height 112  (light-gray)
 *   source_bar           col 1-12  offset 616  height 24
 */
definePattern('persona-card', (c) => {
  const title      = c.title      ?? '';
  const name       = c.name       ?? '';
  const attributes = c.attributes ?? [];
  const goals      = c.goals      ?? [];
  const painpoints = c.painpoints ?? [];
  const quote      = c.quote      ?? '';
  const source     = c.source     ?? '';

  const photoR   = colRange(1, 4);
  const rightR   = colRange(5, 12);
  const painR    = colRange(5, 8);
  const quoteR   = colRange(9, 12);

  const photo = `<div data-region="photo_placeholder" class="ts-region" style="
  left:${photoR.left}px; top:136px; width:${photoR.width}px; height:456px;
  background:var(--surface);
  border-radius:var(--radius);
  display:flex; align-items:center; justify-content:center;
">
  <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.2" opacity="0.6">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
  </svg>
</div>`;

  const nameRole = `<div data-region="persona_name_role" class="ts-region" style="
  left:${rightR.left}px; top:136px; width:${rightR.width}px; height:88px;
  display:flex; flex-direction:column; justify-content:center;
">
  <div style="font-family:var(--font-head);font-size:var(--display);font-weight:700;color:var(--text);line-height:1.1;">${esc(name)}</div>
</div>`;

  const attrRow = `<div data-region="attributes_row" class="ts-region" style="
  left:${rightR.left}px; top:240px; width:${rightR.width}px; height:80px;
  background:var(--surface);
  display:flex; align-items:center; gap:16px; flex-wrap:wrap;
  box-sizing:border-box; padding:0 20px;
  border-radius:var(--radius);
">
  ${attributes.slice(0, 5).map(a => `<div style="
    font-family:var(--font-body); font-size:13px; color:var(--muted);
  ">${esc(a.label)}: <span style="color:var(--text);font-weight:600;">${esc(a.value)}</span></div>`).join('')}
</div>`;

  const goalsArea = `<div data-region="goals_area" class="ts-region" style="
  left:${rightR.left}px; top:336px; width:${rightR.width}px; height:112px;
">
  <div style="font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--primary);letter-spacing:0.08em;margin-bottom:8px;">GOALS</div>
  ${goals.slice(0, 4).map(g => `<div style="font-family:var(--font-body);font-size:var(--body);color:var(--text);line-height:1.5;">・${esc(g)}</div>`).join('')}
</div>`;

  const painArea = `<div data-region="painpoints_area" class="ts-region" style="
  left:${painR.left}px; top:464px; width:${painR.width}px; height:112px;
">
  <div style="font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--negative);letter-spacing:0.08em;margin-bottom:8px;">PAIN POINTS</div>
  ${painpoints.slice(0, 3).map(p => `<div style="font-family:var(--font-body);font-size:14px;color:var(--text);line-height:1.5;">・${esc(p)}</div>`).join('')}
</div>`;

  const quoteArea = `<div data-region="quote_area" class="ts-region" style="
  left:${quoteR.left}px; top:464px; width:${quoteR.width}px; height:112px;
  background:var(--surface);
  border-radius:var(--radius);
  box-sizing:border-box; padding:14px 16px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:13px;font-style:italic;color:var(--text);line-height:1.5;white-space:normal;overflow-wrap:break-word;">“${esc(quote)}”</div>
</div>`;

  return `
${titleBar(title, { height: 64 })}
${photo}
${nameRole}
${attrRow}
${goalsArea}
${painArea}
${quoteArea}
${sourceNote(source, { top: 616 })}
`.trim();
});

// ── Pattern: empathy-map ────────────────────────────────────────────────────────
/**
 * content: {
 *   title:   string,
 *   persona: string,
 *   think_feel: string[],   // 3-4
 *   say:        string[],   // 3-4
 *   hear:       string[],   // 3-4
 *   do:         string[],   // 3-4
 *   source?: string
 * }
 *
 * Layout:
 *   action_title_bar     col 1-12  offset 56   height 64
 *   quadrant_think_feel  col 1-6   offset 136  height 224
 *   quadrant_say_do_top  col 7-12  offset 136  height 224  (light-gray, label SAY)
 *   persona_center       col 5-8   offset 336  height 56   (mid-gray)
 *   quadrant_hear        col 1-6   offset 376  height 224  (light-gray)
 *   quadrant_do          col 7-12  offset 376  height 224
 *   source_bar           col 1-12  offset 632  height 24
 */
definePattern('empathy-map', (c) => {
  const title     = c.title      ?? '';
  const persona   = c.persona    ?? '';
  const thinkFeel = c.think_feel ?? [];
  const say       = c.say        ?? [];
  const hear      = c.hear       ?? [];
  const doItems   = c.do         ?? [];
  const source    = c.source     ?? '';

  const leftR   = colRange(1, 6);
  const rightR  = colRange(7, 12);
  const centerR = colRange(5, 8);

  function quadrant(id, top, region, label, items, fill) {
    return `<div data-region="${id}" class="ts-region" style="
  left:${region.left}px; top:${top}px; width:${region.width}px; height:224px;
  ${fill ? 'background:var(--surface);' : ''}
  box-sizing:border-box; padding:16px 20px;
">
  <div style="font-family:var(--font-head);font-size:13px;font-weight:700;color:var(--primary);letter-spacing:0.1em;margin-bottom:10px;">${label}</div>
  ${items.slice(0, 4).map(t => `<div style="font-family:var(--font-body);font-size:14px;color:var(--text);line-height:1.6;">・${esc(t)}</div>`).join('')}
</div>`;
  }

  const divider = `<div data-region="divider_horizontal" class="ts-region" style="
  left:${colRange(1,12).left}px; top:368px; width:${colRange(1,12).width}px; height:8px;
  background:var(--bg);
  border-top:1px solid var(--surface);
"></div>`;

  const center = `<div data-region="persona_center" class="ts-region" style="
  left:${centerR.left}px; top:336px; width:${centerR.width}px; height:56px;
  background:var(--primary);
  border-radius:var(--radius);
  display:flex; align-items:center; justify-content:center;
  z-index:2;
">
  <div style="font-family:var(--font-head);font-size:var(--body);font-weight:700;color:#fff;">${esc(persona)}</div>
</div>`;

  return `
${titleBar(title, { height: 64 })}
${quadrant('quadrant_think_feel', 136, leftR, 'THINK & FEEL', thinkFeel, false)}
${quadrant('quadrant_say_do_top', 136, rightR, 'SAY', say, true)}
${divider}
${center}
${quadrant('quadrant_hear', 376, leftR, 'HEAR', hear, true)}
${quadrant('quadrant_do', 376, rightR, 'DO', doItems, false)}
${sourceNote(source, { top: 632 })}
`.trim();
});

// ── Pattern: user-flow-swimlane ─────────────────────────────────────────────────
/**
 * content: {
 *   title:   string,
 *   steps:   string[],                                    // 4-5 step labels
 *   user:    string[],                                     // one per step
 *   system:  string[],                                     // one per step
 *   backend: string[],                                     // one per step
 *   source?: string
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 64
 *   step_header_row   col 3-12  offset 136  height 48   (mid-gray)
 *   lane_label_col    col 1-2   offset 136  height 472  (light-gray)
 *   lane_user         col 3-12  offset 200  height 152
 *   lane_system       col 3-12  offset 376  height 152  (light-gray)
 *   lane_backend      col 3-12  offset 552  height 64
 *   source_bar        col 1-12  offset 640  height 24
 */
definePattern('user-flow-swimlane', (c) => {
  const title   = c.title   ?? '';
  const steps   = (c.steps   ?? []).slice(0, 5);
  const user    = c.user    ?? [];
  const system  = c.system  ?? [];
  const backend = c.backend ?? [];
  const source  = c.source  ?? '';

  const labelR = colRange(1, 2);
  const mainR  = colRange(3, 12);
  const n = Math.max(steps.length, 1);
  const stepW = mainR.width / n;

  const stepHeader = `<div data-region="step_header_row" class="ts-region" style="
  left:${mainR.left}px; top:136px; width:${mainR.width}px; height:48px;
  background:var(--surface);
  display:flex;
">
  ${steps.map((s, i) => `<div style="
    flex:1; display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head); font-size:13px; font-weight:700; color:var(--text);
    border-left:${i === 0 ? 'none' : '1px solid var(--bg)'};
    white-space:normal; overflow-wrap:break-word;
  ">${esc(s)}</div>`).join('')}
</div>`;

  const laneLabelCol = `<div data-region="lane_label_col" class="ts-region" style="
  left:${labelR.left}px; top:136px; width:${labelR.width}px; height:472px;
  background:var(--surface);
  display:flex; flex-direction:column;
">
  ${[['ユーザー',152],['システム',152],['バックエンド',64]].map(([label,h]) => `<div style="
    flex:0 0 ${h}px; display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head); font-size:12px; font-weight:700; color:var(--muted);
    writing-mode:vertical-rl; text-orientation:mixed;
  ">${label}</div>`).join('')}
</div>`;

  function lane(id, top, height, items, fill) {
    return `<div data-region="${id}" class="ts-region" style="
  left:${mainR.left}px; top:${top}px; width:${mainR.width}px; height:${height}px;
  ${fill ? 'background:var(--surface);' : ''}
  display:flex;
">
  ${steps.map((s, i) => {
    const text = items[i] ?? '';
    const arrow = i < steps.length - 1 && text
      ? `<svg width="16" height="12" viewBox="0 0 16 12" style="position:absolute;right:-8px;top:calc(50% - 6px);z-index:1;"><polygon points="0,0 16,6 0,12" fill="var(--muted)"/></svg>`
      : '';
    return `<div style="
      flex:1; position:relative; box-sizing:border-box; padding:10px 12px;
      border-left:${i === 0 ? 'none' : '1px solid var(--bg)'};
    ">
      ${text ? `<div style="
        background:var(--bg); border:1px solid var(--muted); border-radius:var(--radius);
        padding:8px 10px; font-family:var(--font-body); font-size:12px; color:var(--text);
        line-height:1.4; white-space:normal; overflow-wrap:break-word; height:100%; box-sizing:border-box;
      ">${esc(text)}</div>` : ''}
      ${arrow}
    </div>`;
  }).join('')}
</div>`;
  }

  return `
${titleBar(title, { height: 64 })}
${stepHeader}
${laneLabelCol}
${lane('lane_user', 200, 152, user, false)}
${lane('lane_system', 376, 152, system, true)}
${lane('lane_backend', 552, 64, backend, false)}
${sourceNote(source, { top: 640 })}
`.trim();
});

// ── Pattern: service-blueprint ───────────────────────────────────────────────────
/**
 * content: {
 *   title:      string,
 *   steps:      string[],    // 4-5 step labels
 *   customer:   string[],    // one per step
 *   frontstage: string[],    // one per step
 *   backstage:  string[],    // one per step
 *   support:    string[],    // one per step
 *   source?:    string
 * }
 *
 * Layout:
 *   action_title_bar  col 1-12  offset 56   height 64
 *   step_header_row   col 2-12  offset 136  height 40  (mid-gray)
 *   layer_label_col   col 1-1   offset 136  height 480 (light-gray)
 *   layer_customer    col 2-12  offset 192  height 96
 *   layer_frontstage  col 2-12  offset 296  height 120 (light-gray)
 *   visibility_line   col 1-12  offset 424  height 8   (dark-gray)
 *   layer_backstage   col 2-12  offset 464  height 96
 *   layer_support     col 2-12  offset 568  height 80  (light-gray)
 *   source_bar        col 1-12  offset 656  height 24
 */
definePattern('service-blueprint', (c) => {
  const title      = c.title      ?? '';
  const steps      = (c.steps      ?? []).slice(0, 5);
  const customer   = c.customer   ?? [];
  const frontstage = c.frontstage ?? [];
  const backstage  = c.backstage  ?? [];
  const support     = c.support    ?? [];
  const source     = c.source     ?? '';

  const labelR = colRange(1, 1);
  const mainR  = colRange(2, 12);
  const n = Math.max(steps.length, 1);

  const stepHeader = `<div data-region="step_header_row" class="ts-region" style="
  left:${mainR.left}px; top:136px; width:${mainR.width}px; height:40px;
  background:var(--surface);
  display:flex;
">
  ${steps.map((s, i) => `<div style="
    flex:1; display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head); font-size:12px; font-weight:700; color:var(--text);
    border-left:${i === 0 ? 'none' : '1px solid var(--bg)'};
    white-space:normal; overflow-wrap:break-word;
  ">${esc(s)}</div>`).join('')}
</div>`;

  const layerLabelCol = `<div data-region="layer_label_col" class="ts-region" style="
  left:${labelR.left}px; top:136px; width:${labelR.width}px; height:480px;
  background:var(--surface);
  display:flex; flex-direction:column;
">
  ${[['顧客行動',56,96],['フロント',160,120],['バック',288,96],['サポート',384,80]].map(([label]) => `<div style="
    flex:1; display:flex; align-items:center; justify-content:center;
    font-family:var(--font-head); font-size:10px; font-weight:700; color:var(--muted);
    writing-mode:vertical-rl; text-orientation:mixed; border-top:1px solid var(--bg);
  ">${label}</div>`).join('')}
</div>`;

  function layer(id, top, height, items, fill) {
    return `<div data-region="${id}" class="ts-region" style="
  left:${mainR.left}px; top:${top}px; width:${mainR.width}px; height:${height}px;
  ${fill ? 'background:var(--surface);' : ''}
  display:flex;
">
  ${steps.map((s, i) => `<div style="
    flex:1; box-sizing:border-box; padding:8px 10px;
    border-left:${i === 0 ? 'none' : '1px solid var(--bg)'};
    font-family:var(--font-body); font-size:12px; color:var(--text); line-height:1.4;
    display:flex; align-items:center;
    white-space:normal; overflow-wrap:break-word;
  ">${esc(items[i] ?? '')}</div>`).join('')}
</div>`;
  }

  const visLine = `<div data-region="visibility_line" class="ts-region" style="
  left:${colRange(1,12).left}px; top:424px; width:${colRange(1,12).width}px; height:8px;
  background:var(--muted);
"></div>
<div data-region="visibility_label" class="ts-region" style="
  left:${mainR.left}px; top:432px; width:${mainR.width}px; height:24px;
  display:flex; align-items:center;
">
  <div style="font-family:var(--font-body);font-size:11px;color:var(--muted);letter-spacing:0.06em;">↑ 可視性の線（Line of Visibility）— 上=顧客に見える／下=見えない</div>
</div>`;

  return `
${titleBar(title, { height: 64 })}
${stepHeader}
${layerLabelCol}
${layer('layer_customer', 192, 96, customer, false)}
${layer('layer_frontstage', 296, 120, frontstage, true)}
${visLine}
${layer('layer_backstage', 464, 96, backstage, false)}
${layer('layer_support', 568, 80, support, true)}
${sourceNote(source, { top: 656 })}
`.trim();
});
