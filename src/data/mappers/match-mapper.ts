import { Timestamp } from "firebase/firestore";
import type { Match, MatchPlayer } from "@/types/match.schema";
import { matchSchema, matchPlayerSchema } from "@/types/match.schema";

/**
 * Firestore ドキュメント型
 */
export interface FirestoreMatchDoc {
    matchId: string; // ドキュメントIDをフィールドとして保存
    courtId: string;
    roundId: string;
    sortOrder: number; // 表示順序（昇順で並び替え）
    players: {
        playerA: FirestoreMatchPlayerDoc;
        playerB: FirestoreMatchPlayerDoc;
    };
    isCompleted: boolean; // 試合完了フラグ
    winner?: "playerA" | "playerB" | "draw" | "none" | null;
    winReason?: "ippon" | "hantei" | "hansoku" | "fusen" | "none" | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type FirestoreMatchCreateDoc = Omit<
    FirestoreMatchDoc,
    "createdAt" | "updatedAt"
>;

export interface FirestoreMatchPlayerDoc {
    playerId: string;
    teamId: string;
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
            roundId: doc.roundId,
            sortOrder: doc.sortOrder,
            players: {
                playerA: this.playerToDomain(doc.players.playerA),
                playerB: this.playerToDomain(doc.players.playerB),
            },
            isCompleted: doc.isCompleted,
            winner: doc.winner || "none",
            winReason: doc.winReason || "none",
            createdAt,
            updatedAt,
        };

        // Zodスキーマでバリデーション
        const result = matchSchema.safeParse(matchData);
        if (!result.success) {
            throw new Error(
                `Invalid match data from Firestore (${matchId}): ${result.error.message}`
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
            playerId: player.playerId,
            teamId: player.teamId,
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
        if (!match.courtId || !match.roundId || !match.players || match.sortOrder === undefined) {
            throw new Error("Required fields missing for match creation");
        }

        if (!match.players.playerA || !match.players.playerB) {
            throw new Error("Both playerA and playerB are required");
        }

        const matchId = match.matchId;
        if (!matchId) {
            throw new Error("Match ID is required for creation");
        }

        return {
            matchId,
            courtId: match.courtId,
            roundId: match.roundId,
            sortOrder: match.sortOrder,
            players: {
                playerA: this.playerToFirestore(match.players.playerA),
                playerB: this.playerToFirestore(match.players.playerB),
            },
            isCompleted: false, // 組み合わせ作成時は必ずfalse
            winner: "none",
            winReason: "none",
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
        if (match.roundId !== undefined) {
            firestoreData.roundId = match.roundId;
        }
        if (match.players !== undefined) {
            firestoreData.players = {
                playerA: this.playerToFirestore(match.players.playerA),
                playerB: this.playerToFirestore(match.players.playerB),
            };
        }
        // sortOrder が指定されている場合は更新データに含める
        if (match.sortOrder !== undefined) {
            firestoreData.sortOrder = match.sortOrder;
        }
        if (match.isCompleted !== undefined) {
            firestoreData.isCompleted = match.isCompleted;
        }
        if (match.winner !== undefined) {
            firestoreData.winner = match.winner;
        }
        if (match.winReason !== undefined) {
            firestoreData.winReason = match.winReason;
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
            playerId: player.playerId,
            teamId: player.teamId,
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