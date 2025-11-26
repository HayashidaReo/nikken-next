# Electron リリース＆ダウンロードシステム計画

このドキュメントは、GitHub Actionsを使用してElectronアプリのリリースを自動化し、Webアプリ上にダウンロードページを作成するためのワークフローを概説します。

## 1. アーキテクチャ概要

- **信頼できる情報源 (Source of Truth)**: GitHub Releases。すべてのインストーラーファイル（`.dmg`, `.exe`, `.AppImage`）はここにホストされます。
- **自動化**: GitHub Actionsがタグのプッシュ（`v*`）を検知してアプリをビルドし、アーティファクトを新しいリリースとしてアップロードします。
- **配布**: Next.js WebアプリがGitHub APIからリリース情報を取得し、ダウンロードリンクを提供します。

## 2. GitHub Actions ワークフロー

ワークフローファイル `.github/workflows/release.yml` を作成します。

### トリガー
- `v*` にマッチするタグのプッシュ（例: `v1.0.0`）。

### ジョブ
1.  **ビルド & リリース**:
    - `macos-latest` 上で実行（設定によりMacとWindows両方のビルドが可能）。
    - 手順:
        - コードのチェックアウト。
        - Node.jsのセットアップ。
        - 依存関係のインストール。
        - Next.jsのビルド（`npm run build`）。
        - Electronのビルド & 公開（`npm run electron:pack -- -p always`）。
    - **シークレット**: リリースをアップロードするために `GH_TOKEN` が必要（GitHub Actionsにより自動提供）。

## 3. Webアプリ ダウンロードページ

新しいページ `app/(public)/download/page.tsx` を作成します。

### 機能
- **最新リリースの取得**: GitHub REST API (`GET /repos/{owner}/{repo}/releases/latest`) を使用してバージョン情報とアセットを取得します。
- **プラットフォーム検出**: (オプション) ユーザーの現在のOSに対応するボタンを強調表示します。
- **ダウンロードボタン**:
    - "macOS (Apple Silicon) 版をダウンロード" -> `*-arm64.dmg` へのリンク
    - "macOS (Intel) 版をダウンロード" -> `*.dmg` (非arm64) へのリンク
    - "Windows 版をダウンロード" -> `.exe` へのリンク

### 実装詳細
- **SSG/ISR**: ダウンロードページは静的に生成し、再検証（ISR）を行うことで、リクエストごとのGitHub APIレート制限回避します。
- **フォールバック**: API取得に失敗した場合は、GitHub Releasesページへのリンクを表示します。

## 4. セキュリティ & 権限

- **GitHub Token**: Actionsのデフォルト `GITHUB_TOKEN` には通常、リリース作成権限があります。リポジトリ設定の Actions > General > Workflow permissions で "Read and write permissions" が有効になっていることを確認してください。
- **コード署名**:
    - **macOS**: Apple Developer Certificate (`CSC_LINK`, `CSC_KEY_PASSWORD`) が必要です。これがない場合、アプリ起動時に「未確認の開発者」という警告が表示されます。
    - **Windows**: コード署名証明書 (`CSC_LINK`, `CSC_KEY_PASSWORD`) が必要です。
    - *注記*: 今回の初期計画ではコード署名なしで進めます（警告は出ますが動作はします）。署名手順については別途ドキュメント化します。

## 5. 実装ステップ

1.  **ワークフロー作成**: `.github/workflows/release.yml` を追加。
2.  **Package.json更新**: `repository` フィールドが正しく設定されていることを確認（electron-builderが参照するため）。
3.  **ダウンロードページ作成**: `app/(public)/download/page.tsx` を実装。
4.  **テスト**: `v0.0.1-test` タグをプッシュしてパイプラインを検証。
