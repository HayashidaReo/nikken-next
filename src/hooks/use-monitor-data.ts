import * as React from "react";
import { type MatchData } from "@/types/common";

export function useMonitorData() {
    const [data, setData] = React.useState<MatchData>({
        matchId: "",
        tournamentName: "大会名未設定",
        courtName: "コート名未設定",
        round: "回戦未設定",
        playerA: { displayName: "選手A", teamName: "チーム名未設定", score: 0, hansoku: 0 },
        playerB: { displayName: "選手B", teamName: "チーム名未設定", score: 0, hansoku: 0 },
        timeRemaining: 300,
        isTimerRunning: false,
        isPublic: false,
    });

    const [isConnected, setIsConnected] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // BroadcastChannelでのデータ共有
    React.useEffect(() => {
        const channel = new BroadcastChannel("monitor-display-channel");

        // メッセージ受信
        const handleMessage = (event: MessageEvent) => {
            try {
                if (event.data && typeof event.data === "object") {
                    setData(event.data);
                    setIsConnected(true);
                }
            } catch (err) {
                console.error("BroadcastChannel メッセージ解析エラー:", err);
            }
        };

        channel.addEventListener("message", handleMessage);

        return () => {
            channel.removeEventListener("message", handleMessage);
            channel.close();
        };
    }, []);

    // Presentation API接続の確立
    React.useEffect(() => {
        // 表示側（receiver）としての処理
        if ("presentation" in navigator) {
            // メッセージ接続の処理
            const handleConnection = (connection: unknown) => {
                const conn = connection as {
                    addEventListener: (
                        event: string,
                        handler: (e: Event) => void
                    ) => void;
                    close: () => void;
                    terminate: () => void;
                };

                setIsConnected(true);

                // メッセージ受信リスナー
                conn.addEventListener("message", (messageEvent: Event) => {
                    const msgEvent = messageEvent as MessageEvent;
                    try {
                        const receivedData = JSON.parse(msgEvent.data);
                        setData(receivedData);
                    } catch (err) {
                        console.error("メッセージ解析エラー:", err);
                        setError("データの解析に失敗しました");
                    }
                });

                // 接続終了リスナー
                conn.addEventListener("close", () => {
                    setIsConnected(false);
                });

                conn.addEventListener("terminate", () => {
                    setIsConnected(false);
                });
            };

            // 簡素化されたPresentationReceiver処理
            try {
                // 動的にPresentation APIにアクセス
                const presentation = (navigator as unknown as Record<string, unknown>)
                    .presentation as {
                        receiver?: {
                            connectionList?: Promise<{
                                connections?: unknown[];
                                addEventListener?: (
                                    event: string,
                                    handler: EventListener
                                ) => void;
                            }>;
                        };
                    };

                if (presentation?.receiver?.connectionList) {
                    presentation.receiver.connectionList
                        .then(list => {
                            // 既存の接続があれば処理
                            list.connections?.forEach(connection => {
                                handleConnection(connection);
                            });

                            // 新しい接続を待機
                            list.addEventListener?.("connectionavailable", (event: Event) => {
                                const connectionEvent = event as {
                                    detail?: { connection: unknown };
                                    connection?: unknown;
                                };
                                const connection =
                                    connectionEvent.detail?.connection ||
                                    connectionEvent.connection;
                                if (connection) {
                                    handleConnection(connection);
                                }
                            });
                        })
                        .catch((error: unknown) => {
                            console.warn(
                                "PresentationReceiver initialization failed:",
                                error
                            );
                            setError("プレゼンテーション接続の初期化に失敗しました");
                        });
                }
            } catch (error) {
                console.warn("Presentation API not available or failed:", error);
                setError("プレゼンテーションAPIが利用できません");
            }
        }

        // フォールバック: URLパラメータからの初期データ読み込み
        const urlParams = new URLSearchParams(window.location.search);
        const initialData = urlParams.get("data");
        if (initialData) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(initialData));
                setData(parsedData);
            } catch (err) {
                console.error("URLパラメータ解析エラー:", err);
            }
        }
    }, []);

    return {
        data,
        isConnected,
        error
    };
}