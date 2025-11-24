# リファクタリング計画 (feature/match-setting vs develop)

## 優先度: 高 (High)

### 1. Zodスキーマの厳格化と分離 (Type Safety)
- **現状**: `src/types/tournament.schema.ts` の `roundSchema` で `roundId` が `.optional()` となっている。これはフォーム入力時の便宜上（新規追加時はIDがないため）だが、データベース保存時やドメインモデルとしては `roundId` は必須であるべき。
- **修正案**:
  - `roundSchema` (DB/Domain用): `roundId` を必須 (`z.string()`) にする。
  - `roundInputSchema` (Form用): `roundId` をオプショナルにする、または `tournamentFormSchema` 内で `.omit({ roundId: true })` 等を使って定義する。
  - `tournamentSchema` は厳格な `roundSchema` を使用する。

### 2. ビジネスロジックの分離 (Architecture)
- **現状**: `src/hooks/useTournamentSettings.ts` の `handleSave` や `handleSyncConfirm` に、データの整形、ID生成、ローカルDB保存、APIコール、同期ロジックが混在している。
- **修正案**:
  - これらのロジックを `src/domains/tournament/services/` または専用のカスタムフック（例: `useTournamentSync` や `useTournamentPersistence`）に切り出す。
  - コンポーネント（フック）は「UIの状態管理」に集中し、「データの永続化ロジック」は分離する。

### 3. 重複ロジックの共通化 (DRY)
- **現状**: `CourtManager` と `RoundManager` に以下のロジックが重複している。
  - ドラッグ＆ドロップによる並び替え処理
  - ランダムID生成 (`Math.random()`)
  - 最大文字数チェックとToast表示
- **修正案**:
  - ドラッグ＆ドロップ: `useDraggableList` フックを作成して共通化。
  - ID生成: `src/lib/utils.ts` または `src/lib/utils/id-generator.ts` に `generateShortId()` のような関数を作成（`crypto.randomUUID()` または `nanoid` 推奨）。
  - バリデーション: `useInputValidation` フックや共通のハンドラーを作成。

## 優先度: 中 (Medium)

### 4. APIルートのタイムスタンプ処理 (Firebase Best Practice)
- **現状**: `app/api/tournaments/[orgId]/route.ts` で `createdAt`, `updatedAt` に `new Date()` を使用している。
- **修正案**: Firestore Admin SDK の `FieldValue.serverTimestamp()` を使用することで、サーバー時刻の整合性をより確実に保証する（ただし、クライアントでの即時表示との兼ね合いで `new Date()` のままにする場合は、その旨をコメントに残す）。

### 5. 未使用変数の処理 (Code Quality)
- **現状**: `src/hooks/useTournamentSettings.ts` や `src/lib/utils/tournament-operations.ts` で `void _createdAt;` のような記述で未使用変数の警告を回避している。
- **修正案**: 分割代入で必要なプロパティのみを取り出すか、Lodashの `omit` のようなユーティリティ（または `src/lib/utils.ts` に自作）を使用して、より宣言的に不要なプロパティを除外する。

## 優先度: 低 (Low)

### 6. マジックナンバーの定数化
- **現状**: `RoundManager` などで ID生成時に `substr(2, 5)` のようなマジックナンバーがある。
- **修正案**: 定数化するか、ユーティリティ関数内に隠蔽する。

### 7. コメントの充実
- **現状**: 複雑な同期ロジック（Local First -> Remote Sync）の意図がコードだけでは読み取りにくい箇所がある。
- **修正案**: `useTournamentsByOrganization` などの重要なデータフロー部分に、アーキテクチャの意図（Local First戦略など）を説明するJSDocを追加する。
