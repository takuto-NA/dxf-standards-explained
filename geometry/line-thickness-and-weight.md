# Line Thickness, Depth, and Width

In DXF, there are roughly three different concepts for expressing "line thickness." These terms are similar but have completely different meanings, so care must be taken not to confuse them.

---

## 1. Lineweight

The "visual thickness" applied during screen display or printing.

- **Group Code**: **370**
- **Unit**: 0.01mm units (e.g., `25` is 0.25mm).
- **Features**:
    - Thickness on screen doesn't change even when zooming (always displayed at constant pixels/mm).
    - Introduced in AutoCAD 2000 (R15).
- **Commonly Used Values**:
    - `-1`: ByLayer (follows layer setting)
    - `-2`: ByBlock (follows block setting)
    - `-3`: Default value

---

## 2. Thickness

The "height" when a 2D shape is extruded in the Z-axis direction.

- **Group Code**: **39**
- **Unit**: Drawing units (WCS).
- **Features**:
    - Used to make 2D `LINE` or `CIRCLE` 3D like "walls."
    - From directly above (plan view), it's just a line, but from an angle (bird's-eye view), the thickness is visible.
- **Note**: In machine data (laser cutting, etc.), this value is generally ignored even if specified.

---

## 3. Polyline Width (Constant/Starting/Ending Width)

The actual "width" specified in `LWPOLYLINE`, etc.

- **Group Codes**:
    - **43**: Constant width
    - **40**: Starting width
    - **41**: Ending width
- **Unit**: Drawing units (WCS).
- **Features**:
    - Lines also scale when zooming.
    - By changing starting and ending widths, you can express "tapered lines" like arrows.
    - Internally treated as a "filled surface" with boundary lines.

---

## Comparison Summary

| Concept | Code | Unit | Behavior When Zooming | Main Use |
| :--- | :--- | :--- | :--- | :--- |
| **Lineweight** | `370` | 0.01mm | Doesn't change | Expression of drafting standards (thick/thin lines) |
| **Thickness** | `39` | Drawing units | Changes | Simple 3D representation (walls, etc.) |
| **Polyline Width** | `40/41/43` | Drawing units | Changes | Arrows, wiring patterns, lines with actual thickness |

---

## Implementation Advice

1. **Output to Machines**:
   When sending to laser cutters or CNC, many cases treat "line thickness as zero (only path centerline)." If you want thickness, you need to convert polylines with `WIDTH` to "hollow outer contours" (offset processing).

2. **Old DXF Versions**:
   `Lineweight (370)` doesn't exist in DXF before R14. To maintain compatibility with old environments, the old method of "color-dependent print styles (CTB)" that manages thickness by associating color numbers (Group 62) with pen numbers is still used.

3. **Display Priority**:
   When both `Lineweight` and `Width` are set for the same entity, usually `Width` (actual width) is prioritized for drawing.

---

Related: [Common Entities](./common-entities.md) | [Polygons and Fills](./polygons-and-fills.md) | [Common Pitfalls](../implementation/common-pitfalls.md)
