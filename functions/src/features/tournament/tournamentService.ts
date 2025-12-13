import * as admin from "firebase-admin";
import { HttpsError } from "firebase-functions/v2/https";
import { FIRESTORE_COLLECTIONS } from "../../constants";

const db = admin.firestore();

export class TournamentService {
    /**
     * チーム登録が可能かどうかを検証する
     * @param orgId 組織ID
     * @param tournamentId 大会ID
     * @throws HttpsError permission-denied
     */
    static async verifyTeamRegistrationAvailability(orgId: string, tournamentId: string): Promise<void> {
        // 公開設定チェック
        // 組織IDと大会IDがバリデーション前でも最低限必要
        if (!orgId || !tournamentId) {
            // 呼び出し元でチェックしているはずだが、念のため
            return;
        }

        const tournamentSnapshot = await db
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .doc(tournamentId)
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
}
