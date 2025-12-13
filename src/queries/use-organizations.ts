import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FirestoreOrganizationRepository } from "@/repositories/firestore/organization-repository";
import type { Organization, OrganizationCreateWithAccount } from "@/types/organization.schema";

export type { Organization, OrganizationCreateWithAccount };

const repository = new FirestoreOrganizationRepository();
const ORGANIZATIONS_QUERY_KEY = ["organizations"];

/**
 * 組織一覧取得 Hook (Real-time + TanStack Query)
 */
export function useOrganizations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: () => repository.fetchAll(),
    staleTime: Infinity, // リアルタイムリスナーで更新するため、自動再取得は抑制しても良い
  });

  useEffect(() => {
    // リアルタイム購読開始
    const unsubscribe = repository.listenAll(
      (organizations) => {
        // キャッシュを直接更新
        queryClient.setQueryData(ORGANIZATIONS_QUERY_KEY, organizations);
      },
      (err) => {
        console.error("Organization listen error:", err);
      }
    );

    // クリーンアップ
    return () => unsubscribe();
  }, [queryClient]);

  return query;
}

/**
 * 組織作成Mutation
 */
export function useCreateOrganization() {

  return useMutation({
    mutationFn: (data: OrganizationCreateWithAccount) => repository.create(data),
    onSuccess: () => {
    },
  });
}


