import { z } from "zod";

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
  playerId: z.string().min(1, "選手IDは必須です"),
  teamId: z.string().min(1, "チームIDは必須です"),
  score: z.number().min(0).max(2).default(0), // 0, 1, 2点
  hansoku: z.number().min(0).max(4).default(0), // 0-4の反則状態
});

/**
 * 試合エンティティのZodスキーマ
 * データベース設計の matches コレクションに対応
 */
/**
 * 決着理由の列挙型
 */
export const winReasonEnum = z.enum([
  "ippon",   // 一本
  "hantei",  // 判定
  "hansoku", // 反則
  "fusen",   // 不戦
  "none",    // なし
]);

export type WinReason = z.infer<typeof winReasonEnum>;

/**
 * 試合エンティティのZodスキーマ
 * データベース設計の matches コレクションに対応
 */
export const matchSchema = z.object({
  matchId: z.string().optional(), // Firestoreで自動生成
  courtId: z.string().min(1, "コートIDは必須です"),
  roundId: z.string().min(1, "ラウンドIDは必須です"),
  players: z.object({
    playerA: matchPlayerSchema,
    playerB: matchPlayerSchema,
  }),
  sortOrder: z.number().int().min(0), // 表示順序（昇順で並び替え）
  isCompleted: z.boolean(), // 試合完了フラグ（組み合わせ作成時はfalse、モニター保存時はtrue）
  winner: z.enum(["playerA", "playerB", "draw", "none"]).nullable(), // 勝者
  winReason: winReasonEnum.nullable(), // 決着理由
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
 * ID指定ありの試合作成用スキーマ
 * 同期処理などでIDを指定して作成する場合に使用
 */
export const matchCreateWithIdSchema = matchCreateSchema.extend({
  matchId: z.string().min(1, "試合IDは必須です"),
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
  winner: z.enum(["playerA", "playerB", "draw", "none"]).nullable(),
  winReason: z.string().nullable(),
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
  winner: z.enum(["playerA", "playerB", "draw", "none"]).nullable(),
  winReason: z.string().nullable(),
});

// TypeScriptの型を自動導出
export type HansokuState = z.infer<typeof hansokuStateEnum>;
export type MatchPlayer = z.infer<typeof matchPlayerSchema>;
export type Match = z.infer<typeof matchSchema>;
export type MatchCreate = z.infer<typeof matchCreateSchema>;
export type MatchCreateWithId = z.infer<typeof matchCreateWithIdSchema>;
export type MatchUpdate = z.infer<typeof matchUpdateSchema>;
export type MatchUpdateRequest = z.infer<typeof matchUpdateRequestSchema>;

/**
 * 団体戦のチーム対戦（MatchGroup）スキーマ
 */
export const matchGroupSchema = z.object({
  matchGroupId: z.string().optional(), // Firestoreで自動生成
  courtId: z.string().min(1, "コートIDは必須です"),
  roundId: z.string().min(1, "ラウンドIDは必須です"),
  sortOrder: z.number().int().min(0),
  teamAId: z.string().min(1, "チームAは必須です"),
  teamBId: z.string().min(1, "チームBは必須です"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * チーム対戦作成用のスキーマ
 */
export const matchGroupCreateSchema = matchGroupSchema.omit({
  matchGroupId: true,
  createdAt: true,
  updatedAt: true,
});

export type MatchGroup = z.infer<typeof matchGroupSchema>;
export type MatchGroupCreate = z.infer<typeof matchGroupCreateSchema>;

// TeamMatch関連は team-match.schema.ts に移動
export type { TeamMatch, TeamMatchCreate } from "./team-match.schema";
