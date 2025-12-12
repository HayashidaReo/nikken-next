"use client";

import { OrganizationManagement } from "@/components/organisms/organization-management";

/**
 * 組織管理画面（システム管理者専用）
 * 
 * アクセス制御: useSystemAdminGuardにより、usersコレクションのroleが'system_admin'のユーザーのみアクセス可能
 */
export default function OrganizationManagementPage() {
  return (
    <main className="p-6">
      <OrganizationManagement />
    </main>
  );
}
