import { z } from "zod";

/**
 * パスワードリセットフォーム用のZodスキーマ
 * SSoT（信頼できる唯一の情報源）として機能
 */
export const passwordResetSchema = z.object({
    email: z
        .string()
        .min(1, "メールアドレスは必須です")
        .refine((val) => z.email().safeParse(val).success, {
            message: "正しいメールアドレスを入力してください",
        }),
});

/**
 * パスワードリセットフォームの型
 * Zodスキーマから自動導出
 */
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
