/**
 * text.js — build-time text measurement estimator (no DOM).
 *
 * The diagram patterns run under Node, so there is no canvas/DOM to measure
 * text. These helpers estimate the rendered advance width of a string given a
 * font size, accounting for the fact that CJK (full-width) glyphs are ~1em wide
 * while Latin/ASCII glyphs are ~0.55em. Used to size node circles/boxes so the
 * label always fits, and to choose how many lines a label wraps to.
 */

/** True for full-width CJK / Japanese kana & kanji / full-width punctuation. */
function isWide(cp) {
  return (
    (cp >= 0x1100 && cp <= 0x115f) || // Hangul Jamo
    (cp >= 0x2e80 && cp <= 0x303e) || // CJK radicals, Kangxi, punctuation
    (cp >= 0x3041 && cp <= 0x33ff) || // Hiragana, Katakana, CJK symbols
    (cp >= 0x3400 && cp <= 0x4dbf) || // CJK Ext A
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified
    (cp >= 0xa000 && cp <= 0xa4cf) || // Yi
    (cp >= 0xac00 && cp <= 0xd7a3) || // Hangul syllables
    (cp >= 0xf900 && cp <= 0xfaff) || // CJK compat
    (cp >= 0xfe30 && cp <= 0xfe4f) || // CJK compat forms
    (cp >= 0xff00 && cp <= 0xff60) || // Fullwidth forms
    (cp >= 0xffe0 && cp <= 0xffe6)
  );
}

/**
 * textWidth(str, fontSize) → px advance width estimate of a single line.
 * Strips a leading "01 " style numeric token? No — measures the raw string.
 */
export function textWidth(str = '', fontSize = 14) {
  let units = 0;
  for (const ch of String(str)) {
    const cp = ch.codePointAt(0);
    if (ch === '\n') continue;
    units += isWide(cp) ? 1.0 : 0.55;
  }
  return units * fontSize;
}

/**
 * longestLineWidth(str, fontSize) → widest line in a multi-line string.
 * Splits on explicit "\n".
 */
export function longestLineWidth(str = '', fontSize = 14) {
  return String(str)
    .split('\n')
    .reduce((max, line) => Math.max(max, textWidth(line, fontSize)), 0);
}

/**
 * lineCount(str) → number of explicit lines (split on "\n"), min 1.
 */
export function lineCount(str = '') {
  return Math.max(1, String(str).split('\n').length);
}

/**
 * fitCircleRadius(label, fontSize, opts) → radius px that comfortably contains
 * the label inside a circle. Uses the diagonal of the text block (so a square
 * of text fits within the inscribed circle) plus padding, and respects a
 * min/max. Multi-line labels (\n) increase the block height.
 */
export function fitCircleRadius(label = '', fontSize = 14, { padding = 12, min = 24, max = 200, lineHeight = 1.3 } = {}) {
  const lines = lineCount(label);
  const w = longestLineWidth(label, fontSize);
  const h = lines * fontSize * lineHeight;
  // Half-diagonal of the text block = radius of the smallest enclosing circle.
  const halfDiag = Math.sqrt(w * w + h * h) / 2;
  const r = halfDiag + padding;
  return Math.round(Math.max(min, Math.min(max, r)));
}
