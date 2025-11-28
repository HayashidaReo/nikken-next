"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { TableRow } from "@/components/atoms/table";
import ScoreCell from "@/components/molecules/score-cell";
import PlayerCell from "@/components/molecules/player-cell";
import ActionCell from "@/components/molecules/action-cell";
import { SCORE_COLORS, MATCH_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import MatchTable from "@/components/organisms/match-table";
import type { Match } from "@/types/match.schema";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";
import { createPlayerDirectory, resolveMatchPlayer } from "@/lib/utils/player-directory";
import { useMasterData } from "@/components/providers/master-data-provider";
import { WIN_REASON_LABELS } from "@/lib/constants";

interface MatchListTableProps {
  matches: Match[];
  tournamentName: string;
  className?: string;
}

export function MatchListTable({ matches, tournamentName, className }: MatchListTableProps) {
  const router = useRouter();
  const initializeMatch = useMonitorStore((s) => s.initializeMatch);
  const { teams, courts, rounds } = useMasterData();

  // teams Mapから配列に変換してディレクトリ作成（必要なら最適化可能だが一旦これで）
  const teamsArray = useMemo(() => Array.from(teams.values()), [teams]);
  const playerDirectory = useMemo(() => createPlayerDirectory(teamsArray), [teamsArray]);

  const getPlayerTextColor = (playerScore: number, opponentScore: number, isCompleted: boolean, winner: "playerA" | "playerB" | "draw" | "none" | null | undefined, isPlayerA: boolean) => {
    if (!isCompleted) return SCORE_COLORS.unplayed;

    if (winner) {
      if (winner === "draw") return SCORE_COLORS.draw;
      if (isPlayerA && winner === "playerA") return SCORE_COLORS.win;
      if (!isPlayerA && winner === "playerB") return SCORE_COLORS.win;
      return SCORE_COLORS.loss;
    }

    // Fallback to score comparison if winner is not set (legacy data)
    if (playerScore === 0 && opponentScore === 0) {
      return SCORE_COLORS.draw;
    }
    if (playerScore > opponentScore) return SCORE_COLORS.win;
    if (playerScore === opponentScore) return SCORE_COLORS.draw;
    return SCORE_COLORS.loss;
  };

  return (
    <MatchTable
      title={tournamentName}
      columns={[
        { key: "court", label: "コート名", width: MATCH_TABLE_COLUMN_WIDTHS.courtName },
        { key: "round", label: "ラウンド", width: MATCH_TABLE_COLUMN_WIDTHS.round },
        { key: "playerATeam", label: "選手A所属", width: MATCH_TABLE_COLUMN_WIDTHS.playerATeam },
        { key: "playerAName", label: "選手A名", width: MATCH_TABLE_COLUMN_WIDTHS.playerAName },
        { key: "score", label: "得点", width: MATCH_TABLE_COLUMN_WIDTHS.score, className: "text-center" },
        { key: "playerBTeam", label: "選手B所属", width: MATCH_TABLE_COLUMN_WIDTHS.playerBTeam },
        { key: "playerBName", label: "選手B名", width: MATCH_TABLE_COLUMN_WIDTHS.playerBName },
        { key: "action", label: "モニター", width: MATCH_TABLE_COLUMN_WIDTHS.action, className: "text-center" },
      ]}
      className={className}
    >
      {matches.map((match) => {
        const playerA = resolveMatchPlayer(match.players.playerA, playerDirectory);
        const playerB = resolveMatchPlayer(match.players.playerB, playerDirectory);
        const courtName = courts.get(match.courtId)?.courtName || "";
        const roundName = rounds.get(match.roundId)?.roundName || "";
        const playerAColor = getPlayerTextColor(playerA.score, playerB.score, match.isCompleted, match.winner, true);
        const playerBColor = getPlayerTextColor(playerB.score, playerA.score, match.isCompleted, match.winner, false);

        const winReasonLabel = match.winReason && match.winReason !== "none"
          ? WIN_REASON_LABELS[match.winReason]
          : "";


        return (
          <TableRow key={match.matchId}>
            <PlayerCell text={courtName} title={courtName} />
            <PlayerCell text={roundName} title={roundName} />
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
            {winReasonLabel && (
              <div className="text-[10px] text-gray-500 text-center -mt-1">{winReasonLabel}</div>
            )}
            <PlayerCell text={playerB.teamName} title={playerB.teamName} colorClass={playerBColor} />
            <PlayerCell text={playerB.displayName} title={playerB.displayName} colorClass={playerBColor} />
            <ActionCell
              onMonitor={() => {
                initializeMatch(match, tournamentName, courtName, {
                  resolvedPlayers: {
                    playerA,
                    playerB,
                  },
                  roundName,
                });
                router.push(`/monitor-control/${match.matchId}`);
              }}
            />
          </TableRow>
        );
      })}
    </MatchTable>
  );
}

export const MatchListTableMemo = memo(MatchListTable);
