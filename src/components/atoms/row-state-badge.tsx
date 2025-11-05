"use client";

interface RowStateBadgeProps {
    isAdded?: boolean;
    isDeleted?: boolean;
}

export function RowStateBadge({ isAdded = false, isDeleted = false }: RowStateBadgeProps) {
    if (isAdded) {
        return <span className="text-green-700 font-semibold">追加</span>;
    }
    if (isDeleted) {
        return <span className="text-red-700 font-semibold">削除</span>;
    }
    return null;
}
