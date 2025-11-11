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
import type { Match } from "@/types/match.schema";

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
    addedMatches?: Match[];
    deletedMatches?: Match[];
    onConfirm: () => void;
    onReject: () => void;
    onCancel: () => void;
}

/**
 * 更新時の競合確認ダイアログ
 * 「マージ（変更を受け入れる）」または「却下（今後通知しない）」のいずれかを選択
 */
export function MatchSetupUpdateDialog({
    open,
    conflicts,
    addedMatches = [],
    deletedMatches = [],
    onConfirm,
    onReject,
    onCancel,
}: MatchSetupUpdateDialogProps) {
    const hasAnyChanges = conflicts.length > 0 || addedMatches.length > 0 || deletedMatches.length > 0;

    if (!hasAnyChanges) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-destructive">
                        ⚠️ 最新の試合組み合わせ情報があります
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-4">
                            <p className="text-sm">
                                他の端末での変更を検知しました。
                                <br />
                                以下の変更を確認して、現在編集中の情報に最新情報を反映するか、却下して編集を続行するか選択してください。
                                <br />
                                却下した場合、最新の他端末での変更内容は反映されません。
                                <br />
                                基本は「反映」を選択することをお勧めします。
                            </p>

                            <ConflictDetailsDisplay
                                conflicts={conflicts}
                                draftLabel="現在の編集"
                                addedMatches={addedMatches}
                                deletedMatches={deletedMatches}
                            />
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onReject}>
                        却下（今後通知しない）
                    </Button>
                    <Button onClick={onConfirm}>反映（変更を取り込む）</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
