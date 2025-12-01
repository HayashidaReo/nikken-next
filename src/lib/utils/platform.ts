/**
 * プラットフォーム判定ユーティリティ
 */

/**
 * Electronアプリ内で実行されているかを判定
 * @returns Electronアプリ内で実行されている場合はtrue
 */
export function isElectron(): boolean {
    // サーバーサイドでは常にfalse
    if (typeof window === "undefined") {
        return false;
    }

    // User Agentに "Electron" が含まれているかチェック
    return navigator.userAgent.toLowerCase().includes("electron");
}
