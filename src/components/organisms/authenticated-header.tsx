"use client";

import * as React from "react";
import { AuthUserInfo } from "@/components/molecules/auth-user-info";
import { LogoutButton } from "@/components/molecules/logout-button";
import { cn } from "@/lib/utils/utils";

interface AuthenticatedHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * 認証が必要なページで使用するヘッダーコンポーネント
 * ユーザー情報とログアウト機能を含む
 */
export function AuthenticatedHeader({
    title,
    subtitle,
    className,
    children
}: AuthenticatedHeaderProps) {
    return (
        <div className={cn("flex justify-between items-start", className)}>
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <AuthUserInfo className="mt-2 sm:mt-0" />
                </div>
                {children && (
                    <div className="mt-4">
                        {children}
                    </div>
                )}
            </div>
            <LogoutButton className="ml-4 flex-shrink-0" />
        </div>
    );
}