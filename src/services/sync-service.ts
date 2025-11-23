import { db, LocalMatch, LocalTournament } from '@/lib/db';
import { FirestoreMatchRepository } from '@/repositories/firestore/match-repository';
import { localMatchRepository } from '@/repositories/local/match-repository';
import { localTournamentRepository } from '@/repositories/local/tournament-repository';

const matchRepository = new FirestoreMatchRepository();

export const syncService = {
    /**
     * Firestoreから大会データと試合データをダウンロードし、ローカルDBを上書き保存する
     * (オンライン時のみ実行可能)
     */
    async downloadTournamentData(orgId: string, tournamentId: string): Promise<void> {
        if (!navigator.onLine) {
            throw new Error("オフラインのためデータを取得できません。");
        }

        // 1. Firestoreからデータを取得
        // Tournament
        const tournamentRes = await fetch(`/api/tournaments/${orgId}/${tournamentId}`);
        if (!tournamentRes.ok) throw new Error("大会データの取得に失敗しました");
        const { tournament } = await tournamentRes.json();

        // Matches
        const matches = await matchRepository.listAll(orgId, tournamentId);

        // 2. ローカルDBをトランザクションで更新
        await db.transaction('rw', db.matches, db.tournaments, async () => {
            // 既存のこの大会のデータを削除 (クリーンな状態で上書き)
            await localMatchRepository.deleteByTournament(orgId, tournamentId);
            await localTournamentRepository.delete(orgId, tournamentId);

            // 大会データを保存
            const localTournament: LocalTournament = {
                ...tournament,
                organizationId: orgId,
                // 日付文字列をDateオブジェクトに変換
                tournamentDate: tournament.tournamentDate ? new Date(tournament.tournamentDate) : null,
                createdAt: tournament.createdAt ? new Date(tournament.createdAt) : undefined,
                updatedAt: tournament.updatedAt ? new Date(tournament.updatedAt) : undefined,
            };
            await localTournamentRepository.put(localTournament);

            // 試合データを保存
            const localMatches: LocalMatch[] = matches.map(m => ({
                ...m,
                organizationId: orgId,
                tournamentId: tournamentId,
                isSynced: true, // ダウンロード直後は同期済み
            }));
            await localMatchRepository.bulkPut(localMatches);
        });

        console.log(`[SyncService] Downloaded ${matches.length} matches for tournament ${tournamentId}`);
    },

    /**
     * ローカルDBの未送信データをFirestoreにアップロードする
     * (オンライン時のみ実行可能)
     */
    async uploadResults(orgId: string, tournamentId: string): Promise<number> {
        if (!navigator.onLine) {
            throw new Error("オフラインのためデータを送信できません。");
        }

        // 1. 未送信の試合データを取得
        const unsyncedMatches = await localMatchRepository.getUnsynced(orgId, tournamentId);

        if (unsyncedMatches.length === 0) {
            return 0;
        }

        // 2. Firestoreに保存 (逐次処理または並列処理)
        // ここでは安全のため逐次処理し、成功したものからローカルのフラグを更新する
        let successCount = 0;

        for (const match of unsyncedMatches) {
            try {
                if (!match.matchId) continue;

                // update only score and hansoku and isCompleted
                await matchRepository.update(orgId, tournamentId, match.matchId, {
                    players: match.players,
                    isCompleted: match.isCompleted,
                });

                // 3. ローカルDBのフラグを更新
                await localMatchRepository.update(match.id!, { isSynced: true });
                successCount++;
            } catch (error) {
                console.error(`[SyncService] Failed to upload match ${match.matchId}`, error);
                // エラー時は何もしない（次回の同期で再試行）
            }
        }

        return successCount;
    },

    /**
     * 未送信データの件数を取得
     */
    async getUnsyncedCount(orgId: string, tournamentId: string): Promise<number> {
        return await localMatchRepository.countUnsynced(orgId, tournamentId);
    }
};
