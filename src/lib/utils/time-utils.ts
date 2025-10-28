import { TIME_CONSTANTS } from "@/lib/constants";

/**
 * 秒を分と秒に分割する
 */
export function splitSecondsToMinutesAndSeconds(totalSeconds: number): {
    minutes: number;
    seconds: number;
} {
    const minutes = Math.floor(totalSeconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
    const seconds = totalSeconds % TIME_CONSTANTS.SECONDS_PER_MINUTE;
    return { minutes, seconds };
}

/**
 * 分と秒を秒に統合する
 */
export function combineMinutesAndSecondsToSeconds(minutes: number, seconds: number): number {
    return minutes * TIME_CONSTANTS.SECONDS_PER_MINUTE + seconds;
}

/**
 * 秒を "MM:SS" 形式でフォーマットする
 */
export function formatTime(seconds: number): string {
    const { minutes, seconds: remainingSeconds } = splitSecondsToMinutesAndSeconds(seconds);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * 分:秒形式の文字列を秒数に変換する
 * @param timeString MM:SS形式の文字列
 * @returns 秒数
 */
export function parseTimeString(timeString: string): number {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return combineMinutesAndSecondsToSeconds(minutes || 0, seconds || 0);
}

/**
 * 時間を読みやすい形式に変換（例: "5分30秒"）
 * @param seconds 秒数
 * @returns 読みやすい形式の文字列
 */
export function formatTimeReadable(seconds: number): string {
    const { minutes, seconds: remainingSeconds } = splitSecondsToMinutesAndSeconds(seconds);

    if (minutes === 0) {
        return `${remainingSeconds}秒`;
    }

    if (remainingSeconds === 0) {
        return `${minutes}分`;
    }

    return `${minutes}分${remainingSeconds}秒`;
}