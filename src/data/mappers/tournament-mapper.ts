import { Timestamp } from "firebase/firestore";
import type { Tournament } from "@/types/tournament.schema";
import { tournamentSchema } from "@/types/tournament.schema";

/**
 * Firestore ドキュメント型（新規作成用）
 */
export interface FirestoreTournamentCreateDoc {
    tournamentName: string;
    tournamentDate: string;
    location: string;
    defaultMatchTime: number;
    courts: FirestoreCourtDoc[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * Firestore ドキュメント型（取得時・更新時）
 */
export interface FirestoreTournamentDoc extends FirestoreTournamentCreateDoc {
    tournamentId?: string; // ドキュメントIDとして別途取得
}

export interface FirestoreCourtDoc {
    courtId: string;
    courtName: string;
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
            throw new Error("CreatedAt and UpdatedAt timestamps are required for domain conversion");
        }

        const domainData = {
            tournamentId,
            tournamentName: doc.tournamentName,
            tournamentDate: doc.tournamentDate,
            location: doc.location,
            defaultMatchTime: doc.defaultMatchTime,
            courts: doc.courts.map(court => ({
                courtId: court.courtId,
                courtName: court.courtName,
            })),
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
    static toFirestoreCreate(tournament: Omit<Tournament, "tournamentId" | "createdAt" | "updatedAt">): FirestoreTournamentCreateDoc {
        const now = Timestamp.now();
        return {
            tournamentName: tournament.tournamentName,
            tournamentDate: tournament.tournamentDate,
            location: tournament.location,
            defaultMatchTime: tournament.defaultMatchTime,
            courts: tournament.courts.map(court => ({
                courtId: court.courtId,
                courtName: court.courtName,
            })),
            createdAt: now,
            updatedAt: now,
        };
    }

    /**
     * ドメインエンティティからFirestore更新用ドキュメントに変換
     */
    static toFirestoreUpdate(tournament: Partial<Tournament>): Partial<FirestoreTournamentDoc> {
        const updateDoc: Partial<FirestoreTournamentDoc> = {
            updatedAt: Timestamp.now(),
        };

        if (tournament.tournamentName !== undefined) {
            updateDoc.tournamentName = tournament.tournamentName;
        }
        if (tournament.tournamentDate !== undefined) {
            updateDoc.tournamentDate = tournament.tournamentDate;
        }
        if (tournament.location !== undefined) {
            updateDoc.location = tournament.location;
        }
        if (tournament.defaultMatchTime !== undefined) {
            updateDoc.defaultMatchTime = tournament.defaultMatchTime;
        }
        if (tournament.courts !== undefined) {
            updateDoc.courts = tournament.courts.map(court => ({
                courtId: court.courtId,
                courtName: court.courtName,
            }));
        }

        return updateDoc;
    }
}