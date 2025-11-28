# コードレビュー結果とリファクタリング計画

## 1. 優先度: 高 (High)

### 1-1. `MatchActionMenu` の `shadcn/ui` への置き換え
- **現状**: `useState` と `useEffect` を使用して独自のドロップダウンメニューを実装しています。
- **問題点**: アクセシビリティや保守性の観点から、プロジェクト標準の `shadcn/ui` (`DropdownMenu`) を使用すべきです。`CODING_RULES.md` の「UIはShadcn/uiのコンポーネントをベースに構築」というルールにも従います。
- **対応**: `src/components/molecules/match-action-menu.tsx` を `DropdownMenu` コンポーネントを使用して書き換えます。

### 1-2. `useMatchAction` における重複ロジックの共通化
- **現状**: `handleConfirmMatchExecute` と `handleSpecialWin` 内で、`teamMatches` をローカル更新して `groupMatches` を生成するロジックが完全に重複しています。
- **問題点**: コードの保守性が低く、修正漏れのリスクがあります。
- **対応**: このロジックを `createUpdatedGroupMatches` のような関数として切り出し、共通化します。

## 2. 優先度: 中 (Medium)

### 2-1. `TeamMatchEditDialog` の定数とロジックの分離
- **現状**: `scoreOptions` がコンポーネント内に定義されています。また、`handleSave` と `executeReset` で保存用オブジェクトの生成ロジックが重複しています。
- **対応**:
    - `scoreOptions` を定数ファイル (`src/lib/constants.ts` または `src/lib/ui-constants.ts`) に移動します。
    - 保存用オブジェクト生成ロジックをヘルパー関数に切り出します。

### 2-2. `useMonitorStore` からのビジネスロジック分離
- **現状**: `setPlayerHansoku` 内に、反則による相手スコアの計算や試合終了判定などのビジネスロジックが含まれています。
- **問題点**: ストアは状態管理に専念すべきであり、ビジネスロジックはドメイン層に置くべきです。
- **対応**: `src/domains/match/match-logic.ts` 等にロジックを移動し、ストアからはそれを呼び出す形にします。

## 3. 優先度: 低 (Low)

### 3-1. `SearchableSelect` の使用状況確認
- **現状**: `TeamMatchEditDialog` では標準の `<select>` に置き換えられましたが、`match-row.tsx`, `match-group-row.tsx`, `rep-match-setup-dialog.tsx`, `team-match-row.tsx`, `tournament-form.tsx` 等でまだ使用されています。
- **対応**: 今回のスコープでは削除しませんが、将来的には統一を検討します。

### 3-2. 動的インポートの確認
- **現状**: `useTeamMatchController` 内で `import(...)` を使用しています。
- **対応**: バンドルサイズ削減の意図であれば正しいですが、可読性を考慮し、必要に応じてトップレベルインポートへの変更を検討します。
