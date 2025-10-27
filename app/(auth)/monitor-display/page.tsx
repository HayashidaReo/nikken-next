"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/atoms/card";
import { cn } from "@/lib/utils";

interface MonitorDisplayData {
  matchId: string;
  tournamentName: string;
  courtName: string;
  round: string;
  playerA: {
    name: string;
    score: number;
    hansoku: number;
  };
  playerB: {
    name: string;
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
    tournamentName: "大会名",
    courtName: "コート名",
    round: "予選",
    playerA: { name: "選手A", score: 0, hansoku: 0 },
    playerB: { name: "選手B", score: 0, hansoku: 0 },
    timeRemaining: 300,
    isTimerRunning: false,
    isPublic: false,
  });

  const [isConnected, setIsConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // BroadcastChannelでのデータ共有
  React.useEffect(() => {
    const channel = new BroadcastChannel('monitor-display-channel');

    // メッセージ受信
    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.data && typeof event.data === 'object') {
          setData(event.data);
          setIsConnected(true);
        }
      } catch (err) {
        console.error('BroadcastChannel メッセージ解析エラー:', err);
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  // Presentation API接続の確立
  React.useEffect(() => {
    // 表示側（receiver）としての処理
    if ('presentation' in navigator) {
      // メッセージ接続の処理
      const handleConnection = (connection: unknown) => {
        const conn = connection as {
          addEventListener: (event: string, handler: (e: Event) => void) => void;
          close: () => void;
          terminate: () => void;
        };

        setIsConnected(true);

        // メッセージ受信リスナー
        conn.addEventListener('message', (messageEvent: Event) => {
          const msgEvent = messageEvent as MessageEvent;
          try {
            const receivedData = JSON.parse(msgEvent.data);
            setData(receivedData);
          } catch (err) {
            console.error('メッセージ解析エラー:', err);
            setError('データの解析に失敗しました');
          }
        });

        // 接続終了リスナー
        conn.addEventListener('close', () => {
          setIsConnected(false);
        });

        conn.addEventListener('terminate', () => {
          setIsConnected(false);
        });
      };

      // 簡素化されたPresentationReceiver処理
      try {
        // 動的にPresentation APIにアクセス
        const presentation = (navigator as unknown as Record<string, unknown>).presentation as {
          receiver?: {
            connectionList?: Promise<{
              connections?: unknown[];
              addEventListener?: (event: string, handler: EventListener) => void;
            }>;
          };
        };

        if (presentation?.receiver?.connectionList) {
          presentation.receiver.connectionList
            .then((list) => {
              // 既存の接続があれば処理
              list.connections?.forEach((connection) => {
                handleConnection(connection);
              });

              // 新しい接続を待機
              list.addEventListener?.('connectionavailable', (event: Event) => {
                const connectionEvent = event as {
                  detail?: { connection: unknown };
                  connection?: unknown;
                };
                const connection = connectionEvent.detail?.connection || connectionEvent.connection;
                if (connection) {
                  handleConnection(connection);
                }
              });
            })
            .catch((error: unknown) => {
              console.warn('PresentationReceiver initialization failed:', error);
              setError('プレゼンテーション接続の初期化に失敗しました');
            });
        }
      } catch (error) {
        console.warn('Presentation API not available or failed:', error);
        setError('プレゼンテーションAPIが利用できません');
      }
    }    // フォールバック: URLパラメータからの初期データ読み込み
    const urlParams = new URLSearchParams(window.location.search);
    const initialData = urlParams.get('data');
    if (initialData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(initialData));
        setData(parsedData);
      } catch (err) {
        console.error('URLパラメータ解析エラー:', err);
      }
    }
  }, []);

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      {/* 接続状態表示 */}
      <div className="fixed top-4 right-4 z-50">
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
          isConnected
            ? "bg-green-500 text-white"
            : "bg-yellow-500 text-white"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-200 animate-pulse" : "bg-yellow-200"
          )} />
          {isConnected ? "データ同期中" : "スタンバイ中"}
        </div>
      </div>

      {/* 接続方法の説明 */}
      {!isConnected && (
        <div className="fixed top-16 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm max-w-xs">
          <p className="font-semibold mb-1">使用方法</p>
          <p>スコアボード操作画面から「モニター表示開始」ボタンを押すと、このページにデータが表示されます。</p>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="fixed top-16 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* メインディスプレイ */}
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            {data.tournamentName}
          </h1>
          <div className="flex justify-center items-center gap-8 text-white text-xl">
            <span>{data.courtName}</span>
            <span>•</span>
            <span>{data.round}</span>
          </div>
        </div>

        {/* スコアボード */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* 選手A */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {data.playerA.name}
                </h2>
                <div className="bg-blue-500 rounded-lg p-6">
                  <div className="text-6xl font-bold text-white mb-2">
                    {data.playerA.score}
                  </div>
                  {data.playerA.hansoku > 0 && (
                    <div className="text-red-300 text-lg">
                      反則: {data.playerA.hansoku}
                    </div>
                  )}
                </div>
              </div>

              {/* タイマー */}
              <div className="text-center">
                <div className={cn(
                  "text-8xl font-mono font-bold mb-4",
                  data.isTimerRunning ? "text-green-400" : "text-white"
                )}>
                  {formatTime(data.timeRemaining)}
                </div>
                <div className={cn(
                  "text-2xl font-medium",
                  data.isTimerRunning ? "text-green-400" : "text-gray-400"
                )}>
                  {data.isTimerRunning ? "進行中" : "停止中"}
                </div>
              </div>

              {/* 選手B */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {data.playerB.name}
                </h2>
                <div className="bg-red-500 rounded-lg p-6">
                  <div className="text-6xl font-bold text-white mb-2">
                    {data.playerB.score}
                  </div>
                  {data.playerB.hansoku > 0 && (
                    <div className="text-red-300 text-lg">
                      反則: {data.playerB.hansoku}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 追加情報 */}
        <div className="text-center text-white/80">
          <p className="text-lg">
            試合ID: {data.matchId || "未設定"}
          </p>
        </div>
      </div>
    </div>
  );
}