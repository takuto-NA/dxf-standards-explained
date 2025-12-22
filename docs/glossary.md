# 用語集

DXFで使用される重要な用語をカテゴリ別にまとめています。

## 📂 ファイル構造と基本

### [Group Code（グループコード）](../structure/tag-and-group-code.md)
データの「意味」と「型」を定義する数値タグ。すべてのDXFデータはこれに基づいている。

### [Handle（ハンドル）](../structure/tag-and-group-code.md#2-主要なグループコードとデータ型)
オブジェクトに割り当てられた一意の16進数ID。オブジェクト間の参照解決に使用される。

### [Subclass Marker（サブクラスマーカー）](../structure/tag-and-group-code.md#2-主要なグループコードとデータ型)
オブジェクトの型情報を厳密に定義するためのタグ（コード100）。パースの正確性を担保する。

### [ASCII DXF](../structure/tag-and-group-code.md#3-binary-dxf-バイナリ形式)
テキスト形式で記述されたDXF。人間が読み書きできるが、ファイルサイズは大きくなる。

### [Binary DXF](../structure/tag-and-group-code.md#3-binary-dxf-バイナリ形式)
バイナリ形式で記述されたDXF。ファイルサイズが小さく、読み込み速度が速い。

## 📐 幾何学と座標系

### [WCS (World Coordinate System)](../geometry/coordinate-systems.md)
図面全体の基準となる絶対的な座標系。

### [OCS (Object Coordinate System)](../geometry/coordinate-systems.md)
各エンティティが独自に持つ座標系。3D空間内の2D図形を表現するために使用される。

### [Arbitrary Axis Algorithm (AAA)](../geometry/coordinate-systems.md#3-任意軸アルゴリズム-arbitrary-axis-algorithm)
法線ベクトルからOCSのX軸とY軸を一意に算出するためのアルゴリズム。

### [Extrusion Direction（法線ベクトル）](../geometry/coordinate-systems.md#2-なぜ-ocs-が必要なのか)
エンティティがどの向き（平面）を向いているかを示すベクトル。

## 🧱 オブジェクトと要素

### [Entity（エンティティ）](../geometry/common-entities.md)
実際に描画される図形要素（LINE, CIRCLEなど）の総称。

### [Block（ブロック）](../geometry/blocks-and-inserts.md)
再利用可能な図形の定義。図面内で何度も使い回す部品（ボルト、机など）を定義するために使用する。

### [Bulge（バルジ）](../geometry/common-entities.md#lwpolyline軽量ポリライン)
LWPOLYLINEの頂点間で円弧を表現するための数値。角度の1/4のタンジェント。

### [DICTIONARY（辞書）](../structure/objects-section.md#2-dictionary辞書構造)
非図形データの階層構造を管理するコンテナ。OBJECTSセクションの核となる要素。

---
関連：[学習ロードマップ](../index.md#🧭-学習ロードマップ)
