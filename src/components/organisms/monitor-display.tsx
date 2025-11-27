"use client";

import { useMonitorStore } from "@/store/use-monitor-store";
import { SCORE_CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils/utils";
import { formatTime } from "@/lib/utils/time-utils";

interface MonitorDisplayProps {
  className?: string;
}

export function MonitorDisplay({ className }: MonitorDisplayProps) {
  const {
    courtName,
    roundName,
    tournamentName,
    playerA,
    playerB,
    timeRemaining,
  } = useMonitorStore();

  // 反則状態を表示用に変換
  const getHansokuDisplay = (hansoku: number) => {
    switch (hansoku) {
      case 0:
        return "";
      case 1:
        return "黄";
      case 2:
        return "赤";
      case 3:
        return "赤・黄";
      case 4:
        return "赤・赤";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8",
        className
      )}
    >
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{tournamentName}</h1>
        <div className="text-2xl opacity-90">
          {courtName} - {roundName}
        </div>
      </div>

      {/* メインスコアボード */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-8 items-center">
          {/* 選手A */}
          <div className="text-center">
            <div className="bg-blue-600 rounded-lg p-8 mb-4">
              <div className="text-2xl mb-2 opacity-90">{playerA.teamName}</div>
              <div className="text-5xl font-bold mb-4">
                {playerA.displayName}
              </div>
              <div className="text-8xl font-mono font-bold">
                {playerA.score}
              </div>
              {getHansokuDisplay(playerA.hansoku) && (
                <div className="text-2xl mt-4 text-yellow-300">
                  反則: {getHansokuDisplay(playerA.hansoku)}
                </div>
              )}
            </div>
          </div>

          {/* 中央（タイマー） */}
          <div className="text-center">
            <div className="bg-gray-700 rounded-lg p-8">
              <div className="text-2xl mb-4 opacity-90">残り時間</div>
              <div className="text-6xl font-mono font-bold text-green-400">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* 選手B */}
          <div className="text-center">
            <div className="bg-red-600 rounded-lg p-8 mb-4">
              <div className="text-2xl mb-2 opacity-90">{playerB.teamName}</div>
              <div className="text-5xl font-bold mb-4">
                {playerB.displayName}
              </div>
              <div className="text-8xl font-mono font-bold">
                {playerB.score}
              </div>
              {getHansokuDisplay(playerB.hansoku) && (
                <div className="text-2xl mt-4 text-yellow-300">
                  反則: {getHansokuDisplay(playerB.hansoku)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 試合状況メッセージ */}
        <div className="text-center mt-12">
          {(playerA.score >= SCORE_CONSTANTS.MAX_SCORE || playerB.score >= SCORE_CONSTANTS.MAX_SCORE) && (
            <div className="text-3xl font-bold text-yellow-300">試合終了</div>
          )}
          {timeRemaining <= 0 && playerA.score === playerB.score && (
            <div className="text-3xl font-bold text-yellow-300">引き分け</div>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="absolute bottom-8 left-8 text-lg opacity-70">
        日本拳法大会管理システム
      </div>
    </div>
  );
}
