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

### GitHub Token
Actionsのデフォルト `GITHUB_TOKEN` には通常、リリース作成権限があります。リポジトリ設定の Actions > General > Workflow permissions で "Read and write permissions" が有効になっていることを確認してください。

### macOS コード署名と公証 (Code Signing & Notarization)
macOSでアプリを配布し、自動アップデートを機能させるには、Appleによる署名と公証が必須です。

#### 必要なもの
1.  **Apple Developer Program メンバーシップ** (年間登録が必要)
2.  **Developer ID Application 証明書** (`.p12` 形式)
3.  **App Store Connect API Key** (公証用)

#### セットアップ手順

**1. 証明書の準備**
1.  Apple Developer サイトで "Developer ID Application" 証明書を作成・ダウンロードします。
2.  Macのキーチェーンアクセスにインポートします。
3.  キーチェーンアクセスから証明書を書き出し (`.p12` 形式)、パスワードを設定します。
4.  この `.p12` ファイルを Base64 エンコードします。
    ```bash
    base64 -i certificate.p12 | pbcopy
    ```

**2. 公証用APIキーの準備**
1.  App Store Connect で "Users and Access" > "Integrations" > "Team Keys" にアクセスします。
2.  新しいキーを作成 (Role: App Manager) し、`.p8` ファイルをダウンロードします。
3.  **Key ID** と **Issuer ID** をメモします。
4.  `.p8` ファイルの内容を Base64 エンコードします。
    ```bash
    base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
    ```

**3. GitHub Secrets の設定**
リポジトリの Settings > Secrets and variables > Actions に以下のシークレットを登録します。

| Secret Name | Value Description |
| :--- | :--- |
| `APPLE_CERTIFICATE` | Base64エンコードされた `.p12` 証明書 |
| `APPLE_CERTIFICATE_PASSWORD` | `.p12` 証明書のパスワード |
| `APPLE_API_KEY` | Base64エンコードされた `.p8` APIキーファイル |
| `APPLE_API_KEY_ID` | Key ID (例: `XXXXXXXXXX`) |
| `APPLE_API_ISSUER` | Issuer ID (UUID形式) |

#### 仕組み
- **ビルド時**: GitHub Actions ワークフロー内で、Base64エンコードされた `APPLE_API_KEY` をデコードして一時ファイル (`AuthKey.p8`) に復元します。
- **署名**: `electron-builder` が `CSC_LINK` (証明書) を使用してアプリに署名します。
- **公証**: `electron-builder` が `notarize` ブロックの設定と復元されたAPIキーを使用して、Appleの公証サーバーにアプリを送信します。
- **Entitlements**: `entitlements.mac.plist` に定義された権限（カメラ、マイク、JITなど）がアプリに付与されます。

## 5. 実装ステップ

1.  **ワークフロー作成**: `.github/workflows/release.yml` を更新し、コミットメッセージによるバージョン制御と自動リリースを実装。
2.  **Package.json更新**: `repository` フィールドが正しく設定されていることを確認。
3.  **ダウンロードページ作成**: `app/(public)/download/page.tsx` を実装。
4.  **テスト**: `develop` から `main` へのPRマージで動作確認。
