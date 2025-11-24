"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { TEXT_LENGTH_LIMITS } from "@/lib/constants";
import { useToast } from "@/components/providers/notification-provider";
import { AnimatePresence } from "framer-motion";
import { AnimatedListItem } from "@/components/atoms/animated-list-item";

interface Round {
    roundId: string;
    roundName: string;
}

interface RoundManagerProps {
    rounds: Round[];
    onChange: (rounds: Round[]) => void;
    className?: string;
}

// 5桁のランダムUID生成
function generateRoundId(): string {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
}

export function RoundManager({
    rounds,
    onChange,
    className,
}: RoundManagerProps) {
    const { showWarning } = useToast();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleAddRound = () => {
        const newRound: Round = {
            roundId: generateRoundId(),
            roundName: "",
        };
        onChange([...rounds, newRound]);
    };

    const handleRemoveRound = (index: number) => {
        const newRounds = rounds.filter((_, i) => i !== index);
        onChange(newRounds);
    };

    const handleRoundNameChange = (index: number, name: string) => {
        if (name.length > TEXT_LENGTH_LIMITS.ROUND_NAME_MAX) {
            showWarning(`ラウンド名は${TEXT_LENGTH_LIMITS.ROUND_NAME_MAX}文字以内で入力してください`);
            return;
        }
        const newRounds = rounds.map((round, i) =>
            i === index ? { ...round, roundName: name } : round
        );
        onChange(newRounds);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (
            draggedIndex !== null &&
            dragOverIndex !== null &&
            draggedIndex !== dragOverIndex
        ) {
            const newRounds = Array.from(rounds);
            const [draggedItem] = newRounds.splice(draggedIndex, 1);
            newRounds.splice(dragOverIndex, 0, draggedItem);
            onChange(newRounds);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    return (
        <div className={className}>
            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {rounds.map((round, index) => (
                        <AnimatedListItem
                            key={round.roundId}
                            draggable
                            onDragStart={e => handleDragStart(e, index)}
                            onDragOver={e => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragLeave={handleDragLeave}
                            className={`flex gap-3 items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md ${draggedIndex === index ? "opacity-50" : ""
                                } ${dragOverIndex === index ? "bg-blue-50 border-blue-200" : ""}`}
                        >
                            {/* ドラッグハンドル */}
                            <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            {/* ラウンド名入力 */}
                            <div className="flex-1">
                                <Input
                                    value={round.roundName}
                                    onChange={e => handleRoundNameChange(index, e.target.value)}
                                    placeholder="例: 1回戦, 決勝戦"
                                    className="w-full"
                                    maxLength={TEXT_LENGTH_LIMITS.ROUND_NAME_MAX}
                                />
                            </div>

                            {/* 削除ボタン */}
                            <Button
                                type="button"
                                onClick={() => handleRemoveRound(index)}
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AnimatedListItem>
                    ))}
                </AnimatePresence>

                {/* リストの最後尾にラウンド追加ボタンを配置 */}
                <div className="mt-2">
                    <Button
                        type="button"
                        onClick={handleAddRound}
                        variant="outline"
                        size="sm"
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        ラウンド追加
                    </Button>
                </div>
            </div>
        </div>
    );
}
