import { db, LocalMatch, LocalTournament, LocalMatchGroup, LocalTeamMatch } from '@/lib/db';
import { FirestoreMatchRepository } from '@/repositories/firestore/match-repository';
import { FirestoreMatchGroupRepository } from '@/repositories/firestore/match-group-repository';
import { FirestoreTeamMatchRepository } from '@/repositories/firestore/team-match-repository';
import { localMatchRepository } from '@/repositories/local/match-repository';
import { localTournamentRepository } from '@/repositories/local/tournament-repository';
import { localMatchGroupRepository } from '@/repositories/local/match-group-repository';
import { localTeamMatchRepository } from '@/repositories/local/team-match-repository';
import { tournamentSchema } from '@/types/tournament.schema';
import type { Match, MatchGroup, TeamMatch } from '@/types/match.schema';
import type { Tournament } from '@/types/tournament.schema';

const matchRepository = new FirestoreMatchRepository();
const matchGroupRepository = new FirestoreMatchGroupRepository();
const teamMatchRepository = new FirestoreTeamMatchRepository();

interface FetchedData {
    tournament: Tournament;
    matches: Match[];
    matchGroups: MatchGroup[];
    teamMatches: TeamMatch[];
}

async function fetchFromFirestore(orgId: string, tournamentId: string): Promise<FetchedData> {
    // Tournament
    const tournamentRes = await fetch(`/api/tournaments/${orgId}/${tournamentId}`);
    if (!tournamentRes.ok) throw new Error("大会データの取得に失敗しました");
    const { tournament: rawTournament } = await tournamentRes.json();

    // Zodスキーマを使って検証＆型変換（文字列日付 -> Dateオブジェクト）
    const tournament = tournamentSchema.parse(rawTournament);

    const tournamentType = tournament.tournamentType || 'individual';

    let matches: Match[] = [];
    let matchGroups: MatchGroup[] = [];
    let teamMatches: TeamMatch[] = [];

    if (tournamentType === 'individual') {
        // Matches (Individual)
        matches = await matchRepository.listAll(orgId, tournamentId);
    } else if (tournamentType === 'team') {
        // MatchGroups (Team)
        matchGroups = await matchGroupRepository.listAll(orgId, tournamentId);

        // TeamMatches (Team) - 各グループの試合を取得
        const teamMatchesPromises = matchGroups
            .filter(group => group.matchGroupId)
            .map(group =>
                teamMatchRepository.listAll(orgId, tournamentId, group.matchGroupId!)
            );
        const teamMatchesArrays = await Promise.all(teamMatchesPromises);
        teamMatches = teamMatchesArrays.flat();
    }

    return { tournament, matches, matchGroups, teamMatches };
}

async function saveToLocalDB(orgId: string, tournamentId: string, data: FetchedData): Promise<void> {
    const { tournament, matches, matchGroups, teamMatches } = data;

    await db.transaction('rw', db.matches, db.tournaments, db.matchGroups, db.teamMatches, async () => {
        // 既存のこの大会のデータを削除 (クリーンな状態で上書き)
        await localMatchRepository.deleteByTournament(orgId, tournamentId);
        await localTournamentRepository.delete(orgId, tournamentId);
        await localMatchGroupRepository.deleteByTournament(orgId, tournamentId);
        await localTeamMatchRepository.deleteByTournament(orgId, tournamentId);

        // 大会データを保存
        const localTournament: LocalTournament = {
            ...tournament,
            organizationId: orgId,
        };
        // 試合データを保存 (個人戦)
        await localTournamentRepository.put(localTournament);
        if (matches.length > 0) {
            const localMatches: LocalMatch[] = matches.map(m => ({
                ...m,
                organizationId: orgId,
                tournamentId: tournamentId,
                isSynced: true, // ダウンロード直後は同期済み
            }));
            await localMatchRepository.bulkPut(localMatches);
        }

        // 団体戦グループデータを保存
        if (matchGroups.length > 0) {
            const localMatchGroups: LocalMatchGroup[] = matchGroups.map(g => ({
                ...g,
                organizationId: orgId,
                tournamentId: tournamentId,
                isSynced: true,
            }));
            await localMatchGroupRepository.bulkPut(localMatchGroups);
        }

        // 団体戦試合データを保存
        if (teamMatches.length > 0) {
            const localTeamMatches: LocalTeamMatch[] = teamMatches.map(m => ({
                ...m,
                organizationId: orgId,
                tournamentId: tournamentId,
                isSynced: true,
            }));
            await localTeamMatchRepository.bulkPut(localTeamMatches);
        }
    });
}

export const syncService = {
    /**
     * Firestoreから大会データと試合データをダウンロードし、ローカルDBを上書き保存する
     * (オンライン時のみ実行可能)
     */
    async downloadTournamentData(orgId: string, tournamentId: string): Promise<void> {
        if (!navigator.onLine) {
            throw new Error("オフラインのためデータを取得できません。インターネット接続を確認してから再度お試しください。");
        }

        const data = await fetchFromFirestore(orgId, tournamentId);
        await saveToLocalDB(orgId, tournamentId, data);
    },

    /**
     * ローカルDBの未送信データをFirestoreにアップロードする
     * (オンライン時のみ実行可能)
     */
    async uploadResults(orgId: string, tournamentId: string): Promise<number> {
        if (!navigator.onLine) {
            throw new Error("オフラインのためデータを送信できません。インターネット接続を確認してから再度お試しください。");
        }

        // 1. 未送信の試合データを取得 (Individual)
        const unsyncedMatches = await localMatchRepository.getUnsynced(orgId, tournamentId);

        // 2. 未送信の団体戦グループデータを取得 (Team)
        const unsyncedMatchGroups = await localMatchGroupRepository.getUnsynced(orgId, tournamentId);

        // 3. 未送信の団体戦試合データを取得 (Team)
        const unsyncedTeamMatches = await localTeamMatchRepository.getUnsynced(orgId, tournamentId);

        if (unsyncedMatches.length === 0 && unsyncedMatchGroups.length === 0 && unsyncedTeamMatches.length === 0) {
            return 0;
        }

        let successCount = 0;

        // 3. Firestoreに保存 (Individual)
        const uploadResults = await Promise.allSettled(
            unsyncedMatches.map(match => {
                if (!match.matchId) return Promise.reject(new Error("matchId is missing"));
                return matchRepository.update(orgId, tournamentId, match.matchId, {
                    players: match.players,
                    isCompleted: match.isCompleted,
                });
            })
        );

        for (let i = 0; i < uploadResults.length; i++) {
            const result = uploadResults[i];
            const match = unsyncedMatches[i];
            if (result.status === "fulfilled") {
                try {
                    await localMatchRepository.update(match.id!, { isSynced: true });
                    successCount++;
                } catch (error) {
                    console.error(`[SyncService] Failed to update local flag for match ${match.matchId}`, error);
                }
            } else {
                console.error(`[SyncService] Failed to upload match ${match.matchId}`, result.reason);
            }
        }

        // 4. Firestoreに保存 (MatchGroups)
        const uploadMatchGroupResults = await Promise.allSettled(
            unsyncedMatchGroups.map(group => {
                if (!group.matchGroupId) return Promise.reject(new Error("matchGroupId is missing"));
                return matchGroupRepository.update(orgId, tournamentId, group.matchGroupId, {
                    courtId: group.courtId,
                    roundId: group.roundId,
                    sortOrder: group.sortOrder,
                    teamAId: group.teamAId,
                    teamBId: group.teamBId,
                });
            })
        );

        for (let i = 0; i < uploadMatchGroupResults.length; i++) {
            const result = uploadMatchGroupResults[i];
            const group = unsyncedMatchGroups[i];
            if (result.status === "fulfilled") {
                try {
                    await localMatchGroupRepository.update(group.matchGroupId!, { isSynced: true });
                    successCount++;
                } catch (error) {
                    console.error(`[SyncService] Failed to update local flag for match group ${group.matchGroupId}`, error);
                }
            } else {
                console.error(`[SyncService] Failed to upload match group ${group.matchGroupId}`, result.reason);
            }
        }

        // 5. Firestoreに保存 (TeamMatches)
        const uploadTeamResults = await Promise.allSettled(
            unsyncedTeamMatches.map(match => {
                if (!match.matchId || !match.matchGroupId) return Promise.reject(new Error("matchId or matchGroupId is missing"));
                return teamMatchRepository.update(orgId, tournamentId, match.matchGroupId, match.matchId, {
                    matchGroupId: match.matchGroupId,
                    roundId: match.roundId,
                    sortOrder: match.sortOrder,
                    players: match.players,
                    isCompleted: match.isCompleted,
                });
            })
        );

        for (let i = 0; i < uploadTeamResults.length; i++) {
            const result = uploadTeamResults[i];
            const match = unsyncedTeamMatches[i];
            if (result.status === "fulfilled") {
                try {
                    await localTeamMatchRepository.update(match.id!, { isSynced: true });
                    successCount++;
                } catch (error) {
                    console.error(`[SyncService] Failed to update local flag for team match ${match.matchId}`, error);
                }
            } else {
                console.error(`[SyncService] Failed to upload team match ${match.matchId}`, result.reason);
            }
        }

        return successCount;
    },

    /**
     * 未送信データの件数を取得
     */
    async getUnsyncedCount(orgId: string, tournamentId: string): Promise<number> {
        const matchesCount = await localMatchRepository.countUnsynced(orgId, tournamentId);
        const matchGroupsCount = await localMatchGroupRepository.countUnsynced(orgId, tournamentId);
        const teamMatchesCount = await localTeamMatchRepository.countUnsynced(orgId, tournamentId);
        return matchesCount + matchGroupsCount + teamMatchesCount;
    },

    /**
     * ローカルDBのキャッシュを削除する
     * matches / matchGroups / teamMatches (+ teams が存在する場合) をクリア
     */
    async clearLocalData(): Promise<void> {
        await db.matches.clear();
        await db.matchGroups.clear();
        await db.teamMatches.clear();

        const teamsTable = db.tables.find(table => table.name === "teams");
        if (teamsTable) {
            await teamsTable.clear();
        }
    }
};

//TODO: 取り込むときに、ダイアログを表示して内容確認してから取り組む
//TODO: 保存処理は、未完成未検証