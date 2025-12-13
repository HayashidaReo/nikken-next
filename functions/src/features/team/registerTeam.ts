import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { v4 as uuidv4 } from "uuid";
import { DisplayNameHelper } from "./helpers/displayNameHelper";
import { teamFormSchema } from "./schema";
import { REGION, FIRESTORE_COLLECTIONS } from "../../constants";

const db = admin.firestore();


/**
 * チーム登録関数 (Callable)
 * 
 * [SECURITY] Public Access Allowed
 * この関数は認証なし（未ログイン状態）での実行を許可しています。
 * 用途: 外部公開されたチーム登録フォームからのリクエストを受け付けるため。
 * 
 * @param request
 */
export const registerTeam = onCall({ region: REGION }, async (request) => {
    // Note: request.auth check is intentionally skipped here to allow public registration.

    // 0. バリデーション前チェック: request.dataが存在するか確認
    if (!request.data) {
        throw new HttpsError("invalid-argument", "データがありません");
    }

    const { orgId: requestOrgId, tournamentId: requestTournamentId } = request.data;

    // 0.5 公開設定チェック
    // 組織IDと大会IDがバリデーション前でも最低限必要
    if (typeof requestOrgId === 'string' && typeof requestTournamentId === 'string') {
        const tournamentSnapshot = await db
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(requestOrgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .doc(requestTournamentId)
            .get();

        const tournamentData = tournamentSnapshot.data();

        // 大会が存在しない、またはフォーム公開が許可されていない場合
        if (!tournamentSnapshot.exists || !tournamentData?.isTeamFormOpen) {
            throw new HttpsError(
                "permission-denied",
                "現在、この大会のチーム登録は受け付けていません"
            );
        }
    }

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
