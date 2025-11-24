import { db, LocalTeamMatch } from '@/lib/db';

export class LocalTeamMatchRepository {
    async getById(matchId: string): Promise<LocalTeamMatch | undefined> {
        return await db.teamMatches.where({ matchId }).first();
    }

    async listAll(orgId: string, tournamentId: string, matchGroupId: string): Promise<LocalTeamMatch[]> {
        return await db.teamMatches
            .where({ organizationId: orgId, tournamentId, matchGroupId })
            .sortBy('sortOrder');
    }

    async put(match: LocalTeamMatch): Promise<number> {
        return await db.teamMatches.put(match);
    }

    async bulkPut(matches: LocalTeamMatch[]): Promise<void> {
        await db.teamMatches.bulkPut(matches);
    }

    async delete(matchId: string): Promise<void> {
        await db.teamMatches.where({ matchId }).delete();
    }

    async deleteByTournament(orgId: string, tournamentId: string): Promise<void> {
        await db.teamMatches.where({ organizationId: orgId, tournamentId }).delete();
    }

    async getUnsynced(orgId: string, tournamentId: string): Promise<LocalTeamMatch[]> {
        const matches = await db.teamMatches
            .where({ organizationId: orgId, tournamentId })
            .toArray();
        return matches.filter(m => m.isSynced === false);
    }

    async countUnsynced(orgId: string, tournamentId: string): Promise<number> {
        return await db.teamMatches
            .where({ organizationId: orgId, tournamentId })
            .filter(m => m.isSynced === false)
            .count();
    }

    async update(id: number, changes: Partial<LocalTeamMatch>): Promise<number> {
        return await db.teamMatches.update(id, changes);
    }

    async create(orgId: string, tournamentId: string, matchGroupId: string, match: Omit<LocalTeamMatch, "matchId" | "matchGroupId" | "organizationId" | "tournamentId" | "isSynced" | "createdAt" | "updatedAt">): Promise<LocalTeamMatch> {
        const id = crypto.randomUUID();
        const now = new Date();
        const newMatch: LocalTeamMatch = {
            ...match,
            matchId: id,
            matchGroupId,
            organizationId: orgId,
            tournamentId,
            isSynced: false,
            createdAt: now,
            updatedAt: now,
        };
        await db.teamMatches.put(newMatch);
        return newMatch;
    }

    async updateByMatchId(matchId: string, changes: Partial<LocalTeamMatch>): Promise<void> {
        const match = await db.teamMatches.where({ matchId }).first();
        if (match && match.id) {
            await db.teamMatches.update(match.id, {
                ...changes,
                isSynced: false,
                updatedAt: new Date(),
            });
        }
    }

    async deleteByMatchId(matchId: string): Promise<void> {
        await db.teamMatches.where({ matchId }).delete();
    }
}

export const localTeamMatchRepository = new LocalTeamMatchRepository();
