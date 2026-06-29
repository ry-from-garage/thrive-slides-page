/**
 * _charttest.js — throwaway pattern for chart render sanity check
 * DELETE after verification. DO NOT COMMIT.
 */

import { definePattern } from './registry.js';
import { waterfall } from '../charts/waterfall.js';
import { pieDonut } from '../charts/pie-donut.js';
import { bar } from '../charts/bar.js';
import { marimekko } from '../charts/marimekko.js';
import { bubble2x2 } from '../charts/bubble2x2.js';
import { harveyBalls } from '../charts/harvey-balls.js';

definePattern('_charttest', () => {
  // Safe area: x 72..1208, y 56..664 (w=1136, h=608)
  const safeLeft = 72;
  const safeTop  = 56;
  const safeW    = 1136;
  const safeH    = 608;

  // Layout: top row = 4 charts, bottom row = bar + harvey balls row
  const chartH = 240;
  const chartW = Math.floor(safeW / 3) - 8; // ~370px each

  // Row 1: waterfall | pieDonut | marimekko
  const row1Y = safeTop + 8;
  const wfSvg = waterfall({
    start: 100,
    deltas: [40, -25, 60, -15],
    w: chartW, h: chartH,
    labels: ['Start', '+40', '-25', '+60', '-15', 'End'],
  });
  const pieSvg = pieDonut({
    slices: [
      { label: 'A', value: 40 },
      { label: 'B', value: 30 },
      { label: 'C', value: 20 },
      { label: 'D', value: 10 },
    ],
    w: chartW, h: chartH,
    donut: true,
  });
  const mekkoSvg = marimekko({
    columns: [
      { label: 'APAC',  segments: [{ label: 'X', value: 50 }, { label: 'Y', value: 30 }, { label: 'Z', value: 20 }] },
      { label: 'EMEA',  segments: [{ label: 'X', value: 20 }, { label: 'Y', value: 50 }, { label: 'Z', value: 30 }] },
      { label: 'AMER',  segments: [{ label: 'X', value: 30 }, { label: 'Y', value: 20 }, { label: 'Z', value: 50 }] },
    ],
    w: chartW, h: chartH,
  });

  // Row 2: bar | bubble2x2 | harvey balls row
  const row2Y = row1Y + chartH + 16;
  const barSvg = bar({
    series: [
      { name: 'FY24', values: [80, 120, 60, 90] },
      { name: 'FY25', values: [100, 90, 110, 70] },
    ],
    w: chartW, h: chartH,
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  });
  const bubbleSvg = bubble2x2({
    items: [
      { label: 'Alpha', x: 0.2, y: 0.7, size: 3 },
      { label: 'Beta',  x: 0.6, y: 0.8, size: 5 },
      { label: 'Gamma', x: 0.8, y: 0.3, size: 2 },
      { label: 'Delta', x: 0.4, y: 0.2, size: 4 },
    ],
    w: chartW, h: chartH,
    axisX: { lo: 'Low', hi: 'High' },
    axisY: { lo: 'Low', hi: 'High' },
  });

  // Harvey balls row: 5 balls levels 0..4
  const hvSize = 40;
  const hvY = row2Y + (chartH - hvSize) / 2;
  const hvStartX = safeLeft + 2 * (chartW + 8) + 8;
  const hvSpacing = 52;
  const harveyRow = [0, 1, 2, 3, 4].map((lvl, i) => {
    const x = hvStartX + i * hvSpacing;
    const svg = harveyBalls(lvl, hvSize);
    return `<div data-region="harvey-${lvl}" style="position:absolute;left:${x}px;top:${row2Y + 100}px;width:${hvSize}px;height:${hvSize}px;">${svg}</div>`;
  }).join('\n');

  // Helper: wrap svg in positioned div
  function pos(svg, x, y, w, h) {
    return `<div data-region="chart-${x}-${y}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;">${svg}</div>`;
  }

  const x1 = safeLeft;
  const x2 = safeLeft + chartW + 8;
  const x3 = safeLeft + 2 * (chartW + 8);

  // Chart labels
  function label(text, x, y) {
    return `<div style="position:absolute;left:${x}px;top:${y}px;font-size:11px;color:var(--muted);font-family:var(--font-body);">${text}</div>`;
  }

  return [
    label('Waterfall', x1, row1Y - 1),
    label('Pie/Donut', x2, row1Y - 1),
    label('Marimekko', x3, row1Y - 1),
    pos(wfSvg,    x1, row1Y + 10, chartW, chartH),
    pos(pieSvg,   x2, row1Y + 10, chartW, chartH),
    pos(mekkoSvg, x3, row1Y + 10, chartW, chartH),
    label('Bar (grouped)', x1, row2Y - 1),
    label('Bubble 2×2',   x2, row2Y - 1),
    label('Harvey Balls (0→4)', x3, row2Y - 1),
    pos(barSvg,    x1, row2Y + 10, chartW, chartH),
    pos(bubbleSvg, x2, row2Y + 10, chartW, chartH),
    harveyRow,
  ].join('\n');
});
