# Free Software DXF Usage Guidelines

When handling DXF files with free software other than AutoCAD (LibreCAD, QCAD, FreeCAD, Inkscape, etc.), drawings often break or cannot be read due to compatibility issues. This guideline summarizes best practices when using these software together.

---

## 1. Major Free Software and Their Characteristics

| Software Name | Category | DXF Internal Engine | Preferred DXF Version | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **LibreCAD** | 2D CAD | libdxfrw | R12, R14 | Weak with splines and complex entities |
| **QCAD** | 2D CAD | dxflib / ODA | R12, R15 (AC1015) | Community version has limitations saving latest formats (2018, etc.) |
| **FreeCAD** | 3D CAD | libdxfrw | R12, R14, 2000 | Not suitable for fine-tuning 2D drawings |
| **Inkscape** | Vector | Built-in script | R12, R14 (Desktop) | Size can easily go wrong with unit (mm vs px) or DPI settings |
| **Blender** | 3D | Built-in addon | R12 (AC1009) | Mesh-based, so arcs become polygons |

---

## 2. Export Settings to Improve Compatibility

When saving DXF with the assumption of opening in other software, the following settings are recommended.

### Version Selection Rules
- **AutoCAD R12 (AC1009) Format**: **Most safe.** Although a specification from over 30 years ago, readable by almost all free software, web viewers, and machines (laser, CNC). However, curves may be decomposed into fine lines (polylines).
- **AutoCAD 2000 (R15/AC1015) Format**: **Balanced.** Can keep splines (curves) as curves, suitable when handling with QCAD or FreeCAD.

### Character Code Notes
- For drawings containing Japanese, latest software assumes **UTF-8**, but old software or machines may expect **Shift-JIS (CP932)**.
- If garbled characters occur, check encoding settings when saving.

---

## 3. Troubleshooting When Importing

### Drawing is completely white, or some lines are missing
1. **Zoom Function**: Try `Show Entire Drawing (Auto Zoom / Zoom Extents)`. Often coordinates are just far away.
2. **Unsupported Entities**: `SPLINE`, `ELLIPSE`, `MTEXT`, `HATCH`, etc. are ignored by some software.
    - **Solution**: In the original software, "explode" these and convert to simple `LINE` or `ARC` before saving.

### Scale (size) is wrong
- DXF has ambiguous parts regarding "units" (`$INSUNITS`).
- **Inkscape-specific Trap**: From Inkscape 0.92 onward, internal resolution changed from 90 DPI to 96 DPI. If `Base unit` or `DPI` settings at export don't match the machine side, drawings may be output at 1.06x or 0.93x size.
- **Solution**: Check that `Millimeters (mm)` is specified in import settings, and always include a line of known length (e.g., 100mm square) for test cuts or inspection.

---

## 4. Usage Guidelines (Best Practices)

### ① Use Only Basic Entities
Avoid advanced features (dynamic blocks, complex hatching, proxy objects), and compose with the following basic elements for maximum safety.
- `LINE` (line segment)
- `CIRCLE` (circle)
- `ARC` (arc)
- `POLYLINE / LWPOLYLINE` (polyline)

### ② Explode Blocks
Custom block definitions may shift positions or lose attribute information (ATTRIB) when read in free software. For final data exchange, it's recommended to explode blocks into "loose lines."

### ③ Use Alphanumeric Layer Names
Japanese layer names can become garbled across software, making display/hide control impossible.
- Example: `外形線` → `OUTLINE`, `寸法` → `DIM`

### ④ Verify Closed Loops (for machining)
When using for laser cutting or CNC, it's important that polylines are "closed."
- Use LibreCAD or QCAD's "create closed polyline" function to verify endpoints match exactly.

---

## 5. Recommended Workflow Examples

### When Sending Illustrations to Machines (DXF)
1. Create paths in **Inkscape**.
2. Select all paths and apply `Path -> Object to Path`.
3. Choose **Desktop Cutting Plotter (AutoCAD DXF R14)** in `Save As`.
4. Open in **LibreCAD**, verify dimensions are correct and fine-tune.
5. Final save in R12 format.

### When Making 2D Drawings from 3D Model Cross-sections
1. Create model in **FreeCAD**.
2. Create 2D projection in `TechDraw` workbench.
3. Export DXF.
4. Read in **QCAD** and organize linetypes and layers.

---

Related: [Common Pitfalls](./common-pitfalls.md) | [3D CAD Interoperability](./3d-cad-interoperability.md)
