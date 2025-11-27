"use client";

import { useRouter } from "next/navigation";
import { ScoreboardOperator } from "@/components/organisms/scoreboard-operator";
import { useMonitorController } from "@/hooks/useMonitorController";
import { useMonitorStore } from "@/store/use-monitor-store";
import { ManualMonitorControlHeader } from "@/components/organisms/manual-monitor-control-header";
import { FallbackMonitorDialog } from "@/components/molecules";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useMonitorPageUi } from "@/hooks/useMonitorPageUi";
import { useManualMonitorState } from "@/hooks/useManualMonitorState";

export default function ManualMonitorControlPage() {
    const router = useRouter();

    const {
        initializeMatch,
        isPublic,
        togglePublic,
    } = useMonitorStore();

    // モニター制御ロジック
    const {
        isPresentationConnected,
        handleMonitorAction,
        showFallbackDialog,
        handleFallbackConfirm,
        handleFallbackCancel,
    } = useMonitorController();

    // UI状態ロジック（一部再利用）
    const {
        showDisconnectConfirm,
        setShowDisconnectConfirm,
        handleMonitorClick,
        handleDisconnectConfirm,
        monitorStatusMode,
    } = useMonitorPageUi({
        handleMonitorAction,
        isPresentationConnected,
        teamMatches: [], // 手動モードでは不要
        teams: [], // 手動モードでは不要
    });

    // 初期化・復元・同期・保存を一括管理
    useManualMonitorState(() => {
        initializeMatch(
            {
                matchId: "manual-match",
                courtId: "manual-court",
                roundId: "manual-round",
                sortOrder: 1,
                players: {
                    playerA: {
                        playerId: "player-a",
                        teamId: "team-a",
                        score: 0,
                        hansoku: 0,
                    },
                    playerB: {
                        playerId: "player-b",
                        teamId: "team-b",
                        score: 0,
                        hansoku: 0,
                    },
                },
                isCompleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            "", // 大会名なし
            "", // コート名なし
            {
                resolvedPlayers: {
                    playerA: {
                        playerId: "player-a",
                        teamId: "team-a",
                        displayName: "",
                        teamName: "",
                        score: 0,
                        hansoku: 0,
                    },
                    playerB: {
                        playerId: "player-b",
                        teamId: "team-b",
                        displayName: "",
                        teamName: "",
                        score: 0,
                        hansoku: 0,
                    },
                },
                roundName: "",
            }
        );
    });

    const handleBackToDashboard = () => {
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <ManualMonitorControlHeader
                    monitorState={{
                        isPublic,
                        monitorStatusMode,
                        isPresentationConnected,
                    }}
                    actions={{
                        onTogglePublic: togglePublic,
                        onBackToDashboard: handleBackToDashboard,
                        onMonitorAction: handleMonitorClick,
                    }}
                />

                <ScoreboardOperator
                    organizationId=""
                    tournamentId=""
                    defaultMatchTime={180}
                    isManual={true}
                />

                <FallbackMonitorDialog
                    isOpen={showFallbackDialog}
                    onConfirm={handleFallbackConfirm}
                    onCancel={handleFallbackCancel}
                />
                <ConfirmDialog
                    isOpen={showDisconnectConfirm}
                    title="モニター接続の解除"
                    message="表示用モニターとの接続を解除しますか？"
                    onConfirm={handleDisconnectConfirm}
                    onCancel={() => setShowDisconnectConfirm(false)}
                    confirmText="解除する"
                    cancelText="キャンセル"
                    variant="destructive"
                />
            </div>
        </div>
    );
}
