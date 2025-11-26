# コードレビュー & リファクタリング計画

## レビューサマリー

`CODING_RULES.md` および `develop` と `fix/offline-and-other` の差分に基づき、以下の主要ファイルを確認しました：

- `app/(auth)/monitor-control/[matchId]/page.tsx`
- `src/components/organisms/monitor-control-header.tsx`
- `src/components/molecules/monitor-preview.tsx`
- `src/components/organisms/team-form.tsx`
- `src/components/organisms/tournament-form.tsx`
- `src/repositories/firestore/team-repository.ts`

### 発見事項

1.  **`app/(auth)/monitor-control/[matchId]/page.tsx`**
    -   **問題**: コンポーネントが大きすぎます（354行）。データ取得、UI状態、ビジネスロジック、保存処理など、多くの責務を持ちすぎています。
    -   **ルール違反**: 「Pagesはシンプルに保ち、ロジックをOrganismsやHooksに委譲する」（Atomic Designおよび関心の分離による）。
    -   **対応**: ロジックをカスタムフックに抽出する。

2.  **`src/components/organisms/team-form.tsx`**
    -   **問題**: `displayName` 生成やUI内のキーボードナビゲーションに関する複雑なビジネスロジックが含まれています。
    -   **ルール違反**: 「ビジネスロジックはドメイン層またはサービス層にあるべき」。
    -   **対応**: `displayName` ロジックをドメインサービスに抽出する。

3.  **`src/components/molecules/monitor-preview.tsx`**
    -   **問題**: `as unknown as` という型キャストを使用しています。
    -   **ルール違反**: 「完全な型安全性 (Zod-First)」。
    -   **対応**: 安全でないキャストを避けるために型定義を改善する。

4.  **`src/repositories/firestore/team-repository.ts`**
    -   **良点**: オフラインファースト戦略に合わせて、クライアント生成IDをサポートするために `merge: true` で `setDoc` を正しく使用しています。

## リファクタリング項目

影響度と複雑さに基づいて、リファクタリング項目に優先順位を付けました。

1.  **ページからの試合アクションロジックの抽出**
    -   **対象**: `app/(auth)/monitor-control/[matchId]/page.tsx`
    -   **アクション**: `handleSave`、`handleConfirmMatchExecute`、`handleNextMatchClick` を処理する `useMatchAction` フックを作成する。
    -   **メリット**: ページの複雑さを軽減し、テスト容易性を向上させる。

2.  **表示名生成ロジックの抽出**
    -   **対象**: `src/components/organisms/team-form.tsx`
    -   **アクション**: `updateDisplayNames` ロジックを `src/domains/team/services/display-name-service.ts` に移動する。
    -   **メリット**: ビジネスロジックをUIから切り離し、再利用可能かつテスト可能にする。

3.  **キーボードナビゲーションロジックの抽出**
    -   **対象**: `src/components/organisms/team-form.tsx`
    -   **アクション**: `useTeamFormKeyboard` フックを作成する。
    -   **メリット**: フォームコンポーネントを簡素化する。

4.  **MonitorPreviewの型定義改善**
    -   **対象**: `src/components/molecules/monitor-preview.tsx`
    -   **アクション**: `as unknown as` を避けるために適切なインターフェースを定義する。
    -   **メリット**: 型安全性を向上させる。

5.  **MonitorControlHeaderのProps最適化**
    -   **対象**: `src/components/organisms/monitor-control-header.tsx`
    -   **アクション**: 関連するPropsをオブジェクト（例：`monitorState`、`matchState`）にグループ化し、Propsのバケツリレーを減らす。
    -   **メリット**: コードの可読性と保守性を向上させる。
