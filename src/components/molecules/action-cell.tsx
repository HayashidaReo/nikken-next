"use client";

import { TableCell } from "@/components/atoms/table";
import { Button } from "@/components/atoms/button";
import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface ActionCellProps {
    onMonitor: () => void;
    ariaLabel?: string;
    className?: string;
}

export function ActionCell({ onMonitor, ariaLabel = "モニター", className }: ActionCellProps) {
    return (
        <TableCell className={cn("text-center", className)}>
            <div className="flex items-center justify-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMonitor}
                    title="モニターを開く"
                    aria-label={ariaLabel}
                    className="hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm transition-transform active:scale-95"
                >
                    <Monitor className="h-5 w-5" />
                </Button>
            </div>
        </TableCell>
    );
}

export default ActionCell;
