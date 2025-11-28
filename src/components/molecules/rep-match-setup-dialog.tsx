"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import {
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/atoms/card";
import { Users } from "lucide-react";
import { ModalDialog } from "./modal-dialog";
import { Team } from "@/types/team.schema";
import { SearchableSelect } from "./searchable-select";
import { ShortcutBadge } from "@/components/atoms/shortcut-badge";

/**
 * 代表戦の選手設定ダイアログ
 * 
 * @description
 * 5試合終了後に同点となった場合、代表戦の出場選手を選択するためのダイアログ。
 * 各チームから1名ずつ代表選手を選択し、代表戦（roundId='6'）を作成する。
 * 
 * @param props.isOpen - ダイアログの表示状態
 * @param props.teamA - チームA の情報
 * @param props.teamB - チームB の情報
 * @param props.onConfirm - 選手選択確定時のコールバック
 * @param props.onCancel - キャンセル時のコールバック
 */
interface RepMatchSetupDialogProps {
    isOpen: boolean;
    teamA: Team;
    teamB: Team;
    onConfirm: (playerAId: string, playerBId: string) => void;
    onCancel: () => void;
}

export function RepMatchSetupDialog({
    isOpen,
    teamA,
    teamB,
    onConfirm,
    onCancel,
}: RepMatchSetupDialogProps) {
    const [selectedPlayerA, setSelectedPlayerA] = useState<string>("");
    const [selectedPlayerB, setSelectedPlayerB] = useState<string>("");

    const handleConfirm = useCallback(() => {
        if (selectedPlayerA && selectedPlayerB) {
            onConfirm(selectedPlayerA, selectedPlayerB);
            // リセット
            setSelectedPlayerA("");
            setSelectedPlayerB("");
        }
    }, [selectedPlayerA, selectedPlayerB, onConfirm]);

    const handleCancel = () => {
        onCancel();
        // リセット
        setSelectedPlayerA("");
        setSelectedPlayerB("");
    };

    const isValid = selectedPlayerA && selectedPlayerB;

    // Enterキーでの確定処理
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && isValid) {
                e.preventDefault();
                handleConfirm();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isValid, handleConfirm]);

    // チームAの選手オプション
    const teamAOptions = teamA.players.map((player) => ({
        value: player.playerId,
        label: player.displayName,
    }));

    // チームBの選手オプション
    const teamBOptions = teamB.players.map((player) => ({
        value: player.playerId,
        label: player.displayName,
    }));

    return (
        <ModalDialog isOpen={isOpen} onClose={handleCancel} className="max-w-2xl">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-purple-100">
                        <Users className="h-8 w-8 text-purple-600" />
                    </div>
                </div>
                <CardTitle className="text-xl">代表戦の選手を選択</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                    5試合が同点で終了しました。代表戦を行う選手を各チームから選択してください。
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Team A 選手選択 */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-red-600">
                        {teamA.teamName} の代表選手
                    </label>
                    <SearchableSelect
                        value={selectedPlayerA}
                        onValueChange={setSelectedPlayerA}
                        options={teamAOptions}
                        placeholder="選手を選択してください"
                        searchPlaceholder="選手名で検索..."
                        className="h-10"
                    />
                </div>

                {/* Team B 選手選択 */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-blue-600">
                        {teamB.teamName} の代表選手
                    </label>
                    <SearchableSelect
                        value={selectedPlayerB}
                        onValueChange={setSelectedPlayerB}
                        options={teamBOptions}
                        placeholder="選手を選択してください"
                        searchPlaceholder="選手名で検索..."
                        className="h-10"
                    />
                </div>

                {/* ボタン */}
                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={handleCancel} className="flex-1">
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
                        disabled={!isValid}
                    >
                        代表戦を開始
                        {isValid && <ShortcutBadge shortcut="Enter" className="!bg-white/20 !text-white !border-white/30" />}
                    </Button>
                </div>
            </CardContent>
        </ModalDialog>
    );
}
