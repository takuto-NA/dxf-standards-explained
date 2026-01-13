# Common Pitfalls

This summarizes problems frequently encountered by implementers in DXF implementation and their solutions.

## 1. Character Encoding Issues

### Problem

Character encoding of DXF files differs by version:

- **Before R12**: ANSI/code page dependent (varies by environment)
- **AC1015 (AutoCAD 2000)**: ANSI (Windows-1252, etc.)
- **AC1021 (AutoCAD 2007) and later**: UTF-8 is standard

### Symptoms

- Japanese and special characters become garbled
- "Invalid character" errors occur when opening files

### Solution

```python
def detect_encoding(file_path):
    """Detect encoding of DXF file"""
    with open(file_path, 'rb') as f:
        header = f.read(100)
        
        # Check UTF-8 BOM
        if header.startswith(b'\xEF\xBB\xBF'):
            return 'utf-8-sig'
        
        # Determine from version information
        version = extract_version(header)
        if version >= 'AC1021':
            return 'utf-8'
        else:
            # Guess environment-dependent code page
            return 'windows-1252'  # or system default
```

**Best Practices**: 
- Save in UTF-8 whenever possible
- When reading, try UTF-8 first, then fallback if it fails

## 2. Floating Point Precision Issues

### Problem

Since floating point values are saved as text in DXF files, precision problems can occur when reading.

### Symptoms

- Coordinate values shift slightly (e.g., `10.0` becomes `9.999999999`)
- Errors accumulate in geometric calculations (distance, angle, etc.)

### Solution

```python
import decimal

def parse_float(value_str):
    """High-precision floating point reading"""
    # Also supports scientific notation
    try:
        return float(value_str)
    except ValueError:
        # Use Decimal type to maintain precision (if needed)
        return float(decimal.Decimal(value_str))

# Tolerance for comparisons
EPSILON = 1e-9

def float_equal(a, b):
    return abs(a - b) < EPSILON
```

**Best Practices**: 
- Use tolerance (epsilon) for coordinate value comparisons
- Use high-precision libraries for geometric calculations as needed

## 3. Handling Incomplete DXF Files

### Problem

Many CAD software read incomplete DXF files (missing HEADER or TABLES sections) by supplementing default values.

### Symptoms

- Parser outputs "required section not found" errors
- Layers and linetypes are not correctly resolved

### Solution

```python
class DxfParser:
    def __init__(self):
        # Set default values in advance
        self.default_layer = Layer(name="0", color=7, ltype="CONTINUOUS")
        self.default_ltype = LineType(name="CONTINUOUS", pattern=[])
        self.default_style = TextStyle(name="STANDARD")
    
    def get_layer(self, name):
        """Get layer, return default if doesn't exist"""
        if name in self.layer_dict:
            return self.layer_dict[name]
        else:
            logger.warning(f"Layer '{name}' not found, using default")
            return self.default_layer
```

**Best Practices**: 
- Allow processing to continue even if non-required sections (HEADER, TABLES) are missing
- Log warnings and use default values

## 4. OCS (Object Coordinate System) Conversion Mistakes

### Problem

Entities like `CIRCLE`, `ARC`, `LWPOLYLINE` are defined in OCS. If a normal vector is not specified, the default is `(0, 0, 1)`, but forgetting this causes 2D drawings to not display correctly.

### Symptoms

- Circles placed in 3D space don't display correctly in 2D view
- Polyline vertices are not at expected positions

### Solution

```python
def get_extrusion_direction(entity):
    """Get entity's extrusion direction (normal vector)"""
    if hasattr(entity, 'extrusion_x') and entity.extrusion_x is not None:
        return (
            entity.extrusion_x,
            entity.extrusion_y,
            entity.extrusion_z
        )
    else:
        # Default: world Z axis
        return (0.0, 0.0, 1.0)

def ocs_to_wcs(point_ocs, extrusion):
    """Convert OCS coordinates to WCS coordinates (using arbitrary axis algorithm)"""
    # Implementation of arbitrary axis algorithm
    # (see coordinate-systems.md for details)
    ...
```

**Best Practices**: 
- Explicitly convert all OCS-based entities
- Include entities with various normal vectors in test data

## 5. Circular References in Block References

### Problem

When block definitions contain circular references that reference themselves or other blocks, infinite loops can occur.

### Symptoms

- Parser crashes with stack overflow
- Memory usage abnormally increases

### Solution

```python
class BlockResolver:
    def __init__(self, max_depth=100):
        self.max_depth = max_depth
        self.current_depth = 0
    
    def resolve_block(self, block_name, insert_entity):
        if self.current_depth >= self.max_depth:
            raise ValueError(f"Block reference depth exceeded: {block_name}")
        
        self.current_depth += 1
        try:
            block_def = self.block_dict[block_name]
            # Resolve entities within block
            entities = self.resolve_block_entities(block_def, insert_entity)
            return entities
        finally:
            self.current_depth -= 1
```

**Best Practices**: 
- Set limits on block reference depth (e.g., 100 levels)
- Detect circular references and issue warnings

## 6. Unit System Confusion

### Problem

Since DXF files themselves don't have unit information, `$INSUNITS` header variable and actual coordinate value units may not match.

### Symptoms

- Drawing scale is incorrect (inches and meters mixed)
- Dimension values differ from expectations

### Solution

```python
def get_units(self):
    """Get drawing unit system"""
    insunits = self.header_vars.get('$INSUNITS', 0)
    unit_map = {
        1: 'inches',
        2: 'feet',
        4: 'millimeters',
        5: 'centimeters',
        6: 'meters',
        # ...
    }
    return unit_map.get(insunits, 'unitless')

def convert_units(value, from_unit, to_unit):
    """Unit conversion (if needed)"""
    conversion_factors = {
        ('inches', 'millimeters'): 25.4,
        ('feet', 'meters'): 0.3048,
        # ...
    }
    factor = conversion_factors.get((from_unit, to_unit), 1.0)
    return value * factor
```

**Best Practices**: 
- Explicitly manage unit information as metadata
- Provide UI for users to confirm units

## 7. Handle Handling

### Problem

From AutoCAD 2000 onward, each object is assigned a unique handle (hexadecimal string). Handles are used in reference relationships, but they don't exist in all DXF files.

### Symptoms

- Handle-based references cannot be resolved
- Handles are missing in old version DXF files

### Solution

```python
def parse_handle(value_str):
    """Parse handle (hexadecimal string)"""
    if not value_str:
        return None
    try:
        return int(value_str, 16)  # Interpret as hexadecimal
    except ValueError:
        logger.warning(f"Invalid handle: {value_str}")
        return None

def resolve_handle_reference(handle):
    """Reference object by handle"""
    if handle is None:
        return None
    return self.handle_dict.get(handle)
```

**Best Practices**: 
- Fallback to name-based references even if handles don't exist
- Check handle uniqueness

## 8. Performance Issues

### Problem

When reading large DXF files (tens of thousands of entities), memory usage and processing time can become problems.

### Solution

- **Streaming Parser**: Process entities one by one
- **Lazy Loading**: Load data only when needed
- **Caching**: Cache frequently referenced data (default layers, etc.)

For details, see [Parser Design](./parsing-strategy.md).

## Summary

By recognizing these problems in advance and implementing appropriate solutions, you can build robust DXF parsers. Especially, **error handling** and **providing default values** are essential for practical parsers.
