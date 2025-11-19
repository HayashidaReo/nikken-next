# リファクタリング提案レポート

`feature/presentation-api` ブランチと `feature/monitor` ブランチの差分を分析し、リファクタリング可能な項目を抽出しました。

## 1. 重複コードの排除と共通化

### トークン検証ロジックの共通化
- **現状**: `app/(auth)/layout.tsx` と `app/(auth)/monitor-display/page.tsx` の両方で、プレゼンテーション用トークンの検証ロジック（`fetch("/api/validate-presentation-token", ...)`）が実装されています。
- **提案**: `src/queries/use-presentation.ts` に作成した `useValidatePresentationToken` フックを `layout.tsx` でも使用するように修正し、ロジックを一元化します。

### 型定義の統一
- **現状**: `src/hooks/use-monitor-data.ts` 内で `PlayerData`, `MatchData` などの型が独自に定義されていますが、`src/types/match.schema.ts` などのグローバルな型定義と重複している可能性があります。
- **提案**: 可能な限りグローバルな型定義（`@/types/...`）をインポートして使用し、型定義の二重管理を防ぎます。

## 2. コンポーネントの責務と可読性向上

### `MonitorDisplayContainer` のプロップス・マッピング
- **現状**: `src/components/organisms/monitor-display-container.tsx` から `MonitorLayout` へデータを渡す際、プロップスのマッピングが冗長になっています（特に `playerA`, `playerB` の展開部分）。
- **提案**: `MonitorLayout` が受け取る型を `MonitorData` (または共通のMatch型) に合わせるか、マッピングロジックを別のヘルパー関数に切り出して、コンポーネントの見通しを良くします。

### `ConnectionStatus` の状態管理
- **現状**: `src/components/organisms/connection-status.tsx` に `// TODO: 別タブを閉じた時に "未接続" に戻るようにする` というコメントが残っています。
- **提案**: `BroadcastChannel` や `PresentationConnection` の切断イベントを適切にハンドリングし、状態を正しく反映させる機能を実装します。

## 3. アーキテクチャの改善

### APIルートのビジネスロジック分離
- **現状**: `app/api/presentation-token/route.ts` および `app/api/validate-presentation-token/route.ts` に、トークンの生成・検証ロジックが直接記述されています。
- **提案**: これらのロジックを `src/services/token-service.ts` (または `src/lib/auth/token-service.ts`) などのサービス層に移動させます。これにより、APIルートはリクエスト/レスポンスのハンドリングに集中でき、ロジックの単体テストも容易になります。

---

これらのリファクタリングを実施することで、コードの重複が減り、保守性と堅牢性が向上します。優先度としては **「トークン検証ロジックの共通化」** と **「型定義の統一」** が高く、次いで **「APIルートのロジック分離」** を推奨します。
