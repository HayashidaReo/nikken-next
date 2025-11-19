import { useState, useEffect, useRef } from "react";
import {
  MONITOR_DISPLAY_CHANNEL,
  HEARTBEAT_TIMEOUT_MS,
} from "@/lib/constants/monitor";
import type { MonitorData } from "@/types/monitor.schema";

interface TokenData {
  matchId: string;
  orgId: string;
  tournamentId: string;
}

export function useMonitorData(tokenData?: TokenData | null) {
  const [data, setData] = useState<MonitorData>({
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
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // トークンデータが提供されている場合は、トークンベース認証モードとして動作する
  // このモードでは、通常のユーザ認証フロー（ログインや権限チェック）をスキップし、
  // 受け取ったトークンに基づいて限定的にモニター表示を許可する動作を行う。
  // ここでは表示側（受信側）が即時に「接続済み」と見なされることで、
  // - 認証ダイアログやリダイレクトなどの副作用を起こさずにUIを描画できる
  // - プレゼンテーションやBroadcastChannel経由のメッセージ受信待ちに移行できる
  // という利点がある一方で、セキュリティ上の範囲が限定されるため、
  // トークン発行側で有効期限やスコープチェックを厳格に行う必要がある点に注意する。
  useEffect(() => {
    if (!tokenData) return;

    // エフェクト内での同期的な状態更新を避けるため、更新を遅延させる
    const t = setTimeout(() => {
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
          // 型付きメッセージの処理
          if (event.data.type === "heartbeat" && event.data.payload) {
            // ハートビートメッセージを受信したら、データを更新して応答を返す
            setData(event.data.payload);
            setIsConnected(true);

            // ハートビート応答（ACK）を送信
            channel.postMessage({
              type: "ack",
              timestamp: Date.now(),
            });

            // タイマーをリセット
            if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
            heartbeatTimerRef.current = setTimeout(() => {
              setIsConnected(false);
            }, HEARTBEAT_TIMEOUT_MS);
          } else if (event.data.type === "data" && event.data.payload) {
            // 通常のデータメッセージ
            setData(event.data.payload);
            setIsConnected(true);

            // データ受信確認（ACK）を返す
            // これにより、操作画面側（送信側）はモニタータブが生存していることを確認し、
            // 接続ステータスを「接続中」に復帰させることができます。
            channel.postMessage({
              type: "ack",
              timestamp: Date.now(),
            });

            if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
            heartbeatTimerRef.current = setTimeout(() => {
              setIsConnected(false);
            }, HEARTBEAT_TIMEOUT_MS);
          } else if (event.data.type === "ping") {
            // 疎通確認（ping）を受信したら応答（ACK）を返す
            // 操作画面がリロードされた際などに、既存のモニタータブを見つけるために使用されます。
            channel.postMessage({
              type: "ack",
              timestamp: Date.now(),
            });

            // 接続確認とみなしてタイマーをリセット
            setIsConnected(true);
            if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
            heartbeatTimerRef.current = setTimeout(() => {
              setIsConnected(false);
            }, HEARTBEAT_TIMEOUT_MS);
          }
        }
      } catch (err) {
        console.error("BroadcastChannel メッセージ解析エラー:", err);
      }
    };

    // タイマー参照は `heartbeatTimerRef` を使用する
    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
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

            // { type, payload } 形式のメッセージから payload を抽出
            if (receivedData && typeof receivedData === 'object' && 'payload' in receivedData) {
              setData(receivedData.payload);
            } else {
              setData(receivedData);
            }
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
        } catch (err) {
          console.warn("Failed to request snapshot from connection:", err);
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
