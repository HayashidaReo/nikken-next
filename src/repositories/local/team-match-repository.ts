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
        return await db.teamMatches
            .where({ organizationId: orgId, tournamentId })
            .filter(m => m.isSynced === false)
            .toArray();
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
}

export const localTeamMatchRepository = new LocalTeamMatchRepository();
