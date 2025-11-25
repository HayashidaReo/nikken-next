import type { TeamMatch, TeamMatchCreate } from "@/types/match.schema";

export interface TeamMatchRepository {
    getById(orgId: string, tournamentId: string, matchGroupId: string, matchId: string): Promise<TeamMatch | null>;
    listAll(orgId: string, tournamentId: string, matchGroupId: string): Promise<TeamMatch[]>;
    create(orgId: string, tournamentId: string, matchGroupId: string, match: TeamMatchCreate): Promise<TeamMatch>;
    update(orgId: string, tournamentId: string, matchGroupId: string, matchId: string, patch: Partial<TeamMatch>): Promise<TeamMatch>;
    delete(orgId: string, tournamentId: string, matchGroupId: string, matchId: string): Promise<void>;
    listenAll(orgId: string, tournamentId: string, matchGroupId: string, onChange: (matches: TeamMatch[]) => void): () => void;
}
