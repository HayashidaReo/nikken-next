"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { useAuthStore } from "@/store/use-auth-store";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, isInitialized, isLoading } = useAuthStore();
    const [hasValidToken, setHasValidToken] = useState(false);
    const [tokenChecked, setTokenChecked] = useState(false);

    // Check for presentation token on monitor-display route
    useEffect(() => {
        const isMonitorDisplay = pathname?.includes("/monitor-display");
        const presentationToken = searchParams?.get("pt");

        let timer: ReturnType<typeof setTimeout> | null = null;

        if (isMonitorDisplay && presentationToken) {
            // Validate token quickly
            fetch("/api/validate-presentation-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${presentationToken}`
                },
            })
                .then(res => {
                    if (res.ok) {
                        setHasValidToken(true);
                    }
                    // Defer state update to avoid synchronous setState inside effect
                    timer = setTimeout(() => setTokenChecked(true), 0);
                })
                .catch(() => {
                    timer = setTimeout(() => setTokenChecked(true), 0);
                });
        } else {
            // Defer state update to avoid synchronous setState inside effect
            timer = setTimeout(() => setTokenChecked(true), 0);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [pathname, searchParams]);

    useEffect(() => {
        // Skip auth check if valid presentation token exists
        if (hasValidToken) {
            return;
        }

        // 初期化が完了し、ローディング中でない場合のみチェック
        if (isInitialized && !isLoading && tokenChecked) {
            if (!user) {
                // 未認証の場合はログイン画面にリダイレクト
                router.replace(ROUTES.LOGIN);
            }
        }
    }, [user, isInitialized, isLoading, router, hasValidToken, tokenChecked]);

    // トークンチェック中
    if (!tokenChecked) {
        return (
            <LoadingIndicator
                message="認証状態を確認中..."
                size="lg"
                fullScreen={true}
            />
        );
    }

    // 有効なプレゼンテーショントークンがある場合は認証チェックをスキップ
    if (hasValidToken) {
        return <>{children}</>;
    }

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
    return <>{children}</>;
}
