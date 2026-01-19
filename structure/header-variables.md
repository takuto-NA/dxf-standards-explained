# Important Header Variables

The HEADER section stores variables that define settings and properties for the entire drawing. All variable names start with `$` and are specified with group code `9`.

## How to Read Variables

Header variables are written in the following format:

```text
  9        <-- Signal indicating "next is variable name"
$VariableName
 Group Code <-- Code according to the variable's "type"
Value          <-- Specific setting value
```

Example:
```text
  9        <-- Variable name start
$ACADVER
  1        <-- String type value
AC1015
```

## Required/Recommended Variables

### $ACADVER (AutoCAD Version)

**Group Code**: `1` (string)  
**Description**: Represents the AutoCAD version in which the DXF file was created.

| Value | Version |
| :--- | :--- |
| `AC1009` | AutoCAD R11/R12 |
| `AC1012` | AutoCAD R13 |
| `AC1014` | AutoCAD R14 |
| `AC1015` | AutoCAD 2000/2000i/2002 |
| `AC1018` | AutoCAD 2004/2005/2006 |
| `AC1021` | AutoCAD 2007/2008/2009 |
| `AC1024` | AutoCAD 2010/2011/2012 |
| `AC1027` | AutoCAD 2013/2014/2015/2016/2017 |
| `AC1032` | AutoCAD 2018 and later |

**Implementation Notes**: Available group codes and entity types differ by version. Parsers need to branch processing based on this value.

### $INSUNITS (Insertion Units)

**Group Code**: `70` (integer)  
**Description**: Specifies the unit system of the drawing.

| Value | Unit |
| :--- | :--- |
| `0` | Unitless |
| `1` | Inches |
| `2` | Feet |
| `3` | Miles |
| `4` | Millimeters |
| `5` | Centimeters |
| `6` | Meters |
| `7` | Kilometers |
| `8` | Microinches |
| `9` | Mils |
| `10` | Yards |
| `11` | Angstroms |
| `12` | Nanometers |
| `13` | Micrometers |
| `14` | Decimeters |
| `15` | Decameters |
| `16` | Hectometers |
| `17` | Gigameters |
| `18` | Astronomical Units |
| `19` | Light Years |
| `20` | Parsecs |

**Implementation Notes**: This value is mainly used as metadata. Actual coordinate values don't have unit information, so applications need to interpret them appropriately.

### $EXTMIN / $EXTMAX (Extents)

**Group Code**: `10, 20, 30` (floating point, X, Y, Z)  
**Description**: Defines the minimum/maximum bounding box that contains all entities in the drawing.

```text
  9        <-- Variable name
$EXTMIN
 10        <-- Minimum X
-10.0
 20        <-- Minimum Y
-5.0
 30        <-- Minimum Z
0.0
  9        <-- Variable name
$EXTMAX
 10        <-- Maximum X
100.0
 20        <-- Maximum Y
50.0
 30        <-- Maximum Z
0.0
```

**Implementation Notes**: These values are used to determine the display range of the drawing. When adding or removing entities, these values need to be recalculated.

### $HANDSEED (Handle Seed)

**Group Code**: `5` (string, handle)  
**Description**: Seed value for the next handle (unique identifier for objects) to be assigned.

Introduced in AutoCAD 2000 and later. Each object is assigned a unique handle (hexadecimal string, e.g., `"FF"`).

**Implementation Notes**: Handles are used for references between objects (e.g., block references). When creating new objects, increment this value and use it.

## Other Important Variables

### $LUNITS (Linear Units)

**Group Code**: `70` (integer)  
**Description**: Specifies the display format of linear units.

- `1`: Scientific notation
- `2`: Decimal
- `3`: Architectural (feet-inches)
- `4`: Fractional
- `5`: Architectural (fractional)

### $AUNITS (Angular Units)

**Group Code**: `70` (integer)  
**Description**: Specifies angular units.

- `0`: Decimal degrees
- `1`: Degrees/minutes/seconds
- `2`: Gradians
- `3`: Radians
- `4`: Surveyor's units

### $CLAYER (Current Layer)

**Group Code**: `8` (string)  
**Description**: Specifies the current layer name.

If a new entity doesn't explicitly specify a layer, this layer is used.

### $TEXTSTYLE (Text Style)

**Group Code**: `7` (string)  
**Description**: Specifies the current text style name.

## Implementation Best Practices

1. **Version Check**: Read `$ACADVER` first and enable corresponding features.
2. **Provide Default Values**: Even if variables don't exist, provide reasonable default values (e.g., `$INSUNITS = 6` (meters)).
3. **Unit Consistency**: Ensure that `$INSUNITS` and the units of actual coordinate values match (DXF files themselves don't have unit information, so it needs to be explicitly stated in documentation or metadata).
