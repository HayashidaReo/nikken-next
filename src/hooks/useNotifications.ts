"use client";

import { useState, useCallback } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

/**
 * エラーハンドリングと通知を統一するhook
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const newNotification = { ...notification, id };

      setNotifications(prev => [...prev, newNotification]);

      // 自動削除（デフォルト5秒）
      const duration = notification.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // 便利なメソッド
  const showSuccess = useCallback(
    (message: string, title?: string) => {
      return addNotification({ type: "success", message, title });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      return addNotification({ type: "error", message, title });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      return addNotification({ type: "warning", message, title });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      return addNotification({ type: "info", message, title });
    },
    [addNotification]
  );

  // エラー処理のヘルパー
  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const message =
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました";
      const title = context ? `${context}でエラーが発生` : "エラー";

      // console.errorも統一
      console.error(title, error);

      return showError(message, title);
    },
    [showError]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    handleError,
  };
}
