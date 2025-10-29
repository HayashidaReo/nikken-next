"use client";

import * as React from "react";
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
        <div className={cn("", className)}>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
            </div>
            {children && (
                <div className="mt-4">
                    {children}
                </div>
            )}
        </div>
    );
}