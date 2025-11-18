import { cn } from "@/lib/utils/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
}

export function ConnectionStatus({ isConnected, error }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg font-semibold">モニター操作画面</span>

      <div
        className={cn(
          "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
          isConnected ? "bg-green-500 text-white" : "bg-gray-400 text-white"
        )}
      >
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-200 animate-pulse" : "bg-gray-200"
          )}
        />
        <span>{isConnected ? "接続中" : "未接続"}</span>
      </div>

      {error && <span className="text-red-500 text-sm ml-2">{error}</span>}
    </div>
  );
}
