"use client";

import { useEffect, useState } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { MonitorLayout } from "@/components/templates/monitor-layout";
import { StandbyScreen } from "@/components/templates/standby-screen";
import { MONITOR_CONSTANTS } from "@/lib/constants";
import { MatchResultView } from "@/components/organisms/match-result-view";
import { TeamResultView } from "@/components/organisms/team-result-view";
import { cn } from "@/lib/utils/utils";

interface MonitorPreviewProps {
    width?: number;
    className?: string;
}

export function MonitorPreview({
    width = 220,
    className = "",
}: MonitorPreviewProps) {
    const data = useMonitorStore();
    const [scale, setScale] = useState(1);
    const height = width * (MONITOR_CONSTANTS.BASE_HEIGHT / MONITOR_CONSTANTS.BASE_WIDTH);

    useEffect(() => {
        // 基準幅に対するスケールを計算
        setScale(width / MONITOR_CONSTANTS.BASE_WIDTH);
    }, [width]);

    if (!data.matchId) return null;

    // 型キャスト (matchIdチェック済みのため安全)
    const monitorData = data as unknown as import("@/types/monitor.schema").MonitorData;

    // コンテンツのレンダリング
    const renderContent = () => {
        if (!data.isPublic) {
            return <StandbyScreen />;
        }

        if (data.viewMode === "match_result") {
            return <MatchResultView data={monitorData} />;
        }

        if (data.viewMode === "team_result") {
            return <TeamResultView data={monitorData} />;
        }

        return <MonitorLayout data={monitorData} />;
    };

    return (
        <div
            className={cn(
                "bg-black overflow-hidden relative border-2 border-gray-800 rounded-lg shadow-lg",
                className
            )}
            style={{
                width,
                height,
            }}
        >
            <div
                style={{
                    width: MONITOR_CONSTANTS.BASE_WIDTH,
                    height: MONITOR_CONSTANTS.BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
                className="bg-black text-white"
            >
                {renderContent()}
            </div>
        </div>
    );
}
