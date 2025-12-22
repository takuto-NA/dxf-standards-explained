# 貢献ガイド (Contributing Guide)

DXF Standards Explained をより良くするための貢献を歓迎します。

## 🛠 貢献の方法

### 1. バグ報告や改善の提案
- ドキュメントの誤字脱字、リンク切れ、内容の誤りを見つけた場合は [Issues](https://github.com/takuto-NA/dxf-standards-explained/issues) で報告してください。
- 「この部分がわかりにくい」「このエンティティの解説を追加してほしい」といった提案も歓迎します。

### 2. プルリクエスト (Pull Requests)
1. このリポジトリをフォークします。
2. 新しいブランチを作成します (`git checkout -b feature/amazing-feature`)。
3. 変更をコミットします (`git commit -m 'Add some amazing feature'`)。
4. ブランチをプッシュします (`git push origin feature/amazing-feature`)。
5. プルリクエストを作成してください。

## 📝 執筆ルール

- **言語**: 原則として日本語で執筆してください。技術用語は適宜英語を併記してください。
- **図解**: 構造やフローの解説には [Mermaid](https://mermaid.js.org/) を使用してください。
- **数学**: 数式は LaTeX 形式（`$...$` または `$$...$$`）で記述してください。
- **リンク**: 他のページへの参照は相対パスで行ってください。

## 💻 開発環境のセットアップ

```bash
# インストール
npm install

# ローカルサーバー起動
npm run docs:dev
```

変更を加えた後は、ローカルサーバーで表示崩れがないか確認してください。

---

あなたの知見が、他の実装者の助けになります。ご協力ありがとうございます！

