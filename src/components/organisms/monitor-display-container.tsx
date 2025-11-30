import { useMonitorData } from "@/hooks/use-monitor-data";
import { MonitorLayout } from "@/components/templates/monitor-layout";
import { StandbyScreen } from "@/components/templates/standby-screen";
import { useBuzzer } from "@/hooks/useBuzzer";
import { MonitorGroupResults } from "./monitor-group-results";
import { MonitorIndividualMatchResult } from "./monitor-individual-match-result";
import { MonitorScaleLayout } from "@/components/templates/monitor-scale-layout";

interface MonitorDisplayContainerProps {
  className?: string;
}

export function MonitorDisplayContainer({
  className = "",
}: MonitorDisplayContainerProps) {
  const { data } = useMonitorData();

  // タイマーが0になったらブザーを鳴らす（カウントダウンモードのみ）
  useBuzzer(data.timeRemaining, data.timerMode);

  const renderContent = () => {
    // 非公開時の表示
    if (!data.isPublic) {
      return <StandbyScreen />;
    }

    // モードによる分岐
    if (data.viewMode === "match_result") {
      // groupMatchesがある場合は団体戦の結果表示
      if (data.groupMatches && data.groupMatches.length > 0) {
        return (
          <MonitorGroupResults
            groupMatches={data.groupMatches}
            currentMatchId={data.matchId}
            className="w-full h-full"
          />
        );
      }

      // 個人戦の結果表示（matchResultがある場合）
      if (data.matchResult) {
        return (
          <MonitorIndividualMatchResult
            playerA={data.matchResult.playerA}
            playerB={data.matchResult.playerB}
            roundName={data.roundName}
            winner={data.matchResult.winner}
            isCompleted={true}
            className="w-full h-full"
          />
        );
      }
    }

    // 通常のスコアボード表示
    return <MonitorLayout data={data} />;
  };

  return (
    <MonitorScaleLayout className={className}>
      {renderContent()}
    </MonitorScaleLayout>
  );
}
