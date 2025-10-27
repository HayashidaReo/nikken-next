"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Switch } from "@/components/atoms/switch";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";
import { useMonitorStore } from "@/store/use-monitor-store";
import { Play, Pause, RotateCcw, Save, Monitor } from "lucide-react";

interface ScoreboardOperatorProps {
  className?: string;
}

export function ScoreboardOperator({ className }: ScoreboardOperatorProps) {
  const {
    courtName,
    round,
    tournamentName,
    playerA,
    playerB,
    timeRemaining,
    isTimerRunning,
    isPublic,
    setPlayerScore,
    setPlayerHansoku,
    setTimeRemaining,
    startTimer,
    stopTimer,
    togglePublic,
    saveMatchResult,
  } = useMonitorStore();
  
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // タイマー処理
  React.useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        useMonitorStore.getState().setTimeRemaining(timeRemaining - 1);
        
        // 0秒になったら自動停止
        if (timeRemaining <= 1) {
          stopTimer();
        }
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, stopTimer]);
  
  // 時間を分:秒形式に変換
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  

  
  // 表示用モニターを開く関数
  const openPresentationMonitor = async () => {
    try {
      // Presentation API未対応または実装予定のため、新しいウィンドウで開く
      window.open('/monitor-display', '_blank', 'fullscreen=yes,width=1920,height=1080');
    } catch (error) {
      console.error('Monitor display failed:', error);
    }
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* ヘッダー情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>モニター操作画面</span>
            <Button onClick={openPresentationMonitor} variant="outline">
              <Monitor className="w-4 h-4 mr-2" />
              表示用モニターを開く
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Label className="text-sm text-gray-600">大会名</Label>
              <p className="font-medium">{tournamentName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">コート</Label>
              <p className="font-medium">{courtName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">回戦</Label>
              <p className="font-medium">{round}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 選手A */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">選手A</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium">{playerA.teamName}</div>
              <div className="text-2xl font-bold">{playerA.displayName}</div>
            </div>
            
            {/* 得点 */}
            <div>
              <Label className="text-sm font-medium mb-2 block">得点</Label>
              <div className="flex gap-2">
                {[0, 1, 2].map((score) => (
                  <Button
                    key={score}
                    variant={playerA.score === score ? "default" : "outline"}
                    onClick={() => setPlayerScore("A", score)}
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
                {[
                  { value: 0, label: "なし" },
                  { value: 1, label: "黄" },
                  { value: 2, label: "赤" },
                  { value: 3, label: "赤・黄" },
                  { value: 4, label: "赤・赤" },
                ].map((hansoku) => (
                  <Button
                    key={hansoku.value}
                    variant={playerA.hansoku === hansoku.value ? "default" : "outline"}
                    onClick={() => setPlayerHansoku("A", hansoku.value)}
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

        {/* 選手B */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">選手B</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium">{playerB.teamName}</div>
              <div className="text-2xl font-bold">{playerB.displayName}</div>
            </div>
            
            {/* 得点 */}
            <div>
              <Label className="text-sm font-medium mb-2 block">得点</Label>
              <div className="flex gap-2">
                {[0, 1, 2].map((score) => (
                  <Button
                    key={score}
                    variant={playerB.score === score ? "default" : "outline"}
                    onClick={() => setPlayerScore("B", score)}
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
                {[
                  { value: 0, label: "なし" },
                  { value: 1, label: "黄" },
                  { value: 2, label: "赤" },
                  { value: 3, label: "赤・黄" },
                  { value: 4, label: "赤・赤" },
                ].map((hansoku) => (
                  <Button
                    key={hansoku.value}
                    variant={playerB.hansoku === hansoku.value ? "default" : "outline"}
                    onClick={() => setPlayerHansoku("B", hansoku.value)}
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
      </div>

      {/* タイマーコントロール */}
      <Card>
        <CardHeader>
          <CardTitle>タイマー制御</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold mb-4">
                {formatTime(timeRemaining)}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={isTimerRunning ? "destructive" : "default"}
                  onClick={isTimerRunning ? stopTimer : startTimer}
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
                  onClick={() => setTimeRemaining(180)}
                  disabled={isTimerRunning}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  リセット
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 表示制御と保存 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isPublic}
                onCheckedChange={togglePublic}
                id="public-toggle"
              />
              <Label htmlFor="public-toggle" className="font-medium">
                {isPublic ? "公開中" : "非公開"}
              </Label>
            </div>
            
            <Button onClick={saveMatchResult} size="lg">
              <Save className="w-4 h-4 mr-2" />
              試合結果を保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}