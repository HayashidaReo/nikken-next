import { z } from "zod";

/**
 * 主催団体エンティティのZodスキーマ
 * データベース設計の organizations コレクションに対応
 */
export const organizationSchema = z.object({
  orgId: z.string().optional(), // FirestoreのドキュメントID
  id: z.string().optional(),    // ドメイン層でのID
  orgName: z.string().min(1, "団体名は必須です"),
  representativeName: z.string().min(1, "団体代表者名は必須です"),
  representativePhone: z.string().min(1, "団体代表者電話番号は必須です"),
  representativeEmail: z
    .string()
    .min(1, "団体代表者メールアドレスは必須です")
    .refine((val) => z.email().safeParse(val).success, {
      message: "正しいメールアドレスを入力してください",
    }),
  adminUid: z.string().optional(), // 管理者のUID
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});

/**
 * 組織作成用のスキーマ（システム管理者が使用）
 * アカウント発行情報を含む
 */
export const organizationCreateWithAccountSchema = organizationSchema
  .omit({
    orgId: true,
    id: true,
    adminUid: true,
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
  id: true,
  adminUid: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScriptの型を自動導出
// ドメインエンティティとして使用するため、id, adminUidなどは必須とする型ユーティリティを使用してもよいが、
// Zodの推論を活かすため、Mapperで保証する運用とする。
// ただし、既存のコードが `id: string` (必須) を期待しているため、交差型で補完する。

type ZodOrganization = z.infer<typeof organizationSchema>;

export type Organization = Omit<ZodOrganization, "id" | "adminUid" | "createdAt" | "updatedAt"> & {
  id: string;
  adminUid: string;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationCreate = z.infer<typeof organizationCreateSchema>;
export type OrganizationCreateWithAccount = z.infer<
  typeof organizationCreateWithAccountSchema
>;

