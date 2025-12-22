# DXF Standards Explained

DXF (Drawing Exchange Format) の構造と、実装に不可欠な数学的知識を凝縮した技術ガイドです。

「仕様書を読んでもパースできない」「OCS（オブジェクト座標系）で円がどこかへ飛んでいく」といった、CADデータ処理の実装者が直面する課題を解決することを目的としています。

---

## 🧭 学習ロードマップ

あなたの目的に合わせて、以下のパスから読み進めてください。

### 1. DXFの基礎を理解する（初心者・入門）
最短でDXFの正体を知りたい方向け。
- [最初の1歩：最小構成のDXFを作る](/docs/getting-started)
- [タグ構造とグループコードの基本](/structure/tag-and-group-code)
- [DXFの歴史とバージョン](/docs/history-versions)

### 2. データ構造を深く知る（中級者・詳細リファレンス）
特定のデータを取り出したい、または構造を厳密に理解したい方向け。
- [セクション概要](/structure/sections-overview)
- [重要ヘッダー変数](/structure/header-variables)
- [テーブルとレイヤー](/structure/tables-and-layers)
- [共通エンティティ（LINE, CIRCLE, etc.）](/geometry/common-entities)

### 3. 数学と座標系を攻略する（難所攻略）
3D配置や円弧の計算で詰まっている方向け。DXF実装の最難関です。
- [座標系 (WCS/OCS/AAA)](/geometry/coordinate-systems)
- [ブロックとインサート](/geometry/blocks-and-inserts)

### 4. パーサーを実装する（実践・エンジニア）
ライブラリの選定や、自作パーサーの設計を行いたい方向け。
- [パーサーの設計](/implementation/parsing-strategy)
- [よくある罠と対処法](/implementation/common-pitfalls)
- [主要ライブラリ紹介](/implementation/libraries)

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

## 📂 サンプルファイル
[samples/](/samples/) ディレクトリには、学習用の様々なDXFファイルが用意されています。詳細は [samples/README.md](/samples/README.md) を参照してください。

## 📄 ライセンス
MIT License
