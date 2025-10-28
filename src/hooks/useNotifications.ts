"use client";

import { useState, useCallback } from "react";
import { NOTIFICATION_CONSTANTS } from "@/lib/constants";

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
      const duration =
        notification.duration ?? NOTIFICATION_CONSTANTS.DEFAULT_DURATION;
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
    (message: string) => {
      return addNotification({ type: "success", message });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message: string) => {
      return addNotification({ type: "error", message });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message: string) => {
      return addNotification({ type: "warning", message });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message: string) => {
      return addNotification({ type: "info", message });
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

      const displayMessage = context ? `${context}: ${message}` : message;

      // console.errorも統一
      console.error(context || "エラー", error);

      return showError(displayMessage);
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
