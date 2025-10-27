"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SkewedBackground } from "@/components/atoms/skewed-background";

interface MonitorDisplayData {
  matchId: string;
  tournamentName: string;
  courtName: string;
  round: string;
  playerA: {
    displayName: string;
    teamName: string;
    score: number;
    hansoku: number;
  };
  playerB: {
    displayName: string;
    teamName: string;
    score: number;
    hansoku: number;
  };
  timeRemaining: number;
  isTimerRunning: boolean;
  isPublic: boolean;
}

export default function MonitorDisplayPage() {
  const [data, setData] = React.useState<MonitorDisplayData>({
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
    } // フォールバック: URLパラメータからの初期データ読み込み
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

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // 非公開時の表示
  if (!data.isPublic) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">準備中</h1>
          <p className="text-xl">試合開始をお待ちください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 接続状態表示 */}
      <div className="fixed top-4 right-4 z-50">
        <div
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
            isConnected ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-200 animate-pulse" : "bg-yellow-200"
            )}
          />
          {isConnected ? "データ同期中" : "スタンバイ中"}
        </div>
      </div>

      {/* 接続方法の説明 */}
      {!isConnected && (
        <div className="fixed top-16 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm max-w-xs">
          <p className="font-semibold mb-1">使用方法</p>
          <p>
            スコアボード操作画面から「モニター表示開始」ボタンを押すと、このページにデータが表示されます。
          </p>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="fixed top-16 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* メイン画面 - 2分割レイアウト */}
      <div className="h-screen flex flex-col">
        {/* 上側 - 選手A（赤チーム） */}
        <div className="flex-1 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-between px-16 py-8">
          {/* 左側：チーム名と選手名 */}
          <div className="flex-1">
            <div className="text-2xl font-medium mb-2 opacity-90">
              {data.playerA.teamName || "チーム名未設定"}
            </div>
            <div className="text-8xl font-black leading-none">
              {data.playerA.displayName || "選手A"}
            </div>
          </div>

          {/* 右側：スコアと反則カード */}
          <div className="flex items-center gap-8">
            {/* スコア */}
            <div className="text-[12rem] font-black leading-none">
              {data.playerA.score}
            </div>

            {/* 反則カード表示エリア */}
            <div className="flex flex-col gap-2">
              {Array.from({ length: Math.min(data.playerA.hansoku, 2) }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-20 h-20 rounded-lg border-4 border-white shadow-lg",
                    i === 0 ? "bg-red-600" : "bg-yellow-400"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 中央セクション - 大会情報とタイマー */}
        <div className="bg-gray-900 py-6 px-16 relative">
          <div className="flex items-center justify-between">
            {/* 左側：大会情報 */}
            <div className="flex items-center gap-8 text-white">
              <span className="text-3xl font-bold">{data.tournamentName}</span>
              <span className="text-2xl">{data.courtName}</span>
              <span className="text-2xl">{data.round}</span>
            </div>
          </div>

          {/* 右側：タイマー - 斜めカット背景（絶対位置で中央線を超えて表示） */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
            <SkewedBackground className="px-24 py-0">
              <div className="text-right">
                <div
                  className={cn(
                    "text-[10rem] font-mono font-black",
                    data.isTimerRunning ? "text-green-400" : "text-white"
                  )}
                >
                  {formatTime(data.timeRemaining)}
                </div>
              </div>
            </SkewedBackground>
          </div>
        </div>

        {/* 下側 - 選手B（グレー/白チーム） */}
        <div className="flex-1 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-between px-16 py-8 text-black">
          {/* 左側：チーム名と選手名 */}
          <div className="flex-1">
            <div className="text-2xl font-medium mb-2 opacity-90">
              {data.playerB.teamName || "チーム名未設定"}
            </div>
            <div className="text-8xl font-black leading-none">
              {data.playerB.displayName || "選手B"}
            </div>
          </div>

          {/* 右側：スコアと反則カード */}
          <div className="flex items-center gap-8">
            {/* スコア */}
            <div className="text-[12rem] font-black leading-none">
              {data.playerB.score}
            </div>

            {/* 反則カード表示エリア */}
            <div className="flex flex-col gap-2">
              {Array.from({ length: Math.min(data.playerB.hansoku, 2) }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-20 h-20 rounded-lg border-4 border-white shadow-lg",
                    i === 0 ? "bg-red-600" : "bg-yellow-400"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
