import * as React from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuth } from "@/hooks/useAuth";
import { useActiveTournament } from "@/hooks/useActiveTournament";
import {
    useTournamentsByOrganization,
    useCreateTournament,
    useUpdateTournamentByOrganization
} from "@/queries/use-tournaments";
import { useCreateOrganizationForUser } from "@/queries/use-organizations";
import type { Tournament, TournamentWithId } from "@/types/tournament.schema";

/**
 * 大会設定ページの状態管理フック
 * 複雑な大会操作ロジックを分離してコンポーネントを簡素化
 */
export function useTournamentSettings() {
    const { showSuccess, showError } = useToast();
    const { user } = useAuth();
    const { activeTournamentId } = useActiveTournament();
    // ユーザーのUIDを組織IDとして使用
    const orgId = user?.uid || null;

    // React Query hooks
    const {
        data: tournaments = [],
        isLoading,
        error,
    } = useTournamentsByOrganization(orgId);

    const { mutate: createOrganization, isPending: isCreatingOrg } = useCreateOrganizationForUser();
    const { mutate: createTournament } = useCreateTournament();
    const { mutate: updateTournament } = useUpdateTournamentByOrganization();

    // 状態管理 - 現在選択中の大会を初期値として設定
    const [selectedTournamentId, setSelectedTournamentId] = React.useState<string | null>(activeTournamentId);
    const [isAddingNew, setIsAddingNew] = React.useState(false);
    const [formData, setFormData] = React.useState<Tournament>({
        tournamentName: "",
        tournamentDate: "",
        location: "",
        defaultMatchTime: 180, // 3分 = 180秒
        courts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // 大会選択処理
    const handleSelectTournament = React.useCallback((tournament: Tournament) => {
        if (!tournament.tournamentId) return;

        setSelectedTournamentId(tournament.tournamentId);
        setIsAddingNew(false);
        setFormData({
            tournamentName: tournament.tournamentName,
            tournamentDate: tournament.tournamentDate,
            location: tournament.location,
            defaultMatchTime: tournament.defaultMatchTime,
            courts: tournament.courts,
            createdAt: tournament.createdAt,
            updatedAt: tournament.updatedAt,
        });
    }, []);

    // 現在選択中の大会を初期表示時に設定
    React.useEffect(() => {
        if (activeTournamentId && tournaments.length > 0 && !selectedTournamentId) {
            const activeTournament = tournaments.find((t: TournamentWithId) => t.tournamentId === activeTournamentId);
            if (activeTournament) {
                handleSelectTournament(activeTournament);
            }
        }
    }, [activeTournamentId, tournaments, selectedTournamentId, handleSelectTournament]);

    // 新規作成開始処理
    const handleStartNew = React.useCallback(() => {
        setIsAddingNew(true);
        setSelectedTournamentId(null);
        setFormData({
            tournamentName: "",
            tournamentDate: "",
            location: "",
            defaultMatchTime: 180,
            courts: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }, []);

    // フォームフィールド更新処理
    const handleFormChange = React.useCallback((field: keyof Tournament, value: string | number | Date | { courtId: string; courtName: string }[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // 大会保存処理
    const handleSave = React.useCallback(async () => {
        if (!orgId) {
            showError("組織IDが設定されていません");
            return;
        }

        if (!formData.tournamentName.trim()) {
            showError("大会名を入力してください");
            return;
        }

        try {
            if (isAddingNew) {
                // 新規作成
                const tournamentData = {
                    tournamentName: formData.tournamentName,
                    tournamentDate: formData.tournamentDate,
                    location: formData.location,
                    defaultMatchTime: formData.defaultMatchTime,
                    courts: formData.courts
                };
                createTournament(
                    { orgId, tournamentData },
                    {
                        onSuccess: (result) => {
                            showSuccess("大会を作成しました");
                            setIsAddingNew(false);
                            setSelectedTournamentId(result.data.tournamentId);
                            // 作成された大会のデータでフォームを更新
                            setFormData(prev => ({
                                ...prev,
                                ...result.data
                            }));
                        },
                        onError: (error) => {
                            showError(error instanceof Error ? error.message : "大会の作成に失敗しました");
                        }
                    }
                );
            } else if (selectedTournamentId) {
                // 更新
                updateTournament(
                    { orgId, tournamentId: selectedTournamentId, patch: formData },
                    {
                        onSuccess: () => {
                            showSuccess("大会設定を更新しました");
                        },
                        onError: (error) => {
                            showError(error instanceof Error ? error.message : "保存に失敗しました");
                        }
                    }
                );
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "保存に失敗しました");
        }
    }, [orgId, formData, isAddingNew, selectedTournamentId, createTournament, updateTournament, showSuccess, showError]);

    // 組織作成処理
    const handleCreateOrganization = React.useCallback(() => {
        createOrganization(undefined, {
            onSuccess: () => {
                showSuccess("組織を作成しました");
            },
            onError: (error: Error) => {
                showError(error instanceof Error ? error.message : "組織作成に失敗しました");
            }
        });
    }, [createOrganization, showSuccess, showError]);

    return {
        // 状態
        orgId,
        tournaments,
        isLoading,
        error,
        isCreatingOrg,
        selectedTournamentId,
        isAddingNew,
        formData,

        // アクション
        handleSelectTournament,
        handleStartNew,
        handleFormChange,
        handleSave,
        handleCreateOrganization,
    };
}