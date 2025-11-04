"use client";

import * as React from "react";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { useAuthGuard } from "@/hooks/useAuth";

interface AuthGuardWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * 認証ガード機能を提供するWrapper コンポーネント
 * 認証チェック中のローディング表示と、
 * 認証が完了した後のコンテンツレンダリングを担当
 */
export function AuthGuardWrapper({
  children,
  fallback,
  className,
}: AuthGuardWrapperProps) {
  const { isLoading } = useAuthGuard();

  // 認証チェック中はローディング表示
  if (isLoading) {
    return (
      fallback || (
        <div className={className}>
          <LoadingIndicator
            message="認証状態を確認中..."
            size="lg"
            fullScreen={true}
          />
        </div>
      )
    );
  }

  // 認証が完了したら子コンポーネントを表示
  return <>{children}</>;
}
