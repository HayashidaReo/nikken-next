import { TokenValidationResponse } from "@/queries/use-presentation";

const STORAGE_KEY_PREFIX = "monitor_auth_";

/**
 * 認証済みトークンの情報をセッションストレージに保存する
 * これにより、リロード時などにトークンの有効期限が切れていても
 * 一度認証に成功していれば（タブを閉じるまで）表示を継続できる。
 */
export function saveTokenSession(token: string, data: TokenValidationResponse) {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${token}`, JSON.stringify(data));
    } catch (e) {
        console.warn("トークンセッションの保存に失敗しました:", e);
    }
}

/**
 * セッションストレージから認証済みトークンの情報を取得する
 */
export function loadTokenSession(token: string): TokenValidationResponse | null {
    if (typeof window === "undefined") return null;
    try {
        const item = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${token}`);
        if (item) {
            return JSON.parse(item) as TokenValidationResponse;
        }
    } catch (e) {
        console.warn("トークンセッションの読み込みに失敗しました:", e);
    }
    return null;
}
