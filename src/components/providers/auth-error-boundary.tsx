"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

/**
 * 認証関連のエラーをキャッチするError Boundary
 * Firebase認証エラーや予期しないエラーをハンドリング
 */
export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultAuthErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * デフォルトの認証エラーフォールバックコンポーネント
 */
function DefaultAuthErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  const isAuthError =
    error.message.includes("auth/") ||
    error.message.includes("Firebase") ||
    error.message.includes("認証");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600">
            {isAuthError ? "認証エラー" : "エラーが発生しました"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            {isAuthError
              ? "認証処理中にエラーが発生しました。もう一度お試しください。"
              : "予期しないエラーが発生しました。"}
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="text-left">
              <summary className="cursor-pointer text-xs text-gray-500">
                エラー詳細 (開発環境のみ)
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                {error.message}
                {error.stack && `\n${error.stack}`}
              </pre>
            </details>
          )}
          <div className="space-y-2">
            <Button onClick={resetError} className="w-full">
              再試行
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/login")}
              className="w-full"
            >
              ログイン画面に戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * useAuthErrorBoundary - 関数型コンポーネントでエラー境界を使用するためのhook
 */
export function useAuthErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
  }, []);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}
