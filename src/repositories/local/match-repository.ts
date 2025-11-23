import { db, LocalMatch } from '@/lib/db';

export class LocalMatchRepository {
    /**
     * 全ての試合を取得
     */
    async listAll(orgId: string, tournamentId: string): Promise<LocalMatch[]> {
        return await db.matches
            .where({ organizationId: orgId, tournamentId })
            .sortBy("sortOrder");
    }

    /**
     * IDで試合を取得
     */
    async getById(matchId: string): Promise<LocalMatch | undefined> {
        return await db.matches
            .where("matchId")
            .equals(matchId)
            .first();
    }

    /**
     * コートIDで試合を取得
     */
    async listByCourtId(orgId: string, tournamentId: string, courtId: string): Promise<LocalMatch[]> {
        return await db.matches
            .where({ organizationId: orgId, tournamentId, courtId })
            .sortBy("sortOrder");
    }

    /**
     * ラウンドで試合を取得
     */
    async listByRound(orgId: string, tournamentId: string, round: string): Promise<LocalMatch[]> {
        return await db.matches
            .where({ organizationId: orgId, tournamentId, round })
            .sortBy("sortOrder");
    }

    /**
     * 試合を保存（新規作成または更新）
     */
    async put(match: LocalMatch): Promise<number> {
        return await db.matches.put(match);
    }

    /**
     * 複数の試合を一括保存
     */
    async bulkPut(matches: LocalMatch[]): Promise<number> {
        return await db.matches.bulkPut(matches);
    }

    /**
     * 試合を更新
     */
    async update(id: number, changes: Partial<LocalMatch>): Promise<number> {
        return await db.matches.update(id, changes);
    }

    /**
     * 特定の大会の試合を全て削除
     */
    async deleteByTournament(orgId: string, tournamentId: string): Promise<void> {
        await db.matches.where({ organizationId: orgId, tournamentId }).delete();
    }

    /**
     * 未同期の試合を取得
     */
    async getUnsynced(orgId: string, tournamentId: string): Promise<LocalMatch[]> {
        return await db.matches
            .where({ organizationId: orgId, tournamentId })
            .filter(m => m.isSynced === false)
            .toArray();
    }

    /**
     * 未同期の試合数を取得
     */
    async countUnsynced(orgId: string, tournamentId: string): Promise<number> {
        return await db.matches
            .where({ organizationId: orgId, tournamentId })
            .filter(m => m.isSynced === false)
            .count();
    }
}

export const localMatchRepository = new LocalMatchRepository();
