"use client";

import { WIN_REASON_LABELS } from "@/lib/constants";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import {
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/atoms/card";
import type { Match, WinReason } from "@/types/match.schema";
import { winReasonEnum } from "@/types/match.schema";
import { useMatchEditForm } from "@/hooks/useMatchEditForm";
import { SearchableSelect } from "../molecules/searchable-select";
import { ModalDialog } from "../molecules/modal-dialog";
import { ScoreSelector } from "../molecules/score-selector";
import { PenaltySelector } from "../molecules/penalty-selector";

interface MatchEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    match: Match;
    playerAName: string;
    playerBName: string;
    playerATeamName: string;
    playerBTeamName: string;
}

export function MatchEditDialog({
    isOpen,
    onClose,
    match,
    playerAName,
    playerBName,
    playerATeamName,
    playerBTeamName,
}: MatchEditDialogProps) {
    const { formState, setters, actions } = useMatchEditForm({
        match,
        isOpen,
        onClose,
    });

    const {
        winner,
        winReason,
        playerAScore,
        playerBScore,
        playerAHansoku,
        playerBHansoku,
        showResetConfirm,
    } = formState;

    const {
        setWinner,
        setWinReason,
        setPlayerAScore,
        setPlayerBScore,
        setPlayerAHansoku,
        setPlayerBHansoku,
    } = setters;

    const {
        handleSave,
        handleResetClick,
        executeReset,
        closeResetConfirm,
    } = actions;

    const winnerOptions = [
        { value: "none", label: "なし" },
        { value: "playerA", label: playerAName },
        { value: "playerB", label: playerBName },
        { value: "draw", label: "引き分け" },
    ];

    const winReasonOptions = [
        { value: "none", label: "なし" },
        ...winReasonEnum.options
            .filter(reason => reason !== "none")
            .map((reason) => ({
                value: reason,
                label: WIN_REASON_LABELS[reason]
            }))
    ];

    return (
        <>
            <ModalDialog isOpen={isOpen && !showResetConfirm} onClose={onClose} className="max-w-3xl">
                <CardHeader className="text-center border-b border-slate-100 p-6 bg-white">
                    <CardTitle className="text-xl font-bold text-slate-900">試合結果の編集</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-8 bg-white">
                    {/* スコア入力エリア */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-start">
                        {/* 選手A */}
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-xs text-slate-500 font-bold mb-1">{playerATeamName}</div>
                                <Label className="text-xl font-bold text-slate-900 block">
                                    {playerAName}
                                </Label>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl space-y-6 border border-slate-100">
                                <ScoreSelector
                                    value={playerAScore}
                                    onChange={setPlayerAScore}
                                />
                                <PenaltySelector
                                    value={playerAHansoku ?? 0}
                                    onChange={setPlayerAHansoku}
                                />
                            </div>
                        </div>

                        {/* VS */}
                        <div className="flex flex-col items-center justify-center pt-12">
                            <span className="text-3xl font-black text-slate-300 italic">VS</span>
                        </div>

                        {/* 選手B */}
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-xs text-slate-500 font-bold mb-1">{playerBTeamName}</div>
                                <Label className="text-xl font-bold text-slate-900 block">
                                    {playerBName}
                                </Label>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl space-y-6 border border-slate-100">
                                <ScoreSelector
                                    value={playerBScore}
                                    onChange={setPlayerBScore}
                                />
                                <PenaltySelector
                                    value={playerBHansoku ?? 0}
                                    onChange={setPlayerBHansoku}
                                />
                            </div>
                        </div>
                    </div>


                    {/* 勝敗・決着理由 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-900">勝者</Label>
                            <SearchableSelect
                                value={winner || "none"}
                                onValueChange={(val) => setWinner(val as "playerA" | "playerB" | "draw" | "none")}
                                options={winnerOptions}
                                placeholder="勝者を選択してください"
                                searchPlaceholder="勝者で検索..."
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-900">決着理由</Label>
                            <SearchableSelect
                                value={winReason || "none"}
                                onValueChange={(val) => setWinReason(val as WinReason)}
                                options={winReasonOptions}
                                placeholder="決着理由を選択してください"
                                searchPlaceholder="決着理由で検索..."
                                className="h-10"
                            />
                        </div>
                    </div>

                    {/* ボタン */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <Button variant="ghost" onClick={handleResetClick} className="h-12 px-8 text-red-500 hover:text-red-700 hover:bg-red-50">リセット</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose} className="h-12 px-8 bg-white hover:bg-slate-50 text-slate-700 border-slate-200">キャンセル</Button>
                            <Button onClick={handleSave} className="h-12 px-8 bg-blue-600 text-white">保存する</Button>
                        </div>
                    </div>
                </CardContent>
            </ModalDialog>

            <ModalDialog isOpen={showResetConfirm} onClose={closeResetConfirm} className="max-w-md">
                <CardHeader>
                    <CardTitle>試合結果のリセット</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-600">
                        試合結果をリセットしてもよろしいですか？<br />
                        この操作は取り消せません。
                    </p>
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={closeResetConfirm} className="flex-1">キャンセル</Button>
                        <Button variant="destructive" onClick={executeReset} className="flex-1">リセットする</Button>
                    </div>
                </CardContent>
            </ModalDialog>
        </>
    );
}
