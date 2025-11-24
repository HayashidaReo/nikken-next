import { useCallback } from "react";
import { useToast } from "@/components/providers/notification-provider";
import { useAuth } from "@/hooks/useAuth";
import {
    useCreateTournament,
    useUpdateTournamentByOrganization,
} from "@/queries/use-tournaments";
import { localTournamentRepository } from "@/repositories/local/tournament-repository";
import type { LocalTournament } from "@/lib/db";
import type { Tournament, TournamentFormData } from "@/types/tournament.schema";

interface SaveResult {
    success: boolean;
    mode: "create" | "update";
    tempId?: string;
}

export function useTournamentPersistence() {
    const { showSuccess, showError } = useToast();
    const { user } = useAuth();
    const orgId = user?.uid || null;

    const { mutate: createTournament } = useCreateTournament();
    const { mutate: updateTournament } = useUpdateTournamentByOrganization();

    // ローカル保存処理
    const saveToLocal = useCallback(async (
        formData: TournamentFormData,
        selectedTournamentId: string | null
    ): Promise<SaveResult> => {
        if (!orgId) {
            throw new Error("組織IDが設定されていません");
        }

        try {
            if (!selectedTournamentId) {
                // 新規作成: 一時IDを生成してローカル保存
                const tempId = crypto.randomUUID();

                // createdAt, updatedAt, tournamentId は新規作成時に自動生成されるため除外
                const dataForCreate = { ...formData };
                delete dataForCreate.createdAt;
                delete dataForCreate.updatedAt;
                delete (dataForCreate as Partial<TournamentFormData>).tournamentId;

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

                return { success: true, mode: "create", tempId };
            } else {
                // 更新: 既存IDでローカル保存
                const dataForUpdate = { ...formData };
                delete dataForUpdate.createdAt;
                delete dataForUpdate.updatedAt;
                delete (dataForUpdate as Partial<TournamentFormData>).tournamentId;

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

                return { success: true, mode: "update" };
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "保存に失敗しました");
            throw error;
        }
    }, [orgId, showSuccess, showError]);

    // クラウド同期処理
    const syncToCloud = useCallback((
        formData: TournamentFormData,
        selectedTournamentId: string | null,
        mode: "create" | "update",
        tempId?: string,
        onSuccess?: (result: { data: Tournament }) => void,
        onError?: (error: unknown) => void
    ) => {
        if (!orgId) return;

        if (mode === "create") {
            // 新規作成の同期
            // createdAt, updatedAt, tournamentId はサーバー側で生成されるため除外
            const dataForCreate = { ...formData };
            delete dataForCreate.createdAt;
            delete dataForCreate.updatedAt;
            delete (dataForCreate as Partial<TournamentFormData>).tournamentId;

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
                        if (tempId) {
                            await localTournamentRepository.delete(orgId, tempId);
                        }

                        if (onSuccess) onSuccess(result);
                    },
                    onError: error => {
                        showError(
                            error instanceof Error
                                ? error.message
                                : "クラウド同期に失敗しました"
                        );
                        if (onError) onError(error);
                    },
                }
            );
        } else {
            // 更新の同期
            if (!selectedTournamentId) return;

            const dataForUpdate = { ...formData };
            delete dataForUpdate.createdAt;
            delete dataForUpdate.updatedAt;
            delete (dataForUpdate as Partial<TournamentFormData>).tournamentId;

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
                    onSuccess: (result) => {
                        showSuccess("クラウドに同期しました");
                        if (onSuccess) onSuccess(result);
                    },
                    onError: error => {
                        showError(
                            error instanceof Error ? error.message : "クラウド同期に失敗しました"
                        );
                        if (onError) onError(error);
                    },
                }
            );
        }
    }, [orgId, createTournament, updateTournament, showSuccess, showError]);

    return {
        saveToLocal,
        syncToCloud,
    };
}
