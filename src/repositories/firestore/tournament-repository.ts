import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { tournamentDocsToTournaments } from "@/lib/utils/firestore-helpers";
import {
  TournamentMapper,
  FirestoreTournamentDoc,
  FirestoreTournamentCreateDoc,
} from "@/data/mappers/tournament-mapper";
import type { Tournament, TournamentCreate } from "@/types/tournament.schema";
import type { TournamentRepository } from "@/repositories/tournament-repository";

/**
 * Firestore 実装の TournamentRepository
 * 組織階層構造に対応
 */
export class FirestoreTournamentRepository implements TournamentRepository {
  /**
   * 特定の組織のtournamentsコレクション参照を取得
   */
  private getCollectionRef(orgId: string): CollectionReference<DocumentData> {
    return collection(db, `organizations/${orgId}/tournaments`);
  }

  async getById(orgId: string, tournamentId: string): Promise<Tournament | null> {
    const collectionRef = this.getCollectionRef(orgId);
    const docRef = doc(collectionRef, tournamentId);
    const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data() as FirestoreTournamentDoc | undefined;
    if (!data) return null;
    return TournamentMapper.toDomain({ ...data, id: snap.id });
  }

  async listAll(orgId: string): Promise<Tournament[]> {
    const collectionRef = this.getCollectionRef(orgId);
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    const snaps: QuerySnapshot<DocumentData> = await getDocs(q);
    return tournamentDocsToTournaments(snaps.docs);
  }

  async create(orgId: string, tournament: TournamentCreate): Promise<Tournament> {
    const collectionRef = this.getCollectionRef(orgId);

    // tournamentId が指定されている場合はそれを使用、なければ生成
    const tournamentWithId = tournament as TournamentCreate & { tournamentId?: string };
    const tournamentId = tournamentWithId.tournamentId || doc(collectionRef).id;
    const docRef = doc(collectionRef, tournamentId);

    // ドキュメントIDをフィールドに含めて保存
    const createDoc: FirestoreTournamentCreateDoc =
      TournamentMapper.toFirestoreCreate({ ...tournament, id: tournamentId });

    // 同期処理でクライアント生成IDを使用する場合に対応するため merge: true
    await setDoc(docRef, createDoc, { merge: true });

    // 作成されたドキュメントを取得して返す
    const createdSnap = await getDoc(docRef);
    if (!createdSnap.exists()) {
      throw new Error("Failed to retrieve created tournament");
    }

    const data = createdSnap.data() as FirestoreTournamentDoc;
    return TournamentMapper.toDomain({ ...data, id: createdSnap.id });
  }

  async update(
    orgId: string,
    tournamentId: string,
    patch: Partial<Tournament>
  ): Promise<Tournament> {
    const collectionRef = this.getCollectionRef(orgId);
    const docRef = doc(collectionRef, tournamentId);
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

  async delete(orgId: string, tournamentId: string): Promise<void> {
    const collectionRef = this.getCollectionRef(orgId);
    const docRef = doc(collectionRef, tournamentId);
    await deleteDoc(docRef);
  }

  listenAll(orgId: string, callback: (tournaments: Tournament[]) => void): Unsubscribe {
    const collectionRef = this.getCollectionRef(orgId);
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tournaments = tournamentDocsToTournaments(snapshot.docs);
      callback(tournaments);
    });
  }
}
