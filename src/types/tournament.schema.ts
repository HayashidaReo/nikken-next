import { z } from "zod";

// 組織（主催団体）スキーマ
export const organizationSchema = z.object({
    orgId: z.string().min(1, "組織IDは必須です"),
    orgName: z.string().min(1, "団体名は必須です"),
    representativeName: z.string().min(1, "代表者名は必須です"),
    representativePhone: z.string().min(1, "電話番号は必須です"),
    representativeEmail: z
        .string()
        .email("正しいメールアドレスを入力してください"),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// コート情報スキーマ
export const courtSchema = z.object({
    courtId: z.string().min(1, "コートIDは必須です"),
    courtName: z.string().min(1, "コート名は必須です"),
});

// 大会スキーマ
export const tournamentSchema = z.object({
    tournamentName: z.string().min(1, "大会名は必須です"),
    tournamentDate: z.string().min(1, "開催日は必須です"),
    location: z.string().min(1, "開催場所は必須です"),
    defaultMatchTime: z.number().min(1, "デフォルト試合時間は必須です"), // 秒単位
    courts: z.array(courtSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// TypeScriptの型を自動導出
export type Organization = z.infer<typeof organizationSchema>;
export type Court = z.infer<typeof courtSchema>;
export type Tournament = z.infer<typeof tournamentSchema>;