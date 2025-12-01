import { FirestoreTournamentRepository } from '@/repositories/firestore/tournament-repository';
import { localTournamentRepository } from '@/repositories/local/tournament-repository';
import { syncItems } from './utils';

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
