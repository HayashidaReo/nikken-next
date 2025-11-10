import { z } from "zod";
import { TEXT_LENGTH_LIMITS } from "@/lib/constants";

/**
 * 反則状態の列挙型
 * データベース設計のhansokuフィールドに対応
 */
export const hansokuStateEnum = z.enum([
  "none", // 0: 反則なし
  "yellow", // 1: 黄
  "red", // 2: 赤
  "red_yellow", // 3: 赤+黄
  "red_red", // 4: 赤+赤
]);

/**
 * 反則状態の数値マッピング
 */
export const hansokuStateToNumber = {
  none: 0,
  yellow: 1,
  red: 2,
  red_yellow: 3,
  red_red: 4,
} as const;

export const numberToHansokuState = {
  0: "none",
  1: "yellow",
  2: "red",
  3: "red_yellow",
  4: "red_red",
} as const;

/**
 * 試合の選手情報スキーマ
 * データベース設計の players.playerA/playerB に対応
 */
export const matchPlayerSchema = z.object({
  displayName: z.string().min(1, "表示名は必須です"),
  playerId: z.string().min(1, "選手IDは必須です"),
  teamId: z.string().min(1, "チームIDは必須です"),
  teamName: z.string().min(1, "チーム名は必須です"),
  score: z.number().min(0).max(2).default(0), // 0, 1, 2点
  hansoku: z.number().min(0).max(4).default(0), // 0-4の反則状態
});

/**
 * 試合エンティティのZodスキーマ
 * データベース設計の matches コレクションに対応
 */
export const matchSchema = z.object({
  matchId: z.string().optional(), // Firestoreで自動生成
  courtId: z.string().min(1, "コートIDは必須です"),
  round: z.string()
    .min(1, "ラウンドは必須です")
    .max(TEXT_LENGTH_LIMITS.ROUND_NAME_MAX, `ラウンドは${TEXT_LENGTH_LIMITS.ROUND_NAME_MAX}文字以内で入力してください`),
  players: z.object({
    playerA: matchPlayerSchema,
    playerB: matchPlayerSchema,
  }),
  isCompleted: z.boolean(), // 試合完了フラグ（組み合わせ作成時はfalse、モニター保存時はtrue）
  createdAt: z.date().optional(), // Firestoreで自動設定
  updatedAt: z.date().optional(), // Firestoreで自動設定
});

/**
 * 試合作成用のスキーマ
 * 試合の組み合わせ設定画面で使用
 */
export const matchCreateSchema = matchSchema.omit({
  matchId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * 試合結果更新用のスキーマ
 * モニター操作画面で使用
 */
export const matchUpdateSchema = z.object({
  matchId: z.string().min(1, "試合IDは必須です"),
  players: z.object({
    playerA: z.object({
      score: z.number().min(0).max(2),
      hansoku: z.number().min(0).max(4),
    }),
    playerB: z.object({
      score: z.number().min(0).max(2),
      hansoku: z.number().min(0).max(4),
    }),
  }),
});

/**
 * 試合結果更新API用のリクエストスキーマ
 * organizationId, tournamentId を含む
 */
export const matchUpdateRequestSchema = z.object({
  organizationId: z.string().min(1, "組織IDは必須です"),
  tournamentId: z.string().min(1, "大会IDは必須です"),
  players: z.object({
    playerA: z.object({
      score: z.number().min(0).max(2),
      hansoku: z.number().min(0).max(4),
    }),
    playerB: z.object({
      score: z.number().min(0).max(2),
      hansoku: z.number().min(0).max(4),
    }),
  }),
});

// TypeScriptの型を自動導出
export type HansokuState = z.infer<typeof hansokuStateEnum>;
export type MatchPlayer = z.infer<typeof matchPlayerSchema>;
export type Match = z.infer<typeof matchSchema>;
export type MatchCreate = z.infer<typeof matchCreateSchema>;
export type MatchUpdate = z.infer<typeof matchUpdateSchema>;
export type MatchUpdateRequest = z.infer<typeof matchUpdateRequestSchema>;
