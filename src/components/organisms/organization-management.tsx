"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import { OrganizationCreateForm } from "@/components/organisms/organization-create-form";
import { OrganizationList } from "@/components/organisms/organization-list";

/**
 * 組織管理メイン画面（システム管理者専用）
 */
export function OrganizationManagement() {
  const [refreshKey] = useState(0);

  // TODO: 組織作成成功時にリスト再読み込み機能を追加予定

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">組織管理</h1>
        <p className="text-gray-600 mt-2">
          システム全体の組織（団体）を管理し、組織管理者アカウントを発行します
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">新規組織作成</TabsTrigger>
          <TabsTrigger value="list">組織一覧</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <OrganizationCreateForm />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <OrganizationList key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
