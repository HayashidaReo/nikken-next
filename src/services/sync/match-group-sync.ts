import { FirestoreMatchGroupRepository } from '@/repositories/firestore/match-group-repository';
import { FirestoreTeamMatchRepository } from '@/repositories/firestore/team-match-repository';
import { localMatchGroupRepository } from '@/repositories/local/match-group-repository';
import { localTeamMatchRepository } from '@/repositories/local/team-match-repository';
import { syncItems } from './utils';

const matchGroupRepository = new FirestoreMatchGroupRepository();
const teamMatchRepository = new FirestoreTeamMatchRepository();

export async function uploadMatchGroups(orgId: string, tournamentId: string): Promise<number> {
    const unsyncedMatchGroups = await localMatchGroupRepository.getUnsynced(orgId, tournamentId);

    if (unsyncedMatchGroups.length === 0) {
        return 0;
    }

    return await syncItems(
        unsyncedMatchGroups,
        "match group",
        (g) => g.matchGroupId,
        async (group, id) => {
            await matchGroupRepository.update(orgId, tournamentId, id, {
                matchGroupId: group.matchGroupId,
                courtId: group.courtId,
                roundId: group.roundId,
                sortOrder: group.sortOrder,
                teamAId: group.teamAId,
                teamBId: group.teamBId,
                isCompleted: group.isCompleted,
            });
        },
        async (_, id) => {
            await matchGroupRepository.delete(orgId, tournamentId, id);
        },
        async (group) => {
            if (group.matchGroupId) await localMatchGroupRepository.markAsSynced(group.matchGroupId);
        },
        async (id) => {
            await localMatchGroupRepository.hardDelete(id);
        }
    );
}

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
