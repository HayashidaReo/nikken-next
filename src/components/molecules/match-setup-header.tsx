/**
 * 試合組み合わせ設定ページ - ヘッダーコンポーネント
 * タイトルと更新ボタンを表示
 */

import { Button } from "@/components/atoms/button";

interface MatchSetupHeaderProps {
    title: string;
    hasDetectedChanges: boolean;
    onUpdateClick: () => void;
}

export function MatchSetupHeader({
    title,
    hasDetectedChanges,
    onUpdateClick,
}: MatchSetupHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {hasDetectedChanges && (
                <Button
                    onClick={onUpdateClick}
                    variant="outline"
                    className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                >
                    他端末で変更あり - 確認する
                </Button>
            )}
        </div>
    );
}
