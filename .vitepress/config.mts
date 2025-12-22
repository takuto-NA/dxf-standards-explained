import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    lang: 'ja-JP',
    base: '/dxf-standards-explained/',
    title: "DXF Standards Explained",
    description: "A comprehensive guide to the Drawing Exchange Format (DXF)",
    lastUpdated: true,
    themeConfig: {
      nav: [
        { text: 'ホーム', link: '/' },
        { text: 'はじめに', link: '/docs/getting-started' },
        { text: 'ロードマップ', link: '/#-学習ロードマップ' },
        { text: 'FAQ', link: '/docs/faq' },
        { text: 'サンプル', link: '/samples/README' }
      ],
      search: {
        provider: 'local'
      },
      sidebar: [
        {
          text: '🚀 導入',
          items: [
            { text: 'はじめに（最小構成を作る）', link: '/docs/getting-started' },
            { text: 'よくある質問 (FAQ)', link: '/docs/faq' },
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
            { text: 'ブロックとインサート', link: '/geometry/blocks-and-inserts' },
            { text: '高度なエンティティ', link: '/geometry/advanced-entities' }
          ]
        },
        {
          text: '💻 実装ガイド',
          collapsed: false,
          items: [
            { text: 'パーサーの設計', link: '/implementation/parsing-strategy' },
            { text: 'よくある罠', link: '/implementation/common-pitfalls' },
            { text: '主要ライブラリ', link: '/implementation/libraries' },
            { text: '3D CADとの互換性', link: '/implementation/3d-cad-interoperability' },
            { text: 'CAE（ANSYS等）との互換性', link: '/implementation/cae-interoperability' }
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
        { icon: 'github', link: 'https://github.com/takuto-NA/dxf-standards-explained' }
      ],
      editLink: {
        pattern: 'https://github.com/takuto-NA/dxf-standards-explained/edit/main/:path',
        text: 'このページをGitHubで編集'
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

