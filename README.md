<p align="center">
  <img src="assets/banner.svg" alt="thrive-slides — text / Markdown / PDF から、テーマに沿った 16:9 スライドを生成します" width="100%">
</p>

# thrive-slides — サムネイルカタログ（GitHub Pages 公開用）

thrive-slides の全スライドパターン（**5テーマ・14カテゴリ・全83パターン＋イントロ＋カテゴリ区切り＝98スライド**）を、サムネイルカタログと reveal.js デッキの両形式でブラウザ閲覧できるよう GitHub Pages で公開するためのリポジトリです。

ギャラリーは `thrive-slides/renderer` の **決定論的HTMLレンダラ** によって生成されています。

## ▶ 公開ページ

**https://ry-from-garage.github.io/thrive-slides-page/**

## ナビゲーション

- **`index.html`（ランディング）** — 83パターンのサムネイルグリッド（14カテゴリ）。サムネイルをクリックすると `deck.html#/<パターン>` でそのスライドに直接ジャンプします。
- **`deck.html`（フルデッキ）** — reveal.js による全98スライドの連続ブラウズ（`←` / `→` で移動、`Esc` または `O` でオーバービュー）
- **`usage.html`（使い方解説）** — thrive-slides の使い方・パターン選択・カスタマイズ方法を解説するガイドページ

## 収録内容

- **5テーマ・14カテゴリ・全83パターン**（＋イントロ＋カテゴリ区切り＝合計98スライド）
- `index.html` — サムネイルカタログ（サイトルート、83パターングリッド）
- `deck.html` — reveal.js フルデッキ（per-slide ディープリンク対応）
- `thumbs/` — 各パターンのサムネイルPNG（83枚）
- `vendor/` — reveal.js ライブラリ
- `src/` — thrive-slides レンダラ（テーマ・コンポーネント・CSS）

## 再生成方法

本体リポジトリの renderer から再ビルドして反映します：

```bash
cd thrive-slides/renderer
npm install
npx playwright install chromium
node build.js specs/gallery.json out
node test/thumbs.mjs
# out/ を thrive-slides-page/ にコピー（index.html, deck.html, thumbs/, vendor/, src/）
```

## 関連リポジトリ

- **本体（Skill / デザインシステム）:** https://github.com/ry-from-garage/thrive-slides

> このリポジトリは公開（GitHub Pages）専用です。内容を更新する場合は本体リポジトリの `renderer/` でビルドし直し、ここへ反映してください。

## ライセンス

MIT
