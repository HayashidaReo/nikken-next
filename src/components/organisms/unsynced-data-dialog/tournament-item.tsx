import { LocalTournament } from "@/lib/db";
import { Calendar, MapPin, Trophy, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Badge } from "./badge";

export const TournamentItem = ({ tournament }: { tournament: LocalTournament }) => {
    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-xl text-gray-800">{tournament.tournamentName}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full border text-xs font-medium",
                            tournament.tournamentType === 'team'
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-green-50 text-green-700 border-green-200"
                        )}>
                            {tournament.tournamentType === 'team' ? '団体戦' : '個人戦'}
                        </span>
                        {tournament.tournamentDetail && (
                            <span className="text-gray-400 border-l pl-2 ml-1 truncate max-w-[200px]">
                                {tournament.tournamentDetail}
                            </span>
                        )}
                    </div>
                </div>
                {tournament._deleted && <Badge>削除対象</Badge>}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{new Date(tournament.tournamentDate).toLocaleDateString()}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{tournament.location || "未設定"}</span>
                </div>
            </div>

            {/* Details (Rounds & Courts) */}
            <div className="space-y-2">
                {/* Rounds */}
                <div className="flex items-start gap-2">
                    <div className="mt-1 bg-orange-50 p-1 rounded text-orange-600">
                        <Trophy className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">ラウンド ({tournament.rounds.length})</div>
                        <div className="flex flex-wrap gap-1.5">
                            {tournament.rounds.map((round) => (
                                <span key={round.roundId} className="inline-flex items-center px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded border border-orange-100">
                                    {round.roundName}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Courts */}
                <div className="flex items-start gap-2">
                    <div className="mt-1 bg-indigo-50 p-1 rounded text-indigo-600">
                        <LayoutGrid className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">コート ({tournament.courts.length})</div>
                        <div className="flex flex-wrap gap-1.5">
                            {tournament.courts.map((court) => (
                                <span key={court.courtId} className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                                    {court.courtName}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer ID */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
                <code className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                    ID: {tournament.tournamentId}
                </code>
            </div>
        </div>
    );
};
