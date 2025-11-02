"use client";

import { Button } from "@/components/atoms/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/atoms/card";
import { AlertTriangle, Monitor, ExternalLink } from "lucide-react";
import { DialogOverlay } from "./dialog-overlay";

interface FallbackMonitorDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function FallbackMonitorDialog({
    isOpen,
    onConfirm,
    onCancel,
}: FallbackMonitorDialogProps) {

    return (
        <DialogOverlay isOpen={isOpen} onClose={onCancel}>
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    <CardTitle className="text-xl">外部モニター未検出</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600 space-y-3">
                        <p>
                            外部モニターを検出できませんでした。
                            代わりに新規タブでモニター画面を表示します。
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-yellow-800">
                                    <p className="font-medium mb-1">注意事項</p>
                                    <ul className="space-y-1">
                                        <li>• データ同期にむらがある場合があります</li>
                                        <li>• 本番環境での使用は推奨しません</li>
                                        <li>• テスト用途での使用を推奨します</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Monitor className="h-4 w-4" />
                            <span>
                                外部モニターを接続してもこの画面が表示される場合は、接続状況をご確認の上、再度お試しください。
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={onCancel} className="flex-1">
                            キャンセル
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            新規タブで表示
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </DialogOverlay>
    );
}
