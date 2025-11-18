"use client";

import { useState, useEffect, useCallback } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";

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

  // Presentation APIのサポート確認
  useEffect(() => {
    const isSupported =
      "presentation" in navigator && "PresentationRequest" in window;
    setState(prev => ({ ...prev, isSupported }));
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
    } catch (err) {
      console.error("PresentationRequest initialization failed:", err);
      setError("プレゼンテーション機能の初期化に失敗しました");
    }
  }, [state.isSupported, presentationUrl]);

  // プレゼンテーション開始（オーバーライド URL を受け取れるようにする）
  const startPresentation = useCallback(async (overrideUrl?: string) => {
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

      const connection = await presentationToStart.start();

      setState(prev => ({
        ...prev,
        connection,
        isConnected: connection.state === "connected",
      }));

      // グローバルストアに接続を保存
      useMonitorStore.getState().setPresentationConnection(connection);
      useMonitorStore.getState().setPresentationConnected(connection.state === "connected");

      // 接続状態の監視
      connection.addEventListener("connect", () => {
        setState(prev => ({ ...prev, isConnected: true }));
        useMonitorStore.getState().setPresentationConnected(true);
      });

      connection.addEventListener("close", () => {
        setState(prev => ({ ...prev, isConnected: false, connection: null }));
        useMonitorStore.getState().setPresentationConnection(null);
        useMonitorStore.getState().setPresentationConnected(false);
      });

      connection.addEventListener("terminate", () => {
        setState(prev => ({ ...prev, isConnected: false, connection: null }));
        useMonitorStore.getState().setPresentationConnection(null);
        useMonitorStore.getState().setPresentationConnected(false);
      });

      return connection;
    } catch (err) {
      console.error("Presentation start failed:", err);
      setError("プレゼンテーションの開始に失敗しました");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.presentation]);

  // プレゼンテーション終了
  const stopPresentation = useCallback(() => {
    const conn = useMonitorStore.getState().presentationConnection || state.connection;
    if (conn) {
      try {
        conn.terminate();
      } finally {
        useMonitorStore.getState().setPresentationConnection(null);
        useMonitorStore.getState().setPresentationConnected(false);
        setState(prev => ({ ...prev, connection: null, isConnected: false }));
      }
    }
  }, [state.connection]);

  // データ送信（グローバルストアの connection を優先して使用）
  const sendMessage = useCallback(
    (data: unknown) => {
      const conn = useMonitorStore.getState().presentationConnection || state.connection;
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
