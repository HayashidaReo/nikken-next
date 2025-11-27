# コードレビュー結果

`CODING_RULES.md` および一般的なシステム開発の観点に基づき、`feature/match-result` ブランチのコードレビューを行いました。
`REVIEW_PERSPECTIVES.md` は確認できませんでしたが、機能要件、保守性、パフォーマンスの観点から重点的に確認しています。

## 概要
団体戦の結果表示機能（`MonitorGroupResults`）の実装に伴い、モニター表示周りのロジックが大きく変更されています。
しかし、既存の個人戦の結果表示機能への考慮が漏れており、機能退行が発生している可能性が高いです。また、一部ロジックの重複も見受けられます。

## リファクタリング項目

### 1. 【重要】個人戦の結果表示機能の復元と分岐処理の実装
**現状の問題点:**
- `src/components/organisms/match-result-view.tsx` が削除され、`MonitorDisplayContainer` や `MonitorPreview` で `MonitorGroupResults` に置き換えられています。
- `MonitorGroupResults` は `groupMatches` データに依存しており、個人戦（`groupMatches` が空）の場合、何も表示されないか、空のコンポーネントが表示される状態になっています。
- `useMatchAction.ts` では個人戦でも `setViewMode("match_result")` を実行しているため、個人戦終了時に画面が真っ白になる可能性があります。

**改善案:**
- 削除された `MatchResultView` を復元（または同等の機能を持つコンポーネントを再作成）してください。
- `MonitorDisplayContainer`、`MonitorPreview`、`MonitorDisplay` において、`viewMode === "match_result"` の際に、`groupMatches` の有無や大会種別（`activeTournamentType`）に応じて、個人戦用の表示と団体戦用の表示（`MonitorGroupResults`）を切り替えるロジックを実装してください。

### 2. 【中】データ変換ロジックの共通化（DRY原則）
**現状の問題点:**
- `src/hooks/useMatchAction.ts` と `src/components/organisms/team-match-list-table.tsx` の両方に、`TeamMatch[]` から `MonitorData["groupMatches"]` 形式へ変換する全く同じロジック（map, filter, sort, 勝者判定）が存在しています。
- 将来的に変換ロジックに変更があった場合、修正漏れの原因となります。

**改善案:**
- この変換ロジックを `src/domains/match/match-logic.ts` または `src/lib/utils/match-utils.ts` に関数として切り出してください。
- 例: `export function createMonitorGroupMatches(matches: TeamMatch[], currentMatchGroupId: string, playerDirectory: PlayerDirectory): MonitorGroupMatch[]`

### 3. 【低】`VerticalText` コンポーネントの最適化
**現状の問題点:**
- `src/components/atoms/vertical-text.tsx` 内でフォントサイズ調整のために `setTimeout` を使用しています。
- これにより、レンダリング直後に一瞬レイアウトが崩れたり、ちらつきが発生する可能性があります。また、Reactのレンダリングサイクルと非同期処理のタイミングによっては不安定になる可能性があります。

**改善案:**
- `setTimeout` の代わりに `useLayoutEffect` を使用して、ブラウザの描画前にサイズ計算を行うことを検討してください。
- または、CSSの `container-type` や `svg` を利用したスケーリングなど、JS計算に依存しない方法も検討の余地があります（ただしブラウザ互換性に注意）。

### 4. 【低】型定義の厳格化
**現状の問題点:**
- `MonitorData` 型定義において `groupMatches` が `optional` ですが、コンポーネント側では `NonNullable` や空配列へのフォールバックで対応しています。
- `viewMode` が `match_result` の場合、どのようなデータが必須であるかが型レベルで表現されていません。

**改善案:**
- 可能であれば、`viewMode` とデータの関係を Discriminated Union（判別可能な共用体）で定義し、型安全性を高めることを検討してください。
- 例: `viewMode: "match_result"` の時は `matchResult` が必須、など。

---
**総評:**
団体戦の結果表示という新しい要件は満たされていますが、既存機能（個人戦）への影響範囲の確認が不足しています。まずは項目1の修正を最優先で行い、機能退行を防ぐ必要があります。
