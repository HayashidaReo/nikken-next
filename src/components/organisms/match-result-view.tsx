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
        <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8">
            <h1 className="text-6xl font-bold mb-12 text-yellow-400">試合終了</h1>

            <div className="flex w-full max-w-6xl justify-between items-center gap-8">
                {/* Player A */}
                <div className={cn(
                    "flex-1 flex flex-col items-center p-8 rounded-xl border-4 transition-all duration-500",
                    winner === "playerA" ? "border-blue-500 bg-blue-900/30 scale-110 shadow-[0_0_50px_rgba(59,130,246,0.5)]" : "border-gray-700 opacity-60"
                )}>
                    <div className="text-3xl text-blue-400 mb-4">{playerA.teamName}</div>
                    <div className="text-6xl font-bold mb-8">{playerA.displayName}</div>
                    <div className="text-9xl font-bold mb-4">{playerA.score}</div>
                    <div className="flex gap-2 mt-4">
                        {/* 反則表示 */}
                        {Array.from({ length: playerA.hansoku }).map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-red-600 border border-white" />
                        ))}
                    </div>
                    {winner === "playerA" && (
                        <div className="mt-8 text-5xl font-bold text-yellow-400 animate-bounce">WINNER</div>
                    )}
                </div>

                <div className="text-4xl font-bold text-gray-500">VS</div>

                {/* Player B */}
                <div className={cn(
                    "flex-1 flex flex-col items-center p-8 rounded-xl border-4 transition-all duration-500",
                    winner === "playerB" ? "border-red-500 bg-red-900/30 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]" : "border-gray-700 opacity-60"
                )}>
                    <div className="text-3xl text-red-400 mb-4">{playerB.teamName}</div>
                    <div className="text-6xl font-bold mb-8">{playerB.displayName}</div>
                    <div className="text-9xl font-bold mb-4">{playerB.score}</div>
                    <div className="flex gap-2 mt-4">
                        {/* 反則表示 */}
                        {Array.from({ length: playerB.hansoku }).map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-red-600 border border-white" />
                        ))}
                    </div>
                    {winner === "playerB" && (
                        <div className="mt-8 text-5xl font-bold text-yellow-400 animate-bounce">WINNER</div>
                    )}
                </div>
            </div>

            {winner === "draw" && (
                <div className="mt-12 text-6xl font-bold text-gray-300">引き分け</div>
            )}
        </div>
    );
}
