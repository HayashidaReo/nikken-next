"use client";

import { useState } from "react";

/**
 * フォーム送信時の共通ロジックを管理するhook
 * ローディング状態とエラーハンドリングを統一
 */
export function useFormSubmit<T = unknown>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    submitFn: (data: T) => Promise<void>,
    data: T,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
      showErrorAlert?: boolean;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await submitFn(data);
      options?.onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "送信に失敗しました";
      setError(errorMessage);

      if (options?.showErrorAlert) {
        alert(errorMessage);
      }

      options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    handleSubmit,
    clearError,
  };
}
