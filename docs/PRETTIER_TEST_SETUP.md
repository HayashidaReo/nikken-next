# 開発環境セットアップ - Prettier & テスト

## 📋 概要

このドキュメントでは、nikken-nextプロジェクトにPrettierとテスト環境を導入した内容について説明します。

## 🎨 Prettier 設定

### インストール済みパッケージ

- `prettier`: コードフォーマッター

### 設定ファイル

#### `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### `.prettierignore`

- ビルド成果物 (`.next/`, `out/`, `build/`, `dist/`)
- 依存関係 (`node_modules/`)
- 自動生成ファイル (`*.generated.ts`, `*.generated.js`)

### 利用可能なスクリプト

```bash
# コードをフォーマット
npm run format

# フォーマットチェック（CI用）
npm run format:check
```

## 🧪 テスト環境

### インストール済みパッケージ

- `jest`: テスティングフレームワーク
- `@testing-library/react`: Reactコンポーネントテスト
- `@testing-library/jest-dom`: DOM要素のカスタムマッチャー
- `@testing-library/user-event`: ユーザーイベントシミュレーション

### 設定ファイル

#### `jest.config.js`

- Next.js統合設定
- TypeScript対応
- パスエイリアス設定 (`@/*`)
- カバレッジレポート設定

#### `jest.setup.js`

- testing-library/jest-domの自動インポート

### テスト構造

```
__tests__/
├── team.schema.test.ts      # Zodスキーマのテスト
├── match.schema.test.ts     # 試合スキーマのテスト
├── utils.test.ts            # ユーティリティ関数のテスト
└── Button.test.tsx          # Reactコンポーネントのテスト
```

### 利用可能なスクリプト

```bash
# テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジレポート付きテスト
npm run test:coverage
```

## 📁 作成されたファイル・ディレクトリ

### 型定義とスキーマ

- `src/types/team.schema.ts` - チーム・選手のZodスキーマ
- `src/types/match.schema.ts` - 試合のZodスキーマ
- `src/types/jest-dom.d.ts` - Jest DOM型定義

### ユーティリティ

- `src/lib/utils.ts` - 共通ユーティリティ関数

### コンポーネント

- `src/components/atoms/Button.tsx` - サンプルButtonコンポーネント

### VSCode設定

- `.vscode/settings.json` - エディタ設定

## 🔧 開発時の推奨ワークフロー

1. **コード作成**
   - TypeScriptでコンポーネント/ロジックを実装

2. **フォーマット**

   ```bash
   npm run format
   ```

3. **テスト作成・実行**

   ```bash
   npm test
   ```

4. **コードカバレッジ確認**
   ```bash
   npm run test:coverage
   ```

## 📊 現在のテスト状況

- **テストスイート**: 4 passed
- **テスト件数**: 42 passed
- **カバレッジ**: 約80%以上

### テスト対象

#### 型安全性（Zodスキーマ）

- チーム情報のバリデーション
- 試合情報のバリデーション
- エラーメッセージの検証

#### ユーティリティ関数

- `cn()` - Tailwindクラス結合
- `generateDisplayNames()` - 表示名生成ロジック
- `calculateScoreFromHansoku()` - 反則による得点計算

#### UIコンポーネント

- Buttonコンポーネントの各バリアント
- イベントハンドリング
- アクセシビリティ

## 🚀 次のステップ

1. **追加のテストケース作成**
   - より複雑なユーザーインタラクション
   - エラーケースの網羅

2. **E2Eテスト環境の構築**
   - Playwright または Cypress の導入

3. **CI/CDパイプラインでのテスト自動化**
   - GitHub Actions での自動テスト実行

4. **Visual Regression Testing**
   - Storybook + Chromatic の導入検討
