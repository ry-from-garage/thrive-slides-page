import { renderPattern } from './patterns/index.js';

export function renderDeck(spec) {
  const slides = spec.slides ?? [];

  const slideSections = slides.map((slide) => {
    const theme = slide.theme ?? 'default';
    const pattern = slide.pattern ?? '_stub';
    const inner = renderPattern(pattern, slide.content ?? {}, { slide, spec });
    const sourceHtml = slide.source
      ? `<div class="ts-source">${slide.source}</div>`
      : '';
    const pageHtml = slide.page
      ? `<div class="ts-pageno">${slide.page}</div>`
      : '';
    return `    <section class="ts-slide theme-${theme}" data-pattern="${pattern}">\n${inner}\n${sourceHtml}${pageHtml}\n    </section>`;
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
</head>
<body>
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
