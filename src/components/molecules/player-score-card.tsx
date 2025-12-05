"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { ShortcutBadge } from "@/components/atoms/shortcut-badge";
import { PenaltyDisplay } from "@/components/molecules/penalty-display";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";
import { useMonitorStore } from "@/store/use-monitor-store";
import { SCORE_COLORS } from "@/lib/ui-constants";
import { cn } from "@/lib/utils/utils";

export interface Player {
  teamName: string;
  displayName: string;
  score: number;
  hansoku: number;
  grade?: string;
}

interface PlayerScoreCardProps {
  player: Player;
  playerKey: "A" | "B";
  title: string;
  titleColor: string;
  onScoreChange: (playerKey: "A" | "B", score: number) => void;
  onHansokuChange: (playerKey: "A" | "B", hansoku: number) => void;

  isSelected: boolean;
  className?: string;
  isManual?: boolean;
  onNameChange?: (playerKey: "A" | "B", name: string) => void;
  onTeamNameChange?: (playerKey: "A" | "B", name: string) => void;
  onGradeChange?: (playerKey: "A" | "B", grade: string) => void;
  onSpecialWinAction?: (playerKey: "A" | "B", action: "fusen" | "hantei" | "hansoku") => void;
}

const hansokuOptions = [
  { value: 0, label: "なし" },
  { value: 1, label: "黄" },
  { value: 2, label: "赤" },
  { value: 3, label: "赤・黄" },
  { value: 4, label: "赤・赤" },
];

export function PlayerScoreCard({
  player,
  playerKey,
  title,
  titleColor,
  onScoreChange,
  onHansokuChange,
  isSelected,
  className,
  isManual = false,
  onNameChange,
  onTeamNameChange,
  onGradeChange,
  onSpecialWinAction,
}: PlayerScoreCardProps) {
  const { playerA: storePlayerA, playerB: storePlayerB } = useMonitorStore();

  const opponentScore = playerKey === "A" ? storePlayerB.score : storePlayerA.score;
  const scoreClass =
    player.score > opponentScore
      ? SCORE_COLORS.win
      : player.score === opponentScore
        ? SCORE_COLORS.draw
        : SCORE_COLORS.loss;



  return (
    <Card
      data-player-key={playerKey === "A" ? "playerA" : "playerB"}
      tabIndex={-1}
      className={cn(
        className,
        "transition-all duration-200 shadow-md",
        isSelected && "ring-2 ring-blue-500 ring-offset-2"
      )}
    >
      <CardHeader className="p-4 pb-0">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center justify-start space-x-2">
            {playerKey === "A" ? (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <CardTitle className={cn(titleColor)}>{title}</CardTitle>
                  <ShortcutBadge shortcut={playerKey} className="text-xs" />
                </div>
                {player.grade && (
                  <span className="text-lg font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {player.grade}
                  </span>
                )}
              </div>
            ) : (
              <PenaltyDisplay hansokuCount={player.hansoku as HansokuLevel} variant="medium" ariaLabel={`${title} の反則`} />
            )}
          </div>
          <div />

          <div className="flex items-center justify-end space-x-2">
            {playerKey === "B" ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <ShortcutBadge shortcut={playerKey} className="text-xs" />
                  <CardTitle className={cn(titleColor)}>{title}</CardTitle>
                </div>
                {player.grade && (
                  <span className="text-lg font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {player.grade}
                  </span>
                )}
              </div>
            ) : (
              <PenaltyDisplay hansokuCount={player.hansoku as HansokuLevel} variant="medium" ariaLabel={`${title} の反則`} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <div className="grid grid-cols-10 items-center text-center">
          <div className="col-span-1 flex items-center justify-start">
            {playerKey === "B" && (
              <span className={cn(scoreClass, "text-6xl font-bold mr-4")}>
                {player.score}
              </span>
            )}
          </div>

          <div className="col-span-8">
            {isManual ? (
              <div className="space-y-2 px-4 mt-2">
                <Input
                  value={player.teamName}
                  onChange={(e) => onTeamNameChange?.(playerKey, e.target.value)}
                  placeholder="チーム名"
                  className="text-center h-8 text-sm"
                />
                <Input
                  value={player.displayName}
                  onChange={(e) => onNameChange?.(playerKey, e.target.value)}
                  placeholder="選手名"
                  className="text-center font-bold text-lg"
                />
                <Input
                  value={player.grade || ""}
                  onChange={(e) => onGradeChange?.(playerKey, e.target.value)}
                  placeholder="段位"
                  className="text-center h-8 text-sm"
                />
              </div>
            ) : (
              <>
                <div className="text-lg font-medium text-gray-500">{player.teamName}</div>
                <div className="text-3xl font-bold">{player.displayName}</div>
              </>
            )}
          </div>

          <div className="col-span-1 flex items-center justify-end">
            {playerKey === "A" && (
              <span className={cn(scoreClass, "text-6xl font-bold ml-4")}>
                {player.score}
              </span>
            )}
          </div>
        </div>

        {/* 得点 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-medium">得点</Label>
            <ShortcutBadge shortcut="SS" className="text-xs" />
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map(score => (
              <Button
                key={score}
                tabIndex={-1}
                variant={player.score === score ? "default" : "outline"}
                onClick={() => onScoreChange(playerKey, score)}
                className="flex-1"
                disableHover
              >
                {score}
              </Button>
            ))}
          </div>
        </div>

        {/* 反則 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-medium">反則</Label>
            <ShortcutBadge shortcut="ZZ" className="text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* 1行目: なし を2列分使う */}
            {hansokuOptions.length > 0 && (
              <Button
                key={hansokuOptions[0].value}
                tabIndex={-1}
                variant={player.hansoku === hansokuOptions[0].value ? "default" : "outline"}
                onClick={() => onHansokuChange(playerKey, hansokuOptions[0].value)}
                className="text-xs col-span-2"
                size="sm"
                disableHover
              >
                {hansokuOptions[0].label}
              </Button>
            )}

            {/* 2行目以降: 残りを2列で表示（黄, 赤 がここに来る） */}
            {hansokuOptions.slice(1).map(hansoku => (
              <Button
                key={hansoku.value}
                tabIndex={-1}
                variant={player.hansoku === hansoku.value ? "default" : "outline"}
                onClick={() => onHansokuChange(playerKey, hansoku.value)}
                className="text-xs"
                size="sm"
                disableHover
              >
                {hansoku.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 特別な決着ボタン */}
        {!isManual && onSpecialWinAction && (
          <div className="pt-2 border-t mt-4">
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] px-1 h-8 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                onClick={() => onSpecialWinAction(playerKey, "fusen")}
              >
                不戦敗
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] px-1 h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={() => onSpecialWinAction(playerKey, "hantei")}
              >
                判定勝ち
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] px-1 h-8 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                onClick={() => onSpecialWinAction(playerKey, "hansoku")}
              >
                反則負け
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
