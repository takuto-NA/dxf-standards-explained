# Polygons, Holes, and Fills

How to represent "surfaces" and "filled areas" in DXF is a point that often confuses implementers. DXF doesn't have a single "Polygon" entity; instead, multiple methods are used depending on the purpose.

---

## 1. Closed Polygons

To simply represent "closed boundary lines," use `LWPOLYLINE` (lightweight polyline).

- **Mechanism**: You don't need to manually add a line back to the first vertex at the end of the vertex list.
- **Flag**: Setting bit 1 (value `1`) of **group code 70** automatically connects the final vertex and starting vertex, making it "closed."
- **Note**: This is still just a "line" and doesn't fill the interior.

---

## 2. Fills

To fill an area with a specific color or pattern, use the following entities.

### HATCH (Hatching) - Recommended
The most common method in modern DXF.
- **SOLID Fill**: Setting group code `2` (pattern name) to `SOLID` enables solid color filling.
- **Boundary Definition**: Define boundary lines by combining multiple `LINE`, `ARC`, or `LWPOLYLINE`.

### SOLID (Plane) - Very Old
An entity that has existed since the earliest days of AutoCAD (different from `HATCH`).
- **Limitation**: Can only fill 3 points (triangle) or 4 points (quadrilateral).
- **Drawing Order**: For 4 points, there's a unique rule where vertex order becomes `1-2-4-3` (Z-shape). Not suitable for complex polygons.

---

## 3. Shapes with Holes (Holes / Islands)

Methods to represent shapes like "donut shapes" with holes inside outer boundaries.

### HATCH "Island" Structure
`HATCH` entities can have multiple "boundary paths."
- **External Loop**: Outermost boundary.
- **Internal Loop**: Boundaries that become holes (islands).
- **Hatching Style (code 75)**:
    - `0`: Fill inside odd-numbered boundaries, skip even-numbered ones (alternating).
    - `1`: Fill only the outermost boundary, skip all inner islands.

### MPOLYGON (Multi-polygon)
An entity introduced for compatibility with GIS (Geographic Information System) data.
- Can natively hold "outer perimeter" and "hole" information internally.
- However, many free software and some libraries don't support it, so `HATCH` is recommended for compatibility.

---

## 4. Complex Surfaces (3D Face / Mesh)

Used when you want to represent 3D "surfaces."

- **3DFACE**: A face composed of 3 or 4 points. Cannot represent holes (express by combining multiple `3DFACE`).
- **MESH**: A polygon mesh composed of many vertices and a list of faces.

---

## Comparison Summary

| What You Want to Achieve | Recommended Entity | Notes |
| :--- | :--- | :--- |
| **Simply closed line** | `LWPOLYLINE` (Flag 70=1) | Used for machine outer contours, etc. |
| **Solid filled surface** | `HATCH` (Pattern: `SOLID`) | Used for coloring in drawings |
| **Polygon with holes** | `HATCH` (Multiple loops) | Most common and highest compatibility |
| **3D polygon surface** | `3DFACE` or `MESH` | Used for 3D model surface representation |

---

## Implementation Hint: Which is "Outside"?

When sending data to machines (laser cutters, etc.), you may need to determine whether `LWPOLYLINE` is an "outer perimeter" or a "hole." Since DXF itself often lacks this metadata, parsers commonly perform the following calculations.

1. **Area Sign**: Calculate area from vertex order (clockwise or counterclockwise) and determine by its sign.
2. **Containment Test**: Check if one polyline is inside another using geometric calculations (point-in-polygon algorithms, etc.).

---

Related: [Common Entities](./common-entities.md) | [Advanced Entities](./advanced-entities.md) | [Coordinate Systems](./coordinate-systems.md)
