# リファクタリング提案レポート

現在の `feature/presentation-api` ブランチにおける変更内容を確認し、リファクタリング可能な項目をまとめました。

## 1. 不要なコードの削除

### `src/components/organisms/scoreboard-operator.tsx`
- **現状**: `FallbackMonitorDialog` コンポーネントとその制御用ステート (`showFallbackDialog`, `setShowFallbackDialog`)、およびハンドラー (`handleFallbackConfirm`, `handleFallbackCancel`) が定義されていますが、`setShowFallbackDialog(true)` を呼び出す箇所が存在しません。
- **提案**: これらは `monitor-control` ページ側で実装・制御されているため、`ScoreboardOperator` からは削除すべきです。

## 2. 処理の共通化

### モニター用データ（スナップショット）生成ロジック
- **現状**: `monitorData` オブジェクト（`matchId`, `playerA`, `score` 等を含むオブジェクト）の生成が以下の3箇所で個別に実装されており、重複しています。
  1. `app/(auth)/monitor-control/[matchId]/page.tsx` (`handleFallbackConfirm` 内)
  2. `src/components/organisms/scoreboard-operator.tsx` (`useEffect` および `handleFallbackConfirm` 内)
  3. `src/hooks/usePresentation.ts` (`handleConnect` および `message` リスナー内)
- **提案**: `useMonitorStore` 内に `getMonitorSnapshot()` のようなセレクタ関数またはヘルパー関数を作成し、一箇所で生成するように共通化します。これにより、将来フィールドが増えた際の修正漏れを防げます。

### 定数の管理
- **現状**: `BroadcastChannel` のチャンネル名 `"monitor-display-channel"` が複数のファイルにハードコードされています。
- **提案**: `src/lib/constants.ts` 等に定数として定義し、それを参照するようにします。

## 3. コメントの日本語化・改善

以下のファイルに含まれる英語のコメントを、プロジェクトの言語設定に合わせて日本語に翻訳し、必要に応じて意図を補足します。

- **`src/hooks/use-monitor-data.ts`**
  - `// If tokenData is provided...` -> トークンベース認証時の接続処理についての説明
  - `// Defer state updates...` -> レンダリングサイクルへの配慮についての説明
  - `// handle control messages...` -> 制御メッセージ処理についての説明

- **`app/(auth)/monitor-control/[matchId]/page.tsx`**
  - `// First, get a presentation token` -> プレゼンテーション用トークン取得処理
  - `// We need to request the token again...` -> フォールバック時のトークン再取得についての説明

- **`app/(auth)/monitor-display/page.tsx`**
  - `// No token provided...` -> トークンなし時の通常フローについての説明
  - `// Validate the presentation token` -> トークン検証処理についての説明

## 4. その他の改善点

- **`usePresentation` フック**
  - `registerGlobal` 引数によりグローバルストアへの登録を制御していますが、現状の使われ方を見ると設計意図は明確です。ただし、コメントで「なぜグローバル登録が必要か（オペレーター操作からの送信のため）」を明記しておくと可読性が向上します。

---

これらのリファクタリングを実施することで、コードの保守性が向上し、将来的な機能追加や修正が容易になります。
