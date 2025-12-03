import { TeamMatch, WinReason } from "@/types/match.schema";
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
        grade: player?.grade,
    };
}

/**
 * チーム戦の勝利数を計算する
 * @param matches - 試合データの配列
 * @returns チームAとチームBの勝利数
 */
export function calculateTeamMatchWins(matches: TeamMatch[]) {
    let winsA = 0;
    let winsB = 0;
    matches.forEach((m) => {
        if (m.winner === "playerA") winsA++;
        else if (m.winner === "playerB") winsB++;
    });
    return { winsA, winsB };
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
    currentMatchSnapshot: {
        playerA: { score: number };
        playerB: { score: number };
        winner?: "playerA" | "playerB" | "draw" | "none";
        winReason?: WinReason | null;
    }
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
        // 現在の試合のスナップショットを反映した試合リストを作成
        const effectiveMatches = completedRegularMatches.map(m => {
            if (m.matchId === currentMatchId) {
                // 明示的な勝者が指定されている場合（判定、不戦勝など）はそれを使用
                if (currentMatchSnapshot.winner && currentMatchSnapshot.winner !== "none") {
                    return {
                        ...m,
                        winner: currentMatchSnapshot.winner,
                        winReason: currentMatchSnapshot.winReason || "none",
                    };
                }

                const scoreA = currentMatchSnapshot.playerA.score;
                const scoreB = currentMatchSnapshot.playerB.score;
                let winner: "playerA" | "playerB" | "draw" | "none" = "none";
                if (scoreA > scoreB) winner = "playerA";
                else if (scoreB > scoreA) winner = "playerB";
                else winner = "draw";

                return {
                    ...m,
                    winner,
                };
            }
            return m;
        });

        const { winsA, winsB } = calculateTeamMatchWins(effectiveMatches);

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

/**
 * 試合結果保存用のオブジェクトを作成する
 * 
 * @param match - 元の試合データ
 * @param result - 更新する結果データ
 * @returns 保存用の試合データオブジェクト
 */
export function createMatchResultUpdateObject(
    match: TeamMatch,
    result: {
        playerAScore: number;
        playerBScore: number;
        playerAHansoku: number;
        playerBHansoku: number;
        winner: "playerA" | "playerB" | "draw" | "none";
        winReason: WinReason;
        isCompleted: boolean;
    }
) {
    return {
        matchId: match.matchId || "",
        roundId: match.roundId,
        sortOrder: match.sortOrder,
        players: {
            playerA: {
                ...match.players.playerA,
                score: result.playerAScore,
                hansoku: result.playerAHansoku,
            },
            playerB: {
                ...match.players.playerB,
                score: result.playerBScore,
                hansoku: result.playerBHansoku,
            },
        },
        isCompleted: result.isCompleted,
        winner: result.winner,
        winReason: result.winReason,
    };
}
