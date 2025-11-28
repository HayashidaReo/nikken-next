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

    /**
     * 論理削除
     * オフライン同期のために、レコード自体は残して _deleted フラグを立てる。
     * 
     * 以下の2行で、親（MatchGroup）と子（TeamMatch）を同時に論理削除しています。
     * 1. db.matchGroups... -> 親（対戦グループ）を削除済みマーク
     * 2. db.teamMatches... -> そのグループに紐づく子（個人対戦）も全て削除済みマーク
     */
    async delete(matchGroupId: string): Promise<void> {
        await db.transaction('rw', db.matchGroups, db.teamMatches, async () => {
            await db.matchGroups.where({ matchGroupId }).modify({ _deleted: true, isSynced: false });
            await db.teamMatches.where({ matchGroupId }).modify({ _deleted: true, isSynced: false });
        });
    }

    /**
     * 物理削除
     * クラウド同期完了後など、完全にデータを消去する場合に使用する。
     * 
     * 以下の2行で、親（MatchGroup）と子（TeamMatch）を同時に物理削除しています。
     * 1. db.matchGroups... -> 親（対戦グループ）を完全削除
     * 2. db.teamMatches... -> そのグループに紐づく子（個人対戦）も全て完全削除
     */
    async hardDelete(matchGroupId: string): Promise<void> {
        await db.transaction('rw', db.matchGroups, db.teamMatches, async () => {
            await db.matchGroups.where({ matchGroupId }).delete();
            await db.teamMatches.where({ matchGroupId }).delete();
        });
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
