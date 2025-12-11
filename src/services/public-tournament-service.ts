// TODO
// - **問題点**:
//   - クラス名が `Service` ですが、実態は Firestore を直接操作する `Repository` です。
//   - `src/services` はドメインロジック（計算やルール）を置く場所であり、DB操作を置くべきではありません。
//   - CODING_RULES.md の「データ層アーキテクチャ」に違反しています。
// - **改善案**:
//   - `src/repositories/implementations/firebase-tournament-repository.ts` 等へ移動・リネームする。
//   - `src/repositories/interfaces` にインターフェースを定義し、依存関係を整理する。

import {
    collection,
    getDoc,
    getDocs,
    doc,
    query,
    orderBy,
    onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { TournamentMapper, FirestoreTournamentDoc } from "@/data/mappers/tournament-mapper";
import { MatchGroupMapper, FirestoreMatchGroupDoc } from "@/data/mappers/match-group-mapper";
import { TeamMapper, FirestoreTeamDoc } from "@/data/mappers/team-mapper";
import { Team } from "@/types/team.schema";
import { Tournament } from "@/types/tournament.schema";
import { MatchGroup } from "@/types/match.schema";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";

/**
 * 公開用トーナメントサービス
 * orgIdとtournamentIdからデータを取得できる機能を提供する
 */
export class PublicTournamentService {
    /**
     * 大会IDから大会情報を取得する
     */
    async getTournamentById(orgId: string, tournamentId: string): Promise<Tournament | null> {
        try {
            const tournamentDocRef = doc(
                db,
                FIRESTORE_COLLECTIONS.ORGANIZATIONS,
                orgId,
                FIRESTORE_COLLECTIONS.TOURNAMENTS,
                tournamentId
            );

            const docSnap = await getDoc(tournamentDocRef);
            if (!docSnap.exists()) return null;

            const data = docSnap.data() as FirestoreTournamentDoc;
            return TournamentMapper.toDomain({ ...data, id: docSnap.id });
        } catch (error) {
            console.error("Failed to fetch public tournament:", error);
            return null;
        }
    }

    /**
     * 大会に関連するMatchGroupを取得する
     */
    async getMatchGroups(orgId: string, tournamentId: string): Promise<MatchGroup[]> {
        try {
            const matchGroupsRef = collection(
                db,
                FIRESTORE_COLLECTIONS.ORGANIZATIONS,
                orgId,
                FIRESTORE_COLLECTIONS.TOURNAMENTS,
                tournamentId,
                FIRESTORE_COLLECTIONS.MATCH_GROUPS
            );
            const q = query(matchGroupsRef, orderBy("sortOrder", "asc"));

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data() as FirestoreMatchGroupDoc;
                return MatchGroupMapper.toDomain({ ...data, id: doc.id });
            });
        } catch (error) {
            console.error("Failed to fetch public match groups:", error);
            return [];
        }
    }

    /**
     * 大会に参加しているチーム情報を取得する
     */
    async getTeams(orgId: string, tournamentId: string): Promise<Team[]> {
        try {
            // teamsはOrganizationsの下にある（tournamentの下ではない）想定
            // organizations/{orgId}/teams
            const teamsCollectionRef = collection(
                db,
                FIRESTORE_COLLECTIONS.ORGANIZATIONS,
                orgId,
                FIRESTORE_COLLECTIONS.TOURNAMENTS,
                tournamentId,
                FIRESTORE_COLLECTIONS.TEAMS
            );
            const snapshot = await getDocs(teamsCollectionRef);

            return snapshot.docs.map(doc => {
                const data = doc.data() as FirestoreTeamDoc;
                return TeamMapper.toDomain({ ...data, id: doc.id });
            });

        } catch (error) {
            console.error("Failed to fetch public teams:", error);
            return [];
        }
    }

    /**
     * リアルタイム購読用: MatchGroups
     */
    listenMatchGroups(orgId: string, tournamentId: string, onChange: (groups: MatchGroup[]) => void): () => void {
        try {
            const matchGroupsRef = collection(
                db,
                FIRESTORE_COLLECTIONS.ORGANIZATIONS,
                orgId,
                FIRESTORE_COLLECTIONS.TOURNAMENTS,
                tournamentId,
                FIRESTORE_COLLECTIONS.MATCH_GROUPS
            );
            const q = query(matchGroupsRef, orderBy("sortOrder", "asc"));

            return onSnapshot(q, (snapshot) => {
                const groups = snapshot.docs.map(doc => {
                    const data = doc.data() as FirestoreMatchGroupDoc;
                    return MatchGroupMapper.toDomain({ ...data, id: doc.id });
                });
                onChange(groups);
            });
        } catch (error) {
            console.error("Failed to setup match groups listener:", error);
            return () => { };
        }
    }
}

export const publicTournamentService = new PublicTournamentService();
