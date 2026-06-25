<p align="center">
  <img src="assets/banner.svg" alt="thrive-slides — text / Markdown / PDF から、テーマに沿った 16:9 スライドを生成します" width="100%">
</p>

# thrive-slides — サンプルギャラリー（GitHub Pages 公開用）

thrive-slides の全スライドパターン（**5テーマ・14カテゴリ・全83パターン＋イントロ＋カテゴリ区切り＝98スライド**）を、reveal.js デッキとしてブラウザで閲覧できるよう GitHub Pages で公開するためのリポジトリです。

ギャラリーは `thrive-slides/renderer` の **決定論的HTMLレンダラ** によって生成されています。

## ▶ 公開ページ

**https://ry-from-garage.github.io/thrive-slides-page/**

## ナビゲーション

- `←` / `→` でスライド移動
- `Esc` または `O` でオーバービューグリッド表示

## 収録内容

- **5テーマ・14カテゴリ・全83パターン**（＋イントロ＋カテゴリ区切り＝合計98スライド）
- `index.html` — reveal.js ギャラリーデッキ（サイトルート）
- `vendor/` — reveal.js ライブラリ
- `src/` — thrive-slides レンダラ（テーマ・コンポーネント・CSS）

## 再生成方法

本体リポジトリの renderer から再ビルドして反映します：

```bash
cd thrive-slides/renderer
npm install
npx playwright install chromium
node build.js specs/gallery.json out
# out/ を thrive-slides-page/ にコピー
```

## 関連リポジトリ

- **本体（Skill / デザインシステム）:** https://github.com/ry-from-garage/thrive-slides

> このリポジトリは公開（GitHub Pages）専用です。内容を更新する場合は本体リポジトリの `renderer/` でビルドし直し、ここへ反映してください。

## ライセンス

MIT
