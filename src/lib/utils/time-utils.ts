/**
 * 秒数を分:秒形式(MM:SS)に変換する
 * @param seconds 秒数
 * @returns MM:SS形式の文字列
 */
export function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * 分:秒形式の文字列を秒数に変換する
 * @param timeString MM:SS形式の文字列
 * @returns 秒数
 */
export function parseTimeString(timeString: string): number {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
}

/**
 * 時間を読みやすい形式に変換（例: "5分30秒"）
 * @param seconds 秒数
 * @returns 読みやすい形式の文字列
 */
export function formatTimeReadable(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds}秒`;
    }

    if (remainingSeconds === 0) {
        return `${minutes}分`;
    }

    return `${minutes}分${remainingSeconds}秒`;
}