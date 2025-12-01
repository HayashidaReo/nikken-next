import { LocalMatch, LocalTeamMatch } from "@/lib/db";
import { useMasterData } from "@/components/providers/master-data-provider";
import { cn } from "@/lib/utils/utils";
import { MatchScoreDisplay } from "@/components/molecules/match-score-display";
import { WIN_REASON_LABELS, getTeamMatchRoundLabelById } from "@/lib/constants";
import { Badge } from "./badge";
import { getPlayerTextColor } from "./utils";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

interface MatchItemProps {
    match: LocalMatch | LocalTeamMatch;
    showRound?: boolean;
}

export const MatchItem = ({ match, showRound = true }: MatchItemProps) => {
    const { getTeam, getCourt, getRound } = useMasterData();

    const getPlayerName = (teamId: string, playerId: string) => {
        const team = getTeam(teamId);
        if (!team) return playerId;
        const player = team.players.find(p => p.playerId === playerId);
        return player ? player.displayName : playerId;
    };

    const getCourtName = (courtId: string) => {
        const court = getCourt(courtId);
        return court ? court.courtName : courtId;
    };

    const getRoundName = (roundId: string) => {
        const round = getRound(roundId);
        return round ? round.roundName : roundId;
    };

    const playerAName = getPlayerName(match.players.playerA.teamId, match.players.playerA.playerId);
    const playerBName = getPlayerName(match.players.playerB.teamId, match.players.playerB.playerId);
    const playerAColor = getPlayerTextColor(match.players.playerA.score, match.players.playerB.score, match.isCompleted, match.winner, true);
    const playerBColor = getPlayerTextColor(match.players.playerB.score, match.players.playerA.score, match.isCompleted, match.winner, false);
    const winReason = match.winReason && match.winReason !== "none" ? WIN_REASON_LABELS[match.winReason] : "";

    return (
        <div className="bg-white p-2 rounded border shadow-sm">
            {/* Header: Round | Result | Status */}
            <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-gray-700">
                    {showRound ? `${getRoundName(match.roundId)} - ` : ""}
                    {'courtId' in match ? getCourtName(match.courtId) : (getTeamMatchRoundLabelById(match.roundId) || `第${match.sortOrder}試合`)}
                </span>
                <div className="flex items-center gap-2">
                    {winReason && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{winReason}</span>}
                    {match._deleted && <Badge>削除対象</Badge>}
                </div>
            </div>

            {/* Body: Player A [Score] Player B */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <div className={cn("text-base font-bold text-right truncate leading-tight", playerAColor)}>
                    {playerAName}
                </div>

                <MatchScoreDisplay
                    playerAScore={match.players.playerA.score}
                    playerBScore={match.players.playerB.score}
                    playerAColor={playerAColor}
                    playerBColor={playerBColor}
                    playerADisplayName={playerAName}
                    playerBDisplayName={playerBName}
                    playerAHansoku={match.players.playerA.hansoku as HansokuLevel}
                    playerBHansoku={match.players.playerB.hansoku as HansokuLevel}
                    isCompleted={match.isCompleted}
                    className="scale-90" // Slightly compact the score component
                />

                <div className={cn("text-base font-bold text-left truncate leading-tight", playerBColor)}>
                    {playerBName}
                </div>
            </div>
            <div className="text-[10px] text-gray-400 text-left mt-1">
                ID: {match.matchId}
            </div>
        </div>
    );
};
