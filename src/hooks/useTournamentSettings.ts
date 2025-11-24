import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuth } from "@/hooks/useAuth";
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

/**
 * 大会設定ページの状態管理フック
 */
export function useTournamentSettings() {
    const { showSuccess, showError } = useToast();
    const { user } = useAuth();
    const { activeTournamentId, setActiveTournament } = useActiveTournament();
    // ユーザーのUIDを組織IDとして使用
    const orgId = user?.uid || null;

    // React Query hooks
    const {
        data: tournaments = [],
        isLoading,
        error,
    } = useTournamentsByOrganization(orgId);

    const { mutate: createTournament } = useCreateTournament();
    const { mutate: updateTournament } = useUpdateTournamentByOrganization();

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
                | Date
                | null
                | { courtId: string; courtName: string }[]
        ) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        },
        []
    );

    // 大会保存処理
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
            if (!selectedTournamentId) {
                // 新規作成
                // createdAt/updatedAt を除外してデータを作成
                const {
                    createdAt: _createdAt,
                    updatedAt: _updatedAt,
                    tournamentId: _id,
                    ...dataForCreate
                } = formData;
                void _createdAt;
                void _updatedAt;
                void _id;

                // 作成前の大会数を保存しておく（onSuccess 実行時にはキャッシュがまだ更新されていないため）
                const wasEmpty = tournaments.length === 0;

                createTournament(
                    {
                        orgId,
                        tournamentData: {
                            ...dataForCreate,
                            tournamentDate: dataForCreate.tournamentDate as Date,
                        },
                    },
                    {
                        onSuccess: result => {
                            showSuccess("大会を作成しました");
                            setSelectedTournamentId(result.data.tournamentId);
                            setFormData(prev => ({
                                ...prev,
                                ...result.data,
                            }));

                            // 作成前に大会が0件だった場合のみ、新規作成した大会をアクティブに設定
                            if (wasEmpty && result.data.tournamentId) {
                                setActiveTournament(result.data.tournamentId, result.data.tournamentType);
                            }
                        },
                        onError: error => {
                            showError(
                                error instanceof Error
                                    ? error.message
                                    : "大会の作成に失敗しました"
                            );
                        },
                    }
                );
            } else {
                // 更新
                const {
                    createdAt: _createdAt,
                    updatedAt: _updatedAt,
                    tournamentId: _id,
                    ...dataForUpdate
                } = formData;
                void _createdAt;
                void _updatedAt;
                void _id;

                updateTournament(
                    {
                        orgId,
                        tournamentId: selectedTournamentId,
                        patch: {
                            ...dataForUpdate,
                            tournamentDate: dataForUpdate.tournamentDate as Date,
                        },
                    },
                    {
                        onSuccess: () => {
                            showSuccess("大会設定を更新しました");
                        },
                        onError: error => {
                            showError(
                                error instanceof Error ? error.message : "保存に失敗しました"
                            );
                        },
                    }
                );
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "保存に失敗しました");
        }
    }, [
        orgId,
        formData,
        selectedTournamentId,
        createTournament,
        updateTournament,
        showSuccess,
        showError,
        tournaments.length,
        setActiveTournament,
    ]);



    return {
        // 状態
        orgId,
        tournaments,
        isLoading,
        error,
        selectedTournamentId,
        isAddingNew: isAddingNew || !selectedTournamentId, // 明示的な新規作成フラグまたはID未選択
        formData,

        // アクション
        handleSelectTournament,
        handleStartNew,
        handleFormChange,
        handleSave,
    };
}
