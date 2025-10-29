"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { useActiveTournament } from "@/hooks/useActiveTournament";
import { useTournamentsByOrganization } from "@/queries/use-tournaments";
import { useAuthStore } from "@/store/use-auth-store";
import { Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { Tournament } from "@/types/tournament.schema";

interface TournamentSelectorProps {
    className?: string;
    onManageClick?: () => void;
}

/**
 * ヘッダー用の大会選択ドロップダウンコンポーネント
 * Molecules層：Selectコンポーネント(Atom)を組み合わせた機能単位
 */
export function TournamentSelector({ className, onManageClick }: TournamentSelectorProps) {
    const { user } = useAuthStore();
    const { activeTournamentId, setActiveTournament } = useActiveTournament();

    // ユーザーのUIDを組織IDとして使用（大会設定画面と同じ実装）
    const orgId = user?.uid || null;

    const { data: tournaments = [], isLoading, error } = useTournamentsByOrganization(orgId);

    // 現在選択中の大会を見つける
    const selectedTournament = tournaments.find((t: Tournament) => t.tournamentId === activeTournamentId);

    const handleTournamentChange = (value: string) => {
        if (value === "manage") {
            onManageClick?.();
            return;
        }
        setActiveTournament(value);
    };

    if (!user) {
        return null; // 未ログイン時は表示しない
    }

    if (error) {
        return (
            <div className={cn("text-sm text-destructive", className)}>
                大会一覧の取得に失敗しました
            </div>
        );
    }

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            {/* 大会名表示（選択されている場合） */}
            {selectedTournament && (
                <span className="text-sm font-medium text-foreground">
                    {selectedTournament.tournamentName}
                </span>
            )}

            {/* 大会選択ドロップダウン */}
            <Select
                value={activeTournamentId || ""}
                onValueChange={handleTournamentChange}
                disabled={isLoading}
            >
                <SelectTrigger className="w-auto min-w-[200px] h-8">
                    <div className="flex items-center space-x-1">
                        <SelectValue
                            placeholder={isLoading ? "読み込み中..." : "大会を選択"}
                        />
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {tournaments.map((tournament: Tournament) => (
                        <SelectItem key={tournament.tournamentId} value={tournament.tournamentId!}>
                            <div className="flex flex-col">
                                <span className="font-medium">{tournament.tournamentName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {tournament.tournamentDate} - {tournament.location}
                                </span>
                            </div>
                        </SelectItem>
                    ))}

                    {tournaments.length > 0 && <hr className="my-1" />}

                    {/* 大会管理メニュー */}
                    <SelectItem value="manage" className="text-muted-foreground">
                        <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>大会を管理...</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}