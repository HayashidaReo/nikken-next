import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import {
    useTournamentsByOrganization,
    useCreateTournament,
    useUpdateTournamentByOrganization,
} from "@/queries/use-tournaments";
import { localTournamentRepository } from "@/repositories/local/tournament-repository";
import type { LocalTournament } from "@/lib/db";
import type { Tournament, TournamentFormData } from "@/types/tournament.schema";
import {
    createEmptyTournamentFormData,
    mapTournamentToFormData,
} from "@/lib/utils/tournament-operations";
import { validateTournamentForm } from "@/lib/utils/tournament-validation";

interface SyncConfirmState {
    isOpen: boolean;
    mode: "create" | "update";
    tempId?: string; // 新規作成時の一時ID
}

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

    const [syncConfirm, setSyncConfirm] = useState<SyncConfirmState>({
        isOpen: false,
        mode: "create",
    });

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
                | { roundId: string; roundName: string }[]
        ) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        },
        []
    );

    // 大会保存処理（ローカル保存 -> 同期確認）
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
                // 新規作成: 一時IDを生成してローカル保存
                const tempId = crypto.randomUUID();
                const {
                    createdAt: _createdAt,
                    updatedAt: _updatedAt,
                    tournamentId: _id,
                    ...dataForCreate
                } = formData;
                void _createdAt;
                void _updatedAt;
                void _id;

                const newTournament: LocalTournament = {
                    ...dataForCreate,
                    tournamentId: tempId,
                    organizationId: orgId,
                    tournamentDate: dataForCreate.tournamentDate as Date,
                    tournamentType: dataForCreate.tournamentType as "individual" | "team",
                    rounds: dataForCreate.rounds || [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                await localTournamentRepository.put(newTournament);
                showSuccess("端末に保存しました");

                // 同期確認ダイアログを表示
                setSyncConfirm({
                    isOpen: true,
                    mode: "create",
                    tempId: tempId,
                });

            } else {
                // 更新: 既存IDでローカル保存
                const {
                    createdAt: _createdAt,
                    updatedAt: _updatedAt,
                    tournamentId: _id,
                    ...dataForUpdate
                } = formData;
                void _createdAt;
                void _updatedAt;
                void _id;

                // 既存データのcreatedAtを保持するために取得
                const existing = await localTournamentRepository.getById(orgId, selectedTournamentId);
                const createdAt = existing?.createdAt || new Date();

                const updatedTournament: LocalTournament = {
                    ...dataForUpdate,
                    tournamentId: selectedTournamentId,
                    organizationId: orgId,
                    tournamentDate: dataForUpdate.tournamentDate as Date,
                    tournamentType: dataForUpdate.tournamentType as "individual" | "team",
                    rounds: dataForUpdate.rounds || [],
                    createdAt: createdAt,
                    updatedAt: new Date(),
                };

                await localTournamentRepository.put(updatedTournament);
                showSuccess("端末に保存しました");

                // 同期確認ダイアログを表示
                setSyncConfirm({
                    isOpen: true,
                    mode: "update",
                });
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "保存に失敗しました");
        }
    }, [
        orgId,
        formData,
        selectedTournamentId,
        showSuccess,
        showError,
    ]);

    // クラウド同期実行
    const handleSyncConfirm = useCallback(() => {
        if (!orgId) return;

        if (syncConfirm.mode === "create") {
            // 新規作成の同期
            const {
                createdAt: _createdAt,
                updatedAt: _updatedAt,
                tournamentId: _id,
                ...dataForCreate
            } = formData;
            void _createdAt;
            void _updatedAt;
            void _id;

            const wasEmpty = tournaments.length === 0;

            createTournament(
                {
                    orgId,
                    tournamentData: {
                        ...dataForCreate,
                        tournamentDate: dataForCreate.tournamentDate as Date,
                        tournamentType: dataForCreate.tournamentType as "individual" | "team",
                        rounds: dataForCreate.rounds || [],
                    },
                },
                {
                    onSuccess: async (result) => {
                        showSuccess("クラウドに同期しました");

                        // 一時IDのデータを削除（サーバーから正規IDのデータが来るため）
                        if (syncConfirm.tempId) {
                            await localTournamentRepository.delete(orgId, syncConfirm.tempId);
                        }

                        setSelectedTournamentId(result.data.tournamentId);
                        setFormData(prev => ({
                            ...prev,
                            ...result.data,
                        }));

                        if (wasEmpty && result.data.tournamentId) {
                            setActiveTournament(result.data.tournamentId, result.data.tournamentType);
                        }
                        setSyncConfirm({ isOpen: false, mode: "create" });
                    },
                    onError: error => {
                        showError(
                            error instanceof Error
                                ? error.message
                                : "クラウド同期に失敗しました"
                        );
                        setSyncConfirm({ isOpen: false, mode: "create" });
                    },
                }
            );
        } else {
            // 更新の同期
            if (!selectedTournamentId) return;

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
                        tournamentType: dataForUpdate.tournamentType as "individual" | "team",
                        rounds: dataForUpdate.rounds || [],
                    },
                },
                {
                    onSuccess: () => {
                        showSuccess("クラウドに同期しました");
                        setSyncConfirm({ isOpen: false, mode: "update" });
                    },
                    onError: error => {
                        showError(
                            error instanceof Error ? error.message : "クラウド同期に失敗しました"
                        );
                        setSyncConfirm({ isOpen: false, mode: "update" });
                    },
                }
            );
        }
    }, [
        orgId,
        syncConfirm,
        formData,
        selectedTournamentId,
        tournaments.length,
        createTournament,
        updateTournament,
        setActiveTournament,
        showSuccess,
        showError
    ]);

    const handleSyncCancel = useCallback(() => {
        setSyncConfirm(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        // 状態
        orgId,
        tournaments,
        isLoading,
        error,
        selectedTournamentId,
        isAddingNew: isAddingNew || !selectedTournamentId, // 明示的な新規作成フラグまたはID未選択
        formData,
        syncConfirm,

        // アクション
        handleSelectTournament,
        handleStartNew,
        handleFormChange,
        handleSave,
        handleSyncConfirm,
        handleSyncCancel,
    };
}
