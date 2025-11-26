# 日本競技ニュースポーツ協会 トーナメント管理システム

Next.js / Firebase を使用した、競技ニュースポーツ大会管理・モニター表示システムです。

## 📋 ドキュメント

開発時に参考にすべきドキュメント：

| ドキュメント                                                                       | 説明                                   |
| ---------------------------------------------------------------------------------- | -------------------------------------- |
| [`docs/REQUIREMENTS_FUNCTIONAL_DESIGN.md`](docs/REQUIREMENTS_FUNCTIONAL_DESIGN.md) | 要件定義書・機能計画書                 |
| [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md)                               | データベース設計（Firestore スキーマ） |
| [`docs/CODING_RULES.md`](docs/CODING_RULES.md)                                     | コーディングルール（命名、型、構造）   |
| [`docs/CONCURRENT_EDITING_PATTERN.md`](docs/CONCURRENT_EDITING_PATTERN.md)         | 複数端末同時編集対応パターン           |
| [`docs/REFACTORING.md`](docs/REFACTORING.md)                                       | リファクタリング記録（改善内容）       |
| [`.github/REVIEW_PERSPECTIVES.md`](.github/REVIEW_PERSPECTIVES.md)                 | コードレビュー観点（チェックリスト）   |

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📦 プロジェクト構造

```
src/
  ├── components/          # React コンポーネント（Atomic Design）
  │   ├── atoms/          # 最小粒度のコンポーネント
  │   ├── molecules/      # 複数原子の組み合わせ
  │   ├── organisms/      # 複数分子の組み合わせ
  │   ├── providers/      # Context Provider
  │   └── templates/      # ページレイアウト
  ├── data/               # データアクセス層
  │   ├── firebase/       # Firestore 直接操作
  │   └── mappers/        # ドメインエンティティへの変換
  ├── domains/            # ドメインロジック（ビジネスルール）
  ├── hooks/              # React カスタムフック
  ├── lib/                # ユーティリティ関数・設定
  ├── repositories/       # リポジトリパターン（CRUD 抽象化）
  ├── queries/            # TanStack Query（サーバー状態管理）
  ├── store/              # Zustand（クライアント状態管理）
  └── types/              # TypeScript 型定義 + Zod スキーマ
```

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🖥️ デスクトップアプリ (Electron)

このプロジェクトは Electron を使用してデスクトップアプリとしてビルド・配布することができます。

### 開発モード

Next.js の開発サーバーと Electron を同時に起動します。

```bash
npm run electron:dev
```

### 本番ビルド

ローカルでインストーラーを作成する場合：

```bash
# 1. アプリケーションのビルド
npm run electron:build

# 2. パッケージ化（インストーラー生成）
npm run electron:pack
```

生成物は `release` ディレクトリに出力されます。

### リリースフロー (GitHub Actions)

GitHub Actions を使用して、タグのプッシュをトリガーに自動でリリースを作成できます。

1.  変更をコミットし、タグを作成してプッシュします。

```bash
git tag v0.1.1
git push origin v0.1.1
```

3.  GitHub Actions が自動的にビルドを行い、GitHub Releases にインストーラー（`.dmg`, `.exe`）をアップロードします。
4.  Webアプリの `/download` ページに最新バージョンが表示されます。

詳細なワークフローについては [`docs/ELECTRON_RELEASE_WORKFLOW.md`](docs/ELECTRON_RELEASE_WORKFLOW.md) を参照してください。
