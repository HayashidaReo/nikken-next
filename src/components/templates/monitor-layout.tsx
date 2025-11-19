import { PlayerSection } from "@/components/organisms/player-section";
import { CenterSection } from "@/components/organisms/center-section";
import { type MonitorData } from "@/types/monitor.schema";
import { toMatchPlayerForMonitor } from "@/lib/mappers/monitor";

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
      {/* PlayerSection は MatchPlayer を期待するため、MonitorPlayer を MatchPlayer に変換して渡す */}
      <PlayerSection player={toMatchPlayerForMonitor(data.playerA)} variant="red" />

      {/* 中央セクション - 大会情報とタイマー */}
      <CenterSection
        tournamentName={data.tournamentName}
        courtName={data.courtName}
        round={data.round}
        timeRemaining={data.timeRemaining}
        isTimerRunning={data.isTimerRunning}
      />

      {/* 下側 - 選手B（グレー/白チーム） */}
      <PlayerSection player={toMatchPlayerForMonitor(data.playerB)} variant="white" />
    </div>
  );
}
