import { Timestamp } from "firebase/firestore";
import type { TeamMatch } from "@/types/team-match.schema";
import type { MatchPlayer } from "@/types/match.schema";
import { teamMatchSchema } from "@/types/team-match.schema";
import { matchPlayerSchema } from "@/types/match.schema";
import { FirestoreMatchPlayerDoc } from "./match-mapper";

// TeamMatch用のFirestoreドキュメント型定義
export interface FirestoreTeamMatchDoc {
    matchId: string;
    matchGroupId: string;
    roundId: string;
    sortOrder: number;
    players: {
        playerA: FirestoreMatchPlayerDoc;
        playerB: FirestoreMatchPlayerDoc;
    };
    isCompleted: boolean;
    winner?: "playerA" | "playerB" | "draw" | "none" | null;
    winReason?: "ippon" | "hantei" | "hansoku" | "fusen" | "none" | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type FirestoreTeamMatchCreateDoc = Omit<
    FirestoreTeamMatchDoc,
    "createdAt" | "updatedAt"
>;

export class TeamMatchMapper {
    static toDomain(doc: FirestoreTeamMatchDoc & { id?: string }): TeamMatch {
        const matchId = doc.id || doc.matchId;
        if (!matchId) throw new Error("Match ID required");
        if (!doc.createdAt || !doc.updatedAt) throw new Error("Timestamps required");

        const data: TeamMatch = {
            matchId,
            matchGroupId: doc.matchGroupId,
            roundId: doc.roundId,
            sortOrder: doc.sortOrder,
            players: {
                playerA: this.playerToDomain(doc.players.playerA),
                playerB: this.playerToDomain(doc.players.playerB),
            },
            isCompleted: doc.isCompleted,
            winner: doc.winner || "none",
            winReason: doc.winReason || "none",
            createdAt: doc.createdAt.toDate(),
            updatedAt: doc.updatedAt.toDate(),
        };

        const result = teamMatchSchema.safeParse(data);
        if (!result.success) throw new Error(`Invalid TeamMatch (${matchId}): ${result.error.message}`);
        return result.data;
    }

    private static playerToDomain(player: FirestoreMatchPlayerDoc): MatchPlayer {
        const data: MatchPlayer = {
            playerId: player.playerId,
            teamId: player.teamId,
            score: player.score,
            hansoku: player.hansoku,
        };
        const result = matchPlayerSchema.safeParse(data);
        if (!result.success) throw new Error(`Invalid player: ${result.error.message}`);
        return result.data;
    }

    static toFirestoreForCreate(match: Partial<TeamMatch> & { id?: string }): FirestoreTeamMatchCreateDoc {
        const matchId = match.matchId;
        if (!matchId) throw new Error("ID required");
        if (!match.matchGroupId) throw new Error("MatchGroupId required");
        if (!match.roundId || match.sortOrder === undefined || !match.players) throw new Error("Missing fields");

        return {
            matchId,
            matchGroupId: match.matchGroupId,
            roundId: match.roundId,
            sortOrder: match.sortOrder,
            players: {
                playerA: this.playerToFirestore(match.players.playerA),
                playerB: this.playerToFirestore(match.players.playerB),
            },
            isCompleted: false,
            winner: "none",
            winReason: "none",
        };
    }

    static toFirestoreForUpdate(match: Partial<TeamMatch>): Partial<FirestoreTeamMatchDoc> {
        const data: Partial<FirestoreTeamMatchDoc> = {};
        if (match.matchGroupId) {
            data.matchGroupId = match.matchGroupId;
        }
        if (match.roundId) {
            data.roundId = match.roundId;
        }
        if (match.sortOrder !== undefined) data.sortOrder = match.sortOrder;
        if (match.isCompleted !== undefined) data.isCompleted = match.isCompleted;
        if (match.winner !== undefined) data.winner = match.winner;
        if (match.winReason !== undefined) data.winReason = match.winReason;
        if (match.players) {
            data.players = {
                playerA: this.playerToFirestore(match.players.playerA),
                playerB: this.playerToFirestore(match.players.playerB),
            };
        }
        return data;
    }

    private static playerToFirestore(player: MatchPlayer): FirestoreMatchPlayerDoc {
        return {
            playerId: player.playerId,
            teamId: player.teamId,
            score: player.score,
            hansoku: player.hansoku,
        };
    }
}
