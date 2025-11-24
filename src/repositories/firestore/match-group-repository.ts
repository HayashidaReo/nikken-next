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
    MatchGroupMapper,
    FirestoreMatchGroupDoc,
    FirestoreMatchGroupCreateDoc,
} from "@/data/mappers/match-group-mapper";
import type { MatchGroup, MatchGroupCreate } from "@/types/match.schema";
import type { MatchGroupRepository } from "@/repositories/match-group-repository";

export class FirestoreMatchGroupRepository implements MatchGroupRepository {
    private getCollectionRef(orgId: string, tournamentId: string): CollectionReference<DocumentData> {
        return collection(
            db,
            `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCH_GROUPS}`
        );
    }

    async getById(orgId: string, tournamentId: string, matchGroupId: string): Promise<MatchGroup | null> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef, matchGroupId);
        const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        if (!snap.exists()) return null;
        const data = snap.data() as FirestoreMatchGroupDoc | undefined;
        if (!data) return null;
        return MatchGroupMapper.toDomain({ ...data, id: snap.id });
    }

    async listAll(orgId: string, tournamentId: string): Promise<MatchGroup[]> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const q = query(collectionRef, orderBy("sortOrder", "asc"));
        const snaps = await getDocs(q);
        return snaps.docs.map((snap) => {
            const data = snap.data() as FirestoreMatchGroupDoc;
            return MatchGroupMapper.toDomain({ ...data, id: snap.id });
        });
    }

    async create(orgId: string, tournamentId: string, matchGroup: MatchGroupCreate): Promise<MatchGroup> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef);
        const matchGroupId = docRef.id;

        const now = Timestamp.now();

        const firestoreDoc: FirestoreMatchGroupCreateDoc =
            MatchGroupMapper.toFirestoreForCreate({ ...matchGroup, id: matchGroupId });

        await setDoc(docRef, {
            ...firestoreDoc,
            createdAt: now,
            updatedAt: now,
        });

        const snap = await getDoc(docRef);
        const data = snap.data() as FirestoreMatchGroupDoc;
        return MatchGroupMapper.toDomain({ ...data, id: snap.id });
    }

    async update(orgId: string, tournamentId: string, matchGroupId: string, patch: Partial<MatchGroup>): Promise<MatchGroup> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef, matchGroupId);

        // 既存データを読み込み
        const currentSnap = await getDoc(docRef);
        const now = Timestamp.now();

        if (!currentSnap.exists()) {
            // ドキュメントが存在しない場合は新規作成
            const updateData = MatchGroupMapper.toFirestoreForUpdate(patch);
            await setDoc(docRef, {
                matchGroupId,
                ...updateData,
                createdAt: now,
                updatedAt: now,
            });
        } else {
            // 既存データに更新内容をマージ
            const currentData = currentSnap.data() as FirestoreMatchGroupDoc;
            const updateData = MatchGroupMapper.toFirestoreForUpdate(patch);
            const mergedData = {
                ...currentData, // 既存データを全て保持
                ...updateData,  // 更新内容で上書き
                createdAt: currentData.createdAt || now,
                updatedAt: now,
            };
            
            await setDoc(docRef, mergedData);
        }

        const snap = await getDoc(docRef);
        const data = snap.data() as FirestoreMatchGroupDoc;
        return MatchGroupMapper.toDomain({ ...data, id: snap.id });
    }

    async delete(orgId: string, tournamentId: string, matchGroupId: string): Promise<void> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef, matchGroupId);
        await deleteDoc(docRef);
    }

    listenAll(orgId: string, tournamentId: string, onChange: (matchGroups: MatchGroup[]) => void): () => void {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const q = query(collectionRef, orderBy("sortOrder", "asc"));
        const unsub: Unsubscribe = onSnapshot(q, (snapshot) => {
            const groups = snapshot.docs.map((d) => {
                const data = d.data() as FirestoreMatchGroupDoc;
                return MatchGroupMapper.toDomain({ ...data, id: d.id });
            });
            onChange(groups);
        });
        return () => unsub();
    }
}
