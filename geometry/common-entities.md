# Common Entities

This explains the structure of basic graphic elements (entities) most frequently used in DXF's `ENTITIES` section.

## Entity Classification and Terminology

Individual elements drawn in DXF are officially called **entities** or **graphical objects**.

In implementation and design contexts, they are commonly distinguished by nature as follows, but these are more like general CAD concepts rather than strict DXF specification distinctions.

- **Geometric Entity**: LINE, CIRCLE, ARC, etc., which have pure geometric shapes.
- **Annotation**: TEXT, DIMENSION, etc., which add information.
- **Segment**: Individual "sections" that make up a polyline. This term is also used in specifications for explanation.

Also, things that loop like circles are called **"Closed"**, and things with endpoints like straight lines are called **"Open"**, but these are officially used concepts in flag settings for polylines, etc.

## Basic Shape Preview

<ClientOnly>
  <DxfViewer src="/samples/simple_shapes.dxf" />
</ClientOnly>

---

## 1. LINE

A simple line connecting two points.

```text
  0        <-- Entity type
LINE
  5        <-- Handle ID
A1
100        <-- Subclass marker
AcDbEntity
  8        <-- Layer name
0
100        <-- Subclass marker
AcDbLine
 10        <-- Start point X
0.0
 20        <-- Start point Y
0.0
 30        <-- Start point Z
0.0
 11        <-- End point X
10.0
 21        <-- End point Y
10.0
 31        <-- End point Z
0.0
```

## 2. CIRCLE

A circle defined by center point and radius.

```text
  0        <-- Entity type
CIRCLE
  5
A2
100
AcDbEntity
  8
0
100
AcDbCircle
 10        <-- Center point X
5.0
 20        <-- Center point Y
5.0
 30        <-- Center point Z
0.0
 40        <-- Radius
2.5
```

## 3. ARC

An arc defined by center point, radius, and start/end angles. Angles are specified in degrees **counterclockwise**.

```text
  0        <-- Entity type
ARC
  8
0
 10        <-- Center point X
0.0
 20        <-- Center point Y
0.0
 40        <-- Radius
10.0
 50        <-- Start angle (degrees)
0.0
 51        <-- End angle (degrees)
90.0
```

## 4. TEXT (Single-line Text)

Single-line text.

```text
  0        <-- Entity type
TEXT
  8
0
 10        <-- Insertion point X
0.0
 20        <-- Insertion point Y
0.0
 40        <-- Text height
2.5
  1        <-- Text content
Hello DXF
 50        <-- Rotation angle (degrees)
0.0
```

## 5. LWPOLYLINE (Lightweight Polyline)

A continuous line with multiple vertices. Introduced in R14 and later, widely used because of smaller file size.

```text
  0        <-- Entity type
LWPOLYLINE
  8
0
 90        <-- Number of vertices
2
 70        <-- Flag (0=open line, 1=closed line)
0
 10        <-- Vertex 1 X
0.0
 20        <-- Vertex 1 Y
0.0
 10        <-- Vertex 2 X
10.0
 20        <-- Vertex 2 Y
10.0
```

::: tip Notes on LWPOLYLINE
In `LWPOLYLINE`, the same group codes `10` and `20` appear repeatedly for each vertex. Parsers need to read these sequentially and store them in an array.
:::
