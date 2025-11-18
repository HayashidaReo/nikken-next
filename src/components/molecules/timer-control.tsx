"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { ShortcutBadge } from "@/components/atoms/shortcut-badge";
import { TimeAdjuster } from "./time-adjuster";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerControlProps {
  timeRemaining: number;
  isTimerRunning: boolean;
  onTimeChange: (newTime: number) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  className?: string;
}

export function TimerControl({
  timeRemaining,
  isTimerRunning,
  onTimeChange,
  onStartTimer,
  onStopTimer,
  className,
}: TimerControlProps) {
  return (
    <Card className={className}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center gap-2">
          <CardTitle>タイマー制御</CardTitle>
          <ShortcutBadge shortcut="Double Space" className="text-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 items-center">
          {/* 左: 空白 */}
          <div />

          {/* 中央: タイマー */}
          <div className="flex justify-center">
            <div className="mb-0">
              <TimeAdjuster
                value={timeRemaining}
                onChange={onTimeChange}
                disabled={isTimerRunning}
                size="lg"
                longPressDelay={300}
                longPressInterval={80}
              />
            </div>
          </div>

          {/* 右: ボタン群 */}
          <div className="flex justify-end items-center space-x-2">
            <Button
              variant={isTimerRunning ? "destructive" : "default"}
              onClick={isTimerRunning ? onStopTimer : onStartTimer}
              size="lg"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  停止
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  開始
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => onTimeChange(180)}
              disabled={isTimerRunning}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              リセット
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
