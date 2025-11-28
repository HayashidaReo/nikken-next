"use client";

import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { SCORE_OPTIONS } from "@/lib/constants";

interface ScoreSelectorProps {
    value: number;
    onChange: (value: number) => void;
}

export function ScoreSelector({ value, onChange }: ScoreSelectorProps) {
    return (
        <div className="space-y-2 text-center">
            <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">スコア</Label>
            <div className="flex justify-center gap-1">
                {SCORE_OPTIONS.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={value === opt.value ? "default" : "outline"}
                        className={`h-12 w-12 text-lg font-bold ${value === opt.value ? "bg-blue-600 text-white hover:bg-slate-900" : "bg-white text-slate-700"}`}
                        onClick={() => onChange(opt.value)}
                        type="button"
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
