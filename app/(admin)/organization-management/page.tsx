import { OrganizationList } from "@/components/organisms/organization-list";

export default function OrganizationManagementPage() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">組織一覧</h1>
        <p className="text-muted-foreground mt-2">
          登録済みの組織（団体）と管理者情報を管理します。
        </p>
      </div>

      <OrganizationList />
    </main>
  );
}
