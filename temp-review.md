# コードレビュー結果: feature/next-monitor

お疲れ様です。実装を確認しました。
全体的に `CODING_RULES.md` に従い、Atomic Design や Zustand を活用した設計がなされており、品質は高いです。特に `useMonitorStore` での状態管理の分離や、`ScoreboardOperator` のコンポーネント分割は適切に行われています。

しかし、ベテランの視点から見ると、**「Pageコンポーネントへの責務の集中」**と**「ドメインロジックの散在」**が懸念点として挙げられます。これらは将来的な保守性やテスト容易性を下げる要因となるため、リファクタリングを強く推奨します。

以下に詳細なレビュー内容と、優先度順のリファクタリング項目をまとめました。

## 🔍 レビュー詳細

### 1. Pageコンポーネントの肥大化 (`app/(auth)/monitor-control/[matchId]/page.tsx`)
- **現状**: 500行を超えており、データ取得、画面遷移、保存処理、勝敗判定ロジック、UI描画が混在しています。
- **問題点**: 「God Component」化しており、可読性が低く、ロジックの単体テストが困難です。
- **改善案**: カスタムフックへのロジック抽出と、UI部品のコンポーネント化が必要です。

### 2. ドメインロジックの散在
- **現状**: `handleShowTeamResult` 内で、勝敗判定や引き分けのロジックが直接記述されています。
- **問題点**: 同じロジックが `match-result-view.tsx` など他の場所でも必要になる可能性があり、仕様変更時に修正漏れが発生します。
- **改善案**: `src/domains/match/match-logic.ts` に `determineWinner` などの関数として集約すべきです。

### 3. タイマーロジックの分離 (`ScoreboardOperator`)
- **現状**: `useEffect` 内で `setInterval` を直接管理しています。
- **問題点**: コンポーネントの再レンダリングとタイマーの精度が密結合しています。
- **改善案**: `useGameTimer` のようなカスタムフックに切り出すことで、ロジックを純粋にし、テストしやすくします。

### 4. 同期サービスの型安全性 (`src/services/sync-service.ts`)
- **現状**: `saveToLocalDB` で `@ts-expect-error` が使用されています。
- **問題点**: 型安全性が損なわれています。
- **改善案**: 適切な型定義を行うか、Dexieのトランザクション処理をラップするヘルパー関数を作成して型を保証すべきです。

---

## 🛠 リファクタリング項目 (優先度順)

### 1. Pageコンポーネントのロジック抽出 (High)
`MonitorControlPage` から、以下のロジックをカスタムフック `useMonitorController` (または `useTeamMatchController`) に抽出してください。
- 団体戦の勝敗計算ロジック (`handleShowTeamResult`)
- 次の試合への遷移ロジック (`handleNextMatch`)
- 保存処理 (`handleSave`)

### 2. ドメインロジックの集約 (High)
`src/domains/match/match-logic.ts` に以下の関数を追加し、Pageコンポーネントから呼び出すように変更してください。
- `determineWinner(playerAScore, playerBScore, isCompleted): Winner`
- `calculateTeamMatchResult(matches): TeamWinner`

### 3. Header UIのコンポーネント化 (Medium)
`MonitorControlPage` のヘッダー部分（戻るボタン、接続ステータス、各種操作ボタン）を `MonitorControlHeader` コンポーネントとして `components/organisms` に切り出してください。これによりPageコンポーネントの見通しが良くなります。

### 4. タイマーロジックのカスタムフック化 (Low)
`ScoreboardOperator` 内の `setInterval` 処理を `src/hooks/useGameTimer.ts` に抽出してください。

### 5. 不要なコードの削除 (Low)
`src/components/organisms/scoreboard-operator.tsx` の `useEffect` で `useMonitorSender` を呼んでいますが、これは `useMonitorStore` のミドルウェア的アプローチか、専用のフック (`useMonitorSync`など) にまとめる方が綺麗かもしれません。現状は許容範囲ですが、検討してください。
