# コードレビュー & リファクタリング提案

`develop` ブランチと現在の `HEAD` の差分を確認し、`CODING_RULES.md` に基づいてレビューを行いました。
全体的に、機能の追加（個人戦対応、モニター表示の改善）が適切に行われており、Atomic Design や Hooks パターンも活用されています。
さらなる保守性と可読性向上のため、以下のリファクタリングを提案します。

## 優先度：高 (High)

1.  **`MonitorControlPage` のキーボードハンドリングの分離**
    -   **現状**: `app/(auth)/monitor-control/[matchId]/page.tsx` 内の `useEffect` が肥大化しており、個人戦・団体戦の分岐や確認ダイアログの制御が複雑になっています。
    -   **提案**: キーボードショートカットのロジックを `src/hooks/useMonitorKeyboardShortcuts.ts` などのカスタムフックに切り出し、Viewロジックと分離してください。
    -   **メリット**: ページコンポーネントの見通しが良くなり、テストもしやすくなります。

2.  **`useMatchEditForm` の `useEffect` の依存配列修正**
    -   **現状**: `src/hooks/useMatchEditForm.ts` の `useEffect` で `// eslint-disable-next-line react-hooks/exhaustive-deps` が使用されています。
    -   **提案**: `match` オブジェクト全体を依存配列に入れると無限ループの可能性があるため、`match.matchId` や初期値として必要なプロパティのみを個別に依存配列に指定するか、`useRef` を活用して初期化ロジックを安全に実装してください。ESLintの警告を抑制するのは避けるべきです。

## 優先度：中 (Medium)

3.  **`MonitorControlHeader` のボタン表示ロジックの整理**
    -   **現状**: `activeTournamentType` や `viewMode` による条件分岐が JSX 内に多数散らばっており、可読性が低下しています。
    -   **提案**: ボタンの表示条件とレンダリング内容を定義する設定オブジェクトを作成するか、サブコンポーネント（例: `TeamMatchActions`, `IndividualMatchActions`）に分割して整理してください。

4.  **`MonitorDisplayContainer` のレンダリングロジックの分離**
    -   **現状**: `renderContent` 関数内で条件分岐が多岐にわたっています（非公開、団体戦結果、個人戦結果、スコアボード）。
    -   **提案**: 各モードに対応するコンポーネント（`StandbyScreen`, `MonitorGroupResults`, `MonitorIndividualMatchResult`, `MonitorLayout`）の選択ロジックを、より宣言的な形（例: switch文やマッピングオブジェクト）にするか、別のコンポーネント `MonitorContentSwitcher` として切り出すことを検討してください。

5.  **`MonitorIndividualMatchResult` の共通ロジックとコンポーネントの抽出**
    -   **現状**:
        -   `getOpacity` 関数が `MonitorGroupResults` と重複している可能性があります。
        -   `WinnerStamp` コンポーネントがファイル内に定義されています。
    -   **提案**:
        -   `getOpacity` のような表示ロジックを `src/lib/utils/monitor-utils.ts` などに共通化してください。
        -   `WinnerStamp` は再利用可能な Atom (`src/components/atoms/winner-stamp.tsx`) として切り出してください。

## 優先度：低 (Low)

6.  **マジックストリングの定数化**
    -   **現状**: コード内に `"playerA"`, `"playerB"`, `"team"`, `"individual"`, `"match_result"` などの文字列リテラルが散見されます。
    -   **提案**: これらを `src/lib/constants.ts` または適切な型定義ファイル内の定数（例: `TOURNAMENT_TYPES`, `VIEW_MODES`）として管理し、タイプミスを防ぎ、変更に強くしてください。

7.  **リポジトリ直接呼び出しの検討**
    -   **現状**: `useMatchEditForm` から `localMatchRepository.update` を直接呼び出しています。
    -   **提案**: 現状は問題ありませんが、保存時のロジック（バリデーションや付随する処理）が増える場合は、ドメインサービスやUseCase層を挟むことを検討してください。
