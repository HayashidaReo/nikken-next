import { z } from "zod";
import { matchPlayerSchema, winReasonEnum } from "./match.schema";

/**
 * 団体戦内の個人試合（TeamMatch）スキーマ
 * 基本的にMatchと同じだが、matchGroupIdを持つ
 */
export const teamMatchSchema = z.object({
    matchId: z.string().optional(),
    matchGroupId: z.string().min(1, "チーム対戦IDは必須です"),
    roundId: z.string().min(1, "ラウンドIDは必須です"),
    players: z.object({
        playerA: matchPlayerSchema,
        playerB: matchPlayerSchema,
    }),
    sortOrder: z.number().int().min(0),
    isCompleted: z.boolean(),
    winner: z.enum(["playerA", "playerB", "draw", "none"]).nullable(), // 勝者
    winReason: winReasonEnum.nullable(), // 決着理由
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

/**
 * 団体戦内の個人試合作成用のスキーマ
 */
export const teamMatchCreateSchema = teamMatchSchema.omit({
    matchId: true,
    createdAt: true,
    updatedAt: true,
});

export type TeamMatch = z.infer<typeof teamMatchSchema>;
export type TeamMatchCreate = z.infer<typeof teamMatchCreateSchema>;
