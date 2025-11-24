"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { TableRow } from "@/components/atoms/table";
import ScoreCell from "@/components/molecules/score-cell";
import PlayerCell from "@/components/molecules/player-cell";
import ActionCell from "@/components/molecules/action-cell";
import { SCORE_COLORS, TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import MatchTable from "@/components/organisms/match-table";
import type { TeamMatch } from "@/types/match.schema";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

interface TeamMatchListTableProps {
    matches: TeamMatch[];
    tournamentName: string;
    className?: string;
}

export function TeamMatchListTable({ matches, tournamentName, className }: TeamMatchListTableProps) {
    const router = useRouter();

    const getPlayerTextColor = (playerScore: number, opponentScore: number, isCompleted: boolean) => {
        if (playerScore === 0 && opponentScore === 0) {
            return isCompleted ? SCORE_COLORS.draw : SCORE_COLORS.unplayed;
        }
        if (playerScore > opponentScore) return SCORE_COLORS.win;
        if (playerScore === opponentScore) return SCORE_COLORS.draw;
        return SCORE_COLORS.loss;
    };

    return (
        <MatchTable
            title={tournamentName}
            columns={[
                { key: "round", label: "ラウンド", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.round },
                { key: "playerATeam", label: "選手A所属", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.playerATeam },
                { key: "playerAName", label: "選手A名", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.playerAName },
                { key: "score", label: "得点", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.score, className: "text-center" },
                { key: "playerBTeam", label: "選手B所属", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.playerBTeam },
                { key: "playerBName", label: "選手B名", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.playerBName },
                { key: "action", label: "モニター", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.action, className: "text-center" },
            ]}
            className={className}
        >
            {matches.map((match) => {
                const { playerA, playerB } = match.players;
                const playerAColor = getPlayerTextColor(playerA.score, playerB.score, match.isCompleted);
                const playerBColor = getPlayerTextColor(playerB.score, playerA.score, match.isCompleted);

                return (
                    <TableRow key={match.matchId}>
                        <PlayerCell text={match.round} title={match.round} />
                        <PlayerCell text={playerA.teamName} title={playerA.teamName} colorClass={playerAColor} />
                        <PlayerCell text={playerA.displayName} title={playerA.displayName} colorClass={playerAColor} />
                        <ScoreCell
                            playerAScore={playerA.score}
                            playerBScore={playerB.score}
                            playerAColor={playerAColor}
                            playerBColor={playerBColor}
                            playerADisplayName={playerA.displayName}
                            playerBDisplayName={playerB.displayName}
                            playerAHansoku={playerA.hansoku as HansokuLevel}
                            playerBHansoku={playerB.hansoku as HansokuLevel}
                            isCompleted={match.isCompleted}
                        />
                        <PlayerCell text={playerB.teamName} title={playerB.teamName} colorClass={playerBColor} />
                        <PlayerCell text={playerB.displayName} title={playerB.displayName} colorClass={playerBColor} />
                        <ActionCell
                            onMonitor={() => {
                                router.push(`/monitor-control/${match.matchId}`);
                            }}
                        />
                    </TableRow>
                );
            })}
        </MatchTable>
    );
}

export const TeamMatchListTableMemo = memo(TeamMatchListTable);
