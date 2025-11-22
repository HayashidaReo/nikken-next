"use client";

import { UseFormRegister, FieldError } from "react-hook-form";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { RemoveButton } from "./action-buttons";
import type { TeamFormData } from "@/types/team-form.schema";
import { cn } from "@/lib/utils/utils";

interface PlayerInputRowProps {
    index: number;
    register: UseFormRegister<TeamFormData>;
    error?: FieldError;
    onRemove: () => void;
    canRemove: boolean;
}

export function PlayerInputRow({
    index,
    register,
    error,
    onRemove,
    canRemove,
}: PlayerInputRowProps) {
    return (
        <div className="group relative flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all">
            <div className="flex-1">
                <Label
                    htmlFor={`players.${index}.fullName`}
                    className="text-xs font-medium text-gray-500 mb-1.5 block"
                >
                    選手名 {index + 1}{" "}
                    <span className="text-gray-400 font-normal ml-1">
                        （姓と名の間に半角スペース）
                    </span>
                </Label>
                <Input
                    {...register(`players.${index}.fullName`)}
                    id={`players.${index}.fullName`}
                    placeholder="例: 山田 太郎"
                    className={cn(
                        "bg-white",
                        error ? "" : "border-gray-200"
                    )}
                />
                {error && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        {error.message}
                    </p>
                )}
            </div>

            {canRemove && (
                <div className="pt-6">
                    <RemoveButton
                        onClick={onRemove}
                        className="h-10 w-10 p-0 rounded-full border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                    />
                </div>
            )}
        </div>
    );
}
