import { useMonitorData } from "@/hooks/use-monitor-data";
import { MonitorLayout } from "@/components/templates/monitor-layout";
import { StandbyScreen } from "@/components/templates/standby-screen";

interface TokenData {
  matchId: string;
  orgId: string;
  tournamentId: string;
}

interface MonitorDisplayContainerProps {
  className?: string;
  tokenData?: TokenData | null;
}

export function MonitorDisplayContainer({
  className = "",
  tokenData,
}: MonitorDisplayContainerProps) {
  const { data } = useMonitorData(tokenData);

  // 非公開時の表示
  if (!data.isPublic) {
    return <StandbyScreen />;
  }

  return (
    <div
      className={`min-h-screen bg-black text-white relative overflow-hidden ${className}`}
    >
      {/* メイン画面レイアウト */}
      <MonitorLayout data={data} />
    </div>
  );
}
