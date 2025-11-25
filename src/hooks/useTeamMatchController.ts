import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { TeamMatch } from "@/types/match.schema";
import { Team } from "@/types/team.schema";
import { Tournament } from "@/types/tournament.schema";
import { determineWinner, Winner } from "@/domains/match/match-logic";
import { TEAM_MATCH_CONSTANTS } from "@/lib/constants";

/**
 * 団体戦の試合進行を制御するカスタムフック
 * 
 * @description
 * このフックは、団体戦における試合の進行ロジックを管理します。
 * 全試合終了判定、結果表示、次試合への遷移、ダッシュボードへの戻りなどの機能を提供します。
 * 
 * **主な機能:**
 * - 全試合終了判定（代表戦の要否判定を含む）
 * - 団体戦結果の集計と表示
 * - 次の試合への自動遷移
 * - ダッシュボードへの戻り処理
 * - 選手情報の解決（ID → 表示名への変換）
 * 
 * **使用方法:**
 * ```tsx
 * const {
 *   isAllFinished,
 *   handleShowTeamResult,
 *   handleNextMatch,
 *   handleBackToDashboard,
 * } = useTeamMatchController({
 *   matchId,
 *   activeTournamentType,
 *   teamMatches,
 *   teams,
 *   tournament,
 * });
 * ```
 * 
 * **注意事項:**
 * - このフックは団体戦（`activeTournamentType === "team"`）でのみ有効です
 * - `teamMatches` と `teams` が未定義の場合、一部の機能が動作しません
 * - 代表戦の要否判定は、5試合終了時点での勝敗数で自動判定されます
 * 
 * @param props - フックのプロパティ
 * @returns 団体戦制御用の関数群と状態
 * 
 * @see {@link useMonitorStore} - 試合状態を管理するストア
 */
interface UseTeamMatchControllerProps {
    /** 現在の試合ID */
    matchId: string;
    /** 大会種別（"team" | "individual" | null） */
    activeTournamentType: string | null | undefined;
    /** 団体戦の全試合データ */
    teamMatches: TeamMatch[] | undefined;
    /** チーム情報の配列 */
    teams: Team[] | undefined;
    /** 大会情報 */
    tournament: Tournament | undefined;
    /** 組織ID */
    orgId: string | null;
    /** 大会ID */
    tournamentId: string | null;
}

export function useTeamMatchController({
    matchId,
    activeTournamentType,
    teamMatches,
    teams,
    tournament,
    orgId,
    tournamentId,
}: UseTeamMatchControllerProps) {
    const router = useRouter();
    const matchGroupId = useMonitorStore((s) => s.matchGroupId);
    const currentSortOrder = useMonitorStore((s) => s.sortOrder);
    const setViewMode = useMonitorStore((s) => s.setViewMode);
    const setTeamMatchResults = useMonitorStore((s) => s.setTeamMatchResults);
    const setPublic = useMonitorStore((s) => s.setPublic);
    const initializeMatch = useMonitorStore((s) => s.initializeMatch);
    const roundName = useMonitorStore((s) => s.roundName);
    const tournamentName = useMonitorStore((s) => s.tournamentName);
    const courtName = useMonitorStore((s) => s.courtName);
    const viewMode = useMonitorStore((s) => s.viewMode);



    /**
     * チームと選手IDから選手情報を解決する
     * @param playerId - 選手ID
     * @param teamId - チームID
     * @returns 解決された選手情報（表示名とチーム名）
     */
    const resolvePlayer = useCallback((playerId: string, teamId: string) => {
        const team = teams?.find((t) => t.teamId === teamId);
        const player = team?.players.find((p) => p.playerId === playerId);
        return {
            displayName: player?.displayName || playerId,
            teamName: team?.teamName || teamId,
        };
    }, [teams]);

    // 全試合終了判定と代表戦の必要性判定
    let isAllFinished = false;
    let needsRepMatch = false; // 代表戦が必要かどうか

    if (activeTournamentType === "team" && teamMatches) {
        // 現在の試合が代表戦で完了している場合は必ず終了
        const currentMatch = teamMatches.find((m) => m.matchId === matchId);
        if (currentMatch?.roundId === TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID) {
            // 代表戦が完了したら全試合終了
            isAllFinished = true;
        } else {
            // 現在の試合より後の試合があるかチェック
            const nextMatch = teamMatches
                .filter((m) => m.sortOrder > (currentSortOrder ?? -1))
                .sort((a, b) => a.sortOrder - b.sortOrder)[0];

            // 完了した通常試合を抽出
            const completedRegularMatches = teamMatches.filter(
                (m) => m.sortOrder <= TEAM_MATCH_CONSTANTS.LAST_REGULAR_MATCH_ORDER && (m.isCompleted || m.matchId === matchId)
            );

            // 勝敗数を集計
            // 5試合目の時
            if (currentMatch?.roundId === TEAM_MATCH_CONSTANTS.LAST_REGULAR_MATCH_ROUND_ID) {
                let winsA = 0;
                let winsB = 0;

                completedRegularMatches.forEach((m) => {
                    // 現在の試合については、ストアの最新状態（保存直後）を使用する
                    let scoreA = m.players.playerA.score;
                    let scoreB = m.players.playerB.score;

                    if (m.matchId === matchId) {
                        const snapshot = useMonitorStore.getState().getMonitorSnapshot();
                        scoreA = snapshot.playerA.score;
                        scoreB = snapshot.playerB.score;
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
        }
    }

    const handleShowTeamResult = useCallback(() => {
        if (activeTournamentType === "team" && teamMatches && teams) {
            const snapshot = useMonitorStore.getState().getMonitorSnapshot();

            // 現在の試合の勝者判定（再計算）
            const winner: Winner = determineWinner(snapshot.playerA.score, snapshot.playerB.score, true);

            // 全試合終了 -> 団体戦結果表示
            const results = teamMatches
                .filter((m) => {
                    // 完了した試合のみを対象とする
                    // 現在の試合は保存されたばかりなので含める
                    return m.isCompleted || m.matchId === matchId;
                })
                .map((m) => {
                    // 選手名解決
                    const pA = resolvePlayer(m.players.playerA.playerId, m.players.playerA.teamId);
                    const pB = resolvePlayer(m.players.playerB.playerId, m.players.playerB.teamId);

                    const w: Winner = determineWinner(
                        m.players.playerA.score,
                        m.players.playerB.score,
                        m.isCompleted || m.matchId === matchId
                    );

                    return {
                        matchId: m.matchId || "",
                        sortOrder: m.sortOrder,
                        roundId: m.roundId,
                        playerA: {
                            displayName: pA.displayName,
                            teamName: pA.teamName,
                            score: m.players.playerA.score,
                            hansoku: m.players.playerA.hansoku,
                        },
                        playerB: {
                            displayName: pB.displayName,
                            teamName: pB.teamName,
                            score: m.players.playerB.score,
                            hansoku: m.players.playerB.hansoku,
                        },
                        winner: w,
                    };
                });

            // 現在の試合（まだ teamMatches に反映されていない可能性があるため、ストアの値で上書き）
            const currentMatchIndex = results.findIndex(r => r.matchId === matchId);
            if (currentMatchIndex !== -1) {
                results[currentMatchIndex] = {
                    ...results[currentMatchIndex],
                    playerA: snapshot.playerA,
                    playerB: snapshot.playerB,
                    winner,
                };
            }

            setTeamMatchResults(results);
            setViewMode("team_result");
        }
    }, [activeTournamentType, teamMatches, teams, matchId, setTeamMatchResults, setViewMode, resolvePlayer]);

    const handleNextMatch = useCallback(async () => {
        // 3. 次の試合へ
        if (activeTournamentType === "team" && teamMatches && teams) {
            const nextMatch = teamMatches
                .filter((m) => m.sortOrder > (currentSortOrder ?? -1))
                .sort((a, b) => a.sortOrder - b.sortOrder)[0];

            if (nextMatch) {
                // 次の試合データを構築
                // 選手名解決

                const playerAInfo = resolvePlayer(nextMatch.players.playerA.playerId, nextMatch.players.playerA.teamId);
                const playerBInfo = resolvePlayer(nextMatch.players.playerB.playerId, nextMatch.players.playerB.teamId);

                // initializeMatch を呼び出してストアを更新
                initializeMatch(nextMatch as TeamMatch, tournamentName, courtName, {
                    resolvedPlayers: {
                        playerA: {
                            ...nextMatch.players.playerA,
                            displayName: playerAInfo.displayName,
                            teamName: playerAInfo.teamName,
                        },
                        playerB: {
                            ...nextMatch.players.playerB,
                            displayName: playerBInfo.displayName,
                            teamName: playerBInfo.teamName,
                        },
                    },
                    roundName: roundName, // 回戦名は変わらない前提
                    defaultMatchTime: tournament?.defaultMatchTime,
                });

                // 非公開にする
                setPublic(false);

                // URLを更新して次の試合へ遷移（ルーター経由で遷移することでフックを再実行させる）
                router.push(`/monitor-control/${nextMatch.matchId}`);
            }
        }
    }, [activeTournamentType, teamMatches, teams, currentSortOrder, initializeMatch, setPublic, router, tournament, tournamentName, courtName, roundName, resolvePlayer]);

    const handleBackToDashboard = useCallback(() => {
        if (activeTournamentType === "team" && matchGroupId) {
            router.push(`/dashboard?matchGroupId=${matchGroupId}`);
        } else {
            router.push("/dashboard");
        }
    }, [activeTournamentType, matchGroupId, router]);

    /**
     * Enterキー押下時のハンドラー
     * 団体戦の進行状態に応じて適切なアクションを実行する
     * 
     * @param showConfirmDialog - 確認ダイアログの表示状態
     * @param onConfirmMatch - 試合確定時のコールバック
     * @param onConfirmExecute - 確定実行時のコールバック
     * @param onNextMatch - 次の試合へのコールバック（代表戦判定を含む）
     */
    const handleEnterKey = useCallback((
        showConfirmDialog: boolean,
        onConfirmMatch: () => void,
        onConfirmExecute: () => void,
        onNextMatch: () => void
    ) => {
        // ダイアログが開いている場合 -> 確定実行
        if (showConfirmDialog) {
            onConfirmExecute();
            return;
        }

        // 団体戦以外の場合は何もしない
        if (activeTournamentType !== "team") {
            return;
        }

        // 試合確定ボタンが表示されている場合 -> ダイアログを開く
        if (viewMode === "scoreboard") {
            onConfirmMatch();
            return;
        }

        // 次の試合へボタンが表示されている場合 -> 次の試合へ（代表戦判定含む）
        if (viewMode === "match_result" && !isAllFinished) {
            onNextMatch();
            return;
        }

        // 最終結果を表示ボタンが表示されている場合 -> 最終結果を表示
        if (viewMode === "match_result" && isAllFinished) {
            handleShowTeamResult();
            return;
        }
    }, [activeTournamentType, viewMode, isAllFinished, handleShowTeamResult]);

    /**
     * 代表戦を作成して開始する
     * @param playerAId - チームAの代表選手ID
     * @param playerBId - チームBの代表選手ID
     */
    const handleCreateRepMatch = useCallback(async (playerAId: string, playerBId: string) => {
        if (!matchGroupId || !teams) return;

        const { localTeamMatchRepository } = await import("@/repositories/local/team-match-repository");

        // チーム情報を取得
        const teamA = teams.find(t => t.players.some(p => p.playerId === playerAId));
        const teamB = teams.find(t => t.players.some(p => p.playerId === playerBId));

        if (!teamA || !teamB) {
            console.error("Team not found");
            return;
        }

        try {
            // 代表戦のTeamMatchを作成
            const repMatch = await localTeamMatchRepository.create(
                orgId || "",
                tournamentId || "",
                matchGroupId,
                {
                    roundId: TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID,
                    sortOrder: TEAM_MATCH_CONSTANTS.LAST_REGULAR_MATCH_ORDER + 1,
                    players: {
                        playerA: {
                            playerId: playerAId,
                            teamId: teamA.teamId,
                            score: 0,
                            hansoku: 0,
                        },
                        playerB: {
                            playerId: playerBId,
                            teamId: teamB.teamId,
                            score: 0,
                            hansoku: 0,
                        },
                    },
                    isCompleted: false,
                }
            );

            // 選手情報を解決
            const playerA = resolvePlayer(playerAId, teamA.teamId);
            const playerB = resolvePlayer(playerBId, teamB.teamId);

            // 代表戦を初期化して開始
            initializeMatch(repMatch, tournamentName, courtName, {
                resolvedPlayers: {
                    playerA: {
                        ...repMatch.players.playerA,
                        displayName: playerA.displayName,
                        teamName: playerA.teamName,
                    },
                    playerB: {
                        ...repMatch.players.playerB,
                        displayName: playerB.displayName,
                        teamName: playerB.teamName,
                    },
                },
                roundName: "代表戦",
                defaultMatchTime: tournament?.defaultMatchTime,
            });

            // 非公開にする
            setPublic(false);

            // URLを更新
            router.push(`/monitor-control/${repMatch.matchId}`);
        } catch (error) {
            console.error("Failed to create representative match:", error);
        }
    }, [matchGroupId, teams, resolvePlayer, initializeMatch, tournamentName, courtName, tournament, setPublic, router, orgId, tournamentId]);

    return {
        isAllFinished,
        needsRepMatch,
        handleShowTeamResult,
        handleNextMatch,
        handleBackToDashboard,
        handleEnterKey,
        handleCreateRepMatch,
    };
}
