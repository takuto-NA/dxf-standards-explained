# 主要ライブラリ

各プログラミング言語で利用可能なDXFライブラリを紹介します。実装の参考や、既存のソリューションの評価に役立ちます。

## Python: ezdxf (最も推奨)

**特徴**:
- 最も人気が高く、機能が豊富なPythonライブラリ
- DXF R12から最新バージョンまで幅広く対応
- 読み書き両方に対応
- OCS/WCS変換などの数学的処理も強力にサポート

### クイックスタート
```python
import ezdxf

# DXFファイルの読み込み
try:
    doc = ezdxf.readfile("drawing.dxf")
    msp = doc.modelspace()
    
    for entity in msp:
        if entity.dxftype() == "LINE":
            # 始点と終点の取得
            print(f"Line: {entity.dxf.start} -> {entity.dxf.end}")
except IOError:
    print("ファイルが見つかりません")

# DXFファイルの作成
doc = ezdxf.new('R2010')
msp = doc.modelspace()
msp.add_line((0, 0), (10, 10))
doc.saveas("output.dxf")
```

### python-dxf (dxfgrabber)

**GitHub**: https://github.com/mozman/dxfgrabber

**特徴**:
- 読み込み専用（書き込み非対応）
- シンプルなAPI
- 軽量

**使用例**:
```python
import dxfgrabber

dxf = dxfgrabber.readfile("drawing.dxf")
for entity in dxf.entities:
    print(entity)
```

**適用範囲**: 読み込み専用のシンプルな処理

## C#

### netDxf

**GitHub**: https://github.com/haplokuon/netDxf

**特徴**:
- .NET向けの包括的なDXFライブラリ
- 読み書き両方に対応
- DXF R12から最新バージョンまで対応
- オープンソース（MITライセンス）

**使用例**:
```csharp
using netDxf;

// DXFファイルの読み込み
DxfDocument doc = DxfDocument.Load("drawing.dxf");

// エンティティの取得
foreach (EntityObject entity in doc.Entities)
{
    Console.WriteLine($"{entity.Type}: {entity}");
}

// DXFファイルの作成
DxfDocument newDoc = new DxfDocument();
Line line = new Line(new Vector3(0, 0, 0), new Vector3(10, 10, 0));
newDoc.Entities.Add(line);
newDoc.Save("output.dxf");
```

**適用範囲**: .NETアプリケーションでのDXF処理

### DxfLib

**GitHub**: https://github.com/IxMilia/Dxf

**特徴**:
- モダンなC# API
- 読み書き対応
- 型安全な設計

## C++

### dxflib (推奨)

**公式サイト**: https://www.qcad.org/en/dxflib-downloads

**特徴**:
- QCADで採用されている、実績のあるオープンソースライブラリ
- 非常に高速で軽量
- イベント駆動型（SAX）のパーサー

### クイックスタート
```cpp
#include "dl_dxf.h"
#include "dl_creationadapter.h"

// コールバックを受け取るクラス
class MyDxfReader : public DL_CreationAdapter {
public:
    virtual void addLine(const DL_LineData& data) override {
        printf("Line found!\n");
    }
};

int main() {
    MyDxfReader reader;
    DL_Dxf dxf;
    if (!dxf.in("drawing.dxf", &reader)) {
        return 1; // 読み込み失敗
    }
    return 0;
}
```

### LibreDWG

**公式サイト**: https://www.gnu.org/software/libredwg/

**特徴**:
- DWG形式の読み書きに特化（DXFもサポート）
- C言語API
- オープンソース（GPLライセンス）

**適用範囲**: 低レベルなCADファイル処理、組み込みシステム

### Open Design Alliance (ODA) File Converter

**公式サイト**: https://www.opendesign.com/

**特徴**:
- 商用ライブラリ（有料）
- 業界標準のDWG/DXF処理
- 高機能だが高価

**適用範囲**: 商用CADアプリケーション

## JavaScript / TypeScript: dxf-parser

**特徴**:
- Node.jsおよびブラウザで動作するDXFパーサー
- 読み込み専用
- シンプルなJSON形式への変換

### クイックスタート
```javascript
const DxfParser = require('dxf-parser');
const fs = require('fs');

const parser = new DxfParser();
try {
    const fileContent = fs.readFileSync('drawing.dxf', 'utf-8');
    const dxf = parser.parseSync(fileContent);
    
    dxf.entities.forEach(entity => {
        if (entity.type === 'LINE') {
            console.log(`Line from (${entity.vertices[0].x}, ${entity.vertices[0].y})`);
        }
    });
} catch(err) {
    console.error(err);
}
```

### dxf-writer

**GitHub**: https://github.com/bjnortier/dxf-writer

**特徴**:
- DXFファイルの書き込み専用
- ブラウザでも動作

**適用範囲**: WebアプリケーションでのDXF生成

## Java

### jdxf

**GitHub**: https://github.com/nraynaud/jdxf

**特徴**:
- Java向けのDXFライブラリ
- 読み書き対応
- 軽量

**使用例**:
```java
import com.nraynaud.jdxf.*;

DXFDocument doc = DXFDocument.read("drawing.dxf");
for (DXFEntity entity : doc.getEntities()) {
    System.out.println(entity);
}
```

## Rust

### dxf

**GitHub**: https://github.com/ixmilia/dxf-rs

**特徴**:
- Rust向けのDXFライブラリ
- 読み書き対応
- 型安全な設計

**使用例**:
```rust
use dxf::Drawing;

let drawing = Drawing::load("drawing.dxf")?;
for entity in drawing.entities() {
    println!("{:?}", entity);
}
```

## ライブラリ選択の指針

### 読み込み専用の場合

- **Python**: `dxfgrabber`（シンプル）または `ezdxf`（高機能）
- **JavaScript**: `dxf-parser`
- **C#**: `netDxf` または `DxfLib`

### 読み書き両方必要な場合

- **Python**: `ezdxf`（推奨）
- **C#**: `netDxf`（推奨）
- **C++**: `LibreDWG`（オープンソース）または ODA（商用）

### パフォーマンスが重要な場合

- **C++**: `LibreDWG` または ODA
- **Rust**: `dxf-rs`（メモリ安全性とパフォーマンスのバランス）

### Webアプリケーションの場合

- **サーバーサイド**: Node.jsの `dxf-parser` + `dxf-writer`
- **クライアントサイド**: ブラウザで動作するJavaScriptライブラリ

## ライブラリの比較表

| ライブラリ | 言語 | 読み込み | 書き込み | ライセンス | メンテナンス |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ezdxf | Python | ✅ | ✅ | MIT | アクティブ |
| netDxf | C# | ✅ | ✅ | MIT | アクティブ |
| dxf-parser | JavaScript | ✅ | ❌ | MIT | アクティブ |
| LibreDWG | C/C++ | ✅ | ✅ | GPL | アクティブ |
| dxf-rs | Rust | ✅ | ✅ | MIT | アクティブ |

## カスタム実装 vs ライブラリ使用

### ライブラリを使用する場合

- **迅速な開発**: 既存のライブラリを使用することで、開発時間を短縮
- **テスト済み**: 多くのユーザーによってテストされている
- **機能の豊富さ**: 高度な機能（スプライン、寸法など）が実装済み

### カスタム実装をする場合

- **特殊な要件**: 既存のライブラリでは対応できない特殊な処理が必要
- **パフォーマンス**: 特定の用途に最適化されたパーサーが必要
- **学習目的**: DXFの内部構造を深く理解したい

## まとめ

ほとんどの場合、既存のライブラリを使用することを推奨します。特に `ezdxf`（Python）や `netDxf`（C#）は、機能が豊富でドキュメントも充実しており、実用的な選択肢です。

ただし、DXFの内部構造を理解することは、ライブラリのバグを回避したり、特殊な要件に対応したりする際に役立ちます。このドキュメントは、そのような理解を深めるための参考資料として活用してください。
