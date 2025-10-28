"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/utils";

interface AuthUserInfoProps {
    className?: string;
    showEmail?: boolean;
    showAuthStatus?: boolean;
}

/**
 * 認証ユーザー情報を表示するコンポーネント
 */
export function AuthUserInfo({
    className,
    showEmail = false,
    showAuthStatus = false
}: AuthUserInfoProps) {
    const { user, displayName, isEmailVerified, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className={cn("animate-pulse", className)}>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className={cn("text-sm", className)}>
            <div className="font-medium text-gray-900">
                ようこそ、{displayName}さん
            </div>
            {showEmail && user.email && (
                <div className="text-gray-600 mt-1">
                    {user.email}
                </div>
            )}
            {showAuthStatus && (
                <div className="mt-1">
                    <span
                        className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            isEmailVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                        )}
                    >
                        {isEmailVerified ? "認証済み" : "未認証"}
                    </span>
                </div>
            )}
        </div>
    );
}