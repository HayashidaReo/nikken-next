"use client";

import { memo, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { TableRow, TableCell } from "@/components/atoms/table";
import ScoreCell from "@/components/molecules/score-cell";
import PlayerCell from "@/components/molecules/player-cell";
import ActionCell from "@/components/molecules/action-cell";
import { MATCH_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import MatchTable from "@/components/organisms/match-table";
import type { Match } from "@/types/match.schema";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";
import { createPlayerDirectory, resolveMatchPlayer } from "@/lib/utils/player-directory";
import { useMasterData } from "@/components/providers/master-data-provider";
import { WIN_REASON_LABELS } from "@/lib/constants";
import { MatchActionMenu } from "@/components/molecules/match-action-menu";
import { MatchEditDialog } from "./match-edit-dialog";
import { getPlayerTextColor } from "@/lib/utils/match-utils";

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

  const [editingMatch, setEditingMatch] = useState<Match | null>(null);



  return (
    <>
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
          { key: "winReason", label: "決着", width: MATCH_TABLE_COLUMN_WIDTHS.winReason, className: "text-center" },
          { key: "action", label: "モニター", width: MATCH_TABLE_COLUMN_WIDTHS.action, className: "text-center" },
          { key: "edit", label: "", width: MATCH_TABLE_COLUMN_WIDTHS.edit, className: "text-center" },
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
              <PlayerCell text={playerB.teamName} title={playerB.teamName} colorClass={playerBColor} />
              <PlayerCell text={playerB.displayName} title={playerB.displayName} colorClass={playerBColor} />
              <TableCell className="p-2 text-center">
                <div className="flex items-center justify-center h-full">
                  <span className="text-sm font-medium text-gray-600">{winReasonLabel || "-"}</span>
                </div>
              </TableCell>
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
        <MatchEditDialog
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

export const MatchListTableMemo = memo(MatchListTable);
