/**
 * 選手データの型定義
 */
export interface PlayerData {
    displayName: string;
    teamName: string;
    score: number;
    hansoku: number;
}

/**
 * 試合データの型定義
 */
export interface MatchData {
    matchId: string;
    tournamentName: string;
    courtName: string;
    round: string;
    playerA: PlayerData;
    playerB: PlayerData;
    timeRemaining: number;
    isTimerRunning: boolean;
    isPublic: boolean;
}

/**
 * 接続状態の型定義
 */
export interface ConnectionState {
    isConnected: boolean;
    error: string | null;
}

/**
 * 反則の段階定義
 */
export const HANSOKU_LEVELS = {
    NONE: 0,      // 無し
    YELLOW: 1,    // 黄
    RED: 2,       // 赤
    RED_YELLOW: 3, // 赤+黄
    RED_RED: 4    // 赤+赤
} as const;

/**
 * 反則レベルの型
 */
export type HansokuLevel = typeof HANSOKU_LEVELS[keyof typeof HANSOKU_LEVELS];