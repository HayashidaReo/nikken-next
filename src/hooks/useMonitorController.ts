import { useState } from "react";
import { usePresentation } from "@/hooks/usePresentation";
import { useGetPresentationToken } from "@/queries/use-presentation";
import { useFallbackMonitor } from "@/hooks/useFallbackMonitor";
import { useToast } from "@/components/providers/notification-provider";
import { MONITOR_DISPLAY_PATH } from "@/lib/constants/monitor";

interface UseMonitorControllerProps {
    matchId: string;
    orgId: string;
    tournamentId: string;
}

export function useMonitorController({
    matchId,
    orgId,
    tournamentId,
}: UseMonitorControllerProps) {
    const [showFallbackDialog, setShowFallbackDialog] = useState(false);
    const { showSuccess, showError, showInfo } = useToast();
    const getPresentationToken = useGetPresentationToken();

    const {
        isSupported: isPresentationSupported,
        isAvailable: isPresentationAvailable,
        isConnected: isPresentationConnected,
        stopPresentation,
        startPresentation,
    } = usePresentation(`${window.location.origin}${MONITOR_DISPLAY_PATH}`);

    const { openFallbackWindow } = useFallbackMonitor({
        matchId,
        orgId,
        tournamentId,
    });

    const handleMonitorAction = async () => {
        try {
            if (isPresentationConnected) {
                await stopPresentation();
                showInfo("プレゼンテーション接続を停止しました");
                return;
            }

            // まず、プレゼンテーション用トークンを取得する
            const token = await getPresentationToken.mutateAsync({
                matchId,
                orgId,
                tournamentId,
            });
            const monitorUrl = `${window.location.origin}${MONITOR_DISPLAY_PATH}?pt=${encodeURIComponent(token)}`;

            if (isPresentationSupported && isPresentationAvailable && startPresentation) {
                try {
                    // registerGlobal=true でストアに接続を保存する
                    await startPresentation(monitorUrl, true);
                    showSuccess("モニター表示を開始しました");
                    return;
                } catch (err: unknown) {
                    console.error(err);

                    // ユーザーがネイティブのプレゼン選択ダイアログを閉じた（キャンセルした）場合は
                    // フォールバックの確認ダイアログを出さず静かに処理を終了する。
                    // Presentation API の例外はブラウザや実装によって異なるため、
                    // エラー名やメッセージを幅広く判定する。
                    const name = typeof err === "object" && err && "name" in err ? (err as Error).name : "";
                    const message = typeof err === "object" && err && "message" in err ? (err as Error).message : String(err ?? "");
                    const isUserCancelled =
                        name === "NotAllowedError" || name === "AbortError" || /Dialog closed/i.test(message);

                    if (isUserCancelled) {
                        showInfo("プレゼンテーションの選択がキャンセルされました");
                        return;
                    }

                    // それ以外のエラーは通知してフォールバック（下の setShowFallbackDialog）へ進む
                    showError(`Presentation API の開始に失敗しました: ${message}`);
                }
            }

            // Presentation API が利用できないか start に失敗した場合はフォールバックダイアログを表示
            setShowFallbackDialog(true);
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
