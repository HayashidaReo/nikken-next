import { useState, useCallback } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useSaveIndividualMatchResult, useSaveTeamMatchResult } from "@/queries/use-match-result";
import { useToast } from "@/components/providers/notification-provider";
import { determineWinner, Winner } from "@/domains/match/match-logic";
import type { TeamMatch, WinReason } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";
import type { MonitorData } from "@/types/monitor.schema";
import { createPlayerDirectory } from "@/lib/utils/player-directory";
import { createMonitorGroupMatches } from "@/lib/utils/team-match-utils";
import { useMatchPersistence } from "@/hooks/useMatchPersistence";
import { useMatchGroupPersistence } from "@/hooks/useMatchGroupPersistence";

interface UseMatchActionProps {
    orgId: string | null;
    activeTournamentId: string | null;
    activeTournamentType: string | null | undefined;
    needsRepMatch: boolean;
    handleNextMatch: () => void;
    handleCreateRepMatch: (playerAId: string, playerBId: string) => Promise<void>;
    teamMatches?: TeamMatch[];
    teams?: Team[];
}

export function useMatchAction({
    orgId,
    activeTournamentId,
    activeTournamentType,
    needsRepMatch,
    handleNextMatch,
    handleCreateRepMatch,
    teamMatches,
    teams,
}: UseMatchActionProps) {
    const { showError } = useToast();
    const saveIndividualMatchResultMutation = useSaveIndividualMatchResult();
    const saveTeamMatchResultMutation = useSaveTeamMatchResult();
    const { syncMatchToCloud } = useMatchPersistence();
    const { syncTeamMatchToCloud } = useMatchGroupPersistence();

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showRepMatchDialog, setShowRepMatchDialog] = useState(false);

    const setMatchResult = useMonitorStore((s) => s.setMatchResult);
    const setViewMode = useMonitorStore((s) => s.setViewMode);
    const setGroupMatches = useMonitorStore((s) => s.setGroupMatches);

    // overrides: 特別な決着（不戦敗、判定勝ち、反則負け）の場合に、
    // スコアに基づく自動判定ではなく、明示的な勝者と決着理由を指定するために使用する
    const handleSave = useCallback(async (overrides?: { winner?: Winner, winReason?: WinReason }) => {
        try {
            const store = useMonitorStore.getState();
            const matchId = store.matchId;
            if (!matchId) {
                throw new Error('Match ID is missing');
            }
            const snapshot = store.getMonitorSnapshot();
            const request = {
                matchId,
                organizationId: orgId || "",
                tournamentId: activeTournamentId || "",
                players: {
                    playerA: { score: snapshot.playerA.score, hansoku: snapshot.playerA.hansoku },
                    playerB: { score: snapshot.playerB.score, hansoku: snapshot.playerB.hansoku },
                },
                winner: overrides?.winner ?? (snapshot.matchResult?.winner || "none"),
                winReason: overrides?.winReason ?? (snapshot.matchResult?.winReason || "none"),
            };

            // 大会種別に応じて保存先を切り替え
            if (activeTournamentType === "team") {
                await saveTeamMatchResultMutation.mutateAsync(request);
                // クラウド同期 (バックグラウンド)
                if (store.matchGroupId) {
                    syncTeamMatchToCloud(store.matchGroupId, matchId).catch(console.error);
                }
            } else if (activeTournamentType === "individual") {
                await saveIndividualMatchResultMutation.mutateAsync(request);
                // クラウド同期 (バックグラウンド)
                syncMatchToCloud(matchId).catch(console.error);
            } else {
                // 種別が不明な場合はフォールバック（両方試行）
                try {
                    await saveIndividualMatchResultMutation.mutateAsync(request);
                    syncMatchToCloud(matchId).catch(console.error);
                } catch {
                    await saveTeamMatchResultMutation.mutateAsync(request);
                    if (store.matchGroupId) {
                        syncTeamMatchToCloud(store.matchGroupId, matchId).catch(console.error);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            showError("試合結果の保存に失敗しました");
        }
    }, [orgId, activeTournamentId, activeTournamentType, saveTeamMatchResultMutation, saveIndividualMatchResultMutation, showError, syncMatchToCloud, syncTeamMatchToCloud]);

    const handleConfirmMatchClick = useCallback(() => {
        setShowConfirmDialog(true);
    }, []);

    const updateMonitorGroupMatches = useCallback((winner: Winner, winReason: WinReason, snapshot: MonitorData) => {
        if (activeTournamentType === "team" && teamMatches && teams) {
            const store = useMonitorStore.getState();
            const currentMatchGroupId = store.matchGroupId;

            if (currentMatchGroupId) {
                const playerDirectory = createPlayerDirectory(teams);

                // 現在の試合結果を反映した一時的なteamMatchesを作成
                const updatedTeamMatches = teamMatches.map(m => {
                    if (m.matchId === store.matchId) {
                        return {
                            ...m,
                            players: {
                                playerA: { ...m.players.playerA, score: snapshot.playerA.score, hansoku: snapshot.playerA.hansoku },
                                playerB: { ...m.players.playerB, score: snapshot.playerB.score, hansoku: snapshot.playerB.hansoku },
                            },
                            isCompleted: true,
                            winner,
                            winReason,
                        };
                    }
                    return m;
                });

                const groupMatches = createMonitorGroupMatches(updatedTeamMatches, currentMatchGroupId, playerDirectory);
                setGroupMatches(groupMatches);
            }
        }
    }, [activeTournamentType, teamMatches, teams, setGroupMatches]);

    const handleConfirmMatchExecute = useCallback(async () => {
        setShowConfirmDialog(false);

        const snapshot = useMonitorStore.getState().getMonitorSnapshot();
        const winner: Winner = determineWinner(snapshot.playerA.score, snapshot.playerB.score, true);

        // 引き分けの場合はwinReasonをnoneに、それ以外はipponに設定
        const winReason: WinReason = winner === "draw" ? "none" : "ippon";

        // 1. 保存
        await handleSave({ winner, winReason });

        // 2. 結果表示モードへ
        // 常に試合結果を表示する
        setMatchResult({
            playerA: snapshot.playerA,
            playerB: snapshot.playerB,
            winner,
            winReason,
        });

        // 団体戦の場合、グループ内の全試合を取得
        updateMonitorGroupMatches(winner, winReason, snapshot);

        setViewMode("match_result");
    }, [handleSave, setMatchResult, setViewMode, updateMonitorGroupMatches]);

    const handleSpecialWin = useCallback(async (winner: "playerA" | "playerB", reason: WinReason) => {
        await handleSave({ winner, winReason: reason });

        const snapshot = useMonitorStore.getState().getMonitorSnapshot();
        setMatchResult({
            playerA: snapshot.playerA,
            playerB: snapshot.playerB,
            winner,
            winReason: reason,
        });

        // 団体戦の場合、グループ内の全試合を取得
        updateMonitorGroupMatches(winner, reason, snapshot);

        setViewMode("match_result");
    }, [handleSave, setMatchResult, setViewMode, updateMonitorGroupMatches]);

    const isSaving = saveIndividualMatchResultMutation.isPending || saveTeamMatchResultMutation.isPending;

    // 代表戦ダイアログのハンドラー
    const handleNextMatchClick = useCallback(() => {
        if (needsRepMatch) {
            // 代表戦が必要な場合はダイアログを表示
            setShowRepMatchDialog(true);
        } else {
            // 通常の次の試合へ
            handleNextMatch();
        }
    }, [needsRepMatch, handleNextMatch]);

    const handleRepMatchConfirm = useCallback((playerAId: string, playerBId: string) => {
        setShowRepMatchDialog(false);
        handleCreateRepMatch(playerAId, playerBId);
    }, [handleCreateRepMatch]);

    const handleRepMatchCancel = useCallback(() => {
        setShowRepMatchDialog(false);
    }, []);

    return {
        handleSave,
        handleConfirmMatchClick,
        handleConfirmMatchExecute,
        handleNextMatchClick,
        handleRepMatchConfirm,
        handleRepMatchCancel,
        showConfirmDialog,
        setShowConfirmDialog,
        showRepMatchDialog,
        setShowRepMatchDialog,
        isSaving,
        handleSpecialWin,
    };
}
