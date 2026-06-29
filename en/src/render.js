import { renderPattern } from './patterns/index.js';

/**
 * Derive a stable section id from a divider's content.title.
 * Strips emoji/special chars, lowercases, replaces spaces with hyphens.
 */
function dividerSlug(title) {
  return title
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')  // strip emoji (surrogate range)
    .replace(/[^\p{L}\p{N}\s-]/gu, '')        // strip non-alphanumeric (keep letters/digits/spaces/hyphens)
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    || 'cat';
}

/**
 * Assign stable ids to all slides.
 * - _intro → "intro"
 * - _divider → "cat-<slug>" where slug is derived from content.title
 * - pattern slides → the pattern name itself (patterns are unique in gallery)
 */
function assignSlideIds(slides) {
  const usedIds = new Set();
  const dividerCount = {};

  return slides.map((slide) => {
    const pattern = slide.pattern ?? '_stub';
    let id;

    if (pattern === '_intro') {
      id = 'intro';
    } else if (pattern === '_divider') {
      const slug = dividerSlug(slide.content?.title ?? 'cat');
      const base = `cat-${slug}`;
      // ensure uniqueness in case two dividers produce the same slug
      let candidate = base;
      let n = 2;
      while (usedIds.has(candidate)) {
        candidate = `${base}-${n++}`;
      }
      id = candidate;
    } else {
      let candidate = pattern;
      let n = 2;
      while (usedIds.has(candidate)) {
        candidate = `${pattern}-${n++}`;
      }
      id = candidate;
    }

    usedIds.add(id);
    return { ...slide, _id: id };
  });
}

export function renderDeck(spec) {
  const slides = spec.slides ?? [];
  const slidesWithIds = assignSlideIds(slides);

  const slideSections = slidesWithIds.map((slide) => {
    const theme = slide.theme ?? 'default';
    const pattern = slide.pattern ?? '_stub';
    const inner = renderPattern(pattern, slide.content ?? {}, { slide, spec });
    const sourceHtml = slide.source
      ? `<div class="ts-source">${slide.source}</div>`
      : '';
    const pageHtml = slide.page
      ? `<div class="ts-pageno">${slide.page}</div>`
      : '';
    // Inject pattern-name badge for pattern slides only (not _intro / _divider)
    const badgeHtml = !pattern.startsWith('_')
      ? `<div class="ts-pattern-badge">pattern: ${pattern}</div>`
      : '';
    return `    <section id="${slide._id}" class="ts-slide theme-${theme}" data-pattern="${pattern}">\n${inner}\n${sourceHtml}${pageHtml}\n${badgeHtml}\n    </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>thrive-slides gallery</title>
  <link rel="stylesheet" href="vendor/reveal/reset.css">
  <link rel="stylesheet" href="vendor/reveal/reveal.css">
  <link rel="stylesheet" href="src/grid.css">
  <link rel="stylesheet" href="src/base.css">
  <link rel="stylesheet" href="src/themes.css">
  <link rel="stylesheet" href="src/components/components.css">
  <link rel="stylesheet" href="src/charts/charts.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet">
  <style>
    /* Styled via base.css — this block intentionally left minimal */
  </style>
</head>
<body>
  <a id="ts-back-to-catalog" href="index.html">← カタログ</a>
  <a id="ts-usage-link" href="usage.html">📖 使い方</a>
  <div class="reveal">
    <div class="slides">
${slideSections}
    </div>
  </div>
  <script src="vendor/reveal/reveal.js"></script>
  <script>
    Reveal.initialize({
      width: 1280,
      height: 720,
      margin: 0,
      minScale: 0.2,
      maxScale: 2,
      controls: true,
      hash: true,
      slideNumber: 'c/t',
      overview: true
    });
  </script>
</body>
</html>`;
}

/**
 * Export the id-assignment function so catalog.js and thumbs.mjs can reuse it.
 */
export { assignSlideIds, dividerSlug };
