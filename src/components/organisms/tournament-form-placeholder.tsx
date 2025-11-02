"use client";

interface TournamentFormPlaceholderProps {
    className?: string;
}

/**
 * 大会未選択時の表示コンポーネント
 */
export function TournamentFormPlaceholder({ className = "" }: TournamentFormPlaceholderProps) {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">大会を選択してください</h3>
                <p className="text-gray-500">
                    左側の大会リストから編集したい大会を選択するか、
                    <br />
                    新しい大会を作成してください。
                </p>
            </div>
        </div>
    );
}