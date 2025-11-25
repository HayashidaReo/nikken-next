import { MonitorData } from "@/types/monitor.schema";
import { cn } from "@/lib/utils/utils";

interface MatchResultViewProps {
    data: MonitorData;
}

export function MatchResultView({ data }: MatchResultViewProps) {
    const { matchResult } = data;
    if (!matchResult) return null;

    const { playerA, playerB, winner } = matchResult;

    return (
        <div className="w-[1920px] h-[1080px] flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
            {/* 背景装飾 */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />

            {/* タイトル */}
            <div className="relative z-10 mb-[60px]">
                <h1 className="text-[80px] font-bold text-yellow-400 tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                    試合終了
                </h1>
            </div>

            <div className="relative z-10 flex w-[1600px] justify-between items-center">
                {/* Player A (Left) */}
                <div className={cn(
                    "w-[600px] h-[600px] flex flex-col items-center justify-center rounded-[40px] border-[6px] transition-all duration-500 relative",
                    winner === "playerA"
                        ? "border-blue-500 bg-blue-900/40 shadow-[0_0_100px_rgba(59,130,246,0.4)] scale-105 z-20"
                        : "border-gray-700 bg-gray-900/40 opacity-80 scale-95 z-10"
                )}>
                    {winner === "playerA" && (
                        <div className="absolute -top-[80px] text-[60px] font-black text-yellow-400 animate-bounce drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                            WINNER
                        </div>
                    )}

                    <div className="text-[48px] text-blue-300 mb-[20px] font-bold tracking-wide max-w-[500px] truncate">
                        {playerA.teamName}
                    </div>
                    <div className="text-[80px] font-bold mb-[40px] leading-tight max-w-[540px] text-center line-clamp-2">
                        {playerA.displayName}
                    </div>
                    <div className="text-[180px] font-black leading-none mb-[30px] text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]">
                        {playerA.score}
                    </div>

                    <div className="flex gap-[12px] mt-[20px]">
                        {/* 反則表示 */}
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-[40px] h-[40px] rounded-full border-2 border-white/50",
                                    i < playerA.hansoku ? "bg-red-600 border-white shadow-[0_0_10px_rgba(220,38,38,0.8)]" : "bg-transparent"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* VS */}
                <div className="text-[100px] font-black text-gray-600 italic opacity-50 select-none">
                    VS
                </div>

                {/* Player B (Right) */}
                <div className={cn(
                    "w-[600px] h-[600px] flex flex-col items-center justify-center rounded-[40px] border-[6px] transition-all duration-500 relative",
                    winner === "playerB"
                        ? "border-red-500 bg-red-900/40 shadow-[0_0_100px_rgba(239,68,68,0.4)] scale-105 z-20"
                        : "border-gray-700 bg-gray-900/40 opacity-80 scale-95 z-10"
                )}>
                    {winner === "playerB" && (
                        <div className="absolute -top-[80px] text-[60px] font-black text-yellow-400 animate-bounce drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                            WINNER
                        </div>
                    )}

                    <div className="text-[48px] text-red-300 mb-[20px] font-bold tracking-wide max-w-[500px] truncate">
                        {playerB.teamName}
                    </div>
                    <div className="text-[80px] font-bold mb-[40px] leading-tight max-w-[540px] text-center line-clamp-2">
                        {playerB.displayName}
                    </div>
                    <div className="text-[180px] font-black leading-none mb-[30px] text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]">
                        {playerB.score}
                    </div>

                    <div className="flex gap-[12px] mt-[20px]">
                        {/* 反則表示 */}
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-[40px] h-[40px] rounded-full border-2 border-white/50",
                                    i < playerB.hansoku ? "bg-red-600 border-white shadow-[0_0_10px_rgba(220,38,38,0.8)]" : "bg-transparent"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {winner === "draw" && (
                <div className="absolute bottom-[100px] text-[80px] font-bold text-gray-300 tracking-[1rem]">
                    引き分け
                </div>
            )}
        </div>
    );
}
