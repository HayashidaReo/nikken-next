"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";
import { PenaltyDisplay } from "@/components/molecules/penalty-display";
import type { Match } from "@/types/match.schema";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

interface MatchListTableProps {
  matches: Match[];
  tournamentName: string;
  courts?: Array<{ courtId: string; courtName: string }>;
  className?: string;
}

export function MatchListTable({
  matches,
  tournamentName,
  courts,
  className,
}: MatchListTableProps) {
  const router = useRouter();
  const initializeMatch = useMonitorStore((s) => s.initializeMatch);
  // 得点に応じた文字色を決定する関数（固定色使用）
  const getPlayerTextColor = (playerScore: number, opponentScore: number) => {
    if (playerScore > opponentScore) {
      return "font-medium" + " " + "text-blue-600"; // 勝利（青色）
    } else if (playerScore === opponentScore) {
      return "text-cyan-600"; // 引き分け（水色）
    } else {
      return "text-gray-900"; // 敗北または通常（黒色）
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{tournamentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>コート名</TableHead>
              <TableHead>ラウンド</TableHead>
              <TableHead>選手A所属</TableHead>
              <TableHead>選手A名</TableHead>
              <TableHead className="text-center">得点</TableHead>
              <TableHead>選手B所属</TableHead>
              <TableHead>選手B名</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map(match => {
              const { playerA, playerB } = match.players;
              // コート名を courts 配列から解決する（存在しなければ courtId をフォールバック表示）
              const court = courts?.find((c) => c.courtId === match.courtId);
              const courtName = court ? court.courtName : match.courtId;
              const playerAColor = getPlayerTextColor(
                playerA.score,
                playerB.score
              );
              const playerBColor = getPlayerTextColor(
                playerB.score,
                playerA.score
              );

              return (
                <TableRow key={match.matchId}>
                  <TableCell>{courtName}</TableCell>
                  <TableCell>{match.round}</TableCell>
                  <TableCell className={playerAColor}>
                    {playerA.teamName}
                  </TableCell>
                  <TableCell className={playerAColor}>
                    {playerA.displayName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center justify-center gap-3 py-2">
                      {/* 得点表示（左右対称・ハイフン付き） */}
                      <div className="flex items-center gap-2">
                        <span className={cn("text-2xl font-bold tabular-nums", playerAColor)}>
                          {playerA.score}
                        </span>
                        <span className="text-xl text-gray-400 font-medium">-</span>
                        <span className={cn("text-2xl font-bold tabular-nums", playerBColor)}>
                          {playerB.score}
                        </span>
                      </div>
                      {/* 反則カード表示（色付き）- 常に固定領域を確保 */}
                      <div className="flex items-center gap-2 w-full px-2">
                        {/* 選手A反則（右寄せ・固定幅） */}
                        <div className="flex-1 flex justify-end h-6">
                          <PenaltyDisplay hansokuCount={(playerA.hansoku) as HansokuLevel} variant="compact" />
                        </div>
                        {/* 中央区切り */}
                        <span className="flex items-center justify-center h-6 text-xs text-gray-300 mx-1">|</span>
                        {/* 選手B反則（左寄せ・固定幅） */}
                        <div className="flex-1 flex justify-start h-6">
                          <PenaltyDisplay hansokuCount={(playerB.hansoku) as HansokuLevel} variant="compact" />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={playerBColor}>
                    {playerB.teamName}
                  </TableCell>
                  <TableCell className={playerBColor}>
                    {playerB.displayName}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // 選択された試合情報をストアに保存してから遷移（Firestore通信回避のため）
                        const court = courts?.find(
                          (c) => c.courtId === match.courtId
                        );
                        const courtName = court ? court.courtName : match.courtId;
                        initializeMatch(match, tournamentName, courtName);
                        router.push(`/monitor-control/${match.matchId}`);
                      }}
                    >
                      操作画面
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {matches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            試合データがありません
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// React.memo でラップして、props が変わらない限り再レンダリングされないようにする
export const MatchListTableMemo = memo(MatchListTable);
