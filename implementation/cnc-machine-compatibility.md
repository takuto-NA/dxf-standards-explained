# CNC Machine Compatibility: Why SPLINE is Not Supported

When using DXF files with CNC machine tools and laser cutters, **SPLINE entities are often not supported**. This document explains the technical background and reasons in detail.

---

## 1. Why Don't Machines Support SPLINE?

### 1.1 Historical Reasons

**SPLINE Entity Introduction**:
- DXF's SPLINE entity was introduced in **AutoCAD R13 (1995)**
- However, many CNC machine tool and laser cutter controllers **existed before that**
- These older controllers were designed to support only basic entities such as **LINE, ARC, CIRCLE, POLYLINE**

**Compatibility Maintenance**:
- Machine manufacturers need to maintain compatibility with existing controllers
- Supporting the new SPLINE entity requires updating controller firmware, which is difficult for many older machines

### 1.2 Implementation Complexity

**NURBS Computational Cost**:
- SPLINE entities are internally represented as **NURBS (Non-Uniform Rational B-Spline)**
- Evaluating NURBS (calculating points on the curve) requires complex calculations:
  - Basis function calculation from knot vectors
  - Control point weighting
  - Rational B-spline evaluation (weighted sum calculation)
  - Parameter t to coordinate conversion

**Real-time Processing Constraints**:
- Machines need to **move tools in real-time**
- Smooth curve machining requires calculating many points on the curve, but NURBS calculations are computationally expensive and unsuitable for real-time processing

### 1.3 Memory and CPU Resource Constraints

**Embedded System Constraints**:
- Many machine controllers are **embedded systems** (embedded computers)
- Limited memory and CPU resources are insufficient for complex NURBS calculations
- Especially older controllers use **8-bit or 16-bit microcontrollers** with limited floating-point operations

**Memory Usage**:
- Processing SPLINE entities requires maintaining the following data:
  - Control point arrays
  - Knot vectors
  - Weights (for rational splines)
  - Intermediate calculation result buffers
- This data is too burdensome for controllers with limited memory

### 1.4 Complexity of G-code Conversion

**G-code Characteristics**:
- Machines ultimately execute **G-code** (NC programs)
- G-code consists of simple commands like **linear interpolation (G01)** and **circular interpolation (G02/G03)**
- **Note**: Some advanced CNC controllers (Fanuc, Siemens, etc.) have G-code commands like **G06.2 (NURBS interpolation)** or **G06.1 (spline interpolation)**
- However, these commands are **not features that directly read SPLINE entities from DXF files and execute them**
- These commands require **CAM software to analyze SPLINE and generate G06.2 format G-code**

**Conversion Difficulty**:
- Converting SPLINE to G-code requires the following processing:
  1. Dividing NURBS curves into many small line segments
  2. Converting each segment to G01 (linear interpolation) commands
  3. Generating sufficient points to maintain accuracy
- This conversion process is too complex to execute on the controller side

**CAM Software Conversion**:
- In practice, **CAM software** (Computer-Aided Manufacturing) converts SPLINE to point sequences before generating G-code
- However, many machines have **direct DXF file reading** capabilities and may not go through CAM software
- In this case, the controller needs to process SPLINE directly, but since it cannot, SPLINE is ignored or causes errors

**G-code Comparison Example**:
- **SPLINE (conceptual)**: `G06.2 P3 X... Y... K...` (single line, but few machines support it)
- **Linear Approximation**: `G01 X... Y...` repeated hundreds of times (high compatibility, but large data volume)
  - Example: A complex SPLINE curve might generate 200-500 G01 commands, significantly increasing G-code file size compared to a single SPLINE entity

### 1.5 Standardization Issues

**DXF Specification Complexity**:
- DXF's SPLINE entity specification is complex and includes:
  - Fit Points
  - Control Points
  - Knot Vector
  - Weights
  - Degree
- Correctly interpreting and processing all these elements requires advanced implementation

**Implementation Differences Between Manufacturers**:
- Each machine manufacturer implements its own DXF parser
- However, SPLINE entity implementation is complex, so many manufacturers **avoid implementing it**
- As a result, machines supporting SPLINE are limited

### 1.6 Accuracy and Quality Issues

**Approximation Necessity**:
- Machining SPLINE requires approximating curves as point sequences
- Approximation accuracy depends on:
  - Number of division points
  - Algorithm used
  - Tolerance settings
- When controllers perform this approximation, **quality can be unstable**

**Chord Error (Tolerance) Explanation**:
- **Chord Error** (also called **tolerance** or **chord deviation**) is the **maximum perpendicular distance** between the theoretical curve and the approximating line segment (chord)
- When converting a curve to line segments, each segment is a straight line connecting two points on the curve
- The chord error is the maximum distance from any point on the curve segment to the approximating line
- **Visual concept**: Imagine a curved path. When you approximate it with straight lines, the chord error is the maximum gap between the curve and the straight line
- Smaller tolerance = smaller chord error = more accurate approximation but more line segments
- Larger tolerance = larger chord error = fewer line segments but less accurate approximation

**CAM Software Preprocessing**:
- For high-quality machining, it's more reliable to **preprocess SPLINE in CAM software**, converting to point sequences and generating optimized G-code
- Therefore, many machine manufacturers prioritize CAM software integration over direct SPLINE support

---

## 2. Machine Types and SPLINE Support Status

### 2.1 CNC Machine Tools

| Machine Type | DXF SPLINE Direct Import | G-code NURBS Interpolation | Notes |
| :--- | :--- | :--- | :--- |
| **General CNC Milling Machines** | ❌ Mostly unsupported | ❌ Unsupported | Many older controllers |
| **CNC Lathes** | ❌ Mostly unsupported | ❌ Unsupported | Primarily 2D machining, low need for SPLINE |
| **Fanuc Plus Control** | ⚠️ DXF import available | ✅ G06.2 support (optional) | Can read SPLINE from DXF but usually approximates. G06.2 used as G-code generated by CAM software |
| **Siemens Sinumerik** | ⚠️ DXF import available | ✅ NURBS support on some models | Can read SPLINE from DXF but usually approximates. High-end models support NURBS interpolation |
| **5-Axis Machines (High-end)** | ⚠️ Some support | ✅ G06.2 support | Handles complex surface machining. G06.2 generated via CAM software, not directly from DXF |

**Important Distinction**:
- **DXF SPLINE Direct Import**: Feature to read SPLINE entities from DXF files and execute NURBS interpolation directly
- **G-code NURBS Interpolation**: Feature where CAM software analyzes SPLINE and generates G06.2 format G-code for execution

**Actual Situation**:
- Many advanced CNC controllers **support NURBS interpolation (G06.2) at the G-code level**
- However, **features that directly read SPLINE entities from DXF files and execute NURBS interpolation** are not common
- Usually, CAM software needs to analyze SPLINE and generate G06.2 format G-code

### 2.2 Laser Cutters and Laser Processing Machines

| Machine Type | DXF SPLINE Direct Import | Notes |
| :--- | :--- | :--- |
| **CO2 Laser Cutters** | ❌ Mostly unsupported | Primarily 2D cutting, low need for SPLINE. SPLINE is ignored or causes errors |
| **Fiber Laser Processing Machines** | ❌ Mostly unsupported | Similarly centered on 2D processing. SPLINE is ignored or causes errors |
| **High-end Laser Processing Machines** | ⚠️ Some auto-conversion | Some models with latest controllers have features to automatically convert SPLINE to polylines, but don't process as SPLINE directly |
| **LightBurn and Similar Software** | ⚠️ Improving | Some laser control software is improving SPLINE import, but ultimately converts to polylines or arcs |

**Practical Recommendations**:
- For DXF files sent to laser cutters, **strongly recommend converting SPLINE to LWPOLYLINE beforehand**
- Many laser processing services also reject DXF files containing SPLINE or request conversion

### 2.3 Other Processing Machines

| Machine Type | DXF SPLINE Direct Import | Notes |
| :--- | :--- | :--- |
| **Plasma Cutters** | ❌ Mostly unsupported | 2D cutting. SPLINE is ignored or causes errors |
| **Waterjet Cutters** | ❌ Mostly unsupported | 2D cutting. SPLINE is ignored or causes errors |
| **Wire EDM Machines** | ❌ Mostly unsupported | Primarily 2D processing. SPLINE is ignored or causes errors |

### 2.4 G-code Level NURBS Interpolation (Supplement)

**Fanuc G06.2 (NURBS Interpolation)**:
- Some Fanuc controllers can execute NURBS interpolation with **G06.2** G-code command
- However, this is **not a feature that directly reads SPLINE from DXF files**
- CAM software needs to analyze SPLINE, extract control points, knot vectors, and weights, then generate G06.2 format G-code
- Using this feature often requires **options/licenses** and is not standard on all Fanuc controllers

**Siemens Sinumerik NURBS Interpolation**:
- Some high-end Siemens controllers (Sinumerik 840D, etc.) support NURBS interpolation
- However, this is also used **not directly from DXF, but via dedicated data exchange formats or CAM software**

**Practical Meaning**:
- These features are used for **high-precision 5-axis machining and complex surface machining**
- Not used in general 2D processing (laser cutters, plasma cutters, etc.)
- For directly reading SPLINE from DXF files for machining, **SPLINE still needs to be converted to LWPOLYLINE**

---

## 3. Actual Problems and Solutions

### 3.1 Problem Symptoms

**SPLINE is Ignored**:
- When DXF files contain SPLINE entities, many machines **ignore SPLINE**
- Even after loading drawings, SPLINE parts don't display or aren't machined

**Error Messages**:
- Some machines display **error messages** when detecting SPLINE entities
- Messages like "Unsupported entity detected" may appear

**Missing Machining Paths**:
- When SPLINE is ignored, **machining paths are missing**, and intended shapes aren't machined

### 3.2 Solutions

#### Method 1: Convert SPLINE to LWPOLYLINE (Recommended)

**Using CAM Software**:
- Use CAM software (e.g., Fusion 360, Mastercam, GibbsCAM) to convert SPLINE to point sequences
- CAM software generates optimal point sequences considering machining accuracy

**Conversion Using ezdxf**:
```python
import ezdxf
from ezdxf.math import BSpline

def convert_spline_to_polyline(spline_entity, segments=100):
    """Convert SPLINE to LWPOLYLINE"""
    # Create BSpline object
    bspline = BSpline(
        spline_entity.control_points,
        order=spline_entity.dxf.degree + 1,
        knots=spline_entity.knots
    )
    
    # Sample points on spline
    points = []
    for i in range(segments + 1):
        t = i / segments
        point = bspline.point(t)
        points.append((point.x, point.y))
    
    return points

# Usage example
doc = ezdxf.readfile("input.dxf")
msp = doc.modelspace()
new_doc = ezdxf.new('R2010')
new_msp = new_doc.modelspace()

for entity in msp:
    if entity.dxftype() == "SPLINE":
        # Convert SPLINE to LWPOLYLINE
        points = convert_spline_to_polyline(entity, segments=200)
        new_msp.add_lwpolyline(points)
    else:
        # Copy other entities as-is
        # (Simplified - actual implementation needs proper copying)

new_doc.saveas("output.dxf")
```

#### Method 2: Pre-convert in CAD Software

**Conversion in AutoCAD**:
1. Open DXF file in AutoCAD
2. Select SPLINE entities
3. Execute `EXPLODE` command to convert SPLINE to polyline
4. Save in R12 format (maximize compatibility)

**Conversion in LibreCAD/QCAD**:
1. Open DXF file
2. If SPLINE entities don't display, pre-convert in original CAD software
3. Save in R12 format

#### Method 3: Check Machine Settings

**Controller Settings**:
- Some latest machines may have **SPLINE auto-conversion** enabled in controller settings
- Check manual to see if this feature is available

---

## 4. Technical Details

### 4.1 NURBS Computational Cost

**Computational Complexity Comparison**:

| Operation | Complexity | Notes |
| :--- | :--- | :--- |
| **LINE evaluation** | O(1) | Simple linear interpolation |
| **ARC evaluation** | O(1) | Trigonometric calculation |
| **NURBS evaluation** | O(d²) | d is degree, usually 3-5 |

**Implementation Complexity**:
- NURBS evaluation requires **recursive basis function calculation**
- For rational B-splines, **weighting calculation** is also needed
- These calculations are difficult to execute on embedded systems

### 4.2 G-code Conversion Algorithm

**General Conversion Process**:

1. **Curve Division**:
   - Divide NURBS curves into line segments within tolerance
   - Division methods:
     - Uniform division (simple but low accuracy)
     - Adaptive division (adjust density based on curvature)

2. **Point Generation**:
   - Calculate points on curve for each division interval
   - Number of points depends on tolerance and curve complexity

3. **G-code Generation**:
   - Convert each point to G01 (linear interpolation) commands
   - Optimize considering tool speed and acceleration

**Conversion Accuracy**:
- Conversion accuracy is controlled by **tolerance**
- Smaller tolerance increases point count and G-code length
- Larger tolerance decreases point count but reduces curve accuracy

**Look-ahead Control (Modern Controllers)**:
- When converting curves to many small line segments (G01), **data starvation** can occur on older controllers
  - Old controllers may not process fast enough, causing **vibration (banging)** during machining
- However, modern CNC controllers feature **look-ahead control**:
  - **Fanuc**: G05.1 (AI contour control) / G08 (preview control)
  - **Siemens**: COMPCAD (compressor CAD) function
  - These features allow smooth passage through many small line segments
- With modern controllers, converting SPLINE to G01 segments is practically viable, though SPLINE direct support is still preferred for efficiency

### 4.3 Memory Usage Comparison

**Memory Usage per Entity** (approximate):

| Entity Type | Memory Usage | Notes |
| :--- | :--- | :--- |
| **LINE** | ~50 bytes | Only start/end coordinates |
| **ARC** | ~80 bytes | Center point, radius, angles |
| **LWPOLYLINE (10 points)** | ~200 bytes | 10 vertices |
| **SPLINE (10 control points)** | ~500 bytes | Control points, knot vectors, weights |

**Memory Usage During Machining**:
- **G-code buffers** are also needed during machining
- When SPLINE is converted, G-code length increases proportionally with point count, increasing memory usage

---

## 5. Best Practices

### 5.1 Creating DXF Files for Machines

**Recommended Entities**:
- ✅ `LINE` (line segment)
- ✅ `ARC` (arc)
- ✅ `CIRCLE` (circle)
- ✅ `LWPOLYLINE` (lightweight polyline)

**Entities to Avoid**:
- ❌ `SPLINE` (spline)
- ❌ `ELLIPSE` (ellipse) - unsupported on some machines
- ❌ `MTEXT` (multiline text) - ignored by machines
- ❌ `HATCH` (hatching) - ignored by machines

### 5.2 Conversion Considerations

**Tolerance Settings**:
- When converting SPLINE to LWPOLYLINE, **set tolerance appropriately**
- Generally, tolerance should be **1/2 to 1/10 of the target machining accuracy**
  - Example: For 0.01mm target machining accuracy, set tolerance to 0.001mm (1/10)
  - This ensures that approximation errors, calculation errors, and machine vibration stay within the target accuracy
  - **Important**: Setting tolerance larger than machining accuracy (e.g., 0.1mm tolerance for 0.01mm accuracy) will result in jagged linear segments that deviate up to the tolerance value from the theoretical curve, making it impossible to achieve the target accuracy

**Point Count Optimization**:
- Too many points increases G-code length and machining time
- Too few points reduces curve accuracy
- **Selecting balanced point count** is important

**Closed Curve Handling**:
- When converting closed SPLINE, set **LWPOLYLINE closed flag**
- This allows machines to recognize it as a closed path correctly

### 5.3 Recommended Workflow

**Recommended Workflow**:

1. **Design in CAD Software**:
   - Use SPLINE to design free-form curves
   - Leverage SPLINE flexibility in design phase

2. **Convert in CAM Software**:
   - Use CAM software to convert SPLINE to optimized point sequences
   - Consider machining parameters (tool diameter, cutting speed, etc.)

3. **Output to Machine**:
   - Send converted DXF file (or G-code) to machine
   - Verify accuracy with test cuts

**Automatic Conversion Using ezdxf**:
```python
import ezdxf
from ezdxf.math import BSpline

def prepare_for_cnc(input_path, output_path, tolerance=0.1):
    """Prepare DXF file for machines"""
    doc = ezdxf.readfile(input_path)
    msp = doc.modelspace()
    new_doc = ezdxf.new('R12')  # Save in R12 format (maximum compatibility)
    new_msp = new_doc.modelspace()
    
    for entity in msp:
        if entity.dxftype() == "SPLINE":
            # Convert SPLINE to LWPOLYLINE
            bspline = BSpline(
                entity.control_points,
                order=entity.dxf.degree + 1,
                knots=entity.knots
            )
            
            # Generate points based on tolerance
            points = []
            # Note: This simplified calculation (arc_length / tolerance) uses uniform spacing
            # This works reasonably well, but has limitations:
            # - High curvature areas (sharp curves) may be too coarse
            # - Low curvature areas (near-straight sections) may be unnecessarily fine
            # For production use, consider adaptive subdivision methods:
            # - ezdxf provides path.flattening(distance) method for adaptive division
            # - Adaptive subdivision adjusts point density based on local curvature
            #   to maintain tolerance while minimizing point count
            segments = max(10, int(bspline.arc_length() / tolerance))
            for i in range(segments + 1):
                t = i / segments
                point = bspline.point(t)
                points.append((point.x, point.y))
            
            new_msp.add_lwpolyline(points)
        elif entity.dxftype() in ["LINE", "ARC", "CIRCLE", "LWPOLYLINE"]:
            # Copy supported entities as-is
            # (Actual implementation needs proper copying)
            pass
    
    new_doc.saveas(output_path)
    print(f"Conversion for machines complete: {output_path}")

# Usage example
prepare_for_cnc("design.dxf", "cnc_ready.dxf", tolerance=0.1)
```

---

## 6. Summary

### Main Reasons Machines Don't Directly Support SPLINE

1. **Historical Reasons**: Many controllers existed before SPLINE introduction
2. **Implementation Complexity**: NURBS calculations are complex and unsuitable for real-time processing
3. **Resource Constraints**: Embedded system memory/CPU resources are limited
4. **DXF to G-code Conversion Complexity**: Features to directly read SPLINE from DXF files and execute NURBS interpolation are not common
5. **Standardization Issues**: DXF specification is complex and difficult to implement
6. **Accuracy and Quality**: Preprocessing in CAM software provides more stable quality

### Important Distinction: G-code Level NURBS Interpolation

**G-code Level NURBS Interpolation (G06.2)**:
- Some high-end controllers (Fanuc, Siemens) have **G06.2 (NURBS interpolation)** G-code command
- However, this is **not a feature that directly reads SPLINE entities from DXF files and executes them**
- CAM software needs to analyze SPLINE, extract control points, knot vectors, and weights, then generate G06.2 format G-code
- This feature is used for **high-precision 5-axis machining and complex surface machining**, not general 2D processing

**DXF SPLINE Direct Import**:
- Features that directly read SPLINE entities from DXF files and execute NURBS interpolation are **not common**
- On many machines, SPLINE is ignored, causes errors, or is automatically converted to polylines

### Practical Recommendations

- **2D Processing (Laser Cutters, Plasma Cutters, etc.)**: Strongly recommend converting SPLINE to LWPOLYLINE beforehand
- **3D Processing (5-Axis Machines, etc.)**: Recommend using CAM software to convert SPLINE to G06.2 format G-code
- **Compatibility Priority**: When uncertain, always recommend converting SPLINE to LWPOLYLINE

### Recommended Solutions

- **Convert SPLINE to LWPOLYLINE**: When preparing DXF files for machines, convert SPLINE to point sequences
- **Utilize CAM Software**: Recommend preprocessing in CAM software for high-quality machining
- **Save in R12 Format**: Recommend saving in R12 format for maximum compatibility
- **Perform Test Cuts**: Perform test cuts with converted files and verify accuracy

---

Related: [ezdxf Practical Guide](./ezdxf-guide.md) | [Free Software Usage Guidelines](./free-software-guide.md) | [Comparison with Industrial Formats](../comparison/dxf-vs-industrial-formats.md) | [G-code Overview and Versioning](../comparison/g-code-overview.md)
