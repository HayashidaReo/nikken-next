"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 組織の型定義
export interface Organization {
  id: string;
  orgName: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  adminUid: string;
  createdAt: string;
  updatedAt: string;
}

// 組織作成時のデータ型
export interface OrganizationCreateData {
  orgName: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  adminEmail: string;
  adminPassword: string;
}

// クエリキー
const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  detail: (id: string) => [...organizationKeys.all, "detail", id] as const,
} as const;

// API関数
const organizationApi = {
  // 組織一覧取得
  getAll: async (): Promise<Organization[]> => {
    const response = await fetch("/api/admin/organizations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.details || errorData.error || "組織一覧の取得に失敗しました"
      );
    }

    const result = await response.json();
    return result.organizations;
  },

  // 組織作成
  create: async (data: OrganizationCreateData): Promise<Organization> => {
    const response = await fetch("/api/admin/organizations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.details || errorData.error || "組織作成に失敗しました"
      );
    }

    return response.json();
  },
};

/**
 * 組織一覧取得Query
 */
export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: organizationApi.getAll,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュを有効とする
  });
}

/**
 * 組織作成Mutation
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.create,
    onSuccess: newOrganization => {
      // 組織一覧のキャッシュを更新
      queryClient.setQueryData(
        organizationKeys.lists(),
        (old: Organization[] | undefined) => {
          return old ? [...old, newOrganization] : [newOrganization];
        }
      );

      // または単純にキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}


