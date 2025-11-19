"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { useAuthStore } from "@/store/use-auth-store";
import { useValidatePresentationToken } from "@/queries/use-presentation";

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
    const validatePresentationToken = useValidatePresentationToken();

    // monitor-displayルートでのプレゼンテーショントークンを確認する
    useEffect(() => {
        const isMonitorDisplay = pathname?.includes("/monitor-display");
        const presentationToken = searchParams?.get("pt");

        let timer: ReturnType<typeof setTimeout> | null = null;

        if (isMonitorDisplay && presentationToken) {
            // トークンを検証する
            validatePresentationToken.mutate(presentationToken, {
                onSuccess: () => {
                    setHasValidToken(true);
                    // setTokenChecked を即時に呼び出すと effect の実行中に同期的な
                    // state 更新が発生し、意図しないバッチングやレンダリング順序の問題を
                    // 引き起こす可能性があるため、マクロタスクに遅延させて実行している。
                    timer = setTimeout(() => setTokenChecked(true), 0);
                },
                onError: () => {
                    // エラー時も同様に遅延してトークンチェック完了フラグを立てる
                    timer = setTimeout(() => setTokenChecked(true), 0);
                }
            });
        } else {
            // 上記と同じ理由で、ここでも同期的な state 更新を避けてマクロタスクに遅延させる
            timer = setTimeout(() => setTokenChecked(true), 0);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams, validatePresentationToken.mutate]);

    useEffect(() => {
        // 有効なプレゼンテーショントークンが存在する場合は認証チェックをスキップする
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
