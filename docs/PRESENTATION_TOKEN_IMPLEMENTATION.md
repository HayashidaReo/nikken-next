# Presentation Token Implementation Summary (不必要になった)

## 概要

プレゼンテーション API でモニター画面を開く際、認証画面に遷移する問題を解決するため、短命トークンベースの認証システムを実装しました。

## 実装内容

### 1. API エンドポイント

#### `/api/presentation-token` (POST)
- **目的**: プレゼンテーション用の短命 JWT トークンを発行
- **認証**: 要（コントローラー側で認証済みユーザーが呼び出す）
- **入力**: `{ matchId, orgId, tournamentId }`
- **出力**: `{ token, expiresAt }`
- **トークン有効期限**: 5分
- **セキュリティ機能**:
  - 入力値の型検証
  - トークン発行のログ記録（監査用）
  - 発行時刻、マッチ情報、有効期限をログに記録

#### `/api/validate-presentation-token` (POST)
- **目的**: トークンの検証と認可情報の取得
- **認証**: 不要（トークン自体が認証）
- **入力**: Authorization ヘッダまたはボディで `token`
- **出力**: `{ valid, matchId, orgId, tournamentId }`
- **セキュリティ機能**:
  - JWT 署名検証
  - 有効期限チェック
  - スコープ検証（`monitor-view` のみ許可）
  - 検証の成功/失敗をログ記録
  - クライアント IP の記録

### 2. 認証フロー変更

#### `app/(auth)/layout.tsx`
- プレゼンテーショントークン（`?pt=`）の存在をチェック
- 有効なトークンがある場合、通常の認証チェックをスキップ
- トークン検証中は専用のローディング画面を表示

### 3. モニター制御画面

#### `app/(auth)/monitor-control/[matchId]/page.tsx`
- `handleMonitorAction` を更新:
  1. `/api/presentation-token` を呼び出してトークン取得
  2. トークンを URL クエリパラメータに追加（`?pt=<token>`）
  3. トークン付き URL でモニター画面を開く
- Presentation API と `window.open` の両方に対応

### 4. モニター表示画面

#### `app/(auth)/monitor-display/page.tsx`
- URL からトークン（`?pt=`）を読み取り
- トークンが存在する場合は検証 API を呼び出し
- 検証成功時: モニター表示を許可
- 検証失敗時: エラー画面を表示
- トークンなし: 従来の BroadcastChannel/Presentation API フローを使用

#### `src/hooks/use-monitor-data.ts`
- `tokenData` パラメータを追加
- トークンベースアクセスの場合、`isPublic` を自動的に `true` に設定

### 5. ドキュメント

#### `docs/PRESENTATION_TOKEN_SETUP.md`
- 環境変数の設定手順
- セキュリティのベストプラクティス
- トークン生成方法
- 本番環境チェックリスト

#### `.env.example`
- 必要な環境変数のテンプレート

## セキュリティ対策

### 実装済み
1. **短命トークン**: 5分で自動失効
2. **スコープ制限**: `monitor-view`（読み取り専用）のみ
3. **JWT 署名**: HS256 アルゴリズムで署名・検証
4. **監査ログ**: 発行・検証の全アクションをログ記録
5. **入力検証**: すべての入力パラメータの型と存在をチェック
6. **エラーハンドリング**: 詳細なエラーメッセージとログ
7. **クライアント IP 記録**: 不正アクセスの追跡用

### 推奨事項（今後）
1. **レート制限**: トークン発行エンドポイントにレート制限を追加
2. **ワンタイムトークン**: トークンを一度使用したら無効化
3. **HTTPS 強制**: 本番環境では必ず HTTPS を使用
4. **トークン監査**: 不正なトークン使用パターンの検出
5. **環境変数保護**: 本番環境では Secrets Manager 等を使用

## 使用方法

### 開発環境セットアップ

1. 環境変数を設定:
```bash
# .env.local ファイルを作成
cp .env.example .env.local

# セキュアなシークレットを生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成されたシークレットを .env.local に追加
echo "PRESENTATION_TOKEN_SECRET=<generated-secret>" >> .env.local
```

2. 依存関係のインストール（既に完了）:
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

3. アプリケーションを起動:
```bash
npm run dev
```

### 動作フロー

1. ユーザーが monitor-control 画面で「表示用モニターを開く」ボタンをクリック
2. システムが `/api/presentation-token` を呼び出してトークンを取得
3. トークン付き URL（`/monitor-display?pt=<token>`）でモニター画面を開く
4. モニター画面が起動時にトークンを検証
5. 検証成功後、認証なしでモニター表示が開始される
6. トークンは5分後に自動的に失効

## テスト結果

✅ すべてのテストスイートが成功（46/46）
✅ すべてのテストケースが成功（653/653）
✅ 既存機能に影響なし

## ファイル変更一覧

### 新規作成
- `app/api/presentation-token/route.ts`
- `app/api/validate-presentation-token/route.ts`
- `docs/PRESENTATION_TOKEN_SETUP.md`
- `.env.example`

### 更新
- `app/(auth)/layout.tsx` - トークンベース認証バイパス
- `app/(auth)/monitor-control/[matchId]/page.tsx` - トークン取得と URL パラメータ追加
- `app/(auth)/monitor-display/page.tsx` - トークン検証フロー
- `src/components/organisms/monitor-display-container.tsx` - トークンデータのサポート
- `src/hooks/use-monitor-data.ts` - トークンベースアクセスのサポート

## 注意事項

1. **本番環境での必須設定**:
   - `PRESENTATION_TOKEN_SECRET` を安全な値に設定
   - HTTPS を必ず有効化
   - 環境変数を secrets management システムで管理

2. **開発環境**:
   - デフォルトのシークレットが使用される（開発専用）
   - 本番環境では絶対にデフォルト値を使用しないこと

3. **トークンの有効期限**:
   - 現在は5分に設定
   - 必要に応じて調整可能（`app/api/presentation-token/route.ts` の `TOKEN_EXPIRY`）

4. **ログ**:
   - トークン発行・検証のログが console に出力される
   - 本番環境では適切なログ管理システムに統合することを推奨

## 今後の改善案

1. レート制限の実装
2. ワンタイムトークンへの変更
3. トークン失効の手動管理機能
4. より詳細な監査ログ（Datadog, CloudWatch 等への統合）
5. トークン使用統計の収集
