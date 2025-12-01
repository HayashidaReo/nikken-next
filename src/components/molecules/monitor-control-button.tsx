"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Monitor } from "lucide-react";
import { useTeamMatches } from "@/queries/use-team-matches";

interface MonitorControlButtonProps {
    matchGroupId: string;
}

export function MonitorControlButton({ matchGroupId }: MonitorControlButtonProps) {
    const router = useRouter();
    const { data: teamMatches } = useTeamMatches(matchGroupId);

    const handleMonitorControlClick = () => {
        if (!teamMatches || teamMatches.length === 0) return;

        // sortOrderでソートして最初の試合を取得
        const firstMatch = [...teamMatches].sort((a, b) => a.sortOrder - b.sortOrder)[0];

        if (firstMatch && firstMatch.matchId) {
            router.push(`/monitor-control/${firstMatch.matchId}?mode=initial`);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleMonitorControlClick}
            disabled={!teamMatches || teamMatches.length === 0}
            title="モニター操作画面へ"
            className="gap-2"
        >
            <Monitor className="h-4 w-4" />
            モニター操作開始
        </Button>
    );
}
