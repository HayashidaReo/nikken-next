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
        return await db.tournaments
            .where({ organizationId: orgId })
            .toArray();
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
     * 大会を削除
     */
    async delete(orgId: string, tournamentId: string): Promise<void> {
        await db.tournaments.where({ organizationId: orgId, tournamentId }).delete();
    }
}

export const localTournamentRepository = new LocalTournamentRepository();
