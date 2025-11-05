/**
 * 試合組み合わせ設定ページ - ヘッダーコンポーネント
 * タイトルと更新ボタンを表示
 */

import { ConflictSummary } from "@/components/molecules/conflict-summary";

interface MatchSetupHeaderProps {
    title: string;
    /** 検出された差分の総数（他端末による追加/削除/フィールド変更の合計） */
    detectedCount: number;
    onOpenUpdateDialog: () => void;
}

export function MatchSetupHeader({ title, detectedCount, onOpenUpdateDialog }: MatchSetupHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div>
                <ConflictSummary count={detectedCount} onOpenUpdateDialog={onOpenUpdateDialog} />
            </div>
        </div>
    );
}
