React + Vite + Firebase (Firestore) + Vercel 環境向けのオフライン対応実装ガイドです。

-----

# Reactアプリ オフライン対応実装ガイド

このガイドでは、ReactアプリをPWA（Progressive Web App）化し、Firestoreのオフラインデータ永続化機能を有効にする手順を解説します。これにより、スマホ・PC問わず、インターネット接続がない状態でもアプリを起動し、データを閲覧・操作することが可能になります。

## 1\. 必要なパッケージのインストール

ViteでPWAを生成するためのプラグインを開発用依存としてインストールします。

```bash
npm install vite-plugin-pwa -D
```

## 2\. vite.config.ts の設定（アプリ本体のキャッシュ）

`vite-plugin-pwa` を設定し、ビルド時に Service Worker と Web Manifest を自動生成させます。

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // 更新即反映
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // 静的アセットのキャッシュ
      manifest: {
        name: 'My Offline App',
        short_name: 'OfflineApp',
        description: 'オフライン対応のReactアプリケーション',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // PCやスマホでアプリライクに表示（ブラウザ枠を消す）
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      // Service Workerの設定（キャッシュ戦略）
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // ランタイムキャッシュ（外部API画像のキャッシュなどが必要な場合に追加）
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
```

## 3\. Firestoreのオフライン永続化設定（データのキャッシュ）

Firebaseの初期化コードを修正し、オフライン時でもデータの読み書きができるようにします。これにより、ネット切断時に書き込んだデータはローカルに保存され、復帰時に自動でサーバーと同期されます。

```typescript
// src/firebase.ts (または firebaseConfig.ts)
import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  // ... あなたのFirebase設定
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// Firestoreの初期化（永続化キャッシュを有効化）
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    // 複数タブでのデータ整合性を保つ設定
    tabManager: persistentMultipleTabManager()
  })
});
```

## 4\. アイコン画像の配置

PWAとしてインストール可能にするため（特にPCのChromeでインストールボタンを表示させるため）には、マニフェストで指定したサイズのアイコン画像が必須です。

プロジェクトの `public` ディレクトリ直下に以下のファイルを配置してください。

  * `public/pwa-192x192.png`
  * `public/pwa-512x512.png`
  * `public/favicon.ico` (既存のものでOK)

## 5\. 確認方法

開発サーバー（`npm run dev`）ではService Workerが正しく動作しない場合があるため、プロダクションビルドを行って確認します。

1.  **ビルドとプレビュー:**
    ```bash
    npm run build
    npm run preview
    ```
2.  **ブラウザでの確認:**
      * 表示されたURL（例: `http://localhost:4173`）を開く。
      * **Chrome DevTools** (F12) を開く。
      * **Application** タブ \> **Service Workers** を選択し、「Status」が緑色の丸（Running）になっているか確認。
      * **Network** タブを開き、スロットリング設定を「No throttling」から「**Offline**」に変更。
      * ページをリロードし、アプリが表示されれば成功です。
      * Firestoreへのデータ追加操作を行い、エラーが出ずに反映（見た目上）されればデータ永続化も成功です。

## 6\. Vercelへのデプロイ

特別な設定は不要です。通常通りGitHubへプッシュし、Vercel側でビルドが走れば、自動的にService Workerが含まれた状態でデプロイされます。

ユーザーはPC/スマホのブラウザからアクセスし、「ホーム画面に追加」または「アプリをインストール」することで、オフライン対応アプリとして利用できるようになります。