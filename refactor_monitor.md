# リファクタリング計画書 (feature/monitor vs develop)

`develop` ブランチと `feature/monitor` ブランチの差分を確認し、プロジェクトのコーディングルールおよびレビュー観点に基づいてリファクタリング項目を整理しました。

## 1. 設計とアーキテクチャ

### ① 責務分離とフックの抽出
- **対象**: `app/(auth)/monitor-control/[matchId]/page.tsx`
- **現状**: ページコンポーネント内に、Presentation API接続、フォールバックウィンドウ制御、データ取得（ストア優先ロジック）、UI表示ロジックが混在しており、肥大化している。
- **改善案**:
  - データ取得ロジック（ストア優先 or Firebase fetch）を `useMatchDataWithPriority` のようなカスタムフックに切り出す。
  - モニター接続制御（Presentation API + Fallback）を `useMonitorController` のようなカスタムフックに集約し、PageコンポーネントはUIの構成に集中させる。

### ② データ保存ロジックの分離
- **対象**: `src/store/use-monitor-store.ts` の `saveMatchResult`
- **現状**: Zustandストアのアクション内で直接 `fetch` を使用してAPIコールを行っている。
- **違反ルール**: データアクセスはRepository層またはTanStack Query（Mutation）を経由すべきであり、ストア内にAPIコールをハードコードするのは非推奨。
- **改善案**:
  - `useMatchResultMutation` のようなTanStack QueryのMutationフックを作成する。
  - コンポーネント（`MonitorControlPage` または `ScoreboardOperator`）からそのMutationを呼び出す形に変更し、ストアは純粋な状態保持のみに関心を持たせる。

### ③ BroadcastChannelロジックの集約
- **対象**: `src/components/organisms/scoreboard-operator.tsx` と `src/hooks/useFallbackMonitor.ts`
- **現状**: 両方のファイルで `BroadcastChannel` のインスタンス化とメッセージ送信/受信を行っている。
- **改善案**:
  - 送信ロジックを `useMonitorSender` フックとして切り出し、`ScoreboardOperator` から利用する。
  - これにより、通信手段（Presentation API / BroadcastChannel）の隠蔽と再利用性が向上する。

## 2. 型安全性

### ① `any` 型の排除
- **対象**:
  - `src/queries/use-tournaments.ts`: `tournament: any` が使用されている。
  - `src/components/molecules/form-input.tsx`: `register: any` が使用されている。
- **改善案**:
  - `src/types/` 配下のZodスキーマから導出した適切な型（`Tournament`型など）を適用する。
  - `react-hook-form` の `UseFormRegister<T>` を使用して型安全にする。

### ② マジックナンバーの排除
- **対象**: `src/store/use-monitor-store.ts`
- **現状**: `incrementFoulForSelectedPlayer` 内で反則の上限値 `4` がハードコーディングされている。
- **改善案**:
  - `src/lib/constants.ts` に `FOUL_CONSTANTS.MAX_FOUL` を定義し、それを使用する。

## 3. UIとコーディングスタイル

### ① コンポーネントの整理
- **対象**: `app/(auth)/monitor-display/page.tsx`
- **現状**: `setTimeout` を使用したステート更新の回避策が含まれている。
- **改善案**:
  - `useValidatePresentationToken` の実装を見直し、`useEffect` 内での副作用を適切に管理するか、ロジックを整理して `setTimeout` を不要にする。

## 4. 実行計画

以下の順序でリファクタリングを実施します。

1. **型安全性の確保**: `any` 型の修正と定数の定義。
2. **データアクセス層の分離**: `saveMatchResult` のMutation化。
3. **フックの抽出**: `useMatchDataWithPriority`, `useMonitorSender`, `useMonitorController` の作成。
4. **コンポーネントの適用**: 作成したフックをPageおよびOrganismsに適用。

---
**承認待ち**: この計画に基づいて実装を開始してよろしいでしょうか？