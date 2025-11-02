# 🤖 Portfolio Project - コーディングルール

## 🎯 プロジェクトの設計思想

このプロジェクト（`nikken-next`）は、以下の5つの原則に基づいて設計・実装されます。

### 1. Server Components First

Next.js App Routerの思想に基づき、デフォルトをServer Componentとします。インタラクティブ性を必要とする箇所のみ `"use client"` を使用し、パフォーマンスを最大化します。

### 2. 完全な型安全性 (Zod-First)

`any`型を禁止し、実行時エラーを防ぎます。**Zodスキーマを「信頼できる唯一の情報源 (SSoT)」**とし、TypeScriptの型はZodから`z.infer<>`で自動導出します。

### 3. 厳格なAtomic Design

UIコンポーネントを5階層（Atoms, Molecules, Organisms, Templates, Pages）に厳密に分離し、再利用性と保守性を最大化します。

### 4. 明確な状態の分離

状態を「サーバー状態」「グローバルクライアント状態」「ローカルクライアント状態」の3つに厳格に分離し、適切なライブラリ（TanStack Query, Zustand, useState）を使い分けます。

### 5. AI協調開発の最適化

このドキュメント自体をAIへの指示書とし、明確な型定義と設計ルールによって、AIがプロジェクトの文脈に沿った最適なコードを生成できるように導きます。

## 🏗️ アーキテクチャ設計ルール

### 1. ディレクトリ構造 (App Router + Atomic Design)

src/
├── app/ # (Pages) Next.js App Router
│ ├── (auth)/ # 認証済みユーザーのみアクセス可能なルートグループ
│ │ ├── dashboard/ # (例: 試合一覧画面)
│ │ │ └── page.tsx # 1. ページコンポーネント (Server Component)
│ │ └── layout.tsx
│ ├── (public)/ # 未認証ユーザーがアクセスするルートグループ
│ │ ├── login/ # (例: ログイン画面)
│ │ │ └── page.tsx
│ │ └── layout.tsx
│ ├── layout.tsx # ルートレイアウト (全体)
│ └── page.tsx # ホームページ
│
├── components/ # Atomic Design コンポーネント
│ ├── atoms/ # 2. Atoms (原子)
│ │ ├── button.tsx # (Shadcn/uiのButton)
│ │ ├── input.tsx
│ │ ├── label.tsx
│ │ └── ...
│ ├── molecules/ # 3. Molecules (分子)
│ │ ├── form-field.tsx # (例: Label + Input + ErrorMessage)
│ │ └── ...
│ ├── organisms/ # 4. Organisms (有機体)
│ │ ├── login-form.tsx # (例: ログインフォーム機能全体)
│ │ ├── team-edit-form.tsx
│ │ ├── scoreboard-operator.tsx # (例: モニター操作画面機能)
│ │ └── ...
│ ├── templates/ # 5. Templates (テンプレート)
│ │ ├── auth-layout.tsx # (例: 認証画面用レイアウト)
│ │ ├── main-layout.tsx # (例: ダッシュボード用レイアウト)
│ │ └── ...
│
├── hooks/ # 共有カスタムフック
│ ├── use-presentation.ts
│ └── ...
│
├── lib/ # ライブラリ / ユーティリティ
│ ├── firebase/ # Firebase (クライアントSDK)
│ │ └── client.ts
│ ├── firebase-admin/ # Firebase (Admin SDK)
│ │ └── server.ts
│ ├── query-provider.tsx# TanStack QueryのProvider
│ └── utils.ts # cn()関数, フォーマッター等
│
├── queries/ # TanStack Queryのフック定義
│ ├── use-matches.ts
│ └── use-teams.ts
│
├── store/ # Zustandのストア定義
│ ├── use-auth-store.ts
│ └── ...
│
├── types/ # Zodスキーマと型定義
│ ├── team.schema.ts
│ └── match.schema.ts
│
└── functions/ # Firebase Cloud Functions
└── ...

````

### 2. コンポーネントの責務分離原則
#### ① Pages (`app/` ディレクトリ)

**役割**: Next.jsのルーティングエントリーポイント

**責務**:
- デフォルトは Server Component とする
- データフェッチ（TanStack Queryのサーバー側実行やAdmin SDK）を行い、データを準備する
- 取得したデータを Templates または Organisms コンポーネントに渡す

**禁止事項**:
- `"use client"` を持たない（インタラクティブな部分はOrganisms以下で行う）
- 複雑なJSX構造やビジネスロジックを直接記述しない

#### ② Templates (`components/templates/`)

**役割**: ページのレイアウト構造（骨格）を定義する

**責務**:
- Header, Footer, Sidebar などの Organisms を配置する
- `children` props を使って、具体的な内容（Organisms や Pages から渡される要素）を受け取る

**禁止事項**:
- データフェッチやビジネスロジック（useQueryなど）を直接含まない
- アプリケーションの状態（Zustandなど）に依存しない

#### ③ Organisms (`components/organisms/`)

**役割**: アプリケーションの具体的な機能を提供する、自己完結した複合コンポーネント

**責務**:
- Molecules や Atoms を組み合わせて、一つの機能単位（例: 選手登録フォーム全体）を構築する
- ビジネスロジックと状態（TanStack Queryでのデータ取得・更新、Zustandの利用、react-hook-formの使用）をカプセル化する
- 必要に応じて、`"use client"` を宣言する（例: `LoginForm.tsx` はインタラクティブなので `"use client"` が必要）

**例**: `TeamEditForm`, `ScoreboardOperator`, `MatchListTable`

#### ④ Molecules (`components/molecules/`)

**役割**: 複数の Atoms を組み合わせた、再利用可能な小さな部品

**責務**:
- 一つの小さな機能（例: ラベルと入力欄をまとめたフォームフィールド）を提供する

**禁止事項**:
- TanStack Query や Zustand などのアプリケーション全体の状態に依存しない
- 複雑なビジネスロジックを持たない

**`"use client"`**: 内部で `useState` を使うなど、インタラクティブ性が必要な場合は `"use client"` を宣言してよい

#### ⑤ Atoms (`components/atoms/`)

**役割**: これ以上分割できない最小のUI要素

**責務**:
- Shadcn/ui によってインストールされたコンポーネント（`button.tsx`, `input.tsx` など）がここに配置される
- 状態を持たず、propsのみで見た目が変わる

**`"use client"`**: Shadcn/ui のコンポーネントは、内部でインタラクティブ性を必要とするため、多くが `"use client"` を含みます（これはルール上OK）

### 3. 状態管理の厳格な分離
#### ① サーバー状態 (TanStack Query)

**対象**: Firestoreから取得するすべてのデータ

**ルール**:
- Organisms 層（または`app/`でのサーバーフェッチ）で呼び出す
- `queries/` 配下に定義したカスタムフックを経由して行う
- Molecules, Atoms, Templates 層での直接呼び出しを禁止する

#### ② グローバルクライアント状態 (Zustand)

**対象**: サーバーと無関係な、複数の Organisms 間で共有するUIの状態

**ルール**:
- `store/` で定義し、主に Organisms 層で利用する
- TanStack Query で取得したデータを Zustand に入れ直すことを原則禁止する

#### ③ ローカルクライアント状態 (useState / useReducer)

**対象**: 単一コンポーネントで完結する状態

**ルール**:
- Molecules または Organisms の内部で使用する（例: ダイアログの開閉状態）

**特例**: 「モニター操作画面」（`ScoreboardOperator` Organism）は、設計書に基づき `useReducer` を活用してローカル状態を管理し、`postMessage` で別ウィンドウに送信する

### 4. Next.js 16対応ルール

#### ① Dynamic Route Parameters (params) の扱い

**重要**: Next.js 16では、動的ルートの`params`がPromiseオブジェクトになりました。

**必須対応**:
- ページコンポーネント（`page.tsx`）では、`params`を`await`で展開する
- API Routes（`route.ts`）では、`params`を`await`で展開する
- レイアウトコンポーネント（`layout.tsx`）でも同様に対応する

#### 実装例:

```typescript
// ✅ ページコンポーネントの正しい書き方
interface PageProps {
  params: Promise<{ id: string; category: string }>;
}

export default async function MyPage({ params }: PageProps) {
  const { id, category } = await params;
  // ...
}

// ✅ API Routeの正しい書き方
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}

// ❌ 古い書き方（Next.js 15以前）
interface PageProps {
  params: { id: string; category: string }; // ❌ Promiseではない
}

export default function MyPage({ params }: PageProps) {
  const { id, category } = params; // ❌ awaitなし
  // ...
}
```

#### ② 既存コンポーネント・関数の重複チェック

**ルール**: 新しい関数やコンポーネントを作成する前に、必ず既存のコードベースを確認する

**確認手順**:
1. `file_search`ツールで類似の名前やファイルが存在しないか検索
2. `grep_search`ツールで同じ機能の実装がないか確認
3. 既存のutilsフォルダ（`src/lib/utils/`）に同等の機能がないか確認
4. 同じ責務を持つコンポーネントがAtomic Design階層に存在しないか確認

```bash
# 例: 日付フォーマット関数を作る前の確認
file_search "**/utils/**date*"
grep_search "formatDate|toLocaleDateString" true
```

**重複発見時の対応**:
- 既存の実装を使用し、必要に応じてパラメータや戻り値の型を拡張する
- 既存実装が不十分な場合は、新規作成ではなく既存を改善する
- やむを得ず新規作成する場合は、明確な命名差別化と用途の違いをコメントで説明する

## 🔒 型安全性ルール (Zod-First)

### 5. Zodスキーマによる型定義

**ルール**:
- すべての主要なデータ構造（Team, Match, Player）は、まず `src/types/` 配下に Zodスキーマ (`.schema.ts`) として定義する
- TypeScriptの型は、`z.infer<typeof aSchema>` を使ってZodスキーマから自動導出する。手動で `interface` や `type` を書くことを原則禁止する
- `any` 型の使用は、いかなる理由があっても完全禁止する

#### 実装例 (`src/types/team.schema.ts`):

```typescript
import { z } from 'zod';

// 1. Zodスキーマを定義 (これがSSoT)
export const playerSchema = z.object({
  playerId: z.string().uuid(),
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  displayName: z.string(),
});

export const teamSchema = z.object({
  teamId: z.string(),
  teamName: z.string().min(1, "チーム名は必須です"),
  representativeEmail: z.string().email("メールアドレスの形式が正しくありません"),
  players: z.array(playerSchema),
  isApproved: z.boolean().default(false),
  submittedAt: z.any(), // (注: FirestoreのTimestamp型はzod-firebase等で別途対応)
});

// 2. TypeScriptの型を自動導出
export type Player = z.infer<typeof playerSchema>;
export type Team = z.infer<typeof teamSchema>;
````

### 6. フォームとバリデーション

**ルール**:

- すべてのフォームは `react-hook-form` を使用する
- バリデーションは `zodResolver` を使用し、`src/types/` で定義したZodスキーマを接続する

#### 実装例:

```typescript
// features/team-management/TeamEditForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchema, type Team } from "@/types/team.schema";

export function TeamEditForm() {
  const form = useForm<Team>({
    resolver: zodResolver(teamSchema), // Zodスキーマを接続
    defaultValues: {
      teamName: "",
      players: [],
      // ...
    },
  });
  // ...
}
```

## 🎨 UI & コーディングスタイル

### 7. React インポートルール

**ルール**: 現代のReactでは、必要なフックやコンポーネントのみを個別にインポートすることを必須とする

#### ✅ 推奨される書き方:
```typescript
// ✅ 使用するフックのみを個別にインポート
import { useState, useEffect, useCallback } from "react";

const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // ...
  }, []);
  
  return <div>{count}</div>;
};
```

#### ❌ 非推奨の書き方:
```typescript
// ❌ すべてをReactオブジェクトとしてインポート（非推奨）
import * as React from "react";

const MyComponent = () => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    // ...
  }, []);
  
  return <div>{count}</div>;
};
```

#### 例外: React オブジェクトが必要な場合
以下の機能を使用する場合は、`import React from "react";` を使用する:
- `React.memo`
- `React.forwardRef`
- `React.Children`
- `React.createElement` (手動使用時)

```typescript
// ✅ React オブジェクトが必要な場合の正しいインポート
import React from "react";
import { useState } from "react";

const MyComponent = React.memo(() => {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
});
```

### 8. Shadcn/ui と Tailwind CSS

**ルール**:

- UIコンポーネントは `components/ui/` にインストールされた Shadcn/ui のコンポーネントを最優先で使用する
- スタイリングはTailwind CSSのユーティリティクラスのみを使用する。CSS-in-JSや styled-components の使用を禁止する
- クラス名の結合には `src/lib/utils.ts` の `cn()` 関数（clsx + tailwind-merge）を必須で利用する
- アイコンは `lucide-react` を標準とする

### 8. ファイル・変数命名規則

- **コンポーネント**: `PascalCase.tsx`
- **フック**: `useCamelCase.ts` (例: `useMatches.ts`)
- **Zustandストア**: `useCamelCaseStore.ts` (例: `useAuthStore.ts`)
- **Zodスキーマ**: `camelCase.schema.ts` (例: `team.schema.ts`)
- **ユーティリティ**: `camelCase.ts` (例: `utils.ts`)

### 9. インポート順とエイリアス

**ルール**:

- インポートは絶対パスエイリアス（`@/`）を必須とする。相対パス（`../`）は同一featuresフォルダ内など最小限に留める
- `index.ts`（Barrelファイル）は、App RouterのTree Shakingとの相性が悪いため、作成を禁止する

## 🔥 Firebase & Backendルール

### 10. Firebase SDKの使い分け

#### firebase (クライアントSDK):

- `src/lib/firebase/client.ts` で初期化する
- `"use client"` が付いたClient Componentでのみ使用可能（Auth, Firestoreの読み書き）
- データ取得はTanStack Queryフック経由で行うこと

#### firebase-admin (Admin SDK):

- `src/lib/firebase-admin/server.ts` で初期化する
- Server Components, Route Handlers, Cloud Functions でのみ使用可能
- クライアント側にバンドルされることを厳禁とする

### 11. データ層アーキテクチャ (ドメイン駆動設計)

Firebaseとの接続において、以下の3層アーキテクチャによる関心の分離を徹底する：

#### ドメイン層 (`src/domains/`)

**役割**: ビジネスロジックと型定義を管理する最重要層

**責務**:
- `src/types/` のZodスキーマから導出された型定義をドメインエンティティとして扱う
- ビジネスルール（例: 反則状態の変更による得点の自動計算）をドメインサービスとして定義する
- Firebase特有の実装に依存しない、純粋なビジネスロジックのみを含む

**ディレクトリ構造**:
```
src/domains/
├── team/
│   ├── entities/ # Team, Playerエンティティ
│   └── services/ # displayName生成ロジック等
├── match/
│   ├── entities/ # Matchエンティティ
│   └── services/ # 得点計算、反則処理ロジック等
└── tournament/
    ├── entities/ # Tournamentエンティティ
    └── services/ # 大会関連ビジネスロジック
```

#### データ層 (`src/data/`)

**役割**: Firebase特有のデータ変換とCRUD操作を担当

**責務**:
- Firestoreドキュメント ↔ ドメインエンティティ間の変換（マッピング）
- Firebase Timestamp, DocumentReference等の特殊型の処理
- Firestore特有のクエリ操作（コレクション参照、where句、orderBy等）
- エラーハンドリングとFirebaseエラーの標準化

**ディレクトリ構造**:
```
src/data/
├── mappers/ # ドメインエンティティ ↔ Firestoreドキュメント変換
│   ├── team-mapper.ts
│   ├── match-mapper.ts
│   └── tournament-mapper.ts
└── firebase/ # Firebase直接操作層
    ├── collections.ts # コレクション参照定数
    ├── team-data.ts   # チーム関連のCRUD
    ├── match-data.ts  # 試合関連のCRUD
    └── tournament-data.ts # 大会関連のCRUD
```

#### リポジトリ層 (`src/repositories/`)

**役割**: データアクセスの抽象化とTanStack Queryとの橋渡し

**責務**:
- ドメイン層が要求するインターフェースを実装
- データ層を呼び出し、ドメインエンティティを返す
- TanStack Queryのキー管理とキャッシュ戦略の定義
- 複数のデータソースを組み合わせた複合的なデータ取得

**ディレクトリ構造**:
```
src/repositories/
├── interfaces/ # ドメイン層が期待するインターフェース定義
│   ├── team-repository.interface.ts
│   ├── match-repository.interface.ts
│   └── tournament-repository.interface.ts
└── implementations/ # 具体的な実装
    ├── firebase-team-repository.ts
    ├── firebase-match-repository.ts
    └── firebase-tournament-repository.ts
```

#### 層間の依存関係ルール

1. **ドメイン層**: 他の層に依存しない（完全に独立）
2. **リポジトリ層**: ドメイン層のインターフェースに依存、データ層を利用
3. **データ層**: ドメイン層のエンティティに依存、Firebase SDKを利用
4. **コンポーネント層**: リポジトリ層のインターフェースに依存

#### TanStack Queryとの統合ルール

- `queries/` 配下のカスタムフックは、リポジトリ層のメソッドを呼び出す
- リポジトリ層は、TanStack Queryのキー生成とキャッシュ無効化の責任を持つ
- 各リポジトリは、対応するQueryキーファクトリーを提供する

#### 実装例:

```typescript
// src/domains/match/entities/match.ts
export type Match = z.infer<typeof matchSchema>;

// src/domains/match/services/score-calculator.ts
export class ScoreCalculator {
  static calculateScoreFromHansoku(hansokuState: HansokuState): number {
    // Firebase非依存の純粋なビジネスロジック
  }
}

// src/repositories/interfaces/match-repository.interface.ts
export interface MatchRepository {
  findById(matchId: string): Promise<Match>;
  updateScore(matchId: string, score: MatchScore): Promise<void>;
}

// src/repositories/implementations/firebase-match-repository.ts
export class FirebaseMatchRepository implements MatchRepository {
  constructor(private matchData: MatchData) {}
  
  async findById(matchId: string): Promise<Match> {
    const doc = await this.matchData.getMatch(matchId);
    return MatchMapper.toDomain(doc);
  }
}

// src/queries/use-matches.ts
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchRepository.findById(matchId)
  });
}
```


### 11. Cloud Functions (Backend Logic)

**ルール**:

- 設計書にある「メール送信」「displayName生成」「matches同期」ロジックは、すべて `functions/` ディレクトリ内のCloud Functionsで実装する
- フロントエンド（Next.js）は、これらのロジックを直接実行せず、Firestoreのトリガー（`onUpdate`, `onCreate`）経由で実行されるのを待つ

### 12. セキュリティルール

**ルール**:

- Firestoreの `firestore.rules` にて、厳格なセキュリティルールを定義する
- `"allow read, write: if true;"` のような設定を本番環境に残すことを厳禁とする

**例**:

- `matches`は認証ユーザーのみ書き込める
- `teams`は`isApproved`フィールドをユーザーが変更できない、など

## 🚀 パフォーマンス最適化

### 13. Server Componentsの徹底活用

**ルール**:

- パフォーマンス最適化の第一手段は、可能な限りServer Component（デフォルト）にすることである
- `React.memo` や `useCallback` の使用は、Client Component内での不要な再レンダリングが明確に計測された場合のみに限定する

### 14. TanStack QueryとZustandの最適化

**ルール**:

- TanStack Query のキャッシュ（`staleTime`）を適切に設定し、不要なFirestoreへのリクエストを削減する
- Zustand のストアを購読する際は、必ずセレクタ（`useMyStore(state => state.value)`）を使用し、ストア全体の変更による不要な再レンダリングを防ぐ

### 15. Next.js標準機能の活用

**ルール**:

- 画像は `next/image` を使用する
- フォントは `next/font` を使用する

## 🤖 AI協調開発ルール

### AIへの指示出し

AIにコード生成を依頼する際は、必ずこのドキュメントのルールを前提とするよう指示する。

### 明確なコンテキスト指定

以下の点を必ず明確に指定する:

- **コンポーネントの種類**: 「Server Component」か「Client Component (`"use client"`)」か
- **状態管理**: 「TanStack Queryでフェッチする」か「Zustandストアから読み取る」か「useStateで管理する」か
- **UI**: 「Shadcn/ui の Card と Button を使って」
- **型**: 「`src/types/team.schema.ts` の Team 型を使用して」
