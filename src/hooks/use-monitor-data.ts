import { useState, useEffect } from "react";
import { MONITOR_DISPLAY_CHANNEL } from "@/lib/constants/monitor";

// ローカルの型定義（monitor用）
interface PlayerData {
  displayName: string;
  teamName: string;
  score: number;
  hansoku: number;
}

interface MatchData {
  matchId: string;
  tournamentName: string;
  courtName: string;
  round: string;
  playerA: PlayerData;
  playerB: PlayerData;
  timeRemaining: number;
  isTimerRunning: boolean;
  isPublic: boolean;
}

interface TokenData {
  matchId: string;
  orgId: string;
  tournamentId: string;
}

export function useMonitorData(tokenData?: TokenData | null) {
  const [data, setData] = useState<MatchData>({
    matchId: "",
    tournamentName: "大会名未設定",
    courtName: "コート名未設定",
    round: "ラウンド未設定",
    playerA: {
      displayName: "選手A",
      teamName: "チーム名未設定",
      score: 0,
      hansoku: 0,
    },
    playerB: {
      displayName: "選手B",
      teamName: "チーム名未設定",
      score: 0,
      hansoku: 0,
    },
    timeRemaining: 300,
    isTimerRunning: false,
    isPublic: false,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // トークンデータが提供されている場合は、トークンベース認証モードとして動作する
  // このモードでは、通常の認証要件をスキップし、モニター表示を許可する
  useEffect(() => {
    if (!tokenData) return;

    // エフェクト内での同期的な状態更新を避けるため、更新を遅延させる
    // また、tokenDataが変更されたりアンマウントされた場合のクリーンアップも行う
    const t = setTimeout(() => {
      // トークンベースのアクセスとして接続済みとマーク
      setIsConnected(true);
    }, 0);

    return () => {
      clearTimeout(t);
    };
  }, [tokenData]);

  // BroadcastChannelでのデータ共有
  useEffect(() => {
    const channel = new BroadcastChannel(MONITOR_DISPLAY_CHANNEL);

    // メッセージ受信
    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.data && typeof event.data === "object") {
          // MatchDataの最低限の必須フィールドをチェック
          const hasRequiredFields =
            typeof event.data.tournamentName === "string" &&
            typeof event.data.matchId === "string";

          if (hasRequiredFields) {
            setData(event.data);
            setIsConnected(true);
          }
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
  useEffect(() => {
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

        // 受信側が準備できたら送信側にスナップショットを要求する
        try {
          // 一部の実装では receiver 側の send が存在する
          const maybeSender = conn as unknown as { send?: (m: string) => void };
          if (typeof maybeSender.send === "function") {
            maybeSender.send(JSON.stringify({ type: "request_snapshot" }));
          }
        } catch {
          // 無視
        }

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
        setTimeout(() => {
          setError("プレゼンテーションAPIが利用できません");
        }, 0);
      }
    }
  }, []);

  return {
    data,
    isConnected,
    error,
  };
}
