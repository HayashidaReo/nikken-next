import { db, LocalMatch } from '@/lib/db';

export class LocalMatchRepository {
    /**
     * 全ての試合を取得
     */
    async listAll(orgId: string, tournamentId: string): Promise<LocalMatch[]> {
        const allMatches = await db.matches
            .where({ organizationId: orgId, tournamentId })
            .sortBy("sortOrder");

        // 論理削除されていない試合のみ返す
        return allMatches.filter(m => !m._deleted);
    }

    /**
     * チームIDで試合を取得
     */
    async findByTeamId(teamId: string): Promise<LocalMatch[]> {
        return await db.matches
            .filter(m => (m.players.playerA.teamId === teamId || m.players.playerB.teamId === teamId) && !m._deleted)
            .toArray();
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
    async listByRoundId(orgId: string, tournamentId: string, roundId: string): Promise<LocalMatch[]> {
        return await db.matches
            .where({ organizationId: orgId, tournamentId, roundId })
            .sortBy("sortOrder");
    }

    /**
     * 試合を作成
     */
    async create(orgId: string, tournamentId: string, match: Omit<LocalMatch, "matchId" | "organizationId" | "tournamentId" | "isSynced" | "createdAt" | "updatedAt">): Promise<LocalMatch> {
        const id = crypto.randomUUID();
        const now = new Date();
        const newMatch: LocalMatch = {
            ...match,
            matchId: id,
            organizationId: orgId,
            tournamentId,
            isSynced: false,
            createdAt: now,
            updatedAt: now,
        };
        await db.matches.put(newMatch);
        return newMatch;
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
    async bulkPut(matches: LocalMatch[]): Promise<void> {
        await db.matches.bulkPut(matches);
    }

    /**
     * 試合を更新 (PK指定)
     */
    async updateByPk(id: number, changes: Partial<LocalMatch>): Promise<number> {
        return await db.matches.update(id, changes);
    }

    /**
     * 試合を更新 (matchId指定)
     */
    async update(matchId: string, changes: Partial<LocalMatch>): Promise<number> {
        return await db.matches
            .where("matchId")
            .equals(matchId)
            .modify({
                ...changes,
                isSynced: false,
                updatedAt: new Date(),
            });
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

    /**
     * 同期完了としてマーク
     */
    async markAsSynced(matchId: string): Promise<void> {
        await db.matches
            .where("matchId")
            .equals(matchId)
            .modify({ isSynced: true });
    }

    /**
     * matchIdで試合を更新 (非推奨: updateを使用してください)
     */
    async updateByMatchId(matchId: string, changes: Partial<LocalMatch>): Promise<number> {
        return this.update(matchId, changes);
    }

    /**
     * matchIdで試合を削除（論理削除）
     */
    async delete(matchId: string): Promise<void> {
        await db.matches
            .where("matchId")
            .equals(matchId)
            .modify({ _deleted: true, isSynced: false });
    }

    /**
     * 複数の試合を一括削除（論理削除）
     */
    async deleteMultiple(matchIds: string[]): Promise<void> {
        await db.matches
            .where("matchId")
            .anyOf(matchIds)
            .modify({ _deleted: true, isSynced: false });
    }

    /**
     * matchIdで試合を物理削除
     */
    async hardDelete(matchId: string): Promise<void> {
        await db.matches
            .where("matchId")
            .equals(matchId)
            .delete();
    }
}

export const localMatchRepository = new LocalMatchRepository();
