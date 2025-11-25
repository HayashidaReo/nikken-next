"use client";

import { useState, useEffect, useCallback } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { MONITOR_DISPLAY_CHANNEL } from "@/lib/constants/monitor";

// Presentation API の型定義
declare global {
  interface Navigator {
    presentation?: {
      defaultRequest?: PresentationRequest;
    };
  }

  class PresentationRequest {
    constructor(urls: string[]);
    start(): Promise<PresentationConnection>;
    reconnect(presentationId: string): Promise<PresentationConnection>;
    getAvailability(): Promise<PresentationAvailability>;
  }

  interface PresentationConnection extends EventTarget {
    readonly id: string;
    readonly state: "connecting" | "connected" | "closed" | "terminated";
    readonly url: string;
    send(message: string): void;
    terminate(): void;
    addEventListener(type: "connect", listener: () => void): void;
    addEventListener(type: "close", listener: () => void): void;
    addEventListener(type: "terminate", listener: () => void): void;
    addEventListener(
      type: "message",
      listener: (event: MessageEvent) => void
    ): void;
  }

  interface PresentationAvailability extends EventTarget {
    readonly value: boolean;
    addEventListener(type: "change", listener: () => void): void;
  }
}

interface PresentationState {
  isSupported: boolean;
  isAvailable: boolean;
  isConnected: boolean;
  presentation: PresentationRequest | null;
  connection: PresentationConnection | null;
}

/**
 * Presentation APIを使用してセカンドスクリーン表示を管理するhook
 */
export function usePresentation(presentationUrl: string) {
  const [state, setState] = useState<PresentationState>({
    isSupported: false,
    isAvailable: false,
    isConnected: false,
    presentation: null,
    connection: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 接続IDを保存するキー
  const STORAGE_KEY = "presentation_connection_id";

  // 初回スナップショット送信ヘルパー
  const sendInitialSnapshot = (connection?: PresentationConnection) => {
    try {
      const monitorData = useMonitorStore.getState().getMonitorSnapshot();

      // Presentation 接続が確立していれば直接送信を試みる
      try {
        if (connection && connection.state === "connected") {
          connection.send(JSON.stringify(monitorData));
        }
      } catch (err) {
        console.warn("初回データ送信（Presentation）に失敗:", err);
      }

      // BroadcastChannel でもフォールバック送信
      try {
        const ch = new BroadcastChannel(MONITOR_DISPLAY_CHANNEL);
        ch.postMessage(monitorData);
        ch.close();
      } catch (err) {
        console.warn("BroadcastChannel が使えない環境", err);
      }
    } catch (err) {
      console.warn("初回スナップショット送信に失敗:", err);
    }
  };

  // Presentation APIのサポート確認
  useEffect(() => {
    const isSupported =
      "presentation" in navigator && "PresentationRequest" in window;
    setState(prev => ({ ...prev, isSupported }));
  }, []);

  // 接続確立後の共通処理
  const setupConnection = useCallback((connection: PresentationConnection, registerGlobal: boolean) => {
    // IDを保存
    localStorage.setItem(STORAGE_KEY, connection.id);

    setState(prev => ({
      ...prev,
      connection,
      isConnected: connection.state === "connected",
    }));

    if (registerGlobal) {
      useMonitorStore.getState().setPresentationConnection(connection);
      useMonitorStore.getState().setPresentationConnected(connection.state === "connected");
    }

    // 接続状態の監視
    const handleConnect = () => {
      setState(prev => ({ ...prev, isConnected: true }));
      if (registerGlobal) {
        useMonitorStore.getState().setPresentationConnected(true);
        // プレゼン接続が確立した場合はフォールバックフラグをクリア
        useMonitorStore.getState().setFallbackOpen(false);
      }

      // 初回スナップショットを送信（接続確立時）
      sendInitialSnapshot(connection);
    };

    connection.addEventListener("connect", handleConnect);

    // 送信側でも、受信側からスナップショット要求が来たら応答するリスナーを追加
    const handleMessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg && msg.type === "request_snapshot") {
          try {
            const monitorData = useMonitorStore.getState().getMonitorSnapshot();
            if (connection.state === "connected") {
              connection.send(JSON.stringify(monitorData));
            }
          } catch (err) {
            console.error("メッセージ解析に失敗:", err);
          }
        }
      } catch (err) {
        console.error("メッセージ解析に失敗:", err);
      }
    };
    connection.addEventListener("message", handleMessage);

    const handleClose = () => {
      setState(prev => ({ ...prev, isConnected: false, connection: null }));
      localStorage.removeItem(STORAGE_KEY);
      if (registerGlobal) {
        useMonitorStore.getState().setPresentationConnection(null);
        useMonitorStore.getState().setPresentationConnected(false);
        useMonitorStore.getState().setFallbackOpen(false);
      }
    };

    connection.addEventListener("close", handleClose);
    connection.addEventListener("terminate", handleClose);

    // 既に接続状態なら初回送信を行う
    if (connection.state === "connected") {
      handleConnect();
    }
  }, []);

  // PresentationRequestの初期化
  useEffect(() => {
    if (!state.isSupported || !presentationUrl) return;

    try {
      const presentation = new PresentationRequest([presentationUrl]);
      setState(prev => ({ ...prev, presentation }));

      // 利用可能性をチェック
      presentation
        .getAvailability()
        .then(availability => {
          setState(prev => ({ ...prev, isAvailable: availability.value }));

          availability.addEventListener("change", () => {
            setState(prev => ({ ...prev, isAvailable: availability.value }));
          });
        })
        .catch(err => {
          console.warn("Presentation availability check failed:", err);
          setError("プレゼンテーション機能の確認に失敗しました");
        });

      // 再接続を試みる
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        presentation.reconnect(savedId)
          .then(connection => {
            console.log("Presentation reconnected:", connection.id);
            // 再接続時は常にグローバルストアを更新する（このフックの主な用途がモニター制御のため）
            setupConnection(connection, true);
          })
          .catch(err => {
            console.log("Presentation reconnect failed:", err);
            localStorage.removeItem(STORAGE_KEY);
          });
      }

    } catch (err) {
      console.error("PresentationRequest initialization failed:", err);
      setError("プレゼンテーション機能の初期化に失敗しました");
    }
  }, [state.isSupported, presentationUrl, setupConnection]);

  // プレゼンテーション開始（オーバーライド URL を受け取れるようにする）
  const startPresentation = useCallback(async (overrideUrl?: string, registerGlobal: boolean = false) => {
    setIsLoading(true);
    setError(null);

    let presentationToStart: PresentationRequest | null = null;

    try {
      if (overrideUrl) {
        presentationToStart = new PresentationRequest([overrideUrl]);
      } else if (state.presentation) {
        presentationToStart = state.presentation;
      }

      if (!presentationToStart) {
        setError("プレゼンテーション機能が利用できません");
        return;
      }

      // overrideUrl が渡されない場合は利用可能性を確認して失敗させる
      if (!overrideUrl && !state.isAvailable) {
        setError("プレゼンテーション機能が利用できません");
        return;
      }

      const connection = await presentationToStart.start();
      setupConnection(connection, registerGlobal);

      return connection;
    } catch (err) {
      console.error("Presentation start failed:", err);
      setError("プレゼンテーションの開始に失敗しました");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.presentation, state.isAvailable, setupConnection]);

  // プレゼンテーション終了
  const stopPresentation = useCallback(() => {
    const conn = useMonitorStore.getState().presentationConnection || state.connection;
    if (conn) {
      try {
        conn.terminate();
      } finally {
        useMonitorStore.getState().setPresentationConnection(null);
        useMonitorStore.getState().setPresentationConnected(false);
        useMonitorStore.getState().setFallbackOpen(false);
        setState(prev => ({ ...prev, connection: null, isConnected: false }));
      }
    }
  }, [state.connection]);

  // データ送信（グローバルストアの connection を優先して使用）
  const sendMessage = useCallback(
    (data: unknown) => {
      // ローカルフックの connection を優先し、なければグローバルの store 上の connection を使う
      const conn = state.connection || useMonitorStore.getState().presentationConnection;
      if (!conn || conn.state !== "connected") {
        console.warn("プレゼンテーション接続が確立されていません");
        return false;
      }

      try {
        const message = JSON.stringify(data);
        conn.send(message);
        return true;
      } catch (err) {
        console.error("メッセージ送信に失敗:", err);
        setError("データの送信に失敗しました");
        return false;
      }
    },
    [state.connection]
  );

  // メッセージ受信のリスナー設定
  const setMessageListener = useCallback(
    (listener: (data: unknown) => void) => {
      if (!state.connection) return;

      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          listener(data);
        } catch (err) {
          console.error("メッセージ解析に失敗:", err);
        }
      };

      state.connection.addEventListener("message", handleMessage);

      return () => {
        if (state.connection) {
          state.connection.removeEventListener(
            "message",
            handleMessage as EventListener
          );
        }
      };
    },
    [state.connection]
  );

  return {
    isSupported: state.isSupported,
    isAvailable: state.isAvailable,
    isConnected: state.isConnected,
    isLoading,
    error,
    startPresentation,
    stopPresentation,
    sendMessage,
    setMessageListener,
  };
}
