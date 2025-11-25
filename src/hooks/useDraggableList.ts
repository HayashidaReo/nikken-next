import { useState, useCallback } from "react";

interface UseDraggableListResult {
    draggedIndex: number | null;
    dragOverIndex: number | null;
    handleDragStart: (e: React.DragEvent, index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleDragLeave: () => void;
}

/**
 * リストのドラッグ＆ドロップによる並び替え機能を提供するフック
 * @param items リストアイテムの配列
 * @param onChange 並び替え後の配列を受け取るコールバック
 */
export function useDraggableList<T>(
    items: T[],
    onChange: (items: T[]) => void
): UseDraggableListResult {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    }, []);

    const handleDragEnd = useCallback(() => {
        if (
            draggedIndex !== null &&
            dragOverIndex !== null &&
            draggedIndex !== dragOverIndex
        ) {
            const newItems = Array.from(items);
            const [draggedItem] = newItems.splice(draggedIndex, 1);
            newItems.splice(dragOverIndex, 0, draggedItem);
            onChange(newItems);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, [items, draggedIndex, dragOverIndex, onChange]);

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null);
    }, []);

    return {
        draggedIndex,
        dragOverIndex,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragLeave,
    };
}
