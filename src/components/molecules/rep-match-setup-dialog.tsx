"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/atoms/card";
import { Users } from "lucide-react";
import { DialogOverlay } from "./dialog-overlay";
import { Team } from "@/types/team.schema";

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

    const handleConfirm = () => {
        if (selectedPlayerA && selectedPlayerB) {
            onConfirm(selectedPlayerA, selectedPlayerB);
            // リセット
            setSelectedPlayerA("");
            setSelectedPlayerB("");
        }
    };

    const handleCancel = () => {
        onCancel();
        // リセット
        setSelectedPlayerA("");
        setSelectedPlayerB("");
    };

    const isValid = selectedPlayerA && selectedPlayerB;

    return (
        <DialogOverlay isOpen={isOpen} onClose={handleCancel}>
            <Card className="w-full max-w-2xl mx-4">
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
                        <select
                            value={selectedPlayerA}
                            onChange={(e) => setSelectedPlayerA(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="">選手を選択してください</option>
                            {teamA.players.map((player) => (
                                <option key={player.playerId} value={player.playerId}>
                                    {player.displayName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team B 選手選択 */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-blue-600">
                            {teamB.teamName} の代表選手
                        </label>
                        <select
                            value={selectedPlayerB}
                            onChange={(e) => setSelectedPlayerB(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">選手を選択してください</option>
                            {teamB.players.map((player) => (
                                <option key={player.playerId} value={player.playerId}>
                                    {player.displayName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ボタン */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={handleCancel} className="flex-1">
                            キャンセル
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                            disabled={!isValid}
                        >
                            代表戦を開始
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </DialogOverlay>
    );
}
