"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { Button } from "@/components/atoms/button";
import { TableCell, TableRow } from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";
import { findCourtName } from "@/lib/utils/court-utils";
import { PenaltyDisplay } from "@/components/molecules/penalty-display";
import { SCORE_COLORS, MATCH_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import { Monitor } from "lucide-react";
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
        const srText = match.isCompleted
          ? `${playerA.displayName} ${playerA.score}点 対 ${playerB.displayName} ${playerB.score}点`
          : `${playerA.displayName} と ${playerB.displayName} の試合は未試合です。`;

        return (
          <TableRow key={match.matchId}>
            <TableCell className="truncate" title={courtName}>
              {courtName}
            </TableCell>
            <TableCell className="truncate" title={match.round}>
              {match.round}
            </TableCell>
            <TableCell className="truncate" title={playerA.teamName}>
              <div className={playerAColor}>{playerA.teamName}</div>
            </TableCell>
            <TableCell className="truncate" title={playerA.displayName}>
              <div className={playerAColor}>{playerA.displayName}</div>
            </TableCell>
            <TableCell className="py-1 px-3 text-center">
              <div className="flex items-center justify-center gap-1 py-1">
                <div className={cn("text-xl", playerAColor)}>{playerA.score}</div>
                <div className="text-xl">-</div>
                <div className={cn("text-xl", playerBColor)}>{playerB.score}</div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-1 h-5">
                <PenaltyDisplay hansokuCount={playerA.hansoku as HansokuLevel} ariaLabel={`${playerA.displayName}の反則`} />
                <PenaltyDisplay hansokuCount={playerB.hansoku as HansokuLevel} ariaLabel={`${playerB.displayName}の反則`} />
              </div>
              <span className="sr-only">{srText}</span>
            </TableCell>
            <TableCell className="truncate" title={playerB.teamName}>
              {playerB.teamName}
            </TableCell>
            <TableCell className="truncate" title={playerB.displayName}>
              <div className={playerBColor}>{playerB.displayName}</div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const courtNameForInit = findCourtName(match.courtId, courts);
                    initializeMatch(match, tournamentName, courtNameForInit);
                    router.push(`/monitor-control/${match.matchId}`);
                  }}
                  title="モニターを開く"
                  aria-label="モニター"
                  className="hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm transition-transform active:scale-95"
                >
                  <Monitor className="h-5 w-5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </MatchTable>
  );
}

export const MatchListTableMemo = memo(MatchListTable);
