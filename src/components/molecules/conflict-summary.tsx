"use client";

import { Button } from "@/components/atoms/button";

interface ConflictSummaryProps {
    count: number;
    onOpenUpdateDialog: () => void;
}

export function ConflictSummary({ count, onOpenUpdateDialog }: ConflictSummaryProps) {
    if (count === 0) return null;
    return (
        <div className="text-sm text-yellow-700">
            他端末で {count} 件の変更があります。<Button variant="link" onClick={onOpenUpdateDialog}>確認する</Button>
        </div>
    );
}
