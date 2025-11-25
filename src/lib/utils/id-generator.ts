/**
 * 短いランダムIDを生成する
 * @param length IDの長さ (デフォルト: 5)
 * @returns 生成されたID (大文字英数字)
 */
export function generateShortId(length: number = 5): string {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}
