import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    CollectionReference,
    DocumentSnapshot,
    DocumentData,
    Timestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";
import {
    TeamMatchMapper,
    FirestoreTeamMatchDoc,
    FirestoreTeamMatchCreateDoc,
} from "@/data/mappers/team-match-mapper";
import type { TeamMatch, TeamMatchCreate } from "@/types/match.schema";
import type { TeamMatchRepository } from "@/repositories/team-match-repository";

export class FirestoreTeamMatchRepository implements TeamMatchRepository {
    private getCollectionRef(orgId: string, tournamentId: string, matchGroupId: string): CollectionReference<DocumentData> {
        return collection(
            db,
            `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCH_GROUPS}/${matchGroupId}/${FIRESTORE_COLLECTIONS.TEAM_MATCHES}`
        );
    }

    async getById(orgId: string, tournamentId: string, matchGroupId: string, matchId: string): Promise<TeamMatch | null> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId, matchGroupId);
        const docRef = doc(collectionRef, matchId);
        const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        if (!snap.exists()) return null;
        const data = snap.data() as FirestoreTeamMatchDoc | undefined;
        if (!data) return null;
        return TeamMatchMapper.toDomain({ ...data, id: snap.id });
    }

    async listAll(orgId: string, tournamentId: string, matchGroupId: string): Promise<TeamMatch[]> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId, matchGroupId);
        const q = query(collectionRef, orderBy("sortOrder", "asc"));
        const snaps = await getDocs(q);
        return snaps.docs.map((snap) => {
            const data = snap.data() as FirestoreTeamMatchDoc;
            return TeamMatchMapper.toDomain({ ...data, id: snap.id });
        });
    }

    async create(orgId: string, tournamentId: string, matchGroupId: string, match: TeamMatchCreate): Promise<TeamMatch> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId, matchGroupId);
        const docRef = doc(collectionRef);
        const matchId = docRef.id;

        const now = Timestamp.now();

        const firestoreDoc: FirestoreTeamMatchCreateDoc =
            TeamMatchMapper.toFirestoreForCreate({ ...match, id: matchId });

        await setDoc(docRef, {
            ...firestoreDoc,
            createdAt: now,
            updatedAt: now,
        });

        const snap = await getDoc(docRef);
        const data = snap.data() as FirestoreTeamMatchDoc;
        return TeamMatchMapper.toDomain({ ...data, id: snap.id });
    }

    async update(orgId: string, tournamentId: string, matchGroupId: string, matchId: string, patch: Partial<TeamMatch>): Promise<TeamMatch> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId, matchGroupId);
        const docRef = doc(collectionRef, matchId);

        // 既存データを読み込み
        const currentSnap = await getDoc(docRef);
        const now = Timestamp.now();

        if (!currentSnap.exists()) {
            // ドキュメントが存在しない場合は新規作成
            const updateData = TeamMatchMapper.toFirestoreForUpdate(patch);
            await setDoc(docRef, {
                matchId,
                ...updateData,
                createdAt: now,
                updatedAt: now,
            });
        } else {
            // 既存データに更新内容をマージ
            const currentData = currentSnap.data() as FirestoreTeamMatchDoc;
            const updateData = TeamMatchMapper.toFirestoreForUpdate(patch);
            const mergedData = {
                ...currentData, // 既存データを全て保持
                ...updateData,  // 更新内容で上書き
                createdAt: currentData.createdAt || now,
                updatedAt: now,
            };

            await setDoc(docRef, mergedData);
        }

        const snap = await getDoc(docRef);
        const data = snap.data() as FirestoreTeamMatchDoc;
        return TeamMatchMapper.toDomain({ ...data, id: snap.id });
    }

    async delete(orgId: string, tournamentId: string, matchGroupId: string, matchId: string): Promise<void> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId, matchGroupId);
        const docRef = doc(collectionRef, matchId);
        await deleteDoc(docRef);
    }

    listenAll(orgId: string, tournamentId: string, matchGroupId: string, onChange: (matches: TeamMatch[]) => void): () => void {
        const collectionRef = this.getCollectionRef(orgId, tournamentId, matchGroupId);
        const q = query(collectionRef, orderBy("sortOrder", "asc"));
        const unsub: Unsubscribe = onSnapshot(q, (snapshot) => {
            const matches = snapshot.docs.map((d) => {
                const data = d.data() as FirestoreTeamMatchDoc;
                return TeamMatchMapper.toDomain({ ...data, id: d.id });
            });
            onChange(matches);
        });
        return () => unsub();
    }
}
