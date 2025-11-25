import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMonitorStore } from "@/store/use-monitor-store";
import { TeamMatch } from "@/types/match.schema";
import { Team } from "@/types/team.schema";
import { Tournament } from "@/types/tournament.schema";

interface UseTeamMatchControllerProps {
    matchId: string;
    activeTournamentType: string | null | undefined;
    teamMatches: TeamMatch[] | undefined;
    teams: Team[] | undefined;
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
                if (m.sortOrder <= 5) {
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
            let winner: "playerA" | "playerB" | "draw" | "none" = "none";
            if (snapshot.playerA.score > snapshot.playerB.score) winner = "playerA";
            else if (snapshot.playerB.score > snapshot.playerA.score) winner = "playerB";
            else winner = "draw";

            // 全試合終了 -> 団体戦結果表示
            const results = teamMatches
                .filter((m) => {
                    // 完了した試合のみを対象とする
                    // 現在の試合は保存されたばかりなので含める
                    return m.isCompleted || m.matchId === matchId;
                })
                .map((m) => {
                    // 選手名解決
                    const resolvePlayer = (playerId: string, teamId: string) => {
                        const team = teams.find((t) => t.teamId === teamId);
                        const player = team?.players.find((p) => p.playerId === playerId);
                        return {
                            displayName: player?.displayName || playerId,
                            teamName: team?.teamName || teamId,
                        };
                    };
                    const pA = resolvePlayer(m.players.playerA.playerId, m.players.playerA.teamId);
                    const pB = resolvePlayer(m.players.playerB.playerId, m.players.playerB.teamId);

                    let w: "playerA" | "playerB" | "draw" | "none" = "none";
                    if (m.players.playerA.score > m.players.playerB.score) w = "playerA";
                    else if (m.players.playerB.score > m.players.playerA.score) w = "playerB";
                    else if (m.isCompleted || m.matchId === matchId) w = "draw"; // 完了していて同点なら引き分け

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
    }, [activeTournamentType, teamMatches, teams, matchId, setTeamMatchResults, setViewMode]);

    const handleNextMatch = useCallback(async () => {
        // 3. 次の試合へ
        if (activeTournamentType === "team" && teamMatches && teams) {
            const nextMatch = teamMatches
                .filter((m) => m.sortOrder > (currentSortOrder ?? -1))
                .sort((a, b) => a.sortOrder - b.sortOrder)[0];

            if (nextMatch) {
                // 次の試合データを構築
                // 選手名解決
                const resolvePlayer = (playerId: string, teamId: string) => {
                    const team = teams.find((t) => t.teamId === teamId);
                    const player = team?.players.find((p) => p.playerId === playerId);
                    return {
                        displayName: player?.displayName || playerId,
                        teamName: team?.teamName || teamId,
                    };
                };

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
    }, [activeTournamentType, teamMatches, teams, currentSortOrder, initializeMatch, setPublic, router, tournament, tournamentName, courtName, roundName]);

    const handleBackToDashboard = useCallback(() => {
        if (activeTournamentType === "team" && matchGroupId) {
            router.push(`/dashboard?matchGroupId=${matchGroupId}`);
        } else {
            router.push("/dashboard");
        }
    }, [activeTournamentType, matchGroupId, router]);

    return {
        isAllFinished,
        handleShowTeamResult,
        handleNextMatch,
        handleBackToDashboard,
    };
}
