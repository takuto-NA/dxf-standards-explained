# ezdxf Practical Guide

A practical guide for importing (reading) and exporting (writing) DXF files using **ezdxf**, the most recommended library for handling DXF files in Python.

This guide comprehensively explains information useful for implementation, from basic operations when using ezdxf to common mistakes and risk mitigation.

::: tip For Shapely Users
If you're working with **Shapely** geometries (Polygon, MultiPolygon, LineString, etc.) and need to export them to DXF, see the dedicated guide: **[Working with Shapely Geometries](./ezdxf-shapely-integration.md)** - Complete guide for converting Shapely objects to DXF format.
:::

::: tip Related Documentation
- [Major Libraries](./libraries.md) - Comprehensive introduction including libraries in other languages
- [Common Pitfalls and Solutions](./common-pitfalls.md) - General DXF implementation considerations
- [Parser Design](./parsing-strategy.md) - Parser implementation architecture
- [Coordinate Systems (WCS/OCS/AAA)](../geometry/coordinate-systems.md) - Details on coordinate transformations
- **[Working with Shapely Geometries](./ezdxf-shapely-integration.md)** - Shapely integration guide
:::

---

## 1. Introduction

### What is ezdxf

**ezdxf** is the most popular and feature-rich library for reading and writing DXF files in Python.

**Main Features**:
- Wide support from DXF R12 to the latest version (R2018)
- Supports both reading and writing
- Strong support for mathematical processing such as OCS/WCS transformations
- MIT License (commercial use allowed)
- Actively maintained
- Rich documentation and sample code

**Official Site**: https://ezdxf.mozman.at/

**GitHub**: https://github.com/mozman/ezdxf

### Target Audience

This guide is designed for:
- **General Python developers** working with DXF files
- **CAD data processing implementers** needing comprehensive reference
- **Users migrating from other libraries** (Shapely, GeoPandas, etc.) - See [Working with Shapely Geometries](./ezdxf-shapely-integration.md) for Shapely-specific guidance
- **Anyone implementing DXF import/export** functionality

### Installation

```bash
# Basic installation
pip install ezdxf

# With additional features (image export, etc.)
pip install ezdxf[draw]
```

**Requirements**:
- Python 3.10 or higher
- Dependencies: `typing_extensions`, `pyparsing`, `numpy`, `fontTools`

### Supported DXF Versions

| DXF Version | AutoCAD Version | Read | Write |
| :--- | :--- | :--- | :--- |
| R12 (AC1009) | AutoCAD R12 | ✅ | ✅ |
| R2000 (AC1015) | AutoCAD 2000 | ✅ | ✅ |
| R2004 (AC1018) | AutoCAD 2004 | ✅ | ✅ |
| R2007 (AC1021) | AutoCAD 2007 | ✅ | ✅ |
| R2010 (AC1024) | AutoCAD 2010 | ✅ | ✅ |
| R2013 (AC1027) | AutoCAD 2013 | ✅ | ✅ |
| R2018 (AC1032) | AutoCAD 2018 | ✅ | ✅ |
| R13/R14 | AutoCAD R13/R14 | ✅ (read only, upgraded to R2000) | ❌ |
| Pre-R12 | Older versions | ✅ (read only, upgraded to R12) | ❌ |

### Binary DXF vs ASCII DXF

ezdxf supports both ASCII and binary DXF files.

- **ASCII DXF**: Human-readable format. Easy to debug.
- **Binary DXF**: Smaller file size, faster read/write.

By default, files are saved in ASCII format. To save in binary format, use `doc.saveas_binary()` instead of `doc.saveas()`.

---

## 2. Basic Import (Reading)

### Reading Files

The most basic way to read files is using `ezdxf.readfile()`.

```python
import ezdxf

# Basic reading
try:
    doc = ezdxf.readfile("drawing.dxf")
    print(f"DXF Version: {doc.dxfversion}")
except IOError as e:
    print(f"File not found: {e}")
except ezdxf.DXFStructureError as e:
    print(f"DXF file structure error: {e}")
```

### Error Handling

ezdxf can raise various errors. Implementing proper error handling is important.

```python
import ezdxf
from pathlib import Path

def safe_read_dxf(file_path):
    """Safely read a DXF file"""
    file_path = Path(file_path)
    
    # Check if file path exists
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Check if it's a readable file
    if not file_path.is_file():
        raise ValueError(f"Not a file: {file_path}")
    
    try:
        # Read DXF file
        doc = ezdxf.readfile(str(file_path))
        return doc
    except IOError as e:
        raise IOError(f"Failed to read file: {e}")
    except ezdxf.DXFStructureError as e:
        raise ValueError(f"Invalid DXF file structure: {e}")
    except ezdxf.DXFValueError as e:
        raise ValueError(f"Invalid DXF file value: {e}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error occurred: {e}")

# Usage example
try:
    doc = safe_read_dxf("drawing.dxf")
    print("Read successfully")
except Exception as e:
    print(f"Error: {e}")
```

### Getting Entities

How to get entities from model space.

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()  # Get model space

# Iterate through all entities
for entity in msp:
    print(f"Entity type: {entity.dxftype()}")
    
    # For LINE entities
    if entity.dxftype() == "LINE":
        start = entity.dxf.start
        end = entity.dxf.end
        print(f"  Start: ({start.x}, {start.y}, {start.z})")
        print(f"  End: ({end.x}, {end.y}, {end.z})")
    
    # For CIRCLE entities
    elif entity.dxftype() == "CIRCLE":
        center = entity.dxf.center
        radius = entity.dxf.radius
        print(f"  Center: ({center.x}, {center.y}, {center.z})")
        print(f"  Radius: {radius}")
```

### Model Space and Paper Space

DXF files have model space (actual drawing) and paper space (layouts).

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")

# Get model space
msp = doc.modelspace()

# Get paper space (layouts)
layouts = doc.layouts
for layout_name in layouts.names():
    layout = layouts.get(layout_name)
    print(f"Layout name: {layout_name}")
    
    # Get entities in layout
    for entity in layout:
        print(f"  {entity.dxftype()}")
```

### Getting Layouts

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")

# Get all layouts
layouts = doc.layouts

# List of layout names
print("Available layouts:")
for layout_name in layouts.names():
    print(f"  - {layout_name}")

# Get a specific layout
if "Layout1" in layouts:
    layout = layouts.get("Layout1")
    print(f"Layout '{layout_name}' entity count: {len(list(layout))}")
```

### Processing Large Files

When processing large DXF files, memory efficiency should be considered.

**Important Note**: `ezdxf.readfile()` loads the entire DOM (Document Object Model) into memory. For very large files (several GB), this may cause memory errors. If you encounter memory issues, see Section 5.1 for the `iterdxf` addon, which provides memory-efficient streaming processing.

```python
import ezdxf

def process_large_dxf(file_path):
    """Efficiently process large DXF files
    
    Note: This method loads the entire file into memory.
    For truly huge files, use iterdxf addon (see Section 5.1).
    """
    doc = ezdxf.readfile(file_path)  # Entire DOM loaded into memory here
    msp = doc.modelspace()
    
    # Process memory-efficiently using iterator
    # Note: Even though we use an iterator here, the file is already loaded into memory
    line_count = 0
    circle_count = 0
    
    for entity in msp:
        if entity.dxftype() == "LINE":
            line_count += 1
            # Execute necessary processing here
        elif entity.dxftype() == "CIRCLE":
            circle_count += 1
    
    print(f"LINE: {line_count}, CIRCLE: {circle_count}")
```

**For truly huge files**: See Section 5.1 "Memory Insufficiency" for the `iterdxf` addon, which provides streaming processing without loading the entire file into memory.

---

## 3. Basic Export (Writing)

### Creating New DXF Files

Use `ezdxf.new()` to create a new DXF file.

```python
import ezdxf

# Create new with specified DXF version
doc = ezdxf.new('R2010')  # Or 'R12', 'R2000', 'R2004', 'R2007', 'R2013', 'R2018'

# Get model space
msp = doc.modelspace()

# Add entities
msp.add_line((0, 0), (10, 10))
msp.add_circle((5, 5), radius=2.5)

# Save to file
doc.saveas("output.dxf")
```

### DXF Version Selection

DXF version selection significantly affects compatibility.

```python
import ezdxf

# When prioritizing compatibility (can open in older CAD software)
doc_r12 = ezdxf.new('R12')  # Highest compatibility

# When wanting to use latest features
doc_r2018 = ezdxf.new('R2018')  # Latest features available

# Balanced choice (recommended)
doc_r2010 = ezdxf.new('R2010')  # Supported by many CAD software
```

**Recommendation**: Unless there's a specific reason, we recommend selecting `R2010`. It's supported by many CAD software and has sufficient features.

#### 取引先とのDXFファイル交換におけるベストプラクティス

取引先とDXFファイルをやり取りする際は、互換性を最優先に考慮する必要があります。以下の表は、取引先の状況に応じた推奨DXFバージョンをまとめたものです。

| 取引先の状況 | 推奨DXFバージョン | 理由・注意点 |
| :--- | :--- | :--- |
| **取引先が不明・複数の取引先がある** | **R2010** | 多くのCADソフトウェアでサポートされ、UTF-8が標準で日本語対応も問題なし。バランスが良い選択 |
| **古いCADソフトウェアを使用している可能性が高い** | **R12** | 最高の互換性。AutoCAD R12以降のほぼすべてのCADソフトで開ける。ただし、MTEXTや一部の新機能は使用不可 |
| **最新のCADソフトウェアを使用している** | **R2010 または R2018** | R2010で十分だが、最新機能が必要な場合はR2018も選択可能 |
| **CNC機械やレーザー加工機に直接送る** | **R2010** | 多くの機械でサポートされている。R12も選択可能だが、R2010の方が一般的 |
| **AutoCAD以外のCADソフトウェア（FreeCAD、LibreCAD等）** | **R2000 または R2010** | オープンソースCADソフトはR2000以降を推奨。R2010が最も安全 |
| **互換性を最優先（確実に開けることを重視）** | **R12** | 最も古い標準的なバージョンで、ほぼすべてのCADソフトで開ける |
| **日本語テキストを含む** | **R2010以降** | R2007以降でUTF-8が標準。R12/R2000は文字エンコーディングに注意が必要 |
| **3Dデータを含む** | **R2000以降** | R12は3Dサポートが限定的。R2000以降を推奨 |
| **SPLINE（スプライン曲線）を使用** | **R2000以降** | R12ではSPLINEが使用不可。R2000以降を推奨 |

**一般的な推奨事項**:
- **不明な場合は R2010 を選択**: 多くのCADソフトウェアでサポートされ、UTF-8標準で日本語対応も問題なし
- **確実性を最優先する場合は R12**: 古いCADソフトでも確実に開けるが、一部機能制限あり
- **取引先に確認可能な場合は確認**: 取引先が使用しているCADソフトウェアとバージョンを確認し、それに合わせるのが最も安全

**注意点**:
- R12はMTEXT（複数行テキスト）が使用不可。TEXTのみ使用可能
- R12/R2000は文字エンコーディングに注意が必要（R2007以降はUTF-8標準）
- 最新機能が必要な場合のみR2018を選択（互換性がやや低下する可能性あり）

### Saving Files

```python
import ezdxf
from pathlib import Path

doc = ezdxf.new('R2010')
msp = doc.modelspace()
msp.add_line((0, 0), (10, 10))

# Save in ASCII format (default)
doc.saveas("output.dxf")

# Save in binary format (smaller file size)
doc.saveas_binary("output_binary.dxf")

# Using path objects
output_path = Path("output") / "drawing.dxf"
output_path.parent.mkdir(parents=True, exist_ok=True)
doc.saveas(str(output_path))
```

### Modifying and Saving Existing Files

How to read an existing DXF file, modify it, and save it.

```python
import ezdxf
from pathlib import Path
import shutil

def modify_and_save(input_path, output_path, backup=True):
    """Modify and save existing file (with backup)"""
    input_path = Path(input_path)
    output_path = Path(output_path)
    
    # Create backup (recommended)
    if backup and output_path.exists():
        backup_path = output_path.with_suffix('.dxf.bak')
        shutil.copy2(output_path, backup_path)
        print(f"Backup created: {backup_path}")
    
    # Read file
    doc = ezdxf.readfile(str(input_path))
    msp = doc.modelspace()
    
    # Make changes (example: delete all LINE entities)
    entities_to_delete = []
    for entity in msp:
        if entity.dxftype() == "LINE":
            entities_to_delete.append(entity)
    
    for entity in entities_to_delete:
        msp.delete_entity(entity)
    
    # Add new entities
    msp.add_circle((5, 5), radius=3.0)
    
    # Save
    doc.saveas(str(output_path))
    print(f"Save complete: {output_path}")

# Usage example
modify_and_save("input.dxf", "output.dxf", backup=True)
```

---

## 4. Entity Operations

### Creating Major Entities

ezdxf can create various entity types.

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# LINE (line segment)
msp.add_line((0, 0), (10, 10))

# CIRCLE (circle)
msp.add_circle((5, 5), radius=2.5)

# ARC (arc)
msp.add_arc((5, 5), radius=3.0, start_angle=0, end_angle=90)

# LWPOLYLINE (lightweight polyline)
points = [(0, 0), (10, 0), (10, 10), (0, 10)]
msp.add_lwpolyline(points)

# TEXT (text)
msp.add_text("Hello, DXF!", dxfattribs={'height': 2.5}).set_placement((0, 0))

# MTEXT (multiline text)
msp.add_mtext("Multi-line\nText", dxfattribs={'height': 2.5}).set_location((0, 5))

doc.saveas("entities.dxf")
```

### Setting Entity Attributes

How to set entity attributes (layer, color, linetype, etc.).

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Create layer
doc.layers.new("MyLayer", dxfattribs={'color': 1})  # 1=red

# Create linetype
doc.linetypes.new("DASHED", dxfattribs={
    'description': 'Dashed line',
    'length': 1.0,
    'pattern': [0.5, -0.5]  # 0.5 units line, 0.5 units space
})

# Set attributes on entity
line = msp.add_line((0, 0), (10, 10), dxfattribs={
    'layer': 'MyLayer',      # Layer name
    'color': 2,              # Color (2=yellow)
    'linetype': 'DASHED',    # Linetype
    'lineweight': 25         # Line thickness (0.25mm)
})

# Attributes can be changed later
line.dxf.layer = "0"  # Change to default layer
line.dxf.color = 7    # Change to white/black

doc.saveas("attributed.dxf")
```

### Searching and Filtering Entities

How to search for entities matching specific conditions.

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# Search for specific entity types
lines = [e for e in msp if e.dxftype() == "LINE"]
print(f"LINE entity count: {len(lines)}")

# Search for entities on specific layer
layer_entities = [e for e in msp if e.dxf.layer == "MyLayer"]
print(f"Layer 'MyLayer' entity count: {len(layer_entities)}")

# Filter with multiple conditions
filtered = [
    e for e in msp 
    if e.dxftype() == "LINE" and e.dxf.layer == "0" and e.dxf.color == 1
]
print(f"Matching entity count: {len(filtered)}")

# Using ezdxf query functionality (more efficient)
from ezdxf import query

# Get only LINE entities
lines = query(msp).filter(lambda e: e.dxftype() == "LINE")

# Get entities on specific layer
layer_entities = query(msp).filter(lambda e: e.dxf.layer == "MyLayer")
```

### Deleting and Modifying Entities

```python
import ezdxf

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# Collect entities to delete
entities_to_delete = []
for entity in msp:
    if entity.dxftype() == "LINE":
        entities_to_delete.append(entity)

# Delete entities
for entity in entities_to_delete:
    msp.delete_entity(entity)

# Modify entity attributes
for entity in msp:
    if entity.dxftype() == "CIRCLE":
        # Change radius
        entity.dxf.radius = entity.dxf.radius * 1.5
        # Change layer
        entity.dxf.layer = "ModifiedLayer"

doc.saveas("modified.dxf")
```

---

## 5. Common Mistakes and Risk Mitigation (Important)

This section explains common mistakes when using ezdxf and how to avoid them in detail.

### 5.1 Mistakes When Reading

#### File Path Issues

**Bad Example**:
```python
# ❌ Bad example: No path existence check
doc = ezdxf.readfile("drawing.dxf")  # Error if file doesn't exist
```

**Correct Implementation**:
```python
# ✅ Good example: Path existence check
from pathlib import Path

def safe_read_dxf(file_path):
    file_path = Path(file_path)
    
    # Convert to absolute path (avoid relative path issues)
    if not file_path.is_absolute():
        file_path = file_path.resolve()
    
    # Existence check
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    if not file_path.is_file():
        raise ValueError(f"Not a file: {file_path}")
    
    return ezdxf.readfile(str(file_path))
```

#### Insufficient Error Handling

**Bad Example**:
```python
# ❌ Bad example: No error handling
doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()
```

**Correct Implementation**:
```python
# ✅ Good example: Proper error handling
import ezdxf
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def robust_read_dxf(file_path):
    """Robust DXF reading"""
    try:
        doc = ezdxf.readfile(file_path)
        logger.info(f"File read successfully: {file_path}")
        return doc
    except IOError as e:
        logger.error(f"Failed to read file: {e}")
        raise
    except ezdxf.DXFStructureError as e:
        logger.error(f"DXF file structure error: {e}")
        # Can attempt recovery for structure errors
        try:
            doc = ezdxf.recover.readfile(file_path)
            logger.warning("Read in recovery mode")
            return doc
        except Exception:
            raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
```

#### File Locking

**Problem**: Reading may fail when other processes (CAD software, etc.) have the file open.

**Solution**:
```python
import ezdxf
import time
from pathlib import Path

def read_with_retry(file_path, max_retries=3, retry_delay=1.0):
    """Read with retry functionality"""
    file_path = Path(file_path)
    
    for attempt in range(max_retries):
        try:
            # Check if file is locked
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Attempt to read
            doc = ezdxf.readfile(str(file_path))
            return doc
        except (IOError, PermissionError) as e:
            if attempt < max_retries - 1:
                print(f"Read failed (attempt {attempt + 1}/{max_retries}): {e}")
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                raise IOError(f"Failed to read file ({max_retries} attempts): {e}")
```

#### Handling Corrupted Files

**Problem**: You may need to read incomplete or corrupted DXF files.

**Solution**:
```python
import ezdxf

def read_dxf_with_recovery(file_path):
    """Read in recovery mode"""
    try:
        # Attempt normal read
        doc = ezdxf.readfile(file_path)
        return doc
    except ezdxf.DXFStructureError:
        # If structure error, read in recovery mode
        try:
            doc = ezdxf.recover.readfile(file_path)
            print("Warning: Read in recovery mode. Some data may be missing.")
            return doc
        except Exception as e:
            raise ValueError(f"Failed to read file (recovery also failed): {e}")
```

#### Memory Insufficiency

**Problem**: Memory errors may occur when reading very large DXF files (several GB).

**Solution**:
```python
import ezdxf
from ezdxf.addons.iterdxf import opendxf

def process_huge_dxf(file_path):
    """Stream process huge DXF files"""
    # Use iterdxf addon (memory efficient)
    with opendxf(file_path) as doc:
        for entity in doc.modelspace():
            # Process entities one by one
            if entity.dxftype() == "LINE":
                # Execute necessary processing
                pass
```

### 5.2 Mistakes When Writing

#### Overwrite Risk

**Bad Example**:
```python
# ❌ Bad example: Overwrite without backup
doc.saveas("important.dxf")  # Existing file is overwritten
```

**Correct Implementation**:
```python
# ✅ Good example: Save with backup
import ezdxf
from pathlib import Path
import shutil
from datetime import datetime

def safe_save(doc, file_path, create_backup=True):
    """Safely save file (with backup)"""
    file_path = Path(file_path)
    
    # Backup existing file
    if create_backup and file_path.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = file_path.with_suffix(f'.{timestamp}.bak')
        shutil.copy2(file_path, backup_path)
        print(f"Backup created: {backup_path}")
    
    # Save to temp file then rename (atomic operation)
    temp_path = file_path.with_suffix('.tmp')
    try:
        doc.saveas(str(temp_path))
        # Rename on success
        temp_path.replace(file_path)
        print(f"Save complete: {file_path}")
    except Exception as e:
        # Delete temp file on error
        if temp_path.exists():
            temp_path.unlink()
        raise
```

#### DXF Version Selection Mistakes

**Problem**: Selecting a version that can't be opened in older CAD software.

**Solution**:
```python
import ezdxf

def create_compatible_dxf(version='R2010'):
    """Create DXF file considering compatibility"""
    # Version validity check
    valid_versions = ['R12', 'R2000', 'R2004', 'R2007', 'R2010', 'R2013', 'R2018']
    if version not in valid_versions:
        raise ValueError(f"Invalid version: {version}. Valid values: {valid_versions}")
    
    doc = ezdxf.new(version)
    
    # For R12, avoid unavailable features
    if version == 'R12':
        # R12 can't use MTEXT, so use TEXT
        msp = doc.modelspace()
        msp.add_text("Text", dxfattribs={'height': 2.5})
    else:
        # Newer versions can use MTEXT
        msp = doc.modelspace()
        msp.add_mtext("Multi-line text", dxfattribs={'height': 2.5})
    
    return doc
```

#### Entity Inconsistencies

**Bad Example**:
```python
# ❌ Bad example: Reference non-existent layer
msp.add_line((0, 0), (10, 10), dxfattribs={'layer': 'NonExistentLayer'})
```

**Correct Implementation**:
```python
# ✅ Good example: Check and create layer
def ensure_layer_exists(doc, layer_name):
    """Ensure layer exists, create if it doesn't"""
    if layer_name not in doc.layers:
        doc.layers.new(layer_name, dxfattribs={'color': 7})  # Default color
    return doc.layers.get(layer_name)

# Usage example
doc = ezdxf.new('R2010')
ensure_layer_exists(doc, "MyLayer")
msp = doc.modelspace()
msp.add_line((0, 0), (10, 10), dxfattribs={'layer': 'MyLayer'})
```

#### Coordinate Value Out of Range

**Problem**: Extremely large coordinate values or invalid values like NaN, Infinity may be included.

**Solution**:
```python
import math

def validate_coordinate(value):
    """Check coordinate value validity"""
    if not isinstance(value, (int, float)):
        raise TypeError(f"Coordinate value must be numeric: {value}")
    
    if math.isnan(value):
        raise ValueError("Coordinate value is NaN")
    
    if math.isinf(value):
        raise ValueError("Coordinate value is infinity")
    
    # Check for extremely large values (optional)
    if abs(value) > 1e10:
        import warnings
        warnings.warn(f"Coordinate value is very large: {value}")
    
    return value

def safe_add_line(msp, start, end):
    """Safely add LINE entity"""
    # Validate coordinate values
    start = tuple(validate_coordinate(x) for x in start)
    end = tuple(validate_coordinate(x) for x in end)
    
    return msp.add_line(start, end)
```

#### Character Encoding Mismatch

**Problem**: Non-ASCII characters like Japanese may become garbled.

**Solution**:
```python
import ezdxf

def create_dxf_with_japanese_text():
    """Create DXF file containing Japanese text"""
    doc = ezdxf.new('R2010')  # R2007+ uses UTF-8 as standard
    
    # R12 and R2000 require attention to encoding
    # R2010+ uses UTF-8 as standard, so no problem
    
    msp = doc.modelspace()
    
    # Add Japanese text
    text = msp.add_text("Japanese text", dxfattribs={'height': 2.5})
    text.set_placement((0, 0))
    
    # MTEXT also supports Japanese
    mtext = msp.add_mtext("Multi-line\nJapanese text", dxfattribs={'height': 2.5})
    mtext.set_location((0, 5))
    
    # When saving, encoding can be explicitly specified (useful for older versions)
    # For R2010+, UTF-8 is standard, but explicit specification is also possible:
    # doc.saveas("output.dxf", encoding='utf-8')
    # Note: R2007+ enforces UTF-8, so encoding parameter is ignored for newer versions
    # For R12/R2000, default encoding is cp1252, so explicit UTF-8 specification may be needed
    
    return doc
```

### 5.3 Mistakes When Operating Entities

#### Coordinate System Confusion

**Problem**: Confusing WCS (World Coordinate System) and OCS (Object Coordinate System).

**Details**: See [Coordinate Systems (WCS/OCS/AAA)](../geometry/coordinate-systems.md)

::: tip For 2D Data (Shapely, etc.)
If you're working with **2D coordinates** (e.g., from Shapely `Polygon.exterior.coords`), you don't need to worry about WCS/OCS transformations. Simply pass coordinates as tuples `(x, y)` directly to ezdxf:

```python
# ✅ Simple for 2D data - just use tuples
points = [(0, 0), (10, 0), (10, 10), (0, 10)]
msp.add_lwpolyline(points)  # No coordinate system conversion needed!
```

The complex transformations below are only needed for **3D operations** or when working with entities that have extrusion vectors (like CIRCLE in 3D space).
:::

**Solution**:
```python
import ezdxf
from ezdxf.math import Vec3, OCS, Z_AXIS

def get_entity_wcs_coordinates(entity):
    """Get entity WCS coordinates (including OCS transformation)"""
    if entity.dxftype() == "CIRCLE":
        # CIRCLE is defined in OCS
        center_ocs = entity.dxf.center
        extrusion = Vec3(entity.dxf.extrusion)  # Normal vector
        
        # OCS to WCS transformation if needed
        # (See coordinate-systems.md for details)
        # Use Vec3.isclose() for safe floating-point comparison
        if not extrusion.isclose(Z_AXIS):
            # Need transformation using Arbitrary Axis Algorithm
            # Use ezdxf transformation functionality
            ocs = OCS(extrusion)
            center_wcs = ocs.to_wcs(center_ocs)
            return center_wcs
        else:
            # No transformation needed for default normal vector
            return center_ocs
    else:
        # LINE etc. are directly WCS coordinates
        return entity.dxf.start
```

#### Insufficient Layer Existence Check

**Bad Example**:
```python
# ❌ Bad example: No layer existence check
entity.dxf.layer = "SomeLayer"  # Reference non-existent layer
```

**Correct Implementation**:
```python
# ✅ Good example: Layer existence check
def set_entity_layer(doc, entity, layer_name):
    """Safely set entity layer"""
    # Check layer existence
    if layer_name not in doc.layers:
        # Create if layer doesn't exist
        doc.layers.new(layer_name, dxfattribs={'color': 7})
        print(f"Created layer '{layer_name}'")
    
    # Set layer
    entity.dxf.layer = layer_name
```

#### Block Reference Circular References

**Problem**: Circular references (e.g., block referencing itself) cause infinite loops.

**Solution**:
```python
import ezdxf

def check_block_circular_reference(doc, block_name, visited=None):
    """Check block circular references"""
    if visited is None:
        visited = set()
    
    if block_name in visited:
        raise ValueError(f"Circular reference detected: {block_name}")
    
    visited.add(block_name)
    
    # Get block definition
    if block_name not in doc.blocks:
        return False
    
    block = doc.blocks[block_name]
    
    # Check INSERT entities in block
    for entity in block:
        if entity.dxftype() == "INSERT":
            referenced_block = entity.dxf.name
            if referenced_block == block_name:
                raise ValueError(f"Block '{block_name}' references itself")
            check_block_circular_reference(doc, referenced_block, visited.copy())
    
    return False  # No circular reference
```

#### Manual Handle Manipulation

**Problem**: Manually setting handles can cause duplicates or invalid values.

**Solution**:
```python
import ezdxf

# ✅ Good example: Let handles be auto-generated
doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# Handles are automatically assigned
print(f"Handle: {line.dxf.handle}")

# ❌ Bad example: Don't manually set handles
# line.dxf.handle = "123"  # Should avoid this
```

#### References After Entity Deletion

**Problem**: Errors occur if references to deleted entities remain.

**Solution**:
```python
import ezdxf

def safe_delete_entities(msp, condition):
    """Safely delete entities matching condition"""
    # First collect deletion targets
    entities_to_delete = [e for e in msp if condition(e)]
    
    # Execute deletion
    for entity in entities_to_delete:
        msp.delete_entity(entity)
    
    return len(entities_to_delete)

# Usage example
doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# Delete LINE entities
deleted_count = safe_delete_entities(msp, lambda e: e.dxftype() == "LINE")
print(f"Deleted {deleted_count} entities")
```

#### Spline Compatibility Issues

**Problem**: Creating splines with only Fit Points (through points) may cause curve shapes to differ between CAD software.

**Bad Example**:
```python
# ❌ Bad example: Create with Fit Points only (may have compatibility issues)
fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = msp.add_spline(fit_points)  # Control points auto-generated
```

**Correct Implementation**:
```python
# ✅ Good example: Explicitly specify control points and knot vector
import ezdxf

def create_compatible_spline(msp, control_points, degree=3):
    """Create spline ensuring compatibility"""
    n = len(control_points)
    order = degree + 1
    
    # Generate open uniform knot vector
    knots = [0] * order
    knots.extend(range(1, n - degree + 1))
    knots.extend([n - degree] * order)
    
    # Explicitly specify control points and knot vector
    spline = msp.add_spline_control_frame(
        control_points=control_points,
        degree=degree,
        knots=knots
    )
    return spline

# Usage example
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = create_compatible_spline(msp, control_points)
```

**Notes**:
- Fit Points to control points conversion algorithms differ between CAD software
- For compatibility, always explicitly specify control points and knot vector
- SPLINE unavailable in R12 and earlier (need polyline approximation)

### 5.4 Data Integrity Risks

#### Unit System Mismatch

**Problem**: `$INSUNITS` header variable doesn't match actual coordinate value units.

**Solution**:
```python
import ezdxf

def get_drawing_units(doc):
    """Get drawing unit system"""
    insunits = doc.header.get('$INSUNITS', 0)
    unit_map = {
        0: 'unitless',
        1: 'inches',
        2: 'feet',
        3: 'miles',
        4: 'millimeters',
        5: 'centimeters',
        6: 'meters',
        7: 'kilometers',
        8: 'microinches',
        9: 'mils',
        10: 'yards',
        11: 'angstroms',
        12: 'nanometers',
        13: 'microns',
        14: 'decimeters',
        15: 'decameters',
        16: 'hectometers',
        17: 'gigameters',
        18: 'astronomical_units',
        19: 'light_years',
        20: 'parsecs'
    }
    return unit_map.get(insunits, 'unknown')

def set_drawing_units(doc, unit_name):
    """Set drawing unit system"""
    unit_map = {
        'inches': 1,
        'feet': 2,
        'millimeters': 4,
        'centimeters': 5,
        'meters': 6,
    }
    if unit_name not in unit_map:
        raise ValueError(f"Invalid unit: {unit_name}")
    doc.header['$INSUNITS'] = unit_map[unit_name]

# Usage example
doc = ezdxf.new('R2010')
set_drawing_units(doc, 'millimeters')
print(f"Unit system: {get_drawing_units(doc)}")
```

#### Scale Issues

**Problem**: Scale setting mistakes when inserting blocks.

**Solution**:
```python
import ezdxf

def insert_block_safely(msp, block_name, insert_point, scale=(1, 1, 1)):
    """Safely insert block"""
    doc = msp.doc
    
    # Check block existence
    if block_name not in doc.blocks:
        raise ValueError(f"Block '{block_name}' not found")
    
    # Validate scale values
    scale = tuple(float(s) for s in scale)
    if any(s <= 0 for s in scale):
        raise ValueError(f"Scale must be positive: {scale}")
    
    # Insert block
    insert = msp.add_blockref(block_name, insert_point, dxfattribs={
        'xscale': scale[0],
        'yscale': scale[1],
        'zscale': scale[2]
    })
    
    return insert
```

#### Rotation Angle Units

**Problem**: Confusing degrees and radians.

**Solution**:
```python
import math

def degrees_to_radians(degrees):
    """Convert degrees to radians"""
    return math.radians(degrees)

def radians_to_degrees(radians):
    """Convert radians to degrees"""
    return math.degrees(radians)

# In ezdxf, angles are usually specified in degrees
doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Create ARC (angles specified in degrees)
msp.add_arc((0, 0), radius=5, start_angle=0, end_angle=90)  # 0 to 90 degrees

# When conversion from radians to degrees is needed
angle_rad = math.pi / 4  # 45 degrees (radians)
angle_deg = radians_to_degrees(angle_rad)
msp.add_arc((10, 0), radius=5, start_angle=0, end_angle=angle_deg)
```

#### Color Handling

**Problem**: Confusion between ACI (AutoCAD Color Index), True Color, and ByLayer.

**Solution**:
```python
import ezdxf

def set_entity_color_safely(entity, color):
    """Safely set entity color"""
    # If color is integer (ACI)
    if isinstance(color, int):
        if 0 <= color <= 256:
            entity.dxf.color = color
        else:
            raise ValueError(f"Invalid ACI color: {color}")
    # If color is tuple (True Color RGB)
    elif isinstance(color, (tuple, list)) and len(color) == 3:
        r, g, b = color
        if all(0 <= c <= 255 for c in (r, g, b)):
            # Set True Color (DXF R2004+)
            entity.dxf.true_color = ezdxf.rgb(r, g, b)
        else:
            raise ValueError(f"Invalid RGB value: {color}")
    # ByLayer case
    elif color == "ByLayer" or color == 256:
        entity.dxf.color = 256
    else:
        raise ValueError(f"Invalid color specification: {color}")

# Usage example
doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# ACI color (1=red)
set_entity_color_safely(line, 1)

# True Color (RGB)
line2 = msp.add_line((0, 5), (10, 15))
set_entity_color_safely(line2, (255, 0, 0))  # Red

# ByLayer
line3 = msp.add_line((0, 10), (10, 20))
set_entity_color_safely(line3, "ByLayer")
```

### 5.5 Performance and Resource Management

#### Memory Leaks

**Problem**: Memory leaks may occur when repeatedly processing large files.

**Solution**:
```python
import ezdxf
import gc

def process_multiple_files(file_paths):
    """Process multiple files (memory efficient)"""
    results = []
    
    for file_path in file_paths:
        # Process file
        doc = ezdxf.readfile(file_path)
        msp = doc.modelspace()
        
        # Execute necessary processing
        count = sum(1 for e in msp if e.dxftype() == "LINE")
        results.append(count)
        
        # Explicitly delete references
        del doc, msp
        
        # Run garbage collection (as needed)
        if len(results) % 10 == 0:
            gc.collect()
    
    return results
```

#### File Handle Closing

**Problem**: Resource leaks occur if file handles aren't properly closed.

**Solution**:
```python
import ezdxf
from contextlib import contextmanager

@contextmanager
def open_dxf(file_path):
    """Safe file operations using context manager"""
    doc = None
    try:
        doc = ezdxf.readfile(file_path)
        yield doc
    finally:
        # Explicit cleanup usually not needed (ezdxf handles automatically)
        # However, handle custom resources here if any
        pass

# Usage example
with open_dxf("drawing.dxf") as doc:
    msp = doc.modelspace()
    for entity in msp:
        print(entity.dxftype())
# Automatic cleanup here
```

#### Iterator Usage

**Problem**: Converting to list consumes large amounts of memory for large files.

**Solution**:
```python
import ezdxf

def process_entities_efficiently(doc):
    """Process entities memory-efficiently"""
    msp = doc.modelspace()
    
    # ❌ Bad example: Convert to list (consumes large memory)
    # entities = list(msp)  # Should avoid
    
    # ✅ Good example: Use iterator directly
    line_count = 0
    circle_count = 0
    
    for entity in msp:  # Use iterator directly
        if entity.dxftype() == "LINE":
            line_count += 1
        elif entity.dxftype() == "CIRCLE":
            circle_count += 1
    
    return line_count, circle_count
```

#### Batch Processing Optimization

**Problem**: Processing multiple files is slow.

**Solution**:
```python
import ezdxf
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing

def process_single_file(file_path):
    """Process single file"""
    try:
        doc = ezdxf.readfile(str(file_path))
        msp = doc.modelspace()
        count = sum(1 for e in msp)
        return file_path, count, None
    except Exception as e:
        return file_path, 0, str(e)

def process_files_parallel(file_paths, max_workers=None):
    """Process multiple files in parallel"""
    if max_workers is None:
        max_workers = min(multiprocessing.cpu_count(), len(file_paths))
    
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_single_file, path) for path in file_paths]
        for future in futures:
            file_path, count, error = future.result()
            if error:
                print(f"Error ({file_path}): {error}")
            else:
                results.append((file_path, count))
    
    return results

# Usage example
file_paths = list(Path(".").glob("*.dxf"))
results = process_files_parallel(file_paths)
for file_path, count in results:
    print(f"{file_path}: {count} entities")
```

---

## 6. Important Notes and Troubleshooting

### Character Encoding Issues

See [Common Pitfalls and Solutions](./common-pitfalls.md#1-文字エンコーディングの問題) for details.

**ezdxf Solution**:
```python
import ezdxf

# ezdxf automatically handles encoding, but
# problems may occur with older version files

# R2010+ uses UTF-8 as standard, so no problem
doc = ezdxf.new('R2010')
msp = doc.modelspace()
msp.add_text("Japanese text", dxfattribs={'height': 2.5})

# When saving, encoding can be explicitly specified (useful for older versions)
# For R2010+, UTF-8 is standard, but explicit specification is also possible:
# doc.saveas("output.dxf", encoding='utf-8')
# Note: R2007+ enforces UTF-8, so encoding parameter is ignored for newer versions
# For R12/R2000, default encoding is cp1252, so explicit UTF-8 specification may be needed

# R12 and R2000 require attention
# Recommend using newer versions when possible
```

### Coordinate System Handling

See [Coordinate Systems (WCS/OCS/AAA)](../geometry/coordinate-systems.md) for details.

::: tip Quick Start for 2D Users
If you're working with **2D data** (Shapely geometries, simple polygons, etc.), coordinate system handling is straightforward:

```python
# 2D coordinates - use tuples directly
points = [(x, y) for x, y in polygon.exterior.coords[:-1]]
msp.add_lwpolyline(points)  # No transformation needed!
```

The complex OCS/WCS transformations described below are **only needed for 3D operations** or when working with entities that have non-default extrusion vectors.
:::

**OCS Transformation in ezdxf** (for 3D operations):
```python
import ezdxf
from ezdxf.math import OCS, Vec3

def convert_ocs_to_wcs(entity):
    """Convert OCS coordinates to WCS coordinates"""
    if hasattr(entity.dxf, 'extrusion'):
        extrusion = Vec3(entity.dxf.extrusion)
        ocs = OCS(extrusion)
        
        if entity.dxftype() == "CIRCLE":
            center_ocs = Vec3(entity.dxf.center)
            center_wcs = ocs.to_wcs(center_ocs)
            return center_wcs
    return None
```

### Unit System Settings

```python
import ezdxf

doc = ezdxf.new('R2010')

# Set unit system
doc.header['$INSUNITS'] = 4  # 4 = millimeters

# Check unit system
insunits = doc.header.get('$INSUNITS', 0)
print(f"Unit system code: {insunits}")
```

### Layer and Linetype Management

```python
import ezdxf

doc = ezdxf.new('R2010')

# Create and manage layers
def get_or_create_layer(doc, layer_name, color=7):
    """Get layer, create if it doesn't exist"""
    if layer_name not in doc.layers:
        doc.layers.new(layer_name, dxfattribs={'color': color})
    return doc.layers.get(layer_name)

# Usage example
layer = get_or_create_layer(doc, "MyLayer", color=1)
msp = doc.modelspace()
msp.add_line((0, 0), (10, 10), dxfattribs={'layer': 'MyLayer'})
```

### Block and Insert Handling

See [Blocks and Inserts](../geometry/blocks-and-inserts.md) for details.

```python
import ezdxf

doc = ezdxf.new('R2010')

# Create block definition
block = doc.blocks.new("MyBlock")
block.add_line((0, 0), (10, 10))
block.add_circle((5, 5), radius=2.5)

# Insert block
msp = doc.modelspace()
msp.add_blockref("MyBlock", (0, 0))
msp.add_blockref("MyBlock", (20, 0), dxfattribs={'rotation': 45})
```

### Handle Handling

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# Handles are automatically assigned
handle = line.dxf.handle
print(f"Handle: {handle}")

# Searching entities by handle (usually unnecessary)
# ezdxf manages automatically, manual operations not recommended
```

### Performance Considerations

See [Parser Design](./parsing-strategy.md) for processing large files.

**ezdxf Optimization**:
```python
import ezdxf
from ezdxf.addons.iterdxf import opendxf

# Use iterdxf addon for huge files
with opendxf("huge_file.dxf") as doc:
    for entity in doc.modelspace():
        # Process entities one by one
        pass
```

---

## 7. Working with Shapely Geometries

::: tip Dedicated Guide Available
For users working with **Shapely** geometries (Polygon, MultiPolygon, LineString, etc.), a complete dedicated guide is available:

**[Working with Shapely Geometries](./ezdxf-shapely-integration.md)** - Comprehensive guide covering:
- Converting Shapely Polygon to DXF LWPOLYLINE
- Handling polygons with holes using HATCH entities
- MultiPolygon, LineString, and LinearRing export
- 2D coordinate system handling (simplified for Shapely users)
- Complete code examples and best practices

This section provides a quick reference. For detailed examples and Shapely-specific patterns, see the dedicated guide.
:::

### Quick Reference: Shapely to DXF

**Basic Polygon Export**:
```python
import ezdxf
from shapely.geometry import Polygon

poly = Polygon([(0, 0), (10, 0), (5, 10), (0, 0)])
doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Simple polygon (no holes)
points = list(poly.exterior.coords[:-1])  # Remove duplicate closing point
msp.add_lwpolyline(points, dxfattribs={'layer': '0', 'closed': True})
```

**Polygon with Holes (HATCH)**:
```python
# Polygon with hole
hole_poly = Polygon(
    [(0, 0), (10, 0), (10, 10), (0, 10)],  # Exterior
    [[(2, 2), (8, 2), (8, 8), (2, 8)]]    # Interior (hole)
)

hatch = msp.add_hatch(color=1)
hatch.paths.add_polyline_path(list(hole_poly.exterior.coords[:-1]), is_closed=True)
for interior in hole_poly.interiors:
    hatch.paths.add_polyline_path(list(interior.coords[:-1]), is_closed=True)
```

**Key Points for Shapely Users**:
- **2D coordinates**: Use tuples `(x, y)` directly - no coordinate system transformations needed
- **Remove duplicate closing point**: Use `coords[:-1]` before passing to ezdxf
- **Holes**: Use `HATCH` entities for polygons with `interiors`
- **MultiPolygon**: Export each polygon separately

For complete examples and advanced patterns, see [Working with Shapely Geometries](./ezdxf-shapely-integration.md).

---

## 8. Practical Examples

### Creating Simple Drawings

```python
import ezdxf

def create_simple_drawing():
    """Create simple drawing"""
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()
    
    # Create layers
    doc.layers.new("Lines", dxfattribs={'color': 1})  # Red
    doc.layers.new("Circles", dxfattribs={'color': 2})  # Yellow
    
    # Add lines
    msp.add_line((0, 0), (10, 0), dxfattribs={'layer': 'Lines'})
    msp.add_line((10, 0), (10, 10), dxfattribs={'layer': 'Lines'})
    msp.add_line((10, 10), (0, 10), dxfattribs={'layer': 'Lines'})
    msp.add_line((0, 10), (0, 0), dxfattribs={'layer': 'Lines'})
    
    # Add circle
    msp.add_circle((5, 5), radius=3, dxfattribs={'layer': 'Circles'})
    
    # Add text
    msp.add_text("Simple Drawing", dxfattribs={'height': 1.0}).set_placement((2, 12))
    
    return doc

# Usage example
doc = create_simple_drawing()
doc.saveas("simple_drawing.dxf")
```

### Reading and Modifying Existing Files

```python
import ezdxf
from pathlib import Path
import shutil

def modify_existing_dxf(input_path, output_path):
    """Read and modify existing file"""
    # Create backup
    if Path(output_path).exists():
        backup_path = Path(output_path).with_suffix('.bak')
        shutil.copy2(output_path, backup_path)
        print(f"Backup created: {backup_path}")
    
    # Read file
    doc = ezdxf.readfile(input_path)
    msp = doc.modelspace()
    
    # Change color of all LINE entities
    for entity in msp:
        if entity.dxftype() == "LINE":
            entity.dxf.color = 1  # Change to red
    
    # Add new entity
    msp.add_circle((0, 0), radius=5, dxfattribs={'color': 2})
    
    # Save
    doc.saveas(output_path)
    print(f"Save complete: {output_path}")

# Usage example
modify_existing_dxf("input.dxf", "output.dxf")
```

### Entity Conversion and Filtering

```python
import ezdxf
from ezdxf import query

def filter_and_convert_entities(input_path, output_path):
    """Filter and convert entities"""
    doc = ezdxf.readfile(input_path)
    msp = doc.modelspace()
    
    # Search entities matching specific conditions
    # Example: LINE entities on layer "0"
    lines = query(msp).filter(
        lambda e: e.dxftype() == "LINE" and e.dxf.layer == "0"
    )
    
    # Create new file
    new_doc = ezdxf.new('R2010')
    new_msp = new_doc.modelspace()
    
    # Copy entities (move to new layer)
    new_doc.layers.new("FilteredLines", dxfattribs={'color': 3})  # Green
    
    for line in lines:
        new_msp.add_line(
            line.dxf.start,
            line.dxf.end,
            dxfattribs={'layer': 'FilteredLines', 'color': 3}
        )
    
    new_doc.saveas(output_path)
    print(f"Filtering complete: {output_path}")

# Usage example
filter_and_convert_entities("input.dxf", "filtered.dxf")
```

### Batch Processing Example

```python
import ezdxf
from pathlib import Path

def batch_process_dxf_files(input_dir, output_dir, processor_func):
    """Batch process multiple DXF files"""
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    dxf_files = list(input_dir.glob("*.dxf"))
    
    for dxf_file in dxf_files:
        try:
            # Process file
            result = processor_func(dxf_file)
            
            # Save result
            output_file = output_dir / dxf_file.name
            result.saveas(str(output_file))
            print(f"Processing complete: {dxf_file.name}")
        except Exception as e:
            print(f"Error ({dxf_file.name}): {e}")

def process_file(file_path):
    """Function to process single file"""
    doc = ezdxf.readfile(str(file_path))
    msp = doc.modelspace()
    
    # Move all entities to layer "Processed"
    doc.layers.new("Processed", dxfattribs={'color': 5})  # Blue
    
    for entity in msp:
        entity.dxf.layer = "Processed"
    
    return doc

# Usage example
batch_process_dxf_files("input/", "output/", process_file)
```

### Safe File Operation Pattern

```python
import ezdxf
from pathlib import Path
import shutil
from datetime import datetime

def safe_file_operation(input_path, output_path, operation_func, create_backup=True):
    """Safe file operation (with backup, error handling)"""
    input_path = Path(input_path)
    output_path = Path(output_path)
    
    # Check input file existence
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    # Create backup
    if create_backup and output_path.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = output_path.with_suffix(f'.{timestamp}.bak')
        shutil.copy2(output_path, backup_path)
        print(f"Backup created: {backup_path}")
    
    # Save to temp file
    temp_path = output_path.with_suffix('.tmp')
    
    try:
        # Execute operation
        result = operation_func(input_path)
        
        # Save to temp file
        result.saveas(str(temp_path))
        
        # Rename on success (atomic operation)
        temp_path.replace(output_path)
        print(f"Operation complete: {output_path}")
        
        return True
    except Exception as e:
        # Delete temp file on error
        if temp_path.exists():
            temp_path.unlink()
        print(f"Error: {e}")
        raise
    finally:
        # Cleanup
        pass

# Usage example
def my_operation(input_path):
    """Custom operation"""
    doc = ezdxf.readfile(str(input_path))
    msp = doc.modelspace()
    
    # Some processing
    for entity in msp:
        if entity.dxftype() == "LINE":
            entity.dxf.color = 1
    
    return doc

safe_file_operation("input.dxf", "output.dxf", my_operation, create_backup=True)
```

---

## 9. Advanced Features

### Adding Custom Data (XDATA)

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# Add XDATA (extended data)
line.set_xdata("MYAPP", [
    (1000, "CustomString"),
    (1040, 3.14159),
    (1070, 42)
])

# Get XDATA
xdata = line.get_xdata("MYAPP")
if xdata:
    for code, value in xdata:
        print(f"Code {code}: {value}")
```

### Using Extension Dictionaries

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()
line = msp.add_line((0, 0), (10, 10))

# Create extension dictionary
xdict = doc.objects.new_dict("MYDICT")
xdict["CustomKey"] = "CustomValue"

# Associate extension dictionary with entity
line.dxf.owner = xdict.dxf.handle
```

### External Reference (XREF) Handling

```python
import ezdxf

# Attach external reference (using ezdxf addon functionality)
# See official documentation for details
# https://ezdxf.readthedocs.io/en/stable/addons/xref.html
```

### Exploding Entities (Explode)

**Explode** is the operation of breaking down complex entities into simpler ones (e.g., breaking blocks into their constituent entities, converting polylines to line segments).

**Common Use Cases**:
- Breaking down block references (INSERT) into individual entities
- Converting LWPOLYLINE/POLYLINE to LINE segments
- Converting SPLINE to LINE segments (approximation)
- Breaking down complex entities for CNC processing

**Important Notes**:
- Explode operations can be computationally expensive, especially for complex entities
- Exploding large blocks or polylines with many vertices can significantly increase the number of entities
- Use explode only when necessary (e.g., when target systems don't support complex entities)

#### Exploding Blocks (INSERT)

```python
import ezdxf
from ezdxf import explode

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# Find all INSERT entities (block references)
inserts_to_explode = [e for e in msp if e.dxftype() == "INSERT"]

# Explode each INSERT entity
for insert in inserts_to_explode:
    # explode.block() returns a list of new entities
    new_entities = explode.block(insert, target_layout=msp)
    # Original INSERT entity is automatically deleted
    print(f"Exploded block '{insert.dxf.name}': {len(new_entities)} entities created")
```

#### Exploding Polylines

```python
import ezdxf
from ezdxf import explode

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# Find all LWPOLYLINE entities
polylines = [e for e in msp if e.dxftype() == "LWPOLYLINE"]

# Explode each polyline into LINE segments
for polyline in polylines:
    # explode.entity() explodes a single entity
    new_entities = explode.entity(polyline, target_layout=msp)
    print(f"Exploded polyline: {len(new_entities)} LINE segments created")
```

#### Exploding Splines (Approximation)

```python
import ezdxf
from ezdxf import explode

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

# Find all SPLINE entities
splines = [e for e in msp if e.dxftype() == "SPLINE"]

# Explode splines into LINE segments (approximation)
for spline in splines:
    # explode.entity() converts SPLINE to LINE segments
    new_entities = explode.entity(spline, target_layout=msp)
    print(f"Exploded spline: {len(new_entities)} LINE segments created")
```

#### Performance Considerations

**Warning**: Explode operations can be expensive:

```python
import ezdxf
from ezdxf import explode

def explode_safely(msp, entity_type="INSERT", max_entities=10000):
    """Safely explode entities with entity count limit"""
    entities = [e for e in msp if e.dxftype() == entity_type]
    
    total_new_entities = 0
    for entity in entities:
        # Check current entity count
        current_count = len(list(msp))
        
        if current_count > max_entities:
            print(f"Warning: Entity count ({current_count}) exceeds limit ({max_entities})")
            print(f"Skipping remaining {len(entities) - entities.index(entity)} entities")
            break
        
        # Explode entity
        new_entities = explode.entity(entity, target_layout=msp)
        total_new_entities += len(new_entities)
    
    print(f"Total new entities created: {total_new_entities}")

# Usage example
doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()
explode_safely(msp, entity_type="INSERT", max_entities=10000)
```

**Best Practices**:
1. **Avoid unnecessary explosions**: Only explode when target systems require it
2. **Monitor entity count**: Exploding can dramatically increase the number of entities
3. **Consider alternatives**: For CNC machines, consider keeping polylines as-is (many machines support them)
4. **Test performance**: Measure processing time before and after explosion

### Creating Dimensions (DIMENSION)

```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Create dimension style
dimstyle = doc.dimstyles.new("MyDimStyle")
dimstyle.dxf.dimtxt = 2.5  # Text height
dimstyle.dxf.dimasz = 2.5  # Arrow size

# Create linear dimension
msp.add_linear_dim(
    base=(0, 0),
    p1=(0, 0),
    p2=(10, 0),
    dimstyle="MyDimStyle"
)

# Create radius dimension
msp.add_radius_dim(
    center=(5, 5),
    radius=3.0,
    dimstyle="MyDimStyle"
)
```

### Spline, NURBS, B-spline Support

ezdxf fully supports DXF **SPLINE** entities and supports both B-spline and NURBS (Non-Uniform Rational B-Spline).

::: tip Advanced Spline Guide Available
For detailed information on knot vectors, NURBS mathematics, advanced interpolation methods, and complex spline operations, see:

**[Advanced Spline, NURBS, and B-spline Guide](./ezdxf-splines-advanced.md)** - Comprehensive guide covering:
- Knot vector generation and mathematics
- NURBS (rational B-splines) with weights
- Advanced interpolation methods (global, local cubic)
- Bezier decomposition and approximation
- Spline conversion techniques

This section provides basic usage. For mathematical details and advanced operations, see the dedicated guide.
:::

#### Quick Reference: Basic Spline Creation

**Simple Spline from Fit Points**:
```python
import ezdxf

doc = ezdxf.new('R2010')
msp = doc.modelspace()

# Create spline by specifying through points
fit_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
spline = msp.add_spline(fit_points)
```

**Note**: Fit points conversion may differ between CAD software. For compatibility, use control points (see below).

**Spline from Control Points (Recommended for Compatibility)**:
```python
# Explicitly specify control points
control_points = [(0, 0), (5, 10), (10, 5), (15, 15)]
degree = 3  # 3rd degree spline (cubic)

# Open spline
spline_open = msp.add_open_spline(control_points, degree=degree)

# Closed spline
spline_closed = msp.add_closed_spline(control_points, degree=degree)
```

**Reading Splines**:
```python
doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()

for entity in msp:
    if entity.dxftype() == "SPLINE":
        print(f"Degree: {entity.dxf.degree}")
        print(f"Control points: {len(entity.control_points)}")
        if entity.dxf.flags & 4:  # RATIONAL_SPLINE flag
            print("NURBS (rational spline)")
```

#### Key Points for Most Users

- **For point sequences**: Usually better to keep as `LWPOLYLINE` (see "Converting Point Sequences" below)
- **For CAD editing**: Use `SPLINE` entities for smaller file size and easier editing
- **For compatibility**: Explicitly specify control points and knot vector (see advanced guide)
- **For CNC machines**: Many machines don't support SPLINE - convert to polyline instead

For detailed spline mathematics and advanced operations, see [Advanced Spline Guide](./ezdxf-splines-advanced.md).

### Converting Point Sequences to Curves: Decision Criteria and Implementation

When exporting curves represented as point sequences to DXF, **whether to convert to curve entities (ARC, SPLINE) or output as point sequences (LINE or LWPOLYLINE)** depends on purpose and compatibility.

::: tip Detailed Background Information
For detailed technical background on why machines don't support SPLINE, see [CNC Machine Compatibility](./cnc-machine-compatibility.md).
:::

#### Decision Criteria: Convert vs Keep as Point Sequence

The following table summarizes recommended methods by purpose:

| Purpose | Recommended Method | Reason |
| :--- | :--- | :--- |
| **CNC Machines / Laser Processing Machines** | **Keep as point sequence (LWPOLYLINE)** | Many machines don't support SPLINE and use point sequences directly |
| **Old CAD Software (Pre-R12)** | **Keep as point sequence (LWPOLYLINE)** | SPLINE unavailable |
| **CAD Editing / Design** | **Curve entities (ARC/SPLINE)** | Easy to edit, smaller file size |
| **High-precision curve representation** | **Curve entities (SPLINE)** | Mathematically accurate curve representation possible |
| **Compatibility Priority** | **Keep as point sequence (LWPOLYLINE)** | Can be reliably read by all CAD software |
| **File Size Priority** | **Curve entities (ARC/SPLINE)** | Significantly smaller file size than point sequences |

#### Implementation Methods

##### 1. Output as Point Sequence (LWPOLYLINE)

**Recommended When**:
- Outputting to CNC machines or laser processing machines
- Compatibility with old CAD software needed
- Point sequence already optimized for processing

```python
import ezdxf

def export_points_as_polyline(points, output_path, closed=False):
    """Export point sequence as LWPOLYLINE"""
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()
    
    # Add as LWPOLYLINE
    # Use close=True parameter for better readability (instead of dxfattribs flags)
    msp.add_lwpolyline(points, close=closed)
    
    doc.saveas(output_path)
    print(f"Exported point sequence as LWPOLYLINE: {len(points)} points")

# Usage example
points = [(0, 0), (5, 10), (10, 5), (15, 15), (20, 10)]
export_points_as_polyline(points, "output_polyline.dxf", closed=False)
```

**Advantages**:
- ✅ Can be reliably read by all CAD software
- ✅ Can be used directly by machines
- ✅ Maintains point sequence accuracy

**Disadvantages**:
- ❌ File size increases (when many points)
- ❌ Difficult to edit in CAD software (need to edit points individually)

##### 2. Conversion to ARC (for arcs)

**Recommended When**:
- Point sequence clearly represents part of an arc
- Accuracy allows arc representation

```python
import ezdxf
from ezdxf.math import Vec3
import math

def fit_arc_to_points(points, tolerance=1e-6):
    """Fit point sequence to arc"""
    if len(points) < 3:
        return None
    
    # Calculate arc from 3 points (simplified example)
    p1 = Vec3(points[0])
    p2 = Vec3(points[len(points) // 2])
    p3 = Vec3(points[-1])
    
    # Calculate circle center and radius from 3 points
    # (Actual implementation uses more advanced fitting algorithms)
    # Simplified example here
    
    # Actual implementation finds optimal arc using least squares, etc.
    # ezdxf doesn't have direct fitting functionality, so
    # recommend using external libraries (scipy, etc.)
    
    return None  # Omitted for example

def export_points_as_arc_if_possible(points, output_path, tolerance=1e-3):
    """Export as ARC if point sequence fits arc"""
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()
    
    # Attempt arc fitting
    arc_params = fit_arc_to_points(points, tolerance)
    
    if arc_params:
        # Export as ARC
        center, radius, start_angle, end_angle = arc_params
        msp.add_arc(
            center,
            radius,
            start_angle,
            end_angle
        )
        print("Exported point sequence as ARC")
    else:
        # Export as LWPOLYLINE if doesn't fit arc
        msp.add_lwpolyline(points)
        print("Exported point sequence as LWPOLYLINE (doesn't fit arc)")
    
    doc.saveas(output_path)
```

**Note**: ezdxf doesn't have direct arc fitting functionality, so external libraries like `scipy` are needed.

##### 3. Conversion to SPLINE (general curves)

**Recommended When**:
- Point sequence represents complex curves
- CAD software editing needed
- Want to reduce file size

```python
import ezdxf
from ezdxf.math import global_bspline_interpolation

def export_points_as_spline(points, output_path, degree=3, method='chord'):
    """Export point sequence as SPLINE"""
    doc = ezdxf.new('R2010')  # Recommend R2000+
    msp = doc.modelspace()
    
    # Method 1: Use Fit Points (simple but note compatibility)
    spline = msp.add_spline(points)
    
    # Method 2: Explicitly calculate control points (recommended, high compatibility)
    from ezdxf.math import global_bspline_interpolation
    
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

**Advantages**:
- ✅ Small file size (significantly reduced from point sequences)
- ✅ Easy to edit in CAD software
- ✅ Mathematically accurate curve representation

**Disadvantages**:
- ❌ May not be readable in old CAD software or machines
- ❌ With Fit Points only, shapes may differ between CAD software

##### 4. Hybrid Approach (Recommended)

Method to automatically select optimal format based on purpose.

```python
import ezdxf
from ezdxf.math import global_bspline_interpolation
from pathlib import Path

def export_curve_intelligently(
    points,
    output_path,
    target_cad_version='R2010',
    target_use='cnc',  # 'cnc', 'cad', 'universal'
    tolerance=1e-3
):
    """Export curve in optimal format based on purpose"""
    doc = ezdxf.new(target_cad_version)
    msp = doc.modelspace()
    
    if target_use == 'cnc' or target_cad_version == 'R12':
        # For CNC machines or old CAD software: keep as point sequence
        msp.add_lwpolyline(points)
        print(f"Exported point sequence as LWPOLYLINE ({len(points)} points)")
    
    elif target_use == 'cad':
        # For CAD editing: convert to SPLINE
        if len(points) >= 4:
            # Explicitly calculate control points
            bspline = global_bspline_interpolation(
                points,
                degree=3,
                method='chord'
            )
            spline = msp.add_spline_control_frame(
                control_points=bspline.control_points,
                degree=3,
                knots=bspline.knots()
            )
            print(f"Exported point sequence as SPLINE ({len(points)} points -> {len(bspline.control_points)} control points)")
        else:
            # LWPOLYLINE if too few points
            msp.add_lwpolyline(points)
            print(f"Exported point sequence as LWPOLYLINE (too few points)")
    
    else:  # 'universal'
        # Compatibility priority: keep as point sequence (safest)
        msp.add_lwpolyline(points)
        print(f"Exported point sequence as LWPOLYLINE (compatibility priority)")
    
    doc.saveas(output_path)

# Usage examples
points = [(0, 0), (5, 10), (10, 5), (15, 15), (20, 10)]

# For CNC machines
export_curve_intelligently(
    points,
    "output_cnc.dxf",
    target_cad_version='R2010',
    target_use='cnc'
)

# For CAD editing
export_curve_intelligently(
    points,
    "output_cad.dxf",
    target_cad_version='R2010',
    target_use='cad'
)

# Compatibility priority
export_curve_intelligently(
    points,
    "output_universal.dxf",
    target_cad_version='R2010',
    target_use='universal'
)
```

#### Implementation Considerations

##### 1. Point Sequence Density and Accuracy

```python
def should_convert_to_spline(points, min_points=4, max_deviation=None):
    """Determine if point sequence should be converted to SPLINE"""
    # Don't convert if too few points
    if len(points) < min_points:
        return False, "Too few points"
    
    # Output as LINE if point sequence is close to straight line
    # (Implementation example: calculate deviation from line connecting first and last points)
    
    return True, "Can convert to SPLINE"

# Usage example
points = [(0, 0), (5, 10), (10, 5), (15, 15)]
should_convert, reason = should_convert_to_spline(points)
if should_convert:
    export_points_as_spline(points, "output.dxf")
else:
    export_points_as_polyline(points, "output.dxf")
```

##### 2. File Size Comparison

```python
import ezdxf
import os

def compare_file_sizes(points, output_dir="."):
    """Compare file sizes of point sequence and SPLINE"""
    # Export as LWPOLYLINE
    doc1 = ezdxf.new('R2010')
    msp1 = doc1.modelspace()
    msp1.add_lwpolyline(points)
    polyline_path = os.path.join(output_dir, "test_polyline.dxf")
    doc1.saveas(polyline_path)
    polyline_size = os.path.getsize(polyline_path)
    
    # Export as SPLINE
    doc2 = ezdxf.new('R2010')
    msp2 = doc2.modelspace()
    from ezdxf.math import global_bspline_interpolation
    bspline = global_bspline_interpolation(points, degree=3)
    msp2.add_spline_control_frame(
        control_points=bspline.control_points,
        degree=3,
        knots=bspline.knots()
    )
    spline_path = os.path.join(output_dir, "test_spline.dxf")
    doc2.saveas(spline_path)
    spline_size = os.path.getsize(spline_path)
    
    print(f"Point count: {len(points)}")
    print(f"LWPOLYLINE: {polyline_size} bytes")
    print(f"SPLINE: {spline_size} bytes")
    print(f"Reduction rate: {(1 - spline_size / polyline_size) * 100:.1f}%")
    
    return polyline_size, spline_size

# Usage example
points = [(i, i**2 / 10) for i in range(100)]  # 100 points
compare_file_sizes(points)
```

#### Summary: Decision Flowchart

```
Export curve represented as point sequence
    │
    ├─ What is the purpose?
    │   │
    │   ├─ CNC machines / Laser processing machines
    │   │   └─> Recommend LWPOLYLINE (keep as point sequence)
    │   │
    │   ├─ CAD editing / Design
    │   │   └─> Recommend converting to SPLINE
    │   │
    │   └─ Compatibility priority
    │       └─> Recommend LWPOLYLINE (keep as point sequence)
    │
    ├─ What is the DXF version?
    │   │
    │   ├─ Pre-R12
    │   │   └─> LWPOLYLINE (SPLINE unavailable)
    │   │
    │   └─ R2000+
    │       └─> Can choose based on purpose
    │
    └─ What are the point sequence characteristics?
        │
        ├─ Fits arc
        │   └─> Convert to ARC (optional)
        │
        ├─ Complex curve (many points)
        │   └─> Convert to SPLINE (file size reduction)
        │
        └─ Simple curve (few points)
            └─> Can keep as LWPOLYLINE
```

#### Best Practices

1. **Clarify purpose**
   - Keep as point sequence for CNC machines
   - Convert to SPLINE for CAD editing

2. **Prioritize compatibility**
   - Choose point sequence (LWPOLYLINE) when uncertain

3. **Consider file size**
   - With 100+ points, converting to SPLINE significantly reduces file size

4. **Maintain accuracy**
   - Verify deviation from original point sequence during conversion
   - Set tolerance as needed

5. **Perform testing**
   - Verify operation in actual usage environment (CAD software, machines)

---

## 10. Checklists and Best Practices

### Reading Checklist

When implementing, verify the following items:

- [ ] File path existence check
- [ ] Proper error handling (IOError, DXFStructureError, etc.)
- [ ] Encoding verification (especially for old version files)
- [ ] Memory usage monitoring (for large files)
- [ ] Handling corrupted files (consider recovery mode)

### Writing Checklist

- [ ] Backup creation (when overwriting existing files)
- [ ] DXF version verification (consider compatibility)
- [ ] Required attribute existence check (layers, linetypes, etc.)
- [ ] Coordinate value validity check (NaN, Infinity, out-of-range values)
- [ ] Encoding specification (when including non-ASCII text)
- [ ] Point sequence to curve conversion decision (choose LWPOLYLINE vs SPLINE based on purpose)

### Entity Operation Checklist

- [ ] Coordinate system verification (WCS vs OCS)
- [ ] Layer existence check (create if doesn't exist)
- [ ] Block reference circular check
- [ ] Handle uniqueness verification (avoid manual setting)
- [ ] Reference cleanup after deletion
- [ ] Spline compatibility verification (explicitly specify control points and knot vector)
- [ ] DXF version verification (SPLINE unavailable in R12 and earlier)

### Best Practices

1. **Defensive Programming**: Implement error handling for all file operations
2. **Validation**: Perform data validity checks at each stage
3. **Logging**: Record logs useful for debugging when problems occur
4. **Test Data**: Test with various cases (corrupted files, large files, etc.)
5. **Documentation**: Enrich code comments and external documentation
6. **Version Management**: Select DXF version considering compatibility
7. **Resource Management**: Consider memory efficiency when processing large files
8. **Backup**: Always create backups before modifying important files

---

## Summary

This guide comprehensively explained information useful for implementation, from basic operations to advanced features, common mistakes and risk mitigation, regarding importing and exporting DXF files using ezdxf.

**Important Points**:
- Proper error handling and validation implementation
- Backup creation during file operations
- Understanding and proper handling of coordinate systems and unit systems
- Memory-efficient implementation
- Implementation verification using checklists

**For Shapely Users**:
- See **[Working with Shapely Geometries](./ezdxf-shapely-integration.md)** for complete Shapely integration guide
- 2D coordinates can be used directly as tuples - no coordinate system transformations needed
- Polygon with holes should use HATCH entities

**About Splines/NURBS/B-spline**:
- ezdxf fully supports SPLINE, B-spline, and NURBS (rational B-spline)
- Creating with Fit Points only may cause curve shapes to differ between CAD software
- For compatibility, strongly recommend explicitly specifying control points and knot vector
- SPLINE unavailable in R12 and earlier (recommend R2000+)
- For detailed spline mathematics and advanced operations, see **[Advanced Spline Guide](./ezdxf-splines-advanced.md)**

**About Converting Point Sequences to Curves**:
- **For CNC Machines / Laser Processing Machines**: Recommend keeping as point sequence (LWPOLYLINE) (many machines don't support SPLINE)
- **For CAD Editing / Design**: Recommend converting to SPLINE (smaller file size, easier to edit)
- **Compatibility Priority**: Recommend keeping as point sequence (LWPOLYLINE) (can be reliably read by all CAD software)
- It's important to select optimal format based on purpose

ezdxf is a powerful library, but understanding DXF concepts enables more effective use. If problems occur, refer to this guide and related documentation.

---

Related: [Major Libraries](./libraries.md) | [Common Pitfalls and Solutions](./common-pitfalls.md) | [Parser Design](./parsing-strategy.md) | [CNC Machine Compatibility](./cnc-machine-compatibility.md) | **[Working with Shapely Geometries](./ezdxf-shapely-integration.md)** | **[Advanced Spline Guide](./ezdxf-splines-advanced.md)**
