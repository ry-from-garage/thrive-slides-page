import { assignSlideIds, dividerSlug } from './render.js';

/**
 * Parse the spec's slides into a list of categories, each with their pattern slides.
 * Returns: Array<{ title: string, slug: string, catId: string, patterns: Array<slide+_id> }>
 */
function buildCategories(slidesWithIds) {
  const categories = [];
  let current = null;

  for (const slide of slidesWithIds) {
    const pattern = slide.pattern ?? '_stub';
    if (pattern === '_intro') continue;
    if (pattern === '_divider') {
      current = {
        title: slide.content?.title ?? '',
        slug: dividerSlug(slide.content?.title ?? ''),
        catId: slide._id,          // e.g. "cat-表紙・セクション" → stable id from render.js
        themeName: slide.content?.theme_name ?? slide.theme ?? '',
        count: slide.content?.count ?? 0,
        // 'layout-category' = one of the true pattern categories (layout-*.md).
        // 'theme-showcase' = a per-theme recap section that re-displays patterns
        // already counted under their layout category — excluded from catCount/
        // totalPatterns below so the header subtitle isn't inflated/double-counted.
        kind: slide.content?.kind ?? 'layout-category',
        patterns: [],
      };
      categories.push(current);
    } else if (current) {
      current.patterns.push(slide);
    }
  }

  return categories;
}

/**
 * Generate a jump-nav chip strip for all categories.
 */
function renderJumpNav(categories) {
  const chips = categories.map(cat =>
    `<a class="cat-chip" href="#${cat.catId}">${cat.title}</a>`
  ).join('\n      ');
  return `<nav class="jump-nav">\n      ${chips}\n    </nav>`;
}

/**
 * Render one category section with a heading + card grid.
 */
function renderCategorySection(cat, locale) {
  const cards = cat.patterns.map(slide => {
    const id = slide._id;
    return `        <a class="thumb-card" href="deck.html#/${id}">
          <img src="thumbs/${id}.png" alt="${id}" loading="lazy">
          <span class="thumb-label">${id}</span>
        </a>`;
  }).join('\n');

  const themeTag = cat.themeName
    ? `<span class="cat-theme-tag">${cat.themeName}</span>`
    : '';
  const countTag = `<span class="cat-count">${cat.patterns.length} ${locale === 'en' ? 'patterns' : 'パターン'}</span>`;

  return `    <section class="cat-section" id="${cat.catId}">
      <h2 class="cat-heading">${cat.title}${themeTag}${countTag}</h2>
      <div class="thumb-grid">
${cards}
      </div>
    </section>`;
}

export function renderCatalog(spec) {
  const locale = spec._locale ?? 'ja';
  const en = locale === 'en';

  const slidesWithIds = assignSlideIds(spec.slides ?? []);
  const categories = buildCategories(slidesWithIds);

  // totalPatterns = unique pattern names across the whole spec (a pattern can
  // appear twice: once under its layout category, once under a theme-showcase
  // recap section — count it once). catCount excludes theme-showcase sections
  // since they aren't a distinct layout category, just an alternate browse view.
  const totalPatterns = new Set(
    (spec.slides ?? [])
      .filter(s => s.pattern && s.pattern !== '_intro' && s.pattern !== '_divider')
      .map(s => s.pattern)
  ).size;
  const catCount = categories.filter(c => c.kind !== 'theme-showcase').length;
  const themeCount = new Set((spec.slides ?? []).map(s => s.theme).filter(Boolean)).size;

  const jumpNav = renderJumpNav(categories);
  const sections = categories.map(c => renderCategorySection(c, locale)).join('\n\n');

  const title = en
    ? 'thrive-slides — Slide Pattern Catalog'
    : 'thrive-slides — スライドパターンカタログ';
  // The downloadable .pptx mirrors the full deck (intro + dividers + pattern
  // slides), not just the unique pattern count — use the actual slide total.
  const totalSlideCount = slidesWithIds.length;
  const pptxLabel = en
    ? `Download PowerPoint (${totalSlideCount} slides)`
    : `PowerPoint版 (${totalSlideCount}枚)`;
  // The single shared thrive-slides-gallery.pptx lives at the site root;
  // locale pages under /en/ need one extra "../" hop to reach it.
  const pptxHref = en ? '../thrive-slides-gallery.pptx' : 'thrive-slides-gallery.pptx';
  const usageLabel = en ? 'How to Use' : '使い方';
  const deckLabel = en ? 'View Full Deck' : 'デッキで通し閲覧';
  const subtitle = en
    ? `${themeCount} themes × ${catCount} categories × ${totalPatterns} patterns`
    : `${themeCount} テーマ × ${catCount} カテゴリ × ${totalPatterns} パターン`;

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #111318;
      --surface: #1c1f27;
      --surface2: #252831;
      --border: #2e3140;
      --text: #e8eaf0;
      --text-muted: #8b90a0;
      --accent: #5b8def;
      --accent-hover: #7aa3f5;
      --radius: 8px;
      --card-radius: 6px;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Noto Sans JP', sans-serif;
      line-height: 1.6;
      min-height: 100vh;
    }

    /* ── Header ── */
    .site-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 28px 40px 24px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-top {
      display: flex;
      align-items: baseline;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 6px;
    }
    .site-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.01em;
    }
    .site-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .header-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .deck-link {
      background: var(--accent);
      color: #fff;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 7px 16px;
      border-radius: 20px;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .deck-link:hover { background: var(--accent-hover); }
    .usage-link {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 7px 16px;
      border-radius: 20px;
      white-space: nowrap;
      transition: border-color 0.15s, color 0.15s;
    }
    .usage-link:hover { border-color: var(--accent); color: var(--accent); }
    .pptx-link {
      background: transparent;
      border: 1px solid var(--accent);
      color: var(--accent);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 7px 16px;
      border-radius: 20px;
      white-space: nowrap;
      transition: background 0.15s, color 0.15s;
    }
    .pptx-link:hover { background: var(--accent); color: #fff; }

    /* ── Jump nav ── */
    .jump-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 16px 40px 0;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding-bottom: 14px;
    }
    .cat-chip {
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.78rem;
      padding: 4px 10px;
      border-radius: 20px;
      transition: background 0.12s, color 0.12s, border-color 0.12s;
      white-space: nowrap;
    }
    .cat-chip:hover {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    /* ── Main content ── */
    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 40px 80px;
    }

    /* ── Category section ── */
    .cat-section {
      margin-bottom: 56px;
      scroll-margin-top: 130px;
    }
    .cat-heading {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .cat-theme-tag {
      font-size: 0.72rem;
      font-weight: 500;
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .cat-count {
      font-size: 0.78rem;
      font-weight: 400;
      color: var(--text-muted);
      margin-left: auto;
    }

    /* ── Thumbnail grid ── */
    .thumb-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
    }

    .thumb-card {
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--card-radius);
      overflow: hidden;
      text-decoration: none;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    }
    .thumb-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    }
    .thumb-card img {
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      background: var(--surface2);
      display: block;
    }
    .thumb-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      padding: 6px 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: var(--surface);
      transition: color 0.15s;
    }
    .thumb-card:hover .thumb-label { color: var(--accent-hover); }

    /* ── Responsive ── */
    @media (max-width: 700px) {
      .site-header, .jump-nav { padding-left: 16px; padding-right: 16px; }
      .main-content { padding: 24px 16px 60px; }
      .thumb-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-top">
      <span class="site-title">${title}</span>
      <div class="header-actions">
        <a class="pptx-link" href="${pptxHref}" download>⬇ ${pptxLabel}</a>
        <a class="usage-link" href="usage.html">📖 ${usageLabel}</a>
        <a class="deck-link" href="deck.html">▶ ${deckLabel}</a>
      </div>
    </div>
    <div class="site-subtitle">${subtitle}</div>
  </header>
  ${jumpNav}
  <main class="main-content">
${sections}
  </main>
</body>
</html>`;
}
