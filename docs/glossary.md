# Glossary

Important terms used in DXF are organized by category.

## 📂 File Structure and Basics

### [Group Code](../structure/tag-and-group-code.md)
A numeric tag that defines the "meaning" and "type" of data. All DXF data is based on this.

### [Handle](../structure/tag-and-group-code.md#2-主要なグループコードとデータ型)
A unique hexadecimal ID assigned to an object. Used for resolving references between objects.

### [Subclass Marker](../structure/tag-and-group-code.md#2-主要なグループコードとデータ型)
A tag (code 100) for strictly defining object type information. Ensures parsing accuracy.

### [ASCII DXF](../structure/tag-and-group-code.md#3-binary-dxf-バイナリ形式)
DXF written in text format. Human-readable but file size becomes larger.

### [Binary DXF](../structure/tag-and-group-code.md#3-binary-dxf-バイナリ形式)
DXF written in binary format. Smaller file size and faster loading speed.

## 📐 Geometry and Coordinate Systems

### [WCS (World Coordinate System)](../geometry/coordinate-systems.md)
The absolute coordinate system that serves as the reference for the entire drawing.

### [OCS (Object Coordinate System)](../geometry/coordinate-systems.md)
A coordinate system unique to each entity. Used to represent 2D shapes in 3D space.

### [Geometric Entity](../geometry/common-entities.md)
A general term used in CAD. Refers to shapes with form like LINE and CIRCLE. In DXF specifications, it's often simply written as "Entities," but this term is convenient when distinguishing from annotations.

### [Segment](../geometry/common-entities.md#lwpolyline軽量ポリライン)
A general term. Refers to one section between vertices that make up a polyline. Also used in DXF specifications with expressions like "polyline segments."

### [Closed / Open](../geometry/polygons-and-fills.md#1-閉じたポリゴン-closed-polygons)
**Official concept**. Used in "flags (Group Code 70)" of polylines and splines to define whether a shape is closed (start and end points match).

### [Arbitrary Axis Algorithm (AAA)](../geometry/coordinate-systems.md#3-任意軸アルゴリズム-arbitrary-axis-algorithm)
An algorithm for uniquely calculating the X and Y axes of OCS from a normal vector.

### [Extrusion Direction](../geometry/coordinate-systems.md#2-なぜ-ocs-が必要なのか)
A vector indicating which direction (plane) an entity is facing.

## 🧱 Objects and Elements

### [Entity](../geometry/common-entities.md)
**Official term** in DXF specifications. General term for graphic elements that are actually drawn (LINE, CIRCLE, etc.). In specifications, also called "Graphical Object."

### Graphical Object / Non-graphical Object
**Official classification** in DXF specifications.
- **Graphical Object**: Elements that are drawn (= entities).
- **Non-graphical Object**: Management data that is not drawn (DICTIONARY, LAYER, etc.).

### [Block](../geometry/blocks-and-inserts.md)
Definition of reusable shapes. Used to define parts (bolts, desks, etc.) that are reused multiple times in a drawing.

### [Bulge](../geometry/common-entities.md#lwpolyline軽量ポリライン)
A numeric value for expressing arcs between vertices of LWPOLYLINE. Tangent of 1/4 of the angle.

### [DICTIONARY](../structure/objects-section.md#2-dictionary辞書構造)
A container that manages the hierarchical structure of non-graphic data. A core element of the OBJECTS section.

---
Related: [Learning Roadmap](../index.md#🧭-learning-roadmap)
