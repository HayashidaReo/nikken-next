import { FirestoreTeamMatchRepository } from '@/repositories/firestore/team-match-repository';
import { localTeamMatchRepository } from '@/repositories/local/team-match-repository';
import { syncItems } from './utils';

const teamMatchRepository = new FirestoreTeamMatchRepository();

export async function uploadTeamMatches(orgId: string, tournamentId: string): Promise<number> {
    const unsyncedTeamMatches = await localTeamMatchRepository.getUnsynced(orgId, tournamentId);

    if (unsyncedTeamMatches.length === 0) {
        return 0;
    }

    return await syncItems(
        unsyncedTeamMatches,
        "team match",
        (m) => m.matchId,
        async (teamMatch, id) => {
            if (!teamMatch.matchGroupId) throw new Error("Missing matchGroupId");
            await teamMatchRepository.update(orgId, tournamentId, teamMatch.matchGroupId, id, {
                matchId: id,
                matchGroupId: teamMatch.matchGroupId,
                roundId: teamMatch.roundId,
                players: teamMatch.players,
                sortOrder: teamMatch.sortOrder,
                isCompleted: teamMatch.isCompleted,
                winner: teamMatch.winner,
                winReason: teamMatch.winReason,
            });
        },
        async (teamMatch, id) => {
            if (!teamMatch.matchGroupId) throw new Error("Missing matchGroupId");
            await teamMatchRepository.delete(orgId, tournamentId, teamMatch.matchGroupId, id);
        },
        async (teamMatch) => {
            if (teamMatch.matchId) await localTeamMatchRepository.markAsSynced(teamMatch.matchId);
        },
        async (id) => {
            await localTeamMatchRepository.hardDelete(id);
        }
    );
}
