"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import {
  isAuthenticated,
  isEmailVerified,
  getUserDisplayName,
} from "@/lib/auth/types";

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
    isAuthenticated: isAuthenticated(user),
    isEmailVerified: isEmailVerified(user),
    displayName: getUserDisplayName(user),
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
    isAuthenticated: isAuthenticated(user),
    isEmailVerified: isEmailVerified(user),
    displayName: getUserDisplayName(user),
  };
}

/**
 * 認証状態にアクセスするためのフック（リダイレクトなし）
 * @returns 認証状態と操作関数
 */
export function useAuth() {
  const {
    user,
    isInitialized,
    isLoading,
    signOut: storeSignOut,
  } = useAuthStore();

  const signOut = useCallback(async () => {
    await storeSignOut();
    // ログアウト時に大会ソート設定を削除
    // Note: useAuthStoreのsignOut内で行うことも考えられるが、
    // UI設定のクリアはView層に近いこのフックで行うことで責務を分ける
    if (typeof window !== "undefined") {
      localStorage.removeItem("tournament_sort_config");
    }
  }, [storeSignOut]);

  return {
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: isAuthenticated(user),
    isEmailVerified: isEmailVerified(user),
    displayName: getUserDisplayName(user),
    signOut,
  };
}
