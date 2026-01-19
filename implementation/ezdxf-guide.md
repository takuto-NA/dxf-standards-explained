# ezdxf 実践ガイド

PythonでDXFファイルを扱う際の最も推奨されるライブラリである **ezdxf** を使用した、インポート（読み込み）とエクスポート（書き込み）の実践的なガイドです。

このガイドでは、ezdxfを使う際の基本的な操作方法から、よくある間違いやリスク排除まで、実装時に役立つ情報を網羅的に解説します。

::: tip 関連ドキュメント
- [主要ライブラリ](./libraries.md) - 他の言語のライブラリも含めた包括的な紹介
- [よくある罠と対処法](./common-pitfalls.md) - DXF実装全般の注意点
- [パーサーの設計](./parsing-strategy.md) - パーサー実装のアーキテクチャ
- [座標系 (WCS/OCS/AAA)](../geometry/coordinate-systems.md) - 座標変換の詳細
:::

---

## 1. イントロダクション

### ezdxfとは

**ezdxf** は、PythonでDXFファイルを読み書きするための最も人気が高く、機能が豊富なライブラリです。

**主な特徴**:
- DXF R12から最新バージョン（R2018）まで幅広く対応
- 読み書き両方に対応
- OCS/WCS変換などの数学的処理も強力にサポート
- MITライセンス（商用利用可能）
- アクティブにメンテナンスされている
- 豊富なドキュメントとサンプルコード

**公式サイト**: https://ezdxf.mozman.at/

**GitHub**: https://github.com/mozman/ezdxf

### インストール

```bash
# 基本的なインストール
pip install ezdxf

# 追加機能（画像エクスポートなど）を含む場合
pip install ezdxf[draw]
```

**要件**:
- Python 3.10以上
- 依存パッケージ: `typing_extensions`, `pyparsing`, `numpy`, `fontTools`

### サポートするDXFバージョン

| DXFバージョン | AutoCADバージョン | 読み込み | 書き込み |
| :--- | :--- | :--- | :--- |
| R12 (AC1009) | AutoCAD R12 | ✅ | ✅ |
| R2000 (AC1015) | AutoCAD 2000 | ✅ | ✅ |
| R2004 (AC1018) | AutoCAD 2004 | ✅ | ✅ |
| R2007 (AC1021) | AutoCAD 2007 | ✅ | ✅ |
| R2010 (AC1024) | AutoCAD 2010 | ✅ | ✅ |
| R2013 (AC1027) | AutoCAD 2013 | ✅ | ✅ |
| R2018 (AC1032) | AutoCAD 2018 | ✅ | ✅ |
| R13/R14 | AutoCAD R13/R14 | ✅ (読み込みのみ、R2000にアップグレード) | ❌ |
| R12以前 | 古いバージョン | ✅ (読み込みのみ、R12にアップグレード) | ❌ |

### バイナリDXF vs ASCII DXF

ezdxfは、ASCII形式とバイナリ形式の両方のDXFファイルをサポートしています。

- **ASCII DXF**: テキストエディタで読める形式。デバッグが容易。
- **バイナリDXF**: ファイルサイズが小さく、読み書きが高速。

デフォルトではASCII形式で保存されます。バイナリ形式で保存する場合は、`doc.saveas()` の代わりに `doc.saveas_binary()` を使用します。

---

## 2. 基本的なインポート（読み込み）

### ファイルの読み込み

最も基本的な読み込み方法は `ezdxf.readfile()` を使用することです。

```python
import ezdxf

# 基本的な読み込み
try:
    doc = ezdxf.readfile("drawing.dxf")
    print(f"DXFバージョン: {doc.dxfversion}")
except IOError as e:
    print(f"ファイルが見つかりません: {e}")
except ezdxf.DXFStructureError as e:
    print(f"DXFファイルの構造エラー: {e}")
```

### エラーハンドリング

ezdxfでは、様々なエラーが発生する可能性があります。適切なエラーハンドリングを実装することが重要です。

```python
import ezdxf
from pathlib import Path

def safe_read_dxf(file_path):
    """安全にDXFファイルを読み込む"""
    file_path = Path(file_path)
    
    # ファイルパスの存在確認
    if not file_path.exists():
        raise FileNotFoundError(f"ファイルが見つかりません: {file_path}")
    
    # ファイルが読み取り可能か確認
    if not file_path.is_file():
        raise ValueError(f"ファイルではありません: {file_path}")
    
    try:
        # DXFファイルの読み込み
        doc = ezdxf.readfile(str(file_path))
        return doc
    except IOError as e:
        raise IOError(f"ファイルの読み込みに失敗しました: {e}")
    except ezdxf.DXFStructureError as e:
        raise ValueError(f"DXFファイルの構造が不正です: {e}")
    except ezdxf.DXFValueError as e:
        raise ValueError(f"DXFファイルの値が不正です: {e}")
    except Exception as e:
        raise RuntimeError(f"予期しないエラーが発生しました: {e}")

# 使用例
try:
    doc = safe_read_dxf("drawing.dxf")
    print("読み込み成功")
except Exception as e:
    print(f"エラー: {e}")
```

### エンティティの取得

モデルスペースからエンティティを取得する方法です。

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()  # モデルスペースを取得

# すべてのエンティティを反復処理
for entity in msp:
    print(f"エンティティタイプ: {entity.dxftype()}")
    
    # LINEエンティティの場合
    if entity.dxftype() == "LINE":
        start = entity.dxf.start
        end = entity.dxf.end
        print(f"  始点: ({start.x}, {start.y}, {start.z})")
        print(f"  終点: ({end.x}, {end.y}, {end.z})")
    
    # CIRCLEエンティティの場合
    elif entity.dxftype() == "CIRCLE":
        center = entity.dxf.center
        radius = entity.dxf.radius
        print(f"  中心: ({center.x}, {center.y}, {center.z})")
        print(f"  半径: {radius}")
```

### モデルスペースとペーパースペース

DXFファイルには、モデルスペース（実際の図面）とペーパースペース（レイアウト）があります。

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")

# モデルスペースの取得
msp = doc.modelspace()

# ペーパースペース（レイアウト）の取得
layouts = doc.layouts
for layout_name in layouts.names():
    layout = layouts.get(layout_name)
    print(f"レイアウト名: {layout_name}")
    
    # レイアウト内のエンティティを取得
    for entity in layout:
        print(f"  {entity.dxftype()}")
```

### レイアウトの取得

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")

# すべてのレイアウトを取得
layouts = doc.layouts

# レイアウト名の一覧
print("利用可能なレイアウト:")
for layout_name in layouts.names():
    print(f"  - {layout_name}")

# 特定のレイアウトを取得
if "Layout1" in layouts:
    layout = layouts.get("Layout1")
    print(f"レイアウト '{layout_name}' のエンティティ数: {len(list(layout))}")
```

### 大きなファイルの処理

大きなDXFファイルを処理する際は、メモリ効率を考慮する必要があります。

```python
import ezdxf

def process_large_dxf(file_path):
    """大きなDXFファイルを効率的に処理"""
    doc = ezdxf.readfile(file_path)
    msp = doc.modelspace()
    
    # イテレータを使用してメモリ効率的に処理
    line_count = 0
    circle_count = 0
    
    for entity in msp:
        if entity.dxftype() == "LINE":
            line_count += 1
            # 必要な処理をここで実行
        elif entity.dxftype() == "CIRCLE":
            circle_count += 1
    
    print(f"LINE: {line_count}個, CIRCLE: {circle_count}個")
```

---

## 3. 基本的なエクスポート（書き込み）

### 新規DXFファイルの作成

`ezdxf.new()` を使用して新しいDXFファイルを作成します。

```python
import ezdxf

# DXFバージョンを指定して新規作成
doc = ezdxf.new('R2010')  # または 'R12', 'R2000', 'R2004', 'R2007', 'R2013', 'R2018'

# モデルスペースを取得
msp = doc.modelspace()

# エンティティを追加
msp.add_line((0, 0), (10, 10))
msp.add_circle((5, 5), radius=2.5)

# ファイルに保存
doc.saveas("output.dxf")
```

### DXFバージョンの選択

DXFバージョンの選択は、互換性に大きな影響を与えます。

```python
import ezdxf

# 互換性を重視する場合（古いCADソフトでも開ける）
doc_r12 = ezdxf.new('R12')  # 最も互換性が高い

# 最新機能を使いたい場合
doc_r2018 = ezdxf.new('R2018')  # 最新の機能が使える

# バランスの取れた選択（推奨）
doc_r2010 = ezdxf.new('R2010')  # 多くのCADソフトでサポートされている
```

**推奨**: 特に理由がなければ `R2010` を選択することを推奨します。多くのCADソフトでサポートされており、十分な機能を持っています。

### ファイルの保存

```python
import ezdxf
from pathlib import Path

doc = ezdxf.new('R2010')
msp = doc.modelspace()
msp.add_line((0, 0), (10, 10))

# ASCII形式で保存（デフォルト）
doc.saveas("output.dxf")

# バイナリ形式で保存（ファイルサイズが小さい）
doc.saveas_binary("output_binary.dxf")

# パスオブジェクトを使用
output_path = Path("output") / "drawing.dxf"
output_path.parent.mkdir(parents=True, exist_ok=True)
doc.saveas(str(output_path))
```

### 既存ファイルの変更と保存

既存のDXFファイルを読み込んで変更し、保存する方法です。

```python
import ezdxf
from pathlib import Path
import shutil

def modify_and_save(input_path, output_path, backup=True):
    """既存ファイルを変更して保存（バックアップ付き）"""
    input_path = Path(input_path)
    output_path = Path(output_path)
    
    # バックアップの作成（推奨）
    if backup and output_path.exists():
        backup_path = output_path.with_suffix('.dxf.bak')
        shutil.copy2(output_path, backup_path)
        print(f"バックアップを作成: {backup_path}")
    
    # ファイルの読み込み
    doc = ezdxf.readfile(str(input_path))
    msp = doc.modelspace()
    
    # 変更を加える（例: すべてのLINEを削除）
    entities_to_delete = []
    for entity in msp:
        if entity.dxftype() == "LINE":
            entities_to_delete.append(entity)
    
    for entity in entities_to_delete:
        msp.delete_entity(entity)
    
    # 新しいエンティティを追加
    msp.add_circle((5, 5), radius=3.0)
    
    # 保存
    doc.saveas(str(output_path))
    print(f"保存完了: {output_path}")

# 使用例
modify_and_save("input.dxf", "output.dxf", backup=True)
```

---

## 4. エンティティの操作

### 主要エンティティの作成

ezdxfでは、様々なエンティティタイプを作成できます。

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# LINE（線分）
msp.add_line((0, 0), (10, 10))

# CIRCLE（円）
msp.add_circle((5, 5), radius=2.5)

# ARC（円弧）
msp.add_arc((5, 5), radius=3.0, start_angle=0, end_angle=90)

# LWPOLYLINE（軽量ポリライン）
points = [(0, 0), (10, 0), (10, 10), (0, 10)]
msp.add_lwpolyline(points)

# TEXT（テキスト）
msp.add_text("Hello, DXF!", dxfattribs={'height': 2.5}).set_placement((0, 0))

# MTEXT（複数行テキスト）
msp.add_mtext("Multi-line\nText", dxfattribs={'height': 2.5}).set_location((0, 5))

doc.saveas("entities.dxf")
```

### エンティティの属性設定

エンティティの属性（レイヤー、色、線種など）を設定する方法です。

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# レイヤーの作成
doc.layers.new("MyLayer", dxfattribs={'color': 1})  # 1=赤

# 線種の作成
doc.linetypes.new("DASHED", dxfattribs={
    'description': 'Dashed line',
    'length': 1.0,
    'pattern': [0.5, -0.5]  # 0.5単位の線、0.5単位の空白
})

# エンティティに属性を設定
line = msp.add_line((0, 0), (10, 10), dxfattribs={
    'layer': 'MyLayer',      # レイヤー名
    'color': 2,              # 色（2=黄）
    'linetype': 'DASHED',    # 線種
    'lineweight': 25         # 線の太さ（0.25mm）
})

# 後から属性を変更することも可能
line.dxf.layer = "0"  # デフォルトレイヤーに変更
line.dxf.color = 7    # 白/黒に変更

doc.saveas("attributed.dxf")
```

### エンティティの検索とフィルタリング

特定の条件に合致するエンティティを検索する方法です。

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# 特定のタイプのエンティティを検索
lines = [e for e in msp if e.dxftype() == "LINE"]
print(f"LINEエンティティ数: {len(lines)}")

# 特定のレイヤーのエンティティを検索
layer_entities = [e for e in msp if e.dxf.layer == "MyLayer"]
print(f"レイヤー 'MyLayer' のエンティティ数: {len(layer_entities)}")

# 複数の条件でフィルタリング
filtered = [
    e for e in msp 
    if e.dxftype() == "LINE" and e.dxf.layer == "0" and e.dxf.color == 1
]
print(f"条件に合致するエンティティ数: {len(filtered)}")

# ezdxfのクエリ機能を使用（より効率的）
from ezdxf import query

# LINEエンティティのみを取得
lines = query(msp).filter(lambda e: e.dxftype() == "LINE")

# 特定のレイヤーのエンティティを取得
layer_entities = query(msp).filter(lambda e: e.dxf.layer == "MyLayer")
```

### エンティティの削除と変更

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# 削除するエンティティを収集
entities_to_delete = []
for entity in msp:
    if entity.dxftype() == "LINE":
        entities_to_delete.append(entity)

# エンティティを削除
for entity in entities_to_delete:
    msp.delete_entity(entity)

# エンティティの属性を変更
for entity in msp:
    if entity.dxftype() == "CIRCLE":
        # 半径を変更
        entity.dxf.radius = entity.dxf.radius * 1.5
        # レイヤーを変更
        entity.dxf.layer = "ModifiedLayer"

doc.saveas("modified.dxf")
```

---

## 5. よくある間違いとリスク排除（重要）

このセクションでは、ezdxfを使用する際によくある間違いと、それらを回避する方法を詳しく解説します。

### 5.1 読み込み時の間違い

#### ファイルパスの問題

**間違いの例**:
```python
# ❌ 悪い例: パスの存在確認なし
doc = ezdxf.readfile("drawing.dxf")  # ファイルが存在しない場合にエラー
```

**正しい実装**:
```python
# ✅ 良い例: パスの存在確認
from pathlib import Path

def safe_read_dxf(file_path):
    file_path = Path(file_path)
    
    # 絶対パスに変換（相対パスの問題を回避）
    if not file_path.is_absolute():
        file_path = file_path.resolve()
    
    # 存在確認
    if not file_path.exists():
        raise FileNotFoundError(f"ファイルが見つかりません: {file_path}")
    
    if not file_path.is_file():
        raise ValueError(f"ファイルではありません: {file_path}")
    
    return ezdxf.readfile(str(file_path))
```

#### エラーハンドリングの不備

**間違いの例**:
```python
# ❌ 悪い例: エラーハンドリングなし
doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()
```

**正しい実装**:
```python
# ✅ 良い例: 適切なエラーハンドリング
import ezdxf
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def robust_read_dxf(file_path):
    """堅牢なDXF読み込み"""
    try:
        doc = ezdxf.readfile(file_path)
        logger.info(f"ファイルを正常に読み込みました: {file_path}")
        return doc
    except IOError as e:
        logger.error(f"ファイルの読み込みに失敗しました: {e}")
        raise
    except ezdxf.DXFStructureError as e:
        logger.error(f"DXFファイルの構造エラー: {e}")
        # 構造エラーの場合、リカバリを試みることも可能
        try:
            doc = ezdxf.recover.readfile(file_path)
            logger.warning("リカバリモードで読み込みました")
            return doc
        except Exception:
            raise
    except Exception as e:
        logger.error(f"予期しないエラー: {e}")
        raise
```

#### ファイルロック

**問題**: 他のプロセス（CADソフトなど）がファイルを開いている場合、読み込みに失敗することがあります。

**対処法**:
```python
import ezdxf
import time
from pathlib import Path

def read_with_retry(file_path, max_retries=3, retry_delay=1.0):
    """リトライ機能付き読み込み"""
    file_path = Path(file_path)
    
    for attempt in range(max_retries):
        try:
            # ファイルがロックされていないか確認
            if not file_path.exists():
                raise FileNotFoundError(f"ファイルが見つかりません: {file_path}")
            
            # 読み込みを試みる
            doc = ezdxf.readfile(str(file_path))
            return doc
        except (IOError, PermissionError) as e:
            if attempt < max_retries - 1:
                print(f"読み込み失敗（試行 {attempt + 1}/{max_retries}）: {e}")
                print(f"{retry_delay}秒後に再試行します...")
                time.sleep(retry_delay)
            else:
                raise IOError(f"ファイルの読み込みに失敗しました（{max_retries}回試行）: {e}")
```

#### 破損ファイルの処理

**問題**: 不完全なDXFファイルや破損したファイルを読み込む必要がある場合があります。

**対処法**:
```python
import ezdxf

def read_dxf_with_recovery(file_path):
    """リカバリモードで読み込み"""
    try:
        # 通常の読み込みを試みる
        doc = ezdxf.readfile(file_path)
        return doc
    except ezdxf.DXFStructureError:
        # 構造エラーの場合、リカバリモードで読み込み
        try:
            doc = ezdxf.recover.readfile(file_path)
            print("警告: リカバリモードで読み込みました。一部のデータが欠損している可能性があります。")
            return doc
        except Exception as e:
            raise ValueError(f"ファイルの読み込みに失敗しました（リカバリも失敗）: {e}")
```

#### メモリ不足

**問題**: 非常に大きなDXFファイル（数GB）を読み込む場合、メモリ不足が発生する可能性があります。

**対処法**:
```python
import ezdxf
from ezdxf.addons.iterdxf import opendxf

def process_huge_dxf(file_path):
    """巨大なDXFファイルをストリーミング処理"""
    # iterdxfアドオンを使用（メモリ効率的）
    with opendxf(file_path) as doc:
        for entity in doc.modelspace():
            # エンティティを1つずつ処理
            if entity.dxftype() == "LINE":
                # 必要な処理を実行
                pass
```

### 5.2 書き込み時の間違い

#### 上書きのリスク

**間違いの例**:
```python
# ❌ 悪い例: バックアップなしで上書き
doc.saveas("important.dxf")  # 既存ファイルが上書きされる
```

**正しい実装**:
```python
# ✅ 良い例: バックアップ付き保存
import ezdxf
from pathlib import Path
import shutil
from datetime import datetime

def safe_save(doc, file_path, create_backup=True):
    """安全にファイルを保存（バックアップ付き）"""
    file_path = Path(file_path)
    
    # 既存ファイルのバックアップ
    if create_backup and file_path.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = file_path.with_suffix(f'.{timestamp}.bak')
        shutil.copy2(file_path, backup_path)
        print(f"バックアップを作成: {backup_path}")
    
    # 一時ファイルに保存してからリネーム（アトミック操作）
    temp_path = file_path.with_suffix('.tmp')
    try:
        doc.saveas(str(temp_path))
        # 成功したらリネーム
        temp_path.replace(file_path)
        print(f"保存完了: {file_path}")
    except Exception as e:
        # エラー時は一時ファイルを削除
        if temp_path.exists():
            temp_path.unlink()
        raise
```

#### DXFバージョンの選択ミス

**問題**: 古いCADソフトで開けないバージョンを選択してしまう。

**対処法**:
```python
import ezdxf

def create_compatible_dxf(version='R2010'):
    """互換性を考慮したDXFファイル作成"""
    # バージョンの妥当性チェック
    valid_versions = ['R12', 'R2000', 'R2004', 'R2007', 'R2010', 'R2013', 'R2018']
    if version not in valid_versions:
        raise ValueError(f"無効なバージョン: {version}. 有効な値: {valid_versions}")
    
    doc = ezdxf.new(version)
    
    # R12の場合は、使用できない機能を避ける
    if version == 'R12':
        # R12ではMTEXTが使えないので、TEXTを使用
        msp = doc.modelspace()
        msp.add_text("Text", dxfattribs={'height': 2.5})
    else:
        # 新しいバージョンではMTEXTが使える
        msp = doc.modelspace()
        msp.add_mtext("Multi-line text", dxfattribs={'height': 2.5})
    
    return doc
```

#### エンティティの不整合

**間違いの例**:
```python
# ❌ 悪い例: 存在しないレイヤーを参照
msp.add_line((0, 0), (10, 10), dxfattribs={'layer': 'NonExistentLayer'})
```

**正しい実装**:
```python
# ✅ 良い例: レイヤーの存在確認と作成
def ensure_layer_exists(doc, layer_name):
    """レイヤーが存在することを確認し、なければ作成"""
    if layer_name not in doc.layers:
        doc.layers.new(layer_name, dxfattribs={'color': 7})  # デフォルト色
    return doc.layers.get(layer_name)

# 使用例
doc = ezdxf.new('R2010')
ensure_layer_exists(doc, "MyLayer")
msp = doc.modelspace()
msp.add_line((0, 0), (10, 10), dxfattribs={'layer': 'MyLayer'})
```

#### 座標値の範囲外

**問題**: 極端に大きな座標値や、NaN、Infinityなどの不正な値が含まれる場合があります。

**対処法**:
```python
import math

def validate_coordinate(value):
    """座標値の妥当性をチェック"""
    if not isinstance(value, (int, float)):
        raise TypeError(f"座標値は数値である必要があります: {value}")
    
    if math.isnan(value):
        raise ValueError("座標値がNaNです")
    
    if math.isinf(value):
        raise ValueError("座標値が無限大です")
    
    # 極端に大きな値のチェック（オプション）
    if abs(value) > 1e10:
        import warnings
        warnings.warn(f"座標値が非常に大きいです: {value}")
    
    return value

def safe_add_line(msp, start, end):
    """安全にLINEエンティティを追加"""
    # 座標値の検証
    start = tuple(validate_coordinate(x) for x in start)
    end = tuple(validate_coordinate(x) for x in end)
    
    return msp.add_line(start, end)
```

#### 文字エンコーディングの不一致

**問題**: 日本語などの非ASCII文字が文字化けする。

**対処法**:
```python
import ezdxf

def create_dxf_with_japanese_text():
    """日本語テキストを含むDXFファイルを作成"""
    doc = ezdxf.new('R2010')  # R2007以降はUTF-8が標準
    
    # R12やR2000の場合は、エンコーディングに注意が必要
    # R2010以降はUTF-8が標準なので問題なし
    
    msp = doc.modelspace()
    
    # 日本語テキストを追加
    text = msp.add_text("日本語テキスト", dxfattribs={'height': 2.5})
    text.set_placement((0, 0))
    
    # MTEXTでも日本語が使える
    mtext = msp.add_mtext("複数行の\n日本語テキスト", dxfattribs={'height': 2.5})
    mtext.set_location((0, 5))
    
    return doc
```

### 5.3 エンティティ操作時の間違い

#### 座標系の混同

**問題**: WCS（世界座標系）とOCS（オブジェクト座標系）を混同する。

**詳細**: [座標系 (WCS/OCS/AAA)](../geometry/coordinate-systems.md) を参照

**対処法**:
```python
import ezdxf
from ezdxf.math import Vec3

def get_entity_wcs_coordinates(entity):
    """エンティティのWCS座標を取得（OCS変換を含む）"""
    if entity.dxftype() == "CIRCLE":
        # CIRCLEはOCSで定義されている
        center_ocs = entity.dxf.center
        extrusion = entity.dxf.extrusion  # 法線ベクトル
        
        # OCSからWCSへの変換が必要な場合
        # （詳細は coordinate-systems.md を参照）
        # ここでは簡略化した例を示す
        if extrusion != (0, 0, 1):
            # 任意軸アルゴリズムを使用した変換が必要
            # ezdxfの変換機能を使用
            from ezdxf.math import OCS
            ocs = OCS(extrusion)
            center_wcs = ocs.to_wcs(center_ocs)
            return center_wcs
        else:
            # デフォルトの法線ベクトルの場合は変換不要
            return center_ocs
    else:
        # LINEなどは直接WCS座標
        return entity.dxf.start
```

#### レイヤー存在確認の不備

**間違いの例**:
```python
# ❌ 悪い例: レイヤーの存在確認なし
entity.dxf.layer = "SomeLayer"  # 存在しないレイヤーを参照
```

**正しい実装**:
```python
# ✅ 良い例: レイヤーの存在確認
def set_entity_layer(doc, entity, layer_name):
    """エンティティのレイヤーを安全に設定"""
    # レイヤーの存在確認
    if layer_name not in doc.layers:
        # レイヤーが存在しない場合は作成
        doc.layers.new(layer_name, dxfattribs={'color': 7})
        print(f"レイヤー '{layer_name}' を作成しました")
    
    # レイヤーを設定
    entity.dxf.layer = layer_name
```

#### ブロック参照の循環参照

**問題**: ブロックが自分自身を参照するなど、循環参照が発生すると無限ループになる。

**対処法**:
```python
import ezdxf

def check_block_circular_reference(doc, block_name, visited=None):
    """ブロックの循環参照をチェック"""
    if visited is None:
        visited = set()
    
    if block_name in visited:
        raise ValueError(f"循環参照が検出されました: {block_name}")
    
    visited.add(block_name)
    
    # ブロック定義を取得
    if block_name not in doc.blocks:
        return False
    
    block = doc.blocks[block_name]
    
    # ブロック内のINSERTエンティティをチェック
    for entity in block:
        if entity.dxftype() == "INSERT":
            referenced_block = entity.dxf.name
            if referenced_block == block_name:
                raise ValueError(f"ブロック '{block_name}' が自分自身を参照しています")
            check_block_circular_reference(doc, referenced_block, visited.copy())
    
    return False  # 循環参照なし
```

#### ハンドルの手動操作

**問題**: ハンドルを手動で設定すると、重複や不正な値が発生する可能性があります。

**対処法**:
```python
import ezdxf

# ✅ 良い例: ハンドルは自動生成に任せる
doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# ハンドルは自動的に割り当てられる
print(f"ハンドル: {line.dxf.handle}")

# ❌ 悪い例: ハンドルを手動で設定しない
# line.dxf.handle = "123"  # これは避けるべき
```

#### エンティティ削除後の参照

**問題**: 削除したエンティティへの参照が残っているとエラーが発生します。

**対処法**:
```python
import ezdxf

def safe_delete_entities(msp, condition):
    """条件に合致するエンティティを安全に削除"""
    # まず削除対象を収集
    entities_to_delete = [e for e in msp if condition(e)]
    
    # 削除を実行
    for entity in entities_to_delete:
        msp.delete_entity(entity)
    
    return len(entities_to_delete)

# 使用例
doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# LINEエンティティを削除
deleted_count = safe_delete_entities(msp, lambda e: e.dxftype() == "LINE")
print(f"{deleted_count}個のエンティティを削除しました")
```

#### スプラインの互換性問題

**問題**: Fit Points（通過点）のみでスプラインを作成すると、異なるCADソフト間で曲線の形状が変わる可能性があります。

**間違いの例**:
```python
# ❌ 悪い例: Fit Pointsのみで作成（互換性に問題がある可能性）
fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = msp.add_spline(fit_points)  # 制御点が自動生成される
```

**正しい実装**:
```python
# ✅ 良い例: 制御点とノットベクトルを明示的に指定
import ezdxf

def create_compatible_spline(msp, control_points, degree=3):
    """互換性を確保したスプライン作成"""
    n = len(control_points)
    order = degree + 1
    
    # 開いた一様ノットベクトルを生成
    knots = [0] * order
    knots.extend(range(1, n - degree + 1))
    knots.extend([n - degree] * order)
    
    # 制御点とノットベクトルを明示的に指定
    spline = msp.add_spline_control_frame(
        control_points=control_points,
        degree=degree,
        knots=knots
    )
    return spline

# 使用例
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = create_compatible_spline(msp, control_points)
```

**注意点**:
- Fit Pointsから制御点への変換アルゴリズムはCADソフトごとに異なる
- 互換性を重視する場合は、必ず制御点とノットベクトルを明示的に指定する
- R12以前のバージョンではSPLINEが使用不可（ポリラインで近似が必要）

### 5.4 データ整合性のリスク

#### 単位系の不一致

**問題**: `$INSUNITS`ヘッダー変数と実際の座標値の単位が一致しない。

**対処法**:
```python
import ezdxf

def get_drawing_units(doc):
    """図面の単位系を取得"""
    insunits = doc.header.get('$INSUNITS', 0)
    unit_map = {
        0: 'unitless',
        1: 'inches',
        2: 'feet',
        3: 'miles',
        4: 'millimeters',
        5: 'centimeters',
        6: 'meters',
        7: 'kilometers',
        8: 'microinches',
        9: 'mils',
        10: 'yards',
        11: 'angstroms',
        12: 'nanometers',
        13: 'microns',
        14: 'decimeters',
        15: 'decameters',
        16: 'hectometers',
        17: 'gigameters',
        18: 'astronomical_units',
        19: 'light_years',
        20: 'parsecs'
    }
    return unit_map.get(insunits, 'unknown')

def set_drawing_units(doc, unit_name):
    """図面の単位系を設定"""
    unit_map = {
        'inches': 1,
        'feet': 2,
        'millimeters': 4,
        'centimeters': 5,
        'meters': 6,
    }
    if unit_name not in unit_map:
        raise ValueError(f"無効な単位: {unit_name}")
    doc.header['$INSUNITS'] = unit_map[unit_name]

# 使用例
doc = ezdxf.new('R2010')
set_drawing_units(doc, 'millimeters')
print(f"単位系: {get_drawing_units(doc)}")
```

#### スケールの問題

**問題**: ブロックインサート時のスケール設定ミス。

**対処法**:
```python
import ezdxf

def insert_block_safely(msp, block_name, insert_point, scale=(1, 1, 1)):
    """ブロックを安全にインサート"""
    doc = msp.doc
    
    # ブロックの存在確認
    if block_name not in doc.blocks:
        raise ValueError(f"ブロック '{block_name}' が見つかりません")
    
    # スケール値の検証
    scale = tuple(float(s) for s in scale)
    if any(s <= 0 for s in scale):
        raise ValueError(f"スケールは正の値である必要があります: {scale}")
    
    # ブロックをインサート
    insert = msp.add_blockref(block_name, insert_point, dxfattribs={
        'xscale': scale[0],
        'yscale': scale[1],
        'zscale': scale[2]
    })
    
    return insert
```

#### 回転角度の単位

**問題**: 度とラジアンの混同。

**対処法**:
```python
import math

def degrees_to_radians(degrees):
    """度をラジアンに変換"""
    return math.radians(degrees)

def radians_to_degrees(radians):
    """ラジアンを度に変換"""
    return math.degrees(radians)

# ezdxfでは、角度は通常度で指定される
doc = ezdxf.new('R2010')
msp = doc.modelspace()

# ARCの作成（角度は度で指定）
msp.add_arc((0, 0), radius=5, start_angle=0, end_angle=90)  # 0度から90度

# ラジアンから度への変換が必要な場合
angle_rad = math.pi / 4  # 45度（ラジアン）
angle_deg = radians_to_degrees(angle_rad)
msp.add_arc((10, 0), radius=5, start_angle=0, end_angle=angle_deg)
```

#### 色の扱い

**問題**: ACI（AutoCAD Color Index）、True Color、ByLayerの混乱。

**対処法**:
```python
import ezdxf

def set_entity_color_safely(entity, color):
    """エンティティの色を安全に設定"""
    # colorが整数の場合（ACI）
    if isinstance(color, int):
        if 0 <= color <= 256:
            entity.dxf.color = color
        else:
            raise ValueError(f"無効なACI色: {color}")
    # colorがタプルの場合（True Color RGB）
    elif isinstance(color, (tuple, list)) and len(color) == 3:
        r, g, b = color
        if all(0 <= c <= 255 for c in (r, g, b)):
            # True Colorを設定（DXF R2004以降）
            entity.dxf.true_color = ezdxf.rgb(r, g, b)
        else:
            raise ValueError(f"無効なRGB値: {color}")
    # ByLayerの場合
    elif color == "ByLayer" or color == 256:
        entity.dxf.color = 256
    else:
        raise ValueError(f"無効な色指定: {color}")

# 使用例
doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# ACI色（1=赤）
set_entity_color_safely(line, 1)

# True Color（RGB）
line2 = msp.add_line((0, 5), (10, 15))
set_entity_color_safely(line2, (255, 0, 0))  # 赤

# ByLayer
line3 = msp.add_line((0, 10), (10, 20))
set_entity_color_safely(line3, "ByLayer")
```

### 5.5 パフォーマンスとリソース管理

#### メモリリーク

**問題**: 大きなファイルを繰り返し処理する際にメモリリークが発生する可能性があります。

**対処法**:
```python
import ezdxf
import gc

def process_multiple_files(file_paths):
    """複数のファイルを処理（メモリ効率的）"""
    results = []
    
    for file_path in file_paths:
        # ファイルを処理
        doc = ezdxf.readfile(file_path)
        msp = doc.modelspace()
        
        # 必要な処理を実行
        count = sum(1 for e in msp if e.dxftype() == "LINE")
        results.append(count)
        
        # 明示的に参照を削除
        del doc, msp
        
        # ガベージコレクションを実行（必要に応じて）
        if len(results) % 10 == 0:
            gc.collect()
    
    return results
```

#### ファイルハンドルのクローズ

**問題**: ファイルハンドルが適切にクローズされないと、リソースリークが発生します。

**対処法**:
```python
import ezdxf
from contextlib import contextmanager

@contextmanager
def open_dxf(file_path):
    """コンテキストマネージャーを使用した安全なファイル操作"""
    doc = None
    try:
        doc = ezdxf.readfile(file_path)
        yield doc
    finally:
        # 明示的なクリーンアップは通常不要（ezdxfが自動処理）
        # ただし、カスタムリソースがある場合はここで処理
        pass

# 使用例
with open_dxf("drawing.dxf") as doc:
    msp = doc.modelspace()
    for entity in msp:
        print(entity.dxftype())
# ここで自動的にクリーンアップされる
```

#### イテレータの使い方

**問題**: 大きなファイルでリストに変換するとメモリを大量に消費します。

**対処法**:
```python
import ezdxf

def process_entities_efficiently(doc):
    """メモリ効率的にエンティティを処理"""
    msp = doc.modelspace()
    
    # ❌ 悪い例: リストに変換（メモリを大量に消費）
    # entities = list(msp)  # 避けるべき
    
    # ✅ 良い例: イテレータを直接使用
    line_count = 0
    circle_count = 0
    
    for entity in msp:  # イテレータを直接使用
        if entity.dxftype() == "LINE":
            line_count += 1
        elif entity.dxftype() == "CIRCLE":
            circle_count += 1
    
    return line_count, circle_count
```

#### バッチ処理の最適化

**問題**: 複数ファイルの処理が遅い。

**対処法**:
```python
import ezdxf
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing

def process_single_file(file_path):
    """単一ファイルを処理"""
    try:
        doc = ezdxf.readfile(str(file_path))
        msp = doc.modelspace()
        count = sum(1 for e in msp)
        return file_path, count, None
    except Exception as e:
        return file_path, 0, str(e)

def process_files_parallel(file_paths, max_workers=None):
    """複数ファイルを並列処理"""
    if max_workers is None:
        max_workers = min(multiprocessing.cpu_count(), len(file_paths))
    
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_single_file, path) for path in file_paths]
        for future in futures:
            file_path, count, error = future.result()
            if error:
                print(f"エラー ({file_path}): {error}")
            else:
                results.append((file_path, count))
    
    return results

# 使用例
file_paths = list(Path(".").glob("*.dxf"))
results = process_files_parallel(file_paths)
for file_path, count in results:
    print(f"{file_path}: {count}個のエンティティ")
```

---

## 6. 重要な注意点とトラブルシューティング

### 文字エンコーディングの問題

詳細は [よくある罠と対処法](./common-pitfalls.md#1-文字エンコーディングの問題) を参照してください。

**ezdxfでの対処法**:
```python
import ezdxf

# ezdxfは自動的にエンコーディングを処理しますが、
# 古いバージョンのファイルでは問題が発生する可能性があります

# R2010以降はUTF-8が標準なので問題なし
doc = ezdxf.new('R2010')
msp = doc.modelspace()
msp.add_text("日本語テキスト", dxfattribs={'height': 2.5})

# R12やR2000の場合は注意が必要
# 可能な限り新しいバージョンを使用することを推奨
```

### 座標系の扱い

詳細は [座標系 (WCS/OCS/AAA)](../geometry/coordinate-systems.md) を参照してください。

**ezdxfでのOCS変換**:
```python
import ezdxf
from ezdxf.math import OCS, Vec3

def convert_ocs_to_wcs(entity):
    """OCS座標をWCS座標に変換"""
    if hasattr(entity.dxf, 'extrusion'):
        extrusion = Vec3(entity.dxf.extrusion)
        ocs = OCS(extrusion)
        
        if entity.dxftype() == "CIRCLE":
            center_ocs = Vec3(entity.dxf.center)
            center_wcs = ocs.to_wcs(center_ocs)
            return center_wcs
    return None
```

### 単位系の設定

```python
import ezdxf

doc = ezdxf.new('R2010')

# 単位系の設定
doc.header['$INSUNITS'] = 4  # 4 = millimeters

# 単位系の確認
insunits = doc.header.get('$INSUNITS', 0)
print(f"単位系コード: {insunits}")
```

### レイヤーと線種の管理

```python
import ezdxf

doc = ezdxf.new('R2010')

# レイヤーの作成と管理
def get_or_create_layer(doc, layer_name, color=7):
    """レイヤーを取得、存在しない場合は作成"""
    if layer_name not in doc.layers:
        doc.layers.new(layer_name, dxfattribs={'color': color})
    return doc.layers.get(layer_name)

# 使用例
layer = get_or_create_layer(doc, "MyLayer", color=1)
msp = doc.modelspace()
msp.add_line((0, 0), (10, 10), dxfattribs={'layer': 'MyLayer'})
```

### ブロックとインサートの扱い

詳細は [ブロックとインサート](../geometry/blocks-and-inserts.md) を参照してください。

```python
import ezdxf

doc = ezdxf.new('R2010')

# ブロック定義の作成
block = doc.blocks.new("MyBlock")
block.add_line((0, 0), (10, 10))
block.add_circle((5, 5), radius=2.5)

# ブロックのインサート
msp = doc.modelspace()
msp.add_blockref("MyBlock", (0, 0))
msp.add_blockref("MyBlock", (20, 0), dxfattribs={'rotation': 45})
```

### ハンドルの扱い

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# ハンドルは自動的に割り当てられる
handle = line.dxf.handle
print(f"ハンドル: {handle}")

# ハンドルでエンティティを検索（通常は不要）
# ezdxfが自動的に管理するため、手動での操作は推奨されない
```

### パフォーマンスの考慮

大きなファイルの処理については、[パーサーの設計](./parsing-strategy.md) を参照してください。

**ezdxfでの最適化**:
```python
import ezdxf
from ezdxf.addons.iterdxf import opendxf

# 巨大なファイルの場合はiterdxfアドオンを使用
with opendxf("huge_file.dxf") as doc:
    for entity in doc.modelspace():
        # エンティティを1つずつ処理
        pass
```

---

## 7. 実践的な例

### シンプルな図面の作成

```python
import ezdxf

def create_simple_drawing():
    """シンプルな図面を作成"""
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()
    
    # レイヤーの作成
    doc.layers.new("Lines", dxfattribs={'color': 1})  # 赤
    doc.layers.new("Circles", dxfattribs={'color': 2})  # 黄
    
    # 線を追加
    msp.add_line((0, 0), (10, 0), dxfattribs={'layer': 'Lines'})
    msp.add_line((10, 0), (10, 10), dxfattribs={'layer': 'Lines'})
    msp.add_line((10, 10), (0, 10), dxfattribs={'layer': 'Lines'})
    msp.add_line((0, 10), (0, 0), dxfattribs={'layer': 'Lines'})
    
    # 円を追加
    msp.add_circle((5, 5), radius=3, dxfattribs={'layer': 'Circles'})
    
    # テキストを追加
    msp.add_text("Simple Drawing", dxfattribs={'height': 1.0}).set_placement((2, 12))
    
    return doc

# 使用例
doc = create_simple_drawing()
doc.saveas("simple_drawing.dxf")
```

### 既存ファイルの読み込みと変更

```python
import ezdxf
from pathlib import Path
import shutil

def modify_existing_dxf(input_path, output_path):
    """既存ファイルを読み込んで変更"""
    # バックアップの作成
    if Path(output_path).exists():
        backup_path = Path(output_path).with_suffix('.bak')
        shutil.copy2(output_path, backup_path)
        print(f"バックアップを作成: {backup_path}")
    
    # ファイルの読み込み
    doc = ezdxf.readfile(input_path)
    msp = doc.modelspace()
    
    # すべてのLINEエンティティの色を変更
    for entity in msp:
        if entity.dxftype() == "LINE":
            entity.dxf.color = 1  # 赤に変更
    
    # 新しいエンティティを追加
    msp.add_circle((0, 0), radius=5, dxfattribs={'color': 2})
    
    # 保存
    doc.saveas(output_path)
    print(f"保存完了: {output_path}")

# 使用例
modify_existing_dxf("input.dxf", "output.dxf")
```

### エンティティの変換とフィルタリング

```python
import ezdxf
from ezdxf import query

def filter_and_convert_entities(input_path, output_path):
    """エンティティをフィルタリングして変換"""
    doc = ezdxf.readfile(input_path)
    msp = doc.modelspace()
    
    # 特定の条件のエンティティを検索
    # 例: レイヤー "0" のLINEエンティティ
    lines = query(msp).filter(
        lambda e: e.dxftype() == "LINE" and e.dxf.layer == "0"
    )
    
    # 新しいファイルを作成
    new_doc = ezdxf.new('R2010')
    new_msp = new_doc.modelspace()
    
    # エンティティをコピー（新しいレイヤーに移動）
    new_doc.layers.new("FilteredLines", dxfattribs={'color': 3})  # 緑
    
    for line in lines:
        new_msp.add_line(
            line.dxf.start,
            line.dxf.end,
            dxfattribs={'layer': 'FilteredLines', 'color': 3}
        )
    
    new_doc.saveas(output_path)
    print(f"フィルタリング完了: {output_path}")

# 使用例
filter_and_convert_entities("input.dxf", "filtered.dxf")
```

### バッチ処理の例

```python
import ezdxf
from pathlib import Path

def batch_process_dxf_files(input_dir, output_dir, processor_func):
    """複数のDXFファイルをバッチ処理"""
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    dxf_files = list(input_dir.glob("*.dxf"))
    
    for dxf_file in dxf_files:
        try:
            # ファイルを処理
            result = processor_func(dxf_file)
            
            # 結果を保存
            output_file = output_dir / dxf_file.name
            result.saveas(str(output_file))
            print(f"処理完了: {dxf_file.name}")
        except Exception as e:
            print(f"エラー ({dxf_file.name}): {e}")

def process_file(file_path):
    """単一ファイルを処理する関数"""
    doc = ezdxf.readfile(str(file_path))
    msp = doc.modelspace()
    
    # すべてのエンティティをレイヤー "Processed" に移動
    doc.layers.new("Processed", dxfattribs={'color': 5})  # 青
    
    for entity in msp:
        entity.dxf.layer = "Processed"
    
    return doc

# 使用例
batch_process_dxf_files("input/", "output/", process_file)
```

### 安全なファイル操作のパターン

```python
import ezdxf
from pathlib import Path
import shutil
from datetime import datetime

def safe_file_operation(input_path, output_path, operation_func, create_backup=True):
    """安全なファイル操作（バックアップ、エラーハンドリング付き）"""
    input_path = Path(input_path)
    output_path = Path(output_path)
    
    # 入力ファイルの存在確認
    if not input_path.exists():
        raise FileNotFoundError(f"入力ファイルが見つかりません: {input_path}")
    
    # バックアップの作成
    if create_backup and output_path.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = output_path.with_suffix(f'.{timestamp}.bak')
        shutil.copy2(output_path, backup_path)
        print(f"バックアップを作成: {backup_path}")
    
    # 一時ファイルに保存
    temp_path = output_path.with_suffix('.tmp')
    
    try:
        # 操作を実行
        result = operation_func(input_path)
        
        # 一時ファイルに保存
        result.saveas(str(temp_path))
        
        # 成功したらリネーム（アトミック操作）
        temp_path.replace(output_path)
        print(f"操作完了: {output_path}")
        
        return True
    except Exception as e:
        # エラー時は一時ファイルを削除
        if temp_path.exists():
            temp_path.unlink()
        print(f"エラー: {e}")
        raise
    finally:
        # クリーンアップ
        pass

# 使用例
def my_operation(input_path):
    """カスタム操作"""
    doc = ezdxf.readfile(str(input_path))
    msp = doc.modelspace()
    
    # 何らかの処理
    for entity in msp:
        if entity.dxftype() == "LINE":
            entity.dxf.color = 1
    
    return doc

safe_file_operation("input.dxf", "output.dxf", my_operation, create_backup=True)
```

---

## 8. 高度な機能

### カスタムデータ（XDATA）の追加

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# XDATA（拡張データ）の追加
line.set_xdata("MYAPP", [
    (1000, "CustomString"),
    (1040, 3.14159),
    (1070, 42)
])

# XDATAの取得
xdata = line.get_xdata("MYAPP")
if xdata:
    for code, value in xdata:
        print(f"Code {code}: {value}")
```

### 拡張辞書の使用

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# 拡張辞書の作成
xdict = doc.objects.new_dict("MYDICT")
xdict["CustomKey"] = "CustomValue"

# エンティティに拡張辞書を関連付け
line.dxf.owner = xdict.dxf.handle
```

### 外部参照（XREF）の扱い

```python
import ezdxf

# 外部参照のアタッチ（ezdxfのアドオン機能を使用）
# 詳細は公式ドキュメントを参照してください
# https://ezdxf.readthedocs.io/en/stable/addons/xref.html
```

### 寸法（DIMENSION）の作成

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# 寸法スタイルの作成
dimstyle = doc.dimstyles.new("MyDimStyle")
dimstyle.dxf.dimtxt = 2.5  # テキスト高さ
dimstyle.dxf.dimasz = 2.5  # 矢印サイズ

# 線形寸法の作成
msp.add_linear_dim(
    base=(0, 0),
    p1=(0, 0),
    p2=(10, 0),
    dimstyle="MyDimStyle"
)

# 半径寸法の作成
msp.add_radius_dim(
    center=(5, 5),
    radius=3.0,
    dimstyle="MyDimStyle"
)
```

### スプライン、NURBS、B-splineの対応

ezdxfは、DXFの **SPLINE** エンティティを完全にサポートしており、B-splineとNURBS（Non-Uniform Rational B-Spline）の両方に対応しています。

#### 対応状況の概要

| 機能 | 対応状況 | 備考 |
| :--- | :--- | :--- |
| **SPLINEエンティティ** | ✅ 完全対応 | DXF R13以降で利用可能 |
| **B-spline（非有理）** | ✅ 完全対応 | 制御点とノットベクトルで定義 |
| **NURBS（有理B-spline）** | ✅ 完全対応 | 重み付き制御点で定義 |
| **Fit Points（通過点）** | ✅ 完全対応 | 曲線が通過する点から自動生成 |
| **Control Points（制御点）** | ✅ 完全対応 | 明示的な制御点とノットベクトル |
| **Rational Splines（有理スプライン）** | ✅ 完全対応 | 重み（weights）による制御 |

#### SPLINEエンティティの作成方法

ezdxfでは、複数の方法でスプラインを作成できます。

##### 1. Fit Points（通過点）による作成（最も簡単）

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# 通過点を指定してスプラインを作成
fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = msp.add_spline(fit_points)

# 開始・終了時の接線方向を指定することも可能
spline_with_tangents = msp.add_spline(
    fit_points,
    start_tangent=(1, 0),  # 開始時の接線方向
    end_tangent=(0, 1)     # 終了時の接線方向
)
```

**注意**: Fit pointsから制御点への変換は、CADソフトごとに異なるアルゴリズムを使用するため、**異なるCADソフト間で完全に同じ曲線になるとは限りません**。

##### 2. Control Points（制御点）による作成（推奨）

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# 制御点を明示的に指定
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
degree = 3  # 3次スプライン（cubic）

# 開いたスプライン（開始点と終了点が一致しない）
spline_open = msp.add_open_spline(control_points, degree=degree)

# 閉じたスプライン（開始点と終了点が一致）
spline_closed = msp.add_closed_spline(control_points, degree=degree)
```

##### 3. NURBS（有理B-spline）の作成

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# 制御点と重みを指定
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
weights = [1.0, 2.0, 1.0, 1.0]  # 各制御点の重み

# 有理スプライン（NURBS）を作成
spline_rational = msp.add_rational_spline(
    control_points,
    weights=weights,
    degree=3
)

# 閉じた有理スプライン
spline_closed_rational = msp.add_closed_rational_spline(
    control_points,
    weights=weights,
    degree=3
)
```

#### ノットベクトルの明示的な指定

より高度な制御が必要な場合は、ノットベクトルを明示的に指定できます。

```python
import ezdxf
from ezdxf.math import BSpline

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# 制御点とノットベクトルを指定
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
knots = [0, 0, 0, 0, 1, 1, 1, 1]  # ノットベクトル（開いた一様ノット）
degree = 3

# BSplineオブジェクトを作成
bspline = BSpline(control_points, order=degree + 1, knots=knots)

# SPLINEエンティティとして追加
spline = msp.add_spline_control_frame(
    control_points=control_points,
    degree=degree,
    knots=knots
)
```

#### ezdxf.mathモジュールの高度な機能

ezdxfの `math` モジュールには、スプライン操作のための豊富な機能が用意されています。

```python
import ezdxf
from ezdxf.math import (
    BSpline,
    global_bspline_interpolation,
    local_cubic_bspline_interpolation,
    bezier_decomposition,
    cubic_bezier_approximation
)

# 1. グローバルB-spline補間（通過点から制御点を生成）
fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
bspline = global_bspline_interpolation(
    fit_points,
    degree=3,
    method='chord'  # 'chord', 'uniform', 'centripetal' から選択
)

# 2. ローカル3次B-spline補間（短い曲線に適している）
bspline_local = local_cubic_bspline_interpolation(fit_points)

# 3. B-splineをベジェセグメントに分解（レンダリング用）
bezier_segments = bezier_decomposition(bspline)

# 4. 任意のB-splineを3次ベジェ曲線で近似
bezier_approx = cubic_bezier_approximation(bspline, segments=10)
```

#### スプラインの読み込みと操作

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# SPLINEエンティティを検索
for entity in msp:
    if entity.dxftype() == "SPLINE":
        # スプラインのプロパティを取得
        print(f"次数: {entity.dxf.degree}")
        print(f"制御点数: {len(entity.control_points)}")
        print(f"通過点数: {len(entity.fit_points) if entity.fit_points else 0}")
        print(f"ノット数: {len(entity.knots)}")
        
        # 有理スプライン（NURBS）かどうか
        if entity.dxf.flags & 4:  # RATIONAL_SPLINE フラグ
            print("NURBS（有理スプライン）")
            print(f"重み: {entity.weights}")
        
        # 閉じたスプラインかどうか
        if entity.dxf.flags & 1:  # CLOSED_SPLINE フラグ
            print("閉じたスプライン")
        
        # 制御点の取得
        for i, point in enumerate(entity.control_points):
            print(f"制御点 {i}: ({point.x}, {point.y}, {point.z})")
```

#### 他のCADとの互換性と一意性の問題

**重要な注意点**: DXFのSPLINEエンティティは、**Fit Points（通過点）のみが指定されている場合、制御点への変換がCADソフトごとに異なる可能性があります**。

##### 問題の原因

1. **Fit Pointsから制御点への変換アルゴリズムがCADごとに異なる**
   - AutoCAD、BricsCAD、LibreCADなど、それぞれ異なるアルゴリズムを使用
   - 同じFit Pointsでも、異なるCADソフトで開くと曲線の形状が変わる可能性がある

2. **ノットベクトルの生成方法が異なる**
   - Uniform（一様）、Chord Length（弦長）、Centripetal（中心距離）など、様々な方法がある

##### 解決策：制御点とノットベクトルを明示的に指定

**互換性を確保するには、Fit Pointsではなく、制御点とノットベクトルを明示的に指定することを強く推奨します。**

```python
import ezdxf

def create_compatible_spline(msp, control_points, degree=3):
    """他のCADソフトとの互換性を確保したスプライン作成"""
    # 開いた一様ノットベクトルを生成（標準的な方法）
    n = len(control_points)
    order = degree + 1
    
    # 開いた一様ノットベクトル
    knots = []
    # 開始ノット（degree+1個）
    knots.extend([0] * order)
    # 中間ノット（一様分布）
    for i in range(1, n - degree):
        knots.append(i)
    # 終了ノット（degree+1個）
    knots.extend([n - degree] * order)
    
    # 制御点とノットベクトルを明示的に指定して作成
    spline = msp.add_spline_control_frame(
        control_points=control_points,
        degree=degree,
        knots=knots
    )
    
    return spline

# 使用例
doc = ezdxf.new('R2010')
msp = doc.modelspace()

control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = create_compatible_spline(msp, control_points)
doc.saveas("compatible_spline.dxf")
```

##### DXFバージョンによる互換性

| DXFバージョン | SPLINE対応 | 推奨用途 |
| :--- | :--- | :--- |
| **R12以前** | ❌ 非対応 | SPLINEは使用不可。ポリラインで近似する必要がある |
| **R13以降** | ✅ 対応 | SPLINEエンティティが使用可能 |
| **R2000以降** | ✅ 完全対応 | ハンドルによる参照が可能。推奨 |

**推奨**: スプラインを含む図面は、**R2000以降のバージョン**で保存することを推奨します。

##### 他のCADソフトとの互換性テスト

```python
import ezdxf

def test_spline_compatibility():
    """スプラインの互換性をテスト"""
    # テスト用の制御点
    control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
    
    # 方法1: Fit Pointsのみ（互換性に問題がある可能性）
    doc1 = ezdxf.new('R2010')
    msp1 = doc1.modelspace()
    fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
    spline1 = msp1.add_spline(fit_points)
    doc1.saveas("test_fit_points.dxf")
    
    # 方法2: 制御点とノットベクトルを明示（推奨）
    doc2 = ezdxf.new('R2010')
    msp2 = doc2.modelspace()
    spline2 = create_compatible_spline(msp2, control_points)
    doc2.saveas("test_control_points.dxf")
    
    print("テストファイルを作成しました。")
    print("異なるCADソフトで開いて、曲線の形状が一致するか確認してください。")

test_spline_compatibility()
```

#### スプラインの変換と近似

他の形式に変換する必要がある場合：

```python
import ezdxf
from ezdxf.math import BSpline, bezier_decomposition, cubic_bezier_approximation

def convert_spline_to_polyline(spline_entity, segments=100):
    """スプラインをポリラインに変換（近似）"""
    # BSplineオブジェクトを作成
    bspline = BSpline(
        spline_entity.control_points,
        order=spline_entity.dxf.degree + 1,
        knots=spline_entity.knots
    )
    
    # スプライン上に点をサンプリング
    points = []
    for i in range(segments + 1):
        t = i / segments
        point = bspline.point(t)
        points.append((point.x, point.y))
    
    return points

# 使用例
doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()
new_doc = ezdxf.new('R2010')
new_msp = new_doc.modelspace()

for entity in msp:
    if entity.dxftype() == "SPLINE":
        # スプラインをポリラインに変換
        points = convert_spline_to_polyline(entity)
        new_msp.add_lwpolyline(points)

new_doc.saveas("converted.dxf")
```

#### まとめ：スプライン使用時のベストプラクティス

1. **制御点とノットベクトルを明示的に指定する**
   - Fit Pointsのみに依存しない
   - 他のCADソフトとの互換性が向上

2. **DXFバージョンはR2000以降を使用する**
   - R12以前ではSPLINEが使用不可

3. **有理スプライン（NURBS）が必要な場合のみ重みを使用**
   - 通常のB-splineで十分な場合は、重みを使わない

4. **テストを実施する**
   - 異なるCADソフトで開いて、曲線の形状が一致するか確認

5. **必要に応じて近似を使用**
   - レンダリングや加工機がSPLINEをサポートしない場合、ポリラインやベジェ曲線に変換

### 点列から曲線への変換：判断基準と実装

点列で表現された曲線をDXFにエクスポートする際、**曲線エンティティ（ARC、SPLINE）に変換すべきか、それとも点列のまま（LINEやLWPOLYLINE）として出力すべきか**は、用途と互換性によって判断が分かれます。

::: tip 詳細な背景情報
加工機がSPLINEをサポートしない理由について、技術的な背景を詳しく知りたい場合は、[加工機とDXFの互換性](./cnc-machine-compatibility.md)を参照してください。
:::

#### 判断基準：変換 vs 点列のまま

以下の表に、用途別の推奨方法をまとめます：

| 用途 | 推奨方法 | 理由 |
| :--- | :--- | :--- |
| **CNC加工機・レーザー加工機** | **点列のまま（LWPOLYLINE）** | 多くの加工機はSPLINEをサポートせず、点列を直接使用する |
| **古いCADソフト（R12以前）** | **点列のまま（LWPOLYLINE）** | SPLINEが使用不可 |
| **CAD編集・設計** | **曲線エンティティ（ARC/SPLINE）** | 編集しやすく、ファイルサイズが小さい |
| **高精度な曲線表現** | **曲線エンティティ（SPLINE）** | 数学的に正確な曲線を表現可能 |
| **互換性重視** | **点列のまま（LWPOLYLINE）** | すべてのCADソフトで確実に読み込める |
| **ファイルサイズ重視** | **曲線エンティティ（ARC/SPLINE）** | 点列より大幅にファイルサイズが小さい |

#### 実装方法

##### 1. 点列のまま出力（LWPOLYLINE）

**推奨される場合**:
- CNC加工機やレーザー加工機への出力
- 古いCADソフトとの互換性が必要
- 点列が既に加工用に最適化されている

```python
import ezdxf

def export_points_as_polyline(points, output_path, closed=False):
    """点列をLWPOLYLINEとして出力"""
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()
    
    # LWPOLYLINEとして追加
    msp.add_lwpolyline(
        points,
        dxfattribs={'flags': 1 if closed else 0}  # 1=閉じた線
    )
    
    doc.saveas(output_path)
    print(f"点列をLWPOLYLINEとして出力: {len(points)}個の点")

# 使用例
points = [(0, 0), (5, 10), (10, 5), (15, 15), (20, 10)]
export_points_as_polyline(points, "output_polyline.dxf", closed=False)
```

**メリット**:
- ✅ すべてのCADソフトで確実に読み込める
- ✅ 加工機で直接使用可能
- ✅ 点列の精度をそのまま保持

**デメリット**:
- ❌ ファイルサイズが大きくなる（点が多い場合）
- ❌ CADソフトでの編集が困難（点を個別に編集する必要がある）

##### 2. ARCへの変換（円弧の場合）

**推奨される場合**:
- 点列が円弧の一部であることが明確
- 円弧として表現できる精度がある

```python
import ezdxf
from ezdxf.math import Vec3
import math

def fit_arc_to_points(points, tolerance=1e-6):
    """点列を円弧にフィッティング"""
    if len(points) < 3:
        return None
    
    # 3点から円弧を計算（簡略化した例）
    p1 = Vec3(points[0])
    p2 = Vec3(points[len(points) // 2])
    p3 = Vec3(points[-1])
    
    # 3点から円の中心と半径を計算
    # （実際の実装では、より高度なフィッティングアルゴリズムを使用）
    # ここでは簡略化した例を示す
    
    # 実際の実装では、最小二乗法などで最適な円弧を求める
    # ezdxfには直接的なフィッティング機能はないため、
    # 外部ライブラリ（scipy等）を使用することを推奨
    
    return None  # 実装例のため省略

def export_points_as_arc_if_possible(points, output_path, tolerance=1e-3):
    """点列が円弧に適合する場合はARCとして出力"""
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()
    
    # 円弧フィッティングを試みる
    arc_params = fit_arc_to_points(points, tolerance)
    
    if arc_params:
        # ARCとして出力
        center, radius, start_angle, end_angle = arc_params
        msp.add_arc(
            center,
            radius,
            start_angle,
            end_angle
        )
        print("点列をARCとして出力")
    else:
        # 円弧に適合しない場合はLWPOLYLINEとして出力
        msp.add_lwpolyline(points)
        print("点列をLWPOLYLINEとして出力（円弧に適合しない）")
    
    doc.saveas(output_path)
```

**注意**: ezdxfには直接的な円弧フィッティング機能がないため、`scipy`などの外部ライブラリを使用する必要があります。

##### 3. SPLINEへの変換（一般的な曲線）

**推奨される場合**:
- 点列が複雑な曲線を表現している
- CADソフトでの編集が必要
- ファイルサイズを小さくしたい

```python
import ezdxf
from ezdxf.math import global_bspline_interpolation

def export_points_as_spline(points, output_path, degree=3, method='chord'):
    """点列をSPLINEとして出力"""
    doc = ezdxf.new('R2010')  # R2000以降を推奨
    msp = doc.modelspace()
    
    # 方法1: Fit Pointsを使用（簡単だが互換性に注意）
    spline = msp.add_spline(points)
    
    # 方法2: 制御点を明示的に計算（推奨、互換性が高い）
    from ezdxf.math import global_bspline_interpolation
    
    bspline = global_bspline_interpolation(
        points,
        degree=degree,
        method=method  # 'chord', 'uniform', 'centripetal'
    )
    
    # 制御点とノットベクトルを取得
    control_points = bspline.control_points
    knots = bspline.knots()
    
    # SPLINEエンティティとして追加
    spline = msp.add_spline_control_frame(
        control_points=control_points,
        degree=degree,
        knots=knots
    )
    
    doc.saveas(output_path)
    print(f"点列をSPLINEとして出力: {len(points)}個の点 -> {len(control_points)}個の制御点")

# 使用例
points = [(0, 0), (5, 10), (10, 5), (15, 15), (20, 10), (25, 5)]
export_points_as_spline(points, "output_spline.dxf", degree=3, method='chord')
```

**メリット**:
- ✅ ファイルサイズが小さい（点列より大幅に削減）
- ✅ CADソフトでの編集が容易
- ✅ 数学的に正確な曲線表現

**デメリット**:
- ❌ 古いCADソフトや加工機では読み込めない可能性
- ❌ Fit Pointsのみの場合、CADソフト間で形状が変わる可能性

##### 4. ハイブリッドアプローチ（推奨）

用途に応じて自動的に最適な形式を選択する方法です。

```python
import ezdxf
from ezdxf.math import global_bspline_interpolation
from pathlib import Path

def export_curve_intelligently(
    points,
    output_path,
    target_cad_version='R2010',
    target_use='cnc',  # 'cnc', 'cad', 'universal'
    tolerance=1e-3
):
    """用途に応じて最適な形式で曲線を出力"""
    doc = ezdxf.new(target_cad_version)
    msp = doc.modelspace()
    
    if target_use == 'cnc' or target_cad_version == 'R12':
        # CNC加工機や古いCADソフト向け：点列のまま
        msp.add_lwpolyline(points)
        print(f"点列をLWPOLYLINEとして出力（{len(points)}個の点）")
    
    elif target_use == 'cad':
        # CAD編集向け：SPLINEに変換
        if len(points) >= 4:
            # 制御点を明示的に計算
            bspline = global_bspline_interpolation(
                points,
                degree=3,
                method='chord'
            )
            spline = msp.add_spline_control_frame(
                control_points=bspline.control_points,
                degree=3,
                knots=bspline.knots()
            )
            print(f"点列をSPLINEとして出力（{len(points)}個の点 -> {len(bspline.control_points)}個の制御点）")
        else:
            # 点が少ない場合はLWPOLYLINE
            msp.add_lwpolyline(points)
            print(f"点列をLWPOLYLINEとして出力（点が少ないため）")
    
    else:  # 'universal'
        # 互換性重視：点列のまま（最も安全）
        msp.add_lwpolyline(points)
        print(f"点列をLWPOLYLINEとして出力（互換性重視）")
    
    doc.saveas(output_path)

# 使用例
points = [(0, 0), (5, 10), (10, 5), (15, 15), (20, 10)]

# CNC加工機向け
export_curve_intelligently(
    points,
    "output_cnc.dxf",
    target_cad_version='R2010',
    target_use='cnc'
)

# CAD編集向け
export_curve_intelligently(
    points,
    "output_cad.dxf",
    target_cad_version='R2010',
    target_use='cad'
)

# 互換性重視
export_curve_intelligently(
    points,
    "output_universal.dxf",
    target_cad_version='R2010',
    target_use='universal'
)
```

#### 実装時の注意点

##### 1. 点列の密度と精度

```python
def should_convert_to_spline(points, min_points=4, max_deviation=None):
    """点列をSPLINEに変換すべきか判断"""
    # 点が少なすぎる場合は変換しない
    if len(points) < min_points:
        return False, "点が少なすぎます"
    
    # 点列が直線に近い場合はLINEとして出力
    # （実装例：最初と最後の点を結ぶ直線からの偏差を計算）
    
    return True, "SPLINEに変換可能"

# 使用例
points = [(0, 0), (5, 10), (10, 5), (15, 15)]
should_convert, reason = should_convert_to_spline(points)
if should_convert:
    export_points_as_spline(points, "output.dxf")
else:
    export_points_as_polyline(points, "output.dxf")
```

##### 2. ファイルサイズの比較

```python
import ezdxf
import os

def compare_file_sizes(points, output_dir="."):
    """点列とSPLINEのファイルサイズを比較"""
    # LWPOLYLINEとして出力
    doc1 = ezdxf.new('R2010')
    msp1 = doc1.modelspace()
    msp1.add_lwpolyline(points)
    polyline_path = os.path.join(output_dir, "test_polyline.dxf")
    doc1.saveas(polyline_path)
    polyline_size = os.path.getsize(polyline_path)
    
    # SPLINEとして出力
    doc2 = ezdxf.new('R2010')
    msp2 = doc2.modelspace()
    from ezdxf.math import global_bspline_interpolation
    bspline = global_bspline_interpolation(points, degree=3)
    msp2.add_spline_control_frame(
        control_points=bspline.control_points,
        degree=3,
        knots=bspline.knots()
    )
    spline_path = os.path.join(output_dir, "test_spline.dxf")
    doc2.saveas(spline_path)
    spline_size = os.path.getsize(spline_path)
    
    print(f"点列数: {len(points)}")
    print(f"LWPOLYLINE: {polyline_size} bytes")
    print(f"SPLINE: {spline_size} bytes")
    print(f"削減率: {(1 - spline_size / polyline_size) * 100:.1f}%")
    
    return polyline_size, spline_size

# 使用例
points = [(i, i**2 / 10) for i in range(100)]  # 100個の点
compare_file_sizes(points)
```

#### まとめ：判断フローチャート

```
点列で表現された曲線をエクスポート
    │
    ├─ 用途は？
    │   │
    │   ├─ CNC加工機・レーザー加工機
    │   │   └─> LWPOLYLINE（点列のまま）を推奨
    │   │
    │   ├─ CAD編集・設計
    │   │   └─> SPLINEに変換を推奨
    │   │
    │   └─ 互換性重視
    │       └─> LWPOLYLINE（点列のまま）を推奨
    │
    ├─ DXFバージョンは？
    │   │
    │   ├─ R12以前
    │   │   └─> LWPOLYLINE（SPLINEが使用不可）
    │   │
    │   └─ R2000以降
    │       └─> 用途に応じて選択可能
    │
    └─ 点列の特徴は？
        │
        ├─ 円弧に適合
        │   └─> ARCに変換（オプション）
        │
        ├─ 複雑な曲線（点が多い）
        │   └─> SPLINEに変換（ファイルサイズ削減）
        │
        └─ 単純な曲線（点が少ない）
            └─> LWPOLYLINEのままでも可
```

#### ベストプラクティス

1. **用途を明確にする**
   - CNC加工機向けなら点列のまま
   - CAD編集向けならSPLINEに変換

2. **互換性を優先する**
   - 不明な場合は点列のまま（LWPOLYLINE）を選択

3. **ファイルサイズを考慮する**
   - 点が100個以上ある場合は、SPLINEへの変換で大幅にファイルサイズが削減される

4. **精度を維持する**
   - 変換時に元の点列からの偏差を確認
   - 必要に応じて許容誤差を設定

5. **テストを実施する**
   - 実際の使用環境（CADソフト、加工機）で動作確認

---

## 9. チェックリストとベストプラクティス

### 読み込み時のチェックリスト

実装時に以下の項目を確認してください：

- [ ] ファイルパスの存在確認
- [ ] 適切なエラーハンドリング（IOError, DXFStructureError等）
- [ ] エンコーディングの確認（特に古いバージョンのファイル）
- [ ] メモリ使用量の監視（大きなファイルの場合）
- [ ] 破損ファイルへの対応（リカバリモードの検討）

### 書き込み時のチェックリスト

- [ ] バックアップの作成（既存ファイルを上書きする場合）
- [ ] DXFバージョンの確認（互換性を考慮）
- [ ] 必須属性の存在確認（レイヤー、線種等）
- [ ] 座標値の妥当性チェック（NaN、Infinity、範囲外の値）
- [ ] エンコーディングの指定（日本語テキストを含む場合）
- [ ] 点列から曲線への変換判断（用途に応じてLWPOLYLINE vs SPLINEを選択）

### エンティティ操作時のチェックリスト

- [ ] 座標系の確認（WCS vs OCS）
- [ ] レイヤーの存在確認（存在しない場合は作成）
- [ ] ブロック参照の循環チェック
- [ ] ハンドルの一意性確認（手動設定は避ける）
- [ ] 削除後の参照クリーンアップ
- [ ] スプラインの互換性確認（制御点とノットベクトルを明示的に指定）
- [ ] DXFバージョンの確認（R12以前ではSPLINEが使用不可）

### ベストプラクティス

1. **防御的プログラミング**: すべてのファイル操作でエラーハンドリングを実装
2. **バリデーション**: データの妥当性チェックを各段階で実施
3. **ログ記録**: 問題発生時のデバッグに役立つログを記録
4. **テストデータ**: 様々なケース（破損ファイル、大きなファイル等）でのテスト
5. **ドキュメント化**: コード内のコメントと外部ドキュメントの充実
6. **バージョン管理**: DXFバージョンは互換性を考慮して選択
7. **リソース管理**: 大きなファイルの処理時はメモリ効率を考慮
8. **バックアップ**: 重要なファイルを変更する前に必ずバックアップを作成

---

## まとめ

このガイドでは、ezdxfを使用したDXFファイルのインポートとエクスポートについて、基本的な操作方法から高度な機能、よくある間違いとリスク排除まで、実装時に役立つ情報を網羅的に解説しました。

**重要なポイント**:
- 適切なエラーハンドリングとバリデーションの実装
- ファイル操作時のバックアップ作成
- 座標系や単位系の理解と適切な処理
- メモリ効率を考慮した実装
- チェックリストを活用した実装の確認
- **スプライン・NURBSの互換性**: 制御点とノットベクトルを明示的に指定することで、他のCADソフトとの互換性を確保

**スプライン・NURBS・B-splineについて**:
- ezdxfはSPLINE、B-spline、NURBS（有理B-spline）のすべてを完全にサポート
- Fit Pointsのみで作成すると、CADソフト間で曲線の形状が変わる可能性がある
- 互換性を重視する場合は、制御点とノットベクトルを明示的に指定することを強く推奨
- R12以前のバージョンではSPLINEが使用不可（R2000以降を推奨）

**点列から曲線への変換について**:
- **CNC加工機・レーザー加工機向け**: 点列のまま（LWPOLYLINE）を推奨（多くの加工機はSPLINEをサポートしない）
- **CAD編集・設計向け**: SPLINEに変換を推奨（ファイルサイズが小さく、編集しやすい）
- **互換性重視**: 点列のまま（LWPOLYLINE）を推奨（すべてのCADソフトで確実に読み込める）
- 用途に応じて最適な形式を選択することが重要

ezdxfは強力なライブラリですが、DXFの概念を理解することで、より効果的に活用できます。問題が発生した場合は、このガイドや関連ドキュメントを参照してください。

---

関連：[主要ライブラリ](./libraries.md) | [よくある罠と対処法](./common-pitfalls.md) | [パーサーの設計](./parsing-strategy.md) | [加工機とDXFの互換性](./cnc-machine-compatibility.md)
