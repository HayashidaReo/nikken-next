import { adminDb } from "@/lib/firebase-admin/server";
import { TeamMapper, FirestoreTeamDoc } from "@/data/mappers/team-mapper";
import type { Team, TeamCreate } from "@/types/team.schema";
import type { TeamRepository } from "@/repositories/team-repository";
import { Timestamp } from "firebase-admin/firestore";
import { adminCollections } from "@/data/firebase/collections";


/**
 * Firebase Admin SDK 実装の TeamRepository
 * サーバーサイド（API Routes等）での使用専用
 */
export class AdminTeamRepositoryImpl implements TeamRepository {
    /**
     * 特定の組織・大会のteamsコレクション参照を取得
     */
    private getCollectionRef(orgId: string, tournamentId: string) {
        return adminDb.collection(`organizations/${orgId}/tournaments/${tournamentId}/teams`);
    }

    async getById(orgId: string, tournamentId: string, teamId: string): Promise<Team | null> {
        const docRef = this.getCollectionRef(orgId, tournamentId).doc(teamId);
        const snap = await docRef.get();

        if (!snap.exists) return null;

        const data = snap.data() as FirestoreTeamDoc;
        if (!data) throw new Error("Document data is undefined");
        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async listAll(orgId: string, tournamentId: string): Promise<Team[]> {
        const snapshot = await this.getCollectionRef(orgId, tournamentId)
            .orderBy("createdAt", "desc")
            .get();

        const teams: Team[] = [];
        snapshot.forEach(doc => {
            const data = doc.data() as FirestoreTeamDoc;
            teams.push(TeamMapper.toDomain({ ...data, id: doc.id }));
        });

        return teams;
    }

    async create(orgId: string, tournamentId: string, team: TeamCreate): Promise<Team> {
        // ドキュメントIDを生成
        const teamsCollection = adminCollections.teams(orgId, tournamentId);
        const teamDocRef = teamsCollection.doc();
        const teamId = teamDocRef.id;

        const firestoreDoc = TeamMapper.toFirestoreForCreate({ ...team, id: teamId });

        // Firebase Admin SDKではTimestampの作成方法が異なる
        const now = Timestamp.now();
        const docWithTimestamp = {
            ...firestoreDoc,
            createdAt: now,
            updatedAt: now,
        };

        await teamDocRef.set(docWithTimestamp);
        const snap = await teamDocRef.get();
        const data = snap.data() as FirestoreTeamDoc;

        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async update(orgId: string, tournamentId: string, teamId: string, patch: Partial<Team>): Promise<Team> {
        const docRef = this.getCollectionRef(orgId, tournamentId).doc(teamId);
        const updateData = TeamMapper.toFirestoreForUpdate(patch);

        // updatedAtをAdmin SDK用のTimestampに変換
        const updateWithTimestamp = {
            ...updateData,
            updatedAt: Timestamp.now(),
        };

        await docRef.update(updateWithTimestamp);

        const snap = await docRef.get();
        const data = snap.data() as FirestoreTeamDoc;

        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async delete(orgId: string, tournamentId: string, teamId: string): Promise<void> {
        await this.getCollectionRef(orgId, tournamentId).doc(teamId).delete();
    }

    // Admin SDKではリアルタイム購読は実装しない（API Routesでは不要）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    listenAll(_orgId: string, _tournamentId: string, _onChange: (teams: Team[]) => void): () => void {
        throw new Error(
            "AdminTeamRepository does not support real-time subscriptions"
        );
    }
}
