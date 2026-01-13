# International Standards and DXF's Position

An unavoidable question when handling DXF is "Is this an international standard (ISO)?" To conclude, **DXF is not an international standard.**

Here we explain DXF's legal and standard position, and why a format that is not ISO has conquered the world.

---

## 1. DXF as a "De Facto Standard"

DXF is a **proprietary** format developed by Autodesk for its own software "AutoCAD."

- **De Facto Standard**: Something that has become widely adopted due to market share and is treated as a standard. DXF falls into this category.
- **De Jure Standard**: Standards established by public institutions like ISO or JIS.

### Risk of Vendor Lock-in?
Usually, formats made by specific companies have the risk of lock-in: "you can't read data unless you buy that company's products." However, for DXF, this risk is considered low for the following reasons.

1. **Specification Publication**: Autodesk publishes DXF specifications for free.
2. **Text-based**: If ASCII format, even if Autodesk goes bankrupt, you can at worst read the contents with a text editor.
3. **Overwhelming Adoption**: Since CAD and machine software worldwide have implemented it, it has become infrastructure beyond the control of a single company.

---

## 2. Are There International Standards (ISO) for 2D Drawings?

The answer to "If DXF is not ISO, are there no ISO standards for 2D drawings?" is **"Standards exist but are not widespread for CAD data exchange."**

### ISO 10303 (STEP)
In the 3D CAD world, **STEP** format has become established as an international standard. STEP includes specifications (AP202, etc.) that can handle 2D drawings, but the structure is extremely complex, so DXF was overwhelmingly more convenient for simple 2D data exchange.

### Why Didn't Public Standards for 2D Drawings Beat DXF?
1. **Speed**: ISO standardization takes years, but DXF was quickly updated along with AutoCAD's evolution.
2. **Implementation Difficulty**: ISO standards were too strict, making it very difficult for software developers to incorporate into their own software. On the other hand, DXF's simple structure of "2 lines, 1 pair" attracted many developers.

---

## 3. Public Standards in Japan: SXF

In Japan, **SXF (SFC/P21)** is established as a standard format for delivery to public works (Ministry of Land, Infrastructure, Transport and Tourism, etc.).

- **Background**: Established as a Japanese standard to solve problems like "DXF looks different depending on software (character garbling or scale shifts)."
- **Base**: Internally uses ISO 10303 (STEP) technology.
- **Current Status**: Required for public works delivery, but convenient DXF is still mainstream in private company design and manufacturing sites (laser cutting, etc.).

---

## 4. Comparison Summary

| Format | Position | Features |
| :--- | :--- | :--- |
| **DXF** | De Facto Standard | Easy to implement and opens anywhere, but specification depends on Autodesk. |
| **STEP** | International Standard (ISO) | High functionality and strict, but too heavy for 2D drawings. |
| **SXF** | Domestic Public Standard | Required for public works. Emphasizes consistency of appearance. |

### Conclusion: Which Should You Use?
- **General Design/Manufacturing**: **DXF**. Fewest problems and rich libraries.
- **Long-term Data Storage/3D Combined Use**: **STEP**.
- **Drawing Delivery to Government Agencies**: **SXF**.

---
Related: [DXF History and Versions](../docs/history-versions.md) | [DXF vs DWG](./dxf-vs-dwg.md)
