# 座標系 (WCS/OCS/AAA)

DXFを実装する上で最大の難所と言われるのが、**OCS (Object Coordinate System: オブジェクト座標系)** と **任意軸アルゴリズム (Arbitrary Axis Algorithm)** です。

3D空間に配置された2Dエンティティ（円やポリラインなど）の座標を正しく計算するために、この理解は避けて通れません。

## 1. 3つの座標系

DXFには主に以下の3つの座標系が登場します。

1. **WCS (World Coordinate System)**:
   絶対的な世界座標系。図面全体の基準となる。
2. **OCS (Object Coordinate System)**:
   各エンティティ（円、円弧、ポリライン等）が個別に持つ座標系。図形データ（中心点や頂点）はこのOCS上で定義される。
3. **DCS (Display Coordinate System)**:
   画面表示用の座標系。ビューポートの設定などで使用される。

## 2. なぜ OCS が必要なのか？

例えば、「3D空間内に斜めに置かれた円」を考えてみましょう。
- **WCS**で中心と半径、さらに「どの向きを向いているか」の3次元的な記述をするのは複雑です。
- **OCS**を使うと、「その円が乗っている平面」を基準にできるため、**「2D平面上の (x, y) 中心」と「半径」**というシンプルなデータで表現できます。

この「平面の向き」を定義するのが **法線ベクトル (Normal Vector)** です。

## 3. 任意軸アルゴリズム (Arbitrary Axis Algorithm)

法線ベクトル $\mathbf{N} = (N_x, N_y, N_z)$ が与えられたとき、一意に OCS の $X$ 軸 ($\mathbf{A_x}$) と $Y$ 軸 ($\mathbf{A_y}$) を算出するアルゴリズムです。これにより、図面内に余計な座標軸データを保存せずに済みます。

### アルゴリズムの手順

```mermaid
graph TD
    Normal[法線ベクトル N を単位ベクトル化] --> Decision{"|Nx| < 1/64 かつ\n|Ny| < 1/64 か？"}
    Decision -->|Yes (世界Z軸に近い)| W_Y["基準軸 W = (0, 1, 0)"]
    Decision -->|No| W_Z["基準軸 W = (0, 0, 1)"]
    W_Y --> CrossX["Ax = W × N"]
    W_Z --> CrossX
    CrossX --> NormalizeX["Ax を正規化"]
    NormalizeX --> CrossY["Ay = N × Ax"]
    CrossY --> Result["OCS 軸 (Ax, Ay, N) の完成"]
```

### なぜ 1/64 なのか？
これは AutoCAD が歴史的に採用している安定性のための閾値です。法線が世界 $Z$ 軸に非常に近い場合、外積（$\mathbf{W} \times \mathbf{N}$）の結果がゼロに近づき、浮動小数点誤差の影響を受けやすくなるため、基準軸を $Y$ 軸に切り替えます。

## 4. 具体的な計算例

法線ベクトル $\mathbf{N} = (0, 1, 0)$ （真上を向いている平面）の場合：

1.  $\mathbf{N} = (0, 1, 0)$。 $|0| < 1/64$ かつ $|1| < 1/64$ は **偽** なので、基準軸 $\mathbf{W} = (0, 0, 1)$。
2.  $\mathbf{A_x} = \mathbf{W} \times \mathbf{N} = (0, 0, 1) \times (0, 1, 0) = (-1, 0, 0)$。
3.  $\mathbf{A_y} = \mathbf{N} \times \mathbf{A_x} = (0, 1, 0) \times (-1, 0, 0) = (0, 0, 1)$。
4.  結果、OCS の $X, Y, Z$ 軸はそれぞれ $(-1, 0, 0), (0, 0, 1), (0, 1, 0)$ となります。

## 5. 実装での変換式

### OCS から WCS への変換
OCS上の点 $P_{ocs} = (x, y, z)$ を WCS上の点 $P_{wcs}$ に変換：
$$
P_{wcs} = x\mathbf{A_x} + y\mathbf{A_y} + z\mathbf{N}
$$

### WCS から OCS への変換
$$
P_{ocs} = (P_{wcs} \cdot \mathbf{A_x}, P_{wcs} \cdot \mathbf{A_y}, P_{wcs} \cdot \mathbf{N})
$$
※ $\cdot$ は内積を表します。

## 6. エンティティ別の注意点

- **CIRCLE / ARC**: 中心座標 (10, 20, 30) は OCS です。これに AAA で求めた軸を掛けて WCS に変換する必要があります。
- **LWPOLYLINE**: 頂点 (10, 20) は OCS です。$z$ 座標（標高）はグループコード 38 で別途与えられます。
- **TEXT / INSERT**: 挿入点 (10, 20, 30) は **WCS** である場合が多いですが、法線ベクトルが指定されている場合は OCS 扱いに変わるエンティティもあり、非常に複雑です。

---
関連：[共通エンティティ](./common-pitfalls.md) | [パーサーの設計](../implementation/parsing-strategy.md)
