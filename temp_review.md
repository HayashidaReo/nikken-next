# コードレビュー & リファクタリング計画 (fix/new-match-db)

`develop` ブランチと `fix/new-match-db` ブランチの差分に基づき、コーディングルールおよび設計原則に照らし合わせたレビュー結果とリファクタリング案をまとめました。

## 優先度: 高 (High)

### 1. 定数の管理 (Hardcoded Strings)
**対象ファイル**:
- `src/components/organisms/team-match-setup-table.tsx`
- `src/components/molecules/team-match-row.tsx`

**問題点**:
「先鋒」「次鋒」「中堅」「副将」「大将」「代表戦」といった文字列がコンポーネント内にハードコーディングされています。これらはビジネスロジックに関わる重要な定数であり、分散していると保守性が低下します。

**改善案**:
`src/lib/constants.ts` に `TEAM_MATCH_ROUNDS` 定数を定義し、各コンポーネントから参照するように変更してください。

```typescript
// src/lib/constants.ts
export const TEAM_MATCH_ROUNDS = ["先鋒", "次鋒", "中堅", "副将", "大将", "代表戦"] as const;
```

### 2. SyncServiceの責務分割 (Complexity) - [Completed]
**対象ファイル**:
- `src/services/sync-service.ts`

**問題点**:
`downloadTournamentData` メソッドが肥大化しています。データの取得、種別による分岐、ローカルDBへの保存（トランザクション処理）が1つのメソッドに詰め込まれており、可読性とテスタビリティが低下しています。

**改善案**:
以下のプライベートメソッドに分割することを推奨します。
- `fetchFromFirestore(orgId, tournamentId)`: Firestoreからのデータ取得ロジック
- `saveToLocalDB(data)`: ローカルDBへの保存ロジック

**対応状況**:
- `fetchFromFirestore` と `saveToLocalDB` ヘルパー関数を作成し、`downloadTournamentData` から呼び出すようにリファクタリングしました。

## 優先度: 中 (Medium)

### 3. DashboardPageのロジック分離 (Architecture) - [Completed]
**対象ファイル**:
- `app/(auth)/dashboard/page.tsx`

**問題点**:
`DashboardPage` コンポーネント内に、データ取得、ローディング判定、エラーハンドリング、ダウンロード処理などのロジックが混在しています。ViewとLogicの分離が不十分です。

**改善案**:
これらのロジックをカスタムフック `useDashboardLogic` (または `useDashboard`) に切り出し、コンポーネントはUIの描画に専念させるべきです。

**対応状況**:
- `src/hooks/useDashboard.ts` を作成し、ロジックを移動しました。
- `DashboardPage` は `useDashboard` フックを使用するようにリファクタリングされ、UIの責務に集中するようになりました。

### 4. エラーハンドリングの強化 (Robustness)
**対象ファイル**:
- `src/services/sync-service.ts` (`uploadResults`)

**問題点**:
`uploadResults` メソッド内で `Promise.allSettled` を使用していますが、失敗時のエラーログ出力 (`console.error`) がループ内で行われているのみです。ユーザーに「何件失敗したか」は伝わりますが、詳細なエラー内容やリトライの可否が不明確になる可能性があります。

**改善案**:
エラー情報を収集し、呼び出し元に詳細なレポート（成功件数、失敗件数、失敗したIDと理由のリスト）を返す構造にすることを検討してください。

## 優先度: 低 (Low)

### 5. 型定義の厳密化 (Type Safety)
**対象ファイル**:
- `src/hooks/useMatchDataWithPriority.ts`

**問題点**:
`matchWithCourt` の生成時に `as unknown as Match` というキャストが行われています。これは `any` よりはマシですが、型安全性を完全に保証するものではありません。

**改善案**:
`Match` 型と `TeamMatch` 型の共通部分や、`courtId` の扱いについて、より適切な型定義（Intersection Typesなど）を用いて、キャストなしで扱えるように設計を見直すことが望ましいです。

---

## まとめ

全体的に「Server Components First」や「Zod-First」のルールは守られていますが、機能追加に伴い一部のコンポーネントやサービスが肥大化しています。特に「定数の共通化」と「SyncServiceのリファクタリング」は、今後の保守性を高めるために早めの対応を推奨します。
