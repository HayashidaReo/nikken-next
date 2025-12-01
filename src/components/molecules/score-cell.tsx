"use client";

import { TableCell } from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";
import { MatchScoreDisplay, MatchScoreDisplayProps } from "@/components/molecules/match-score-display";

interface ScoreCellProps extends MatchScoreDisplayProps {
    className?: string;
}

export function ScoreCell({
    className,
    ...props
}: ScoreCellProps) {
    return (
        <TableCell className={cn("py-1 px-3 text-center", className)}>
            <MatchScoreDisplay {...props} />
        </TableCell>
    );
}

export default ScoreCell;
