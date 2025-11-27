import { db, LocalTeamMatch } from '@/lib/db';

export class LocalTeamMatchRepository {
    async getById(matchId: string): Promise<LocalTeamMatch | undefined> {
        return await db.teamMatches.where({ matchId }).first();
    }

    async listAll(orgId: string, tournamentId: string, matchGroupId: string): Promise<LocalTeamMatch[]> {
        const allMatches = await db.teamMatches
            .where({ organizationId: orgId, tournamentId, matchGroupId })
            .sortBy('sortOrder');

        // 論理削除されていない試合のみ返す
        return allMatches.filter(m => !m._deleted);
    }

    async put(match: LocalTeamMatch): Promise<number> {
        return await db.teamMatches.put(match);
    }

    async bulkPut(matches: LocalTeamMatch[]): Promise<void> {
        await db.teamMatches.bulkPut(matches);
    }

    async delete(matchId: string): Promise<void> {
        await db.teamMatches.where({ matchId }).modify({ _deleted: true, isSynced: false });
    }

    async hardDelete(matchId: string): Promise<void> {
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

    async markAsSynced(matchId: string): Promise<void> {
        await db.teamMatches
            .where("matchId")
            .equals(matchId)
            .modify({ isSynced: true });
    }

    async updateByPk(id: number, changes: Partial<LocalTeamMatch>): Promise<number> {
        return await db.teamMatches.update(id, changes);
    }

    async update(matchId: string, changes: Partial<LocalTeamMatch>): Promise<number> {
        return await db.teamMatches
            .where("matchId")
            .equals(matchId)
            .modify({
                ...changes,
                isSynced: false,
                updatedAt: new Date(),
            });
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

    async updateByMatchId(matchId: string, changes: Partial<LocalTeamMatch>): Promise<number> {
        return this.update(matchId, changes);
    }

    async deleteByMatchId(matchId: string): Promise<void> {
        await db.teamMatches.where({ matchId }).modify({ _deleted: true, isSynced: false });
    }

    async hardDeleteByMatchId(matchId: string): Promise<void> {
        await db.teamMatches.where({ matchId }).delete();
    }
}

export const localTeamMatchRepository = new LocalTeamMatchRepository();
