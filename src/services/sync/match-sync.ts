import { FirestoreMatchRepository } from '@/repositories/firestore/match-repository';
import { localMatchRepository } from '@/repositories/local/match-repository';
import { MatchCreateWithId } from '@/types/match.schema';
import { syncItems } from './utils';

const matchRepository = new FirestoreMatchRepository();

export async function uploadMatches(orgId: string, tournamentId: string): Promise<number> {
    const unsyncedMatches = await localMatchRepository.getUnsynced(orgId, tournamentId);

    if (unsyncedMatches.length === 0) {
        return 0;
    }

    return await syncItems(
        unsyncedMatches,
        "match",
        (m) => m.matchId,
        async (match, id) => {
            const matchData: MatchCreateWithId = {
                matchId: id,
                courtId: match.courtId,
                roundId: match.roundId,
                players: match.players,
                sortOrder: match.sortOrder,
                isCompleted: match.isCompleted,
                winner: match.winner,
                winReason: match.winReason,
            };
            await matchRepository.save(orgId, tournamentId, matchData);
        },
        async (_, id) => {
            await matchRepository.delete(orgId, tournamentId, id);
        },
        async (match) => {
            if (match.matchId) await localMatchRepository.markAsSynced(match.matchId);
        },
        async (id) => {
            await localMatchRepository.hardDelete(id);
        }
    );
}
