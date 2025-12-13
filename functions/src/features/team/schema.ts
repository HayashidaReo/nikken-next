import { z } from "zod";

// --- Validation Logic ---
export const validatePlayerName = (name: string) => {
    // 全角・半角スペースで分割
    const parts = name.trim().split(/[\s\u3000]+/);
    return parts.length === 2;
};

// バリデーションスキーマ (zod)
export const teamFormSchema = z.object({
    representativeName: z.string().min(1, "代表者名は必須です"),
    representativePhone: z.string().min(1, "代表者電話番号は必須です"),
    representativeEmail: z
        .string()
        .min(1, "代表者メールアドレスは必須です")
        .email("正しいメールアドレスを入力してください"),
    teamName: z.string().min(1, "チーム名（所属名）は必須です"),
    players: z
        .array(
            z.object({
                fullName: z
                    .string()
                    .min(1, "選手名は必須です")
                    .refine(
                        validatePlayerName,
                        "選手名は「姓 名」の形式で、姓と名の間に半角スペースを入れてください"
                    ),
                grade: z.string().min(1, "段位を選択してください"),
            })
        )
        .min(1, "最低1人の選手を登録してください"),
    remarks: z.string().optional().default(""),
    orgId: z.string().min(1, "orgIdは必須です"),
    tournamentId: z.string().min(1, "tournamentIdは必須です"),
});

// Type inference
export type TeamFormData = z.infer<typeof teamFormSchema>;
