"use client";

import { useAuthStore } from "@/store/use-auth-store";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export function useSystemAdmin() {
    const { user, isInitialized } = useAuthStore();
    const [isSystemAdmin, setIsSystemAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!isInitialized) return;

        // ユーザーがいない場合のリセット処理
        if (!user) {
            // 状態が既にリセットされていなければリセットする
            if (isSystemAdmin || isLoading) {
                // synchronous setState warning回避のためsetTimeoutを使用
                const timer = setTimeout(() => {
                    setIsSystemAdmin(false);
                    setIsLoading(false);
                }, 0);
                return () => clearTimeout(timer);
            }
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, "users", user.uid),
            (doc) => {
                if (doc.exists() && doc.data()?.role === "system_admin") {
                    setIsSystemAdmin(true);
                } else {
                    setIsSystemAdmin(false);
                }
                setIsLoading(false);
            },
            (error) => {
                console.error("Failed to check system admin status:", error);
                setIsSystemAdmin(false);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, isInitialized, isSystemAdmin, isLoading]);

    return {
        isSystemAdmin,
        isLoading: isLoading || !isInitialized,
        user
    };
}

/**
 * システム管理者専用ページガード
 * 管理者でなければホームにリダイレクト
 */
export function useSystemAdminGuard() {
    const { isSystemAdmin, isLoading, user } = useSystemAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace("/login");
            } else if (!isSystemAdmin) {
                router.replace("/dashboard"); // 一般ユーザーはダッシュボードへ
            }
        }
    }, [isLoading, isSystemAdmin, user, router]);

    return { isSystemAdmin, isLoading };
}
