import { db, LocalTeam } from "@/lib/db";
import type { TeamCreate } from "@/types/team.schema";

export class LocalTeamRepository {
    async listAll(orgId: string, tournamentId: string): Promise<LocalTeam[]> {
        const teams = await db.teams
            .where({ organizationId: orgId, tournamentId })
            .toArray();
        return teams.filter(t => !t._deleted);
    }

    async getById(teamId: string): Promise<LocalTeam | undefined> {
        return await db.teams.get(teamId);
    }

    async put(team: LocalTeam): Promise<string> {
        return await db.teams.put(team);
    }

    async bulkPut(teams: LocalTeam[]): Promise<void> {
        await db.teams.bulkPut(teams);
    }

    async create(orgId: string, tournamentId: string, team: TeamCreate): Promise<LocalTeam> {
        const id = crypto.randomUUID();
        const now = new Date();
        const newTeam: LocalTeam = {
            ...team,
            teamId: id,
            organizationId: orgId,
            tournamentId,
            isSynced: false,
            createdAt: now,
            updatedAt: now,
        };
        await db.teams.put(newTeam);
        return newTeam;
    }

    async update(teamId: string, changes: Partial<LocalTeam>): Promise<number> {
        return await db.teams.update(teamId, {
            ...changes,
            isSynced: false,
            updatedAt: new Date(),
        });
    }

    async delete(teamId: string): Promise<void> {
        await db.teams.update(teamId, {
            _deleted: true,
            isSynced: false,
            updatedAt: new Date(),
        });
    }

    async hardDelete(teamId: string): Promise<void> {
        await db.teams.delete(teamId);
    }

    async deleteByTournament(orgId: string, tournamentId: string): Promise<void> {
        await db.teams
            .where({ organizationId: orgId, tournamentId })
            .delete();
    }

    async getUnsynced(orgId: string, tournamentId: string): Promise<LocalTeam[]> {
        return await db.teams
            .where({ organizationId: orgId, tournamentId })
            .filter(t => t.isSynced === false)
            .toArray();
    }

    async countUnsynced(orgId: string, tournamentId: string): Promise<number> {
        return await db.teams
            .where({ organizationId: orgId, tournamentId })
            .filter(t => t.isSynced === false)
            .count();
    }

    async markAsSynced(teamId: string): Promise<void> {
        await db.teams.update(teamId, { isSynced: true });
    }
}

export const localTeamRepository = new LocalTeamRepository();
