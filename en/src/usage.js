import { marked } from 'marked';

/**
 * Convert USAGE.md content to a styled standalone HTML page.
 * Reuses the catalog's dark theme CSS variables and visual language.
 */
export function renderUsage(markdownSource) {
  // Configure marked: GFM + tables enabled (these are defaults in marked v9+)
  marked.use({ gfm: true });

  const bodyHtml = marked.parse(markdownSource);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>thrive-slides 使い方</title>
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
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Noto Sans JP', sans-serif;
      line-height: 1.7;
      min-height: 100vh;
    }

    /* ── Header ── */
    .site-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 24px 40px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-top {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .site-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.01em;
    }
    .header-links {
      margin-left: auto;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .header-btn {
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 7px 16px;
      border-radius: 20px;
      white-space: nowrap;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .header-btn-primary {
      background: var(--accent);
      color: #fff;
    }
    .header-btn-primary:hover { background: var(--accent-hover); }
    .header-btn-outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .header-btn-outline:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    /* ── Content wrapper ── */
    .usage-wrap {
      max-width: 860px;
      margin: 0 auto;
      padding: 48px 40px 96px;
    }

    /* ── Prose typography ── */
    .usage-body h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .usage-body h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
      margin-top: 48px;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .usage-body h3 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      margin-top: 32px;
      margin-bottom: 10px;
    }
    .usage-body h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-top: 24px;
      margin-bottom: 8px;
    }
    .usage-body p {
      margin-bottom: 14px;
    }
    .usage-body ul,
    .usage-body ol {
      margin: 0 0 14px 1.4em;
    }
    .usage-body li {
      margin-bottom: 5px;
    }
    .usage-body a {
      color: var(--accent);
      text-decoration: none;
    }
    .usage-body a:hover {
      color: var(--accent-hover);
      text-decoration: underline;
    }

    /* ── Code & pre ── */
    .usage-body code {
      font-family: 'Menlo', 'Consolas', 'Monaco', monospace;
      font-size: 0.85em;
      background: var(--surface2);
      border: 1px solid var(--border);
      padding: 1px 5px;
      border-radius: 4px;
      color: #c9d1e0;
    }
    .usage-body pre {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 18px;
      overflow-x: auto;
      margin-bottom: 16px;
    }
    .usage-body pre code {
      background: none;
      border: none;
      padding: 0;
      font-size: 0.875rem;
      line-height: 1.6;
      color: #c9d1e0;
    }

    /* ── Tables ── */
    .usage-body table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 0.875rem;
    }
    .usage-body th {
      background: var(--surface2);
      color: var(--text);
      font-weight: 700;
      text-align: left;
      padding: 9px 14px;
      border: 1px solid var(--border);
    }
    .usage-body td {
      padding: 8px 14px;
      border: 1px solid var(--border);
      color: var(--text);
      vertical-align: top;
    }
    .usage-body tr:nth-child(even) td {
      background: var(--surface);
    }
    .usage-body tr:nth-child(odd) td {
      background: transparent;
    }

    /* ── Blockquote ── */
    .usage-body blockquote {
      border-left: 3px solid var(--accent);
      background: var(--surface);
      margin: 0 0 16px;
      padding: 12px 16px;
      border-radius: 0 var(--radius) var(--radius) 0;
      color: var(--text-muted);
    }
    .usage-body blockquote p {
      margin-bottom: 0;
    }

    /* ── HR ── */
    .usage-body hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 40px 0;
    }

    /* ── Responsive ── */
    @media (max-width: 700px) {
      .site-header { padding: 16px; }
      .usage-wrap { padding: 24px 16px 60px; }
      .usage-body table { display: block; overflow-x: auto; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-top">
      <span class="site-title">📖 thrive-slides 使い方</span>
      <div class="header-links">
        <a class="header-btn header-btn-outline" href="index.html">← カタログに戻る</a>
        <a class="header-btn header-btn-primary" href="deck.html">▶ デッキ</a>
      </div>
    </div>
  </header>
  <main class="usage-wrap">
    <div class="usage-body">
${bodyHtml}
    </div>
  </main>
</body>
</html>`;
}
