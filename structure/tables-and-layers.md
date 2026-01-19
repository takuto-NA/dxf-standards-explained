# Tables and Layers

The TABLES section stores style definitions used throughout the drawing. These are "definitions," and actual graphic elements (entities) reference them in the ENTITIES section.

## Table Structure

All tables have the following structure:

```text
  0        <-- Signal for table start
TABLE
  2        <-- Table name (type)
TableName
  5        <-- Handle ID
Handle
 70        <-- Number of entries in this table
EntryCount
  0        <-- Entry 1 start
Entry1
  ...
  0        <-- Entry 2 start
Entry2
  ...
  0        <-- Table end
ENDTAB
```

## LAYER Table

**Role**: Stores layer definitions. Each entity must belong to one layer.

### LAYER Entry Structure

```text
  0        <-- Layer entry start
LAYER
  5        <-- Handle ID
Handle
  2        <-- Layer name
LayerName
 70        <-- Status flag
Flag
 62        <-- Color number
ColorNumber
  6        <-- Linetype name
LinetypeName
```

**Major Group Codes**:

| Code | Type | Description |
| :--- | :--- | :--- |
| `2` | String | Layer name |
| `70` | Integer | Flag (1=frozen, 2=frozen in new viewport, 4=locked) |
| `62` | Integer | Color number (0=ByBlock, 256=ByLayer, 1-255=RGB index) |
| `6` | String | Linetype name (`CONTINUOUS`, etc.) |

### Example: Layer Definition

```text
  0        <-- Table start
TABLE
  2
LAYER
  5
2
 70
2
  0        <-- Default layer "0"
LAYER
  5
10
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0        <-- Custom layer "MyLayer"
LAYER
  5
11
  2
MyLayer
 70
0
 62        <-- Red color
1
  6        <-- Dashed line
DASHED
  0
ENDTAB
```

**Implementation Notes**: 
- Layer name `"0"` always exists and functions as the default layer.
- Color number `256` means "ByLayer" (use layer's color).
- If bit `1` of flag `70` is set, that layer is frozen (hidden).

## LTYPE Table (Linetype)

**Role**: Stores linetype definitions (solid, dashed, center line, etc.).

### LTYPE Entry Structure

```text
  0        <-- Linetype entry start
LTYPE
  5
Handle
  2        <-- Linetype name
LinetypeName
 70
Flag
  3        <-- Description text
Description
 72
AlignmentCode
 73        <-- Number of pattern elements
DashElementCount
 40        <-- Total pattern length
TotalPatternLength
 49        <-- Element 1 length
DashLength1
 49        <-- Element 2 length
DashLength2
  ...
```

**Major Group Codes**:

| Code | Type | Description |
| :--- | :--- | :--- |
| `2` | String | Linetype name |
| `3` | String | Description text |
| `40` | Floating point | Total pattern length |
| `49` | Floating point | Dash/space length (positive=line, negative=space, 0=dot) |
| `73` | Integer | Number of dash elements |

### Example: Dashed Line Definition

```text
  0        <-- Linetype definition start
LTYPE
  5
5
  2
DASHED
 70
0
  3
__ __ __
 72
65
 73
2
 40
19.05
 49        <-- "Line" of 12.7 units
12.7
 49        <-- "Space" of 6.35 units
-6.35
  0
ENDTAB
```

This example defines a dashed line pattern that repeats 12.7 units of line and 6.35 units of space.

**Implementation Notes**: 
- `CONTINUOUS` always exists and represents a solid line.
- Patterns repeat cyclically.

## STYLE Table (Text Style)

**Role**: Stores text style definitions (font, height, width factor, etc.).

### STYLE Entry Structure

```text
  0        <-- Text style entry start
STYLE
  5
Handle
  2        <-- Style name
StyleName
 70
Flag
 40        <-- Fixed text height
FixedHeight (0=variable)
 41        <-- Width multiplier
WidthFactor
 50        <-- Oblique angle
ObliqueAngle
 71
TextGenerationFlag
 42
LastUsedHeight
  3        <-- Font file name
FontFileName
  4        <-- Big font name
BigFontFileName
```

**Major Group Codes**:

| Code | Type | Description |
| :--- | :--- | :--- |
| `2` | String | Style name |
| `40` | Floating point | Fixed height (0 if variable) |
| `41` | Floating point | Width factor (1.0=standard) |
| `50` | Floating point | Oblique angle (degrees) |
| `3` | String | Font file name (e.g., `txt.shx`) |

### Example: Text Style Definition

```text
  0        <-- Text style definition start
STYLE
  5
3
  2
STANDARD
 70
0
 40
0.0
 41
1.0
 50
0.0
 71
0
 42
2.5
  3        <-- Base font
txt
  4
  0
ENDTAB
```

**Implementation Notes**: 
- Style name `"STANDARD"` always exists.
- Font file names specify SHX files (AutoCAD-specific) or TTF file names.

## Other Tables

### VIEW Table

Stores definitions of named views (display range and viewpoint).

### UCS Table

Stores definitions of user coordinate systems (User Coordinate System).

### VPORT Table

Stores definitions of viewports (screen display areas). Has different settings for model space and layout space.

## Entity References

Entities reference these table entries by **name**:

```text
  0        <-- Entity (LINE) start
LINE
  8        <-- Layer name reference
MyLayer        ← References "MyLayer" in LAYER table
  6        <-- Linetype name reference
DASHED         ← References "DASHED" in LTYPE table
 10
0.0
 20
0.0
 11
10.0
 21
10.0
```

**Implementation Notes**: 
- If referenced layers or linetypes don't exist, many CAD software use default values (layer `"0"`, linetype `"CONTINUOUS"`).
- Parsers need to read tables before reading entities and build dictionaries for name resolution.
