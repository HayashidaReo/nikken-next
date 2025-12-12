import type { MatchGroup, Match } from "@/types/match.schema";

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
    /**
     * 依存関係をチェックし、結果を返す
     */
    static checkDependencies(teamId: string, matchGroups: MatchGroup[], matches: Match[] = []) {
        const dependentMatchGroups = this.getDependentMatchGroups(teamId, matchGroups);
        const dependentMatches = matches.filter(m => m.players.playerA.teamId === teamId || m.players.playerB.teamId === teamId);

        return {
            hasGroupDependency: dependentMatchGroups.length > 0,
            hasMatchDependency: dependentMatches.length > 0
        };
    }

    /**
     * チームが削除可能かどうかを検証する
     * 削除不可の場合はエラーをスローする
     * 
     * @throws Error 依存関係が存在する場合
     */
    static validateDeletion(teamId: string, matchGroups: MatchGroup[], matches: Match[] = []): void {
        const { hasGroupDependency, hasMatchDependency } = this.checkDependencies(teamId, matchGroups, matches);

        if (hasGroupDependency && hasMatchDependency) {
            throw new Error(
                "このチームは「対戦カード（団体戦）」および「対戦カード（個人戦）」の両方に関連付けられているため削除できません。\n先に対戦データを削除してください。"
            );
        }

        if (hasGroupDependency) {
            throw new Error(
                "このチームは「対戦カード（団体戦）」に関連付けられているため削除できません。\n先に対戦カードを削除してください。"
            );
        }

        if (hasMatchDependency) {
            throw new Error(
                "このチームは「対戦カード（個人戦）」の参加選手に関連付けられているため削除できません。\n先に対戦カードを削除してください。"
            );
        }
    }

    /**
     * チームが未承認に戻せるかどうかを検証する
     * 変更不可の場合はエラーをスローする
     * 
     * @throws Error 依存関係が存在する場合
     */
    static validateUnapproval(teamId: string, matchGroups: MatchGroup[], matches: Match[] = []): void {
        const { hasGroupDependency, hasMatchDependency } = this.checkDependencies(teamId, matchGroups, matches);

        if (hasGroupDependency && hasMatchDependency) {
            throw new Error(
                "このチームは「対戦カード（団体戦）」および「対戦カード（個人戦）」の両方に関連付けられているため承認を取り消せません。\n先に対戦データを削除してください。"
            );
        }

        if (hasGroupDependency) {
            throw new Error(
                "このチームは「対戦カード（団体戦）」に関連付けられているため承認を取り消せません。\n先に対戦カードを削除してください。"
            );
        }

        if (hasMatchDependency) {
            throw new Error(
                "このチームは「対戦カード（個人戦）」の参加選手に関連付けられているため承認を取り消せません。\n先に対戦カードを削除してください。"
            );
        }
    }
}
