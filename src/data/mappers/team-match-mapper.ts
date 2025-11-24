import { Timestamp } from "firebase/firestore";
import type { TeamMatch, MatchPlayer } from "@/types/match.schema";
import { teamMatchSchema, matchPlayerSchema } from "@/types/match.schema";
import { FirestoreMatchPlayerDoc } from "./match-mapper";

// TeamMatch用のFirestoreドキュメント型定義
export interface FirestoreTeamMatchDoc {
    matchId: string;
    matchGroupId: string;
    round: string;
    sortOrder: number;
    players: {
        playerA: FirestoreMatchPlayerDoc;
        playerB: FirestoreMatchPlayerDoc;
    };
    isCompleted: boolean;
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
            round: doc.round,
            sortOrder: doc.sortOrder,
            players: {
                playerA: this.playerToDomain(doc.players.playerA),
                playerB: this.playerToDomain(doc.players.playerB),
            },
            isCompleted: doc.isCompleted,
            createdAt: doc.createdAt.toDate(),
            updatedAt: doc.updatedAt.toDate(),
        };

        const result = teamMatchSchema.safeParse(data);
        if (!result.success) throw new Error(`Invalid TeamMatch: ${result.error.message}`);
        return result.data;
    }

    private static playerToDomain(player: FirestoreMatchPlayerDoc): MatchPlayer {
        const data: MatchPlayer = {
            displayName: player.displayName,
            playerId: player.playerId,
            teamId: player.teamId,
            teamName: player.teamName,
            score: player.score,
            hansoku: player.hansoku,
        };
        const result = matchPlayerSchema.safeParse(data);
        if (!result.success) throw new Error(`Invalid player: ${result.error.message}`);
        return result.data;
    }

    static toFirestoreForCreate(match: Partial<TeamMatch> & { id?: string }): FirestoreTeamMatchCreateDoc {
        const matchId = match.id || match.matchId;
        if (!matchId) throw new Error("ID required");
        if (!match.matchGroupId) throw new Error("MatchGroupId required");
        if (!match.round || match.sortOrder === undefined || !match.players) throw new Error("Missing fields");

        return {
            matchId,
            matchGroupId: match.matchGroupId,
            round: match.round,
            sortOrder: match.sortOrder,
            players: {
                playerA: this.playerToFirestore(match.players.playerA),
                playerB: this.playerToFirestore(match.players.playerB),
            },
            isCompleted: false,
        };
    }

    static toFirestoreForUpdate(match: Partial<TeamMatch>): Partial<FirestoreTeamMatchDoc> {
        const data: Partial<FirestoreTeamMatchDoc> = {};
        if (match.round) data.round = match.round;
        if (match.sortOrder !== undefined) data.sortOrder = match.sortOrder;
        if (match.isCompleted !== undefined) data.isCompleted = match.isCompleted;
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
            displayName: player.displayName,
            playerId: player.playerId,
            teamId: player.teamId,
            teamName: player.teamName,
            score: player.score,
            hansoku: player.hansoku,
        };
    }
}
