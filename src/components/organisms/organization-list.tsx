"use client";

import { MatchTable } from "@/components/organisms/match-table";
import { ORGANIZATION_LIST_TABLE_COLUMN_WIDTHS } from "@/lib/ui-constants";
import { TableRow, TableCell } from "@/components/atoms/table";
import { useToast } from "@/components/providers/notification-provider";
import { Button } from "@/components/atoms/button";
import { useRouter } from "next/navigation";
import { useOrganizations } from "@/queries/use-organizations";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { ROUTES } from "@/lib/constants";
import { Card, CardContent } from "@/components/atoms/card";
import { Building2, Mail, Phone, ExternalLink, User, Copy } from "lucide-react";

/**
 * 組織一覧表示
 */
export function OrganizationList() {
  const { data: organizations = [], isLoading, error } = useOrganizations();
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  // エラーハンドリング
  if (error) {
    showError(
      error instanceof Error ? error.message : "組織一覧の取得に失敗しました"
    );
  }

  const handleManageOrganization = (orgId: string, orgName: string) => {
    showSuccess(`組織「${orgName}」を選択しました`);
    router.push(ROUTES.TOURNAMENT_SETTINGS);
  };

  if (isLoading) {
    return <LoadingIndicator message="読み込み中..." className="py-8" />;
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center">
          <Building2 className="w-12 h-12 mb-4 opacity-20" />
          <p>登録済みの組織がありません</p>
        </CardContent>
      </Card>
    );
  }

  const handleCopyUid = async (uid: string) => {
    try {
      await navigator.clipboard.writeText(uid);
      showSuccess("UIDをコピーしました");
    } catch {
      showError("コピーに失敗しました");
    }
  };

  const columns = [
    { key: "orgName", label: "団体名", width: ORGANIZATION_LIST_TABLE_COLUMN_WIDTHS.orgName },
    { key: "representativeName", label: "代表者名", width: ORGANIZATION_LIST_TABLE_COLUMN_WIDTHS.representativeName },
    { key: "contact", label: "連絡先", width: ORGANIZATION_LIST_TABLE_COLUMN_WIDTHS.contact },
    { key: "adminUid", label: "管理者UID", width: ORGANIZATION_LIST_TABLE_COLUMN_WIDTHS.adminUid },
    { key: "createdAt", label: "作成日", width: ORGANIZATION_LIST_TABLE_COLUMN_WIDTHS.createdAt },
    { key: "action", label: "アクション", width: ORGANIZATION_LIST_TABLE_COLUMN_WIDTHS.action, className: "text-center" },
  ];

  return (
    <MatchTable
      title={<span className="text-lg font-bold">登録済み組織一覧 ({organizations.length}件)</span>}
      columns={columns}
    >
      {organizations.map((org) => (
        <TableRow key={org.id} className="hover:bg-gray-50/50">
          <TableCell className="font-medium align-top py-4 text-gray-900">
            <span className="line-clamp-2" title={org.orgName}>
              {org.orgName}
            </span>
          </TableCell>
          <TableCell className="align-top py-4">
            <div className="flex items-center gap-2 max-w-full">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900 truncate" title={org.representativeName}>
                {org.representativeName}
              </span>
            </div>
          </TableCell>
          <TableCell className="align-top py-4">
            <div className="space-y-1 text-sm text-gray-600 max-w-full">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="truncate" title={org.representativePhone}>
                  {org.representativePhone}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate" title={org.representativeEmail}>
                  {org.representativeEmail}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell className="align-top py-4">
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-mono truncate max-w-[150px]" title={org.adminUid ?? ""}>
                {org.adminUid ?? "未設定"}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
                onClick={() => handleCopyUid(org.adminUid ?? "")}
                title="UIDをコピー"
                disabled={!org.adminUid}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </TableCell>
          <TableCell className="align-top py-4 text-sm text-gray-500">
            {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "-"}
          </TableCell>
          <TableCell className="text-right align-top py-4">
            <div className="flex justify-center">
              <Button
                onClick={() => handleManageOrganization(org.id ?? "", org.orgName)}
                size="sm"
                variant="outline"
                className="gap-2 h-8 text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                大会管理
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </MatchTable>
  );
}
