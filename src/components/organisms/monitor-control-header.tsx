import { ArrowLeft, Monitor, Unplug, ChevronRight, Trophy, MapPin, Repeat } from "lucide-react";
import { Button } from "@/components/atoms/button";
import SwitchLabel from "@/components/molecules/switch-label";
import { ShortcutBadge } from "@/components/atoms/shortcut-badge";
import { MonitorPreview } from "@/components/molecules/monitor-preview";
import type { MonitorControlHeaderProps } from "@/types/monitor.schema";
import { MONITOR_VIEW_MODES, TOURNAMENT_TYPES } from "@/lib/constants";

/**
 * モニター操作画面のヘッダーコンポーネント
 * 
 * @description
 * このコンポーネントは、モニター操作画面の上部に表示されるヘッダーUIを提供します。
 * 試合の進行状態や大会種別に応じて、適切な操作ボタンを動的に表示します。
 * 
 * **主な機能:**
 * - ダッシュボードへの戻るボタン
 * - モニター接続状態の表示
 * - 公開/非公開の切り替えスイッチ
 * - 試合進行ボタン（団体戦の場合）
 * - モニター接続/切断ボタン
 * - 保存ボタン（個人戦の場合）
 * 
 * **表示される操作ボタン（団体戦の場合）:**
 * - スコアボード表示中: 「試合確定」ボタン
 * - 試合結果表示中（未完了）: 「次の試合へ」ボタン
 * - 試合結果表示中（全完了）: 「最終結果を表示」ボタン
 * - 団体戦結果表示中: 「一覧へ戻る」ボタン
 * 
 * **キーボードショートカット:**
 * - `PP`: 公開/非公開の切り替え
 * - `Enter`: 現在の状態に応じた主要アクション
 * 
 * @param props - コンポーネントのプロパティ（型定義は monitor.schema.ts を参照）
 */


export function MonitorControlHeader({
    monitorState,
    matchState,
    matchInfo,
    actions,
}: MonitorControlHeaderProps) {
    const { isPublic, monitorStatusMode, isPresentationConnected } = monitorState;
    const { activeTournamentType, viewMode, isAllFinished } = matchState;
    const {
        onTogglePublic,
        onBackToDashboard,
        onMonitorAction,
        onConfirmMatch,
        onNextMatch,
    } = actions;

    const renderActionButton = () => {
        // スコアボード表示中: 試合確定ボタン
        if (viewMode === MONITOR_VIEW_MODES.SCOREBOARD) {
            return (
                <Button onClick={onConfirmMatch} variant="default" className="bg-blue-600 hover:bg-blue-700 gap-2">
                    試合確定
                    <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />
                    <ChevronRight className="w-4 h-4" />
                </Button>
            );
        }

        // 試合結果表示中 または 初期表示中
        if (viewMode === MONITOR_VIEW_MODES.MATCH_RESULT || viewMode === MONITOR_VIEW_MODES.INITIAL) {
            // 初期表示の場合は常に得点板へボタンを表示
            if (viewMode === MONITOR_VIEW_MODES.INITIAL && actions.onStartMatch) {
                return (
                    <Button onClick={actions.onStartMatch} variant="default" className="bg-purple-600 hover:bg-purple-700 gap-2">
                        得点板へ
                        <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                );
            }

            // 団体戦かつ未完了
            if (activeTournamentType === TOURNAMENT_TYPES.TEAM && !isAllFinished) {
                // 現在の試合が未完了の場合: 得点板へボタン
                if (matchState.isCurrentMatchCompleted === false && actions.onStartMatch) {
                    return (
                        <Button onClick={actions.onStartMatch} variant="default" className="bg-purple-600 hover:bg-purple-700 gap-2">
                            得点板へ
                            <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    );
                }

                // 現在の試合が完了済みの場合: 次の試合へ
                return (
                    <Button onClick={onNextMatch} variant="default" className="bg-green-600 hover:bg-green-700 gap-2">
                        次の試合へ
                        <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                );
            }

            // それ以外（個人戦、または団体戦完了）: 一覧へ戻る
            return (
                <Button onClick={onBackToDashboard} variant="default" className="bg-purple-600 hover:bg-purple-700 gap-2">
                    一覧へ戻る
                    <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />
                    <ChevronRight className="w-4 h-4" />
                </Button>
            );
        }

        return null;
    };

    return (
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
            <div className="flex items-start justify-start gap-4">
                <Button variant="outline" onClick={onBackToDashboard}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    戻る
                </Button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">モニター操作画面</h1>
                    {matchInfo && (
                        <div className="mt-1.5 flex flex-col gap-1">
                            <div className="flex items-center text-base font-medium text-gray-700">
                                <Trophy className="w-4 h-4 mr-2 text-yellow-600/80" />
                                {matchInfo.tournamentName}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 pl-0.5">
                                <div className="flex items-center hover:text-gray-700 transition-colors">
                                    <MapPin className="w-4 h-4 mr-1.5 text-blue-500/70" />
                                    {matchInfo.courtName}
                                </div>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center hover:text-gray-700 transition-colors">
                                    <Repeat className="w-4 h-4 mr-1.5 text-green-500/70" />
                                    {matchInfo.roundName}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* モニタープレビュー */}
            <div className="flex justify-center">
                <MonitorPreview width={200} monitorStatusMode={monitorStatusMode} />
            </div>

            <div className="flex items-center justify-end gap-4">
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
                    {renderActionButton()}

                    <Button onClick={onMonitorAction} variant={isPresentationConnected ? "destructive" : "outline"}>
                        {isPresentationConnected ? (
                            <>
                                <Unplug className="w-4 h-4 mr-2" />
                                接続を解除
                            </>
                        ) : (
                            <>
                                <Monitor className="w-4 h-4 mr-2" />
                                表示用モニターに接続
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
