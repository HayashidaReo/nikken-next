import { db, LocalTeam } from "@/lib/db";

export class LocalTeamRepository {
    async listAll(orgId: string, tournamentId: string): Promise<LocalTeam[]> {
        return await db.teams
            .where({ organizationId: orgId, tournamentId })
            .toArray();
    }

    async getById(teamId: string): Promise<LocalTeam | undefined> {
        return await db.teams.get(teamId);
    }

    async put(team: LocalTeam): Promise<string> {
        return await db.teams.put(team);
    }

    async bulkPut(teams: LocalTeam[]): Promise<string> {
        return await db.teams.bulkPut(teams);
    }

    async update(teamId: string, changes: Partial<LocalTeam>): Promise<number> {
        return await db.teams.update(teamId, changes);
    }

    async delete(teamId: string): Promise<void> {
        await db.teams.delete(teamId);
    }

    async deleteByTournament(orgId: string, tournamentId: string): Promise<void> {
        await db.teams
            .where({ organizationId: orgId, tournamentId })
            .delete();
    }
}

export const localTeamRepository = new LocalTeamRepository();
