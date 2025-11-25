import { ArrowLeft, Monitor, Unplug, Save, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import SwitchLabel from "@/components/molecules/switch-label";
import { ShortcutBadge } from "@/components/atoms/shortcut-badge";
import { ConnectionStatus } from "@/components/organisms/connection-status";
import { ViewMode } from "@/store/use-monitor-store";

interface MonitorControlHeaderProps {
    isPublic: boolean;
    onTogglePublic: () => void;
    monitorStatusMode: "presentation" | "fallback" | "disconnected";
    isPresentationConnected: boolean;
    activeTournamentType: string | null | undefined;
    viewMode: ViewMode;
    isAllFinished: boolean;
    isSaving: boolean;
    onBackToDashboard: () => void;
    onMonitorAction: () => void;
    onSave: () => void;
    onConfirmMatch: () => void;
    onNextMatch: () => void;
    onShowTeamResult: () => void;
}

export function MonitorControlHeader({
    isPublic,
    onTogglePublic,
    monitorStatusMode,
    isPresentationConnected,
    activeTournamentType,
    viewMode,
    isAllFinished,
    isSaving,
    onBackToDashboard,
    onMonitorAction,
    onSave,
    onConfirmMatch,
    onNextMatch,
    onShowTeamResult,
}: MonitorControlHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={onBackToDashboard}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    戻る
                </Button>
                <div className="ml-2">
                    <ConnectionStatus mode={monitorStatusMode} error={null} />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <SwitchLabel
                        id="public-toggle-header"
                        checked={isPublic}
                        onChange={(v) => {
                            if (v !== isPublic) onTogglePublic();
                        }}
                        onLabel={"公開中"}
                        offLabel={"非公開"}
                        className="flex items-center gap-3"
                    />
                    <ShortcutBadge shortcut="PP" />
                </div>

                <div className="flex items-center gap-3">
                    {activeTournamentType === "team" && viewMode === "scoreboard" && (
                        <Button onClick={onConfirmMatch} variant="default" className="bg-blue-600 hover:bg-blue-700 gap-2">
                            試合確定
                            <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                    {activeTournamentType === "team" && viewMode === "match_result" && !isAllFinished && (
                        <Button onClick={onNextMatch} variant="default" className="bg-green-600 hover:bg-green-700 gap-2">
                            次の試合へ
                            <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                    {activeTournamentType === "team" && viewMode === "match_result" && isAllFinished && (
                        <Button onClick={onShowTeamResult} variant="default" className="bg-purple-600 hover:bg-purple-700 gap-2">
                            最終結果を表示
                            <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                    {activeTournamentType === "team" && viewMode === "team_result" && (
                        <Button onClick={onBackToDashboard} variant="outline">
                            一覧へ戻る
                        </Button>
                    )}
                    <Button onClick={onMonitorAction} variant={isPresentationConnected ? "destructive" : "outline"}>
                        {isPresentationConnected ? (
                            <>
                                <Unplug className="w-4 h-4 mr-2" />
                                接続を解除
                            </>
                        ) : (
                            <>
                                <Monitor className="w-4 h-4 mr-2" />
                                表示用モニターを開く
                            </>
                        )}
                    </Button>

                    {activeTournamentType !== "team" && (
                        <div className="flex items-center gap-2">
                            <Button onClick={onSave} size="sm" disabled={isSaving}>
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? "保存中..." : "保存"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
