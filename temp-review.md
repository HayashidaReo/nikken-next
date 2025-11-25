# コードレビュー結果

## 概要
コミット `e40f75b` から `099a553` への変更を確認しました。
主な変更点は、ローカルDB（Dexie）における論理削除（`_deleted`）の導入と、それに伴う同期サービス（`sync-service.ts`）の大幅な改修です。
オフラインファーストなアーキテクチャへの移行として、方向性は非常に適切です。

## 評価

### 良い点
1.  **論理削除の導入**: ローカルでの削除操作を物理削除から論理削除（`_deleted`フラグ）に変更したことで、削除操作もクラウドへ同期可能になりました。これはオフライン対応において必須のパターンです。
2.  **ID生成の柔軟性**: `FirestoreMatchRepository` で、外部から `matchId` を指定して作成できるように変更されました。これにより、ローカルで生成したIDをそのままクラウドで使用でき、IDの整合性が保たれます。
3.  **同期ロジックの堅牢化**: `Promise.allSettled` による並列処理から、ループによる順次処理に変更され、エラーハンドリングが個別のアイテムごとに行われるようになりました。これにより、一部の同期失敗が全体を止めることを防いでいます。

### 懸念点・改善が必要な点
1.  **N+1問題 (Performance)**:
    `sync-service.ts` の個人戦同期ループ内で、`matchRepository.getById` を毎回呼び出しています。未同期の試合が100件あれば100回のFirestore読み取りが発生し、パフォーマンスとコストの両面で課題があります。
2.  **リポジトリ実装の不統一 (Consistency)**:
    `FirestoreMatchGroupRepository.update` は「存在しなければ作成（Upsert）」を行いますが、`FirestoreMatchRepository.update` は「存在しなければエラー」を返します。この挙動の違いにより、`sync-service.ts` 側の実装が複雑化しています。
3.  **型定義の曖昧さ (Type Safety)**:
    `match as MatchCreate & { matchId?: string }` というキャストが散見されます。`MatchCreate` 型自体を見直すか、ID付き作成用の型を定義すべきです。

---

## リファクタリング項目

重要度順に記載します。

1.  **[High] SyncServiceにおけるN+1問題の解消**
    *   **現状**: ループ内で `await matchRepository.getById(...)` を実行している。
    *   **対策**:
        *   案A: 同期対象のIDリストを使って、`where('matchId', 'in', ids)` で一括取得する（10件制限に注意）。
        *   案B: `FirestoreMatchRepository.update` を改修し、Upsert（存在しなければ作成）モードをサポートさせることで、事前の存在チェックを不要にする。

2.  **[Medium] リポジトリのUpdateメソッドの挙動統一**
    *   **現状**: `MatchGroupRepository` はUpsert対応だが、`MatchRepository` は非対応（Transaction使用のため）。
    *   **対策**: `MatchRepository` にも `set(..., { merge: true })` 相当のメソッド（例: `save` や `upsert`）を追加し、同期処理ではそれを利用するようにする。トランザクション更新は「画面からの同時編集」用として残し、同期用と使い分けるのが望ましい。

3.  **[Low] 型定義の厳格化**
    *   **現状**: `matchId` の扱いがキャスト頼みになっている。
    *   **対策**: `MatchCreate` 型に `matchId?: string` を追加するか、`MatchCreateWithId` 型を定義してキャストを排除する。

4.  **[Low] 共通処理の切り出し**
    *   **現状**: `sync-service.ts` 内で、Match, MatchGroup, TeamMatch それぞれに似たような同期ループ（削除 or 更新/作成）が書かれている。
    *   **対策**: ジェネリクスを用いて同期ロジック（削除チェック → クラウド反映 → ローカルフラグ更新）を共通関数化できる可能性がある。

5.  **[Low] テストの追加**
    *   **現状**: 今回の変更（論理削除や同期ロジックの変更）に対するテストコードの追加が確認できませんでした。
    *   **対策**: 特に `sync-service.ts` の複雑な分岐（削除、新規、更新）をカバーする単体テストを追加することを推奨します。
