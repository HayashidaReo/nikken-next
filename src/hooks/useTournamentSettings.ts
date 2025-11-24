import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useTournamentsByOrganization } from "@/queries/use-tournaments";
import type { Tournament, TournamentFormData } from "@/types/tournament.schema";
import {
    createEmptyTournamentFormData,
    mapTournamentToFormData,
} from "@/lib/utils/tournament-operations";
import { validateTournamentForm } from "@/lib/utils/tournament-validation";
import { useTournamentPersistence } from "./useTournamentPersistence";

interface SyncConfirmState {
    isOpen: boolean;
    mode: "create" | "update";
    tempId?: string; // 新規作成時の一時ID
}

/**
 * 大会設定ページの状態管理フック
 */
export function useTournamentSettings() {
    const { showError } = useToast();
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

    const { saveToLocal, syncToCloud } = useTournamentPersistence();

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
            const result = await saveToLocal(formData, selectedTournamentId);

            if (result.success) {
                setSyncConfirm({
                    isOpen: true,
                    mode: result.mode,
                    tempId: result.tempId,
                });
            }
        } catch (error) {
            // エラーハンドリングはフック内で行われるため、ここでは何もしないか、必要に応じて追加処理を行う
            console.error("保存に失敗", error);
        }
    }, [
        orgId,
        formData,
        selectedTournamentId,
        showError,
        saveToLocal,
    ]);

    // クラウド同期実行
    const handleSyncConfirm = useCallback(() => {
        if (!orgId) return;

        const wasEmpty = tournaments.length === 0;

        syncToCloud(
            formData,
            selectedTournamentId,
            syncConfirm.mode,
            syncConfirm.tempId,
            // onSuccess
            (result) => {
                if (syncConfirm.mode === "create") {
                    setSelectedTournamentId(result.data.tournamentId);
                    setFormData(prev => ({
                        ...prev,
                        ...result.data,
                    }));

                    if (wasEmpty && result.data.tournamentId) {
                        setActiveTournament(result.data.tournamentId, result.data.tournamentType);
                    }
                }
                setSyncConfirm(prev => ({ ...prev, isOpen: false }));
            },
            // onError
            () => {
                setSyncConfirm(prev => ({ ...prev, isOpen: false }));
            }
        );
    }, [
        orgId,
        syncConfirm,
        formData,
        selectedTournamentId,
        tournaments.length,
        setActiveTournament,
        syncToCloud,
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
