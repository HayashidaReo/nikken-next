"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { useToast } from "@/components/providers/notification-provider";
import { Button } from "@/components/atoms/button";
import { useRouter } from "next/navigation";
import { useOrganizations } from "@/queries/use-organizations";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";

/**
 * 組織一覧表示
 */
export function OrganizationList() {
    const { data: organizations = [], isLoading, error } = useOrganizations();
    const { showError, showSuccess } = useToast();
    const router = useRouter();

    // エラーハンドリング
    if (error) {
        showError(error instanceof Error ? error.message : "組織一覧の取得に失敗しました");
    }

    const handleManageOrganization = (orgId: string, orgName: string) => {
        showSuccess(`組織「${orgName}」を選択しました`);
        // 大会設定ページに移動
        router.push('/tournament-settings');
    };

    if (isLoading) {
        return (
            <LoadingIndicator
                message="読み込み中..."
                className="py-8"
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">登録済み組織一覧</h2>
                <div className="text-sm text-gray-600">
                    {organizations.length}件の組織が登録されています
                </div>
            </div>

            {organizations.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-gray-600">
                        登録済みの組織がありません
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {organizations.map((org) => (
                        <Card key={org.id}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">{org.orgName}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">代表者名:</span>
                                        <span className="ml-2">{org.representativeName}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">電話番号:</span>
                                        <span className="ml-2">{org.representativePhone}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">メールアドレス:</span>
                                        <span className="ml-2">{org.representativeEmail}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">管理者UID:</span>
                                        <span className="ml-2 font-mono text-xs">{org.adminUid}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div>作成日: {new Date(org.createdAt).toLocaleDateString()}</div>
                                        <div>更新日: {new Date(org.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                    <Button
                                        onClick={() => handleManageOrganization(org.id, org.orgName)}
                                        size="sm"
                                        variant="outline"
                                    >
                                        大会管理
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}