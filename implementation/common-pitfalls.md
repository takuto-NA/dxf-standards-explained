# よくある罠

DXFの実装において、実装者が遭遇しやすい問題とその対処法をまとめます。

## 1. 文字エンコーディングの問題

### 問題

DXFファイルの文字エンコーディングは、バージョンによって異なります：

- **R12以前**: ANSI/コードページ依存（環境によって異なる）
- **AC1015 (AutoCAD 2000)**: ANSI（Windows-1252など）
- **AC1021 (AutoCAD 2007)以降**: UTF-8が標準

### 症状

- 日本語や特殊文字が文字化けする
- ファイルを開いたときに「Invalid character」エラーが発生する

### 対処法

```python
def detect_encoding(file_path):
    """DXFファイルのエンコーディングを検出"""
    with open(file_path, 'rb') as f:
        header = f.read(100)
        
        # UTF-8 BOMの確認
        if header.startswith(b'\xEF\xBB\xBF'):
            return 'utf-8-sig'
        
        # バージョン情報から判定
        version = extract_version(header)
        if version >= 'AC1021':
            return 'utf-8'
        else:
            # 環境依存のコードページを推測
            return 'windows-1252'  # またはシステムのデフォルト
```

**ベストプラクティス**: 
- 可能な限りUTF-8で保存する
- 読み込み時は、まずUTF-8で試し、失敗したらフォールバックする

## 2. 浮動小数点の精度問題

### 問題

DXFファイルでは、浮動小数点値がテキストとして保存されるため、読み込み時に精度の問題が発生する可能性があります。

### 症状

- 座標値が微妙にずれる（例: `10.0` が `9.999999999` になる）
- 幾何学的な計算（距離、角度など）で誤差が蓄積する

### 対処法

```python
import decimal

def parse_float(value_str):
    """高精度な浮動小数点の読み込み"""
    # 科学記数法にも対応
    try:
        return float(value_str)
    except ValueError:
        # Decimal型を使用して精度を保つ（必要に応じて）
        return float(decimal.Decimal(value_str))

# 比較時の許容誤差
EPSILON = 1e-9

def float_equal(a, b):
    return abs(a - b) < EPSILON
```

**ベストプラクティス**: 
- 座標値の比較には許容誤差（epsilon）を使用する
- 幾何学的な計算には、必要に応じて高精度ライブラリを使用する

## 3. 不完全なDXFファイルへの対応

### 問題

多くのCADソフトは、不完全なDXFファイル（HEADERやTABLESセクションが欠けている）でも、デフォルト値を補完して読み込みます。

### 症状

- パーサーが「必須セクションが見つからない」エラーを出す
- 画層や線種が正しく解決されない

### 対処法

```python
class DxfParser:
    def __init__(self):
        # デフォルト値を事前に設定
        self.default_layer = Layer(name="0", color=7, ltype="CONTINUOUS")
        self.default_ltype = LineType(name="CONTINUOUS", pattern=[])
        self.default_style = TextStyle(name="STANDARD")
    
    def get_layer(self, name):
        """画層を取得、存在しない場合はデフォルトを返す"""
        if name in self.layer_dict:
            return self.layer_dict[name]
        else:
            logger.warning(f"Layer '{name}' not found, using default")
            return self.default_layer
```

**ベストプラクティス**: 
- 必須ではないセクション（HEADER, TABLES）が欠けていても、処理を続行できるようにする
- 警告をログに記録し、デフォルト値を使用する

## 4. OCS（オブジェクト座標系）の変換ミス

### 問題

`CIRCLE`, `ARC`, `LWPOLYLINE`などのエンティティは、OCSで定義されています。法線ベクトルが指定されていない場合、デフォルトは `(0, 0, 1)` ですが、これを忘れると2D図面が正しく表示されません。

### 症状

- 3D空間に配置された円が、2Dビューで正しく表示されない
- ポリラインの頂点が期待される位置にない

### 対処法

```python
def get_extrusion_direction(entity):
    """エンティティの押し出し方向（法線ベクトル）を取得"""
    if hasattr(entity, 'extrusion_x') and entity.extrusion_x is not None:
        return (
            entity.extrusion_x,
            entity.extrusion_y,
            entity.extrusion_z
        )
    else:
        # デフォルト: 世界Z軸
        return (0.0, 0.0, 1.0)

def ocs_to_wcs(point_ocs, extrusion):
    """OCS座標をWCS座標に変換（任意軸アルゴリズム使用）"""
    # 任意軸アルゴリズムの実装
    # （詳細は coordinate-systems.md を参照）
    ...
```

**ベストプラクティス**: 
- すべてのOCSベースのエンティティに対して、明示的に変換を行う
- テストデータに、様々な法線ベクトルを持つエンティティを含める

## 5. ブロック参照の循環参照

### 問題

ブロック定義が、自分自身や他のブロックを参照する循環参照を含む場合、無限ループが発生する可能性があります。

### 症状

- パーサーがスタックオーバーフローでクラッシュする
- メモリ使用量が異常に増加する

### 対処法

```python
class BlockResolver:
    def __init__(self, max_depth=100):
        self.max_depth = max_depth
        self.current_depth = 0
    
    def resolve_block(self, block_name, insert_entity):
        if self.current_depth >= self.max_depth:
            raise ValueError(f"Block reference depth exceeded: {block_name}")
        
        self.current_depth += 1
        try:
            block_def = self.block_dict[block_name]
            # ブロック内のエンティティを解決
            entities = self.resolve_block_entities(block_def, insert_entity)
            return entities
        finally:
            self.current_depth -= 1
```

**ベストプラクティス**: 
- ブロック参照の深さに制限を設ける（例: 100レベル）
- 循環参照を検出して警告を出す

## 6. 単位系の混乱

### 問題

DXFファイル自体は単位情報を持たないため、`$INSUNITS` ヘッダー変数と実際の座標値の単位が一致しない場合があります。

### 症状

- 図面のスケールが正しくない（インチとメートルが混在）
- 寸法値が期待と異なる

### 対処法

```python
def get_units(self):
    """図面の単位系を取得"""
    insunits = self.header_vars.get('$INSUNITS', 0)
    unit_map = {
        1: 'inches',
        2: 'feet',
        4: 'millimeters',
        5: 'centimeters',
        6: 'meters',
        # ...
    }
    return unit_map.get(insunits, 'unitless')

def convert_units(value, from_unit, to_unit):
    """単位変換（必要に応じて）"""
    conversion_factors = {
        ('inches', 'millimeters'): 25.4,
        ('feet', 'meters'): 0.3048,
        # ...
    }
    factor = conversion_factors.get((from_unit, to_unit), 1.0)
    return value * factor
```

**ベストプラクティス**: 
- 単位情報をメタデータとして明示的に管理する
- ユーザーに単位を確認するUIを提供する

## 7. ハンドルの扱い

### 問題

AutoCAD 2000以降では、各オブジェクトに一意のハンドル（16進数文字列）が割り当てられます。ハンドルは参照関係で使用されますが、すべてのDXFファイルに存在するわけではありません。

### 症状

- ハンドルベースの参照が解決できない
- 古いバージョンのDXFファイルでハンドルが欠けている

### 対処法

```python
def parse_handle(value_str):
    """ハンドルを解析（16進数文字列）"""
    if not value_str:
        return None
    try:
        return int(value_str, 16)  # 16進数として解釈
    except ValueError:
        logger.warning(f"Invalid handle: {value_str}")
        return None

def resolve_handle_reference(handle):
    """ハンドルでオブジェクトを参照"""
    if handle is None:
        return None
    return self.handle_dict.get(handle)
```

**ベストプラクティス**: 
- ハンドルが存在しない場合でも、名前ベースの参照でフォールバックする
- ハンドルの一意性をチェックする

## 8. パフォーマンスの問題

### 問題

大きなDXFファイル（数万エンティティ）を読み込む際、メモリ使用量や処理時間が問題になることがあります。

### 対処法

- **ストリーミングパーサー**: エンティティを1つずつ処理する
- **遅延読み込み**: 必要な時だけデータを読み込む
- **キャッシュ**: 頻繁に参照されるデータ（デフォルト画層など）をキャッシュする

詳細は [パーサーの設計](./parsing-strategy.md) を参照してください。

## まとめ

これらの問題を事前に認識し、適切な対処法を実装することで、堅牢なDXFパーサーを構築できます。特に、**エラーハンドリング**と**デフォルト値の提供**は、実用性の高いパーサーには不可欠です。
