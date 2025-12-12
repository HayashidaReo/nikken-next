import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { DisplayNameHelper } from "./helpers/displayNameHelper";

const db = admin.firestore();

// --- Validation Logic ---
const validatePlayerName = (name: string) => {
    // 全角・半角スペースで分割
    const parts = name.trim().split(/[\s\u3000]+/);
    return parts.length === 2;
};

// バリデーションスキーマ (zod)
const teamFormSchema = z.object({
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

// --- Converter Logic ---
const splitPlayerName = (fullName: string) => {
    const parts = fullName.trim().split(/[\s\u3000]+/);
    return {
        lastName: parts[0] || "",
        firstName: parts[1] || "",
    };
};

/**
 * チーム登録関数 (Callable)
 * 認証なしで実行可能 (public form)
 */
export const registerTeam = onCall({ region: "asia-northeast1" }, async (request) => {
    // 1. 入力バリデーション
    const result = teamFormSchema.safeParse(request.data);
    if (!result.success) {
        throw new HttpsError(
            "invalid-argument",
            "入力データが無効です",
            result.error.issues.map(i => i.message)
        );
    }

    const { orgId, tournamentId, ...formData } = result.data;

    try {
        // 2. データの変換 (FormData -> TeamCreate)
        const players = formData.players.map(player => {
            const nameResult = splitPlayerName(player.fullName);
            return {
                playerId: `player_${uuidv4()}`,
                lastName: nameResult.lastName,
                firstName: nameResult.firstName,
                displayName: "", // 後で生成
                grade: player.grade,
            };
        });

        // displayName生成
        const playersWithDisplayNames = DisplayNameHelper.generateDisplayNames(players);

        const now = admin.firestore.Timestamp.now();
        const teamId = uuidv4();

        const teamData = {
            teamId: teamId,
            teamName: formData.teamName,
            representativeName: formData.representativeName,
            representativePhone: formData.representativePhone,
            representativeEmail: formData.representativeEmail,
            players: playersWithDisplayNames,
            remarks: formData.remarks,
            isApproved: false,
            createdAt: now,
            updatedAt: now,
        };

        // 3. Firestoreへの保存
        // パス: organizations/{orgId}/tournaments/{tournamentId}/teams/{teamId}
        const teamRef = db
            .collection("organizations")
            .doc(orgId)
            .collection("tournaments")
            .doc(tournamentId)
            .collection("teams")
            .doc(teamId);

        await teamRef.set(teamData);

        return {
            success: true,
            team: {
                id: teamData.teamId,
                name: teamData.teamName,
                representativeName: teamData.representativeName,
                playersCount: teamData.players.length,
                isApproved: teamData.isApproved,
                createdAt: now.toDate().toISOString(),
            },
        };

    } catch (error: any) {
        console.error("Register Team Error:", error);
        throw new HttpsError(
            "internal",
            "チーム登録に失敗しました"
        );
    }
});
