import { db, LocalMatchGroup } from '@/lib/db';

export class LocalMatchGroupRepository {
    async getById(matchGroupId: string): Promise<LocalMatchGroup | undefined> {
        return await db.matchGroups.where({ matchGroupId }).first();
    }

    async listAll(orgId: string, tournamentId: string): Promise<LocalMatchGroup[]> {
        return await db.matchGroups
            .where({ organizationId: orgId, tournamentId })
            .sortBy('sortOrder');
    }

    async put(matchGroup: LocalMatchGroup): Promise<number> {
        return await db.matchGroups.put(matchGroup);
    }

    async bulkPut(matchGroups: LocalMatchGroup[]): Promise<void> {
        await db.matchGroups.bulkPut(matchGroups);
    }

    async delete(matchGroupId: string): Promise<void> {
        await db.matchGroups.where({ matchGroupId }).delete();
    }

    async deleteByTournament(orgId: string, tournamentId: string): Promise<void> {
        await db.matchGroups.where({ organizationId: orgId, tournamentId }).delete();
    }
}

export const localMatchGroupRepository = new LocalMatchGroupRepository();
