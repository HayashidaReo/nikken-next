import { cn } from "@/lib/utils/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
}

export function ConnectionStatus({
  isConnected,
  error,
}: ConnectionStatusProps) {
  return (
    <>
      {/* 接続状態表示 */}
      <div className="fixed top-4 right-4 z-50">
        <div
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
            isConnected ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-200 animate-pulse" : "bg-yellow-200"
            )}
          />
          {isConnected ? "データ同期中" : "スタンバイ中"}
        </div>
      </div>

      {/* 接続方法の説明 */}
      {!isConnected && (
        <div className="fixed top-16 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm max-w-xs">
          <p className="font-semibold mb-1">使用方法</p>
          <p>
            スコアボード操作画面から「モニター表示開始」ボタンを押すと、このページにデータが表示されます。
          </p>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="fixed top-16 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </>
  );
}
