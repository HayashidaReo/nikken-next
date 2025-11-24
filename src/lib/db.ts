import Dexie, { Table } from 'dexie';
import type { Match, MatchGroup, TeamMatch } from '@/types/match.schema';
import type { Tournament } from '@/types/tournament.schema';

// ローカルDBに保存するMatch型
// FirestoreのMatch型に同期フラグを追加
export interface LocalMatch extends Match {
    id?: number; // Dexie auto-incremented ID
    isSynced: boolean;
    organizationId: string; // クエリ用に追加
    tournamentId: string;   // クエリ用に追加
}

// ローカルDBに保存するMatchGroup型
export interface LocalMatchGroup extends MatchGroup {
    id?: number;
    isSynced: boolean;
    organizationId: string;
    tournamentId: string;
}

// ローカルDBに保存するTeamMatch型
export interface LocalTeamMatch extends TeamMatch {
    id?: number;
    isSynced: boolean;
    organizationId: string;
    tournamentId: string;
}

// ローカルDBに保存するTournament型
export interface LocalTournament extends Tournament {
    organizationId: string; // クエリ用に追加
}

export class NikkenOfflineDB extends Dexie {
    matches!: Table<LocalMatch>;
    tournaments!: Table<LocalTournament>;
    matchGroups!: Table<LocalMatchGroup>;
    teamMatches!: Table<LocalTeamMatch>;

    constructor() {
        super('NikkenOfflineDB');
        this.version(1).stores({
            matches: '++id, matchId, [organizationId+tournamentId], isSynced, courtId, round, [organizationId+tournamentId+courtId], [organizationId+tournamentId+round]',
            tournaments: 'tournamentId, organizationId, [organizationId+tournamentId]'
        });
        this.version(2).stores({
            matchGroups: '++id, matchGroupId, [organizationId+tournamentId], isSynced, courtId, round',
            teamMatches: '++id, matchId, [organizationId+tournamentId+matchGroupId], isSynced, round'
        });
    }
}

export const db = new NikkenOfflineDB();
