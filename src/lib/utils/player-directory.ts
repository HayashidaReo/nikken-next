import type { MatchPlayer } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";

export type ResolvedMatchPlayer = MatchPlayer & {
    displayName: string;
    teamName: string;
    grade?: string;
};

export type PlayerDirectoryEntry = {
    playerId: string;
    teamId: string;
    displayName: string;
    teamName: string;
    grade?: string;
};

export type PlayerDirectoryMaps = {
    playerMap: Map<string, PlayerDirectoryEntry>;
    teamNameMap: Map<string, string>;
};

export function createPlayerDirectory(teams: Team[]): PlayerDirectoryMaps {
    const playerMap = new Map<string, PlayerDirectoryEntry>();
    const teamNameMap = new Map<string, string>();

    teams.forEach(team => {
        if (!team.teamId) return;
        teamNameMap.set(team.teamId, team.teamName);
        team.players.forEach(player => {
            if (!player.playerId) return;
            playerMap.set(player.playerId, {
                playerId: player.playerId,
                teamId: team.teamId,
                displayName: player.displayName,
                teamName: team.teamName,
                grade: player.grade,
            });
        });
    });

    return { playerMap, teamNameMap };
}

export function resolvePlayerFromDirectory(
    directory: PlayerDirectoryMaps,
    teamId: string,
    playerId: string
): PlayerDirectoryEntry {
    const entry = directory.playerMap.get(playerId);
    if (entry) return entry;

    const teamName = directory.teamNameMap.get(teamId) ?? "所属未登録";
    const fallbackName = playerId || "選手未登録";

    return {
        playerId,
        teamId,
        displayName: fallbackName,
        teamName,
    };
}

export function resolveMatchPlayer(
    player: MatchPlayer,
    directory: PlayerDirectoryMaps
): ResolvedMatchPlayer {
    const info = resolvePlayerFromDirectory(directory, player.teamId, player.playerId);
    return {
        ...player,
        displayName: info.displayName,
        teamName: info.teamName,
        grade: info.grade,
    };
}

export function resolvePlayerFromTeams(
    teams: Team[],
    teamId: string,
    playerId: string
): PlayerDirectoryEntry {
    const team = teams.find(t => t.teamId === teamId);
    if (!team) {
        return {
            playerId,
            teamId,
            displayName: playerId || "選手未登録",
            teamName: "所属未登録",
        };
    }

    const player = team.players.find(p => p.playerId === playerId);
    if (!player) {
        return {
            playerId,
            teamId,
            displayName: playerId || "選手未登録",
            teamName: team.teamName,
        };
    }

    return {
        playerId,
        teamId,
        displayName: player.displayName,
        teamName: team.teamName,
        grade: player.grade,
    };
}

export function resolveMatchPlayerFromTeams(
    player: MatchPlayer,
    teams: Team[]
): ResolvedMatchPlayer {
    const info = resolvePlayerFromTeams(teams, player.teamId, player.playerId);
    return {
        ...player,
        displayName: info.displayName,
        teamName: info.teamName,
        grade: info.grade,
    };
}
