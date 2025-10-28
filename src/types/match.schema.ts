import { z } from "zod";

// 反則状態の定義
export const hansokuStateEnum = z.enum([
  "none", // 0: 反則なし
  "yellow", // 1: 黄
  "red", // 2: 赤
  "red_yellow", // 3: 赤+黄
  "red_red", // 4: 赤+赤
]);

// 選手情報スキーマ
export const matchPlayerSchema = z.object({
  displayName: z.string().min(1, "表示名は必須です"),
  playerId: z.string().min(1, "選手IDは必須です"),
  teamId: z.string().min(1, "チームIDは必須です"),
  teamName: z.string().min(1, "チーム名は必須です"),
  score: z.number().min(0).max(2), // 0, 1, 2点
  hansoku: z.number().min(0).max(4), // 0-4の反則状態
});

// 試合スキーマ
export const matchSchema = z.object({
  matchId: z.string().min(1, "試合IDは必須です"),
  courtId: z.string().min(1, "コートIDは必須です"),
  round: z.string().min(1, "回戦は必須です"),
  players: z.object({
    playerA: matchPlayerSchema,
    playerB: matchPlayerSchema,
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// TypeScriptの型を自動導出
export type HansokuState = z.infer<typeof hansokuStateEnum>;
export type MatchPlayer = z.infer<typeof matchPlayerSchema>;
export type Match = z.infer<typeof matchSchema>;
