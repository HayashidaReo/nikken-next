"use client";

import { ArrowLeft, Monitor, Unplug } from "lucide-react";
import { Button } from "@/components/atoms/button";
import SwitchLabel from "@/components/molecules/switch-label";
import { ShortcutBadge } from "@/components/atoms/shortcut-badge";
import { MonitorPreview } from "@/components/molecules/monitor-preview";
import type { MonitorControlHeaderProps } from "@/types/monitor.schema";

/**
 * 手動モニター操作画面のヘッダーコンポーネント
 * 
 * @description
 * 手動モード用の簡略化されたヘッダーUIを提供します。
 * 試合進行ボタンや保存ボタンを除外し、モニター接続と公開設定のみを表示します。
 */
export function ManualMonitorControlHeader({
    monitorState,
    actions,
}: Pick<MonitorControlHeaderProps, "monitorState" | "actions">) {
    const { isPublic, monitorStatusMode, isPresentationConnected } = monitorState;
    const {
        onTogglePublic,
        onBackToDashboard,
        onMonitorAction,
    } = actions;

    return (
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
            <div className="flex items-center justify-start gap-4">
                <Button variant="outline" onClick={onBackToDashboard}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    戻る
                </Button>
                <h1 className="text-xl font-bold text-gray-900">手動モニター操作</h1>
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
