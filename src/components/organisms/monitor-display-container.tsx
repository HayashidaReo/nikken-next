import { useEffect, useState } from "react";
import { useMonitorData } from "@/hooks/use-monitor-data";
import { MonitorLayout } from "@/components/templates/monitor-layout";
import { StandbyScreen } from "@/components/templates/standby-screen";
import { MONITOR_CONSTANTS } from "@/lib/constants";
import { useBuzzer } from "@/hooks/useBuzzer";
import { MonitorGroupResults } from "./monitor-group-results";
import { MonitorIndividualMatchResult } from "./monitor-individual-match-result";

interface MonitorDisplayContainerProps {
  className?: string;
}

export function MonitorDisplayContainer({
  className = "",
}: MonitorDisplayContainerProps) {
  const { data } = useMonitorData();
  const [scale, setScale] = useState(1);

  // タイマーが0になったらブザーを鳴らす（カウントダウンモードのみ）
  useBuzzer(data.timeRemaining, data.timerMode);

  useEffect(() => {
    const handleResize = () => {
      const BASE_WIDTH = MONITOR_CONSTANTS.BASE_WIDTH;
      const BASE_HEIGHT = MONITOR_CONSTANTS.BASE_HEIGHT;

      const scaleX = window.innerWidth / BASE_WIDTH;
      const scaleY = window.innerHeight / BASE_HEIGHT;

      // 画面に収まるように小さい方の倍率を採用（contain）
      setScale(Math.min(scaleX, scaleY));
    };

    // 初期化とイベントリスナー設定
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 非公開時の表示
  if (!data.isPublic) {
    return (
      <div
        className={`w-screen h-screen bg-black text-white relative overflow-hidden flex items-center justify-center ${className}`}
      >
        <div
          style={{
            width: MONITOR_CONSTANTS.BASE_WIDTH,
            height: MONITOR_CONSTANTS.BASE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "center",
          }}
          className="bg-black flex-shrink-0"
        >
          <StandbyScreen />
        </div>
      </div>
    );
  }

  // モードによる分岐
  if (data.viewMode === "match_result") {
    // groupMatchesがある場合は団体戦の結果表示
    if (data.groupMatches && data.groupMatches.length > 0) {
      return (
        <div
          className={`w-screen h-screen bg-black text-white relative overflow-hidden flex items-center justify-center ${className}`}
        >
          <div
            style={{
              width: MONITOR_CONSTANTS.BASE_WIDTH,
              height: MONITOR_CONSTANTS.BASE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "center",
            }}
            className="bg-black flex-shrink-0 flex items-center justify-center"
          >
            <MonitorGroupResults
              groupMatches={data.groupMatches}
              currentMatchId={data.matchId}
              className="w-full h-full"
            />
          </div>
        </div>
      );
    }

    // 個人戦の結果表示（matchResultがある場合）
    if (data.matchResult) {
      return (
        <div
          className={`w-screen h-screen bg-black text-white relative overflow-hidden flex items-center justify-center ${className}`}
        >
          <div
            style={{
              width: MONITOR_CONSTANTS.BASE_WIDTH,
              height: MONITOR_CONSTANTS.BASE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "center",
            }}
            className="bg-black flex-shrink-0 flex items-center justify-center"
          >
            <MonitorIndividualMatchResult
              playerA={data.matchResult.playerA}
              playerB={data.matchResult.playerB}
              roundName={data.roundName}
              winner={data.matchResult.winner}
              isCompleted={true}
              className="w-full h-full"
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div
      className={`w-screen h-screen bg-black text-white relative overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* 基準解像度 BASE_WIDTH×BASE_HEIGHT でレイアウトし、画面サイズに合わせてスケールする */}
      <div
        style={{
          width: MONITOR_CONSTANTS.BASE_WIDTH,
          height: MONITOR_CONSTANTS.BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
        className="bg-black flex-shrink-0"
      >
        <MonitorLayout data={data} />
      </div>
    </div>
  );
}
