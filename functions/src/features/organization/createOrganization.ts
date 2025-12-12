import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

const db = admin.firestore();
const auth = admin.auth();

// --- Schemas (Copied/Adapted for minimal validation) ---
interface OrganizationCreateData {
    orgName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    adminEmail: string;
    adminPassword: string;
}

// Helper to validate input (Simplified for now)
const validateOrganizationData = (data: any): OrganizationCreateData => {
    if (!data.orgName) throw new Error("団体名は必須です");
    if (!data.representativeName) throw new Error("団体代表者名は必須です");
    if (!data.representativePhone) throw new Error("団体代表者電話番号は必須です");
    if (!data.representativeEmail) throw new Error("団体代表者メールアドレスは必須です");
    if (!data.adminEmail) throw new Error("管理者メールアドレスは必須です");
    if (!data.adminPassword || data.adminPassword.length < 6) throw new Error("パスワードは6文字以上必須です");

    return data as OrganizationCreateData;
};

/**
 * 組織作成関数 (Callable)
 * システム管理者のみ実行可能
 */
export const createOrganization = onCall({ region: "asia-northeast1" }, async (request) => {
    // 1. 認証チェック
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "認証が必要です"
        );
    }

    const callerUid = request.auth.uid;

    // 2. システム管理者権限チェック
    const callerUserDoc = await db.collection("users").doc(callerUid).get();
    if (!callerUserDoc.exists || callerUserDoc.data()?.role !== "system_admin") {
        throw new HttpsError(
            "permission-denied",
            "システム管理者権限が必要です"
        );
    }

    // 3. 入力バリデーション
    let input: OrganizationCreateData;
    try {
        input = validateOrganizationData(request.data);
    } catch (e: any) {
        throw new HttpsError("invalid-argument", e.message);
    }

    try {
        // 4. 管理者アカウント作成 (Firebase Auth)
        const userRecord = await auth.createUser({
            email: input.adminEmail,
            password: input.adminPassword,
            displayName: input.representativeName,
            emailVerified: true // 管理作成なので確認済みとする
        });

        const newOrgId = userRecord.uid;
        const now = admin.firestore.Timestamp.now();

        // 5. 組織データ作成 (organizations collection)
        const orgData = {
            orgId: newOrgId,
            orgName: input.orgName,
            representativeName: input.representativeName,
            representativePhone: input.representativePhone,
            representativeEmail: input.representativeEmail,
            adminUid: newOrgId,
            createdAt: now,
            updatedAt: now,
        };

        // 6. 管理者ユーザーデータ作成 (users collection)
        const userData = {
            userId: newOrgId,
            orgId: newOrgId,
            role: "org_admin",
            isActive: true,
            email: input.adminEmail,
            displayName: input.representativeName,
            createdAt: now,
            updatedAt: now,
        };

        // 7. デフォルト大会データ作成
        const defaultTournamentRef = db.collection("organizations").doc(newOrgId).collection("tournaments").doc();
        const defaultTournament = {
            tournamentId: defaultTournamentRef.id,
            tournamentName: "大会名（変更してください）",
            tournamentDate: "",
            location: "",
            tournamentDetail: "",
            defaultMatchTime: 180,
            courts: [],
            createdAt: now,
            updatedAt: now,
        };

        // 一括書き込み (Batch)
        const batch = db.batch();

        const orgRef = db.collection("organizations").doc(newOrgId);
        batch.set(orgRef, orgData);

        const userRef = db.collection("users").doc(newOrgId);
        batch.set(userRef, userData);

        batch.set(defaultTournamentRef, defaultTournament);

        await batch.commit();

        return {
            success: true,
            orgId: newOrgId,
            message: "組織を作成しました"
        };

    } catch (error: any) {
        console.error("Create Organization Error:", error);
        // Auth作成済みでDB作成失敗などの場合、Authを削除するロールバック処理を入れるのが理想
        // 今回は簡易実装としてエラーを返すのみ
        throw new HttpsError(
            "internal",
            error.message || "組織作成中にエラーが発生しました"
        );
    }
});
