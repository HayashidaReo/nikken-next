import { db, LocalMatchGroup } from '@/lib/db';

export class LocalMatchGroupRepository {
    async getById(matchGroupId: string): Promise<LocalMatchGroup | undefined> {
        return await db.matchGroups.where({ matchGroupId }).first();
    }

    async listAll(orgId: string, tournamentId: string): Promise<LocalMatchGroup[]> {
        const allGroups = await db.matchGroups
            .where({ organizationId: orgId, tournamentId })
            .sortBy('sortOrder');

        // 論理削除されていないグループのみ返す
        return allGroups.filter(g => !g._deleted);
    }

    async put(matchGroup: LocalMatchGroup): Promise<number> {
        return await db.matchGroups.put(matchGroup);
    }

    async bulkPut(matchGroups: LocalMatchGroup[]): Promise<void> {
        await db.matchGroups.bulkPut(matchGroups);
    }

    async delete(matchGroupId: string): Promise<void> {
        await db.matchGroups.where({ matchGroupId }).modify({ _deleted: true, isSynced: false });
    }

    async hardDelete(matchGroupId: string): Promise<void> {
        await db.matchGroups.where({ matchGroupId }).delete();
    }

    async deleteByTournament(orgId: string, tournamentId: string): Promise<void> {
        await db.matchGroups.where({ organizationId: orgId, tournamentId }).delete();
    }
    async create(orgId: string, tournamentId: string, matchGroup: Omit<LocalMatchGroup, "matchGroupId" | "organizationId" | "tournamentId" | "isSynced" | "createdAt" | "updatedAt">): Promise<LocalMatchGroup> {
        const id = crypto.randomUUID();
        const now = new Date();
        const newGroup: LocalMatchGroup = {
            ...matchGroup,
            matchGroupId: id,
            organizationId: orgId,
            tournamentId,
            isSynced: false,
            isCompleted: false,
            createdAt: now,
            updatedAt: now,
        };
        await db.matchGroups.put(newGroup);
        return newGroup;
    }

    async updateByPk(id: number, changes: Partial<LocalMatchGroup>): Promise<number> {
        return await db.matchGroups.update(id, changes);
    }

    async update(matchGroupId: string, changes: Partial<LocalMatchGroup>): Promise<number> {
        return await db.matchGroups.where({ matchGroupId }).modify({
            ...changes,
            isSynced: false,
            updatedAt: new Date(),
        });
    }

    async markAsSynced(matchGroupId: string): Promise<void> {
        await db.matchGroups
            .where({ matchGroupId })
            .modify({ isSynced: true });
    }


    async getUnsynced(orgId: string, tournamentId: string): Promise<LocalMatchGroup[]> {
        return await db.matchGroups
            .where({ organizationId: orgId, tournamentId })
            .filter(g => g.isSynced === false)
            .toArray();
    }

    async countUnsynced(orgId: string, tournamentId: string): Promise<number> {
        return await db.matchGroups
            .where({ organizationId: orgId, tournamentId })
            .filter(g => g.isSynced === false)
            .count();
    }
}

export const localMatchGroupRepository = new LocalMatchGroupRepository();
