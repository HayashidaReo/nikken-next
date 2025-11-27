# コードレビュー結果 - develop vs fix/offline-and-other

## レビュー概要

**レビュー日時**: 2025-11-27  
**レビュアー**: ベテランシステムエンジニア  
**レビュー対象**: developブランチとfix/offline-and-otherブランチの差分  
**変更規模**: 63ファイル、約3,415行追加、約1,955行削除

---

## 🎯 総評

全体として、大規模なリファクタリングが実施されており、以下の改善が見られます：

### ✅ 良い点
1. **責務の明確化**: カスタムフックへの適切な関数切り出しが行われている
2. **テストコードの追加**: `display-name-service.test.ts`, `useMonitorPageData.test.ts`, `useMonitorPageUi.test.ts` などのテスト追加
3. **スキーマの分離**: `team-match.schema.ts` を独立したファイルに分離
4. **オフライン対応の強化**: ローカルファースト設計への改善

### ⚠️ 懸念点
1. **削除されたファイルへの依存**: `TournamentSettingsForm` が削除されたが、参照が残っている可能性
2. **関数の重複**: 同期処理のロジックが複数箇所で類似実装されている
3. **命名の不統一**: `TournamentForm` と `TournamentSettingForm` の命名揺れ
4. **コメント不足**: 新規追加されたフックの説明が不十分
5. **エラーハンドリングの改善余地**: タイムアウト処理が複数箇所で重複

---

## 📋 リファクタリング項目一覧

### 🔴 重要度: 高（即座に対応すべき項目）

#### 1. TournamentSettingsFormの削除に伴う参照漏れの確認
**問題点**:
- `src/components/organisms/tournament-settings-form.tsx` が削除されている
- `src/lib/form-defaults.ts` の5行目に「tournament-settings-form.tsx から」というコメントが残存
- `src/components/organisms/index.ts` からエクスポートが削除されているが、他のファイルでの参照が残っている可能性

**対応内容**:
```typescript
// src/lib/form-defaults.ts:5
// 削除すべきコメント
- // 大会設定フォーム用のスキーマ(tournament-settings-form.tsx から)
+ // 大会設定フォーム用のスキーマ
```

**影響範囲**:
- `src/lib/form-defaults.ts`
- 全てのimport文のgrep検査

---

#### 2. TournamentFormの関数名とファイル名の不一致
**問題点**:
- ファイル名: `tournament-form.tsx`
- エクスポート関数名: `TournamentSettingForm`（差分41行目）
- 本来のエクスポート名: `TournamentForm`（差分1行目）

**対応内容**:
```typescript
// src/components/organisms/tournament-form.tsx
- export function TournamentSettingForm({
+ export function TournamentForm({
```

**影響範囲**:
- `src/components/organisms/tournament-form.tsx`
- このコンポーネントをインポートしている全てのファイル

---

#### 3. 同期処理のロジック重複とタイムアウト処理の統一
**問題点**:
- `useTournamentPersistence.ts`, `useTeamPersistence.ts`, `useMatchPersistence.ts` で同様のタイムアウト処理（10秒）が重複実装されている
- エラーハンドリングパターンが統一されていない

**対応内容**:
共通ユーティリティ関数として切り出す
```typescript
// src/lib/utils/sync-utils.ts (新規作成)
import { DEFAULT_SYNC_TIMEOUT } from "@/lib/constants";

interface SyncOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * クラウド同期処理を実行する共通関数
 * @param syncTask 同期タスク
 * @param options タイムアウトやコールバック設定
 */
export async function executeSyncWithTimeout<T>(
  syncTask: () => Promise<T>,
  options: SyncOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_SYNC_TIMEOUT, onSuccess, onError } = options;

  try {
    const result = await Promise.race([
      syncTask(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Sync timeout")), timeout)
      ),
    ]);

    onSuccess?.();
    return result;
  } catch (error) {
    const syncError = error instanceof Error ? error : new Error("Unknown sync error");
    onError?.(syncError);
    throw syncError;
  }
}
```

各ファイルで共通関数を使用:
```typescript
// src/hooks/useTournamentPersistence.ts (例)
import { executeSyncWithTimeout } from "@/lib/utils/sync-utils";

const syncTournamentToCloud = useCallback(async (tournamentId: string) => {
  await executeSyncWithTimeout(
    async () => {
      const localTournament = await localTournamentRepository.getById(orgId, tournamentId);
      // ... 同期処理
    },
    {
      onSuccess: () => showSuccess("クラウドに同期しました"),
      onError: (error) => showError("クラウド同期に失敗しました"),
    }
  );
}, []);
```

**影響範囲**:
- `src/hooks/useTournamentPersistence.ts`
- `src/hooks/useTeamPersistence.ts`
- `src/hooks/useMatchPersistence.ts`
- `src/hooks/useMatchGroupPersistence.ts`
- `src/lib/constants.ts` (DEFAULT_SYNC_TIMEOUT定数の追加)

---

#### 4. MonitorControlHeaderのprops構造変更に伴う型安全性の向上
**問題点**:
- `MonitorControlHeader` のpropsが大幅に変更され、ネストされたオブジェクト構造に変更されている
- 型定義の明示性が不足している可能性

**対応内容**:
型定義を明示的に分離する
```typescript
// src/components/organisms/monitor-control-header.tsx
interface MonitorState {
  isPublic: boolean;
  monitorStatusMode: "presentation" | "fallback" | "disconnected";
  isPresentationConnected: boolean;
}

interface MatchState {
  activeTournamentType: string | null | undefined;
  viewMode: "default" | "match_result" | "team_result";
  isAllFinished: boolean;
  isSaving: boolean;
}

interface MonitorActions {
  onTogglePublic: () => void;
  onBackToDashboard: () => void;
  onMonitorAction: () => void;
  onSave: () => void;
  onConfirmMatch: () => void;
  onNextMatch: () => void;
  onShowTeamResult: () => void;
}

interface MonitorControlHeaderProps {
  monitorState: MonitorState;
  matchState: MatchState;
  actions: MonitorActions;
}
```

**影響範囲**:
- `src/components/organisms/monitor-control-header.tsx`
- `app/(auth)/monitor-control/[matchId]/page.tsx`

---

#### 5. useApproveTeamの実装方法の確認
**問題点**:
- `app/(auth)/teams/page.tsx` で `useApproveTeam` を使用しているが、mutateメソッドの引数が不正確
- 正しくは `mutate({ teamId, isApproved })` のようなオブジェクト形式が一般的

**対応内容**:
```typescript
// app/(auth)/teams/page.tsx (33行目付近)
- approveTeamMutation.mutate(teamId, isApproved);
+ approveTeamMutation.mutate({ teamId, isApproved });
```

または、`useApproveTeam` の実装を確認して正しい呼び出し方に修正

**影響範囲**:
- `app/(auth)/teams/page.tsx`
- `src/queries/use-teams.ts` (useApproveTeamの実装確認)

---

### 🟡 重要度: 中（計画的に対応すべき項目）

#### 6. カスタムフックのJSDocコメント追加
**問題点**:
- 新規追加されたフック（`useConfirmSave`, `useTeamFormKeyboard`, `useTeamFormDeletion`）にはコメントがあるが、一部不足している
- `useMatchAction` にはコメントが不足

**対応内容**:
各フックのファイルヘッダーとエクスポート関数に詳細な説明を追加
```typescript
/**
 * 試合アクション管理フック
 * 
 * MonitorControlPage における試合の保存、確認、次試合への遷移などのアクションを統合管理する
 * 
 * @param props.orgId - 組織ID
 * @param props.activeTournamentId - 大会ID
 * @param props.activeTournamentType - 大会種別（個人戦/団体戦）
 * @param props.needsRepMatch - 代表戦が必要かどうか
 * @param props.handleNextMatch - 次の試合への遷移処理
 * @param props.handleCreateRepMatch - 代表戦作成処理
 * 
 * @returns 試合アクション関連の関数とダイアログ状態
 * 
 * @example
 * ```tsx
 * const {
 *   handleSave,
 *   handleConfirmMatchClick,
 *   showConfirmDialog,
 *   isSaving,
 * } = useMatchAction({
 *   orgId,
 *   activeTournamentId,
 *   activeTournamentType,
 *   needsRepMatch,
 *   handleNextMatch,
 *   handleCreateRepMatch,
 * });
 * ```
 */
export function useMatchAction({ ... }) {
  // ...
}
```

**影響範囲**:
- `src/hooks/useMatchAction.ts`
- `src/hooks/useConfirmSave.ts`
- `src/hooks/useTeamFormKeyboard.ts`
- `src/hooks/useTeamFormDeletion.ts`
- `src/hooks/useMonitorPageData.ts`
- `src/hooks/useMonitorPageUi.ts`

---

#### 7. displayName生成ロジックのドメインサービス化の完全移行
**問題点**:
- `display-name-service.ts` が新規作成されているが、既存の他のファイルでdisplayName生成ロジックが残っている可能性がある

**対応内容**:
- 全ファイルをgrep検索して、displayName生成ロジックが他に残っていないか確認
- 残っている場合は `display-name-service.ts` の関数を使用するように統一

```bash
# 検索コマンド例
grep -r "displayName.*lastName.*firstName" src/
grep -r "姓.*名.*表示名" src/
```

**影響範囲**:
- プロジェクト全体のdisplayName生成箇所

---

#### 8. LocalRepositoryのメソッドの統一性確認
**問題点**:
- `LocalTeamRepository` に `create`, `update`, `delete`, `hardDelete`, `markAsSynced` などが追加されている
- 他のLocalRepository（`LocalTournamentRepository`, `LocalMatchRepository`）でも同様のメソッドが追加されているか確認が必要
- インターフェースの統一が望ましい

**対応内容**:
共通インターフェースを作成
```typescript
// src/repositories/local/base-local-repository.interface.ts (新規作成)
export interface BaseLocalRepository<T, TCreate> {
  listAll(orgId: string, tournamentId: string): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(orgId: string, tournamentId: string, data: TCreate): Promise<T>;
  update(id: string, changes: Partial<T>): Promise<number>;
  delete(id: string): Promise<void>; // 論理削除
  hardDelete(id: string): Promise<void>; // 物理削除
  getUnsynced(orgId: string, tournamentId: string): Promise<T[]>;
  countUnsynced(orgId: string, tournamentId: string): Promise<number>;
  markAsSynced(id: string): Promise<void>;
}
```

各リポジトリで実装
```typescript
export class LocalTeamRepository implements BaseLocalRepository<LocalTeam, TeamCreate> {
  // ...
}
```

**影響範囲**:
- `src/repositories/local/team-repository.ts`
- `src/repositories/local/tournament-repository.ts`
- `src/repositories/local/match-repository.ts`
- `src/repositories/local/match-group-repository.ts`
- `src/repositories/local/team-match-repository.ts`

---

#### 9. MonitorPreviewコンポーネントのprops型定義
**問題点**:
- `MonitorPreview` コンポーネントが新規追加されているが、propsの型が明示的
- `monitorStatusMode` の型が文字列リテラル型で定義されているが、定数として切り出すべき

**対応内容**:
```typescript
// src/types/monitor.ts (新規または既存ファイル)
export type MonitorStatusMode = "presentation" | "fallback" | "disconnected";

// src/components/molecules/monitor-preview.tsx
import type { MonitorStatusMode } from "@/types/monitor";

interface MonitorPreviewProps {
  width?: number;
  className?: string;
  monitorStatusMode: MonitorStatusMode;
}
```

**影響範囲**:
- `src/components/molecules/monitor-preview.tsx`
- `src/types/monitor.ts` または該当するファイル

---

#### 10. TeamFormのpropsインターフェース明示化
**問題点**:
- `TeamForm` コンポーネントの `onSave` props の型が複雑なインライン定義になっている
- `TeamEditData` のような型を明示的に定義すべき

**対応内容**:
```typescript
// src/types/team.schema.ts または新規ファイル
export interface TeamFormData {
  teamName: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  isApproved: boolean;
  remarks: string;
  players: {
    playerId: string;
    lastName: string;
    firstName: string;
    displayName: string;
  }[];
}

// src/components/organisms/team-form.tsx
interface TeamFormProps {
  initialData?: TeamFormData;
  onSave: (data: TeamFormData) => Promise<void>;
  onCancel: () => void;
  className?: string;
}
```

**影響範囲**:
- `src/components/organisms/team-form.tsx`
- `app/(auth)/teams/new/page.tsx`
- `app/(auth)/teams/edit/[teamId]/page.tsx`

---

### 🟢 重要度: 低（時間があれば対応すべき項目）

#### 11. useConfirmSaveのジェネリクス型の活用改善
**問題点**:
- `useConfirmSave<T>` でジェネリクス型を使用しているが、実際の利用箇所で型推論が効くようにできる可能性がある

**対応内容**:
```typescript
// より厳密な型推論を実現
export function useConfirmSave<T extends Record<string, unknown>>({
  shouldConfirm,
  onSave,
  onSuccess,
}: UseConfirmSaveOptions<T>) {
  // ...
}
```

**影響範囲**:
- `src/hooks/useConfirmSave.ts`

---

#### 12. KeyboardEventのハンドリングの型安全性向上
**問題点**:
- `useTeamFormKeyboard` の `handleKeyDown` で `React.KeyboardEvent<HTMLFormElement>` を使用しているが、より厳密なイベント型の使用が望ましい

**対応内容**:
```typescript
import type { KeyboardEvent } from "react";

export function useTeamFormKeyboard({ fieldsLength, addPlayer }: UseTeamFormKeyboardProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLFormElement>) => {
    // ...
  }, [fieldsLength, addPlayer]);
  
  return { handleKeyDown };
}
```

**影響範囲**:
- `src/hooks/useTeamFormKeyboard.ts`

---

#### 13. テストコードのカバレッジ向上
**問題点**:
- `display-name-service.test.ts`, `useMonitorPageData.test.ts`, `useMonitorPageUi.test.ts` のテストが追加されているのは良いが、他の新規フックのテストがない

**対応内容**:
以下のフックのテストファイルを作成:
- `src/hooks/useMatchAction.test.ts`
- `src/hooks/useConfirmSave.test.ts`
- `src/hooks/useTeamFormKeyboard.test.ts`
- `src/hooks/useTeamFormDeletion.test.ts`
- `src/hooks/useMatchPersistence.test.ts`
- `src/hooks/useMatchGroupPersistence.test.ts`

**影響範囲**:
- `src/hooks/` 配下の新規テストファイル

---

#### 14. エラーメッセージの統一と多言語対応の準備
**問題点**:
- エラーメッセージが各所でハードコーディングされている
- 将来的な多言語対応を考慮した設計になっていない

**対応内容**:
```typescript
// src/lib/constants/messages.ts (新規作成)
export const ERROR_MESSAGES = {
  SYNC: {
    FAILED: "クラウド同期に失敗しました",
    OFFLINE: "オフラインのためクラウド同期はされていません",
    TIMEOUT: "同期がタイムアウトしました",
  },
  TEAM: {
    SAVE_FAILED: "チームの保存に失敗しました",
    APPROVAL_FAILED: "チームの承認状態の更新に失敗しました",
  },
  // ...
} as const;

export const SUCCESS_MESSAGES = {
  SYNC: {
    COMPLETE: "クラウドに同期しました",
  },
  TEAM: {
    CREATED: (teamName: string) => `「${teamName}」を登録しました`,
  },
  // ...
} as const;
```

使用箇所:
```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants/messages";

showError(ERROR_MESSAGES.SYNC.FAILED);
showSuccess(SUCCESS_MESSAGES.TEAM.CREATED(data.teamName));
```

**影響範囲**:
- プロジェクト全体のエラーメッセージ・成功メッセージ使用箇所

---

#### 15. setTimeout使用箇所のクリーンアップ処理追加
**問題点**:
- `app/(auth)/teams/new/page.tsx` や `app/(auth)/teams/page.tsx` で `setTimeout` が使用されているが、コンポーネントのアンマウント時のクリーンアップが行われていない

**対応内容**:
```typescript
// app/(auth)/teams/new/page.tsx
useEffect(() => {
  let timeoutId: NodeJS.Timeout;

  const syncInBackground = async () => {
    timeoutId = setTimeout(() => {
      syncTeamToCloud(newTeam.teamId, { showSuccessToast: true }).catch((err) => {
        console.error("Background sync failed:", err);
      });
    }, 0);
  };

  // クリーンアップ
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}, []);
```

または、カスタムフックとして切り出す:
```typescript
// src/hooks/useBackgroundSync.ts
export function useBackgroundSync(
  syncFn: () => Promise<void>,
  dependencies: unknown[]
) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      syncFn().catch(console.error);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, dependencies);
}
```

**影響範囲**:
- `app/(auth)/teams/new/page.tsx`
- `app/(auth)/teams/page.tsx`

---

## 📊 統計情報

### ファイル別変更行数（上位10件）

| ファイル | 追加 | 削除 | 合計 |
|---------|------|------|------|
| docs/OFFLINE.md | 200+ | 400+ | 600+ |
| src/components/organisms/tournament-settings-form.tsx | 0 | 348 | 348 |
| src/hooks/useMonitorPageUi.test.ts | 282 | 0 | 282 |
| app/(auth)/monitor-control/[matchId]/page.tsx | 100+ | 125+ | 225+ |
| src/hooks/useTournamentPersistence.ts | 80+ | 141+ | 221+ |
| src/hooks/useMatchGroupPersistence.ts | 203 | 0 | 203 |
| src/hooks/useMonitorPageData.test.ts | 196 | 0 | 196 |
| src/components/organisms/team-form.tsx | 150+ | 46+ | 196+ |
| src/queries/use-tournaments.ts | 50+ | 56+ | 106+ |
| src/components/molecules/monitor-preview.tsx | 97 | 0 | 97 |

### 新規追加ファイル（13件）

1. `app/(auth)/teams/new/page.tsx`
2. `src/components/molecules/monitor-preview.tsx`
3. `src/domains/team/services/display-name-service.test.ts`
4. `src/domains/team/services/display-name-service.ts`
5. `src/hooks/useConfirmSave.ts`
6. `src/hooks/useMatchAction.ts`
7. `src/hooks/useMatchGroupPersistence.ts`
8. `src/hooks/useMatchPersistence.ts`
9. `src/hooks/useMonitorPageData.test.ts`
10. `src/hooks/useMonitorPageData.ts`
11. `src/hooks/useMonitorPageUi.test.ts`
12. `src/hooks/useMonitorPageUi.ts`
13. `src/hooks/useTeamFormDeletion.ts`
14. `src/hooks/useTeamFormKeyboard.ts`
15. `src/types/team-match.schema.ts`

### 削除ファイル（1件）

1. `src/components/organisms/tournament-settings-form.tsx`

### リネームファイル（1件）

1. `src/components/organisms/team-edit-form.tsx` → `src/components/organisms/team-form.tsx` (68%類似)

---

## 🔍 コーディングルール準拠チェック

### ✅ 準拠している項目

1. **Server Components First**: Page componentは適切にServer Componentとして実装されている
2. **Zod-First**: 新規スキーマファイル `team-match.schema.ts` でZodスキーマを使用
3. **Atomic Design**: コンポーネントの階層分離が適切
4. **状態管理の分離**: TanStack Query, Zustand, useStateの使い分けが適切
5. **React インポートルール**: 個別インポートが徹底されている
6. **ファイル命名規則**: kebab-caseが徹底されている

### ⚠️ 改善が必要な項目

1. **重複コード**: 同期処理の実装が複数箇所で重複（項目3参照）
2. **コメント不足**: 新規フックの一部でJSDocが不足（項目6参照）
3. **型定義の明示性**: インライン型定義が多い箇所がある（項目10参照）
4. **エラーハンドリング**: エラーメッセージのハードコーディング（項目14参照）

---

## 📝 追加推奨事項

### 1. データ層アーキテクチャの一貫性確認
`CODING_RULES.md` で定義されているドメイン層、データ層、リポジトリ層の3層アーキテクチャが、今回の変更で一貫して適用されているか確認が必要です。

### 2. パフォーマンス最適化の検証
- `useCallback`, `useMemo` の使用が適切か
- 不要な再レンダリングが発生していないか
- TanStack QueryのstaleTime設定が適切か

### 3. Firestore セキュリティルールの更新確認
ローカルファースト設計への移行に伴い、Firestoreのセキュリティルールが適切に更新されているか確認が必要です。

### 4. オフライン対応のエッジケース処理
- ネットワーク復帰時の自動同期
- 競合解決の仕組み
- 長期間オフライン時のデータ整合性

---

## ✅ 承認前チェックリスト

- [ ] 項目1-5（重要度：高）の対応完了
- [ ] 削除されたファイルへの参照が全て解消されている
- [ ] 命名の統一性が確保されている
- [ ] 同期処理の共通化が完了している
- [ ] 型定義の明示化が完了している
- [ ] テストコードが追加されている
- [ ] ビルドエラーがない
- [ ] Lintエラーがない
- [ ] 既存機能の動作確認完了
- [ ] オフライン対応の動作確認完了

---

## 最終コメント

今回のリファクタリングは、全体として**コードの保守性と可読性を大幅に向上させる優れた取り組み**です。特に、以下の点は高く評価できます：

1. カスタムフックへの適切な関数切り出し
2. テストコードの追加
3. スキーマの分離による責務の明確化
4. ローカルファースト設計への移行

一方で、**重要度の高い項目（1-5）については即座に対応が必要**です。特に、削除されたファイルへの参照漏れや命名の不統一は、実行時エラーやメンテナンス性の低下を招く可能性があります。

中程度・低程度の項目についても、計画的に対応することで、長期的なコード品質の維持につながります。

---

**レビュアーサイン**: システムエンジニア（ベテラン）  
**次回レビュー推奨タイミング**: 重要度高の項目対応後
