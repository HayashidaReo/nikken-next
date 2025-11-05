import { OrganizationManagement } from "@/components/organisms/organization-management";

/**
 * 組織管理画面（システム管理者専用）
 *
 * 注意: この画面へのアクセス制御は、実際の認証実装時に追加予定
 * 現在は開発・テスト用として直接アクセス可能
 */
export default function OrganizationManagementPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <OrganizationManagement />
    </main>
  );
}
