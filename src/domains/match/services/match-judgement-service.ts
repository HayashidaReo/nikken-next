import { TeamMatch } from "@/types/match.schema";
import { TEAM_MATCH_CONSTANTS } from "@/lib/constants";

/**
 * 試合の勝敗判定を行うドメインサービス
 */
export class MatchJudgementService {
    /**
     * 団体戦の勝者を判定する
     * 
     * @param teamMatches - 団体戦の全試合データ
     * @returns 勝者のチームIDキー ("teamA" | "teamB") または undefined (未決着)
     */
    static judgeTeamMatchWinner(teamMatches: TeamMatch[]): "teamA" | "teamB" | undefined {
        // 完了した試合の勝敗を集計
        let winsA = 0;
        let winsB = 0;

        teamMatches.forEach(m => {
            if (m.isCompleted) {
                if (m.winner === "playerA") winsA++;
                else if (m.winner === "playerB") winsB++;
            }
        });

        // 勝利数による判定
        if (winsA > winsB) return "teamA";
        else if (winsB > winsA) return "teamB";

        // 同点の場合、代表戦の結果を確認
        const repMatch = teamMatches.find(m => m.roundId === TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID);
        if (repMatch && repMatch.isCompleted) {
            if (repMatch.winner === "playerA") return "teamA";
            else if (repMatch.winner === "playerB") return "teamB";
        }

        return undefined;
    }
}
