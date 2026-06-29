import { definePattern } from './registry.js';

/**
 * _swatch pattern
 *
 * Renders a row of 9 color chips (one per color token) and a type-scale row
 * showing display / h1 / h2 / body / caption samples.
 *
 * safe-area: x 72..1208, y 56..664 (width 1136, height 608)
 *
 * content keys (all optional, passed as hex strings for chip labels):
 *   primary, secondary, bg, surface, accent, text, muted, positive, negative
 */

definePattern('_swatch', (c) => {
  // ── Color chips ──────────────────────────────────────────────────────────
  const tokens = [
    { name: 'primary',   varName: '--primary'  },
    { name: 'secondary', varName: '--secondary' },
    { name: 'bg',        varName: '--bg'        },
    { name: 'surface',   varName: '--surface'   },
    { name: 'accent',    varName: '--accent'    },
    { name: 'text',      varName: '--text'      },
    { name: 'muted',     varName: '--muted'     },
    { name: 'positive',  varName: '--positive'  },
    { name: 'negative',  varName: '--negative'  },
  ];

  // Layout constants (within safe-area 72..1208, 56..664)
  const safeLeft  = 72;
  const safeTop   = 56;
  const safeW     = 1136; // 1208 - 72
  const chipW     = Math.floor(safeW / tokens.length); // ~126px
  const chipH     = 90;
  const labelH    = 32;
  const rowTop    = safeTop + 16;                        // small top margin

  // Type-scale row starts after chips + labels
  const typeTop   = rowTop + chipH + labelH + 24;

  // ── chip HTML ────────────────────────────────────────────────────────────
  const chipsHtml = tokens.map((tok, i) => {
    const x    = safeLeft + i * chipW;
    const hex  = c[tok.name] ?? '';
    const hexLabel = hex ? hex.toUpperCase() : tok.varName;

    // chip box
    const chip = `<div data-region="chip-${tok.name}" style="
      position:absolute;
      left:${x}px; top:${rowTop}px;
      width:${chipW - 4}px; height:${chipH}px;
      background:var(${tok.varName});
      border:1px solid rgba(128,128,128,0.25);
      box-sizing:border-box;
    "></div>`;

    // label box (token name + hex)
    const label = `<div data-region="label-${tok.name}" style="
      position:absolute;
      left:${x}px; top:${rowTop + chipH}px;
      width:${chipW - 4}px; height:${labelH}px;
      font-size:10px;
      line-height:1.3;
      color:var(--text);
      overflow:hidden;
      box-sizing:border-box;
    ">${tok.name}<br>${hexLabel}</div>`;

    return chip + label;
  }).join('\n');

  // ── type-scale samples ───────────────────────────────────────────────────
  // Each row: label on left (fixed 80px), sample text fills remainder
  const typeScales = [
    { role: 'display', size: 'var(--display)', font: 'var(--font-head)', label: 'display' },
    { role: 'h1',      size: 'var(--h1)',      font: 'var(--font-head)', label: 'h1'      },
    { role: 'h2',      size: 'var(--h2)',      font: 'var(--font-body)', label: 'h2'      },
    { role: 'body',    size: 'var(--body)',     font: 'var(--font-body)', label: 'body'    },
    { role: 'caption', size: 'var(--caption)', font: 'var(--font-body)', label: 'caption' },
  ];

  // Vertical budget: safeBottom (664) - typeTop
  const typeSectionH = 664 - typeTop;
  const typeRowH     = Math.floor(typeSectionH / typeScales.length);

  const typeHtml = typeScales.map((ts, i) => {
    const y = typeTop + i * typeRowH;

    // role label column
    const roleLabel = `<div data-region="typerole-${ts.role}" style="
      position:absolute;
      left:${safeLeft}px; top:${y}px;
      width:72px; height:${typeRowH}px;
      font-size:11px;
      color:var(--muted);
      display:flex; align-items:center;
    ">${ts.label}</div>`;

    // sample text
    const sample = `<div class="ts-title clip-guard" data-region="typesample-${ts.role}" style="
      position:absolute;
      left:${safeLeft + 76}px; top:${y}px;
      width:${safeW - 76}px; height:${typeRowH}px;
      font-family:${ts.font};
      font-size:${ts.size};
      color:var(--text);
      overflow:hidden;
      white-space:nowrap;
      display:flex; align-items:center;
    ">Aa あいう 123</div>`;

    return roleLabel + sample;
  }).join('\n');

  // ── section title ────────────────────────────────────────────────────────
  const title = `<div class="ts-title clip-guard" style="
    position:absolute;
    left:${safeLeft}px; top:${safeTop}px;
    width:${safeW}px; height:16px;
    font-size:11px;
    color:var(--muted);
    letter-spacing:0.08em;
    text-transform:uppercase;
  ">Color Tokens</div>`;

  return title + chipsHtml + typeHtml;
});
