import {
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  QueryConstraint,
} from "firebase/firestore";
import { clientCollections, clientDocs } from "./collections";
import { TeamMapper, type FirestoreTeamDoc } from "../mappers/team-mapper";
import type { Team } from "@/types/team.schema";

/**
 * Team データアクセスクラス
 * Firestoreとの直接通信を担当
 */
export class TeamData {
  constructor(
    private readonly orgId: string,
    private readonly tournamentId: string
  ) {}

  /**
   * 新しいチームを作成
   */
  async createTeam(team: Partial<Team>): Promise<string> {
    const teamsCollection = clientCollections.teams(
      this.orgId,
      this.tournamentId
    );
    const firestoreData = TeamMapper.toFirestoreForCreate(team);

    const docRef = await addDoc(teamsCollection, firestoreData);
    return docRef.id;
  }

  /**
   * チームIDでチームを取得
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    const teamDoc = clientDocs.team(this.orgId, this.tournamentId, teamId);
    const docSnap = await getDoc(teamDoc);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as FirestoreTeamDoc;
    return TeamMapper.toDomain({ ...data, id: docSnap.id });
  }

  /**
   * すべてのチームを取得
   */
  async getAllTeams(): Promise<Team[]> {
    const teamsCollection = clientCollections.teams(
      this.orgId,
      this.tournamentId
    );
    const querySnapshot = await getDocs(
      query(teamsCollection, orderBy("createdAt", "desc"))
    );

    return TeamMapper.toDomainsFromQuerySnapshot(
      querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: () => doc.data() as FirestoreTeamDoc,
      }))
    );
  }

  /**
   * 承認状態でチームをフィルター取得
   */
  async getTeamsByApprovalStatus(isApproved: boolean): Promise<Team[]> {
    const teamsCollection = clientCollections.teams(
      this.orgId,
      this.tournamentId
    );
    const q = query(
      teamsCollection,
      where("isApproved", "==", isApproved),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return TeamMapper.toDomainsFromQuerySnapshot(
      querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: () => doc.data() as FirestoreTeamDoc,
      }))
    );
  }

  /**
   * チーム名で検索
   */
  async getTeamsByName(teamName: string): Promise<Team[]> {
    const teamsCollection = clientCollections.teams(
      this.orgId,
      this.tournamentId
    );
    const q = query(
      teamsCollection,
      where("teamName", "==", teamName),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return TeamMapper.toDomainsFromQuerySnapshot(
      querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: () => doc.data() as FirestoreTeamDoc,
      }))
    );
  }

  /**
   * チーム情報を更新
   */
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    const teamDoc = clientDocs.team(this.orgId, this.tournamentId, teamId);
    const updateData = TeamMapper.toFirestoreForUpdate(updates);

    await updateDoc(teamDoc, updateData);
  }

  /**
   * チームの承認状態を更新
   */
  async updateApprovalStatus(
    teamId: string,
    isApproved: boolean
  ): Promise<void> {
    const teamDoc = clientDocs.team(this.orgId, this.tournamentId, teamId);

    await updateDoc(teamDoc, {
      isApproved,
      updatedAt: new Date(),
    });
  }

  /**
   * チームを削除
   */
  async deleteTeam(teamId: string): Promise<void> {
    const teamDoc = clientDocs.team(this.orgId, this.tournamentId, teamId);
    await deleteDoc(teamDoc);
  }

  /**
   * リアルタイムでチーム一覧を購読
   */
  subscribeToTeams(
    callback: (teams: Team[]) => void,
    constraints: QueryConstraint[] = []
  ): Unsubscribe {
    const teamsCollection = clientCollections.teams(
      this.orgId,
      this.tournamentId
    );
    const defaultConstraints = [orderBy("createdAt", "desc")];
    const q = query(teamsCollection, ...defaultConstraints, ...constraints);

    return onSnapshot(q, querySnapshot => {
      const teams = TeamMapper.toDomainsFromQuerySnapshot(
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          data: () => doc.data() as FirestoreTeamDoc,
        }))
      );
      callback(teams);
    });
  }

  /**
   * 特定チームの変更をリアルタイム購読
   */
  subscribeToTeam(
    teamId: string,
    callback: (team: Team | null) => void
  ): Unsubscribe {
    const teamDoc = clientDocs.team(this.orgId, this.tournamentId, teamId);

    return onSnapshot(teamDoc, docSnap => {
      if (!docSnap.exists()) {
        callback(null);
        return;
      }

      const data = docSnap.data() as FirestoreTeamDoc;
      const team = TeamMapper.toDomain({ ...data, id: docSnap.id });
      callback(team);
    });
  }

  /**
   * バッチ処理でチーム情報を一括更新
   */
  async batchUpdateTeams(
    updates: Array<{ teamId: string; data: Partial<Team> }>
  ): Promise<void> {
    // 注: 実際のバッチ処理の実装はFirestoreのwriteBatchを使用
    // ここでは簡単な逐次更新として実装
    const updatePromises = updates.map(({ teamId, data }) =>
      this.updateTeam(teamId, data)
    );

    await Promise.all(updatePromises);
  }

  /**
   * チーム数をカウント
   */
  async getTeamCount(): Promise<number> {
    const teams = await this.getAllTeams();
    return teams.length;
  }

  /**
   * 承認済みチーム数をカウント
   */
  async getApprovedTeamCount(): Promise<number> {
    const approvedTeams = await this.getTeamsByApprovalStatus(true);
    return approvedTeams.length;
  }
}
