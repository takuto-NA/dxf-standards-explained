# Major Libraries

This introduces DXF libraries available for each programming language. Useful for implementation reference or evaluation of existing solutions.

## Python: ezdxf (Most Recommended)

**Features**:
- Most popular and feature-rich Python library
- Wide support from DXF R12 to latest versions
- Supports both reading and writing
- Strong support for mathematical processing like OCS/WCS conversion

### Quick Start
```python
import ezdxf

# Read DXF file
try:
    doc = ezdxf.readfile("drawing.dxf")
    msp = doc.modelspace()
    
    for entity in msp:
        if entity.dxftype() == "LINE":
            # Get start and end points
            print(f"Line: {entity.dxf.start} -> {entity.dxf.end}")
except IOError:
    print("File not found")

# Create DXF file
doc = ezdxf.new('R2010')
msp = doc.modelspace()
msp.add_line((0, 0), (10, 10))
doc.saveas("output.dxf")
```

### python-dxf (dxfgrabber)

**GitHub**: https://github.com/mozman/dxfgrabber

**Features**:
- Read-only (no write support)
- Simple API
- Lightweight

**Usage Example**:
```python
import dxfgrabber

dxf = dxfgrabber.readfile("drawing.dxf")
for entity in dxf.entities:
    print(entity)
```

**Scope**: Simple read-only processing

## C#

### netDxf

**GitHub**: https://github.com/haplokuon/netDxf

**Features**:
- Comprehensive DXF library for .NET
- Supports both reading and writing
- Supports DXF R12 to latest versions
- Open source (MIT license)

**Usage Example**:
```csharp
using netDxf;

// Read DXF file
DxfDocument doc = DxfDocument.Load("drawing.dxf");

// Get entities
foreach (EntityObject entity in doc.Entities)
{
    Console.WriteLine($"{entity.Type}: {entity}");
}

// Create DXF file
DxfDocument newDoc = new DxfDocument();
Line line = new Line(new Vector3(0, 0, 0), new Vector3(10, 10, 0));
newDoc.Entities.Add(line);
newDoc.Save("output.dxf");
```

**Scope**: DXF processing in .NET applications

### DxfLib

**GitHub**: https://github.com/IxMilia/Dxf

**Features**:
- Modern C# API
- Read/write support
- Type-safe design

## C++

### dxflib (Recommended)

**Official Site**: https://www.qcad.org/en/dxflib-downloads

**Features**:
- Proven open source library used by QCAD
- Very fast and lightweight
- Event-driven (SAX) parser

### Quick Start
```cpp
#include "dl_dxf.h"
#include "dl_creationadapter.h"

// Class that receives callbacks
class MyDxfReader : public DL_CreationAdapter {
public:
    virtual void addLine(const DL_LineData& data) override {
        printf("Line found!\n");
    }
};

int main() {
    MyDxfReader reader;
    DL_Dxf dxf;
    if (!dxf.in("drawing.dxf", &reader)) {
        return 1; // Read failed
    }
    return 0;
}
```

### LibreDWG

**Official Site**: https://www.gnu.org/software/libredwg/

**Features**:
- Specialized in DWG format read/write (also supports DXF)
- C language API
- Open source (GPL license)

**Scope**: Low-level CAD file processing, embedded systems

### Open Design Alliance (ODA) File Converter

**Official Site**: https://www.opendesign.com/

**Features**:
- Commercial library (paid)
- Industry standard DWG/DXF processing
- High functionality but expensive

**Scope**: Commercial CAD applications

## JavaScript / TypeScript: dxf-parser

**Features**:
- DXF parser that works in Node.js and browsers
- Read-only
- Simple conversion to JSON format

### Quick Start
```javascript
const DxfParser = require('dxf-parser');
const fs = require('fs');

const parser = new DxfParser();
try {
    const fileContent = fs.readFileSync('drawing.dxf', 'utf-8');
    const dxf = parser.parseSync(fileContent);
    
    dxf.entities.forEach(entity => {
        if (entity.type === 'LINE') {
            console.log(`Line from (${entity.vertices[0].x}, ${entity.vertices[0].y})`);
        }
    });
} catch(err) {
    console.error(err);
}
```

### dxf-writer

**GitHub**: https://github.com/bjnortier/dxf-writer

**Features**:
- Write-only for DXF files
- Works in browsers

**Scope**: DXF generation in web applications

## Java

### jdxf

**GitHub**: https://github.com/nraynaud/jdxf

**Features**:
- DXF library for Java
- Read/write support
- Lightweight

**Usage Example**:
```java
import com.nraynaud.jdxf.*;

DXFDocument doc = DXFDocument.read("drawing.dxf");
for (DXFEntity entity : doc.getEntities()) {
    System.out.println(entity);
}
```

## Rust

### dxf

**GitHub**: https://github.com/ixmilia/dxf-rs

**Features**:
- DXF library for Rust
- Read/write support
- Type-safe design

**Usage Example**:
```rust
use dxf::Drawing;

let drawing = Drawing::load("drawing.dxf")?;
for entity in drawing.entities() {
    println!("{:?}", entity);
}
```

## Library Selection Guidelines

### For Read-only

- **Python**: `dxfgrabber` (simple) or `ezdxf` (feature-rich)
- **JavaScript**: `dxf-parser`
- **C#**: `netDxf` or `DxfLib`

### When Both Read and Write Needed

- **Python**: `ezdxf` (recommended)
- **C#**: `netDxf` (recommended)
- **C++**: `LibreDWG` (open source) or ODA (commercial)

### When Performance is Critical

- **C++**: `LibreDWG` or ODA
- **Rust**: `dxf-rs` (balance of memory safety and performance)

### For Web Applications

- **Server-side**: Node.js `dxf-parser` + `dxf-writer`
- **Client-side**: JavaScript libraries that work in browsers

## Library Comparison Table

| Library | Language | Read | Write | License | Maintenance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ezdxf | Python | ✅ | ✅ | MIT | Active |
| netDxf | C# | ✅ | ✅ | MIT | Active |
| dxf-parser | JavaScript | ✅ | ❌ | MIT | Active |
| LibreDWG | C/C++ | ✅ | ✅ | GPL | Active |
| dxf-rs | Rust | ✅ | ✅ | MIT | Active |

## Custom Implementation vs Library Use

### When Using Libraries

- **Rapid Development**: Shorten development time by using existing libraries
- **Tested**: Tested by many users
- **Rich Features**: Advanced features (splines, dimensions, etc.) already implemented

### When Custom Implementation

- **Special Requirements**: Special processing that existing libraries cannot handle
- **Performance**: Need parser optimized for specific use cases
- **Learning Purpose**: Want to deeply understand DXF internal structure

## Summary

In most cases, using existing libraries is recommended. Especially `ezdxf` (Python) and `netDxf` (C#) are practical choices with rich features and good documentation.

However, understanding DXF's internal structure helps avoid library bugs and handle special requirements. Please use this documentation as a reference to deepen that understanding.
