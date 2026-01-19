# Frequently Asked Questions (FAQ)

Common questions and answers regarding DXF implementation and usage.

---

### Q. How do I read DXF programmatically?
**A.** Using proven libraries for each language is the fastest approach.
- **Python**: `ezdxf` is the de facto standard.
- **JavaScript**: `dxf-parser` for browsers, `dxf-writer` for exporting are commonly used.
- **C++**: `dxflib` is available, or `LibreDWG` if you also want to handle DWG.
For details, see [Major Libraries](../implementation/libraries.md).

---

### Q. Are splines and NURBS supported?
**A.** Yes, supported as `SPLINE` entities in AutoCAD R13 (AC1012) and later versions.
DXF splines are mathematically **NURBS**. They can hold parameters such as control points, knot vectors, and weights.
For details, see [Advanced Shapes](../geometry/advanced-entities.md).

---

### Q. Can Bezier curves be handled?
**A.** DXF does not have an independent "Bezier curve" entity.
Typically, Bezier curves are saved as **special cases of NURBS (splines)**. Many CAD software export Bezier curves as splines.

---

### Q. Can Brep (3D solid shapes) be handled?
**A.** Stored as `3DSOLID` entities, but the content is **ACIS**, a proprietary binary/text format (SAT format).
Parsing this yourself is extremely difficult. To handle 3D shapes, it's common to use a library or convert to polygon meshes (`3DFACE`).

---

### Q. How compatible is it with 3D CAD (Fusion 360, SolidWorks, etc.)?
**A.** Very important, but limited in use. Rather than exchanging 3D models themselves, it's often used for **"importing 2D sketches"** or **"exporting sheet metal development drawings"**.
- To send to 3D CAD: **AutoCAD 2000 (R15)** format is most stable.
- To send 3D models: Use **STEP (.step)** format instead of DXF.
For details, see [3D CAD Interoperability](../implementation/3d-cad-interoperability.md).

---

### Q. Can it be used for mesh creation in CAE software like ANSYS?
**A.** Yes, commonly used for 2D analysis shape definition.
However, DXF has no "surface" information, so after import, you need to connect lines to create surfaces. Also, if there are slight gaps in lines, mesh generation will fail, so cleanup on the CAD side is essential.
For details, see [CAE (ANSYS, etc.) Interoperability](../implementation/cae-interoperability.md).

---

### Q. How compatible is it with Rhino or Grasshopper?
**A.** Very good. Rhino handles NURBS, so it can read and write DXF `SPLINE` entities with high precision.
When exporting shapes created with Grasshopper's **Boundary Surface** (function to create surfaces from closed boundary lines) as DXF, they are usually output as "boundary lines only" or "hatching."
For details, see [3D CAD Interoperability](../implementation/3d-cad-interoperability.md).

---

### Q. Can DXF be created with Illustrator or Inkscape?
**A.** Yes, it's possible. Especially **Inkscape** supports DXF export for free and is commonly used for creating laser cutting data. However, be careful as scale can easily become incorrect. For details, see "[Free Software Usage Guidelines](../implementation/free-software-guide)".
However, DXF created with design software prioritizes "appearance," so when opened in CAD, lines may overlap or have tiny gaps.
For details, see [DXF vs SVG](../comparison/dxf-vs-svg.md).
