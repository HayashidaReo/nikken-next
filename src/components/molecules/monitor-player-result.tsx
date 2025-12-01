import { cn } from "@/lib/utils/utils";
import { AdjustHorizontalText } from "@/components/atoms/adjust-horizontal-text";
import { WinnerStamp } from "@/components/atoms/winner-stamp";
import { getMonitorPlayerOpacity } from "@/lib/utils/monitor";

interface MonitorPlayerResultProps {
    displayName: string;
    teamName: string;
    isWinner: boolean;
    isDraw: boolean;
    isCompleted: boolean;
    className?: string;
}

export function MonitorPlayerResult({
    displayName,
    teamName,
    isWinner,
    isDraw,
    isCompleted,
    className,
}: MonitorPlayerResultProps) {
    const opacity = getMonitorPlayerOpacity(isCompleted, isWinner, isDraw);

    return (
        <div className={cn("flex-1 relative flex flex-col items-center", opacity, className)}>
            <div className="text-center space-y-4 w-full flex flex-col items-center">
                <AdjustHorizontalText
                    baseFontSize={6}
                    minFontSize={2}
                    maxWidth={500}
                    textContent={teamName}
                    className="text-muted-foreground font-medium leading-tight"
                />
                <AdjustHorizontalText
                    baseFontSize={16}
                    minFontSize={4}
                    maxWidth={500}
                    textContent={displayName}
                    className="font-bold leading-none"
                />
                {isWinner && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <WinnerStamp />
                    </div>
                )}
            </div>
        </div>
    );
}
