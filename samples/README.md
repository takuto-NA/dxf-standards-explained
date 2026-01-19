# DXF Samples

このディレクトリには、DXFの仕様を理解し、パーサーのテストに使用するためのサンプルファイルが格納されています。

## 📋 サンプル一覧

| ファイル名 | バージョン | 解説 | 構造のポイント |
| :--- | :--- | :--- | :--- |
| `minimal_r12.dxf` | R12 (AC1009) | 最小構成のDXF。1本のLINEのみ。 | HEADERがなく、いきなりENTITIESから始まる「最短構成」。 |
| `simple_shapes.dxf` | 2000 (AC1015) | LINE, CIRCLE, ARC, TEXTのセット。 | 各エンティティの基本的なグループコード（10, 40, 50等）の確認用。 |
| `lwpolyline_example.dxf` | 2000 (AC1015) | バルジ（円弧）を含むLWPOLYLINE。 | 頂点データ(10, 20)とバルジ(42)の繰り返し構造のパース。 |
| `block_example.dxf` | 2000 (AC1015) | ブロック定義(BLOCK)と参照(INSERT)。 | BLOCKSセクションとENTITIESセクション間のハンドル参照。 |

## 🔍 インタラクティブ・プレビュー

ドキュメント内で直接DXFファイルを確認できます。（マウスで操作可能）

### Simple Shapes
<ClientOnly>
  <DxfViewer src="/samples/simple_shapes.dxf" />
</ClientOnly>

### LWPolyline with Bulge
<ClientOnly>
  <DxfViewer src="/samples/lwpolyline_example.dxf" />
</ClientOnly>

### Block and Insert
<ClientOnly>
  <DxfViewer src="/samples/block_example.dxf" />
</ClientOnly>

### Minimal R12
<ClientOnly>
  <DxfViewer src="/samples/minimal_r12.dxf" />
</ClientOnly>

## 🖼 視覚的イメージ

各ファイルがどのような図形を含んでいるかのイメージです。（CADビューワーでの表示結果）

### 1. minimal_r12.dxf / simple_shapes.dxf
(0,0)から(10,10)への線分、中心(0,0)半径5の円など、座標計算の基本を確認できます。

### 2. lwpolyline_example.dxf
直線と曲線が混在した連続線です。バルジ値が正なら反時計回り、負なら時計回りの円弧として描画されます。

### 3. block_example.dxf
「ボルト」などの図形が一度定義され、異なる座標や角度で複数回「挿入」されています。

## 🛠 使い方

1. **テキストエディタで開く**: グループコード（例：`10`）と値（例：`10.0`）がどのように並んでいるかを確認してください。
2. **CADビューワーで開く**: [Autodesk Viewer](https://viewer.autodesk.com/) (Web) や [LibreCAD](https://librecad.org/) (Open Source) などで実際の描画結果を確認してください。
3. **自作パーサーの入力にする**: 期待した座標やプロパティが抽出できるかテストしてください。特にハンドル(5)やレイヤー名(8)が正しく取得できるかがポイントです。

## ⚠️ 注意事項
これらのファイルは学習・テスト用であり、実務で遭遇する「数メガバイトの巨大な図面」や「壊れたDXF」のすべてのケースを網羅しているわけではありません。エッジケースのテストには、さらに複雑なエンティティ（SPLINE, HATCH）を含むファイルが必要になります。

