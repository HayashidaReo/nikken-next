import { z } from "zod";

// 1. Zodスキーマを定義 (これがSSoT)
export const playerSchema = z.object({
  playerId: z.string().min(1, "選手IDは必須です"),
  lastName: z.string().min(1, "姓は必須です"),
  firstName: z.string().min(1, "名は必須です"),
  displayName: z.string().min(1, "表示名は必須です"),
});

export const teamSchema = z.object({
  teamId: z.string().min(1, "チームIDは必須です"),
  teamName: z.string().min(1, "チーム名は必須です"),
  representativeName: z.string().min(1, "代表者名は必須です"),
  representativePhone: z.string().min(1, "電話番号は必須です"),
  representativeEmail: z
    .string()
    .email("正しいメールアドレスを入力してください"),
  players: z.array(playerSchema),
  remarks: z.string().optional(),
  isApproved: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 2. TypeScriptの型を自動導出
export type Player = z.infer<typeof playerSchema>;
export type Team = z.infer<typeof teamSchema>;
