"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { useActiveTournament } from "@/hooks/useActiveTournament";
import { useTournamentsByOrganization } from "@/queries/use-tournaments";
import { useAuthStore } from "@/store/use-auth-store";
import { Tournament } from "@/types/tournament.schema";

interface TournamentSelectionDialogProps {
    /** ダイアログの表示状態 */
    open: boolean;
    /** ダイアログが閉じることができるかどうか（必須選択の場合はfalse） */
    dismissible?: boolean;
}

/**
 * 大会選択強制ダイアログコンポーネント
 * Organisms層：ビジネスロジックを持つ自己完結した機能コンポーネント
 * 
 * 要件：
 * - ログイン済みでもアクティブな大会IDがLocalStorageに存在しない場合に強制表示
 * - 大会を選択するまでは他の画面操作をブロック
 */
export function TournamentSelectionDialog({
    open,
    dismissible = false
}: TournamentSelectionDialogProps) {
    const { user } = useAuthStore();
    const { setActiveTournament } = useActiveTournament();
    const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

    // ユーザーのUIDを組織IDとして使用（大会設定画面と同じ実装）
    const orgId = user?.uid || null;

    const { data: tournaments = [], isLoading, error } = useTournamentsByOrganization(orgId);

    const handleConfirm = () => {
        if (selectedTournamentId) {
            setActiveTournament(selectedTournamentId);
        }
    };

    const selectedTournament = tournaments.find((t: Tournament) => t.tournamentId === selectedTournamentId);

    // デバッグ用ログ
    console.log("TournamentSelectionDialog Debug:", {
        selectedTournamentId,
        tournamentsLength: tournaments.length,
        isLoading,
        buttonDisabled: !selectedTournamentId || isLoading
    });

    if (!user) {
        return null; // 未ログイン時は表示しない
    }

    return (
        <Dialog open={open} onOpenChange={dismissible ? undefined : () => { }}>
            <DialogContent
                className="sm:max-w-md bg-white"
                onInteractOutside={dismissible ? undefined : (e) => e.preventDefault()}
                onEscapeKeyDown={dismissible ? undefined : (e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-center">大会を選択してください</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground text-center">
                        操作を続行するには大会を選択する必要があります。
                    </p>

                    {error && (
                        <div className="text-sm text-destructive text-center">
                            大会一覧の取得に失敗しました。
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">大会</label>
                        <Select
                            value={selectedTournamentId}
                            onValueChange={setSelectedTournamentId}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={isLoading ? "読み込み中..." : "大会を選択してください"}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {tournaments
                                    .filter((tournament: Tournament) => tournament.tournamentId)
                                    .map((tournament: Tournament) => (
                                        <SelectItem key={tournament.tournamentId} value={tournament.tournamentId!}>
                                            <div className="flex flex-col text-left">
                                                <span className="font-medium">{tournament.tournamentName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {tournament.tournamentDate} - {tournament.location}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                {tournaments.length === 0 && !isLoading && (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        利用可能な大会がありません
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedTournament && (
                        <div className="rounded-md border p-3 bg-white shadow-sm">
                            <h4 className="font-medium text-sm mb-1">選択中の大会</h4>
                            <p className="text-sm text-gray-700">
                                {selectedTournament.tournamentName}
                            </p>
                            <p className="text-xs text-gray-500">
                                {selectedTournament.tournamentDate} - {selectedTournament.location}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedTournamentId || isLoading}
                            className="w-full sm:w-auto"
                        >
                            この大会で続行
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}