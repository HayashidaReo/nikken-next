// @ts-check
import withSerwistInit from "@serwist/next";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const packageJson = require("./package.json");

// 1. 環境変数をチェックしてスイッチ判定を行う
const isPwaEnabled = process.env.ENABLE_PWA === "true";

const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    // 2. フラグが立っていない時は強制的に無効化（開発モードでもPWAテストができるように修正）
    disable: !isPwaEnabled,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Turbopack の設定
    turbopack: {},
    output: "standalone",
    env: {
        NEXT_PUBLIC_APP_VERSION: packageJson.version,
    },
};

// 3. PWAモードの時だけ withSerwist でラップし、それ以外は素の config を返す
// これにより、通常開発時は PWA の処理が一切走らなくなります
export default isPwaEnabled ? withSerwist(nextConfig) : nextConfig;