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
        <TableCell className={cn("truncate", className)} title={title}>
            <div className={colorClass}>{text}</div>
        </TableCell>
    );
}

export default PlayerCell;
