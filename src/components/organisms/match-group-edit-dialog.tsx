"use client";

import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { Switch } from "@/components/atoms/switch";
import {
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/atoms/card";
import type { MatchGroup } from "@/types/match.schema";
import { useMatchGroupEditForm } from "@/hooks/useMatchGroupEditForm";
import { SearchableSelect } from "../molecules/searchable-select";
import { ModalDialog } from "../molecules/modal-dialog";

interface MatchGroupEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    matchGroup: MatchGroup;
    teamAName: string;
    teamBName: string;
}

export function MatchGroupEditDialog({
    isOpen,
    onClose,
    matchGroup,
    teamAName,
    teamBName,
}: MatchGroupEditDialogProps) {
    const { formState, setters, actions } = useMatchGroupEditForm({
        matchGroup,
        isOpen,
        onClose,
    });

    const { winnerTeam, isCompleted } = formState;
    const { setWinnerTeam, setIsCompleted } = setters;
    const { handleSave } = actions;

    const winnerOptions = [
        { value: "teamA", label: teamAName },
        { value: "teamB", label: teamBName },
    ];

    return (
        <ModalDialog isOpen={isOpen} onClose={onClose} className="max-w-xl">
            <CardHeader className="text-center border-b border-slate-100 p-6 bg-white">
                <CardTitle className="text-xl font-bold text-slate-900">試合結果の編集</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-8 bg-white">
                <div className="space-y-6">
                    {/* 勝者選択 */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-900">勝者チーム</Label>
                        <SearchableSelect
                            value={winnerTeam || ""}
                            onValueChange={(val) => setWinnerTeam(val as "teamA" | "teamB" | undefined)}
                            options={winnerOptions}
                            placeholder="勝者チームを選択してください"
                            searchPlaceholder="チーム名で検索..."
                            className="h-10"
                        />
                    </div>

                    {/* 完了フラグ */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold text-slate-900">試合完了</Label>
                            <p className="text-xs text-slate-500">この試合を完了としてマークします</p>
                        </div>
                        <Switch
                            checked={isCompleted}
                            onCheckedChange={setIsCompleted}
                        />
                    </div>
                </div>

                {/* ボタン */}
                <div className="flex justify-end items-center pt-4 border-t border-slate-100 gap-2">
                    <Button variant="outline" onClick={onClose} className="h-12 px-8 bg-white hover:bg-slate-50 text-slate-700 border-slate-200">キャンセル</Button>
                    <Button onClick={handleSave} className="h-12 px-8 bg-blue-600 text-white">保存する</Button>
                </div>
            </CardContent>
        </ModalDialog>
    );
}
