import type { MatchGroup } from "@/types/match.schema";

/**
 * チームの依存関係を管理するドメインサービス
 * チーム削除時の整合性チェックなどに使用
 */
export class TeamDependencyService {
    /**
     * 指定されたチームが関与している対戦グループを取得する
     */
    static getDependentMatchGroups(teamId: string, matchGroups: MatchGroup[]): MatchGroup[] {
        return matchGroups.filter(
            (mg) => mg.teamAId === teamId || mg.teamBId === teamId
        );
    }

    /**
     * チームが削除可能かどうかを検証する
     * 削除不可の場合はエラーをスローする
     * 
     * @throws Error 依存関係が存在する場合
     */
    static validateDeletion(teamId: string, matchGroups: MatchGroup[]): void {
        const dependencies = this.getDependentMatchGroups(teamId, matchGroups);

        if (dependencies.length > 0) {
            throw new Error(
                "このチームは既に対戦カードに関連付けられているため削除できません。\n先に対戦カードを削除してください。"
            );
        }
    }
}
