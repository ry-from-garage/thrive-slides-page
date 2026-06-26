/**
 * radial.js — shared radial-layout helper for hub/spoke/center diagrams.
 *
 * Build-time (Node) geometry helper used by the diagram patterns. It places
 * N nodes evenly on a circle, computes connectors that run edge-to-edge
 * (from the hub circle's edge to each node's edge — never center-to-center
 * overlap), decides which side each node's LABEL sits on (based on the node's
 * angle), and exposes arrowhead orientation along the connector direction.
 *
 * Coordinate space: logical slide pixels (1280×720). All returned coordinates
 * are absolute slide coordinates, ready to drop into an overlay SVG that spans
 * the whole slide (viewBox "0 0 1280 720") or into absolutely-positioned HTML.
 *
 * Angles: 0 rad points right (+x), increasing clockwise in screen space
 * (because +y is down). Top = -PI/2.
 */

const TAU = Math.PI * 2;

/**
 * radialLayout(opts) → { center, nodes }
 *
 * opts:
 *   cx, cy        — hub center (slide coords)
 *   n             — number of nodes
 *   radius        — distance from center to each node center
 *   hubR          — hub radius (for edge-to-edge connector start). 0 if point hub.
 *   nodeR         — node radius (for edge-to-edge connector end). 0 if box/point.
 *   startAngle    — angle of node 0 (default top = -PI/2)
 *   clockwise     — node ordering direction (default true)
 *
 * Returns:
 *   center: { x, y }
 *   nodes: array of {
 *     i, angle,                       // index, angle (rad)
 *     x, y,                           // node CENTER (slide coords)
 *     ux, uy,                         // unit vector center→node (outward)
 *     side,                           // 'right' | 'left' | 'top' | 'bottom'
 *     // connector hub-edge → node-edge:
 *     conn: { x1, y1, x2, y2 },       // from hub edge to node edge (outward)
 *     connIn: { x1, y1, x2, y2 },     // reversed: node edge → hub edge (inward, for aggregation arrows)
 *   }
 */
export function radialLayout({
  cx,
  cy,
  n,
  radius,
  hubR = 0,
  nodeR = 0,
  startAngle = -Math.PI / 2,
  clockwise = true,
} = {}) {
  const count = Math.max(1, n | 0);
  const step = TAU / count;
  const dir = clockwise ? 1 : -1;

  const nodes = [];
  for (let i = 0; i < count; i++) {
    const angle = startAngle + dir * i * step;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const x = cx + ux * radius;
    const y = cy + uy * radius;

    // Connector endpoints: start at hub edge, end at node edge (gap-free, no overlap).
    const x1 = cx + ux * hubR;
    const y1 = cy + uy * hubR;
    const x2 = x - ux * nodeR;
    const y2 = y - uy * nodeR;

    nodes.push({
      i,
      angle,
      x,
      y,
      ux,
      uy,
      side: sideForAngle(ux, uy),
      conn: { x1, y1, x2, y2 },
      connIn: { x1: x2, y1: y2, x2: x1, y2: y1 },
    });
  }

  return { center: { x: cx, y: cy }, nodes };
}

/**
 * sideForAngle(ux, uy) → 'right' | 'left' | 'top' | 'bottom'
 *
 * Decides which side a node's LABEL should sit relative to the node, based on
 * the outward unit vector. A node on the left half gets its label to the LEFT;
 * right half → RIGHT; near-vertical nodes (top/bottom) get top/bottom so the
 * label clears the connector/badge. The horizontal bias dominates because text
 * reads horizontally — we only fall to top/bottom when the node is clearly
 * above/below the hub (|uy| meaningfully greater than |ux|).
 */
export function sideForAngle(ux, uy) {
  // Strongly vertical → place label above/below.
  if (Math.abs(uy) > Math.abs(ux) * 1.8) {
    return uy < 0 ? 'top' : 'bottom';
  }
  return ux >= 0 ? 'right' : 'left';
}

/**
 * labelPlacement(node, opts) → { left, top, width, height, align, anchorX, anchorY }
 *
 * Computes an absolutely-positioned label box that sits on the correct side of
 * a node, with the text edge nearest the node. Caller passes the gap from the
 * node edge and the label box size.
 *
 *   node    — a node object from radialLayout (needs x, y, side)
 *   nodeR   — node radius (label is offset from the node edge)
 *   gap     — px gap between node edge and label box
 *   width   — label box width
 *   height  — label box height
 *   bounds  — { left, right, top, bottom } clamp region (slide coords)
 *
 * Returns box geometry plus `align` ('left'|'right'|'center') for text-align.
 */
export function labelPlacement(node, { nodeR = 0, gap = 8, width, height, bounds } = {}) {
  const { x, y, side } = node;
  let left;
  let top;
  let align;

  switch (side) {
    case 'right':
      left = x + nodeR + gap;
      top = y - height / 2;
      align = 'left';
      break;
    case 'left':
      left = x - nodeR - gap - width;
      top = y - height / 2;
      align = 'right';
      break;
    case 'top':
      left = x - width / 2;
      top = y - nodeR - gap - height;
      align = 'center';
      break;
    case 'bottom':
    default:
      left = x - width / 2;
      top = y + nodeR + gap;
      align = 'center';
      break;
  }

  if (bounds) {
    left = clamp(left, bounds.left, bounds.right - width);
    top = clamp(top, bounds.top, bounds.bottom - height);
  }

  return { left: Math.round(left), top: Math.round(top), width, height, align };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * polarToXY(cx, cy, r, angle) → { x, y }
 * Convenience polar→cartesian in the same angle convention as radialLayout.
 */
export function polarToXY(cx, cy, r, angle) {
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}
