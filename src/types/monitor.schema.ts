import { z } from "zod";
import { winReasonEnum } from "./match.schema";

/**
 * モニター表示用の選手情報スキーマ
 * matchPlayerSchemaのサブセットですが、表示に必要な情報のみを含みます
 */
export const monitorPlayerSchema = z.object({
    displayName: z.string(),
    teamName: z.string(),
    score: z.number(),
    hansoku: z.number(),
    grade: z.string().optional(),
});

/**
 * モニター表示用のデータスキーマ
 * BroadcastChannelやPresentationConnection経由で送信されるデータの構造
 */
export const monitorDataSchema = z.object({
    matchId: z.string(),
    tournamentName: z.string(),
    courtName: z.string(),
    roundName: z.string(),
    playerA: monitorPlayerSchema,
    playerB: monitorPlayerSchema,
    timeRemaining: z.number(),
    isTimerRunning: z.boolean(),
    timerMode: z.enum(["countdown", "stopwatch"]).default("countdown"),
    isPublic: z.boolean(),
    viewMode: z.enum(["scoreboard", "match_result", "team_result", "initial"]).default("scoreboard"),
    matchResult: z.object({
        playerA: monitorPlayerSchema,
        playerB: monitorPlayerSchema,
        winner: z.enum(["playerA", "playerB", "draw", "none"]).nullable(),
        winReason: winReasonEnum.nullable(),
    }).optional(),
    teamMatchResults: z.array(z.object({
        matchId: z.string(),
        sortOrder: z.number(),
        roundId: z.string().optional(),
        playerA: monitorPlayerSchema,
        playerB: monitorPlayerSchema,
        winner: z.enum(["playerA", "playerB", "draw", "none"]).nullable(),
        winReason: winReasonEnum.nullable(),
    })).optional(),
    groupMatches: z.array(z.object({
        matchId: z.string(),
        sortOrder: z.number(),
        roundId: z.string().optional(),
        playerA: monitorPlayerSchema,
        playerB: monitorPlayerSchema,
        isCompleted: z.boolean(),
        winner: z.enum(["playerA", "playerB", "draw", "none"]).nullable(),
        winReason: winReasonEnum.nullable(),
    })).optional(),
});

/**
 * BroadcastChannel経由で送信されるメッセージの型定義
 */
export type MonitorMessage =
    | { type: "data"; payload: MonitorData }              // 通常のデータ送信
    | { type: "heartbeat"; payload: MonitorData }         // ハートビート（データ付き）
    | { type: "ping"; timestamp: number }                 // 疎通確認
    | { type: "ack"; timestamp: number };                 // 応答（データ受信確認・生存確認）

export type MonitorPlayer = z.infer<typeof monitorPlayerSchema>;
export type MonitorData = z.infer<typeof monitorDataSchema>;

// ========================================
// MonitorControlHeader用の型定義
// ========================================

/**
 * モニター接続状態の型
 * - presentation: Presentation API経由で接続中
 * - fallback: BroadcastChannel経由で接続中（フォールバック）
 * - disconnected: 未接続
 */
export type MonitorStatusMode = "presentation" | "fallback" | "disconnected";

/**
 * モニターの状態に関するプロパティ
 */
export interface MonitorStateProps {
    /** モニターが公開状態かどうか */
    isPublic: boolean;
    /** モニター接続状態 */
    monitorStatusMode: MonitorStatusMode;
    /** Presentation API経由で接続中かどうか */
    isPresentationConnected: boolean;
}

/**
 * 試合の状態に関するプロパティ
 */
export interface MatchStateProps {
    /** 大会種別（individual または team） */
    activeTournamentType: string | null | undefined;
    /** 現在の表示モード */
    viewMode: "scoreboard" | "match_result" | "team_result" | "initial";
    /** 全ての試合が完了したかどうか（団体戦用） */
    isAllFinished: boolean;
    /** 保存処理中かどうか */
    isSaving: boolean;
    /** 現在の試合が完了しているかどうか（団体戦用） */
    isCurrentMatchCompleted?: boolean;
}

/**
 * MonitorControlHeaderで使用するアクション関数の型定義
 */
export interface MonitorActions {
    /** 公開/非公開を切り替える */
    onTogglePublic: () => void;
    /** ダッシュボードに戻る */
    onBackToDashboard: () => void;
    /** モニター接続/切断アクション */
    onMonitorAction: () => void;
    /** 保存アクション（個人戦用） */
    onSave: () => void;
    /** 試合確定アクション（団体戦用） */
    onConfirmMatch: () => void;
    /** 次の試合へ進むアクション（団体戦用） */
    onNextMatch: () => void;
    /** 最終結果を表示するアクション（団体戦用） */
    onShowTeamResult: () => void;
    /** 得点板へ進むアクション（団体戦用） */
    onStartMatch?: () => void;
}

/**
 * MonitorControlHeaderコンポーネントのプロパティ
 * 
 * @example
 * ```tsx
 * <MonitorControlHeader
 *   monitorState={{ isPublic, monitorStatusMode, isPresentationConnected }}
 *   matchState={{ activeTournamentType, viewMode, isAllFinished, isSaving }}
 *   matchInfo={{ tournamentName, courtName, roundName }}
 *   actions={{ onTogglePublic, onBackToDashboard, ... }}
 * />
 * ```
 */
export interface MonitorControlHeaderProps {
    /** モニター状態関連のプロパティ */
    monitorState: MonitorStateProps;
    /** 試合状態関連のプロパティ */
    matchState: MatchStateProps;
    /** 試合情報 */
    matchInfo?: {
        tournamentName: string;
        courtName: string;
        roundName: string;
    };
    /** アクション関数群 */
    actions: MonitorActions;
}

