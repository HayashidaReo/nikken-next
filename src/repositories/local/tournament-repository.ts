import { db, LocalTournament } from '@/lib/db';

export class LocalTournamentRepository {
    /**
     * IDで大会を取得
     */
    async getById(orgId: string, tournamentId: string): Promise<LocalTournament | undefined> {
        return await db.tournaments
            .where({ organizationId: orgId, tournamentId })
            .first();
    }

    /**
     * 組織IDで大会一覧を取得
     */
    async listByOrganization(orgId: string): Promise<LocalTournament[]> {
        const tournaments = await db.tournaments
            .where({ organizationId: orgId })
            .toArray();
        return tournaments.filter(t => !t._deleted);
    }

    /**
     * 大会を保存（新規作成または更新）
     */
    async put(tournament: LocalTournament): Promise<string> {
        return await db.tournaments.put(tournament);
    }

    /**
     * 複数の大会を一括保存
     */
    async bulkPut(tournaments: LocalTournament[]): Promise<void> {
        await db.tournaments.bulkPut(tournaments);
    }

    /**
     * 大会を作成
     */
    async create(orgId: string, tournament: LocalTournament): Promise<LocalTournament> {
        const newTournament: LocalTournament = {
            ...tournament,
            organizationId: orgId,
            isSynced: false,
            updatedAt: new Date(),
        };
        await db.tournaments.put(newTournament);
        return newTournament;
    }

    /**
     * 大会を更新
     */
    async update(orgId: string, tournamentId: string, changes: Partial<LocalTournament>): Promise<number> {
        // プライマリキーが複合キーでない場合、updateにはキーを指定する
        // db.tsの定義では tournaments: 'tournamentId, organizationId, [organizationId+tournamentId]'
        // プライマリキーは tournamentId
        return await db.tournaments.update(tournamentId, {
            ...changes,
            isSynced: false,
            updatedAt: new Date(),
        });
    }

    /**
     * 大会を削除（論理削除）
     */
    async delete(orgId: string, tournamentId: string): Promise<void> {
        await db.tournaments.update(tournamentId, {
            _deleted: true,
            isSynced: false,
            updatedAt: new Date(),
        });
    }

    /**
     * 未同期の大会を取得
     */
    async getUnsynced(orgId: string): Promise<LocalTournament[]> {
        return await db.tournaments
            .where({ organizationId: orgId })
            .filter(t => t.isSynced === false)
            .toArray();
    }

    /**
     * 未同期の大会数を取得
     */
    async countUnsynced(orgId: string): Promise<number> {
        return await db.tournaments
            .where({ organizationId: orgId })
            .filter(t => t.isSynced === false)
            .count();
    }

    /**
     * 同期完了としてマーク
     */
    async markAsSynced(tournamentId: string): Promise<void> {
        await db.tournaments.update(tournamentId, { isSynced: true });
    }

    /**
     * 大会を物理削除（同期完了後のクリーンアップ用）
     */
    async hardDelete(tournamentId: string): Promise<void> {
        await db.tournaments.delete(tournamentId);
    }
}

export const localTournamentRepository = new LocalTournamentRepository();
