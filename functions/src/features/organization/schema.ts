import { z } from "zod";

export const organizationCreateSchema = z.object({
    orgName: z.string().min(1, "団体名は必須です"),
    representativeName: z.string().min(1, "団体代表者名は必須です"),
    representativePhone: z.string().min(1, "団体代表者電話番号は必須です"),
    representativeEmail: z
        .string()
        .min(1, "団体代表者メールアドレスは必須です")
        .email("正しいメールアドレスを入力してください"),
    adminEmail: z
        .string()
        .min(1, "管理者メールアドレスは必須です")
        .email("正しいメールアドレスを入力してください"),
    adminPassword: z.string().min(6, "パスワードは6文字以上必須です"),
});

export type OrganizationCreateData = z.infer<typeof organizationCreateSchema>;
