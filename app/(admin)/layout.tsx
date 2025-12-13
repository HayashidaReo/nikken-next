"use client";

import { useSystemAdminGuard } from "@/hooks/useSystemAdmin";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { MasterDataWrapper } from "@/components/providers/master-data-wrapper";
import { AdminHeader } from "@/components/organisms/admin-header";

/**
 * 管理者グループ共通レイアウト
 * 
 * 責務:
 * 1. システム管理者権限の強制チェック (Guard)
 * 2. 共通プロバイダーの提供 (MasterDataWrapper等)
 * 3. 必要に応じて管理者用ヘッダー/サイドバーの表示
 */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // システム管理者権限チェック（権限がない場合は自動リダイレクトされる）
    const { isSystemAdmin, isLoading } = useSystemAdminGuard();

    if (isLoading || !isSystemAdmin) {
        return (
            <LoadingIndicator
                message="管理者権限を確認中..."
                fullScreen
            />
        );
    }

    return (
        <MasterDataWrapper>
            <div className="min-h-screen bg-gray-50">
                <AdminHeader />
                {children}
            </div>
        </MasterDataWrapper>
    );
}
