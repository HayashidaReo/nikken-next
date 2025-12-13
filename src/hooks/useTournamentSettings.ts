import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import {
    useTournamentsByOrganization,
    useCreateTournament,
    useUpdateTournamentByOrganization,
} from "@/queries/use-tournaments";
import type { Tournament, TournamentFormData } from "@/types/tournament.schema";
import {
    createEmptyTournamentFormData,
    mapTournamentToFormData,
} from "@/lib/utils/tournament-operations";
import { validateTournamentForm } from "@/lib/utils/tournament-validation";
import { useTournamentPersistence } from "./useTournamentPersistence";

/**
 * 大会設定ページの状態管理フック
 */
export function useTournamentSettings() {
    const { showError, showSuccess } = useToast();
    const { orgId } = useAuthContext();
    const { activeTournamentId, setActiveTournament } = useActiveTournament();

    // React Query hooks
    const {
        data: tournaments = [],
        isLoading,
        error,
    } = useTournamentsByOrganization(orgId);

    const { mutateAsync: createTournament } = useCreateTournament();
    const { mutateAsync: updateTournament } = useUpdateTournamentByOrganization();
    const { syncTournamentToCloud } = useTournamentPersistence();

    // 状態管理
    const [selectedTournamentId, setSelectedTournamentId] = useState<
        string | null
    >(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] =
        useState<TournamentFormData>(createEmptyTournamentFormData());

    // 大会選択処理
    const handleSelectTournament = useCallback((tournament: Tournament) => {
        if (!tournament.tournamentId) return;

        setIsAddingNew(false);
        setSelectedTournamentId(tournament.tournamentId);
        setFormData(mapTournamentToFormData(tournament));
    }, []);

    // activeTournamentId の初期設定（一度だけ実行）
    useEffect(() => {
        if (!isAddingNew && activeTournamentId && !selectedTournamentId) {
            const timeoutId = setTimeout(() => {
                setSelectedTournamentId(activeTournamentId);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [activeTournamentId, selectedTournamentId, isAddingNew]);

    // 選択中の大会のフォームデータを設定
    useEffect(() => {
        if (selectedTournamentId && tournaments.length > 0 && !isAddingNew) {
            const activeTournament = tournaments.find(
                (t: Tournament & { tournamentId?: string }) =>
                    t.tournamentId === selectedTournamentId
            );

            if (activeTournament) {
                const timeoutId = setTimeout(() => {
                    setFormData(mapTournamentToFormData(activeTournament));
                }, 0);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [selectedTournamentId, tournaments, isAddingNew]);

    // 新規作成開始処理
    const handleStartNew = useCallback(() => {
        setIsAddingNew(true);
        setSelectedTournamentId(null);
        setFormData(createEmptyTournamentFormData());
    }, []);

    // フォームフィールド更新処理
    const handleFormChange = useCallback(
        (
            field: keyof Tournament,
            value:
                | string
                | number
                | boolean
                | Date
                | null
                | { courtId: string; courtName: string }[]
                | { roundId: string; roundName: string }[]
        ) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        },
        []
    );

    // 大会保存処理（ローカル保存 -> 自動同期）
    const handleSave = useCallback(async () => {
        if (!orgId) {
            showError("組織IDが設定されていません");
            return;
        }

        // フォーム全体の検証
        const validation = validateTournamentForm(formData);
        if (!validation.isValid) {
            const firstError = Object.values(validation.errors)[0];
            showError(firstError || "入力内容に誤りがあります");
            return;
        }

        try {
            let savedTournamentId: string;
            const wasEmpty = tournaments.length === 0;

            if (isAddingNew || !selectedTournamentId) {
                // 新規作成
                const tournamentId = crypto.randomUUID();
                savedTournamentId = tournamentId;

                await createTournament({
                    orgId,
                    tournamentId,
                    tournamentData: {
                        tournamentName: formData.tournamentName,
                        tournamentDate: formData.tournamentDate as Date,
                        tournamentDetail: formData.tournamentDetail,
                        location: formData.location,
                        defaultMatchTime: formData.defaultMatchTime,
                        courts: formData.courts,
                        rounds: formData.rounds,
                        tournamentType: formData.tournamentType as "individual" | "team",
                        isTeamFormOpen: formData.isTeamFormOpen,
                    },
                });

                // 初回作成時はアクティブ大会に設定
                if (wasEmpty) {
                    setActiveTournament(tournamentId, formData.tournamentType as "individual" | "team");
                }
            } else {
                // 更新
                savedTournamentId = selectedTournamentId;
                await updateTournament({
                    orgId,
                    tournamentId: selectedTournamentId,
                    patch: {
                        tournamentName: formData.tournamentName,
                        tournamentDate: formData.tournamentDate as Date,
                        tournamentDetail: formData.tournamentDetail,
                        location: formData.location,
                        defaultMatchTime: formData.defaultMatchTime,
                        courts: formData.courts,
                        rounds: formData.rounds,
                        tournamentType: formData.tournamentType as "individual" | "team",
                        isTeamFormOpen: formData.isTeamFormOpen,
                    },
                });

                // アクティブな大会を更新している場合は、activeTournamentTypeも同期
                if (selectedTournamentId === activeTournamentId) {
                    setActiveTournament(selectedTournamentId, formData.tournamentType as "individual" | "team");
                }
            }

            // 保存成功
            showSuccess("端末に保存しました");

            // トースト表示のために少し待機
            await new Promise(resolve => setTimeout(resolve, 500));

            // 状態更新
            setSelectedTournamentId(savedTournamentId);
            setIsAddingNew(false);
            setFormData(prev => ({ ...prev, tournamentId: savedTournamentId }));

            // バックグラウンドで同期
            setTimeout(() => {
                syncTournamentToCloud(savedTournamentId, { showSuccessToast: true }).catch((err) => {
                    console.error("Background sync failed:", err);
                });
            }, 0);

        } catch (error) {
            console.error("保存に失敗", error);
            showError(error instanceof Error ? error.message : "保存に失敗しました");
        }
    }, [
        orgId,
        formData,
        selectedTournamentId,
        isAddingNew,
        tournaments.length,
        createTournament,
        updateTournament,
        syncTournamentToCloud,
        setActiveTournament,
        showError,
        showSuccess,
        activeTournamentId,
    ]);

    return {
        // 状態
        orgId,
        tournaments,
        isLoading,
        error,
        selectedTournamentId,
        isAddingNew: isAddingNew || !selectedTournamentId,
        formData,

        // アクション
        handleSelectTournament,
        handleStartNew,
        handleFormChange,
        handleSave,
    };
}
