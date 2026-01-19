# Advanced Spline, NURBS, and B-spline Guide

A comprehensive guide to advanced spline operations in ezdxf, covering NURBS mathematics, knot vector generation, and complex spline transformations.

::: tip Related Documentation
- [ezdxf Practical Guide](./ezdxf-guide.md) - Complete ezdxf reference guide
- [CNC Machine Compatibility](./cnc-machine-compatibility.md) - Why machines don't support SPLINE
- [Advanced Entities](../geometry/advanced-entities.md) - DXF advanced entity types
:::

---

## 1. Introduction

This guide covers advanced topics related to DXF **SPLINE** entities, including:

- **B-spline** (non-rational splines)
- **NURBS** (Non-Uniform Rational B-Spline)
- **Knot vector generation** and mathematics
- **Advanced interpolation methods**
- **Spline conversion and approximation**

::: tip For Most Users
If you're working with **point sequences** (e.g., from Shapely `LineString.coords`), you typically don't need this advanced guide. See:
- [Working with Shapely Geometries](./ezdxf-shapely-integration.md) - For Shapely users
- [ezdxf Practical Guide - Converting Point Sequences](./ezdxf-guide.md#converting-point-sequences-to-curves-decision-criteria-and-implementation) - For general point sequence handling

This guide is for users who need **mathematical control** over spline curves or are working with **existing SPLINE entities** that require advanced manipulation.
:::

---

## 2. Spline Support Overview

ezdxf fully supports DXF **SPLINE** entities and supports both B-spline and NURBS (Non-Uniform Rational B-Spline).

### Support Status

| Feature | Support Status | Notes |
| :--- | :--- | :--- |
| **SPLINE Entity** | ✅ Full support | Available from DXF R13+ |
| **B-spline (non-rational)** | ✅ Full support | Defined by control points and knot vector |
| **NURBS (rational B-spline)** | ✅ Full support | Defined by weighted control points |
| **Fit Points (through points)** | ✅ Full support | Auto-generated from points curve passes through |
| **Control Points** | ✅ Full support | Explicit control points and knot vector |
| **Rational Splines** | ✅ Full support | Control via weights |

---

## 3. SPLINE Entity Creation Methods

ezdxf can create splines in multiple ways.

### 3.1 Creation via Fit Points (Easiest)

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Create spline by specifying through points
fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = msp.add_spline(fit_points)

# Can also specify start/end tangent directions
spline_with_tangents = msp.add_spline(
    fit_points,
    start_tangent=(1, 0),  # Start tangent direction
    end_tangent=(0, 1)     # End tangent direction
)
```

**Important Note**: Since Fit points to control points conversion uses different algorithms per CAD software, **curves may not be exactly the same between different CAD software**. For compatibility, see Section 4.

### 3.2 Creation via Control Points (Recommended)

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Explicitly specify control points
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
degree = 3  # 3rd degree spline (cubic)

# Open spline (start and end points don't match)
spline_open = msp.add_open_spline(control_points, degree=degree)

# Closed spline (start and end points match)
spline_closed = msp.add_closed_spline(control_points, degree=degree)
```

### 3.3 NURBS (Rational B-spline) Creation

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Specify control points and weights
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
weights = [1.0, 2.0, 1.0, 1.0]  # Weight for each control point

# Create rational spline (NURBS)
spline_rational = msp.add_rational_spline(
    control_points,
    weights=weights,
    degree=3
)

# Closed rational spline
spline_closed_rational = msp.add_closed_rational_spline(
    control_points,
    weights=weights,
    degree=3
)
```

---

## 4. Explicit Knot Vector Specification

For more advanced control, knot vectors can be explicitly specified.

### 4.1 Understanding Knot Vectors

A **knot vector** is a sequence of parameter values that define how control points influence the curve. The knot vector determines:

- **Curve continuity**: How smooth the curve is at control points
- **Curve shape**: How the curve responds to control point movement
- **Curve domain**: The parameter range over which the curve is defined

### 4.2 Open Uniform Knot Vector (Most Common)

```python
import ezdxf
from ezdxf.math import BSpline

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Specify control points and knot vector
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
degree = 3

# Generate open uniform knot vector
n = len(control_points)
order = degree + 1

knots = []
# Start knots (degree+1 zeros)
knots.extend([0] * order)
# Middle knots (uniform distribution)
for i in range(1, n - degree):
    knots.append(i)
# End knots (degree+1 copies of max value)
knots.extend([n - degree] * order)

# Create BSpline object
bspline = BSpline(control_points, order=order, knots=knots)

# Add as SPLINE entity
spline = msp.add_spline_control_frame(
    control_points=control_points,
    degree=degree,
    knots=knots
)
```

### 4.3 Helper Function for Knot Vector Generation

```python
def generate_open_uniform_knots(control_point_count, degree):
    """Generate open uniform knot vector"""
    order = degree + 1
    knots = []
    
    # Start knots (clamped)
    knots.extend([0] * order)
    
    # Middle knots (uniform)
    for i in range(1, control_point_count - degree):
        knots.append(i)
    
    # End knots (clamped)
    max_knot = control_point_count - degree
    knots.extend([max_knot] * order)
    
    return knots

# Usage
control_points = [(0, 0), (5, 10), (10, 5), (15, 15), (20, 10)]
knots = generate_open_uniform_knots(len(control_points), degree=3)
```

---

## 5. Advanced Features of ezdxf.math Module

ezdxf's `math` module provides rich functionality for spline operations.

### 5.1 Global B-spline Interpolation

Generate control points from through points (fit points).

```python
import ezdxf
from ezdxf.math import global_bspline_interpolation

# Fit points (points the curve passes through)
fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]

# Generate B-spline from fit points
bspline = global_bspline_interpolation(
    fit_points,
    degree=3,
    method='chord'  # Choose from 'chord', 'uniform', 'centripetal'
)

# Get control points and knot vector
control_points = bspline.control_points
knots = bspline.knots()

# Method comparison:
# - 'chord': Based on chord length (most common, smooth curves)
# - 'uniform': Uniform parameter spacing (simple but may create loops)
# - 'centripetal': Based on square root of chord length (smoother than chord)
```

### 5.2 Local Cubic B-spline Interpolation

Suitable for short curves or when you need piecewise cubic segments.

```python
from ezdxf.math import local_cubic_bspline_interpolation

fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
bspline_local = local_cubic_bspline_interpolation(fit_points)
```

### 5.3 Bezier Decomposition

Decompose B-spline into Bezier segments (useful for rendering).

```python
from ezdxf.math import bezier_decomposition

bspline = global_bspline_interpolation(fit_points, degree=3)
bezier_segments = bezier_decomposition(bspline)

# Each segment is a cubic Bezier curve
for segment in bezier_segments:
    # segment contains control points for one Bezier curve
    pass
```

### 5.4 Cubic Bezier Approximation

Approximate arbitrary B-spline with cubic Bezier curves.

```python
from ezdxf.math import cubic_bezier_approximation

bspline = global_bspline_interpolation(fit_points, degree=3)
bezier_approx = cubic_bezier_approximation(bspline, segments=10)

# Returns list of Bezier curves approximating the spline
```

---

## 6. Reading and Operating Splines

### 6.1 Reading Spline Properties

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# Search for SPLINE entities
for entity in msp:
    if entity.dxftype() == "SPLINE":
        # Get spline properties
        print(f"Degree: {entity.dxf.degree}")
        print(f"Control point count: {len(entity.control_points)}")
        print(f"Fit point count: {len(entity.fit_points) if entity.fit_points else 0}")
        print(f"Knot count: {len(entity.knots)}")
        
        # Whether rational spline (NURBS)
        if entity.dxf.flags & 4:  # RATIONAL_SPLINE flag
            print("NURBS (rational spline)")
            print(f"Weights: {entity.weights}")
        
        # Whether closed spline
        if entity.dxf.flags & 1:  # CLOSED_SPLINE flag
            print("Closed spline")
        
        # Get control points
        for i, point in enumerate(entity.control_points):
            print(f"Control point {i}: ({point.x}, {point.y}, {point.z})")
```

### 6.2 Modifying Splines

```python
# Modify control points
for entity in msp:
    if entity.dxftype() == "SPLINE":
        # Note: Direct modification may not work for all properties
        # Better to recreate spline with modified parameters
        original_points = list(entity.control_points)
        modified_points = [(x + 1, y + 1) for x, y, z in original_points]
        
        # Delete old spline
        msp.delete_entity(entity)
        
        # Create new spline
        msp.add_spline_control_frame(
            control_points=modified_points,
            degree=entity.dxf.degree,
            knots=list(entity.knots)
        )
```

---

## 7. Compatibility and Uniqueness Issues

### 7.1 Problem: Fit Points Conversion Differences

**Important Note**: DXF SPLINE entities may have **different control point conversions per CAD software when only Fit Points (through points) are specified**.

#### Problem Causes

1. **Fit Points to control points conversion algorithms differ per CAD**
   - AutoCAD, BricsCAD, LibreCAD, etc. each use different algorithms
   - Even with same Fit Points, curve shapes may differ when opened in different CAD software

2. **Knot vector generation methods differ**
   - Various methods: Uniform, Chord Length, Centripetal, etc.

### 7.2 Solution: Explicitly Specify Control Points and Knot Vector

**To ensure compatibility, strongly recommend explicitly specifying control points and knot vector instead of Fit Points.**

```python
import ezdxf

def create_compatible_spline(msp, control_points, degree=3):
    """Create spline ensuring compatibility with other CAD software"""
    # Generate open uniform knot vector (standard method)
    n = len(control_points)
    order = degree + 1
    
    # Open uniform knot vector
    knots = []
    # Start knots (degree+1)
    knots.extend([0] * order)
    # Middle knots (uniform distribution)
    for i in range(1, n - degree):
        knots.append(i)
    # End knots (degree+1)
    knots.extend([n - degree] * order)
    
    # Create by explicitly specifying control points and knot vector
    spline = msp.add_spline_control_frame(
        control_points=control_points,
        degree=degree,
        knots=knots
    )
    
    return spline

# Usage example
doc = ezdxf.new('R2010')
msp = doc.modelspace()

control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = create_compatible_spline(msp, control_points)
doc.saveas("compatible_spline.dxf")
```

### 7.3 Compatibility by DXF Version

| DXF Version | SPLINE Support | Recommended Use |
| :--- | :--- | :--- |
| **Pre-R12** | ❌ Unsupported | SPLINE unavailable. Need polyline approximation |
| **R13+** | ✅ Supported | SPLINE entities available |
| **R2000+** | ✅ Full support | Handle references possible. Recommended |

**Recommendation**: Recommend saving drawings containing splines in **R2000+ versions**.

### 7.4 Compatibility Testing

```python
import ezdxf

def test_spline_compatibility():
    """Test spline compatibility"""
    # Test control points
    control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
    
    # Method 1: Fit Points only (may have compatibility issues)
    doc1 = ezdxf.new('R2010')
    msp1 = doc1.modelspace()
    fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
    spline1 = msp1.add_spline(fit_points)
    doc1.saveas("test_fit_points.dxf")
    
    # Method 2: Explicit control points and knot vector (recommended)
    doc2 = ezdxf.new('R2010')
    msp2 = doc2.modelspace()
    spline2 = create_compatible_spline(msp2, control_points)
    doc2.saveas("test_control_points.dxf")
    
    print("Test files created.")
    print("Open in different CAD software and verify curve shapes match.")

test_spline_compatibility()
```

---

## 8. Spline Conversion and Approximation

### 8.1 Converting SPLINE to Polyline

When conversion to polyline is needed (e.g., for CNC machines that don't support SPLINE):

```python
import ezdxf
from ezdxf.math import BSpline

def convert_spline_to_polyline(spline_entity, segments=100):
    """Convert spline to polyline (approximation)"""
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
doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()
new_doc = ezdxf.new('R2010')
new_msp = new_doc.modelspace()

for entity in msp:
    if entity.dxftype() == "SPLINE":
        # Convert spline to polyline
        points = convert_spline_to_polyline(entity, segments=200)
        new_msp.add_lwpolyline(points)
    else:
        # Copy other entities as-is
        # (Simplified - actual implementation needs proper copying)
        pass

new_doc.saveas("converted.dxf")
```

### 8.2 Converting Point Sequences to SPLINE

When you have a point sequence and want to convert it to SPLINE:

```python
import ezdxf
from ezdxf.math import global_bspline_interpolation

def export_points_as_spline(points, output_path, degree=3, method='chord'):
    """Export point sequence as SPLINE"""
    doc = ezdxf.new('R2010')  # Recommend R2000+
    msp = doc.modelspace()
    
    # Explicitly calculate control points (recommended, high compatibility)
    bspline = global_bspline_interpolation(
        points,
        degree=degree,
        method=method  # 'chord', 'uniform', 'centripetal'
    )
    
    # Get control points and knot vector
    control_points = bspline.control_points
    knots = bspline.knots()
    
    # Add as SPLINE entity
    spline = msp.add_spline_control_frame(
        control_points=control_points,
        degree=degree,
        knots=knots
    )
    
    doc.saveas(output_path)
    print(f"Exported point sequence as SPLINE: {len(points)} points -> {len(control_points)} control points")

# Usage example
points = [(0, 0), (5, 10), (10, 5), (15, 15), (20, 10), (25, 5)]
export_points_as_spline(points, "output_spline.dxf", degree=3, method='chord')
```

---

## 9. Best Practices

1. **Explicitly specify control points and knot vector**
   - Don't rely only on Fit Points
   - Improves compatibility with other CAD software

2. **Use DXF version R2000 or later**
   - SPLINE unavailable in R12 and earlier

3. **Use weights only when rational splines (NURBS) are needed**
   - Don't use weights if regular B-spline is sufficient

4. **Perform testing**
   - Open in different CAD software and verify curve shapes match

5. **Use approximation as needed**
   - Convert to polylines or Bezier curves when rendering or machines don't support SPLINE

6. **Choose appropriate interpolation method**
   - `'chord'`: Most common, produces smooth curves
   - `'uniform'`: Simple but may create loops
   - `'centripetal'`: Smoother than chord for certain cases

---

## Summary

This guide covered advanced spline operations:

- **Knot vector generation**: Understanding and creating knot vectors
- **NURBS**: Rational B-splines with weights
- **Interpolation methods**: Converting fit points to control points
- **Compatibility**: Ensuring splines work across different CAD software
- **Conversion**: Converting between splines and polylines

**Key Takeaways**:
- Always specify control points and knot vectors explicitly for compatibility
- Use R2000+ DXF versions for spline support
- Test splines in target CAD software before production use
- Consider converting to polylines for CNC machines

For basic spline usage and point sequence handling, see the [ezdxf Practical Guide](./ezdxf-guide.md).

---

Related: [ezdxf Practical Guide](./ezdxf-guide.md) | [Working with Shapely Geometries](./ezdxf-shapely-integration.md) | [CNC Machine Compatibility](./cnc-machine-compatibility.md)
