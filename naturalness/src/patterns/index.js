import { registry, definePattern } from './registry.js';
export { definePattern };

export function renderPattern(name, content, ctx){
  const fn = registry[name];
  if(!fn) return `<div class="ts-title clip-guard">(未実装: ${name})</div>`;
  return fn(content, ctx);
}

// ── Pattern modules (self-register via definePattern) ──────────────────────
import './_meta.js';
import './_swatch.js';
import './cover-section.js';
import './toc.js';
import './text-list.js';
import './flow-step.js';
import './diagram.js';
import './card-grid.js';
import './chart-data.js';
import './table-compare.js';
import './kpi-summary.js';
import './qa.js';
import './profile.js';
import './consulting.js';
import './framework-mba.js';
import './grid-system.js';
