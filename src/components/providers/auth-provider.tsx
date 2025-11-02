"use client";

import React, { useEffect } from "react";
import { initializeAuthListener } from "@/store/use-auth-store";

/**
 * Firebase Authentication 初期化Provider
 * アプリケーション起動時に認証状態の監視を開始
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Firebase Auth状態変更の監視を開始
        const unsubscribe = initializeAuthListener();

        // クリーンアップ関数
        return () => unsubscribe();
    }, []);

    return <>{children}</>;
}