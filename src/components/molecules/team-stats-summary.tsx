import React from "react";
import { Users, Check, X } from "lucide-react";
import type { Team } from "@/types/team.schema";
import { cn } from "@/lib/utils/utils";

export interface TeamStatsSummaryProps {
    teams: Team[];
    className?: string;
}

// Small stat block component used by TeamStatsSummary
const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: React.ReactNode; value: React.ReactNode }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="flex items-center" aria-hidden>
                {icon}
            </span>
            <div className="text-sm leading-none">
                <div className="text-xs text-gray-500">{label}</div>
                <div className="font-medium">{value}</div>
            </div>
        </div>
    );
};

export function TeamStatsSummary({ teams, className }: TeamStatsSummaryProps) {
    const total = teams.length;
    const approved = teams.filter(t => t.isApproved).length;
    const pending = teams.filter(t => !t.isApproved).length;


    return (
        <div className={cn("flex items-center gap-4 text-sm text-gray-700", className)}>
            <StatItem icon={<Users className="w-4 h-4 text-gray-600" />} label="総申請" value={`${total} 件`} />
            <StatItem icon={<Check className="w-4 h-4 text-green-600" />} label="承認済み" value={`${approved} 件`} />
            <StatItem icon={<X className="w-4 h-4 text-red-500" />} label="未承認" value={`${pending} 件`} />
        </div>
    );
}

export default TeamStatsSummary;
