import { Timestamp } from "firebase/firestore";
import type { Tournament } from "@/types/tournament.schema";
import { tournamentSchema } from "@/types/tournament.schema";

/**
 * Firestore ドキュメント型
 */
export interface FirestoreTournamentDoc {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: Timestamp;
  tournamentDetail: string;
  location: string;
  defaultMatchTime: number;
  courts: FirestoreCourtDoc[];
  rounds: FirestoreRoundDoc[];
  tournamentType: "individual" | "team";
  isTeamFormOpen: boolean;
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirestoreTournamentCreateDoc = FirestoreTournamentDoc;

export interface FirestoreCourtDoc {
  courtId: string;
  courtName: string;
}

export interface FirestoreRoundDoc {
  roundId: string;
  roundName: string;
}

/**
 * Tournamentマッパークラス
 * ドメインエンティティ ↔ Firestoreドキュメント間の変換を担当
 */
export class TournamentMapper {
  /**
   * FirestoreドキュメントからドメインエンティティTournamentに変換
   */
  static toDomain(doc: FirestoreTournamentDoc & { id?: string }): Tournament {
    // 必須フィールドの存在チェック
    const tournamentId = doc.id || doc.tournamentId;
    if (!tournamentId) {
      throw new Error("Tournament ID is required for domain conversion");
    }

    if (!doc.createdAt || !doc.updatedAt) {
      throw new Error(
        "CreatedAt and UpdatedAt timestamps are required for domain conversion"
      );
    }

    const domainData = {
      tournamentId,
      tournamentName: doc.tournamentName,
      tournamentDate: doc.tournamentDate.toDate(),
      tournamentDetail: doc.tournamentDetail,
      location: doc.location,
      defaultMatchTime: doc.defaultMatchTime,
      courts: doc.courts.map((court) => ({
        courtId: court.courtId,
        courtName: court.courtName,
      })),
      rounds: (doc.rounds || []).map((round) => ({
        roundId: round.roundId,
        roundName: round.roundName,
      })),
      tournamentType: doc.tournamentType,
      isTeamFormOpen: doc.isTeamFormOpen,
      isArchived: doc.isArchived,
      createdAt: doc.createdAt.toDate(),
      updatedAt: doc.updatedAt.toDate(),
    };

    // Zodスキーマでバリデーション
    const result = tournamentSchema.safeParse(domainData);
    if (!result.success) {
      console.error("Tournament validation failed:", result.error);
      throw new Error(`Invalid tournament data: ${result.error.message}`);
    }

    return result.data;
  }

  /**
   * ドメインエンティティからFirestore新規作成用ドキュメントに変換
   */
  static toFirestoreCreate(
    tournament: Omit<Tournament, "tournamentId" | "createdAt" | "updatedAt"> & {
      id: string;
    }
  ): FirestoreTournamentCreateDoc {
    const now = Timestamp.now();
    return {
      tournamentId: tournament.id,
      tournamentName: tournament.tournamentName,
      tournamentDate: Timestamp.fromDate(tournament.tournamentDate),
      tournamentDetail: tournament.tournamentDetail,
      location: tournament.location,
      defaultMatchTime: tournament.defaultMatchTime,
      courts: tournament.courts.map((court) => ({
        courtId: court.courtId,
        courtName: court.courtName,
      })),
      rounds: tournament.rounds.map((round) => ({
        roundId: round.roundId,
        roundName: round.roundName,
      })),
      tournamentType: tournament.tournamentType,
      isTeamFormOpen: tournament.isTeamFormOpen,
      isArchived: tournament.isArchived,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * ドメインエンティティからFirestore更新用ドキュメントに変換
   */
  static toFirestoreUpdate(
    tournament: Partial<Tournament>
  ): Partial<FirestoreTournamentDoc> {
    const updateDoc: Partial<FirestoreTournamentDoc> = {
      updatedAt: Timestamp.now(),
    };

    if (tournament.tournamentName !== undefined) {
      updateDoc.tournamentName = tournament.tournamentName;
    }
    if (tournament.tournamentDate !== undefined) {
      updateDoc.tournamentDate = Timestamp.fromDate(tournament.tournamentDate);
    }
    if (tournament.tournamentDetail !== undefined) {
      updateDoc.tournamentDetail = tournament.tournamentDetail;
    }
    if (tournament.location !== undefined) {
      updateDoc.location = tournament.location;
    }
    if (tournament.defaultMatchTime !== undefined) {
      updateDoc.defaultMatchTime = tournament.defaultMatchTime;
    }
    if (tournament.courts !== undefined) {
      updateDoc.courts = tournament.courts.map((court) => ({
        courtId: court.courtId,
        courtName: court.courtName,
      }));
    }
    if (tournament.rounds !== undefined) {
      updateDoc.rounds = tournament.rounds.map((round) => ({
        roundId: round.roundId,
        roundName: round.roundName,
      }));
    }
    if (tournament.tournamentType !== undefined) {
      updateDoc.tournamentType = tournament.tournamentType;
    }
    if (tournament.isTeamFormOpen !== undefined) {
      updateDoc.isTeamFormOpen = tournament.isTeamFormOpen;
    }
    if (tournament.isArchived !== undefined) {
      updateDoc.isArchived = tournament.isArchived;
    }

    return updateDoc;
  }
}
