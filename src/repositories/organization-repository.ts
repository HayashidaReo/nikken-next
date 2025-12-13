import type { Organization, OrganizationCreateWithAccount } from "@/types/organization.schema";

/**
 * 組織リポジトリの抽象インターフェース
 */
export interface OrganizationRepository {
    /**
     * 組織一覧をリアルタイムに購読する
     * @param onChange 更新時に呼ばれるコールバック
     * @returns 購読解除関数
     */
    listenAll(onChange: (organizations: Organization[]) => void, onError: (error: Error) => void): () => void;

    /**
     * 組織を作成する
     * @param data 作成データ
     */
    create(data: OrganizationCreateWithAccount): Promise<{ orgId: string }>;
}
