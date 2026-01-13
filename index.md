---
layout: home

hero:
  name: DXF Standards Explained
  text: Unraveling CAD Data "Reading and Writing"
  tagline: A thorough explanation of the structure and mathematics of the historic Drawing Exchange Format from an implementer's perspective.
  actions:
    - theme: brand
      text: Get Started
      link: /docs/getting-started
    - theme: alt
      text: Learn Tag Structure
      link: /structure/tag-and-group-code

features:
  - title: History and Grammar
    details: Why use "numbers (group codes)"? Explains from the background of its birth to its significance in modern times.
  - title: Conceptual Separation
    details: Logically separates and explains the roles of HEADER, TABLES, BLOCKS, and ENTITIES.
  - title: Implementer's Perspective
    details: Provides insights useful for actual development, such as parser design, floating-point errors, and character encoding countermeasures.
  - title: Mathematics and Coordinate Systems
    details: Visualizes difficult aspects of 2D/3D transformation, such as OCS (Object Coordinate System) and Arbitrary Axis Algorithm (AAA).
---

## 🧭 Learning Roadmap

Please proceed through the following paths according to your objectives.

::: info 1. Understanding DXF Basics (Beginner/Introduction)
For those who want to quickly understand what DXF is.
- [First Steps: Creating a Minimal DXF](/docs/getting-started)
- [Frequently Asked Questions (FAQ)](/docs/faq)
- [International Standards and DXF's Position](/comparison/standardization-and-iso)
- [Tag Structure and Group Code Basics](/structure/tag-and-group-code)
- [DXF History and Versions](/docs/history-versions)
- **Format Comparison**: [vs DWG](/comparison/dxf-vs-dwg) / [vs SVG](/comparison/dxf-vs-svg) / [vs Gerber/G-code](/comparison/dxf-vs-industrial-formats)
:::

::: info 2. Deep Understanding of Data Structure (Intermediate/Detailed Reference)
For those who want to extract specific data or strictly understand the structure.
- [Section Overview](/structure/sections-overview)
- [Important Header Variables](/structure/header-variables)
- [Tables and Layers](/structure/tables-and-layers)
- [Common Entities (LINE, CIRCLE, etc.)](/geometry/common-entities)
- [Polygons, Holes, and Fills](/geometry/polygons-and-fills)
- [Line Thickness, Depth, and Width](/geometry/line-thickness-and-weight)
- [Linetypes (Dashed/Dotted) and Construction Lines](/geometry/linetypes-and-construction-lines)
- [Advanced Entities (SPLINE, NURBS, Brep)](/geometry/advanced-entities)
:::

::: info 3. Mastering Mathematics and Coordinate Systems (Tackling Difficult Areas)
For those stuck with 3D placement or arc calculations. The most difficult aspect of DXF implementation.
- [Coordinate Systems (WCS/OCS/AAA)](/geometry/coordinate-systems)
- [Blocks and Inserts](/geometry/blocks-and-inserts)
:::

::: info 4. Implementing a Parser (Practice/Engineer)
For those who want to select libraries or design their own parser.
- [Parser Design](/implementation/parsing-strategy)
- [Common Pitfalls and Solutions](/implementation/common-pitfalls)
- [Major Libraries Introduction](/implementation/libraries)
- [3D CAD Interoperability](/implementation/3d-cad-interoperability)
- [Free Software Usage Guidelines](/implementation/free-software-guide)
- [CAE (ANSYS, etc.) Interoperability](/implementation/cae-interoperability)
:::

---

## 📂 Sample Files
[samples/README](/samples/README) contains various DXF files for learning.
Learning while comparing with actual code will deepen your understanding.
