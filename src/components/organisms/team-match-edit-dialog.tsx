"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { SearchableSelect } from "@/components/molecules/searchable-select";
import { PenaltyDisplay } from "@/components/molecules/penalty-display";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";
import type { TeamMatch, WinReason } from "@/types/match.schema";
import { winReasonEnum } from "@/types/match.schema";
import { useTeamMatchController } from "@/hooks/useTeamMatchController";

interface TeamMatchEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    match: TeamMatch;
    playerAName: string;
    playerBName: string;
    playerATeamName: string;
    playerBTeamName: string;
}

export function TeamMatchEditDialog({
    isOpen,
    onClose,
    match,
    playerAName,
    playerBName,
    playerATeamName,
    playerBTeamName,
}: TeamMatchEditDialogProps) {
    const { handleSaveMatchResult } = useTeamMatchController();

    const [winner, setWinner] = useState<"playerA" | "playerB" | "draw" | "none" | null>(match.winner);
    const [winReason, setWinReason] = useState<WinReason | null>(match.winReason);
    const [playerAScore, setPlayerAScore] = useState(match.players.playerA.score);
    const [playerBScore, setPlayerBScore] = useState(match.players.playerB.score);
    const [playerAHansoku, setPlayerAHansoku] = useState(match.players.playerA.hansoku);
    const [playerBHansoku, setPlayerBHansoku] = useState(match.players.playerB.hansoku);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWinner(match.winner);
            setWinReason(match.winReason);
            setPlayerAScore(match.players.playerA.score);
            setPlayerBScore(match.players.playerB.score);
            setPlayerAHansoku(match.players.playerA.hansoku);
            setPlayerBHansoku(match.players.playerB.hansoku);
        }
        // matchを依存配列から外して、編集中にリセットされないようにする
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSave = async () => {
        await handleSaveMatchResult({
            matchId: match.matchId || "",
            roundId: match.roundId,
            sortOrder: match.sortOrder,
            players: {
                playerA: {
                    ...match.players.playerA,
                    score: playerAScore,
                    hansoku: playerAHansoku,
                },
                playerB: {
                    ...match.players.playerB,
                    score: playerBScore,
                    hansoku: playerBHansoku,
                },
            },
            isCompleted: true, // 編集保存時は完了扱いとする
            winner: winner || "none",
            winReason: winReason || "none",
        });
        onClose();
    };

    const handleResetClick = () => {
        setShowResetConfirm(true);
    };

    const executeReset = async () => {
        await handleSaveMatchResult({
            matchId: match.matchId || "",
            roundId: match.roundId,
            sortOrder: match.sortOrder,
            players: {
                playerA: {
                    ...match.players.playerA,
                    score: 0,
                    hansoku: 0,
                },
                playerB: {
                    ...match.players.playerB,
                    score: 0,
                    hansoku: 0,
                },
            },
            isCompleted: false,
            winner: "none",
            winReason: "none",
        });
        setShowResetConfirm(false);
        onClose();
    };

    const scoreOptions = [
        { value: 0, label: "0" },
        { value: 1, label: "1" },
        { value: 2, label: "2" },
    ];

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px] bg-white p-0 overflow-hidden gap-0">
                    <DialogHeader className="border-b border-slate-100 p-6 bg-white">
                        <DialogTitle className="text-xl font-bold text-center text-slate-900">試合結果の編集</DialogTitle>
                    </DialogHeader>

                    <div className="p-8 space-y-8 bg-white">
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
                                    <div className="space-y-2 text-center">
                                        <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">スコア</Label>
                                        <div className="flex justify-center gap-1">
                                            {scoreOptions.map((opt) => (
                                                <Button
                                                    key={opt.value}
                                                    variant={playerAScore === opt.value ? "default" : "outline"}
                                                    className={`h-12 w-12 text-lg font-bold ${playerAScore === opt.value ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}
                                                    onClick={() => setPlayerAScore(opt.value)}
                                                >
                                                    {opt.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex flex-col items-center">
                                        <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">反則</Label>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center justify-center">
                                                <PenaltyDisplay hansokuCount={(playerAHansoku ?? 0) as HansokuLevel} variant="medium" />
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-slate-100 border border-slate-200"
                                                    onClick={() => setPlayerAHansoku(Math.min((playerAHansoku ?? 0) + 1, 4))}
                                                    disabled={(playerAHansoku ?? 0) >= 4}
                                                    type="button"
                                                >
                                                    <ChevronUp className="h-4 w-4 text-slate-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-slate-100 border border-slate-200"
                                                    onClick={() => setPlayerAHansoku(Math.max((playerAHansoku ?? 0) - 1, 0))}
                                                    disabled={(playerAHansoku ?? 0) <= 0}
                                                    type="button"
                                                >
                                                    <ChevronDown className="h-4 w-4 text-slate-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
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
                                    <div className="space-y-2 text-center">
                                        <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">スコア</Label>
                                        <div className="flex justify-center gap-1">
                                            {scoreOptions.map((opt) => (
                                                <Button
                                                    key={opt.value}
                                                    variant={playerBScore === opt.value ? "default" : "outline"}
                                                    className={`h-12 w-12 text-lg font-bold ${playerBScore === opt.value ? "bg-blue-600 text-white hover:bg-slate-900" : "bg-white text-slate-700"}`}
                                                    onClick={() => setPlayerBScore(opt.value)}
                                                >
                                                    {opt.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2 flex flex-col items-center">
                                        <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">反則</Label>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center justify-center">
                                                <PenaltyDisplay hansokuCount={(playerBHansoku ?? 0) as HansokuLevel} variant="medium" />
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-slate-100 border border-slate-200"
                                                    onClick={() => setPlayerBHansoku(Math.min((playerBHansoku ?? 0) + 1, 4))}
                                                    disabled={(playerBHansoku ?? 0) >= 4}
                                                    type="button"
                                                >
                                                    <ChevronUp className="h-4 w-4 text-slate-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-slate-100 border border-slate-200"
                                                    onClick={() => setPlayerBHansoku(Math.max((playerBHansoku ?? 0) - 1, 0))}
                                                    disabled={(playerBHansoku ?? 0) <= 0}
                                                    type="button"
                                                >
                                                    <ChevronDown className="h-4 w-4 text-slate-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 my-4"></div>

                        {/* 勝敗・決着理由 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-900">勝者</Label>
                                <SearchableSelect
                                    value={winner || "none"}
                                    onValueChange={(v) => setWinner(v as "playerA" | "playerB" | "draw" | "none")}
                                    options={[
                                        { value: "playerA", label: `${playerAName}` },
                                        { value: "playerB", label: `${playerBName}` },
                                        { value: "draw", label: "引き分け" },
                                        { value: "none", label: "なし" },
                                    ]}
                                    placeholder="勝者を選択"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-900">決着理由</Label>
                                <SearchableSelect
                                    value={winReason || "none"}
                                    onValueChange={(v) => setWinReason(v as WinReason)}
                                    options={winReasonEnum.options.map((reason) => ({
                                        value: reason,
                                        label: reason === "ippon" ? "一本" :
                                            reason === "hantei" ? "判定" :
                                                reason === "hansoku" ? "反則" :
                                                    reason === "fusen" ? "不戦" : "なし"
                                    }))}
                                    placeholder="決着理由を選択"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-slate-100 p-6 bg-slate-50 flex justify-between items-center w-full sm:justify-between">
                        <Button variant="ghost" onClick={handleResetClick} className="h-12 px-8 text-red-500 hover:text-red-700 hover:bg-red-50">リセット</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose} className="h-12 px-8 bg-white hover:bg-slate-50 text-slate-700 border-slate-200">キャンセル</Button>
                            <Button onClick={handleSave} className="h-12 px-8 bg-blue-600 text-white">保存する</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <DialogContent className="sm:max-w-[400px] bg-white">
                    <DialogHeader>
                        <DialogTitle>試合結果のリセット</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-slate-600">
                            試合結果をリセットしてもよろしいですか？<br />
                            この操作は取り消せません。
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResetConfirm(false)}>キャンセル</Button>
                        <Button variant="destructive" onClick={executeReset}>リセットする</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

