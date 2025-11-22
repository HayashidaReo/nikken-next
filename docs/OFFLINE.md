React + Next.js + Firebase (Firestore) + Vercel 環境向けのオフライン対応実装ガイドです。

-----

# Next.js アプリ オフライン対応実装ガイド (Serwist 版)

このガイドでは、Next.jsアプリを**Serwist**を使用してPWA（Progressive Web App）化し、Firestoreのオフラインデータ永続化機能を有効にする手順を解説します。これにより、スマホ・PC問わず、インターネット接続がない状態でもアプリを起動し、データを閲覧・操作することが可能になります。

> **注意**: Next.js 16 は Turbopack をデフォルトで使用しますが、Serwist は Turbopack をサポートしていません。そのため、ビルド時には webpack を使用する必要があります。

## 1\. 必要なパッケージのインストール

Serwist とその Next.js プラグインをインストールします。

```bash
npm install @serwist/next serwist
```

## 2\. next.config.js の設定（アプリ本体のキャッシュ）

`@serwist/next` を設定し、ビルド時に Service Worker を自動生成させます。
環境変数 `ENABLE_PWA` を使用して、PWA機能の有効/無効を切り替えられるように設定します。また、Turbopack との競合を避けるための設定も追加します。

```javascript
// next.config.js
// @ts-check
import withSerwistInit from "@serwist/next";

// 1. 環境変数をチェックしてスイッチ判定を行う
const isPwaEnabled = process.env.ENABLE_PWA === "true";

const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    // 2. フラグが立っていない時は強制的に無効化
    disable: !isPwaEnabled,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Turbopack の設定（空オブジェクトで明示的に設定なしとする）
    turbopack: {},
};

// 3. PWAモードの時だけ withSerwist でラップし、それ以外は素の config を返す
export default isPwaEnabled ? withSerwist(nextConfig) : nextConfig;
```

> **重要**: `disable: process.env.NODE_ENV !== "production"` により、開発時は Service Worker が無効化されます。

## 3\. Service Worker ファイルの作成

`app/sw.ts` を作成し、Service Worker のロジックを定義します。

```typescript
// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

## 4\. TypeScript 設定の更新

`tsconfig.json` を更新し、Service Worker の型定義を追加します。

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    // ... 他の設定
    "types": ["@serwist/next/typings"]
  },
  "exclude": ["node_modules", "public/sw.js"]
}
```

## 5\. .gitignore の更新

生成される Service Worker ファイルを Git 管理から除外します。

```gitignore
# Serwist
public/sw*
public/swe-worker*
```

## 6\. Web Manifest の作成

`public/manifest.json` を作成し、PWAのメタデータを定義します。

```json
{
  "name": "Nikken Next App",
  "short_name": "Nikken",
  "description": "日本拳法大会運営支援アプリ",
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

## 7\. Root Layout へのメタデータ追加

`app/layout.tsx` にマニフェストへの参照を追加します。

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nikken Next App",
  description: "日本拳法大会運営支援アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nikken",
  },
};
```

## 8\. Firestoreのオフライン永続化設定（データのキャッシュ）

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

export default app;
```

## 9\. アイコン画像の配置

PWAとしてインストール可能にするため、マニフェストで指定したサイズのアイコン画像が必須です。

プロジェクトの `public` ディレクトリ直下に以下のファイルを配置してください。

  * `public/pwa-192x192.png`
  * `public/pwa-512x512.png`
  * `public/favicon.ico` (既存のものでOK)

## 10\. ビルドスクリプトの更新

`package.json` のスクリプトを更新し、PWA有効化フラグを使用するようにします。

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "dev:pwa": "ENABLE_PWA=true next dev",
    "build": "ENABLE_PWA=true next build"
  }
}
```

*   `dev`: 通常の開発モード（Turbopack有効、PWA無効）
*   `dev:pwa`: PWA有効での開発モード
*   `build`: 本番ビルド（PWA有効）

## 11\. 確認方法

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

## 12\. Vercelへのデプロイ

特別な設定は不要です。通常通りGitHubへプッシュし、Vercel側でビルドが走れば、自動的にService Workerが含まれた状態でデプロイされます。

`package.json` の `build` スクリプトに `--webpack` フラグが含まれているため、Vercel でも正しくビルドされます。

---

# オフライン時の書き込みエラーハンドリング実装方針

## 概要

現在の実装では、オフライン時にデータの**閲覧**は可能ですが、Firestore への**書き込み**（保存・更新・削除）を行うとエラーが発生します。この問題を解決し、ユーザーに適切なフィードバックを提供するための実装方針を以下に示します。

## 目標

1. オフライン時でもアプリ内のデータは楽観的更新で即座に反映
2. ユーザーにオフラインであることを明確に通知
3. オンライン復帰時に自動でFirestoreと同期

## 実装方針

### 1. オンライン/オフライン状態の検知

#### 実装: `useOnlineStatus` カスタムフック

```typescript
// src/hooks/use-online-status.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 2. タイムアウト処理の実装（電波不良対策）

電波が悪く保存に時間がかかる場合、指定した時間を超えたらオフラインと同様に扱います。

#### 実装: タイムアウト付き書き込み処理

```typescript
// src/lib/utils/with-timeout.ts
const DEFAULT_TIMEOUT_MS = 5000; // 5秒

export class TimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(
  promise: Promise<T>, 
  ms: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), ms);
  });
  return Promise.race([promise, timeout]);
}
```

### 3. Firestore 書き込みエラーのハンドリング

#### 実装: TanStack Query の mutation にエラーハンドリングを追加

```typescript
// 例: src/queries/use-save-data.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useNotification } from '@/components/providers/notification-provider';
import { withTimeout, TimeoutError } from '@/lib/utils/with-timeout';

export function useSaveData() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: async (data: SomeData) => {
      const docRef = doc(db, 'collection', data.id);
      // タイムアウト付きで実行
      await withTimeout(setDoc(docRef, data));
      return data;
    },
    onMutate: async (newData) => {
      // 楽観的更新: UIを即座に更新
      await queryClient.cancelQueries({ queryKey: ['data'] });
      const previousData = queryClient.getQueryData(['data']);
      
      queryClient.setQueryData(['data'], (old: SomeData[]) => {
        return [...old, newData];
      });

      return { previousData };
    },
    onError: (error, newData, context) => {
      // エラー時は前の状態にロールバック
      if (context?.previousData) {
        queryClient.setQueryData(['data'], context.previousData);
      }

      // オフラインエラー または タイムアウトエラー かどうかを判定
      const isOfflineError = 
        error instanceof TimeoutError || // タイムアウト
        error.message.includes('offline') || 
        error.message.includes('network') ||
        !navigator.onLine;

      if (isOfflineError) {
        // オフライン時のエラーメッセージ
        showNotification({
          type: 'warning',
          message: 'オフラインでの操作のためデータを正しく送信できませんでした。このアプリ内だけで保存が完了しました。',
        });
        
        // 楽観的更新を保持（ロールバックしたものを再度適用）
        queryClient.setQueryData(['data'], (old: SomeData[]) => {
          return [...old, newData];
        });
      } else {
        // その他のエラー
        showNotification({
          type: 'error',
          message: 'データの保存に失敗しました。',
        });
      }
    },
    // ... onSuccess
  });
}
```

### 4. 共通エラーハンドリングユーティリティ

#### 実装: `handleFirestoreError` ユーティリティ関数

```typescript
// src/lib/utils/firestore-error-handler.ts
import { FirebaseError } from 'firebase/app';
import { TimeoutError } from '@/lib/utils/with-timeout';

export type FirestoreErrorHandler = {
  isOffline: boolean;
  message: string;
  shouldRetainOptimisticUpdate: boolean;
};

export function handleFirestoreError(error: unknown): FirestoreErrorHandler {
  const isOffline = !navigator.onLine;

  // タイムアウトエラーもオフライン扱いにする
  if (error instanceof TimeoutError) {
    return {
      isOffline: true,
      message: '通信が不安定なため、このアプリ内だけで保存が完了しました。',
      shouldRetainOptimisticUpdate: true,
    };
  }

  // Firebase エラーコードをチェック
  if (error instanceof FirebaseError) {
    const isNetworkError = 
      error.code === 'unavailable' || 
      error.code === 'failed-precondition' ||
      error.message.includes('offline');

    if (isNetworkError || isOffline) {
      return {
        isOffline: true,
        message: 'オフラインでの操作のためデータを正しく送信できませんでした。このアプリ内だけで保存が完了しました。',
        shouldRetainOptimisticUpdate: true,
      };
    }
  }

  // その他のエラー
  return {
    isOffline: false,
    message: 'データの保存に失敗しました。',
    shouldRetainOptimisticUpdate: false,
  };
}
```

### 5. グローバルオンライン状態インジケーター

完全オフライン時には、画面左上に「オフライン」インジケーターを表示します。

```typescript
// src/components/molecules/offline-indicator.tsx
"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
    const isOnline = useOnlineStatus();

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-2xl transform-gpu will-change-transform transition-transform">
            <WifiOff className="h-4 w-4" />
            <span>オフライン</span>
        </div>
    );
}
```

このコンポーネントを `app/layout.tsx` の `<body>` 内（プロバイダーの下など）に配置します。

## Phase 5: 楽観的更新とオフライン同期の実装詳細

Firestore の `persistentLocalCache` を有効にしている場合、オフライン時に `setDoc` や `addDoc` を実行すると、SDK は自動的にローカルDB (IndexedDB) に書き込み、ネットワーク復帰時にサーバーと同期します。

しかし、アプリ側で `await` を使って完了を待つと、サーバーからの応答がないためタイムアウトしたり、エラーとして扱われたりします。

そこで、**「TanStack Query でUIを即座に書き換え（楽観的更新）、オフライン起因のエラーが発生してもUIを元に戻さない（ロールバックしない）」**という手法をとります。

### 実装パターン

```typescript
// src/queries/use-save-data.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useNotification } from '@/components/providers/notification-provider';
import { withTimeout, TimeoutError } from '@/lib/utils/with-timeout';
import { handleFirestoreError } from '@/lib/utils/firestore-error-handler';

export function useSaveData() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: async (data: SomeData) => {
      const docRef = doc(db, 'collection', data.id);
      // タイムアウト付きで実行（オフライン時はここでタイムアウトする可能性がある）
      await withTimeout(setDoc(docRef, data));
      return data;
    },
    onMutate: async (newData) => {
      // 1. 楽観的更新: UIを即座に更新
      await queryClient.cancelQueries({ queryKey: ['data'] });
      const previousData = queryClient.getQueryData(['data']);
      
      queryClient.setQueryData(['data'], (old: SomeData[]) => {
        return [...old, newData];
      });

      return { previousData };
    },
    onError: (error, newData, context) => {
      // 2. エラーハンドリング
      const { isOffline, message, shouldRetainOptimisticUpdate } = handleFirestoreError(error);

      if (shouldRetainOptimisticUpdate) {
        // オフライン/タイムアウト時は、楽観的更新を維持する（ロールバックしない）
        // ユーザーには「ローカルに保存された」旨を伝える
        showNotification({
          type: 'warning',
          message: message,
        });
        
        // 必要であれば、ここで再度キャッシュを更新して確実にする
        queryClient.setQueryData(['data'], (old: SomeData[]) => {
          // 重複チェックなどをしつつ追加
          return [...old, newData];
        });
      } else {
        // 本当のエラー（権限不足など）の場合はロールバックする
        if (context?.previousData) {
          queryClient.setQueryData(['data'], context.previousData);
        }
        showNotification({
          type: 'error',
          message: message,
        });
      }
    },
    onSuccess: () => {
        showNotification({
            type: 'success',
            message: '保存しました',
        });
    }
  });
}
```

### ポイント

1.  **`onMutate` で即座にキャッシュ更新**: ユーザーには待ち時間ゼロで反応を返します。
2.  **`withTimeout` で待機**: Firestore SDK はオフライン時に Promise を解決しない（または時間がかかる）場合があるため、強制的にタイムアウトさせます。
3.  **`onError` で分岐**:
    *   **オフライン/タイムアウト**: UIをロールバックせず、警告トーストを表示。「サーバーには届いてないけど、アプリ上では保存したよ」という状態にします。
    *   **その他のエラー**: 通常通りロールバックし、エラーを表示します。