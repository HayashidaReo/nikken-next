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
    serverTimestamp,
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

        const firestoreDoc: FirestoreMatchGroupCreateDoc =
            MatchGroupMapper.toFirestoreForCreate({ ...matchGroup, id: matchGroupId });

        await setDoc(docRef, {
            ...firestoreDoc,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        const snap = await getDoc(docRef);
        const data = snap.data() as FirestoreMatchGroupDoc;
        return MatchGroupMapper.toDomain({ ...data, id: snap.id });
    }

    async update(orgId: string, tournamentId: string, matchGroupId: string, patch: Partial<MatchGroup>): Promise<MatchGroup> {
        const collectionRef = this.getCollectionRef(orgId, tournamentId);
        const docRef = doc(collectionRef, matchGroupId);

        const updateData = MatchGroupMapper.toFirestoreForUpdate(patch);
        await setDoc(docRef, {
            ...updateData,
            updatedAt: serverTimestamp(),
        }, { merge: true });

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
