"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase/client";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";

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
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.ORGANIZATIONS),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orgName: data.orgName,
          representativeName: data.representativeName,
          representativePhone: data.representativePhone,
          representativeEmail: data.representativeEmail,
          adminUid: data.adminUid,
          // TimestampをISO文字列に変換
          createdAt: data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          updatedAt: data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : new Date().toISOString(),
        } as Organization;
      });
    } catch (error) {
      console.error("Fetch organizations error:", error);
      throw new Error("組織一覧の取得に失敗しました");
    }
  },

  // 組織作成 (Cloud Functions呼び出し)
  create: async (data: OrganizationCreateData): Promise<Organization> => {
    try {
      const createOrganizationFn = httpsCallable<OrganizationCreateData, unknown>(
        functions,
        "createOrganization"
      );

      await createOrganizationFn(data);

      // 作成されたデータを返すのは難しい（Functionsの結果には含まれない可能性がある）ため、
      // 成功したことだけを返し、キャッシュ無効化で対応する戦略
      // UIのOptimistic Update用に戻り値を偽装するか、リロードを促す
      // ここでは最低限の情報を返す
      return {
        id: "new", // 実際にはキャッシュ更新で再取得されるのでダミー
        orgName: data.orgName,
        representativeName: data.representativeName,
        representativePhone: data.representativePhone,
        representativeEmail: data.representativeEmail,
        adminUid: "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      console.error("Create organization error:", error);
      const errorMessage = error instanceof Error ? error.message : "組織作成に失敗しました";
      throw new Error(errorMessage);
    }
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
    onSuccess: () => {
      // 組織一覧のキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}


