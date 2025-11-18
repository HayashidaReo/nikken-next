"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils/utils";

export interface Player {
  teamName: string;
  displayName: string;
  score: number;
  hansoku: number;
}

interface PlayerScoreCardProps {
  player: Player;
  playerKey: "A" | "B";
  title: string;
  titleColor: string;
  onScoreChange: (playerKey: "A" | "B", score: number) => void;
  onHansokuChange: (playerKey: "A" | "B", hansoku: number) => void;
  className?: string;
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
  className,
}: PlayerScoreCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="p-4 pb-0">
        <CardTitle className={cn(titleColor)}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-500">{player.teamName}</div>
          <div className="text-3xl font-bold">{player.displayName}</div>
        </div>

        {/* 得点 */}
        <div>
          <Label className="text-sm font-medium mb-2 block">得点</Label>
          <div className="flex gap-2">
            {[0, 1, 2].map(score => (
              <Button
                key={score}
                variant={player.score === score ? "default" : "outline"}
                onClick={() => onScoreChange(playerKey, score)}
                className="flex-1"
              >
                {score}
              </Button>
            ))}
          </div>
        </div>

        {/* 反則 */}
        <div>
          <Label className="text-sm font-medium mb-2 block">反則</Label>
          <div className="grid grid-cols-2 gap-2">
            {/* 1行目: なし を2列分使う */}
            {hansokuOptions.length > 0 && (
              <Button
                key={hansokuOptions[0].value}
                variant={player.hansoku === hansokuOptions[0].value ? "default" : "outline"}
                onClick={() => onHansokuChange(playerKey, hansokuOptions[0].value)}
                className="text-xs col-span-2"
                size="sm"
              >
                {hansokuOptions[0].label}
              </Button>
            )}

            {/* 2行目以降: 残りを2列で表示（黄, 赤 がここに来る） */}
            {hansokuOptions.slice(1).map(hansoku => (
              <Button
                key={hansoku.value}
                variant={player.hansoku === hansoku.value ? "default" : "outline"}
                onClick={() => onHansokuChange(playerKey, hansoku.value)}
                className="text-xs"
                size="sm"
              >
                {hansoku.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
