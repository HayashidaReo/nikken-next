"use client";

import Link from "next/link";
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
import type { Match } from "@/types/match.schema";

interface MatchListTableProps {
  matches: Match[];
  tournamentName: string;
  className?: string;
}

export function MatchListTable({
  matches,
  tournamentName,
  className,
}: MatchListTableProps) {
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

  // 反則状態を文字で表示する関数
  const getHansokuDisplay = (hansoku: number) => {
    switch (hansoku) {
      case 0:
        return "-";
      case 1:
        return "黄";
      case 2:
        return "赤";
      case 3:
        return "赤・黄";
      case 4:
        return "赤・赤";
      default:
        return "-";
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
              <TableHead>回戦</TableHead>
              <TableHead>選手A所属</TableHead>
              <TableHead>選手A名</TableHead>
              <TableHead>選手B所属</TableHead>
              <TableHead>選手B名</TableHead>
              <TableHead>得点</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map(match => {
              const { playerA, playerB } = match.players;
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
                  <TableCell>{match.courtId}</TableCell>
                  <TableCell>{match.round}</TableCell>
                  <TableCell className={playerAColor}>
                    {playerA.teamName}
                  </TableCell>
                  <TableCell className={playerAColor}>
                    {playerA.displayName}
                  </TableCell>
                  <TableCell className={playerBColor}>
                    {playerB.teamName}
                  </TableCell>
                  <TableCell className={playerBColor}>
                    {playerB.displayName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={playerAColor}>{playerA.score}</span>
                      <span className={playerBColor}>{playerB.score}</span>
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      反則: {getHansokuDisplay(playerA.hansoku)} /{" "}
                      {getHansokuDisplay(playerB.hansoku)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/monitor-control/${match.matchId}`}>
                      <Button variant="outline" size="sm">
                        操作画面
                      </Button>
                    </Link>
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
