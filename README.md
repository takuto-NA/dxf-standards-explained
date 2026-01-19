# DXF Standards Explained

A technical guide that condenses the structure of DXF (Drawing Exchange Format) and the essential mathematical knowledge required for implementation.

### 🎯 Project Purpose

This project addresses challenges faced by CAD data processing implementers, such as "unable to parse even after reading the specification" and "circles flying away in OCS (Object Coordinate System)".

Why does this old format, born in 1982, continue to be used at the forefront of manufacturing, architecture, and design? This guide comprehensively explains everything from its historical background to parser implementation and coordinate transformation mathematics.

---

## 🚀 Documentation Site

For detailed explanations and learning roadmap, please refer to the following documentation site.

- **GitHub Pages**: **[https://takuto-NA.github.io/dxf-standards-explained/](https://takuto-NA.github.io/dxf-standards-explained/)**
- **Read in repository (for offline/PR review)**: [Learning Roadmap (index.md)](./index.md)

---

## 🧭 Quick Start Guide (For First-Time Readers)

- **Start here**: [First Steps: Creating a Minimal DXF](./docs/getting-started.md)
- **Overview (what to read and in what order)**: [Learning Roadmap](./index.md#-learning-roadmap)
- **Minimum DXF grammar**: [Tag Structure and Group Code Basics](./structure/tag-and-group-code.md)
- **Common pitfalls**: [Coordinate Systems (WCS/OCS/AAA)](./geometry/coordinate-systems.md) / [Common Pitfalls and Solutions](./implementation/common-pitfalls.md)
- **Hands-on with samples**: [DXF Samples](./samples/README.md)

## 🛠 Development Environment

This project is built with [VitePress](https://vitepress.dev/).

```bash
# Install dependencies
npm install

# Local preview
npm run docs:dev

# Build
npm run docs:build
```

## 📂 Structure

- `docs/`: Getting started, glossary, history, **FAQ**, etc.
- `structure/`: DXF file structure, tags, section explanations
- `geometry/`: Coordinate systems, common entities, **polygons and fills**, **line thickness and weight**, **linetypes and construction lines**, **advanced entities (SPLINE/Brep)**, mathematical algorithms
- `implementation/`: Parser design, major libraries, **free software usage guide**, **3D CAD/CAE interoperability**, pitfalls
- `comparison/`: Comparisons with **DWG, SVG, Gerber, G-code, fonts**, etc.
- `samples/`: DXF sample files for learning and testing

## 📄 License

MIT License

## 🤝 Contributing

Bug fixes and content additions are very welcome. Please see [CONTRIBUTING.md](./CONTRIBUTING.md).
