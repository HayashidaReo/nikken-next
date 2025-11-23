import { Timestamp } from "firebase/firestore";
import type { MatchGroup } from "@/types/match.schema";
import { matchGroupSchema } from "@/types/match.schema";

export interface FirestoreMatchGroupDoc {
    matchGroupId: string;
    courtId: string;
    round: string;
    sortOrder: number;
    teamAId: string;
    teamBId: string;
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
            round: doc.round,
            sortOrder: doc.sortOrder,
            teamAId: doc.teamAId,
            teamBId: doc.teamBId,
            createdAt: doc.createdAt.toDate(),
            updatedAt: doc.updatedAt.toDate(),
        };

        const result = matchGroupSchema.safeParse(data);
        if (!result.success) throw new Error(`Invalid MatchGroup: ${result.error.message}`);
        return result.data;
    }

    static toFirestoreForCreate(group: Partial<MatchGroup> & { id?: string }): FirestoreMatchGroupCreateDoc {
        const matchGroupId = group.id || group.matchGroupId;
        if (!matchGroupId) throw new Error("ID required");
        if (!group.courtId || !group.round || group.sortOrder === undefined || !group.teamAId || !group.teamBId) {
            throw new Error("Missing required fields");
        }

        return {
            matchGroupId,
            courtId: group.courtId,
            round: group.round,
            sortOrder: group.sortOrder,
            teamAId: group.teamAId,
            teamBId: group.teamBId,
        };
    }

    static toFirestoreForUpdate(group: Partial<MatchGroup>): Partial<FirestoreMatchGroupDoc> {
        const data: Partial<FirestoreMatchGroupDoc> = {};
        if (group.courtId) data.courtId = group.courtId;
        if (group.round) data.round = group.round;
        if (group.sortOrder !== undefined) data.sortOrder = group.sortOrder;
        if (group.teamAId) data.teamAId = group.teamAId;
        if (group.teamBId) data.teamBId = group.teamBId;
        return data;
    }
}
