import type { MonitorPlayer } from "@/types/monitor.schema";
import type { MatchPlayer } from "@/types/match.schema";

/**
 * Convert a MonitorPlayer (display-only) to MatchPlayer expected by PlayerSection.
 * For monitor display we don't have playerId/teamId, so fill with empty strings.
 */
export function toMatchPlayerForMonitor(p: MonitorPlayer): MatchPlayer {
    return {
        displayName: p.displayName,
        teamName: p.teamName,
        score: p.score,
        hansoku: p.hansoku,
        playerId: "",
        teamId: "",
    };
}
