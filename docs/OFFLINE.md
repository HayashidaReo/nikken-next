React + Next.js + Firebase (Firestore) + Vercel 環境向けのオフライン対応実装ガイドです。

-----

# Next.js アプリ オフライン対応実装ガイド

このガイドでは、Next.jsアプリをPWA（Progressive Web App）化し、Firestoreのオフラインデータ永続化機能を有効にする手順を解説します。これにより、スマホ・PC問わず、インターネット接続がない状態でもアプリを起動し、データを閲覧・操作することが可能になります。

## 1\. 必要なパッケージのインストール

Next.jsでPWAを生成するためのプラグインをインストールします。

```bash
npm install @ducanh2912/next-pwa
```

## 2\. next.config.ts の設定（アプリ本体のキャッシュ）

`@ducanh2912/next-pwa` を設定し、ビルド時に Service Worker と Web Manifest を自動生成させます。

```typescript
// next.config.ts
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // 開発時は無効化
})(nextConfig);
```

## 3\. Web Manifest の作成

`public/manifest.json` を作成し、PWAのメタデータを定義します。

```json
{
  "name": "Nikken Next App",
  "short_name": "Nikken",
  "description": "オフライン対応のNext.jsアプリケーション",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 4\. Firestoreのオフライン永続化設定（データのキャッシュ）

Firebaseの初期化コードを修正し、オフライン時でもデータの読み書きができるようにします。これにより、ネット切断時に書き込んだデータはローカルに保存され、復帰時に自動でサーバーと同期されます。

```typescript
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase初期化
// Next.jsの高速リロード（HMR）に対応するため、すでに初期化済みかチェックする
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase サービスの取得
export const auth = getAuth(app);

// Firestoreの初期化（永続化キャッシュを有効化）
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    // 複数タブでのデータ整合性を保つ設定
    tabManager: persistentMultipleTabManager()
  })
});

// デフォルトエクスポート
export default app;
```

## 5\. アイコン画像の配置

PWAとしてインストール可能にするため（特にPCのChromeでインストールボタンを表示させるため）には、マニフェストで指定したサイズのアイコン画像が必須です。

プロジェクトの `public` ディレクトリ直下に以下のファイルを配置してください。

  * `public/pwa-192x192.png`
  * `public/pwa-512x512.png`
  * `public/favicon.ico` (既存のものでOK)

## 6\. 確認方法

開発サーバー（`npm run dev`）ではService Workerが無効化されているため、プロダクションビルドを行って確認します。

1.  **ビルドと起動:**
    ```bash
    npm run build
    npm run start
    ```
2.  **ブラウザでの確認:**
      * 表示されたURL（例: `http://localhost:3000`）を開く。
      * **Chrome DevTools** (F12) を開く。
      * **Application** タブ \> **Service Workers** を選択し、「Status」が緑色の丸（Running）になっているか確認。
      * **Network** タブを開き、スロットリング設定を「No throttling」から「**Offline**」に変更。
      * ページをリロードし、アプリが表示されれば成功です。
      * Firestoreへのデータ追加操作を行い、エラーが出ずに反映（見た目上）されればデータ永続化も成功です。

## 7\. Vercelへのデプロイ

特別な設定は不要です。通常通りGitHubへプッシュし、Vercel側でビルドが走れば、自動的にService Workerが含まれた状態でデプロイされます。

ユーザーはPC/スマホのブラウザからアクセスし、「ホーム画面に追加」または「アプリをインストール」することで、オフライン対応アプリとして利用できるようになります。