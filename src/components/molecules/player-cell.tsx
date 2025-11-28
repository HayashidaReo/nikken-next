"use client";

import { TableCell } from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";

interface PlayerCellProps {
    text: string;
    title?: string;
    subText?: string;
    colorClass?: string;
    className?: string;
}

export function PlayerCell({ text, title, subText, colorClass, className }: PlayerCellProps) {
    return (
        <TableCell className={cn("py-2 px-3 overflow-hidden", className)} title={title}>
            <div className={cn("truncate", colorClass)}>{text}</div>
            {subText && <div className="text-xs text-gray-500 truncate">{subText}</div>}
        </TableCell>
    );
}

export default PlayerCell;
