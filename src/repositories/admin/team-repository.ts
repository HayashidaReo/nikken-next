/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin/server";
import { TeamMapper } from "@/data/mappers/team-mapper";
import type { Team, TeamCreate } from "@/types/team.schema";
import type { TeamRepository } from "@/repositories/team-repository";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK 実装の TeamRepository
 * サーバーサイド（API Routes等）での使用専用
 */
export class AdminTeamRepository implements TeamRepository {
    private collectionName = "teams";

    async getById(teamId: string): Promise<Team | null> {
        const docRef = adminDb.collection(this.collectionName).doc(teamId);
        const snap = await docRef.get();

        if (!snap.exists) return null;

        const data = snap.data();
        if (!data) throw new Error("Document data is undefined");
        return TeamMapper.toDomain({ ...data, id: snap.id } as any);
    }

    async listAll(): Promise<Team[]> {
        const snapshot = await adminDb
            .collection(this.collectionName)
            .orderBy("createdAt", "desc")
            .get();

        const teams: Team[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            teams.push(TeamMapper.toDomain({ ...data, id: doc.id } as any));
        });

        return teams;
    }

    async create(team: TeamCreate): Promise<Team> {
        const firestoreDoc = TeamMapper.toFirestoreForCreate(team as any);

        // Firebase Admin SDKではTimestampの作成方法が異なる
        const now = Timestamp.now();
        const docWithTimestamp = {
            ...firestoreDoc,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await adminDb.collection(this.collectionName).add(docWithTimestamp);
        const snap = await docRef.get();
        const data = snap.data();

        return TeamMapper.toDomain({ ...data, id: snap.id } as any);
    }

    async update(teamId: string, patch: Partial<Team>): Promise<Team> {
        const docRef = adminDb.collection(this.collectionName).doc(teamId);
        const updateData = TeamMapper.toFirestoreForUpdate(patch as any);

        // updatedAtをAdmin SDK用のTimestampに変換
        const updateWithTimestamp = {
            ...updateData,
            updatedAt: Timestamp.now(),
        };

        await docRef.update(updateWithTimestamp);

        const snap = await docRef.get();
        const data = snap.data();

        return TeamMapper.toDomain({ ...data, id: snap.id } as any);
    }

    async delete(teamId: string): Promise<void> {
        await adminDb.collection(this.collectionName).doc(teamId).delete();
    }

    // Admin SDKではリアルタイム購読は実装しない（API Routesでは不要）
    listenAll(): () => void {
        throw new Error("AdminTeamRepository does not support real-time subscriptions");
    }
}