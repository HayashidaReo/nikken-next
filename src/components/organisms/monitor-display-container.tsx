import { useMonitorData } from "@/hooks/use-monitor-data";
import { ConnectionStatus } from "@/components/organisms/connection-status";
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
  const { data, isConnected, error } = useMonitorData(tokenData);

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
      <MonitorLayout data={data} />
    </div>
  );
}
