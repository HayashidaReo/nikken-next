import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { FirestoreOrganizationRepository } from "@/repositories/firestore/organization-repository";
import type { Organization, OrganizationCreateData } from "@/types/organization";

export type { Organization, OrganizationCreateData };

const repository = new FirestoreOrganizationRepository();

/**
 * 組織一覧取得 Hook (Real-time)
 */
export function useOrganizations() {
  const [data, setData] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // リアルタイム購読開始
    const unsubscribe = repository.listenAll(
      (organizations) => {
        setData(organizations);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    // クリーンアップ
    return () => unsubscribe();
  }, []);

  return { data, isLoading, error };
}

/**
 * 組織作成Mutation
 */
export function useCreateOrganization() {

  return useMutation({
    mutationFn: (data: OrganizationCreateData) => repository.create(data),
    onSuccess: () => {
    },
  });
}


