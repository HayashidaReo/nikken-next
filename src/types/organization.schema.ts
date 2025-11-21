import { z } from "zod";

/**
 * 主催団体エンティティのZodスキーマ
 * データベース設計の organizations コレクションに対応
 */
export const organizationSchema = z.object({
  orgId: z.string().optional(), // Firestoreで自動生成
  orgName: z.string().min(1, "団体名は必須です"),
  representativeName: z.string().min(1, "団体代表者名は必須です"),
  representativePhone: z.string().min(1, "団体代表者電話番号は必須です"),
  representativeEmail: z
    .string()
    .min(1, "団体代表者メールアドレスは必須です")
    .refine((val) => z.email().safeParse(val).success, {
      message: "正しいメールアドレスを入力してください",
    }),
  createdAt: z.date().optional(), // Firestoreで自動設定
  updatedAt: z.date().optional(), // Firestoreで自動設定
});

/**
 * 組織作成用のスキーマ（システム管理者が使用）
 * アカウント発行情報を含む
 */
export const organizationCreateWithAccountSchema = organizationSchema
  .omit({
    orgId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // 組織管理者アカウント用の追加フィールド
    adminEmail: z
      .string()
      .min(1, "管理者メールアドレスは必須です")
      .refine((val) => z.email().safeParse(val).success, {
        message: "正しいメールアドレスを入力してください",
      }),
    adminPassword: z
      .string()
      .min(6, "パスワードは6文字以上である必要があります"),
  });

/**
 * 組織作成用のスキーマ（通常用）
 */
export const organizationCreateSchema = organizationSchema.omit({
  orgId: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScriptの型を自動導出
export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationCreate = z.infer<typeof organizationCreateSchema>;
export type OrganizationCreateWithAccount = z.infer<
  typeof organizationCreateWithAccountSchema
>;
