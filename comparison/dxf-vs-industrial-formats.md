# Comparison with Industrial Formats and Fonts

DXF is a general-purpose design data exchange format, but in manufacturing sites and design fields, other 2D formats specialized for specific uses (Gerber, G-code, font data, etc.) are also used together. This explains the differences between these formats and DXF, and notes for conversion.

---

## 1. DXF vs Gerber Data (Gerber / RS-274X)

Gerber data is the industry standard format for printed circuit board (PCB) manufacturing.

| Feature | DXF | Gerber (RS-274X) |
| :--- | :--- | :--- |
| **Main Use** | Mechanical design, general 2D/3D drawings | PCB patterns, masks, silk printing |
| **Structure** | Vector geometry (lines, arcs, polylines) | "Flash" and "draw" via apertures |
| **Layer Meaning** | Designer's arbitrary classification (outline, dimensions, etc.) | Directly linked to manufacturing process (surface copper, resist, drilling) |
| **Coordinate System** | Arbitrary (WCS/OCS) | Absolute board coordinates (usually inches or mm) |

### Conversion Notes
- **Polarity**: Gerber has concepts of "positive (draw)" and "negative (remove)" but DXF does not.
- **Fill Handling**: When converting DXF `HATCH` or thick `POLYLINE` to Gerber, "fill" processing needs to be performed to paths that board manufacturing machines can understand.

---

## 2. DXF vs G-code (G-code / RS-274)

G-code is a numerical control (NC) language for controlling CNC machine tools and 3D printers.

| Feature | DXF | G-code |
| :--- | :--- | :--- |
| **Role** | **"Design Data"** (what to draw) | **"Machining Commands"** (how to move) |
| **Content** | Shape definitions (start point, end point, radius, etc.) | Sequential execution of coordinate movement, spindle rotation, coolant ON/OFF, etc. |
| **Abstraction Level** | High (geometric entities) | Low (movement paths after tool radius compensation) |
| **Compatibility** | Common in many CAD | Has dialects for each machine (controller) |

### Workflow Relationship
Usually processed in the flow: **CAD (DXF)** → **CAM (Conversion)** → **NC (G-code)**. CAM software reads DXF and generates G-code considering tool thickness and cutting speed.

---

## 3. DXF vs Font Data (TTF / OTF / SHX)

Text data is one of the most problematic areas in CAD.

| Format | Type | Handling in CAD |
| :--- | :--- | :--- |
| **TTF / OTF** | Outline Font | Common to Windows/Mac. Displayed as Bezier curves in CAD. |
| **SHX** | Stroke Font | AutoCAD-specific format. Composed only of lines (strokes). |
| **DXF (Exploded)** | Geometric Shapes | Fonts "exploded" into line segments and arcs. |

### Text Traps in CAD
- **"Text" or "Shape"**: When sending to machines (laser cutters, etc.), text entities (`TEXT`, `MTEXT`) in DXF are often ignored.
- **Solution**: Need to "outline (explode)" fonts into geometric shapes.
- **Missing SHX Fonts**: When opening DXF containing SHX in software other than AutoCAD, fonts may be replaced with standard fonts, causing text positions and sizes to go wrong.

---

## 4. Other Related Formats

### HPGL / PLT (Hewlett-Packard Graphics Language)
- **Use**: Plotters (large printers) and old cutting machines.
- **Features**: Very simple command format composed of pen up/down (`PU`, `PD`) and movement (`PA`). A format closer to machine control than DXF.

### PDF (Vector PDF)
- **Use**: Drawing distribution and viewing.
- **Comparison**: PDF can also hold vector data internally, but accurately restoring layer information or CAD-like geometric attributes (like circle radius) is difficult.

---

## 5. Which Format Should You Choose?

| Purpose | Recommended Format | Reason |
| :--- | :--- | :--- |
| **Mechanical Design/Data Exchange** | **DXF** | Supported by most CAD and has high precision. |
| **Board Manufacturing (PCB)** | **Gerber (RS-274X)** | Board factories' manufacturing lines assume this format. |
| **Direct Machine Control** | **G-code** | The only language that machine controllers can interpret. |
| **Graphic Design** | **SVG / AI** | Good at handling colors, gradients, Bezier curves. |

---
Related: [DXF vs SVG](./dxf-vs-svg.md) | [DXF vs DWG](./dxf-vs-dwg.md)
