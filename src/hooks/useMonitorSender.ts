import { useCallback, useEffect, useRef } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { MONITOR_DISPLAY_CHANNEL } from "@/lib/constants/monitor";

/**
 * モニターへのデータ送信を行うフック
 * Presentation API と BroadcastChannel の両方に対応
 */
export function useMonitorSender() {
    const isPresentationConnected = useMonitorStore((s) => s.presentationConnected);
    const presentationConnection = useMonitorStore((s) => s.presentationConnection);

    // データ共有用のBroadcastChannel
    const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        // BroadcastChannelの初期化
        broadcastChannelRef.current = new BroadcastChannel(MONITOR_DISPLAY_CHANNEL);

        return () => {
            broadcastChannelRef.current?.close();
        };
    }, []);

    // 汎用的なメッセージ送信関数
    const sendMessage = useCallback(
        (type: string, payload?: unknown) => {
            // Presentation APIで送信
            if (isPresentationConnected && presentationConnection && presentationConnection.state === "connected") {
                try {
                    // Presentation API は文字列しか送れないため、typeを含めたオブジェクトにする
                    // 受信側(useMonitorData)は { type, payload } の形式を期待
                    // Presentation APIの受信側は JSON.parse(msgEvent.data) している。
                    // そこで、JSON文字列化して送る。
                    presentationConnection.send(JSON.stringify({ type, payload }));
                } catch (err) {
                    console.error("メッセージ送信に失敗:", err);
                }
            }

            // BroadcastChannelで送信
            try {
                broadcastChannelRef.current?.postMessage({
                    type,
                    payload,
                });
            } catch (err) {
                console.warn("BroadcastChannel送信エラー:", err);
            }
        },
        [isPresentationConnected, presentationConnection]
    );

    return { sendMessage };
}
