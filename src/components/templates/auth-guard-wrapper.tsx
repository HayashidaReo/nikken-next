"use client";

import * as React from "react";
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
    className
}: AuthGuardWrapperProps) {
    const { isLoading } = useAuthGuard();

    // 認証チェック中はローディング表示
    if (isLoading) {
        return fallback || (
            <div className={`min-h-screen flex items-center justify-center ${className || ''}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">認証状態を確認中...</p>
                </div>
            </div>
        );
    }

    // 認証が完了したら子コンポーネントを表示
    return <>{children}</>;
}