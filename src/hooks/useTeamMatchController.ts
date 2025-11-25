import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { TeamMatch } from "@/types/match.schema";
import { Team } from "@/types/team.schema";
import { Tournament } from "@/types/tournament.schema";
import { determineWinner, Winner } from "@/domains/match/match-logic";

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
}

export function useTeamMatchController({
    matchId,
    activeTournamentType,
    teamMatches,
    teams,
    tournament,
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

    // 団体戦の通常試合（代表戦を除く）の最終試合順序
    const LAST_REGULAR_MATCH_ORDER = 5;

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

    // 全試合終了判定
    let isAllFinished = false;
    if (activeTournamentType === "team" && teamMatches) {
        // 現在の試合より後の試合があるかチェック
        const nextMatch = teamMatches
            .filter((m) => m.sortOrder > (currentSortOrder ?? -1))
            .sort((a, b) => a.sortOrder - b.sortOrder)[0];

        if (!nextMatch) {
            isAllFinished = true;
        } else if (nextMatch.roundId === '6') {
            // 5試合目終了時、かつ次は6試合目（代表戦）の場合
            // ここまでの勝敗を計算する（現在の試合含む）
            let winsA = 0;
            let winsB = 0;

            teamMatches.forEach((m) => {
                if (m.sortOrder <= LAST_REGULAR_MATCH_ORDER) {
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
                }
            });

            // 勝敗がついている場合は終了とする（代表戦を行わない）
            if (winsA !== winsB) {
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
     */
    const handleEnterKey = useCallback((
        showConfirmDialog: boolean,
        onConfirmMatch: () => void,
        onConfirmExecute: () => void
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

        // 次の試合へボタンが表示されている場合 -> 次の試合へ
        if (viewMode === "match_result" && !isAllFinished) {
            handleNextMatch();
            return;
        }

        // 最終結果を表示ボタンが表示されている場合 -> 最終結果を表示
        if (viewMode === "match_result" && isAllFinished) {
            handleShowTeamResult();
            return;
        }
    }, [activeTournamentType, viewMode, isAllFinished, handleNextMatch, handleShowTeamResult]);

    return {
        isAllFinished,
        handleShowTeamResult,
        handleNextMatch,
        handleBackToDashboard,
        handleEnterKey,
    };
}
