"use client";

import { Button } from "@/components/atoms/button";
import { Plus } from "lucide-react";

interface SaveControlsProps {
    onAdd: () => void;
    onSave: () => void;
    isSaving?: boolean;
    hasConflicts?: boolean;
}

export function SaveControls({ onAdd, onSave, isSaving = false, hasConflicts = false }: SaveControlsProps) {
    return (
        <div className="flex gap-2">
            <Button onClick={onAdd} variant="outline" size="sm" disabled={isSaving}>
                <Plus className="h-4 w-4 mr-1" />
                試合追加
            </Button>
            <Button onClick={onSave} size="sm" disabled={isSaving || hasConflicts}>
                {isSaving ? "保存中..." : "保存"}
            </Button>
        </div>
    );
}
