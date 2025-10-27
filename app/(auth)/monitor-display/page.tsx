"use client";

import * as React from "react";
import { useMonitorData } from "@/hooks/use-monitor-data";
import { ConnectionStatus } from "@/components/organisms/connection-status";
import { PlayerSection } from "@/components/organisms/player-section";
import { CenterSection } from "@/components/organisms/center-section";
import { StandbyScreen } from "@/components/templates/standby-screen";

export default function MonitorDisplayPage() {
  const { data, isConnected, error } = useMonitorData();

  // 非公開時の表示
  if (!data.isPublic) {
    return <StandbyScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 接続状態とエラー表示 */}
      <ConnectionStatus isConnected={isConnected} error={error} />

      {/* メイン画面 - 2分割レイアウト */}
      <div className="h-screen flex flex-col">
        {/* 上側 - 選手A（赤チーム） */}
        <PlayerSection player={data.playerA} variant="red" />

        {/* 中央セクション - 大会情報とタイマー */}
        <CenterSection
          tournamentName={data.tournamentName}
          courtName={data.courtName}
          round={data.round}
          timeRemaining={data.timeRemaining}
          isTimerRunning={data.isTimerRunning}
        />

        {/* 下側 - 選手B（グレー/白チーム） */}
        <PlayerSection player={data.playerB} variant="white" />
      </div>
    </div>
  );
}
