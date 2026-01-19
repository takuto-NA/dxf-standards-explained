# 3D CAD Interoperability

DXF was originally developed for 2D CAD (AutoCAD), but is also widely used in modern 3D CAD (CATIA, Fusion 360, SolidWorks, Creo, etc.). However, there are several important points to note when handling DXF in 3D CAD.

## Support Status of Major 3D CAD

| CAD Software | Main Use | DXF Handling | Features |
| :--- | :--- | :--- | :--- |
| **CATIA** | Aerospace/Automotive | Import/Export | Very strict. R12-R2000 formats are stable. |
| **Fusion 360** | Product Design | Import as sketch | Often used for 2D sketch import. Supports latest formats. |
| **SolidWorks** | Mechanical Design | Sketch/Drawing | Essential for importing 2D layouts or exporting sheet metal development drawings. |
| **Creo** | High-end Mechanical Design | Import/Export | Unit setting (mm vs inch) mismatches occur easily. |
| **Rhino** | Freeform Surfaces/Design | Very strong support | Maintains NURBS (curves/surfaces) with high precision. |

---

## Import and Export

In 3D CAD, DXF is generally used not for exchanging "3D models themselves" but as **"2D cross-sections or drafts (sketches)"**.

### Import (Read) Uses
- **Sketch Creation**: Import logos or complex shapes drawn in Illustrator or 2D CAD as sketches, then extrude to make 3D.
- **Drawing Base**: Start 3D modeling based on existing 2D drawings.

### Export (Write) Uses
- **Sheet Metal Processing (DXF Export)**: Export 3D models as "development drawings" to send to laser cutters or CNC machines. **Most frequently used operation.**
- **2D Drawing Distribution**: Give 2D drawings created from 3D models to personnel who don't have 3D CAD.

---

## Export Operation Examples in 3D CAD

### Fusion 360
1. Right-click the "sketch" you want to export in the browser (left tree).
2. Select **"Save as DXF"**.
3. This saves lines and arcs within the sketch as DXF.

### SolidWorks
1. For sheet metal models, right-click the model and select "Export to DXF/DWG."
2. Assign layers like "outer contour" or "bend lines" in export settings.
3. Manufacturing DXF is generated.

---

## Compatibility with Rhino / Grasshopper

Rhino is a NURBS (curves/surfaces) based modeler, and has very good compatibility with DXF.

### Import/Export in Rhino
Rhino has very detailed DXF import/export settings and can select schemes according to purpose (for AutoCAD, for CAM, etc.).
- **Import**: Can accurately read layer structure and spline control points.
- **Export**: Can choose whether to output curves (NURBS) as-is or decompose into line segments (Polyline).

### Grasshopper and "Boundary Surface"
Grasshopper is a visual programming tool on Rhino.
- **Boundary Surface**: Component that creates "surfaces" from closed curves.
- **Relationship with DXF**: DXF itself has a weak concept of "surfaces." When exporting Grasshopper's Boundary Surface as DXF, it usually becomes one of the following:
    1. **Boundary lines only**: Output as simple closed polylines (most common).
    2. **Hatching (HATCH)**: Output as filled areas.
    3. **Mesh (MESH)**: Output by dividing surfaces into polygons (when prioritizing 3D information).

**Note**: When passing complex geometric shapes generated in Grasshopper to other software via DXF, whether the receiving side can recognize "closed loops" as surfaces (see [CAE Interoperability](./cae-interoperability.md)) is key.

---

## Compatibility Trap: Can 3D Models Be Sent via DXF?

**Conclusion: Not recommended.**
Sending 3D shapes via DXF is technically possible (using `3DFACE` or `3DSOLID`), but not suitable for data exchange between 3D CAD for the following reasons.

1. **Loss of Solid Information**: Many DXF importers cannot correctly interpret 3D solids.
2. **Surface Approximation**: Cylindrical surfaces, etc. may be converted to collections of fine planes (polygons).
3. **Alternative**: When exchanging 3D models, using **STEP (.step)** or **IGES (.iges)** formats is industry standard.

---

## Support Status by Version

When importing to 3D CAD, following these guidelines reduces trouble.

- **R12 Format**: Most safe. Readable by old CATIA and special machines, but curves may be decomposed into line segments.
- **R2000 / R2004**: Good balance. Can keep splines (curves) as curves, and is standardly supported by many 3D CAD.
- **Latest Version (2018 and later)**: Cloud-based CAD like Fusion 360 support it, but there's a risk that old software in manufacturing sites cannot open it.

**Recommended Setting**: When in doubt, exporting in **AutoCAD 2000 (R15/AC1015) Format** has the highest compatibility between 3D CAD.
