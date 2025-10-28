import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc as firestoreUpdateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    CollectionReference,
    DocumentSnapshot,
    QuerySnapshot,
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { TournamentMapper, FirestoreTournamentDoc, FirestoreTournamentCreateDoc } from "@/data/mappers/tournament-mapper";
import type { Tournament, TournamentCreate } from "@/types/tournament.schema";
import type { TournamentRepository } from "@/repositories/tournament-repository";

/**
 * Firestore 実装の TournamentRepository
 */
export class FirestoreTournamentRepository implements TournamentRepository {
    private collectionRef: CollectionReference<DocumentData>;

    constructor() {
        this.collectionRef = collection(db, "tournaments");
    }

    async getById(tournamentId: string): Promise<Tournament | null> {
        const docRef = doc(this.collectionRef, tournamentId);
        const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        if (!snap.exists()) return null;
        const data = snap.data() as FirestoreTournamentDoc | undefined;
        if (!data) return null;
        return TournamentMapper.toDomain({ ...data, id: snap.id });
    }

    async listAll(): Promise<Tournament[]> {
        const q = query(this.collectionRef, orderBy("createdAt", "desc"));
        const snaps: QuerySnapshot<DocumentData> = await getDocs(q);
        const tournaments: Tournament[] = snaps.docs.map((snap: QueryDocumentSnapshot<DocumentData>) => {
            const data = snap.data() as FirestoreTournamentDoc;
            return TournamentMapper.toDomain({ ...data, id: snap.id });
        });
        return tournaments;
    }

    async create(tournamentCreate: TournamentCreate): Promise<Tournament> {
        const createDoc: FirestoreTournamentCreateDoc = TournamentMapper.toFirestoreCreate(tournamentCreate);
        const docRef = await addDoc(this.collectionRef, createDoc);

        // 作成されたドキュメントを取得して返す
        const createdSnap = await getDoc(docRef);
        if (!createdSnap.exists()) {
            throw new Error("Failed to retrieve created tournament");
        }

        const data = createdSnap.data() as FirestoreTournamentDoc;
        return TournamentMapper.toDomain({ ...data, id: createdSnap.id });
    }

    async update(tournamentId: string, patch: Partial<Tournament>): Promise<Tournament> {
        const docRef = doc(this.collectionRef, tournamentId);
        const updateDoc = TournamentMapper.toFirestoreUpdate(patch);

        await firestoreUpdateDoc(docRef, updateDoc);

        // 更新されたドキュメントを取得して返す
        const updatedSnap = await getDoc(docRef);
        if (!updatedSnap.exists()) {
            throw new Error("Tournament not found after update");
        }

        const data = updatedSnap.data() as FirestoreTournamentDoc;
        return TournamentMapper.toDomain({ ...data, id: updatedSnap.id });
    }

    async delete(tournamentId: string): Promise<void> {
        const docRef = doc(this.collectionRef, tournamentId);
        await deleteDoc(docRef);
    }

    listenAll(callback: (tournaments: Tournament[]) => void): Unsubscribe {
        const q = query(this.collectionRef, orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const tournaments = snapshot.docs.map((snap: QueryDocumentSnapshot<DocumentData>) => {
                const data = snap.data() as FirestoreTournamentDoc;
                return TournamentMapper.toDomain({ ...data, id: snap.id });
            });
            callback(tournaments);
        });
    }
}