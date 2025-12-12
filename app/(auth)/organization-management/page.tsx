"use client";

import { OrganizationManagement } from "@/components/organisms/organization-management";
import { useSystemAdminGuard } from "@/hooks/useSystemAdmin";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";

/**
 * 組織管理画面（システム管理者専用）
 * 
 * アクセス制御: useSystemAdminGuardにより、usersコレクションのroleが'system_admin'のユーザーのみアクセス可能
 */
export default function OrganizationManagementPage() {
  const { isSystemAdmin, isLoading } = useSystemAdminGuard();

  if (isLoading || !isSystemAdmin) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingIndicator message="管理者権限を確認中..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <OrganizationManagement />
    </main>
  );
}
