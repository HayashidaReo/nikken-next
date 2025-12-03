import type { TeamMatch, WinReason } from "@/types/match.schema";
import type { MonitorData } from "@/types/monitor.schema";
import { PlayerDirectoryMaps, resolveMatchPlayer } from "@/lib/utils/player-directory";

/**
 * チーム戦の試合リストからモニター表示用のグループ試合データを作成する
 * 
 * @param matches - チーム戦の全試合リスト
 * @param currentMatchGroupId - 現在の試合グループID
 * @param playerDirectory - 選手情報ディレクトリ
 * @returns モニター表示用のグループ試合データ配列
 */
export function createMonitorGroupMatches(
    matches: TeamMatch[],
    currentMatchGroupId: string | undefined,
    playerDirectory: PlayerDirectoryMaps
): MonitorData["groupMatches"] {
    return matches
        .filter((m) => m.matchGroupId === currentMatchGroupId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((m) => {
            const pA = resolveMatchPlayer(m.players.playerA, playerDirectory);
            const pB = resolveMatchPlayer(m.players.playerB, playerDirectory);
            let winner: "playerA" | "playerB" | "draw" | "none" = "none";
            let winReason: WinReason = "none";
            if (m.isCompleted) {
                if (m.winner) {
                    winner = m.winner;
                    winReason = m.winReason || "none";
                } else {
                    if (pA.score > pB.score) winner = "playerA";
                    else if (pB.score > pA.score) winner = "playerB";
                    else winner = "draw";
                    winReason = "ippon"; // デフォルト
                }
            }
            return {
                matchId: m.matchId || "",
                sortOrder: m.sortOrder,
                roundId: m.roundId,
                playerA: {
                    displayName: pA.displayName,
                    teamName: pA.teamName,
                    score: pA.score,
                    hansoku: pA.hansoku,
                    grade: pA.grade,
                },
                playerB: {
                    displayName: pB.displayName,
                    teamName: pB.teamName,
                    score: pB.score,
                    hansoku: pB.hansoku,
                    grade: pB.grade,
                },
                isCompleted: m.isCompleted,
                winner,
                winReason,
            };
        });
}
