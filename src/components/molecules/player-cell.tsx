"use client";

import { TableCell } from "@/components/atoms/table";
import { cn } from "@/lib/utils/utils";

interface PlayerCellProps {
    text: string;
    title?: string;
    colorClass?: string;
    className?: string;
}

export function PlayerCell({ text, title, colorClass, className }: PlayerCellProps) {
    return (
        <TableCell className={cn("py-2 px-3 overflow-hidden", className)} title={title}>
            <div className={cn("truncate", colorClass)}>{text}</div>
        </TableCell>
    );
}

export default PlayerCell;
