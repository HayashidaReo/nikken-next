"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { useTournaments, useDeleteTournament } from "@/queries/use-tournaments";
import { useToast } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import type { Tournament } from "@/types/tournament.schema";
import { cn } from "@/lib/utils/utils";

interface TournamentListProps {
    selectedTournamentId: string | null;
    onTournamentSelect: (tournament: Tournament) => void;
    onNewTournament: () => void;
    className?: string;
}

export function TournamentList({
    selectedTournamentId,
    onTournamentSelect,
    onNewTournament,
    className,
}: TournamentListProps) {
    const { data: tournaments = [], isLoading, error } = useTournaments();
    const { mutate: deleteTournament, isPending: isDeleting } = useDeleteTournament();
    const { showSuccess, showError } = useToast();
    const [deleteConfirm, setDeleteConfirm] = React.useState<{
        isOpen: boolean;
        tournament: Tournament | null;
    }>({ isOpen: false, tournament: null });

    const handleDeleteClick = (tournament: Tournament, e: React.MouseEvent) => {
        e.stopPropagation(); // カード選択を防ぐ
        setDeleteConfirm({ isOpen: true, tournament });
    };

    const handleDeleteConfirm = () => {
        if (!deleteConfirm.tournament?.tournamentId) return;

        deleteTournament(deleteConfirm.tournament.tournamentId, {
            onSuccess: () => {
                showSuccess(`「${deleteConfirm.tournament?.tournamentName}」を削除しました`);
                setDeleteConfirm({ isOpen: false, tournament: null });
            },
            onError: (error) => {
                showError(`大会の削除に失敗しました: ${error.message}`);
            },
        });
    };

    if (isLoading) {
        return (
            <div className={cn("space-y-4", className)}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">大会一覧</h2>
                </div>
                <div className="flex justify-center py-8">
                    <div className="text-gray-600">大会一覧を読み込み中...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("space-y-4", className)}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">大会一覧</h2>
                </div>
                <div className="flex justify-center py-8">
                    <div className="text-red-600">
                        大会一覧の読み込みに失敗しました: {error.message}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">大会一覧</h2>
                <Button onClick={onNewTournament} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    新しい大会を追加
                </Button>
            </div>

            <div className="space-y-3">
                {tournaments.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-gray-500 mb-4">まだ大会が作成されていません</p>
                            <Button onClick={onNewTournament} variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                最初の大会を作成
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    tournaments.map((tournament: Tournament) => (
                        <Card
                            key={tournament.tournamentId}
                            className={cn(
                                "cursor-pointer transition-all duration-200 hover:shadow-md",
                                selectedTournamentId === tournament.tournamentId
                                    ? "ring-2 ring-blue-500 bg-blue-50"
                                    : "hover:bg-gray-50"
                            )}
                            onClick={() => onTournamentSelect(tournament)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base font-medium truncate">
                                            {tournament.tournamentName}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {tournament.tournamentDate}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                {tournament.courts.length}コート
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleDeleteClick(tournament, e)}
                                        disabled={isDeleting}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-gray-600 truncate">
                                    {tournament.location}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onCancel={() => setDeleteConfirm({ isOpen: false, tournament: null })}
                onConfirm={handleDeleteConfirm}
                title="大会を削除"
                message={`「${deleteConfirm.tournament?.tournamentName}」を削除してもよろしいですか？この操作は元に戻せません。`}
                confirmText="削除"
                cancelText="キャンセル"
                variant="destructive"
            />
        </div>
    );
}