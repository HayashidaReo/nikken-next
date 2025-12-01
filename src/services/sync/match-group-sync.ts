import { FirestoreMatchGroupRepository } from '@/repositories/firestore/match-group-repository';
import { localMatchGroupRepository } from '@/repositories/local/match-group-repository';
import { syncItems } from './utils';

const matchGroupRepository = new FirestoreMatchGroupRepository();

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


