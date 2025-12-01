# コードレビュー結果 (fix/iroiro)

`develop` ブランチと `fix/iroiro` ブランチの差分を確認し、リファクタリング項目をまとめました。
全体的に機能実装は進んでいますが、いくつかのファイルで責務が肥大化しており、保守性の観点からリファクタリングを推奨します。

## リファクタリング項目 (重要度順)

### 1. `SettingsMenu.tsx` の責務分割 (高)
現在、`SettingsMenu` コンポーネントが UI の表示だけでなく、同期処理の呼び出し、ダイアログの状態管理、ログアウト処理など多くの責務を負っています。

- **提案**:
  - 同期関連のロジック（未送信件数の取得、クラウド同期、データ送信）をカスタムフック `useSyncActions` に切り出す。
  - ダイアログの状態管理（`confirmDialog`, `unsyncedData`）を `useSettingsDialog` などのフックに分離する、またはダイアログコンポーネント自体に閉じ込める。
  - これにより、`SettingsMenu` は「メニューの表示と各アクションのトリガー」に集中できます。

### 2. `sync-service.ts` の構造化 (中)
`sync-service.ts` が単一のファイルで大会、試合、チーム、団体戦などすべてのエンティティの同期を扱っており、ファイルサイズが大きくなっています（約400行）。

- **提案**:
  - エンティティごとの同期ロジックを分離する（例: `MatchSyncService`, `TeamSyncService`）。
  - または、`sync-service.ts` 内でプライベート関数として定義されている各エンティティの処理を、より明確に分離・整理する。
  - `syncItems` 関数は汎用的で良い実装ですが、呼び出し元の `uploadResults` 関数が長くなりすぎています。

### 3. `useFirestoreSync.ts` の分割 (中)
`useFirestoreSync` フック内の `useEffect` が非常に長く、複数のコレクション（Tournaments, Matches, MatchGroups, Teams）の監視を一度に行っています。

- **提案**:
  - コレクションごとにフックを分割する（例: `useTournamentSync`, `useMatchSync`, `useTeamSync`）。
  - `useFirestoreSync` はそれらを束ねるだけのフックにする。
  - これにより、特定のデータの同期ロジックだけを修正したい場合に影響範囲を限定できます。

### 4. `UnsyncedDataDialog.tsx` のコンポーネント分割 (低)
`UnsyncedDataDialog` 内に `MatchItem`, `TeamItem`, `TournamentItem` などのコンポーネントがインラインで定義されています。

- **提案**:
  - これらのサブコンポーネントを `src/components/molecules/unsynced-data/` などのディレクトリを作成し、別ファイルに切り出す。
  - ダイアログのコードが見通しやすくなり、個々のアイテム表示の修正も容易になります。

### 5. 不要なコード・コメントの削除 (低)
- `src/hooks/useMatchAction.ts` に `// overrides: ...` のようなコメントがありますが、コード自体で意図が伝わるようにするか、JSDoc形式に統一すると良いでしょう。
- `src/components/molecules/settings-menu.tsx` の `// @ts-expect-error` は、可能な限り型定義を修正して解決すべきです（Lucide iconの型など）。

## その他気になった点

- **エラーハンドリング**: `sync-service.ts` でのエラーログ出力が `console.error` になっていますが、本番環境では適切なロギング基盤への送信を検討しても良いかもしれません。
- **型定義**: `src/lib/db.ts` からのインポートが多用されていますが、ドメイン層の型（`src/types/*.schema.ts`）との変換が各所で発生しています。Mapperの利用は徹底されていますが、変換コストに注意が必要です。

以上です。まずは `SettingsMenu` と `sync-service.ts` のリファクタリングから着手することをお勧めします。
