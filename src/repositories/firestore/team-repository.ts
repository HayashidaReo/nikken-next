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
  onSnapshot,
  CollectionReference,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { teamDocsToTeams } from "@/lib/utils/firestore-helpers";
import {
  TeamMapper,
  FirestoreTeamDoc,
  FirestoreTeamCreateDoc,
} from "@/data/mappers/team-mapper";
import type { Team, TeamCreate } from "@/types/team.schema";
import type { TeamRepository } from "@/repositories/team-repository";

/**
 * Firestore 実装の TeamRepository
 * 組織・大会階層構造に対応
 */
export class FirestoreTeamRepository implements TeamRepository {
  /**
   * 特定の組織・大会のteamsコレクション参照を取得
   */
  private getCollectionRef(orgId: string, tournamentId: string): CollectionReference<DocumentData> {
    return collection(db, `organizations/${orgId}/tournaments/${tournamentId}/teams`);
  }

  async getById(orgId: string, tournamentId: string, teamId: string): Promise<Team | null> {
    const collectionRef = this.getCollectionRef(orgId, tournamentId);
    const docRef = doc(collectionRef, teamId);
    const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data() as FirestoreTeamDoc | undefined;
    if (!data) return null;
    return TeamMapper.toDomain({ ...data, id: snap.id });
  }

  async listAll(orgId: string, tournamentId: string): Promise<Team[]> {
    const collectionRef = this.getCollectionRef(orgId, tournamentId);
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    const snaps = await getDocs(q);
    return teamDocsToTeams(snaps.docs);
  }

  async create(orgId: string, tournamentId: string, team: TeamCreate): Promise<Team> {
    const collectionRef = this.getCollectionRef(orgId, tournamentId);

    // ドキュメントIDを生成
    const docRef = doc(collectionRef);
    const teamId = docRef.id;

    // ドキュメントIDをフィールドに含めて保存
    const firestoreDoc: FirestoreTeamCreateDoc =
      TeamMapper.toFirestoreForCreate({ ...team, id: teamId });

    await setDoc(docRef, firestoreDoc);
    const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
    const data = snap.data() as FirestoreTeamDoc | undefined;
    if (!data) throw new Error("Created document has no data");
    return TeamMapper.toDomain({ ...data, id: snap.id });
  }

  async update(orgId: string, tournamentId: string, teamId: string, patch: Partial<Team>): Promise<Team> {
    const collectionRef = this.getCollectionRef(orgId, tournamentId);
    const docRef = doc(collectionRef, teamId);
    const updateData = TeamMapper.toFirestoreForUpdate(
      patch as unknown as Partial<Team>
    );
    await updateDoc(docRef, updateData as Partial<DocumentData>);
    const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
    const data = snap.data() as FirestoreTeamDoc | undefined;
    if (!data) throw new Error("Updated document has no data");
    return TeamMapper.toDomain({ ...data, id: snap.id });
  }

  async delete(orgId: string, tournamentId: string, teamId: string): Promise<void> {
    const collectionRef = this.getCollectionRef(orgId, tournamentId);
    const docRef = doc(collectionRef, teamId);
    await deleteDoc(docRef);
  }

  listenAll(orgId: string, tournamentId: string, onChange: (teams: Team[]) => void): () => void {
    const collectionRef = this.getCollectionRef(orgId, tournamentId);
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    const unsub: Unsubscribe = onSnapshot(q, (snapshot) => {
      const teams = teamDocsToTeams(snapshot.docs);
      onChange(teams);
    });
    return () => unsub();
  }
}

export default FirestoreTeamRepository;
