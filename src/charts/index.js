/**
 * charts/index.js — dispatch + re-export all chart generators
 *
 * renderChart(type, data) dispatches to the appropriate generator.
 * Each generator is also re-exported for direct import.
 */

export { bar, barHeights } from './bar.js';
export { line } from './line.js';
export { pieDonut, sliceAngles } from './pie-donut.js';
export { waterfall, cumulative, validateWaterfall } from './waterfall.js';
export { marimekko, columnWidths, segmentHeights } from './marimekko.js';
export { bubble2x2 } from './bubble2x2.js';
export { harveyBalls, fillFraction } from './harvey-balls.js';

import { bar } from './bar.js';
import { line } from './line.js';
import { pieDonut } from './pie-donut.js';
import { waterfall } from './waterfall.js';
import { marimekko } from './marimekko.js';
import { bubble2x2 } from './bubble2x2.js';
import { harveyBalls } from './harvey-balls.js';

const GENERATORS = {
  bar,
  line,
  'pie-donut': pieDonut,
  pieDonut,
  waterfall,
  marimekko,
  bubble2x2,
  'harvey-balls': harveyBalls,
  harveyBalls,
};

/**
 * renderChart(type, data) — dispatch to the appropriate generator.
 * Returns an SVG string.
 * Throws if type is unknown.
 */
export function renderChart(type, data) {
  const gen = GENERATORS[type];
  if (!gen) throw new Error(`Unknown chart type: "${type}". Available: ${Object.keys(GENERATORS).join(', ')}`);
  return gen(data);
}
