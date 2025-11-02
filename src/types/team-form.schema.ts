import { z } from "zod";
import { validatePlayerName } from "@/lib/utils/player-name-utils";

/**
 * チーム登録フォーム用のZodスキーマ
 */
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
            })
        )
        .min(1, "最低1人の選手を登録してください"),
    remarks: z.string(),
});

/**
 * チーム登録フォームのデータ型
 */
export type TeamFormData = z.infer<typeof teamFormSchema>;

/**
 * チーム登録データ（組織ID・大会IDを含む）
 */
export interface TeamFormWithParams extends TeamFormData {
    orgId?: string;
    tournamentId?: string;
}