import { MonitorData } from "@/types/monitor.schema";
import { cn } from "@/lib/utils/utils";
import { getTeamMatchRoundLabelById } from "@/lib/constants";

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
        <div className="w-[1920px] h-[1080px] flex flex-col items-center bg-black text-white relative overflow-hidden pt-[60px]">
            {/* 背景装飾 */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-0" />

            <h1 className="relative z-10 text-[64px] font-bold mb-[40px] text-yellow-400 tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                団体戦結果
            </h1>

            <div className="relative z-10 flex w-[1600px] gap-[60px] mb-[50px] items-stretch h-[240px]">
                {/* Team A Header */}
                <div className={cn(
                    "flex-1 flex flex-col items-center justify-center rounded-[20px] border-[4px] transition-all duration-500 relative",
                    teamWinner === "teamA"
                        ? "border-red-500 bg-red-900/30 shadow-[0_0_60px_rgba(239,68,68,0.3)]"
                        : "border-gray-700 bg-gray-900/30"
                )}>
                    {teamWinner === "teamA" && (
                        <div className="absolute -top-[30px] bg-red-600 text-white px-[30px] py-[5px] rounded-full text-[24px] font-bold shadow-lg">
                            WINNER
                        </div>
                    )}
                    <div className="text-[48px] font-bold text-red-300 mb-[10px] max-w-[600px] truncate px-[20px]">
                        {teamAName}
                    </div>
                    <div className="flex items-baseline gap-[10px]">
                        <span className="text-[100px] font-black leading-none">{winsA}</span>
                        <span className="text-[40px] text-gray-400 font-bold">勝</span>
                    </div>
                </div>

                <div className="flex items-center justify-center text-[80px] font-black text-gray-600">-</div>

                {/* Team B Header */}
                <div className={cn(
                    "flex-1 flex flex-col items-center justify-center rounded-[20px] border-[4px] transition-all duration-500 relative",
                    teamWinner === "teamB"
                        ? "border-blue-500 bg-blue-900/30 shadow-[0_0_60px_rgba(59,130,246,0.3)]"
                        : "border-gray-700 bg-gray-900/30"
                )}>
                    {teamWinner === "teamB" && (
                        <div className="absolute -top-[30px] bg-blue-600 text-white px-[30px] py-[5px] rounded-full text-[24px] font-bold shadow-lg">
                            WINNER
                        </div>
                    )}
                    <div className="text-[48px] font-bold text-blue-300 mb-[10px] max-w-[600px] truncate px-[20px]">
                        {teamBName}
                    </div>
                    <div className="flex items-baseline gap-[10px]">
                        <span className="text-[100px] font-black leading-none">{winsB}</span>
                        <span className="text-[40px] text-gray-400 font-bold">勝</span>
                    </div>
                </div>
            </div>

            {/* Match List */}
            <div className="relative z-10 w-[1600px] bg-gray-900/60 rounded-[20px] overflow-hidden border border-gray-700 backdrop-blur-sm">
                <div className="grid grid-cols-[120px_1fr_200px_1fr] h-[60px] bg-gray-800/80 border-b border-gray-600 items-center px-[40px]">
                    <div className="text-center text-[28px] font-bold text-gray-500"></div>
                    <div className="text-center text-[28px] font-bold text-red-400">選手名</div>
                    <div className="text-center text-[28px] font-bold text-gray-300">結果</div>
                    <div className="text-center text-[28px] font-bold text-blue-400">選手名</div>
                </div>

                <div className="divide-y divide-gray-700/50">
                    {teamMatchResults.map((match, index) => (
                        <div key={match.matchId} className="grid grid-cols-[120px_1fr_200px_1fr] h-[85px] items-center px-[40px] hover:bg-white/5 transition-colors">
                            {/* Round Name */}
                            <div className="flex justify-center">
                                <span className="text-[28px] font-bold text-gray-400 bg-gray-800/50 px-3 py-1 rounded">
                                    {getTeamMatchRoundLabelById(match.roundId)}
                                </span>
                            </div>

                            {/* Player A */}
                            <div className={cn("flex items-center justify-end gap-[30px]", match.winner === "playerA" ? "opacity-100" : "opacity-50")}>
                                <div className="text-[36px] font-bold truncate max-w-[400px]">{match.playerA.displayName}</div>
                                <div className={cn(
                                    "text-[56px] font-black w-[70px] text-center leading-none",
                                    match.winner === "playerA" ? "text-red-400" : "text-gray-600"
                                )}>
                                    {match.playerA.score}
                                </div>
                            </div>

                            {/* VS / Result */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="text-[16px] text-gray-500 mb-[2px]">第{index + 1}試合</div>
                                {match.winner === "draw" ? (
                                    <span className="text-[28px] text-gray-400 font-bold">引き分け</span>
                                ) : (
                                    <div className="flex items-center gap-[10px]">
                                        {match.winner === "playerA" ? (
                                            <span className="text-[36px] font-black text-red-500">◀ WIN</span>
                                        ) : (
                                            <span className="text-[36px] font-black text-blue-500">WIN ▶</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Player B */}
                            <div className={cn("flex items-center justify-start gap-[30px]", match.winner === "playerB" ? "opacity-100" : "opacity-50")}>
                                <div className={cn(
                                    "text-[56px] font-black w-[70px] text-center leading-none",
                                    match.winner === "playerB" ? "text-blue-400" : "text-gray-600"
                                )}>
                                    {match.playerB.score}
                                </div>
                                <div className="text-[36px] font-bold truncate max-w-[400px]">{match.playerB.displayName}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
