"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Badge } from "@/components/atoms/badge";
import { useToast } from "@/components/providers/notification-provider";
import { Button } from "@/components/atoms/button";
import { useRouter } from "next/navigation";
import { useOrganizations } from "@/queries/use-organizations";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { ROUTES } from "@/lib/constants";
import { Card, CardContent } from "@/components/atoms/card";
import { Building2, Mail, Phone, ExternalLink } from "lucide-react";

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

  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead className="w-[250px]">団体名</TableHead>
            <TableHead>代表者情報</TableHead>
            <TableHead>管理者アカウント</TableHead>
            <TableHead>作成日</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id} className="hover:bg-gray-50/50">
              <TableCell className="font-medium align-top py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span>{org.orgName}</span>
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="font-medium text-gray-900">{org.representativeName}</div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Phone className="w-3 h-3" />
                    {org.representativePhone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Mail className="w-3 h-3" />
                    {org.representativeEmail}
                  </div>
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <Badge variant="outline" className="font-mono text-xs bg-gray-50">
                  {org.adminUid}
                </Badge>
              </TableCell>
              <TableCell className="align-top py-4 text-sm text-gray-500">
                {new Date(org.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right align-top py-4">
                <Button
                  onClick={() => handleManageOrganization(org.id, org.orgName)}
                  size="sm"
                  variant="outline"
                  className="gap-2 h-8 text-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  大会管理
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
