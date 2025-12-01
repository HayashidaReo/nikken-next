import { db, LocalMatch, LocalTournament, LocalMatchGroup, LocalTeamMatch, LocalTeam } from '@/lib/db';
import { FirestoreTournamentRepository } from '@/repositories/firestore/tournament-repository';
import { FirestoreMatchRepository } from '@/repositories/firestore/match-repository';
import { FirestoreMatchGroupRepository } from '@/repositories/firestore/match-group-repository';
import { FirestoreTeamMatchRepository } from '@/repositories/firestore/team-match-repository';
import { FirestoreTeamRepository } from '@/repositories/firestore/team-repository';
import { localMatchRepository } from '@/repositories/local/match-repository';
import { localTournamentRepository } from '@/repositories/local/tournament-repository';
import { localMatchGroupRepository } from '@/repositories/local/match-group-repository';
import { localTeamMatchRepository } from '@/repositories/local/team-match-repository';
import { localTeamRepository } from '@/repositories/local/team-repository';
import type { Match, MatchGroup, TeamMatch } from '@/types/match.schema';
import type { Tournament } from '@/types/tournament.schema';
import type { Team } from '@/types/team.schema';
import { uploadTournaments } from './sync/tournament-sync';
import { uploadMatches } from './sync/match-sync';
import { uploadMatchGroups } from './sync/match-group-sync';
import { uploadTeamMatches } from './sync/team-match-sync';
import { uploadTeams } from './sync/team-sync';

const matchRepository = new FirestoreMatchRepository();
const matchGroupRepository = new FirestoreMatchGroupRepository();
const teamMatchRepository = new FirestoreTeamMatchRepository();
const teamRepository = new FirestoreTeamRepository();

interface FetchedData {
    tournament: Tournament;
    matches: Match[];
    matchGroups: MatchGroup[];
    teamMatches: TeamMatch[];
    teams: Team[];
}

const tournamentRepository = new FirestoreTournamentRepository();

async function fetchFromFirestore(orgId: string, tournamentId: string): Promise<FetchedData> {
    // Tournament
    const tournament = await tournamentRepository.getById(orgId, tournamentId);
    if (!tournament) throw new Error("大会データの取得に失敗しました");

    const tournamentType = tournament.tournamentType || 'individual';

    let matches: Match[] = [];
    let matchGroups: MatchGroup[] = [];
    let teamMatches: TeamMatch[] = [];
    let teams: Team[] = [];

    // チームデータ (大会種別に関わらず、常に取得)
    teams = await teamRepository.listAll(orgId, tournamentId);

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

    return { tournament, matches, matchGroups, teamMatches, teams };
}

async function saveToLocalDB(orgId: string, tournamentId: string, data: FetchedData): Promise<void> {
    const { tournament, matches, matchGroups, teamMatches, teams } = data;

    // @ts-expect-error: Dexieの型定義制限により引数過多のエラーが出ますが、実行時は可変長引数で動作します
    await db.transaction('rw', db.matches, db.tournaments, db.matchGroups, db.teamMatches, db.teams, async () => {
        // 既存のこの大会のデータを削除 (クリーンな状態で上書き)
        await localMatchRepository.deleteByTournament(orgId, tournamentId);
        await localTournamentRepository.delete(orgId, tournamentId);
        await localMatchGroupRepository.deleteByTournament(orgId, tournamentId);
        await localTeamMatchRepository.deleteByTournament(orgId, tournamentId);
        await localTeamRepository.deleteByTournament(orgId, tournamentId);

        // 大会データを保存
        const localTournament: LocalTournament = {
            ...tournament,
            organizationId: orgId,
            isSynced: true, // ダウンロード直後は同期済み
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

        // チームデータを保存
        if (teams.length > 0) {
            const localTeams: LocalTeam[] = teams.map(t => ({
                ...t,
                organizationId: orgId,
                tournamentId: tournamentId,
                isSynced: true,
            }));
            await localTeamRepository.bulkPut(localTeams);
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

        let successCount = 0;

        // 大会データの同期
        successCount += await uploadTournaments(orgId);

        // 個人戦試合の同期
        successCount += await uploadMatches(orgId, tournamentId);

        // 団体戦グループの同期
        successCount += await uploadMatchGroups(orgId, tournamentId);

        // 団体戦試合の同期
        successCount += await uploadTeamMatches(orgId, tournamentId);

        // チームの同期
        successCount += await uploadTeams(orgId, tournamentId);

        return successCount;
    },

    /**
     * 未送信データの件数を取得
     */
    async getUnsyncedCount(orgId: string, tournamentId: string): Promise<number> {
        const matchesCount = await localMatchRepository.countUnsynced(orgId, tournamentId);
        const matchGroupsCount = await localMatchGroupRepository.countUnsynced(orgId, tournamentId);
        const teamMatchesCount = await localTeamMatchRepository.countUnsynced(orgId, tournamentId);
        const teamsCount = await localTeamRepository.countUnsynced(orgId, tournamentId);
        const tournamentsCount = await localTournamentRepository.countUnsynced(orgId);
        return matchesCount + matchGroupsCount + teamMatchesCount + teamsCount + tournamentsCount;
    },

    /**
     * 未送信データを取得 (表示用)
     */
    async getUnsyncedData(orgId: string, tournamentId: string) {
        const matches = await localMatchRepository.getUnsynced(orgId, tournamentId);
        const matchGroups = await localMatchGroupRepository.getUnsynced(orgId, tournamentId);
        const teamMatches = await localTeamMatchRepository.getUnsynced(orgId, tournamentId);
        const teams = await localTeamRepository.getUnsynced(orgId, tournamentId);
        const tournaments = await localTournamentRepository.getUnsynced(orgId);
        return { matches, matchGroups, teamMatches, teams, tournaments };
    },

    /**
     * ローカルDBのキャッシュを削除する
     * matches / matchGroups / teamMatches (+ teams が存在する場合) をクリア
     */
    async clearLocalData(): Promise<void> {
        await db.matches.clear();
        await db.matchGroups.clear();
        await db.teamMatches.clear();
        await db.teams.clear();
        await db.tournaments.clear();
    }
};