"use client";

import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/atoms/select";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { formatDateForDisplay } from "@/lib/utils/date-utils";
import type { Tournament } from "@/types/tournament.schema";

export interface TournamentSelectDropdownProps {
    /** 大会リスト */
    tournaments: Tournament[];
    /** 現在選択中の大会ID */
    selectedId?: string;
    /** 大会選択時のコールバック */
    onSelect: (tournamentId: string) => void;
    /** ローディング状態 */
    isLoading?: boolean;
    /** エラー状態 */
    isError?: boolean;
    /** プレースホルダー */
    placeholder?: string;
    /** 選択済みの大会を trigger に表示するかどうか（header用） */
    showSelectedDetails?: boolean;
    /** トリガーのカスタムクラス */
    triggerClassName?: string;
    /** コンテンツの最小幅 */
    contentMinWidth?: string;
    /** disabled 状態 */
    disabled?: boolean;
    /** 追加のアクションメニュー項目 */
    actions?: {
        value: string;
        label: string;
        icon?: React.ElementType;
    }[];
}

/**
 * 大会選択ドロップダウンコンポーネント
 * Atoms層：再利用可能な基本UI要素
 *
 * TournamentSelector（ヘッダー）と TournamentSelectionDialog で共通使用
 */
export function TournamentSelectDropdown({
    tournaments,
    selectedId,
    onSelect,
    isLoading = false,
    isError = false,
    placeholder = "大会を選択してください",
    showSelectedDetails = true,
    triggerClassName,
    contentMinWidth = "min-w-[280px]",
    disabled = false,
    actions,
}: TournamentSelectDropdownProps) {
    // 選択中の大会を取得
    const selectedTournament = tournaments.find(
        (t: Tournament) => t.tournamentId === selectedId
    );

    return (
        <Select
            value={selectedId || ""}
            onValueChange={onSelect}
            disabled={disabled || isLoading || isError}
        >
            <SelectTrigger
                className={cn("w-full border-gray-200 py-6 px-4", triggerClassName)}
            >
                {selectedTournament ? (
                    <div className="flex flex-col items-start gap-0.5 w-full">
                        <span className="font-semibold text-gray-900 text-sm leading-tight">
                            {selectedTournament.tournamentName}
                        </span>
                        {showSelectedDetails && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-gray-500" />
                                    {formatDateForDisplay(selectedTournament.tournamentDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-gray-500" />
                                    {selectedTournament.location}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-left w-full text-gray-500">
                        {isLoading ? "読み込み中..." : placeholder}
                    </div>
                )}
            </SelectTrigger>
            <SelectContent className={cn("border-none shadow-lg", contentMinWidth)}>
                <div className="py-1">
                    {tournaments
                        .filter((tournament: Tournament) => tournament.tournamentId)
                        .map((tournament: Tournament) => (
                            <SelectItem
                                key={tournament.tournamentId}
                                value={tournament.tournamentId!}
                                className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 rounded-md"
                            >
                                <div className="flex flex-col py-1">
                                    <span className="font-semibold text-gray-900 text-sm leading-snug">
                                        {tournament.tournamentName}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                                        <span className="flex items-center gap-0.5">
                                            <Calendar className="h-3 w-3 text-gray-500" />
                                            {formatDateForDisplay(tournament.tournamentDate)}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <MapPin className="h-3 w-3 text-gray-500" />
                                            {tournament.location}
                                        </span>
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
                    {tournaments.length === 0 && !isLoading && !isError && (
                        <div className="p-2 text-sm text-center text-gray-500">
                            <p className="font-medium">利用可能な大会がありません</p>
                        </div>
                    )}
                </div>
                {/* フッターアクション（大会管理メニュー） */}
                {actions && actions.length > 0 && (
                    <div className="bg-gray-50 mt-1 pt-1 pb-0.5">
                        {actions.map((action) => (
                            <SelectItem
                                key={action.value}
                                value={action.value}
                                className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 cursor-pointer rounded-md"
                            >
                                <div className="flex items-center space-x-2 py-1.5">
                                    {action.icon && <action.icon className="h-4 w-4" />}
                                    <span className="font-medium">{action.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </div>
                )}
            </SelectContent>
        </Select>
    );
}
