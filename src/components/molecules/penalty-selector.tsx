"use client";

import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { PenaltyDisplay } from "@/components/molecules/penalty-display";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { HansokuLevel } from "@/lib/utils/penalty-utils";

interface PenaltySelectorProps {
    value: number;
    onChange: (value: number) => void;
}

export function PenaltySelector({ value, onChange }: PenaltySelectorProps) {
    const handleIncrement = () => {
        onChange(Math.min(value + 1, 4));
    };

    const handleDecrement = () => {
        onChange(Math.max(value - 1, 0));
    };

    return (
        <div className="space-y-2 flex flex-col items-center">
            <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">反則</Label>
            <div className="grid grid-cols-3 items-center w-full">
                <div></div>
                <div className="flex items-center justify-center">
                    <PenaltyDisplay hansokuCount={value as HansokuLevel} variant="medium" />
                </div>
                <div className="flex flex-col gap-1 justify-start">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-slate-100 border border-slate-200"
                        onClick={handleIncrement}
                        disabled={value >= 4}
                        type="button"
                    >
                        <ChevronUp className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-slate-100 border border-slate-200"
                        onClick={handleDecrement}
                        disabled={value <= 0}
                        type="button"
                    >
                        <ChevronDown className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
