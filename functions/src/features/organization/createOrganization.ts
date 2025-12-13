import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { DEMO_ROUNDS, DEMO_COURTS, generateDemoTeams, generateDemoMatches } from "./data/demoData";
import { organizationCreateSchema, type OrganizationCreateData } from "./schema";
import { REGION, FIRESTORE_COLLECTIONS } from "../../constants";
import { AuthHelper } from "../../utils/authHelper";

const db = admin.firestore();
const auth = admin.auth();

/**
 * 組織作成関数 (Callable)
 * システム管理者のみ実行可能
 */
export const createOrganization = onCall({ region: REGION }, async (request) => {
    // 1. 認証チェック
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "認証が必要です"
        );
    }

    const callerUid = request.auth.uid;

    // 2. システム管理者権限チェック
    const callerUserDoc = await db.collection(FIRESTORE_COLLECTIONS.USERS).doc(callerUid).get();
    if (!callerUserDoc.exists || callerUserDoc.data()?.role !== "system_admin") {
        throw new HttpsError(
            "permission-denied",
            "システム管理者権限が必要です"
        );
    }

    // 3. 入力バリデーション
    const result = organizationCreateSchema.safeParse(request.data);
    if (!result.success) {
        throw new HttpsError(
            "invalid-argument",
            "入力データが無効です",
            result.error.issues.map(i => i.message)
        );
    }

    const input: OrganizationCreateData = result.data;

    // Rollback用変数を外で定義
    let newOrgId: string | null = null;

    try {
        // 4. 管理者アカウント作成 (Firebase Auth)
        const userRecord = await auth.createUser({
            email: input.adminEmail,
            password: input.adminPassword,
            displayName: input.representativeName,
            emailVerified: true // 管理作成なので確認済みとする
        });

        newOrgId = userRecord.uid;
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
        const demoMatches = generateDemoMatches(demoTeams); // 12試合

        // 8. デフォルト大会データ作成
        const defaultTournamentRef = db
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(newOrgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .doc();

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
            isTeamFormOpen: false, // デフォルトは非公開
            createdAt: now,
            updatedAt: now,
        };

        // 一括書き込み (Batch)
        const batch = db.batch();

        const orgRef = db.collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS).doc(newOrgId);
        batch.set(orgRef, orgData);

        const userRef = db.collection(FIRESTORE_COLLECTIONS.USERS).doc(newOrgId);
        batch.set(userRef, userData);

        batch.set(defaultTournamentRef, defaultTournament);

        // チームデータの書き込み
        for (const team of demoTeams) {
            const teamRef = defaultTournamentRef.collection(FIRESTORE_COLLECTIONS.TEAMS).doc(team.teamId);
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
            const matchRef = defaultTournamentRef.collection(FIRESTORE_COLLECTIONS.MATCHES).doc(match.matchId);
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

        // ロールバック処理: Authユーザーが作成されていた場合、削除する
        if (newOrgId) {
            await AuthHelper.deleteUser(newOrgId);
        }

        throw new HttpsError(
            "internal",
            error.message || "組織作成中にエラーが発生しました"
        );
    }
});
