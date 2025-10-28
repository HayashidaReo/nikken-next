"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface QueryProviderProps {
    children: React.ReactNode;
}

/**
 * TanStack Query プロバイダー
 * サーバー状態の管理とキャッシュ機能を提供
 */
export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // 5分間はキャッシュを新鮮として扱う
                        staleTime: 1000 * 60 * 5,
                        // バックグラウンドでの自動リフェッチを無効化
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}