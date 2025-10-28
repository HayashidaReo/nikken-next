import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
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
import { TeamMapper, FirestoreTeamDoc, FirestoreTeamCreateDoc } from "@/data/mappers/team-mapper";
import type { Team, TeamCreate } from "@/types/team.schema";
import type { TeamRepository } from "@/repositories/team-repository";

/**
 * Firestore 実装の TeamRepository
 */
export class FirestoreTeamRepository implements TeamRepository {
    private collectionRef: CollectionReference<DocumentData>;

    constructor() {
        this.collectionRef = collection(db, "teams");
    }

    async getById(teamId: string): Promise<Team | null> {
        const docRef = doc(this.collectionRef, teamId);
        const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        if (!snap.exists()) return null;
        const data = snap.data() as FirestoreTeamDoc | undefined;
        if (!data) return null;
        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async listAll(): Promise<Team[]> {
        const q = query(this.collectionRef, orderBy("createdAt", "desc"));
        const snaps: QuerySnapshot<DocumentData> = await getDocs(q);
        const teams: Team[] = snaps.docs.map((snap: QueryDocumentSnapshot<DocumentData>) => {
            const data = snap.data() as FirestoreTeamDoc;
            return TeamMapper.toDomain({ ...data, id: snap.id });
        });
        return teams;
    }

    async create(team: TeamCreate): Promise<Team> {
        const firestoreDoc: FirestoreTeamCreateDoc = TeamMapper.toFirestoreForCreate(team as unknown as Partial<Team>);
        const ref = await addDoc(this.collectionRef, firestoreDoc);
        const snap: DocumentSnapshot<DocumentData> = await getDoc(ref);
        const data = snap.data() as FirestoreTeamDoc | undefined;
        if (!data) throw new Error("Created document has no data");
        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async update(teamId: string, patch: Partial<Team>): Promise<Team> {
        const docRef = doc(this.collectionRef, teamId);
        const updateData = TeamMapper.toFirestoreForUpdate(patch as unknown as Partial<Team>);
        await updateDoc(docRef, updateData as Partial<DocumentData>);
        const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        const data = snap.data() as FirestoreTeamDoc | undefined;
        if (!data) throw new Error("Updated document has no data");
        return TeamMapper.toDomain({ ...data, id: snap.id });
    }

    async delete(teamId: string): Promise<void> {
        const docRef = doc(this.collectionRef, teamId);
        await deleteDoc(docRef);
    }

    listenAll(onChange: (teams: Team[]) => void): () => void {
        const q = query(this.collectionRef, orderBy("createdAt", "desc"));
        const unsub: Unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const teams = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
                const data = d.data() as FirestoreTeamDoc;
                return TeamMapper.toDomain({ ...data, id: d.id });
            });
            onChange(teams);
        });
        return () => unsub();
    }
}

export default FirestoreTeamRepository;
