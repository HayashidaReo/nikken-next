/**
 * 試合情報更新時の競合確認ダイアログ
 * 他の端末の変更を確認し、マージするか却下するかを選択
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

interface MatchSetupUpdateDialogProps {
    open: boolean;
    conflicts: ConflictDetails[];
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * 更新時の競合確認ダイアログ
 * 「マージ（変更を受け入れる）」または「却下（今後通知しない）」のいずれかを選択
 */
export function MatchSetupUpdateDialog({
    open,
    conflicts,
    onConfirm,
    onCancel,
}: MatchSetupUpdateDialogProps) {
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
                                あなたが編集している試合が、他の端末で変更されました。
                                <br />
                                以下の変更を確認して、マージするか却下するか選択してください。
                            </p>

                            <ConflictDetailsDisplay
                                conflicts={conflicts}
                                draftLabel="現在の編集"
                            />
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        却下（今後通知しない）
                    </Button>
                    <Button onClick={onConfirm}>マージ（変更を受け入れる）</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
