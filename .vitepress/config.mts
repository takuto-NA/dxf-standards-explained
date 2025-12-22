import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: "DXF Standards Explained",
    description: "A comprehensive guide to the Drawing Exchange Format (DXF)",
    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/docs/getting-started' }
      ],
      sidebar: [
        {
          text: '🚀 導入',
          items: [
            { text: 'はじめに（最小構成を作る）', link: '/docs/getting-started' },
            { text: 'DXFの歴史とバージョン', link: '/docs/history-versions' },
            { text: '用語集', link: '/docs/glossary' }
          ]
        },
        {
          text: '🧱 データ構造',
          collapsed: false,
          items: [
            { text: 'タグ構造とデータ型', link: '/structure/tag-and-group-code' },
            { text: 'セクション概要', link: '/structure/sections-overview' },
            { text: '重要ヘッダー変数', link: '/structure/header-variables' },
            { text: 'テーブルとレイヤー', link: '/structure/tables-and-layers' }
          ]
        },
        {
          text: '📐 幾何学と図形',
          collapsed: false,
          items: [
            { text: '共通エンティティ', link: '/geometry/common-entities' },
            { text: '座標系 (WCS/OCS/AAA)', link: '/geometry/coordinate-systems' },
            { text: 'ブロックとインサート', link: '/geometry/blocks-and-inserts' }
          ]
        },
        {
          text: '💻 実装ガイド',
          collapsed: false,
          items: [
            { text: 'パーサーの設計', link: '/implementation/parsing-strategy' },
            { text: 'よくある罠', link: '/implementation/common-pitfalls' },
            { text: '主要ライブラリ', link: '/implementation/libraries' }
          ]
        },
        {
          text: '📊 比較と背景',
          collapsed: true,
          items: [
            { text: 'DXF vs DWG', link: '/comparison/dxf-vs-dwg' },
            { text: 'DXF vs SVG', link: '/comparison/dxf-vs-svg' }
          ]
        }
      ],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/your-username/dxf-standards-explained' }
      ]
    },
    markdown: {
      math: true
    }
  })
)

