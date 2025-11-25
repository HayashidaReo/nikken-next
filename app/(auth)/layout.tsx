"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { useAuthStore } from "@/store/use-auth-store";
import { MonitorSyncProvider } from "@/components/providers/monitor-sync-provider";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isInitialized, isLoading } = useAuthStore();

    useEffect(() => {
        // 初期化が完了し、ローディング中でない場合のみチェック
        if (isInitialized && !isLoading) {
            if (!user) {
                // 未認証の場合はログイン画面にリダイレクト
                router.replace(ROUTES.LOGIN);
            }
        }
    }, [user, isInitialized, isLoading, router]);

    // 初期化中またはローディング中は全画面ローディング表示
    if (!isInitialized || isLoading) {
        return (
            <LoadingIndicator
                message="認証状態を確認中..."
                size="lg"
                fullScreen={true}
            />
        );
    }

    // 未認証の場合はローディング表示（リダイレクト中）
    if (!user) {
        return (
            <LoadingIndicator
                message="ログイン画面へリダイレクト中..."
                size="lg"
                fullScreen={true}
            />
        );
    }

    // 認証済みの場合のみ子コンポーネントを表示
    return (
        <MonitorSyncProvider>
            {children}
        </MonitorSyncProvider>
    );
}
