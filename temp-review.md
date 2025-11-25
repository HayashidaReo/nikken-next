# コードレビュー結果 (fix/db-relation)

## 概要
`develop` ブランチと `fix/db-relation` ブランチの差分を確認しました。
主な変更点は、**データ構造の正規化（Normalization）**です。
これまでは `matches` コレクション内に `round`（回戦名）、`teamName`、`displayName` などの表示用データを重複して持っていましたが、今回の変更でこれらを `roundId`, `teamId`, `playerId` などのID参照に変更し、表示時に解決する設計へ移行しています。

これは「単一の信頼できる情報源 (SSoT)」の原則に沿った適切な変更であり、データの整合性を保つ上で非常に重要です。

## レビュー詳細

### 1. 設計とアーキテクチャ
- **評価: 良**
- データの正規化が行われ、Firestoreのデータ構造がスリム化されました。
- `MonitorStore` や `MatchListTable` などで、IDから名前を解決するロジックが追加されています。
- `src/lib/utils/player-directory.ts` などのユーティリティに解決ロジックが切り出されている点は評価できます。

### 2. 型安全性
- **評価: 良**
- `zod` スキーマが更新され、`round` が `roundId` に変更されるなど、実態に即した型定義になっています。
- `any` 型の混入は見当たりませんでした。

### 3. コンポーネント構造
- **評価: 要改善 (Prop Drilling)**
- データの正規化に伴い、各コンポーネントで「名前解決」のために `teams` や `rounds` などのマスタデータを親から子へバケツリレー（Prop Drilling）している箇所が多数見受けられます。
- 例: `DashboardContent` -> `MatchListTable` -> `MatchRow` と `teams` 配列が渡されています。

### 4. パフォーマンス
- **評価: 注意**
- `teams` 配列（全チームデータ）を全ての行コンポーネントに渡しているため、チーム数が増えた場合にレンダリングコストが増加する懸念があります。
- ID解決のたびに `find` メソッドが走る実装になっている箇所があり、計算量が $O(N)$ になっています。Map化して $O(1)$ にすべきです。

## リファクタリング提案

今回の変更は方向性として正しいですが、実装詳細において最適化の余地があります。
以下の優先順位でリファクタリングを提案します。

### 優先度: 高 (Must)

1. **マスタデータのContext化 / フック化**
   - **問題**: `teams`, `rounds`, `courts` などのマスタデータが、`DashboardContent` から末端の `MatchRow` までProp Drillingされている。
   - **解決策**: これらを `MasterDataProvider` のようなContext、または `useMasterData()` のようなカスタムフック（TanStack Queryのキャッシュ活用）経由で、必要なコンポーネントが直接取得できるようにする。これにより、中間のコンポーネントから不要なPropsを削除できる。

2. **ID解決ロジックの高速化 (Map化)**
   - **問題**: `getRoundName` や `getTeamName` などで、毎回配列を `find` している。
   - **解決策**: `teams` や `rounds` を配列ではなく、`Map<Id, Data>` 形式（またはオブジェクト）で管理する、あるいは `useMemo` でLookup Tableを作成する。
   - 例: `const teamMap = useMemo(() => new Map(teams.map(t => [t.teamId, t])), [teams]);`

### 優先度: 中 (Should)

3. **`useMatchDataWithPriority` の整理**
   - **問題**: データの取得と結合ロジックが複雑化している可能性がある。
   - **解決策**: データ取得（Query）と、データの結合（ID解決）を明確に分離する。Select系フック（`useMatchesWithNames`）を作成し、そこで結合ロジックをカプセル化する。

4. **不要なコードの削除**
   - **問題**: 旧 `round` (string) フィールドを参照していた古いロジックや、使われなくなったMapper関数が残っている可能性がある。
   - **解決策**: `grep` で `round` (stringとして使われている箇所) や `displayName` (matches内の) を検索し、完全に削除されているか再確認する。

### 優先度: 低 (Nice to have)

5. **表示用コンポーネントの分離**
   - **問題**: `MatchRow` 内でID解決ロジックと表示ロジックが混在している。
   - **解決策**: `<TeamNameDisplay teamId={id} />` のような、IDを受け取って名前を表示するだけの小さなコンポーネントを作成する。これにより、親コンポーネントがマスタデータを持つ必要がなくなる（このコンポーネント内で `useMasterData` すればよい）。

---
以上です。
まずはこの変更をマージし、その後上記のリファクタリングタスクを順次実行することを推奨します。
