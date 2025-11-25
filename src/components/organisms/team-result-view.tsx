import { MonitorData } from "@/types/monitor.schema";
import { cn } from "@/lib/utils/utils";

interface TeamResultViewProps {
    data: MonitorData;
}

export function TeamResultView({ data }: TeamResultViewProps) {
    const { teamMatchResults } = data;
    if (!teamMatchResults || teamMatchResults.length === 0) return null;

    // チーム名の取得（最初の試合データから）
    const teamAName = teamMatchResults[0].playerA.teamName;
    const teamBName = teamMatchResults[0].playerB.teamName;

    // 勝ち数の集計
    const winsA = teamMatchResults.filter(r => r.winner === "playerA").length;
    const winsB = teamMatchResults.filter(r => r.winner === "playerB").length;

    let teamWinner = "draw";
    if (winsA > winsB) teamWinner = "teamA";
    else if (winsB > winsA) teamWinner = "teamB";

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8">
            <h1 className="text-5xl font-bold mb-8 text-yellow-400">団体戦結果</h1>

            <div className="flex w-full max-w-7xl gap-8 mb-8">
                {/* Team A Header */}
                <div className={cn(
                    "flex-1 p-6 rounded-lg text-center border-2",
                    teamWinner === "teamA" ? "border-blue-500 bg-blue-900/20" : "border-gray-700"
                )}>
                    <div className="text-4xl font-bold text-blue-400 mb-2">{teamAName}</div>
                    <div className="text-6xl font-bold">{winsA} <span className="text-2xl text-gray-400">勝</span></div>
                    {teamWinner === "teamA" && <div className="mt-2 text-yellow-400 font-bold text-2xl">WINNER</div>}
                </div>

                <div className="flex items-center justify-center text-4xl font-bold text-gray-500">-</div>

                {/* Team B Header */}
                <div className={cn(
                    "flex-1 p-6 rounded-lg text-center border-2",
                    teamWinner === "teamB" ? "border-red-500 bg-red-900/20" : "border-gray-700"
                )}>
                    <div className="text-4xl font-bold text-red-400 mb-2">{teamBName}</div>
                    <div className="text-6xl font-bold">{winsB} <span className="text-2xl text-gray-400">勝</span></div>
                    {teamWinner === "teamB" && <div className="mt-2 text-yellow-400 font-bold text-2xl">WINNER</div>}
                </div>
            </div>

            {/* Match List */}
            <div className="w-full max-w-7xl bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-4 bg-gray-800 font-bold text-xl border-b border-gray-700">
                    <div className="text-center text-blue-400">先鋒・次鋒...</div>
                    <div className="text-center w-32">結果</div>
                    <div className="text-center text-red-400">先鋒・次鋒...</div>
                </div>

                <div className="divide-y divide-gray-800">
                    {teamMatchResults.map((match, index) => (
                        <div key={match.matchId} className="grid grid-cols-[1fr_auto_1fr] gap-4 p-4 items-center hover:bg-gray-800/50 transition-colors">
                            {/* Player A */}
                            <div className={cn("flex items-center justify-end gap-4", match.winner === "playerA" ? "opacity-100" : "opacity-60")}>
                                <div className="text-2xl font-bold">{match.playerA.displayName}</div>
                                <div className={cn("text-3xl font-bold w-12 text-center", match.winner === "playerA" ? "text-blue-400" : "text-gray-500")}>
                                    {match.playerA.score}
                                </div>
                            </div>

                            {/* VS / Result */}
                            <div className="flex flex-col items-center justify-center w-32">
                                <div className="text-sm text-gray-500">第{index + 1}試合</div>
                                {match.winner === "draw" ? (
                                    <span className="text-gray-400 font-bold">引き分け</span>
                                ) : (
                                    <span className={cn("font-bold text-xl", match.winner === "playerA" ? "text-blue-500" : "text-red-500")}>
                                        {match.winner === "playerA" ? "<<" : ">>"}
                                    </span>
                                )}
                            </div>

                            {/* Player B */}
                            <div className={cn("flex items-center justify-start gap-4", match.winner === "playerB" ? "opacity-100" : "opacity-60")}>
                                <div className={cn("text-3xl font-bold w-12 text-center", match.winner === "playerB" ? "text-red-400" : "text-gray-500")}>
                                    {match.playerB.score}
                                </div>
                                <div className="text-2xl font-bold">{match.playerB.displayName}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
