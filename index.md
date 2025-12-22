---
layout: home

hero:
  name: DXF Standards Explained
  text: CADデータの「読み書き」を解き明かす
  tagline: 歴史あるDrawing Exchange Formatの構造と数学を、実装者目線で徹底解説。
  actions:
    - theme: brand
      text: はじめに
      link: /docs/getting-started
    - theme: alt
      text: タグ構造を学ぶ
      link: /structure/tag-and-group-code

features:
  - title: 概念分離
    details: HEADER, TABLES, BLOCKS, ENTITIESの役割を論理的に分離して解説。
  - title: 実装者目線
    details: パーサーの設計、浮動小数点誤差、文字化け対策など、実際の開発に役立つ知見を提供。
  - title: 数学と座標系
    details: OCS（オブジェクト座標系）や任意軸アルゴリズム（AAA）など、2D/3D変換の難所を可視化。
---

## 🧭 学習ロードマップ

あなたの目的に合わせて、以下のパスから読み進めてください。

::: info 1. DXFの基礎を理解する（初心者・入門）
最短でDXFの正体を知りたい方向け。
- [最初の1歩：最小構成のDXFを作る](/docs/getting-started)
- [よくある質問 (FAQ)](/docs/faq)
- [タグ構造とグループコードの基本](/structure/tag-and-group-code)
- [DXFの歴史とバージョン](/docs/history-versions)
:::

::: info 2. データ構造を深く知る（中級者・詳細リファレンス）
特定のデータを取り出したい、または構造を厳密に理解したい方向け。
- [セクション概要](/structure/sections-overview)
- [重要ヘッダー変数](/structure/header-variables)
- [テーブルとレイヤー](/structure/tables-and-layers)
- [共通エンティティ（LINE, CIRCLE, etc.）](/geometry/common-entities)
- [高度なエンティティ（SPLINE, NURBS, Brep）](/geometry/advanced-entities)
:::

::: info 3. 数学と座標系を攻略する（難所攻略）
3D配置や円弧の計算で詰まっている方向け。DXF実装の最難関です。
- [座標系 (WCS/OCS/AAA)](/geometry/coordinate-systems)
- [ブロックとインサート](/geometry/blocks-and-inserts)
:::

::: info 4. パーサーを実装する（実践・エンジニア）
ライブラリの選定や、自作パーサーの設計を行いたい方向け。
- [パーサーの設計](/implementation/parsing-strategy)
- [よくある罠と対処法](/implementation/common-pitfalls)
- [主要ライブラリ紹介](/implementation/libraries)
- [3D CADとの互換性](/implementation/3d-cad-interoperability)
- [CAE（ANSYS等）との互換性](/implementation/cae-interoperability)
:::

---

## 📂 サンプルファイル
[samples/README](/samples/README) には、学習用の様々なDXFファイルが用意されています。
実際のコードと見比べながら学習することで、より理解が深まります。

