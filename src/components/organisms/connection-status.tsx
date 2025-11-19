import { cn } from "@/lib/utils/utils";

interface ConnectionStatusProps {
  /**
   * Optional explicit mode. If not provided, `isConnected` will be used to determine display.
   * - 'disconnected' : 未接続
   * - 'presentation' : 外部モニター接続中
   * - 'fallback' : 別タブ表示中
   */
  mode?: "disconnected" | "presentation" | "fallback";
  isConnected?: boolean;
  error?: string | null;
}

export function ConnectionStatus({ mode, isConnected = false, error = null }: ConnectionStatusProps) {
  const resolvedMode = mode ?? (isConnected ? "presentation" : "disconnected");

  const statusLabel =
    resolvedMode === "presentation" ? "外部モニター接続中" : resolvedMode === "fallback" ? "別タブ表示中" : "未接続";
  const bgClass = resolvedMode === "presentation" ? "bg-green-500 text-white" : resolvedMode === "fallback" ? "bg-blue-500 text-white" : "bg-gray-400 text-white";
  const dotClass = resolvedMode === "presentation" ? "bg-green-200 animate-pulse" : resolvedMode === "fallback" ? "bg-blue-200" : "bg-gray-200";

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg font-semibold">モニター操作画面</span>

      <div className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2", bgClass)}>
        <div className={cn("w-2 h-2 rounded-full", dotClass)} />
        <span>{statusLabel}</span>
      </div>

      {error && <span className="text-red-500 text-sm ml-2">{error}</span>}
    </div>
  );
}
