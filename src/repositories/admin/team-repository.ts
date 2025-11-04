import { adminDb } from "@/lib/firebase-admin/server";
import { TeamMapper, FirestoreTeamDoc } from "@/data/mappers/team-mapper";
import type { Team, TeamCreate } from "@/types/team.schema";
import type { TeamRepository } from "@/repositories/team-repository";
import { Timestamp } from "firebase-admin/firestore";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";

/**
 * Admin Team Repository の拡張インターフェース
 * 組織・トーナメントコンテキストでのチーム操作をサポート
 */
export interface AdminTeamRepository extends TeamRepository {
    /**
     * 組織とトーナメントのコンテキストでチームを作成
     */
    createWithParams(
        team: TeamCreate,
        orgId: string,
        tournamentId: string
    ): Promise<Team>;
}

/**
 * Firebase Admin SDK 実装の TeamRepository
 * サーバーサイド（API Routes等）での使用専用
 */
export class AdminTeamRepositoryImpl implements AdminTeamRepository {
    async getById(teamId: string): Promise<Team | null> {
        const docRef = adminDb.collection(FIRESTORE_COLLECTIONS.TEAMS).doc(teamId);
        const snap = await docRef.get();

        if (!snap.exists) return null;

        const data = snap.data() as FirestoreTeamDoc;
        if (!data) throw new Error("Document data is undefined");
        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async listAll(): Promise<Team[]> {
        const snapshot = await adminDb
            .collection(FIRESTORE_COLLECTIONS.TEAMS)
            .orderBy("createdAt", "desc")
            .get();

        const teams: Team[] = [];
        snapshot.forEach(doc => {
            const data = doc.data() as FirestoreTeamDoc;
            teams.push(TeamMapper.toDomain({ ...data, id: doc.id }));
        });

        return teams;
    }

    async create(team: TeamCreate): Promise<Team> {
        const firestoreDoc = TeamMapper.toFirestoreForCreate(team);

        // Firebase Admin SDKではTimestampの作成方法が異なる
        const now = Timestamp.now();
        const docWithTimestamp = {
            ...firestoreDoc,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await adminDb
            .collection(FIRESTORE_COLLECTIONS.TEAMS)
            .add(docWithTimestamp);
        const snap = await docRef.get();
        const data = snap.data() as FirestoreTeamDoc;

        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async createWithParams(
        team: TeamCreate,
        orgId: string,
        tournamentId: string
    ): Promise<Team> {
        const firestoreDoc = TeamMapper.toFirestoreForCreate(team);

        // Firebase Admin SDKではTimestampの作成方法が異なる
        const now = Timestamp.now();
        const docWithTimestamp = {
            ...firestoreDoc,
            createdAt: now,
            updatedAt: now,
        };

        // Firestoreに保存
        const docRef = await adminDb
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .doc(tournamentId)
            .collection(FIRESTORE_COLLECTIONS.TEAMS)
            .add(docWithTimestamp);

        const snap = await docRef.get();
        const data = snap.data() as FirestoreTeamDoc;

        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async update(teamId: string, patch: Partial<Team>): Promise<Team> {
        const docRef = adminDb.collection(FIRESTORE_COLLECTIONS.TEAMS).doc(teamId);
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

    async delete(teamId: string): Promise<void> {
        await adminDb.collection(FIRESTORE_COLLECTIONS.TEAMS).doc(teamId).delete();
    }

    // Admin SDKではリアルタイム購読は実装しない（API Routesでは不要）
    listenAll(): () => void {
        throw new Error(
            "AdminTeamRepository does not support real-time subscriptions"
        );
    }
}
