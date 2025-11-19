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
    round: z.string(),
    playerA: monitorPlayerSchema,
    playerB: monitorPlayerSchema,
    timeRemaining: z.number(),
    isTimerRunning: z.boolean(),
    isPublic: z.boolean(),
});

export type MonitorPlayer = z.infer<typeof monitorPlayerSchema>;
export type MonitorData = z.infer<typeof monitorDataSchema>;
