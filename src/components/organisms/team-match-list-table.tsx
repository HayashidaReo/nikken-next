"use client";

import { memo, useMemo, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { TableRow, TableCell } from "@/components/atoms/table";
import ScoreCell from "@/components/molecules/score-cell";
import PlayerCell from "@/components/molecules/player-cell";
import ActionCell from "@/components/molecules/action-cell";
import { SCORE_COLORS, TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import MatchTable from "@/components/organisms/match-table";
import type { TeamMatch } from "@/types/match.schema";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";
import { createPlayerDirectory, resolveMatchPlayer } from "@/lib/utils/player-directory";
import { createMonitorGroupMatches } from "@/lib/utils/team-match-utils";
import { getTeamMatchRoundLabelById, WIN_REASON_LABELS } from "@/lib/constants";
import { useMasterData } from "@/components/providers/master-data-provider";
import { TeamMatchEditDialog } from "./team-match-edit-dialog";
import { MatchActionMenu } from "@/components/molecules/match-action-menu";

interface TeamMatchListTableProps {
    matches: TeamMatch[];
    tournamentName: ReactNode;
    rawTournamentName: string;
    courtName: string;
    className?: string;
}

export function TeamMatchListTable({ matches, tournamentName, rawTournamentName, courtName, className }: TeamMatchListTableProps) {
    const router = useRouter();
    const initializeMatch = useMonitorStore((s) => s.initializeMatch);
    const { teams } = useMasterData();

    const teamsArray = useMemo(() => Array.from(teams.values()), [teams]);
    const playerDirectory = useMemo(() => createPlayerDirectory(teamsArray), [teamsArray]);

    const [editingMatch, setEditingMatch] = useState<TeamMatch | null>(null);

    const getPlayerTextColor = (playerScore: number, opponentScore: number, isCompleted: boolean, winner: "playerA" | "playerB" | "draw" | "none" | null | undefined, isPlayerA: boolean) => {
        if (!isCompleted) return SCORE_COLORS.unplayed;

        if (winner && winner !== "none") {
            if (winner === "draw") return SCORE_COLORS.draw;
            if (isPlayerA && winner === "playerA") return SCORE_COLORS.win;
            if (!isPlayerA && winner === "playerB") return SCORE_COLORS.win;
            return SCORE_COLORS.loss;
        }

        if (playerScore === 0 && opponentScore === 0) {
            return SCORE_COLORS.draw;
        }
        if (playerScore > opponentScore) return SCORE_COLORS.win;
        if (playerScore === opponentScore) return SCORE_COLORS.draw;
        return SCORE_COLORS.loss;
    };

    return (
        <>
            <MatchTable
                title={tournamentName}
                columns={[
                    { key: "round", label: "ラウンド", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.round },
                    { key: "playerAName", label: "選手A名", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.playerAName },
                    { key: "score", label: "得点", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.score, className: "text-center" },
                    { key: "playerBName", label: "選手B名", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.playerBName },
                    { key: "winReason", label: "決着", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.winReason, className: "text-center" },
                    { key: "action", label: "モニター", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.action, className: "text-center" },
                    { key: "edit", label: "", width: TEAM_MATCH_LIST_TABLE_COLUMN_WIDTHS.edit, className: "text-center" },
                ]}
                className={className}
            >
                {matches.map((match) => {
                    const playerA = resolveMatchPlayer(match.players.playerA, playerDirectory);
                    const playerB = resolveMatchPlayer(match.players.playerB, playerDirectory);
                    const playerAColor = getPlayerTextColor(playerA.score, playerB.score, match.isCompleted, match.winner, true);
                    const playerBColor = getPlayerTextColor(playerB.score, playerA.score, match.isCompleted, match.winner, false);

                    const winReasonLabel = match.winReason && match.winReason !== "none"
                        ? WIN_REASON_LABELS[match.winReason]
                        : "";
                    // 定数からラウンド名を取得、それでもなければID
                    const roundName = getTeamMatchRoundLabelById(match.roundId) || match.roundId;

                    return (
                        <TableRow key={match.matchId}>
                            <PlayerCell text={roundName} title={roundName} className="text-lg font-medium" />
                            <PlayerCell text={playerA.displayName} title={playerA.displayName} colorClass={playerAColor} className="text-lg font-bold" />
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
                            <PlayerCell text={playerB.displayName} title={playerB.displayName} colorClass={playerBColor} className="text-lg font-bold" />
                            <TableCell className="p-2 text-center">
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-lg font-medium text-gray-600">{winReasonLabel || "-"}</span>
                                </div>
                            </TableCell>
                            <ActionCell
                                onMonitor={() => {
                                    initializeMatch(match, rawTournamentName, courtName, {
                                        resolvedPlayers: {
                                            playerA,
                                            playerB,
                                        },
                                        roundName,
                                        groupMatches: createMonitorGroupMatches(matches, match.matchGroupId, playerDirectory),
                                    });
                                    router.push(`/monitor-control/${match.matchId}`);
                                }}
                            />
                            <TableCell className="p-2 text-center">
                                <div className="flex items-center justify-center h-full">
                                    <MatchActionMenu onEdit={() => setEditingMatch(match)} />
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </MatchTable>

            {editingMatch && (
                <TeamMatchEditDialog
                    isOpen={!!editingMatch}
                    onClose={() => setEditingMatch(null)}
                    match={editingMatch}
                    playerAName={resolveMatchPlayer(editingMatch.players.playerA, playerDirectory).displayName}
                    playerBName={resolveMatchPlayer(editingMatch.players.playerB, playerDirectory).displayName}
                    playerATeamName={resolveMatchPlayer(editingMatch.players.playerA, playerDirectory).teamName}
                    playerBTeamName={resolveMatchPlayer(editingMatch.players.playerB, playerDirectory).teamName}
                />
            )}
        </>
    );
}

export const TeamMatchListTableMemo = memo(TeamMatchListTable);
