import { LocalTeam } from "@/lib/db";
import { User, Phone, Mail, FileText } from "lucide-react";
import { Badge } from "./badge";

export const TeamItem = ({ team }: { team: LocalTeam }) => {
    return (
        <div className="bg-white p-3 rounded border shadow-sm space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{team.teamName}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        {team.isApproved ? (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded border border-green-200">承認済み</span>
                        ) : (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded border border-yellow-200">未承認</span>
                        )}
                    </div>
                </div>
                {team._deleted && <Badge>削除対象</Badge>}
            </div>

            {/* Representative Info */}
            {(team.representativeName || team.representativePhone || team.representativeEmail) && (
                <div className="bg-gray-50 p-2 rounded text-sm space-y-1">
                    <div className="font-medium text-gray-700 mb-1">代表者情報</div>
                    {team.representativeName && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-3 h-3" />
                            <span>{team.representativeName}</span>
                        </div>
                    )}
                    {team.representativePhone && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{team.representativePhone}</span>
                        </div>
                    )}
                    {team.representativeEmail && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{team.representativeEmail}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Players */}
            <div>
                <div className="text-xs font-medium text-gray-500 mb-1">登録選手 ({team.players.length}名)</div>
                <div className="flex flex-wrap gap-1.5">
                    {team.players.map((player) => (
                        <span key={player.playerId} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100">
                            {player.displayName || `${player.lastName} ${player.firstName}`}
                        </span>
                    ))}
                </div>
            </div>

            {/* Remarks */}
            {team.remarks && (
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                    <FileText className="w-4 h-4 mt-0.5 text-yellow-600 shrink-0" />
                    <p className="whitespace-pre-wrap">{team.remarks}</p>
                </div>
            )}

            <div className="text-[10px] text-gray-400 text-right mt-1">
                ID: {team.teamId}
            </div>
        </div>
    );
};
