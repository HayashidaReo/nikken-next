import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { v4 as uuidv4 } from "uuid";
import { DisplayNameHelper } from "./helpers/displayNameHelper";
import { teamFormSchema } from "./schema";
import { REGION, FIRESTORE_COLLECTIONS } from "../../constants";

const db = admin.firestore();


/**
 * チーム登録関数 (Callable)
 * 認証なしで実行可能 (public form)
 */
export const registerTeam = onCall({ region: REGION }, async (request) => {
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
            const nameResult = DisplayNameHelper.splitPlayerName(player.fullName);
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
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .doc(tournamentId)
            .collection(FIRESTORE_COLLECTIONS.TEAMS)
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
