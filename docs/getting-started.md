# First Steps: Understanding DXF

The fastest way to understand DXF (Drawing Exchange Format) is to learn about its background and try writing minimal code by hand in a text editor.

## 💡 What is DXF?

DXF is a format announced by Autodesk in 1982 along with AutoCAD for **"exchanging data between different CAD software"**. It is not an international standard, but it is a "de facto standard" adopted by CAD software worldwide. For details, see [Relationship with Standards](../comparison/standardization-and-iso.md).

### Why not SVG or DWG?
There are many image and drawing formats today, but why does DXF continue to be used?

| Comparison | Why Choose DXF |
| :--- | :--- |
| **vs SVG** | SVG is for design and lacks CAD-specific concepts like coordinate precision, "layers," and "blocks," so DXF is essential for manufacturing (CNC machining, etc.). |
| **vs DWG** | DWG is AutoCAD's standard format, but it's a proprietary binary format. DXF is an open text (ASCII) format, so anyone can read and write it programmatically. |

## DXF Grammar: "Group Code" and "Value"

The structure of DXF is very simple. All data consists of a pair of two lines: **"group code (number)"** and **"value"**.

```text
  0        <-- Group code (ID indicating what type)
SECTION    <-- Value (specific content)
```

- **Group code**: The role is determined by the number—0 means "entity type," 8 means "layer name," 10 means "X coordinate," etc.
- **Value**: Contains specific content (names, numbers, etc.) corresponding to the group code.

::: tip You don't need to memorize group codes!
There are thousands of group codes, but you don't need to remember them all. Just refer to the [reference](../structure/tag-and-group-code.md) when needed.
:::

## Minimal DXF Code

Save the following code as `minimal.dxf`. This is a minimal DXF that draws a line from coordinates (0,0) to (10,10).

```text
  0
SECTION
  2
ENTITIES
  0
LINE
  8
0
 10
0.0
 20
0.0
 30
0.0
 11
10.0
 21
10.0
 31
0.0
  0
ENDSEC
  0
EOF
```

## Code Explanation (Line by Line)

Breaking down this code as pairs of "group code" and "value":

1. **`0` / `SECTION`**: Declares the start of a "section."
2. **`2` / `ENTITIES`**: Indicates that "entity data (ENTITIES)" starts here.
3. **`0` / `LINE`**: Declares that a "line (LINE)" shape will be drawn from here.
4. **`8` / `0`**: Indicates this line belongs to layer name "0."
5. **`10, 20, 30`**: X, Y, Z coordinates of the start point.
6. **`11, 21, 31`**: X, Y, Z coordinates of the end point.
7. **`0` / `ENDSEC`**: End of section.
8. **`0` / `EOF`**: End of file.

## Common Questions

### Why use numbers (group codes)?
Computers in the 1980s were weak, so judging by a number like "8" was much faster than parsing long strings like "LayerName". This mechanism has continued unchanged for over 40 years.

### Can I write comments in DXF?
Yes, using group code **`999`**, the next line is treated as a comment (ignored by many CAD software).

```text
999
This is a note to myself
```

---

## Next Steps

- [Tag Structure and Group Code Basics](../structure/tag-and-group-code.md)
- [Section Overview](../structure/sections-overview.md)
- [DXF Samples](../samples/README.md)
