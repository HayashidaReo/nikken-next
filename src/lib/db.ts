import Dexie, { Table } from 'dexie';
import type { Match } from '@/types/match.schema';
import type { Tournament } from '@/types/tournament.schema';

// ローカルDBに保存するMatch型
// FirestoreのMatch型に同期フラグを追加
export interface LocalMatch extends Match {
    id?: number; // Dexie auto-incremented ID
    isSynced: boolean;
    organizationId: string; // クエリ用に追加
    tournamentId: string;   // クエリ用に追加
}

// ローカルDBに保存するTournament型
export interface LocalTournament extends Tournament {
    organizationId: string; // クエリ用に追加
}

export class NikkenOfflineDB extends Dexie {
    matches!: Table<LocalMatch>;
    tournaments!: Table<LocalTournament>;

    constructor() {
        super('NikkenOfflineDB');
        this.version(1).stores({
            matches: '++id, matchId, [organizationId+tournamentId], isSynced, courtId, round, [organizationId+tournamentId+courtId], [organizationId+tournamentId+round]',
            tournaments: 'tournamentId, [organizationId+tournamentId]'
        });
    }
}

export const db = new NikkenOfflineDB();
