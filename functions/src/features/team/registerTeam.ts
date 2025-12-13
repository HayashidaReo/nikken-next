import { onCall, HttpsError } from "firebase-functions/v2/https";
import { TournamentService } from "../tournament/tournamentService";
import { TeamService } from "./teamService";
import { teamFormSchema } from "./schema";
import { REGION } from "../../constants";



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

    try {
        // 0.5 公開設定チェック (Service Layer)
        if (typeof requestOrgId === 'string' && typeof requestTournamentId === 'string') {
            await TournamentService.verifyTeamRegistrationAvailability(requestOrgId, requestTournamentId);
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

        // 2. チーム登録処理 (Service Layer)
        const response = await TeamService.registerTeam(orgId, tournamentId, formData);

        return response;

    } catch (error: unknown) {
        console.error("Register Team Error:", error);

        // HttpsErrorはそのままスロー
        if (error instanceof HttpsError) {
            throw error;
        }

        throw new HttpsError(
            "internal",
            "チーム登録に失敗しました"
        );
    }
});
