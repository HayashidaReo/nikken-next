import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { DEMO_ROUNDS, DEMO_COURTS, generateDemoTeams, generateDemoMatches } from "./data/demoData";

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

        // 7. デモデータ生成
        const demoTeams = generateDemoTeams(8, 5); // 8チーム, 各5名
        const demoMatches = generateDemoMatches(demoTeams); // 4試合 (個人戦形式のペアリング)

        // 8. デフォルト大会データ作成
        const defaultTournamentRef = db.collection("organizations").doc(newOrgId).collection("tournaments").doc();
        const defaultTournament = {
            tournamentId: defaultTournamentRef.id,
            tournamentName: `デモデータ大会`,
            tournamentDate: now,
            location: "市民体育館",
            tournamentDetail: "デモデータがセットアップされた大会です。削除して新しい大会を作成してください。",
            defaultMatchTime: 180,
            courts: DEMO_COURTS, // デモ用コート
            rounds: DEMO_ROUNDS, // デモ用ラウンド
            tournamentType: "individual", // 個人戦
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

        // チームデータの書き込み
        for (const team of demoTeams) {
            const teamRef = defaultTournamentRef.collection("teams").doc(team.teamId);
            const teamDoc = {
                ...team,
                representativeName: "デモ代表",
                representativePhone: "090-0000-0000",
                representativeEmail: "demo@example.com",
                remarks: "デモチーム",
                isApproved: true,
                createdAt: now,
                updatedAt: now,
            };
            batch.set(teamRef, teamDoc);
        }

        // 試合データの書き込み (matches collection for individual)
        for (const match of demoMatches) {
            const matchRef = defaultTournamentRef.collection("matches").doc(match.matchId);
            const matchDoc = {
                matchId: match.matchId,
                courtId: match.courtId,
                roundId: match.roundId,
                sortOrder: match.sortOrder,
                players: {
                    playerA: {
                        playerId: match.playerA.playerId,
                        teamId: match.playerA.teamId,
                        score: 0,
                        hansoku: 0,
                    },
                    playerB: {
                        playerId: match.playerB.playerId,
                        teamId: match.playerB.teamId,
                        score: 0,
                        hansoku: 0,
                    }
                },
                isCompleted: match.isCompleted,
                winner: "",
                winReason: "",
                createdAt: now,
                updatedAt: now,
            };
            batch.set(matchRef, matchDoc);
        }

        await batch.commit();

        return {
            success: true,
            orgId: newOrgId,
            message: "組織を作成しました（デモデータを含む）"
        };

    } catch (error: any) {
        console.error("Create Organization Error:", error);
        throw new HttpsError(
            "internal",
            error.message || "組織作成中にエラーが発生しました"
        );
    }
});
