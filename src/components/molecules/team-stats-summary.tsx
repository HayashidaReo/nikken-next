import React from "react";
import { Users, Check, X } from "lucide-react";
import type { Team } from "@/types/team.schema";
import { cn } from "@/lib/utils/utils";

export interface TeamStatsSummaryProps {
    teams: Team[];
    className?: string;
}

export function TeamStatsSummary({ teams, className }: TeamStatsSummaryProps) {
    const total = teams.length;
    const approved = teams.filter(t => t.isApproved).length;
    const pending = teams.filter(t => !t.isApproved).length;

    return (
        <div className={cn("flex items-center gap-4 text-sm text-gray-700", className)}>
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" aria-hidden />
                <div className="text-sm leading-none">
                    <div className="text-xs text-gray-500">総申請</div>
                    <div className="font-medium">{total} 件</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" aria-hidden />
                <div className="text-sm leading-none">
                    <div className="text-xs text-gray-500">承認済み</div>
                    <div className="font-medium">{approved} 件</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" aria-hidden />
                <div className="text-sm leading-none">
                    <div className="text-xs text-gray-500">未承認</div>
                    <div className="font-medium">{pending} 件</div>
                </div>
            </div>
        </div>
    );
}

export default TeamStatsSummary;
