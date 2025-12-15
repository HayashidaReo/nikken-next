import { FirestoreTournamentRepository } from '@/repositories/firestore/tournament-repository';
import { localTournamentRepository } from '@/repositories/local/tournament-repository';
import { syncItems } from './utils';
import type { Tournament } from "@/types/tournament.schema";

const tournamentRepository = new FirestoreTournamentRepository();

export async function uploadTournaments(orgId: string): Promise<number> {
    const unsyncedTournaments = await localTournamentRepository.getUnsynced(orgId);

    if (unsyncedTournaments.length === 0) {
        return 0;
    }

    return await syncItems(
        unsyncedTournaments,
        "tournament",
        (t) => t.tournamentId,
        async (tournament, id) => {
            await tournamentRepository.update(orgId, id, {
                tournamentName: tournament.tournamentName,
                tournamentDate: tournament.tournamentDate,
                tournamentType: tournament.tournamentType,
                tournamentDetail: tournament.tournamentDetail,
                location: tournament.location,
                defaultMatchTime: tournament.defaultMatchTime,
                courts: tournament.courts,
                rounds: tournament.rounds,
                isTeamFormOpen: tournament.isTeamFormOpen,
                isArchived: tournament.isArchived,
            });
        },
        async (_, id) => {
            await tournamentRepository.delete(orgId, id);
        },
        async (tournament) => {
            if (tournament.tournamentId) await localTournamentRepository.markAsSynced(tournament.tournamentId);
        },
        async (id) => {
            await localTournamentRepository.hardDelete(id);
        }
    );
}

/**
 * クラウドから大会データを同期する (Local First Sync Strategy)
 * 1. Firestoreから最新データを取得
 * 2. 未同期のローカルデータと競合しないデータのみを抽出
 * 3. ローカルDB (Dexie) を更新
 */
export async function syncTournamentsFromCloud(orgId: string): Promise<Tournament[]> {
    try {
        // Firestoreから直接取得
        const tournaments = await tournamentRepository.listAll(orgId);

        // 未同期のローカル変更を取得
        const unsyncedLocalTournaments = await localTournamentRepository.getUnsynced(orgId);
        const unsyncedIds = new Set(unsyncedLocalTournaments.map(t => t.tournamentId));

        // ローカルDBを更新
        // 未同期の項目は上書きしないようにフィルタリング
        const localTournaments = tournaments
            .filter((t: Tournament) => !unsyncedIds.has(t.tournamentId!))
            .map((t: Tournament) => ({
                ...t,
                organizationId: orgId,
                tournamentDate: t.tournamentDate ? new Date(t.tournamentDate) : new Date(),
                createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
                updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
                isSynced: true,
            }));

        if (localTournaments.length > 0) {
            await localTournamentRepository.bulkPut(localTournaments);
        }
        return tournaments;
    } catch (error) {
        console.error("Failed to sync tournaments from cloud:", error);
        return [];
    }
}
