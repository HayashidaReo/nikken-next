import { useEffect, useCallback } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useToast } from "@/components/providers/notification-provider";
import { useMonitorSender } from "@/hooks/useMonitorSender";
import {
    MONITOR_DISPLAY_CHANNEL,
    MONITOR_DISPLAY_PATH,
    HEARTBEAT_INTERVAL_MS,
    HEARTBEAT_TIMEOUT_MS,
    TIMEOUT_CHECK_INTERVAL_MS,
} from "@/lib/constants/monitor";

/**
 * フォールバックモニター（別タブ表示）の制御を行うフック
 * BroadcastChannelを使用した通信、ハートビート、接続状態の管理を行います。
 */
export function useFallbackMonitor() {
    const { showInfo, showError } = useToast();
    const { sendMessage } = useMonitorSender();

    const fallbackOpen = useMonitorStore((s) => s.fallbackOpen);
    const presentationConnected = useMonitorStore((s) => s.presentationConnected);
    const setFallbackOpen = useMonitorStore((s) => s.setFallbackOpen);

    /**
     * フォールバックウィンドウ（別タブ）を開く
     */
    const openFallbackWindow = useCallback(async () => {
        try {
            const url = `${window.location.origin}${MONITOR_DISPLAY_PATH}`;
            // popup=yes でアドレスバーなどを隠す
            window.open(url, "_blank", "width=1920,height=1080,popup=yes,toolbar=no,menubar=no,location=no,status=no");

            // フォールバックで別タブを開いたことをストアに反映
            try {
                setFallbackOpen(true);
            } catch (err) {
                console.warn("ストアの fallbackOpen 設定に失敗しました:", err);
            }

            // 初回スナップショットを送信（存在チェックを行う）
            try {
                const monitorData = useMonitorStore.getState().getMonitorSnapshot();
                sendMessage("snapshot", monitorData);
            } catch (err) {
                console.warn("ブロードキャストチャネルへの送信に失敗しました:", err);
                showInfo("共有チャネルへの送信に失敗しましたが、別タブを開きました。");
            }

            showInfo("新しいタブでモニター表示を開始しました。データは自動的に同期されます。");
        } catch (err) {
            console.error("フォールバックウィンドウを開くのに失敗しました:", err);
            showError("モニター表示の開始に失敗しました。もう一度お試しください。");
        }
    }, [setFallbackOpen, showInfo, showError, sendMessage]);

    /**
     * ページロード時や再接続時に既存のモニタータブ（BroadcastChannel）を探す
     * pingを送信し、pong/heartbeat_response/ackを受信したら接続済みとみなす
     */
    useEffect(() => {
        // 既に接続済みとみなされている場合はスキップ
        if (fallbackOpen || presentationConnected) return;

        const channel = new BroadcastChannel(MONITOR_DISPLAY_CHANNEL);

        const handleResponse = (event: MessageEvent) => {
            if (event.data?.type === "ack") {
                // 応答があればモニターが開いているとみなす
                setFallbackOpen(true);
            }
        };

        channel.addEventListener("message", handleResponse);

        // pingを送信
        sendMessage("ping", { timestamp: Date.now() });

        return () => {
            channel.removeEventListener("message", handleResponse);
            channel.close();
        };
    }, [fallbackOpen, presentationConnected, setFallbackOpen, sendMessage]);

    /**
     * フォールバック表示（別タブ）へのハートビート送信と応答検知
     * 接続中は定期的にハートビートを送信し、応答がなければ切断とみなす
     */
    useEffect(() => {
        if (!fallbackOpen) return;

        const channel = new BroadcastChannel(MONITOR_DISPLAY_CHANNEL);
        let lastResponseTime = Date.now();

        // ハートビート送信
        const heartbeatInterval = setInterval(() => {
            try {
                const monitorData = useMonitorStore.getState().getMonitorSnapshot();
                sendMessage("heartbeat", monitorData);
            } catch (e) {
                console.error("ハートビートの送信に失敗しました:", e);
            }
        }, HEARTBEAT_INTERVAL_MS);

        // ハートビート応答のリスナー
        const handleResponse = (event: MessageEvent) => {
            if (event.data?.type === "ack") {
                lastResponseTime = Date.now();
            }
        };
        channel.addEventListener("message", handleResponse);

        // タイムアウト検知
        const timeoutCheckInterval = setInterval(() => {
            const timeSinceLastResponse = Date.now() - lastResponseTime;
            if (timeSinceLastResponse > HEARTBEAT_TIMEOUT_MS) {
                // 応答がない場合、切断されたとみなす
                setFallbackOpen(false);
            }
        }, TIMEOUT_CHECK_INTERVAL_MS);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(timeoutCheckInterval);
            channel.removeEventListener("message", handleResponse);
            channel.close();
        };
    }, [fallbackOpen, setFallbackOpen, sendMessage]);

    return {
        openFallbackWindow,
    };
}
