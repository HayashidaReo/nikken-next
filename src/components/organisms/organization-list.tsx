"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { useToast } from "@/components/providers/notification-provider";

interface Organization {
    id: string;
    orgName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    adminUid: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * 組織一覧表示
 */
export function OrganizationList() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showError } = useToast();

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await fetch("/api/admin/organizations", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || errorData.error || "組織一覧の取得に失敗しました");
                }

                const result = await response.json();
                setOrganizations(result.organizations);

            } catch (error) {
                showError(error instanceof Error ? error.message : "組織一覧の取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizations();
    }, [showError]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-600">読み込み中...</div>
            </div>
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
                                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                                    <span>作成日: {new Date(org.createdAt).toLocaleDateString()}</span>
                                    <span>更新日: {new Date(org.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}