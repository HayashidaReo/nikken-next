import Dexie, { Table } from 'dexie';
import type { Match, MatchGroup, TeamMatch } from '@/types/match.schema';
import type { Team } from '@/types/team.schema';
import type { Tournament } from '@/types/tournament.schema';

// ローカルDBに保存するMatch型
// FirestoreのMatch型に同期フラグを追加
export interface LocalMatch extends Match {
    id?: number; // Dexie auto-incremented ID
    isSynced: boolean;
    organizationId: string; // クエリ用に追加
    tournamentId: string;   // クエリ用に追加
    _deleted?: boolean;     // 論理削除フラグ
}

// ローカルDBに保存するMatchGroup型
export interface LocalMatchGroup extends MatchGroup {
    id?: number;
    isSynced: boolean;
    organizationId: string;
    tournamentId: string;
    _deleted?: boolean;     // 論理削除フラグ
}

// ローカルDBに保存するTeamMatch型
export interface LocalTeamMatch extends TeamMatch {
    id?: number;
    isSynced: boolean;
    organizationId: string;
    tournamentId: string;
    _deleted?: boolean;     // 論理削除フラグ
}

// ローカルDBに保存するTournament型
export interface LocalTournament extends Tournament {
    organizationId: string; // クエリ用に追加
}

// ローカルDBに保存するTeam型
export interface LocalTeam extends Team {
    id?: number;
    isSynced: boolean;
    organizationId: string;
    tournamentId: string;
}

export class NikkenOfflineDB extends Dexie {
    matches!: Table<LocalMatch>;
    tournaments!: Table<LocalTournament>;
    matchGroups!: Table<LocalMatchGroup>;
    teamMatches!: Table<LocalTeamMatch>;
    teams!: Table<LocalTeam>;

    constructor() {
        super('NikkenOfflineDB');
        this.version(1).stores({
            matches: '++id, matchId, [organizationId+tournamentId], isSynced, courtId, roundId, [organizationId+tournamentId+courtId], [organizationId+tournamentId+roundId]',
            tournaments: 'tournamentId, organizationId, [organizationId+tournamentId]',
            matchGroups: '++id, matchGroupId, [organizationId+tournamentId], isSynced, courtId, roundId',
            teamMatches: '++id, matchId, [organizationId+tournamentId+matchGroupId], isSynced, roundId',
            teams: 'teamId, [organizationId+tournamentId], isSynced'
        });
    }
}

export const db = new NikkenOfflineDB();
