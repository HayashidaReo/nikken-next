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
import type { Tournament, TournamentFormData } from "@/types/tournament.schema";

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

    // フォームデータ初期化ヘルパー
    const createEmptyFormData = React.useCallback((): TournamentFormData => ({
        tournamentName: "",
        tournamentDate: null, // 初期値は空白（null）
        tournamentDetail: "",
        location: "",
        defaultMatchTime: 180, // 3分 = 180秒
        courts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    }), []);

    // 状態管理
    const [selectedTournamentId, setSelectedTournamentId] = React.useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = React.useState(false); // 明示的に新規作成を選んだ状態
    const [formData, setFormData] = React.useState<TournamentFormData>(createEmptyFormData);

    // 大会選択処理
    const handleSelectTournament = React.useCallback((tournament: Tournament) => {
        if (!tournament.tournamentId) return;

        setIsAddingNew(false); // 明示的に選択したので新規作成ではない
        setSelectedTournamentId(tournament.tournamentId);
        // 大会選択時に即座にフォームデータを設定
        setFormData({
            tournamentName: tournament.tournamentName,
            tournamentDate: tournament.tournamentDate,
            tournamentDetail: tournament.tournamentDetail || "",
            location: tournament.location,
            defaultMatchTime: tournament.defaultMatchTime,
            courts: tournament.courts,
            createdAt: tournament.createdAt,
            updatedAt: tournament.updatedAt,
        });
    }, []);

    // activeTournamentId が非同期で読み込まれたタイミングで selectedTournamentId を更新
    React.useEffect(() => {
        // 新規作成を明示的に選んでいない場合のみ、activeTournamentId を反映
        if (!isAddingNew && activeTournamentId && !selectedTournamentId) {
            setSelectedTournamentId(activeTournamentId);
        }
    }, [activeTournamentId, selectedTournamentId, isAddingNew]);

    // 選択中の大会のフォームデータを設定
    React.useEffect(() => {
        if (selectedTournamentId && tournaments.length > 0 && !isAddingNew) {
            const activeTournament = tournaments.find((t: Tournament & { tournamentId?: string }) => t.tournamentId === selectedTournamentId);

            if (activeTournament) {
                // 既存大会を選択した場合は常にフォームデータを設定（開催日の初期値を含む）
                setFormData({
                    tournamentName: activeTournament.tournamentName,
                    tournamentDate: activeTournament.tournamentDate, // Date型の開催日を初期値として設定
                    tournamentDetail: activeTournament.tournamentDetail || "",
                    location: activeTournament.location,
                    defaultMatchTime: activeTournament.defaultMatchTime,
                    courts: activeTournament.courts,
                    createdAt: activeTournament.createdAt,
                    updatedAt: activeTournament.updatedAt,
                });
            }
        }
    }, [selectedTournamentId, tournaments, isAddingNew]);

    // 新規作成開始処理
    const handleStartNew = React.useCallback(() => {
        setIsAddingNew(true); // 明示的に新規作成フラグを立てる
        setSelectedTournamentId(null);
        setFormData(createEmptyFormData());
    }, [createEmptyFormData]);

    // フォームフィールド更新処理
    const handleFormChange = React.useCallback((field: keyof Tournament, value: string | number | Date | null | { courtId: string; courtName: string }[]) => {
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

        // 開催日が未設定の場合はエラー
        if (!formData.tournamentDate) {
            showError("開催日を入力してください");
            return;
        }

        try {
            if (!selectedTournamentId) {
                // 新規作成（selectedTournamentIdがnullの場合）
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { createdAt, updatedAt, ...formDataWithoutDates } = formData;
                const tournamentData = {
                    ...formDataWithoutDates,
                    tournamentDate: formData.tournamentDate as Date, // nullチェック済みなのでDate型として安全
                };
                createTournament(
                    { orgId, tournamentData },
                    {
                        onSuccess: (result) => {
                            showSuccess("大会を作成しました");
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
                const patchData = {
                    ...formData,
                    tournamentDate: formData.tournamentDate as Date, // nullチェック済みなのでDate型として安全
                };
                updateTournament(
                    { orgId, tournamentId: selectedTournamentId, patch: patchData },
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
    }, [orgId, formData, selectedTournamentId, createTournament, updateTournament, showSuccess, showError]);

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
        isAddingNew: isAddingNew || !selectedTournamentId, // 明示的な新規作成フラグまたはID未選択
        formData,

        // アクション
        handleSelectTournament,
        handleStartNew,
        handleFormChange,
        handleSave,
        handleCreateOrganization,
    };
}