# Working with Shapely Geometries

A practical guide for exporting Shapely geometries (Polygon, MultiPolygon, LineString, etc.) to DXF format using **ezdxf**.

This guide focuses on **data conversion implementation** - how to transform your existing Shapely geometry objects into DXF files that can be opened in CAD software.

::: tip Related Documentation
- [ezdxf Practical Guide](./ezdxf-guide.md) - Complete ezdxf reference guide
- [Polygons, Holes, and Fills](../geometry/polygons-and-fills.md) - DXF polygon representation methods
- [Common Pitfalls and Solutions](./common-pitfalls.md) - General DXF implementation considerations
:::

---

## 1. Introduction

### Target Audience

This guide is designed for users who:
- Already work with **Shapely** for geometric operations
- Need to export their Shapely geometries to DXF format
- Want practical, ready-to-use code examples
- Prefer implementation details over mathematical theory

### What You'll Learn

- How to convert Shapely `Polygon` objects to DXF `LWPOLYLINE` entities
- How to handle polygons with holes using DXF `HATCH` entities
- How to export `MultiPolygon`, `LineString`, and `LinearRing` objects
- Coordinate system handling for 2D data (spoiler: it's simpler than you think!)
- Best practices and common pitfalls

### Prerequisites

- Basic knowledge of Shapely
- Python 3.10 or higher
- Installed packages: `ezdxf` and `shapely`

---

## 2. Installation and Dependencies

### Installing Required Packages

```bash
# Install ezdxf
pip install ezdxf

# Install Shapely (if not already installed)
pip install shapely
```

### Version Compatibility

- **ezdxf**: Version 1.0.0 or higher recommended
- **Shapely**: Version 2.0.0 or higher recommended
- **Python**: 3.10 or higher

---

## 3. Basic Conversion: Polygon to LWPOLYLINE

The most common use case: converting a Shapely `Polygon` to a DXF lightweight polyline (`LWPOLYLINE`).

### Simple Polygon (No Holes)

Shapely's `Polygon.exterior.coords` provides coordinates as a tuple sequence, which can be directly passed to ezdxf.

```python
import ezdxf
from shapely.geometry import Polygon

# Create a Shapely polygon (triangle example)
poly = Polygon([(0, 0), (10, 0), (5, 10), (0, 0)])

def export_shapely_polygon(msp, polygon, layer="0", closed=True):
    """Export Shapely Polygon to DXF LWPOLYLINE
    
    Args:
        msp: Model space from ezdxf document
        polygon: Shapely Polygon object
        layer: Layer name (default: "0")
        closed: Whether to close the polyline (default: True)
    """
    # Get exterior coordinates
    # Note: Shapely's coords includes the closing point, so we remove it
    # for LWPOLYLINE (ezdxf handles closing via the 'closed' parameter)
    points = list(polygon.exterior.coords[:-1])  # Remove duplicate last point
    
    # Add as LWPOLYLINE
    msp.add_lwpolyline(
        points,
        dxfattribs={
            'layer': layer,
            'closed': closed
        }
    )

# Usage example
doc = ezdxf.new('R2010')
msp = doc.modelspace()
export_shapely_polygon(msp, poly, layer="Polygons")
doc.saveas("shapely_export.dxf")
```

**Key Points**:
- Shapely's `coords` returns tuples `(x, y)` which ezdxf accepts directly
- Use `closed=True` to automatically connect the last point to the first
- Remove the duplicate closing point from Shapely's coordinate sequence

### Handling Coordinate Systems

**Good News for 2D Users**: If you're working with 2D data (which is typical for Shapely), you don't need to worry about complex coordinate system transformations (WCS/OCS). Simply pass your coordinates as tuples `(x, y)` and ezdxf handles the rest.

```python
# 2D coordinates - just use tuples directly
points = [(0, 0), (10, 0), (10, 10), (0, 10)]
msp.add_lwpolyline(points)  # That's it!

# No need for complex transformations unless you're working with 3D data
```

::: tip Coordinate System Note
For 3D operations, see [Coordinate Systems (WCS/OCS/AAA)](../geometry/coordinate-systems.md) and the [ezdxf Practical Guide](./ezdxf-guide.md#coordinate-system-handling). For 2D Shapely data, you can ignore these complexities.
:::

---

## 4. Polygons with Holes: Using HATCH

When your Shapely `Polygon` has holes (interiors), you'll want to use DXF `HATCH` entities instead of `LWPOLYLINE` to properly represent filled areas.

### Basic HATCH Export

```python
import ezdxf
from shapely.geometry import Polygon

def export_polygon_as_hatch(msp, polygon, layer="0", color=1, pattern="SOLID"):
    """Export Shapely Polygon with holes as DXF HATCH
    
    Args:
        msp: Model space from ezdxf document
        polygon: Shapely Polygon object (may have holes)
        layer: Layer name (default: "0")
        color: ACI color code (default: 1 = red)
        pattern: Hatch pattern name (default: "SOLID" for solid fill)
    """
    # Create HATCH entity
    hatch = msp.add_hatch(color=color)
    hatch.dxf.layer = layer
    hatch.set_pattern_fill(name=pattern, scale=1.0)
    
    # Add exterior boundary (outer loop)
    # Remove duplicate closing point
    ext_coords = list(polygon.exterior.coords[:-1])
    hatch.paths.add_polyline_path(ext_coords, is_closed=True)
    
    # Add interior boundaries (holes)
    for interior in polygon.interiors:
        int_coords = list(interior.coords[:-1])  # Remove duplicate closing point
        hatch.paths.add_polyline_path(int_coords, is_closed=True)
    
    return hatch

# Example: Polygon with a hole
hole_poly = Polygon(
    [(0, 0), (10, 0), (10, 10), (0, 10)],  # Exterior (outer boundary)
    [[(2, 2), (8, 2), (8, 8), (2, 8)]]    # Interior (hole)
)

doc = ezdxf.new('R2010')
msp = doc.modelspace()
export_polygon_as_hatch(msp, hole_poly, layer="HatchedPolygons", color=2)
doc.saveas("hatch_export.dxf")
```

### HATCH Pattern Options

```python
# Solid fill (most common)
hatch.set_pattern_fill(name="SOLID", scale=1.0)

# Patterned fills (examples)
hatch.set_pattern_fill(name="ANSI31", scale=1.0)  # Diagonal lines
hatch.set_pattern_fill(name="ANSI37", scale=1.0)  # Crosshatch
```

::: tip HATCH vs LWPOLYLINE
- **LWPOLYLINE**: Use for **outline only** (no fill). Good for CNC machines, laser cutters.
- **HATCH**: Use for **filled areas**. Good for visual representation, CAD drawings.

See [Polygons, Holes, and Fills](../geometry/polygons-and-fills.md) for detailed comparison.
:::

---

## 5. MultiPolygon Export

Shapely `MultiPolygon` objects contain multiple polygons. Export each polygon separately.

```python
import ezdxf
from shapely.geometry import MultiPolygon, Polygon

def export_multipolygon(msp, multipolygon, layer="0", use_hatch=False):
    """Export Shapely MultiPolygon to DXF
    
    Args:
        msp: Model space from ezdxf document
        multipolygon: Shapely MultiPolygon object
        layer: Layer name (default: "0")
        use_hatch: If True, use HATCH for polygons with holes (default: False)
    """
    for polygon in multipolygon.geoms:
        if use_hatch and len(polygon.interiors) > 0:
            # Use HATCH for polygons with holes
            export_polygon_as_hatch(msp, polygon, layer=layer)
        else:
            # Use LWPOLYLINE for simple polygons
            export_shapely_polygon(msp, polygon, layer=layer)

# Example
poly1 = Polygon([(0, 0), (5, 0), (5, 5), (0, 5)])
poly2 = Polygon([(10, 10), (15, 10), (15, 15), (10, 15)])
multipoly = MultiPolygon([poly1, poly2])

doc = ezdxf.new('R2010')
msp = doc.modelspace()
export_multipolygon(msp, multipoly, layer="MultiPolygons")
doc.saveas("multipolygon_export.dxf")
```

---

## 6. LineString and LinearRing Export

### LineString Export

```python
import ezdxf
from shapely.geometry import LineString

def export_linestring(msp, linestring, layer="0", closed=False):
    """Export Shapely LineString to DXF LWPOLYLINE
    
    Args:
        msp: Model space from ezdxf document
        linestring: Shapely LineString object
        layer: Layer name (default: "0")
        closed: Whether to close the polyline (default: False)
    """
    points = list(linestring.coords)
    msp.add_lwpolyline(
        points,
        dxfattribs={
            'layer': layer,
            'closed': closed
        }
    )

# Example
line = LineString([(0, 0), (5, 10), (10, 5), (15, 15)])
doc = ezdxf.new('R2010')
msp = doc.modelspace()
export_linestring(msp, line, layer="Lines")
doc.saveas("linestring_export.dxf")
```

### LinearRing Export

`LinearRing` is automatically closed, so set `closed=True`:

```python
from shapely.geometry import LinearRing

def export_linearring(msp, linearring, layer="0"):
    """Export Shapely LinearRing to DXF LWPOLYLINE"""
    points = list(linearring.coords[:-1])  # Remove duplicate closing point
    msp.add_lwpolyline(
        points,
        dxfattribs={
            'layer': layer,
            'closed': True
        }
    )
```

---

## 7. Complete Export Function

Here's a comprehensive function that handles all Shapely geometry types:

```python
import ezdxf
from shapely.geometry import (
    Polygon, MultiPolygon, LineString, LinearRing,
    Point, GeometryCollection
)

def export_shapely_geometry(msp, geometry, layer="0", use_hatch_for_holes=True):
    """Export any Shapely geometry to DXF
    
    Args:
        msp: Model space from ezdxf document
        geometry: Shapely geometry object
        layer: Layer name (default: "0")
        use_hatch_for_holes: Use HATCH for polygons with holes (default: True)
    """
    if isinstance(geometry, Polygon):
        if use_hatch_for_holes and len(geometry.interiors) > 0:
            export_polygon_as_hatch(msp, geometry, layer=layer)
        else:
            export_shapely_polygon(msp, geometry, layer=layer)
    
    elif isinstance(geometry, MultiPolygon):
        for polygon in geometry.geoms:
            export_shapely_geometry(msp, polygon, layer=layer, use_hatch_for_holes=use_hatch_for_holes)
    
    elif isinstance(geometry, LineString):
        export_linestring(msp, geometry, layer=layer)
    
    elif isinstance(geometry, LinearRing):
        export_linearring(msp, geometry, layer=layer)
    
    elif isinstance(geometry, Point):
        # Points can be exported as small circles or text
        msp.add_circle(
            (geometry.x, geometry.y),
            radius=0.1,  # Small circle
            dxfattribs={'layer': layer}
        )
    
    elif isinstance(geometry, GeometryCollection):
        # Recursively export each geometry in the collection
        for geom in geometry.geoms:
            export_shapely_geometry(msp, geom, layer=layer, use_hatch_for_holes=use_hatch_for_holes)
    
    else:
        raise ValueError(f"Unsupported geometry type: {type(geometry)}")

# Usage example
from shapely.geometry import Polygon, MultiPolygon

poly1 = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)])
poly2 = Polygon(
    [(20, 20), (30, 20), (30, 30), (20, 30)],
    [[(22, 22), (28, 22), (28, 28), (22, 28)]]
)
multipoly = MultiPolygon([poly1, poly2])

doc = ezdxf.new('R2010')
msp = doc.modelspace()
export_shapely_geometry(msp, multipoly, layer="ExportedGeometries")
doc.saveas("complete_export.dxf")
```

---

## 8. Advanced Topics

### Setting Attributes (Color, Linetype, Lineweight)

```python
def export_polygon_with_attributes(msp, polygon, layer="0", color=1, linetype="CONTINUOUS", lineweight=25):
    """Export Polygon with custom attributes"""
    points = list(polygon.exterior.coords[:-1])
    
    # Ensure layer exists
    doc = msp.doc
    if layer not in doc.layers:
        doc.layers.new(layer, dxfattribs={'color': color})
    
    # Create linetype if needed
    if linetype not in doc.linetypes and linetype != "CONTINUOUS":
        doc.linetypes.new(linetype, dxfattribs={
            'description': 'Custom linetype',
            'length': 1.0,
            'pattern': [0.5, -0.5]  # Example pattern
        })
    
    msp.add_lwpolyline(
        points,
        dxfattribs={
            'layer': layer,
            'color': color,
            'linetype': linetype,
            'lineweight': lineweight,  # 0.25mm
            'closed': True
        }
    )
```

### Batch Export with Layer Organization

```python
def export_shapely_collection(msp, geometries, layer_prefix="Layer"):
    """Export multiple geometries, organizing by type"""
    layer_map = {
        'Polygon': f"{layer_prefix}_Polygons",
        'LineString': f"{layer_prefix}_Lines",
        'MultiPolygon': f"{layer_prefix}_MultiPolygons"
    }
    
    for geom in geometries:
        geom_type = type(geom).__name__
        layer = layer_map.get(geom_type, layer_prefix)
        export_shapely_geometry(msp, geom, layer=layer)
```

---

## 9. Common Pitfalls and Solutions

### Pitfall 1: Duplicate Closing Point

**Problem**: Shapely's `coords` includes the closing point, but ezdxf's `closed=True` handles this automatically.

**Solution**: Remove the last point when converting:

```python
# ✅ Correct
points = list(polygon.exterior.coords[:-1])  # Remove duplicate
msp.add_lwpolyline(points, dxfattribs={'closed': True})

# ❌ Incorrect (creates duplicate point)
points = list(polygon.exterior.coords)  # Includes closing point
msp.add_lwpolyline(points, dxfattribs={'closed': True})
```

### Pitfall 2: Coordinate System Confusion

**Problem**: Worrying about WCS/OCS transformations for 2D data.

**Solution**: For 2D Shapely data, just use tuples directly:

```python
# ✅ Correct for 2D
points = [(x, y) for x, y in polygon.exterior.coords[:-1]]
msp.add_lwpolyline(points)

# ❌ Unnecessary complexity
# No need for OCS transformations unless working with 3D data
```

### Pitfall 3: Holes Not Showing

**Problem**: Using `LWPOLYLINE` for polygons with holes doesn't show the fill.

**Solution**: Use `HATCH` for polygons with interiors:

```python
# ✅ Correct for polygons with holes
if len(polygon.interiors) > 0:
    export_polygon_as_hatch(msp, polygon)
else:
    export_shapely_polygon(msp, polygon)
```

### Pitfall 4: Layer Not Found Error

**Problem**: Referencing a layer that doesn't exist.

**Solution**: Always ensure layers exist before use:

```python
def ensure_layer(doc, layer_name, color=7):
    """Ensure layer exists, create if it doesn't"""
    if layer_name not in doc.layers:
        doc.layers.new(layer_name, dxfattribs={'color': color})
    return doc.layers.get(layer_name)

# Usage
doc = ezdxf.new('R2010')
ensure_layer(doc, "MyLayer", color=1)
msp = doc.modelspace()
# Now safe to use "MyLayer"
```

---

## 10. Best Practices

1. **Choose the Right Entity Type**
   - Use `LWPOLYLINE` for outlines (CNC machines, laser cutters)
   - Use `HATCH` for filled areas (visual representation)

2. **Handle Coordinate Sequences Correctly**
   - Always remove duplicate closing points: `coords[:-1]`
   - Use `closed=True` parameter instead of manually closing

3. **Organize with Layers**
   - Create meaningful layer names
   - Group related geometries on the same layer

4. **Validate Input**
   - Check if geometry is valid: `geometry.is_valid`
   - Handle empty geometries gracefully

5. **Error Handling**
   - Wrap file operations in try-except blocks
   - Validate file paths before saving

---

## 11. Complete Example: Real-World Use Case

Here's a complete example that demonstrates a typical workflow:

```python
import ezdxf
from shapely.geometry import Polygon, MultiPolygon
from pathlib import Path

def export_shapely_to_dxf(geometries, output_path, layer_name="ShapelyExport"):
    """Complete export function with error handling"""
    try:
        # Create DXF document
        doc = ezdxf.new('R2010')
        msp = doc.modelspace()
        
        # Ensure layer exists
        if layer_name not in doc.layers:
            doc.layers.new(layer_name, dxfattribs={'color': 2})  # Yellow
        
        # Export each geometry
        for geom in geometries:
            if isinstance(geom, Polygon):
                if len(geom.interiors) > 0:
                    # Use HATCH for polygons with holes
                    export_polygon_as_hatch(msp, geom, layer=layer_name, color=2)
                else:
                    # Use LWPOLYLINE for simple polygons
                    export_shapely_polygon(msp, geom, layer=layer_name)
            elif isinstance(geom, MultiPolygon):
                for poly in geom.geoms:
                    export_shapely_geometry(msp, poly, layer=layer_name)
        
        # Save file
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        doc.saveas(str(output_path))
        print(f"Successfully exported {len(geometries)} geometries to {output_path}")
        
    except Exception as e:
        print(f"Error exporting to DXF: {e}")
        raise

# Usage
poly1 = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)])
poly2 = Polygon(
    [(20, 20), (30, 20), (30, 30), (20, 30)],
    [[(22, 22), (28, 22), (28, 28), (22, 28)]]
)

geometries = [poly1, poly2]
export_shapely_to_dxf(geometries, "output/shapely_export.dxf", layer_name="MyPolygons")
```

---

## Summary

This guide covered the essential techniques for exporting Shapely geometries to DXF:

- **Polygon → LWPOLYLINE**: Simple conversion using `exterior.coords`
- **Polygon with holes → HATCH**: Use `HATCH` entities for filled areas
- **MultiPolygon**: Export each polygon separately
- **LineString/LinearRing**: Direct coordinate conversion
- **2D Coordinates**: No complex transformations needed - just use tuples!

**Key Takeaways**:
- Shapely's coordinate tuples work directly with ezdxf
- Use `HATCH` for polygons with holes
- Remove duplicate closing points: `coords[:-1]`
- For 2D data, coordinate system transformations are unnecessary

For more advanced topics (3D transformations, complex splines, etc.), refer to the [ezdxf Practical Guide](./ezdxf-guide.md).

---

Related: [ezdxf Practical Guide](./ezdxf-guide.md) | [Polygons, Holes, and Fills](../geometry/polygons-and-fills.md) | [Common Pitfalls](./common-pitfalls.md)
