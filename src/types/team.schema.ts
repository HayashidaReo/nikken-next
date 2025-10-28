import { z } from "zod";

/**
 * 選手エンティティのZodスキーマ
 */
export const playerSchema = z.object({
  playerId: z.string().min(1, "選手IDは必須です"),
  lastName: z.string().min(1, "姓は必須です"),
  firstName: z.string().min(1, "名は必須です"),
  displayName: z.string().default(""), // displayNameはCloud Functionで生成
});

/**
 * 基本チーム情報のスキーマ（共通フィールド）
 */
const baseTeamSchema = z.object({
  teamName: z.string().min(1, "チーム名（所属名）は必須です"),
  representativeName: z.string().min(1, "代表者名は必須です"),
  representativePhone: z.string().min(1, "代表者電話番号は必須です"),
  representativeEmail: z
    .string()
    .min(1, "代表者メールアドレスは必須です")
    .email("正しいメールアドレスを入力してください"),
  players: z.array(playerSchema).min(1, "最低1人の選手を登録してください"),
  remarks: z.string().default(""),
  isApproved: z.boolean().default(false),
});

/**
 * Firestoreから取得したチームエンティティのスキーマ
 * teamId、createdAt、updatedAtは必須（データベースに存在するため）
 */
export const teamSchema = baseTeamSchema.extend({
  teamId: z.string().min(1), // データベースから取得時は必須
  createdAt: z.date(), // データベースから取得時は必須
  updatedAt: z.date(), // データベースから取得時は必須
});

/**
 * フォーム入力用のTeamスキーマ
 * 選手登録フォームで使用（ID、タイムスタンプなし）
 */
export const teamCreateSchema = baseTeamSchema;

// TypeScriptの型を自動導出
export type Player = z.infer<typeof playerSchema>;
export type Team = z.infer<typeof teamSchema>;
export type TeamCreate = z.infer<typeof teamCreateSchema>;
