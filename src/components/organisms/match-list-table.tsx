"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { TableRow } from "@/components/atoms/table";
import { findCourtName } from "@/lib/utils/court-utils";
import ScoreCell from "@/components/molecules/score-cell";
import PlayerCell from "@/components/molecules/player-cell";
import ActionCell from "@/components/molecules/action-cell";
import { SCORE_COLORS, MATCH_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import MatchTable from "@/components/organisms/match-table";
import type { Match } from "@/types/match.schema";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

interface MatchListTableProps {
  matches: Match[];
  tournamentName: string;
  courts?: Array<{ courtId: string; courtName: string }>;
  className?: string;
}

export function MatchListTable({ matches, tournamentName, courts, className, }: MatchListTableProps) {
  const router = useRouter();
  const initializeMatch = useMonitorStore((s) => s.initializeMatch);

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
        const { playerA, playerB } = match.players;
        const courtName = findCourtName(match.courtId, courts);
        const playerAColor = getPlayerTextColor(playerA.score, playerB.score, match.isCompleted);
        const playerBColor = getPlayerTextColor(playerB.score, playerA.score, match.isCompleted);


        return (
          <TableRow key={match.matchId}>
            <PlayerCell text={courtName} title={courtName} />
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
            <PlayerCell text={playerB.teamName} title={playerB.teamName} />
            <PlayerCell text={playerB.displayName} title={playerB.displayName} colorClass={playerBColor} />
            <ActionCell
              onMonitor={() => {
                const courtNameForInit = findCourtName(match.courtId, courts);
                initializeMatch(match, tournamentName, courtNameForInit);
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
