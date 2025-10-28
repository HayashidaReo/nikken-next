import { z } from "zod";

/**
 * コート情報のZodスキーマ
 */
export const courtSchema = z.object({
  courtId: z.string().min(1, "コートIDは必須です"),
  courtName: z.string().min(1, "コート名は必須です"),
});

/**
 * 大会エンティティのZodスキーマ
 * データベース設計の tournaments サブコレクションに対応
 */
export const tournamentSchema = z.object({
  tournamentId: z.string().optional(), // Firestoreで自動生成
  tournamentName: z.string().min(1, "大会名は必須です"),
  tournamentDate: z.string().min(1, "開催日は必須です"),
  location: z.string().min(1, "開催場所は必須です"),
  defaultMatchTime: z.number().min(1, "デフォルト試合時間は1秒以上である必要があります"),
  courts: z.array(courtSchema).min(1, "最低1つのコートを設定してください"),
  createdAt: z.date().optional(), // Firestoreで自動設定
  updatedAt: z.date().optional(), // Firestoreで自動設定
});

/**
 * 大会作成用のスキーマ
 */
export const tournamentCreateSchema = tournamentSchema.omit({
  tournamentId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * 大会設定画面用のスキーマ（デフォルト試合時間を分:秒形式で扱う）
 */
export const tournamentSettingsSchema = tournamentSchema
  .omit({
    defaultMatchTime: true,
  })
  .extend({
    defaultMatchTimeMinutes: z.number().min(0).max(59),
    defaultMatchTimeSeconds: z.number().min(0).max(59),
  });

// TypeScriptの型を自動導出
export type Court = z.infer<typeof courtSchema>;
export type Tournament = z.infer<typeof tournamentSchema>;
export type TournamentCreate = z.infer<typeof tournamentCreateSchema>;
export type TournamentSettings = z.infer<typeof tournamentSettingsSchema>;
