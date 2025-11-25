import { TeamMatch } from "@/types/match.schema";
import { Team } from "@/types/team.schema";
import { TEAM_MATCH_CONSTANTS } from "@/lib/constants";

/**
 * チームと選手IDから選手情報を解決する
 * @param teams - チーム情報の配列
 * @param playerId - 選手ID
 * @param teamId - チームID
 * @returns 解決された選手情報（表示名とチーム名）
 */
export function resolvePlayerInfo(teams: Team[] | undefined, playerId: string, teamId: string) {
    const team = teams?.find((t) => t.teamId === teamId);
    const player = team?.players.find((p) => p.playerId === playerId);
    return {
        displayName: player?.displayName || playerId,
        teamName: team?.teamName || teamId,
    };
}

/**
 * 団体戦の進行状況を分析する
 * 
 * @param teamMatches - 団体戦の全試合データ
 * @param currentMatchId - 現在の試合ID
 * @param currentSortOrder - 現在の試合のソート順
 * @param currentMatchSnapshot - 現在の試合の最新スコア（ストアのスナップショット）
 * @returns 全試合終了フラグと代表戦必要フラグ
 */
export function analyzeTeamMatchStatus(
    teamMatches: TeamMatch[],
    currentMatchId: string,
    currentSortOrder: number | undefined,
    currentMatchSnapshot: { playerA: { score: number }, playerB: { score: number } }
) {
    let isAllFinished = false;
    let needsRepMatch = false;

    // 現在の試合が代表戦で完了している場合は必ず終了
    const currentMatch = teamMatches.find((m) => m.matchId === currentMatchId);
    if (currentMatch?.roundId === TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID) {
        isAllFinished = true;
        return { isAllFinished, needsRepMatch };
    }

    // 現在の試合より後の試合があるかチェック
    const nextMatch = teamMatches
        .filter((m) => m.sortOrder > (currentSortOrder ?? -1))
        .sort((a, b) => a.sortOrder - b.sortOrder)[0];

    // 完了した通常試合を抽出
    const completedRegularMatches = teamMatches.filter(
        (m) => m.sortOrder <= TEAM_MATCH_CONSTANTS.LAST_REGULAR_MATCH_ORDER && (m.isCompleted || m.matchId === currentMatchId)
    );

    // 5試合目の時（またはそれ以降の判定が必要な時）
    if (currentMatch?.roundId === TEAM_MATCH_CONSTANTS.LAST_REGULAR_MATCH_ROUND_ID) {
        let winsA = 0;
        let winsB = 0;

        completedRegularMatches.forEach((m) => {
            let scoreA = m.players.playerA.score;
            let scoreB = m.players.playerB.score;

            // 現在の試合については、スナップショット（最新状態）を使用する
            if (m.matchId === currentMatchId) {
                scoreA = currentMatchSnapshot.playerA.score;
                scoreB = currentMatchSnapshot.playerB.score;
            }

            if (scoreA > scoreB) winsA++;
            else if (scoreB > scoreA) winsB++;
        });

        // 同点の場合
        if (winsA === winsB) {
            // 代表戦が既に設定されているかチェック
            const hasRepMatch = teamMatches.some((m) => m.roundId === TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID);

            if (hasRepMatch) {
                // 代表戦が既に設定されている場合は通常フロー（次の試合へ）
                isAllFinished = false;
            } else {
                // 代表戦が未設定の場合、設定が必要
                needsRepMatch = true;
                isAllFinished = false;
            }
        } else {
            // 勝敗がついている場合は終了
            isAllFinished = true;
        }
    } else if (!nextMatch) {
        // 次の試合がなく、5試合も完了していない場合は終了
        isAllFinished = true;
    }

    return { isAllFinished, needsRepMatch };
}
