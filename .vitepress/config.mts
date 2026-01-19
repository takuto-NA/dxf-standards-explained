import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    lang: 'en-US',
    base: '/dxf-standards-explained/',
    title: "DXF Standards Explained",
    description: "A comprehensive guide to the Drawing Exchange Format (DXF)",
    lastUpdated: true,
    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Get Started', link: '/docs/getting-started' },
        { text: 'Roadmap', link: '/#-learning-roadmap' },
        { text: 'FAQ', link: '/docs/faq' },
        { text: 'Samples', link: '/samples/README' }
      ],
      search: {
        provider: 'local'
      },
      sidebar: [
        {
          text: '🚀 Getting Started',
          items: [
            { text: 'First Steps (Create Minimal DXF)', link: '/docs/getting-started' },
            { text: 'FAQ', link: '/docs/faq' },
            { text: 'DXF History and Versions', link: '/docs/history-versions' },
            { text: 'Glossary', link: '/docs/glossary' }
          ]
        },
        {
          text: '🧱 Data Structure',
          collapsed: false,
          items: [
            { text: 'Tag Structure and Group Codes', link: '/structure/tag-and-group-code' },
            { text: 'Section Overview', link: '/structure/sections-overview' },
            { text: 'Important Header Variables', link: '/structure/header-variables' },
            { text: 'Tables and Layers', link: '/structure/tables-and-layers' }
          ]
        },
        {
          text: '📐 Geometry and Shapes',
          collapsed: false,
          items: [
            { text: 'Common Entities', link: '/geometry/common-entities' },
            { text: 'Polygons, Holes, and Fills', link: '/geometry/polygons-and-fills' },
            { text: 'Line Thickness, Depth, and Width', link: '/geometry/line-thickness-and-weight' },
            { text: 'Linetypes and Construction Lines', link: '/geometry/linetypes-and-construction-lines' },
            { text: 'Coordinate Systems (WCS/OCS/AAA)', link: '/geometry/coordinate-systems' },
            { text: 'Blocks and Inserts', link: '/geometry/blocks-and-inserts' },
            { text: 'Advanced Entities', link: '/geometry/advanced-entities' }
          ]
        },
        {
          text: '💻 Implementation Guide',
          collapsed: false,
          items: [
            { text: 'Parser Design', link: '/implementation/parsing-strategy' },
            { text: 'Common Pitfalls', link: '/implementation/common-pitfalls' },
            { text: 'Major Libraries', link: '/implementation/libraries' },
            { text: 'Free Software Usage Guide', link: '/implementation/free-software-guide' },
            { text: '3D CAD Interoperability', link: '/implementation/3d-cad-interoperability' },
            { text: 'CAE (ANSYS, etc.) Interoperability', link: '/implementation/cae-interoperability' }
          ]
        },
        {
          text: '📊 Comparison and Background',
          collapsed: true,
          items: [
            { text: 'DXF vs DWG', link: '/comparison/dxf-vs-dwg' },
            { text: 'DXF vs SVG', link: '/comparison/dxf-vs-svg' },
            { text: 'Comparison with Industrial Formats', link: '/comparison/dxf-vs-industrial-formats' }
          ]
        }
      ],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/takuto-NA/dxf-standards-explained' }
      ],
      editLink: {
        pattern: 'https://github.com/takuto-NA/dxf-standards-explained/edit/main/:path',
        text: 'Edit this page on GitHub'
      },
      footer: {
        message: 'MIT License',
        copyright: 'Copyright (c) takuto-NA'
      }
    },
    markdown: {
      math: true
    }
  })
)

