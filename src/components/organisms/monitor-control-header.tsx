import { ArrowLeft, Monitor, Unplug, Save, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import SwitchLabel from "@/components/molecules/switch-label";
import { ShortcutBadge } from "@/components/atoms/shortcut-badge";
import { MonitorPreview } from "@/components/molecules/monitor-preview";
import type { MonitorControlHeaderProps } from "@/types/monitor.schema";

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
 * @param props - コンポーネントのプロパティ
 * 
 * @see {@link ViewMode} - 表示モードの型定義
 * @see {@link MonitorControlHeaderProps} - プロパティの型定義
 * @see {@link MonitorStateProps} - モニター状態のプロパティ型
 * @see {@link MatchStateProps} - 試合状態のプロパティ型
 * @see {@link MonitorActions} - アクション関数の型定義
 */

export function MonitorControlHeader({

    monitorState,
    matchState,
    actions,
}: MonitorControlHeaderProps) {
    const { isPublic, monitorStatusMode, isPresentationConnected } = monitorState;
    const { activeTournamentType, viewMode, isAllFinished, isSaving } = matchState;
    const {
        onTogglePublic,
        onBackToDashboard,
        onMonitorAction,
        onSave,
        onConfirmMatch,
        onNextMatch,
        onShowTeamResult,
    } = actions;
    return (
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
            <div className="flex items-center justify-start gap-4">
                <Button variant="outline" onClick={onBackToDashboard}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    戻る
                </Button>
                <h1 className="text-xl font-bold text-gray-900">モニター操作画面</h1>
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
                                表示用モニターに接続
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
