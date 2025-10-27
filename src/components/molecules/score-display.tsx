import * as React from "react";

interface ScoreDisplayProps {
    score: number;
    className?: string;
}

export function ScoreDisplay({ score, className = "" }: ScoreDisplayProps) {
    return (
        <div className={`w-60 text-right ${className}`}>
            <div className="text-[12rem] font-black leading-none">
                {score}
            </div>
        </div>
    );
}