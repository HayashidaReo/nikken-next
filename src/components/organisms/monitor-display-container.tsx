import * as React from "react";
import { useMonitorData } from "@/hooks/use-monitor-data";
import { ConnectionStatus } from "@/components/organisms/connection-status";
import { MonitorLayout } from "@/components/templates/monitor-layout";
import { StandbyScreen } from "@/components/templates/standby-screen";

interface MonitorDisplayContainerProps {
  className?: string;
}

export function MonitorDisplayContainer({
  className = "",
}: MonitorDisplayContainerProps) {
  const { data, isConnected, error } = useMonitorData();

  // 非公開時の表示
  if (!data.isPublic) {
    return <StandbyScreen />;
  }

  return (
    <div
      className={`min-h-screen bg-black text-white relative overflow-hidden ${className}`}
    >
      {/* 接続状態とエラー表示 */}
      <ConnectionStatus isConnected={isConnected} error={error} />

      {/* メイン画面レイアウト */}
      <MonitorLayout
        playerA={{
          displayName: data.playerA.displayName,
          playerId: '', // PlayerDataには含まれていない
          teamId: '', // PlayerDataには含まれていない
          teamName: data.playerA.teamName,
          score: data.playerA.score,
          hansoku: data.playerA.hansoku,
        }}
        playerB={{
          displayName: data.playerB.displayName,
          playerId: '', // PlayerDataには含まれていない
          teamId: '', // PlayerDataには含まれていない
          teamName: data.playerB.teamName,
          score: data.playerB.score,
          hansoku: data.playerB.hansoku,
        }}
        tournamentName={data.tournamentName}
        courtName={data.courtName}
        round={data.round}
        timeRemaining={data.timeRemaining}
        isTimerRunning={data.isTimerRunning}
      />
    </div>
  );
}
