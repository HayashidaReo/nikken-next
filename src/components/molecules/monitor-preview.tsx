"use client";


import { useMonitorStore } from "@/store/use-monitor-store";
import { MonitorLayout } from "@/components/templates/monitor-layout";
import { StandbyScreen } from "@/components/templates/standby-screen";
import { MONITOR_CONSTANTS } from "@/lib/constants";
import { MonitorGroupResults } from "@/components/organisms/monitor-group-results";
import { cn } from "@/lib/utils/utils";

interface MonitorPreviewProps {
    width?: number;
    className?: string;
    monitorStatusMode: "presentation" | "fallback" | "disconnected";
}

export function MonitorPreview({
    width = 220,
    className = "",
    monitorStatusMode,
}: MonitorPreviewProps) {
    const data = useMonitorStore();

    // スケールを計算（レンダリング時に直接計算してちらつきを防ぐ）
    const scale = width / MONITOR_CONSTANTS.BASE_WIDTH;
    const height = width * (MONITOR_CONSTANTS.BASE_HEIGHT / MONITOR_CONSTANTS.BASE_WIDTH);

    // 未接続の場合
    if (monitorStatusMode === "disconnected") {
        return (
            <div
                className={cn(
                    "bg-gray-100 overflow-hidden relative rounded-lg flex items-center justify-center",
                    className
                )}
                style={{
                    width,
                    height,
                }}
            >
                <div className="text-gray-400 text-sm font-medium">未接続</div>
            </div>
        );
    }

    if (!data.matchId) return null;

    // スナップショットを取得（型安全）
    const monitorData = data.getMonitorSnapshot();

    // コンテンツのレンダリング
    const renderContent = () => {
        if (!data.isPublic) {
            return <StandbyScreen />;
        }

        if (data.viewMode === "match_result") {
            // groupMatchesがない場合は空配列（個人戦などはこのビューを使用しない前提）
            const displayMatches = monitorData.groupMatches || [];

            return (
                <div className="w-full h-full flex items-center justify-center">
                    <MonitorGroupResults
                        groupMatches={displayMatches}
                        currentMatchId={monitorData.matchId}
                        className="w-full h-full"
                    />
                </div>
            );
        }

        return <MonitorLayout data={monitorData} />;
    };

    return (
        <div
            className={cn(
                "bg-black overflow-hidden relative rounded-lg",
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
                className="bg-black text-white overflow-hidden" // overflow-hiddenを追加してはみ出し防止
            >
                {renderContent()}
            </div>
        </div>
    );
}
