# DXF Standards Explained

DXF (Drawing Exchange Format) の構造と、実装に不可欠な数学的知識を凝縮した技術ガイドです。

「仕様書を読んでもパースできない」「OCS（オブジェクト座標系）で円がどこかへ飛んでいく」といった、CADデータ処理の実装者が直面する課題を解決することを目的としています。

---

## 🚀 ドキュメントサイト

詳細な解説と学習ロードマップは、以下のドキュメントサイトを参照してください。

- **GitHub Pages**: **[https://takuto-NA.github.io/dxf-standards-explained/](https://takuto-NA.github.io/dxf-standards-explained/)**
- **リポジトリ内で読む（オフライン/PRレビュー向け）**: [学習ロードマップ（index.md）](./index.md)

---

## 🧭 最短で迷わない読み方（初見向け）

- **まず1本**: [最初の1歩：最小構成のDXFを作る](./docs/getting-started.md)
- **全体像（何をどの順で読むか）**: [学習ロードマップ](./index.md#-学習ロードマップ)
- **最低限のDXF文法**: [タグ構造とグループコードの基本](./structure/tag-and-group-code.md)
- **つまずきやすい難所**: [座標系 (WCS/OCS/AAA)](./geometry/coordinate-systems.md) / [よくある罠と対処法](./implementation/common-pitfalls.md)
- **サンプルで手を動かす**: [DXF Samples](./samples/README.md)

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
- `geometry/`: 座標系、共通エンティティ、**ポリゴンと塗りつぶし**、**線の太さと厚み**、**線種と補助線**、**高度なエンティティ（SPLINE/Brep）**、数学的アルゴリズム
- `implementation/`: パーサー設計、主要ライブラリ、**フリーソフト活用ガイド**、**3D CAD/CAE互換性**、落とし穴
- `comparison/`: **DWG, SVG, ガーバー, Gコード, フォント**等との比較
- `samples/`: 学習・テスト用のDXFサンプルファイル

## 📄 ライセンス

MIT License

## 🤝 貢献について

不備の修正やコンテンツの追加は大歓迎です。[CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。
