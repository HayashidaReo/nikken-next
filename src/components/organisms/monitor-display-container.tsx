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

  const renderers = [
    {
      // 非公開時の表示
      condition: () => !data.isPublic,
      render: () => <StandbyScreen />,
    },
    {
      // 団体戦の結果表示
      condition: () =>
        data.viewMode === "match_result" &&
        !!data.groupMatches &&
        data.groupMatches.length > 0,
      render: () => (
        <MonitorGroupResults
          groupMatches={data.groupMatches!}
          currentMatchId={data.matchId}
          className="w-full h-full"
        />
      ),
    },
    {
      // 個人戦の結果表示
      condition: () =>
        data.viewMode === "match_result" && !!data.matchResult,
      render: () => (
        <MonitorIndividualMatchResult
          playerA={data.matchResult!.playerA}
          playerB={data.matchResult!.playerB}
          roundName={data.roundName}
          winner={data.matchResult!.winner}
          isCompleted={true}
          className="w-full h-full"
        />
      ),
    },
    {
      // 通常のスコアボード表示（デフォルト）
      condition: () => true,
      render: () => <MonitorLayout data={data} />,
    },
  ];

  const activeRenderer = renderers.find((r) => r.condition());

  return (
    <MonitorScaleLayout className={className}>
      {activeRenderer ? activeRenderer.render() : null}
    </MonitorScaleLayout>
  );
}
