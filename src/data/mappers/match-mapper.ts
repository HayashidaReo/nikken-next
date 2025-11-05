import { Timestamp } from "firebase/firestore";
import type { Match, MatchPlayer } from "@/types/match.schema";
import { matchSchema, matchPlayerSchema } from "@/types/match.schema";

/**
 * Firestore ドキュメント型
 */
export interface FirestoreMatchDoc {
    matchId: string; // ドキュメントIDをフィールドとして保存
    courtId: string;
    round: string;
    players: {
        playerA: FirestoreMatchPlayerDoc;
        playerB: FirestoreMatchPlayerDoc;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type FirestoreMatchCreateDoc = Omit<
    FirestoreMatchDoc,
    "createdAt" | "updatedAt"
>;

export interface FirestoreMatchPlayerDoc {
    displayName: string;
    playerId: string;
    teamId: string;
    teamName: string;
    score: number;
    hansoku: number;
}

/**
 * Matchマッパークラス
 * ドメインエンティティ ↔ Firestoreドキュメント間の変換を担当
 */
export class MatchMapper {
    /**
     * FirestoreドキュメントからドメインエンティティMatchに変換
     */
    static toDomain(doc: FirestoreMatchDoc & { id?: string }): Match {
        // 必須フィールドの存在チェック
        const matchId = doc.id || doc.matchId;
        if (!matchId) {
            throw new Error("Match ID is required for domain conversion");
        }

        if (!doc.createdAt || !doc.updatedAt) {
            throw new Error(
                "CreatedAt and UpdatedAt timestamps are required for domain conversion"
            );
        }

        // Firestore Timestamp を Date に変換
        const createdAt = doc.createdAt.toDate();
        const updatedAt = doc.updatedAt.toDate();

        // ドメインエンティティを構築
        const matchData: Match = {
            matchId,
            courtId: doc.courtId,
            round: doc.round,
            players: {
                playerA: this.playerToDomain(doc.players.playerA),
                playerB: this.playerToDomain(doc.players.playerB),
            },
            createdAt,
            updatedAt,
        };

        // Zodスキーマでバリデーション
        const result = matchSchema.safeParse(matchData);
        if (!result.success) {
            throw new Error(
                `Invalid match data from Firestore: ${result.error.message}`
            );
        }

        return result.data;
    }

    /**
     * 選手データをドメインエンティティに変換
     */
    private static playerToDomain(
        player: FirestoreMatchPlayerDoc
    ): MatchPlayer {
        const playerData: MatchPlayer = {
            displayName: player.displayName,
            playerId: player.playerId,
            teamId: player.teamId,
            teamName: player.teamName,
            score: player.score,
            hansoku: player.hansoku,
        };

        // Zodスキーマでバリデーション
        const result = matchPlayerSchema.safeParse(playerData);
        if (!result.success) {
            throw new Error(
                `Invalid player data from Firestore: ${result.error.message}`
            );
        }

        return result.data;
    }

    /**
     * ドメインエンティティからFirestoreドキュメント（作成用）に変換
     */
    static toFirestoreForCreate(
        match: Partial<Match> & { id?: string }
    ): FirestoreMatchCreateDoc {
        if (!match.courtId || !match.round || !match.players) {
            throw new Error("Required fields missing for match creation");
        }

        if (!match.players.playerA || !match.players.playerB) {
            throw new Error("Both playerA and playerB are required");
        }

        const matchId = match.id || match.matchId;
        if (!matchId) {
            throw new Error("Match ID is required for creation");
        }

        return {
            matchId,
            courtId: match.courtId,
            round: match.round,
            players: {
                playerA: this.playerToFirestore(match.players.playerA),
                playerB: this.playerToFirestore(match.players.playerB),
            },
        };
    }

    /**
     * ドメインエンティティからFirestoreドキュメント（更新用）に変換
     */
    static toFirestoreForUpdate(
        match: Partial<Match>
    ): Partial<FirestoreMatchDoc> {
        const firestoreData: Partial<FirestoreMatchDoc> = {};

        if (match.courtId !== undefined) {
            firestoreData.courtId = match.courtId;
        }
        if (match.round !== undefined) {
            firestoreData.round = match.round;
        }
        if (match.players !== undefined) {
            firestoreData.players = {
                playerA: this.playerToFirestore(match.players.playerA),
                playerB: this.playerToFirestore(match.players.playerB),
            };
        }

        // updatedAtは自動で設定されるため、ここでは設定しない
        return firestoreData;
    }

    /**
     * ドメイン選手データをFirestore形式に変換
     */
    private static playerToFirestore(
        player: MatchPlayer
    ): FirestoreMatchPlayerDoc {
        return {
            displayName: player.displayName,
            playerId: player.playerId,
            teamId: player.teamId,
            teamName: player.teamName,
            score: player.score,
            hansoku: player.hansoku,
        };
    }

    /**
     * 複数のFirestoreドキュメントを一括でドメインエンティティに変換
     */
    static toDomainArray(
        docs: Array<FirestoreMatchDoc & { id?: string }>
    ): Match[] {
        return docs.map((doc) => this.toDomain(doc));
    }

    /**
     * 試合IDのみを使用してFirestore参照用の部分オブジェクトを作成
     */
    static createMinimalForReference(matchId: string): { matchId: string } {
        return { matchId };
    }
}