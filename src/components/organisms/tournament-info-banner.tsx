"use client";

import { useTournament } from "@/queries/use-tournaments";

import { CalendarIcon, MapPinIcon, TrophyIcon, InfoIcon } from "lucide-react";
import { formatDateForDisplay } from "@/lib/utils/date-utils";
import { InfoDisplay } from "@/components/molecules/info-display";

interface TournamentInfoBannerProps {
  orgId: string;
  tournamentId: string;
}

export function TournamentInfoBanner({
  orgId,
  tournamentId,
}: TournamentInfoBannerProps) {
  const {
    data: tournament,
    isLoading,
    error,
  } = useTournament(orgId, tournamentId);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gray-100 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="flex gap-4">
              <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8">
        <InfoDisplay
          variant="destructive"
          title="大会情報の取得に失敗しました"
          message={error?.message || "大会情報の取得に失敗しました"}
        />
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  const formatTournamentDate = (dateValue: Date) => {
    return formatDateForDisplay(dateValue);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
        {/* ヒーローヘッダーセクション */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
            <TrophyIcon className="w-48 h-48" />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                  {tournament.tournamentName}
                </h1>
                <div className="flex flex-wrap gap-4 text-blue-100 text-sm md:text-base font-medium">
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{formatTournamentDate(tournament.tournamentDate)}</span>
                  </div>
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{tournament.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細セクション */}
        {tournament.tournamentDetail && (
          <div className="p-6 md:p-8 bg-white">
            <div className="flex items-start space-x-3">
              <InfoIcon className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">大会概要</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {tournament.tournamentDetail}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
