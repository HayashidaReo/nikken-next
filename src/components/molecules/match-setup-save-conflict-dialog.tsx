/**
 * 試合情報保存時の競合確認ダイアログ
 * 保存時に他の端末で変更があった場合、ユーザーに確認を求める
 */

"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";
import { ConflictDetailsDisplay } from "@/components/molecules/conflict-details-display";

interface ConflictDetails {
    matchId: string;
    directConflicts: {
        courtId?: { draft: string; server: string };
        round?: { draft: string; server: string };
        playerA?: { draft: string; server: string };
        playerB?: { draft: string; server: string };
    };
    serverOnlyChanges: {
        courtId?: { initial: string; server: string };
        round?: { initial: string; server: string };
        playerA?: { initial: string; server: string };
        playerB?: { initial: string; server: string };
    };
}

interface MatchSetupSaveConflictDialogProps {
    open: boolean;
    conflicts: ConflictDetails[];
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * 保存時の競合確認ダイアログ
 * 「このまま保存する」または「編集を破棄」のいずれかを選択
 */
export function MatchSetupSaveConflictDialog({
    open,
    conflicts,
    onConfirm,
    onCancel,
}: MatchSetupSaveConflictDialogProps) {
    if (conflicts.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-destructive">
                        ⚠️ 他の端末で試合情報が変更されています
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-4">
                            <p className="text-sm">
                                保存しようとしている試合が、他の端末で変更されています。
                                <br />
                                このまま保存すると、以下の変更を上書きすることになります。
                            </p>

                            <ConflictDetailsDisplay
                                conflicts={conflicts}
                                draftLabel="あなたの編集"
                            />
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        キャンセル（編集を破棄）
                    </Button>
                    <Button onClick={onConfirm} variant="destructive">
                        このまま保存する
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}