# DXF Standards Explained

DXF (Drawing Exchange Format) の構造と、実装に不可欠な数学的知識を凝縮した技術ガイドです。

「仕様書を読んでもパースできない」「OCS（オブジェクト座標系）で円がどこかへ飛んでいく」といった、CADデータ処理の実装者が直面する課題を解決することを目的としています。

---

## 🚀 ドキュメントサイト

詳細な解説と学習ロードマップは、以下のドキュメントサイトを参照してください。
**[https://your-username.github.io/dxf-standards-explained/](https://your-username.github.io/dxf-standards-explained/)**

---

## 🛠 開発環境

このプロジェクトは [VitePress](https://vitepress.dev/) で構築されています。

```bash
# 依存関係のインストール
npm install

# ローカルでのプレビュー
npm run docs:dev

# ビルド
npm run docs:build
```

## 📂 構成

- `docs/`: 入門、用語集、歴史、**FAQ**など
- `structure/`: DXFのファイル構造、タグ、セクション解説
- `geometry/`: 座標系、共通エンティティ、**高度なエンティティ（SPLINE/Brep）**、数学的アルゴリズム
- `implementation/`: パーサー設計、主要ライブラリ（Python/JS/C++）、**3D CAD/CAE互換性**、落とし穴
- `samples/`: 学習・テスト用のDXFサンプルファイル

## 📄 ライセンス

MIT License

## 🤝 貢献について

不備の修正やコンテンツの追加は大歓迎です。[CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。
