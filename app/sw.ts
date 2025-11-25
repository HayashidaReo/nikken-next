import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

// `injectionPoint` の値を TypeScript に宣言。
// `injectionPoint` は実際のプリキャッシュマニフェストに置き換えられる文字列。
// デフォルトではこの文字列は `"self.__SW_MANIFEST"` に設定。
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
    runtimeCaching: [
        {
            // オフラインで利用可能なページの設定
            // Authグループ（organization-management以外）とPublicグループの一部をキャッシュ
            matcher: ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) => {
                if (!sameOrigin) return false;
                const { pathname } = url;

                const authRoutes = [
                    "/dashboard",
                    "/match-setup",
                    "/monitor-control",
                    "/teams",
                    "/tournament-settings"
                ];

                const publicRoutes = [
                    "/monitor-display",
                    "/not-found"
                ];

                const routesToCache = [...authRoutes, ...publicRoutes];

                return routesToCache.some(route =>
                    pathname === route || pathname.startsWith(`${route}/`)
                );
            },
            handler: new StaleWhileRevalidate({
                cacheName: "offline-pages",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
                    }),
                ],
            }),
        },
        ...defaultCache,
    ],
});

serwist.addEventListeners();
