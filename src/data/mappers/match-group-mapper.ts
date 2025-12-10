import { Timestamp } from "firebase/firestore";
import type { MatchGroup } from "@/types/match.schema";
import { matchGroupSchema } from "@/types/match.schema";

export interface FirestoreMatchGroupDoc {
    matchGroupId: string;
    courtId: string;
    roundId: string;
    sortOrder: number;
    teamAId: string;
    teamBId: string;
    isCompleted: boolean;
    winnerTeam?: "teamA" | "teamB";
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type FirestoreMatchGroupCreateDoc = Omit<
    FirestoreMatchGroupDoc,
    "createdAt" | "updatedAt"
>;

export class MatchGroupMapper {
    static toDomain(doc: FirestoreMatchGroupDoc & { id?: string }): MatchGroup {
        const matchGroupId = doc.id || doc.matchGroupId;
        if (!matchGroupId) throw new Error("MatchGroup ID is required");
        if (!doc.createdAt || !doc.updatedAt) throw new Error("Timestamps required");

        const data: MatchGroup = {
            matchGroupId,
            courtId: doc.courtId,
            roundId: doc.roundId,
            sortOrder: doc.sortOrder,
            teamAId: doc.teamAId,
            teamBId: doc.teamBId,
            isCompleted: doc.isCompleted ?? false,
            winnerTeam: doc.winnerTeam,
            createdAt: doc.createdAt.toDate(),
            updatedAt: doc.updatedAt.toDate(),
        };

        const result = matchGroupSchema.safeParse(data);
        if (!result.success) throw new Error(`Invalid MatchGroup: ${result.error.message}`);
        return result.data;
    }

    static toFirestoreForCreate(group: Partial<MatchGroup> & { id?: string }): FirestoreMatchGroupCreateDoc {
        const matchGroupId = group.matchGroupId;
        if (!matchGroupId) throw new Error("ID required");
        if (!group.courtId || !group.roundId || group.sortOrder === undefined || !group.teamAId || !group.teamBId) {
            throw new Error("Missing required fields");
        }

        return {
            matchGroupId,
            courtId: group.courtId,
            roundId: group.roundId,
            sortOrder: group.sortOrder,
            teamAId: group.teamAId,
            teamBId: group.teamBId,
            isCompleted: group.isCompleted ?? false,
            winnerTeam: group.winnerTeam,
        };
    }

    static toFirestoreForUpdate(group: Partial<MatchGroup>): Partial<FirestoreMatchGroupDoc> {
        const data: Partial<FirestoreMatchGroupDoc> = {};
        if (group.matchGroupId) data.matchGroupId = group.matchGroupId;
        if (group.courtId) data.courtId = group.courtId;
        if (group.roundId) {
            data.roundId = group.roundId;
        }
        if (group.sortOrder !== undefined) data.sortOrder = group.sortOrder;
        if (group.teamAId) data.teamAId = group.teamAId;
        if (group.teamBId) data.teamBId = group.teamBId;
        if (group.isCompleted !== undefined) data.isCompleted = group.isCompleted;
        if (group.winnerTeam) data.winnerTeam = group.winnerTeam;
        return data;
    }
}
