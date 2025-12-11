import { useState } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useFallbackMonitor } from "@/hooks/useFallbackMonitor";
import { useToast } from "@/components/providers/notification-provider";


export function useMonitorController() {
    const [showFallbackDialog, setShowFallbackDialog] = useState(false);
    const { showError, showInfo } = useToast();
    const { fallbackOpen } = useMonitorStore();

    const { openFallbackWindow } = useFallbackMonitor();

    const isPresentationConnected = fallbackOpen;

    const handleMonitorAction = async () => {
        try {
            if (isPresentationConnected) {
                // 接続解除（ウィンドウを閉じる機能はブラウザの制約で難しいため、ストアの状態を更新してユーザーに通知）
                // ※実際にはウィンドウを閉じるわけではないが、接続状態をリセットする
                useMonitorStore.getState().setFallbackOpen(false);
                showInfo("モニター接続を解除しました");
                return;
            }

            // 強制的にフォールバックウィンドウを開く
            openFallbackWindow();
        } catch (err) {
            console.error(err);
            showError("モニター表示の開始に失敗しました。もう一度お試しください。");
        }
    };

    const handleFallbackConfirm = () => {
        setShowFallbackDialog(false);
        // 非同期処理は関数呼び出しで開始（UIスレッドをブロックしない）
        openFallbackWindow();
    };

    const handleFallbackCancel = () => {
        setShowFallbackDialog(false);
    };

    return {
        isPresentationConnected,
        handleMonitorAction,
        showFallbackDialog,
        handleFallbackConfirm,
        handleFallbackCancel,
    };
}
