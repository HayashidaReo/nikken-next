import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    onSnapshot,
    CollectionReference,
    DocumentSnapshot,
    DocumentData,
    serverTimestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";
import {
    MatchMapper,
    FirestoreMatchDoc,
    FirestoreMatchCreateDoc,
} from "@/data/mappers/match-mapper";
import type { Match, MatchCreate } from "@/types/match.schema";
import type { MatchRepository } from "@/repositories/match-repository";

/**
 * Firestore 実装の MatchRepository
 * 組織・大会階層構造に対応
 */
export class FirestoreMatchRepository implements MatchRepository {
    /**
     * 特定の組織・大会のmatchesコレクション参照を取得
     */
    private getCollectionRef(orgId: string, tournamentId: string): CollectionReference<DocumentData> {
        return collection(
            db,
            `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCHES}`
        );
    }

    async getById(orgId: string, tournamentId: string, matchId: string): Promise<Match | null> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef, matchId);
        const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        if (!snap.exists()) return null;
        const data = snap.data() as FirestoreMatchDoc | undefined;
        if (!data) return null;
        return MatchMapper.toDomain({ ...data, id: snap.id });
    }

    async listAll(orgId: string, tournamentId: string): Promise<Match[]> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const q = query(collectionRef, orderBy("createdAt", "asc"));
        const snaps = await getDocs(q);
        const matches: Match[] = snaps.docs.map((snap) => {
            const data = snap.data() as FirestoreMatchDoc;
            return MatchMapper.toDomain({ ...data, id: snap.id });
        });
        return matches;
    }

    async create(orgId: string, tournamentId: string, match: MatchCreate): Promise<Match> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);

        // ドキュメントIDを生成
        const docRef = doc(collectionRef);
        const matchId = docRef.id;

        // ドキュメントIDをフィールドに含めて保存
        const firestoreDoc: FirestoreMatchCreateDoc =
            MatchMapper.toFirestoreForCreate({ ...match, id: matchId });

        await setDoc(docRef, {
            ...firestoreDoc,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        const data = snap.data() as FirestoreMatchDoc | undefined;
        if (!data) throw new Error("Created document has no data");
        return MatchMapper.toDomain({ ...data, id: snap.id });
    }

    async createMultiple(orgId: string, tournamentId: string, matches: MatchCreate[]): Promise<Match[]> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const createdMatches: Match[] = [];

        // 並列処理で複数の試合を作成
        await Promise.all(
            matches.map(async (match) => {
                const docRef = doc(collectionRef);
                const matchId = docRef.id;

                const firestoreDoc: FirestoreMatchCreateDoc =
                    MatchMapper.toFirestoreForCreate({ ...match, id: matchId });

                await setDoc(docRef, {
                    ...firestoreDoc,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });

                const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
                const data = snap.data() as FirestoreMatchDoc | undefined;
                if (!data) throw new Error("Created document has no data");
                createdMatches.push(MatchMapper.toDomain({ ...data, id: snap.id }));
            })
        );

        return createdMatches.sort((a, b) =>
            (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
        );
    }

    async update(orgId: string, tournamentId: string, matchId: string, patch: Partial<Match>): Promise<Match> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef, matchId);
        const updateData = MatchMapper.toFirestoreForUpdate(patch);

        await updateDoc(docRef, {
            ...updateData as Partial<DocumentData>,
            updatedAt: serverTimestamp(),
        });

        const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        const data = snap.data() as FirestoreMatchDoc | undefined;
        if (!data) throw new Error("Updated document has no data");
        return MatchMapper.toDomain({ ...data, id: snap.id });
    }

    async delete(orgId: string, tournamentId: string, matchId: string): Promise<void> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef, matchId);
        await deleteDoc(docRef);
    }

    async deleteMultiple(orgId: string, tournamentId: string, matchIds: string[]): Promise<void> {
        await Promise.all(
            matchIds.map((matchId) => this.delete(orgId, tournamentId, matchId))
        );
    }

    async listByCourtId(orgId: string, tournamentId: string, courtId: string): Promise<Match[]> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const q = query(
            collectionRef,
            where("courtId", "==", courtId),
            orderBy("createdAt", "asc")
        );
        const snaps = await getDocs(q);
        const matches: Match[] = snaps.docs.map((snap) => {
            const data = snap.data() as FirestoreMatchDoc;
            return MatchMapper.toDomain({ ...data, id: snap.id });
        });
        return matches;
    }

    async listByRound(orgId: string, tournamentId: string, round: string): Promise<Match[]> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const q = query(
            collectionRef,
            where("round", "==", round),
            orderBy("createdAt", "asc")
        );
        const snaps = await getDocs(q);
        const matches: Match[] = snaps.docs.map((snap) => {
            const data = snap.data() as FirestoreMatchDoc;
            return MatchMapper.toDomain({ ...data, id: snap.id });
        });
        return matches;
    }

    async listByPlayerId(orgId: string, tournamentId: string, playerId: string): Promise<Match[]> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);

        // PlayerAまたはPlayerBのどちらかに該当する選手を検索
        const [playerAQuery, playerBQuery] = await Promise.all([
            getDocs(query(
                collectionRef,
                where("players.playerA.playerId", "==", playerId),
                orderBy("createdAt", "asc")
            )),
            getDocs(query(
                collectionRef,
                where("players.playerB.playerId", "==", playerId),
                orderBy("createdAt", "asc")
            ))
        ]);

        const allMatches: Match[] = [];

        playerAQuery.docs.forEach((snap) => {
            const data = snap.data() as FirestoreMatchDoc;
            allMatches.push(MatchMapper.toDomain({ ...data, id: snap.id }));
        });

        playerBQuery.docs.forEach((snap) => {
            const data = snap.data() as FirestoreMatchDoc;
            allMatches.push(MatchMapper.toDomain({ ...data, id: snap.id }));
        });

        // 重複を排除してソート
        const uniqueMatches = allMatches.filter(
            (match, index, self) =>
                index === self.findIndex((m) => m.matchId === match.matchId)
        );

        return uniqueMatches.sort((a, b) =>
            (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
        );
    }

    async listByTeamId(orgId: string, tournamentId: string, teamId: string): Promise<Match[]> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);

        // TeamAまたはTeamBのどちらかに該当するチームを検索
        const [teamAQuery, teamBQuery] = await Promise.all([
            getDocs(query(
                collectionRef,
                where("players.playerA.teamId", "==", teamId),
                orderBy("createdAt", "asc")
            )),
            getDocs(query(
                collectionRef,
                where("players.playerB.teamId", "==", teamId),
                orderBy("createdAt", "asc")
            ))
        ]);

        const allMatches: Match[] = [];

        teamAQuery.docs.forEach((snap) => {
            const data = snap.data() as FirestoreMatchDoc;
            allMatches.push(MatchMapper.toDomain({ ...data, id: snap.id }));
        });

        teamBQuery.docs.forEach((snap) => {
            const data = snap.data() as FirestoreMatchDoc;
            allMatches.push(MatchMapper.toDomain({ ...data, id: snap.id }));
        });

        // 重複を排除してソート
        const uniqueMatches = allMatches.filter(
            (match, index, self) =>
                index === self.findIndex((m) => m.matchId === match.matchId)
        );

        return uniqueMatches.sort((a, b) =>
            (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
        );
    }

    listenAll(orgId: string, tournamentId: string, onChange: (matches: Match[]) => void): () => void {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const q = query(collectionRef, orderBy("createdAt", "asc"));
        const unsub: Unsubscribe = onSnapshot(q, (snapshot) => {
            const matches = snapshot.docs.map((d) => {
                const data = d.data() as FirestoreMatchDoc;
                return MatchMapper.toDomain({ ...data, id: d.id });
            });
            onChange(matches);
        });
        return () => unsub();
    }

    listenById(orgId: string, tournamentId: string, matchId: string, onChange: (match: Match | null) => void): () => void {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef, matchId);
        const unsub: Unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as FirestoreMatchDoc;
                const match = MatchMapper.toDomain({ ...data, id: snapshot.id });
                onChange(match);
            } else {
                onChange(null);
            }
        });
        return () => unsub();
    }
}

export default FirestoreMatchRepository;