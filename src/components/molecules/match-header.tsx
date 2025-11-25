import { cn } from "@/lib/utils/utils";
import { Trophy, MapPin, Repeat } from "lucide-react";

interface MatchHeaderProps {
  tournamentName: string;
  courtName: string;
  roundName: string;
  className?: string;
}

export function MatchHeader({
  tournamentName,
  courtName,
  roundName,
  className,
}: MatchHeaderProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 px-4 pt-2 flex items-stretch justify-around gap-4",
        className
      )}
    >
      {/* Tournament Section */}
      <div className="relative flex-1 min-h-[72px]">
        <div className="absolute left-4 top-1 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <span className="text-xs text-gray-500 font-medium">大会名</span>
        </div>
        <div className="absolute inset-0 flex items-start justify-center px-4 pt-7">
          <p className="font-bold text-lg text-gray-900 text-center leading-tight">
            {tournamentName}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-r border-gray-200" />

      {/* Court Section */}
      <div className="relative flex-1 min-h-[72px]">
        <div className="absolute left-4 top-1 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <span className="text-xs text-gray-500 font-medium">コート</span>
        </div>
        <div className="absolute inset-0 flex items-start justify-center px-4 pt-7">
          <p className="font-bold text-lg text-gray-900 text-center leading-tight">
            {courtName}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-r border-gray-200" />

      {/* Round Section */}
      <div className="relative flex-1 min-h-[72px]">
        <div className="absolute left-4 top-1 flex items-center gap-2">
          <Repeat className="w-6 h-6 text-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-500 font-medium">ラウンド</span>
        </div>
        <div className="absolute inset-0 flex items-start justify-center px-4 pt-7">
          <p className="font-bold text-lg text-gray-900 text-center leading-tight">
            {roundName}
          </p>
        </div>
      </div>
    </div>
  );
}
