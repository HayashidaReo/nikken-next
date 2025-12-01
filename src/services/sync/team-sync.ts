import { FirestoreTeamRepository } from '@/repositories/firestore/team-repository';
import { localTeamRepository } from '@/repositories/local/team-repository';
import { syncItems } from './utils';

const teamRepository = new FirestoreTeamRepository();

export async function uploadTeams(orgId: string, tournamentId: string): Promise<number> {
    const unsyncedTeams = await localTeamRepository.getUnsynced(orgId, tournamentId);

    if (unsyncedTeams.length === 0) {
        return 0;
    }

    return await syncItems(
        unsyncedTeams,
        "team",
        (t) => t.teamId,
        async (team, _) => {
            await teamRepository.create(orgId, tournamentId, team);
        },
        async (_, id) => {
            await teamRepository.delete(orgId, tournamentId, id);
        },
        async (team) => {
            if (team.teamId) await localTeamRepository.markAsSynced(team.teamId);
        },
        async (id) => {
            await localTeamRepository.hardDelete(id);
        }
    );
}
