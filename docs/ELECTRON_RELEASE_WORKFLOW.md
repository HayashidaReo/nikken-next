# Electron リリース＆ダウンロードシステム計画

このドキュメントは、GitHub Actionsを使用してElectronアプリのリリースを自動化し、Webアプリ上にダウンロードページを作成するためのワークフローを概説します。

## 1. アーキテクチャ概要

- **信頼できる情報源 (Source of Truth)**: GitHub Releases。すべてのインストーラーファイル（`.dmg`, `.exe`, `.AppImage`）はここにホストされます。
- **自動化**: GitHub Actionsがタグのプッシュ（`v*`）を検知してアプリをビルドし、アーティファクトを新しいリリースとしてアップロードします。
- **配布**: Next.js WebアプリがGitHub APIからリリース情報を取得し、ダウンロードリンクを提供します。

## 2. GitHub Actions ワークフロー

ワークフローファイル `.github/workflows/release.yml` を設定します。

### トリガー
- `main` ブランチへのプッシュ（PRマージを含む）。

### バージョン管理戦略
コミットメッセージに基づいてバージョンを自動決定します。

- メッセージに `release: major` が含まれる → **メジャーアップデート** (v1.0.0 -> v2.0.0)
- メッセージに `release: minor` が含まれる → **マイナーアップデート** (v1.0.0 -> v1.1.0)
- 上記以外（指定なし） → **パッチ修正** (v1.0.0 -> v1.0.1)

### ジョブフロー
1.  **バージョン更新**:
    - コードをチェックアウト。
    - コミットメッセージを解析し、`npm version` コマンドで `package.json` を更新。
    - 更新された `package.json` をコミットし、Gitタグ（例: `v1.0.1`）を作成。
    - リポジトリにプッシュ（`[skip ci]` を付与してループ防止）。
2.  **ビルド & リリース**:
    - `npm run electron:build` でアプリをビルド。
    - `electron-builder` でインストーラーを作成。
    - 作成したタグに基づいて GitHub Releases にリリースを作成し、アーティファクトをアップロード。
    - **シークレット**: `GH_TOKEN` (Actions自動付与) および Firebase環境変数が必要。

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

1.  **ワークフロー作成**: `.github/workflows/release.yml` を更新し、コミットメッセージによるバージョン制御と自動リリースを実装。
2.  **Package.json更新**: `repository` フィールドが正しく設定されていることを確認。
3.  **ダウンロードページ作成**: `app/(public)/download/page.tsx` を実装。
4.  **テスト**: `develop` から `main` へのPRマージで動作確認。
