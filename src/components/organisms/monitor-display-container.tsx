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
      {/* モニター表示は常に中央で 16:9 比率を保ち、画面比率が異なる場合は余白を黒で埋める */}
      <div className="w-full h-full flex items-center justify-center">
        <div
          // `min()` を使って画面幅/高さに合わせて最大化しつつ 16:9 を維持
          style={{
            width: "min(100vw, calc(16 / 9 * 100vh))",
            height: "min(100vh, calc(9 / 16 * 100vw))",
          }}
          className="bg-black w-auto h-auto"
        >
          {/* MonitorLayout は親のサイズに合わせて伸縮 */}
          <div className="w-full h-full">
            <MonitorLayout data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
