import type { MatchGroup, MatchGroupCreate } from "@/types/match.schema";

export interface MatchGroupRepository {
    getById(orgId: string, tournamentId: string, matchGroupId: string): Promise<MatchGroup | null>;
    listAll(orgId: string, tournamentId: string): Promise<MatchGroup[]>;
    create(orgId: string, tournamentId: string, matchGroup: MatchGroupCreate): Promise<MatchGroup>;
    update(orgId: string, tournamentId: string, matchGroupId: string, patch: Partial<MatchGroup>): Promise<MatchGroup>;
    delete(orgId: string, tournamentId: string, matchGroupId: string): Promise<void>;
    listenAll(orgId: string, tournamentId: string, onChange: (matchGroups: MatchGroup[]) => void): () => void;
}
