import { z } from "zod";

/**
 * モニター表示用の選手情報スキーマ
 * matchPlayerSchemaのサブセットですが、表示に必要な情報のみを含みます
 */
export const monitorPlayerSchema = z.object({
    displayName: z.string(),
    teamName: z.string(),
    score: z.number(),
    hansoku: z.number(),
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
    isPublic: z.boolean(),
    viewMode: z.enum(["scoreboard", "match_result", "team_result"]).default("scoreboard"),
    matchResult: z.object({
        playerA: monitorPlayerSchema,
        playerB: monitorPlayerSchema,
        winner: z.enum(["playerA", "playerB", "draw", "none"]),
    }).optional(),
    teamMatchResults: z.array(z.object({
        matchId: z.string(),
        sortOrder: z.number(),
        playerA: monitorPlayerSchema,
        playerB: monitorPlayerSchema,
        winner: z.enum(["playerA", "playerB", "draw", "none"]),
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
