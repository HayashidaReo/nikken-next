import { PlayerSection } from "@/components/organisms/player-section";
import { CenterSection } from "@/components/organisms/center-section";
import { type MonitorData } from "@/types/monitor.schema";

interface MonitorLayoutProps {
  data: MonitorData;
  className?: string;
}
export function MonitorLayout({
  data,
  className = "",
}: MonitorLayoutProps) {
  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* 上側 - 選手A（赤チーム） */}
      <PlayerSection player={data.playerA} variant="red" />

      {/* 中央セクション - 線とタイマー */}
      <CenterSection
        timeRemaining={data.timeRemaining}
        isTimerRunning={data.isTimerRunning}
      />

      {/* 下側 - 選手B（グレー/白チーム） */}
      <PlayerSection player={data.playerB} variant="white" />
    </div>
  );
}
