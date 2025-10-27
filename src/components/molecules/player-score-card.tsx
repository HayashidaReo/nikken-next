"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";

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
      <CardHeader>
        <CardTitle className={cn(titleColor)}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-lg font-medium">{player.teamName}</div>
          <div className="text-2xl font-bold">{player.displayName}</div>
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
            {hansokuOptions.map(hansoku => (
              <Button
                key={hansoku.value}
                variant={
                  player.hansoku === hansoku.value ? "default" : "outline"
                }
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
