import { Timestamp } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin/server";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";
import {
    MatchMapper,
    FirestoreMatchDoc,
} from "@/data/mappers/match-mapper";
import type { Match } from "@/types/match.schema";

/**
 * Firebase Admin SDK を使った MatchRepository
 */
export class AdminMatchRepositoryImpl {
    /**
     * 特定の組織・大会のmatchesコレクション参照を取得
     */
    private getCollectionRef(orgId: string, tournamentId: string) {
        return adminDb.collection(
            `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCHES}`
        );
    }

    async getById(orgId: string, tournamentId: string, matchId: string): Promise<Match | null> {
        const docRef = this.getCollectionRef(orgId, tournamentId).doc(matchId);
        const snap = await docRef.get();

        if (!snap.exists) return null;

        const data = snap.data() as FirestoreMatchDoc | undefined;
        if (!data) return null;

        return MatchMapper.toDomain({ ...data, id: snap.id });
    }

    async update(
        orgId: string,
        tournamentId: string,
        matchId: string,
        updateData: Partial<Match>
    ): Promise<Match> {
        const docRef = this.getCollectionRef(orgId, tournamentId).doc(matchId);

        const now = Timestamp.now();
        const firestoreUpdateData = MatchMapper.toFirestoreForUpdate({
            ...updateData,
            updatedAt: now.toDate(),
        });

        await docRef.update(firestoreUpdateData);

        // 更新後のデータを取得して返す
        const updated = await this.getById(orgId, tournamentId, matchId);
        if (!updated) {
            throw new Error(`Failed to retrieve updated match: ${matchId}`);
        }

        return updated;
    }
}