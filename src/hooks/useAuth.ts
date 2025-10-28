"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * 認証が必要なページで使用するhook
 * ログインしていない場合はログイン画面にリダイレクト
 */
export function useAuthGuard() {
    const { user, isInitialized, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // 初期化が完了し、ローディング中でない場合のみチェック
        if (isInitialized && !isLoading) {
            if (!user) {
                // 未認証の場合はログイン画面にリダイレクト
                router.replace("/login");
            }
        }
    }, [user, isInitialized, isLoading, router]);

    return {
        user,
        isLoading: isLoading || !isInitialized,
        isAuthenticated: !!user,
    };
}

/**
 * ログイン済みユーザーのリダイレクト用hook
 * ログイン済みの場合はダッシュボードにリダイレクト
 */
export function useGuestGuard() {
    const { user, isInitialized, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // 初期化が完了し、ローディング中でない場合のみチェック
        if (isInitialized && !isLoading) {
            if (user) {
                // 認証済みの場合はダッシュボードにリダイレクト
                router.replace("/dashboard");
            }
        }
    }, [user, isInitialized, isLoading, router]);

    return {
        user,
        isLoading: isLoading || !isInitialized,
        isAuthenticated: !!user,
    };
}