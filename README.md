# DXF Standards Explained

DXF (Drawing Exchange Format) の解説リポジトリです。
AutoCADを中心に普及したCADデータ交換形式の構造、数学、および実装のベストプラクティスをまとめています。

## サイト構成

このプロジェクトは [VitePress](https://vitepress.dev/) で構築されており、GitHub Pages で公開されています。

- **docs/**: 入門・基礎知識、歴史、用語集
- **structure/**: DXFのデータ構造、セクション概要、ヘッダー変数
- **geometry/**: 図形要素、数学、座標系 (OCS/WCS/AAA)
- **implementation/**: 実装ガイド、パーサー設計、ライブラリ紹介
- **comparison/**: DWGやSVGとの比較
- **samples/**: 学習用サンプルファイル

## 開発方法

```bash
# 依存関係のインストール
npm install

# ローカルでのプレビュー
npm run docs:dev

# ビルド
npm run docs:build
```

## ライセンス

MIT

