# Linetypes (Dashed/Dotted) and Construction Lines

This explains how "linetypes" that change line appearance and "construction lines" used as drawing guides are handled in DXF.

---

## 1. Linetypes

Patterns like solid, dashed, center lines, etc.

### Mechanism
1. **Definition**: In the `LTYPE` table of the `TABLES` section, define pattern names (`DASHED`, etc.) and dash/space lengths.
2. **Reference**: Specify defined linetype names in **group code 6** of each entity (`LINE`, `LWPOLYLINE`, etc.).

### Group Code 6 Specification
- `ByLayer`: Use the linetype set in the layer as-is (default).
- `CONTINUOUS`: Solid line (always exists).
- `DASHED`: Dashed line.
- `CENTER`: Center line.
- `DOT`: Dotted line.

### Linetype Scale
A multiplier to adjust pattern density according to drawing size.
- **Group Code 48**: Multiplier for individual entities.
- **$LTSCALE**: Common multiplier for the entire drawing (header variable).

---

## 2. Construction Lines

Lines that are infinite or semi-infinite, used to assist drawing.

### XLINE (Construction Line)
- **Features**: A straight line extending infinitely in both directions.
- **Group Codes**:
    - `10, 20, 30`: Passing point.
    - `11, 21, 31`: Direction vector.
- **Use**: Center lines, grid reference lines.

### RAY (Ray)
- **Features**: A straight line extending infinitely in only one direction from a start point.
- **Group Codes**:
    - `10, 20, 30`: Start point.
    - `11, 21, 31`: Direction vector.

---

## 3. Implementation Notes and Best Practices

### ① Missing Linetype Definitions
Even if `DASHED` or other linetypes are referenced in DXF, if their definitions don't exist in the `TABLES` section, many software display them as solid lines.
- **Solution**: When outputting your own DXF, be sure to include referenced linetype definitions in the `LTYPE` table.

### ② Printing Construction Lines
`XLINE` and `RAY` are very long and can be annoying when printing.
- **Practice**: It's common CAD practice to create a dedicated layer for construction lines (e.g., `DEFPOINTS` layer or custom `AUX` layer) and set that layer to "non-printing."

### ③ Handling in Machines
Machines like laser cutters or CNC often cannot correctly process infinite `XLINE` or `RAY`.
- **Solution**: When exporting as machine data, it's recommended to delete construction lines or convert them to regular short `LINE`.

---

## Summary

| Type | Role | Expression in DXF |
| :--- | :--- | :--- |
| **Dashed/Dotted Lines** | Visual pattern | `LTYPE` table + group code `6` |
| **Infinite Lines** | Drawing reference | `XLINE` entity |
| **Rays** | Drawing reference | `RAY` entity |
| **Auxiliary Layers** | Common management | Management in `LAYER` table |

---

Related: [Tables and Layers](../structure/tables-and-layers.md) | [Common Entities](./common-entities.md) | [Common Pitfalls](../implementation/common-pitfalls.md)
