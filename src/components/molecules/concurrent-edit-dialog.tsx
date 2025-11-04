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

interface ConcurrentEditDialogProps {
    open: boolean;
    conflicts: ConflictDetails[];
    onConfirm: () => void;
    onCancel: () => void;
    mode?: "save" | "field"; // 保存時 or フィールドタップ時
}

/**
 * 同時編集時の競合確認ダイアログ
 * 他の端末で変更された内容と、現在の編集内容を表示してユーザーに確認を求める
 */
export function ConcurrentEditDialog({
    open,
    conflicts,
    onConfirm,
    onCancel,
    mode = "save",
}: ConcurrentEditDialogProps) {
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

                            <div className="space-y-3">
                                {conflicts.map((conflict, index) => {
                                    const hasDirectConflicts = Object.keys(conflict.directConflicts).length > 0;
                                    const hasServerOnlyChanges = Object.keys(conflict.serverOnlyChanges).length > 0;

                                    return (
                                        <div
                                            key={conflict.matchId || index}
                                            className="border rounded-lg p-3 bg-muted/50 space-y-3"
                                        >
                                            <div className="font-semibold text-sm">
                                                試合 #{index + 1}
                                            </div>

                                            {hasDirectConflicts && (
                                                <div className="space-y-2 border-l-4 border-destructive pl-3">
                                                    <div className="font-semibold text-sm text-destructive">
                                                        あなたの編集との競合
                                                    </div>

                                                    {conflict.directConflicts.courtId && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">コート:</span>
                                                            <div className="ml-4 grid grid-cols-2 gap-2 mt-1">
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        あなたの編集:
                                                                    </span>{" "}
                                                                    <span className="font-medium">
                                                                        {conflict.directConflicts.courtId.draft}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        他端末の最新:
                                                                    </span>{" "}
                                                                    <span className="font-medium text-destructive">
                                                                        {conflict.directConflicts.courtId.server}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {conflict.directConflicts.round && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">回戦:</span>
                                                            <div className="ml-4 grid grid-cols-2 gap-2 mt-1">
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        あなたの編集:
                                                                    </span>{" "}
                                                                    <span className="font-medium">
                                                                        {conflict.directConflicts.round.draft}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        他端末の最新:
                                                                    </span>{" "}
                                                                    <span className="font-medium text-destructive">
                                                                        {conflict.directConflicts.round.server}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {conflict.directConflicts.playerA && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">選手A:</span>
                                                            <div className="ml-4 grid grid-cols-2 gap-2 mt-1">
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        あなたの編集:
                                                                    </span>{" "}
                                                                    <span className="font-medium">
                                                                        {conflict.directConflicts.playerA.draft}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        他端末の最新:
                                                                    </span>{" "}
                                                                    <span className="font-medium text-destructive">
                                                                        {conflict.directConflicts.playerA.server}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {conflict.directConflicts.playerB && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">選手B:</span>
                                                            <div className="ml-4 grid grid-cols-2 gap-2 mt-1">
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        あなたの編集:
                                                                    </span>{" "}
                                                                    <span className="font-medium">
                                                                        {conflict.directConflicts.playerB.draft}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        他端末の最新:
                                                                    </span>{" "}
                                                                    <span className="font-medium text-destructive">
                                                                        {conflict.directConflicts.playerB.server}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {hasServerOnlyChanges && (
                                                <div className="space-y-2 border-l-4 border-yellow-500 pl-3">
                                                    <div className="font-semibold text-sm text-yellow-600">
                                                        他端末での変更（通知）
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        あなたは編集していませんが、他端末で変更されています
                                                    </div>

                                                    {conflict.serverOnlyChanges.courtId && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">コート:</span>
                                                            <div className="ml-4 mt-1">
                                                                <span className="text-muted-foreground">
                                                                    {conflict.serverOnlyChanges.courtId.initial}
                                                                </span>
                                                                {" → "}
                                                                <span className="font-medium text-yellow-600">
                                                                    {conflict.serverOnlyChanges.courtId.server}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {conflict.serverOnlyChanges.round && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">回戦:</span>
                                                            <div className="ml-4 mt-1">
                                                                <span className="text-muted-foreground">
                                                                    {conflict.serverOnlyChanges.round.initial}
                                                                </span>
                                                                {" → "}
                                                                <span className="font-medium text-yellow-600">
                                                                    {conflict.serverOnlyChanges.round.server}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {conflict.serverOnlyChanges.playerA && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">選手A:</span>
                                                            <div className="ml-4 mt-1">
                                                                <span className="text-muted-foreground">
                                                                    {conflict.serverOnlyChanges.playerA.initial}
                                                                </span>
                                                                {" → "}
                                                                <span className="font-medium text-yellow-600">
                                                                    {conflict.serverOnlyChanges.playerA.server}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {conflict.serverOnlyChanges.playerB && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">選手B:</span>
                                                            <div className="ml-4 mt-1">
                                                                <span className="text-muted-foreground">
                                                                    {conflict.serverOnlyChanges.playerB.initial}
                                                                </span>
                                                                {" → "}
                                                                <span className="font-medium text-yellow-600">
                                                                    {conflict.serverOnlyChanges.playerB.server}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-sm font-medium text-destructive">
                                得点・反則は自動的に最新の値が保持されます
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {mode === "save" ? (
                        <>
                            <Button variant="outline" onClick={onCancel}>
                                キャンセル（編集を破棄）
                            </Button>
                            <Button
                                onClick={onConfirm}
                                variant="destructive"
                            >
                                このまま保存する
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={onCancel}>
                                却下（今後通知しない）
                            </Button>
                            <Button
                                onClick={onConfirm}
                                variant="default"
                            >
                                マージ（変更を受け入れる）
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
